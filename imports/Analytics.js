export default Analytics = {};
import $ from 'jquery';
import { Match } from 'meteor/check';
import { Meteor } from 'meteor/meteor';
import { Promise } from 'meteor/promise';

let loading;

let tracker;

const SettingsPattern = Match.ObjectIncluding({
	'url': String,
	'site': Match.Integer,
});

const PiwikPattern = Match.ObjectIncluding({
	'getTracker': Match.Where($.isFunction),
});

/**
 * Returns true if piwik settings are configured.
 */
Analytics.isConfigured = function() {
	return Match.test(Meteor.settings.public.piwik, SettingsPattern);
};

/**
 * Returns true if the tracker exists.
 */
Analytics.hasTracker = function() {
	return !!tracker;
};

/**
 * Returns a promise resolving to the global Piwik object.
 */
Analytics.load = function() {
	let result;

	if (Match.test(window.Piwik, PiwikPattern)) {
		result = Promise.resolve(window.Piwik);
	}
	else {
		result = new Promise((resolve, reject) => {
			check(Meteor.settings.public.piwik, SettingsPattern);
			const config = Meteor.settings.public.piwik;

			if (!loading) {
				// Use $.ajax with cache instead of $.loadScript().
				loading = $.ajax({
					url: config.url + (config.jsPath || 'js/'),
					cache: true,
					dataType: "script",
				}).always(() => {
					loading = false;
				});
			}

			loading.done((script, textStatus) => {
				check(window.Piwik, PiwikPattern);
				resolve(window.Piwik);
			}).fail((jqxhr, settings, exception) => {
				reject(exception);
			});
		});
	}

	return result;
};

/**
 * Returns a promise resolving to the configured piwik tracker object.
 */
Analytics.tracker = function() {
	return Analytics.load().then((piwik) => {
		check(Meteor.settings.public.piwik, SettingsPattern);
		if (!tracker) {
			const config = Meteor.settings.public.piwik;
			tracker = piwik.getTracker(config.url + (config.phpPath || 'js/'), config.site);
		}
		return tracker;
	});
};

/**
 * Invokes the callback with the piwik tracker object.
 *
 * Only runs the callback if analytics is configured for this site.
 *
 * Example:
 *     Analytics.trytrack((tracker) => tracker.trackPageView());
 */
Analytics.trytrack = function(callback) {
	if (Analytics.isConfigured()) {
		Analytics.tracker().then(callback, function(err) {
			Meteor._debug("Exception when gathering analytics data", err);
		});
	}
};
