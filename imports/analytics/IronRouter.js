import Analytics from '../Analytics.js';

let started;

Router.onBeforeAction(function() {
	if (Analytics.hasTracker()) {
		Analytics.trytrack((tracker) => tracker.deleteCustomVariables());
		started = new Date();
	}
	this.next();
});

Router.onAfterAction(function() {
	// Router.onAfterAction sometimes fires more than once on each page run.
	// https://github.com/iron-meteor/iron-router/issues/1031
	if (Tracker.currentComputation.firstRun) {
		Analytics.trytrack((tracker) => {
			if (started) {
				tracker.setGenerationTimeMs(new Date() - started);
				started = null;
			}
			tracker.setDocumentTitle(document.title);
			tracker.setCustomUrl(window.location.href);
			tracker.trackPageView();
		});
	}
});
