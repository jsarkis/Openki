import '/imports/Predicates.js';
import '/imports/Profile.js';
import '/imports/LocalTime.js';
import Metatags from '/imports/Metatags.js';
import CourseTemplate from '/imports/ui/lib/course-template.js';
import CssFromQuery from '/imports/ui/lib/css-from-query.js';

import '/imports/ui/layouts';
import '/imports/ui/pages';
import '/imports/analytics/IronRouter.js';

Router.configure({
	layoutTemplate: 'layout',
	notFoundTemplate: 'notFound',
	loadingTemplate: 'loadingPage',
});
Router.onBeforeAction('dataNotFound');

Router.onBeforeAction(function() {
	Metatags.removeAll();
	this.next();
});

Router.map(function () {
	this.route('pages', {									///////// static /////////
		path: 'page/:page_name',
		action: function() {
			this.render(this.params.page_name);
		},
		onAfterAction: function() {
			Metatags.setCommonTags(this.params.page_name);
		}
	});

});

function finderRoute(path) {
	return {
		path: path,
		template: 'findWrap',
		data: function() {
			var query = this.params.query;

			// Add filter options for the homepage
			return _.extend(query, {
				internal: false,
				region: Session.get('region')
			});
		},
		onAfterAction: function() {
			var search = this.params.query.search;
			if (search) {
				Metatags.setCommonTags(mf('find.windowtitle', {SEARCH: search}, 'Find "{SEARCH}"'));
			} else {
				Metatags.setCommonTags(mf('find.WhatLearn?'));
			}
		}
	};
}

Router.map(function () {
	this.route('find', finderRoute('/find'));
	this.route('home', finderRoute('/'));
});

Router.map(function () {
	this.route('proposeCourse', {
		path: 'courses/propose',
		template: 'proposeCourse',
		onAfterAction: function() {
			Metatags.setCommonTags(mf('course.propose.windowtitle', 'Propose new course'));
		},
		data: CourseTemplate
	});
});


Router.map(function () {
	this.route('frameWeek', {
		path: '/frame/week',
		template: 'frameWeek',
		layoutTemplate: 'frameWeek',
		onAfterAction: function() {
			Metatags.setCommonTags(mf('calendar.windowtitle', 'Calendar'));
		}
	});
});

Router.map(function () {
	this.route('frameSchedule', {
		path: '/frame/schedule',
		layoutTemplate: 'frameLayout',
	});
});

Router.map(function () {
	this.route('framePropose', {
		path: '/frame/propose',
		template: 'framePropose',
		layoutTemplate: 'frameLayout',
		waitOn: () => Meteor.subscribe('regions'),
		data: function() {
			const predicates =
				{ region: Predicates.id
				, group: Predicates.id
				, neededRoles: Predicates.ids
				};

			const params = Filtering(predicates).read(this.params.query).done();
			const data = params.toQuery();
			data.isFrame = true;
			return data;
		},
		onAfterAction() {
			Metatags.setCommonTags(
				mf('course.propose.windowtitle', 'Propose new course')
			);
		}
	});
});

Router.map(function () {
	this.route('frameEvents', {
		path: '/frame/events',
		template: 'frameEvents',
		layoutTemplate: 'frameLayout',
		waitOn: function () {
			this.filter = Events.Filtering().read(this.params.query).done();

			var filterParams = this.filter.toParams();
			filterParams.after = minuteTime.get();

			var limit = parseInt(this.params.query.count, 10) || 6;

			return Meteor.subscribe('Events.findFilter', filterParams, limit*2);
		},

		data: function() {
			var filterParams = this.filter.toParams();
			filterParams.after = minuteTime.get();

			var limit = parseInt(this.params.query.count, 10) || 6;

			return Events.findFilter(filterParams, limit);
		},

		onAfterAction: function() {
			Metatags.setCommonTags(mf('event.list.windowtitle', 'Events'));
		}
	});
});

Router.map(function() {
	this.route('frameCourselist', {
		path: '/frame/courselist',
		template: 'frameCourselist',
		layoutTemplate: 'frameLayout'
	});
});

Router.map(function () {
	this.route('frameCalendar', {
		path: '/frame/calendar',
		template: 'frameCalendar',
		layoutTemplate: 'frameLayout',
		data: function() {
			const cssRules = new CssFromQuery(this.params.query).getCssRules();
			return { cssRules };
		},
		onAfterAction: function() {
			Metatags.setCommonTags(mf('calendar.windowtitle', 'Calendar'));
		}
	});
});

Router.map(function () {
	this.route('FAQ', {
		path: '/FAQ',
		template: 'FAQ'
	});
});

Router.map(function () {
	this.route('calendar', {
		path: 'calendar',
		template: 'calendar',
		data: function() { return this.params; },
		onAfterAction: function() {
			Metatags.setCommonTags(mf('calendar.windowtitle', 'Calendar'));
		}
	});
});

var makeFilterQuery = function(params) {
	var filter = Events.Filtering().read(params).done();

	var query = filter.toQuery();

	var start;
	if (params.start) start = moment(params.start);
	if (!start || !start.isValid()) start = moment(minuteTime.get()).startOf('day');

	var end;
	if (params.end) end = moment(params.end);
	if (!end || !end.isValid()) end = moment(start).add(1, 'day');

	query.period = [start.toDate(), end.toDate()];

	return query;
};

Router.map(function () {
	this.route('timetable', {
		path: '/kiosk/timetable',
		layoutTemplate: 'timetableLayout',
		waitOn: function () {
			return subs.subscribe('Events.findFilter', makeFilterQuery(this.params && this.params.query), 200);
		},
		data: function() {
			var query = makeFilterQuery(this.params.query);

			var start;
			var end;

			var events = Events.findFilter(query, 200).fetch();

			// collect time when first event starts and last event ends
			events.forEach(function(event) {
				if (!start || event.start < start    ) start = event.start;
				if (!end   || end         < event.end) end   = event.end;
			});

			if (!start || !end) return [];

			start = moment(start).startOf('hour');
			end   = moment(end).startOf('hour');

			var startAbs = start.toDate().getTime();
			var endAbs   = end.toDate().getTime();

			var span = endAbs - startAbs;
			var days = {};
			var hours = {};
			var cursor = moment(start);
			do {
				var month = cursor.month();
				var day = cursor.day();
				days[''+month+day] = {
					moment: moment(cursor).startOf('day'),
					relStart: Math.max(-0.1, (moment(cursor).startOf('day').toDate().getTime() - startAbs) / span),
					relEnd:   Math.max(-0.1, (endAbs - moment(cursor).startOf('day').add(1, 'day').toDate().getTime()) / span)
				};
				var hour = cursor.hour();
				hours[''+month+day+hour] = {
					moment: moment(cursor).startOf('hour'),
					relStart: Math.max(-0.1, (moment(cursor).startOf('hour').toDate().getTime() - startAbs) / span),
					relEnd:   Math.max(-0.1, (endAbs - moment(cursor).startOf('hour').add(1, 'hour').toDate().getTime()) / span)
				};
				cursor.add(1, 'hour');
			} while(cursor.isBefore(end));

			var perVenue = {};
			var useVenue = function(venue) {
				var id = venue._id || '#'+venue.name;
				if (!perVenue[id]) {
					perVenue[id] = {
						venue: venue,
						rows: []
					};
				}
				return perVenue[id].rows;
			};

			events.forEach(function(event) {
				event.relStart = (event.start.getTime() - startAbs) / span;
				event.relEnd   = (endAbs - event.end.getTime()) / span;
				var placed = false;

				var venueRows = useVenue(event.venue);
				for (var rowNr in venueRows) {
					var row = venueRows[rowNr];
					var last = undefined;
					for (var eventNr in row) {
						var placedEvent = row[eventNr];
						if (!last || placedEvent.end > last) last = placedEvent.end;
					}
					if (last <= event.start) {
						row.push(event);
						placed = true;
						break;
					}
				}
				if (!placed) {
					venueRows.push([event]);
				}
			});

			return {
				days: _.toArray(days),
				hours: _.toArray(hours),
				grouped: _.toArray(perVenue)
			};
		},
	});
});

Router.map(function() {
	this.route('userprofile', {
		path: 'user/:_id/:username?',
		waitOn: function () {
			return [
				Meteor.subscribe('user', this.params._id),
				Meteor.subscribe('groupsFind', { own: true }),
			];
		},
		data: function () {
			var user = Meteor.users.findOne({_id: this.params._id});
			if (!user) return; // not loaded?

			// What privileges the user has
			var privileges = _.reduce(['admin'], function(ps, p) {
				ps[p] = privileged(user, p);
				return ps;
			}, {});

			var alterPrivileges = privilegedTo('admin');
			var showPrivileges = alterPrivileges || (user.privileges && user.privileges.length);

			return {
				'user': user,
				'alterPrivileges': alterPrivileges,
				'privileges': privileges,
				'inviteGroups': Groups.findFilter({ own: true }),
				'showPrivileges': showPrivileges
			};
		},
		onAfterAction: function() {
			var user = Meteor.users.findOne({_id: this.params._id});
			if (!user) return; // wtf
			const title = mf('profile.windowtitle', {USER: user.username}, '{USER}\'s Profile');
			Metatags.setCommonTags(title);
		}
	});
});


Router.map(function () {
	this.route('showEvent', {
		path: 'event/:_id/:slug?',
		template: 'eventPage',
		notFoundTemplate: 'eventNotFound',
		waitOn: function () {
			var subs = [
				Meteor.subscribe('event', this.params._id)
			];
			var courseId = this.params.query.courseId;
			if (courseId) {
				subs.push(Meteor.subscribe('courseDetails', courseId));
			}
			return subs;
		},
		data: function () {
			var event;
			var create = 'create' == this.params._id;
			if (create) {
				var propose = LocalTime.now().add(1, 'week').startOf('hour');
				event = {
					new: true,
					startLocal: LocalTime.toString(propose),
					endLocal: LocalTime.toString(moment(propose).add(2, 'hour')),
				};
				var course = Courses.findOne(this.params.query.courseId);
				if (course) {
					event.title = course.name;
					event.courseId = course._id;
					event.region = course.region;
					event.description = course.description;
					event.internal = course.internal;
				}
			} else {
				event = Events.findOne({_id: this.params._id});
				if (!event) return false;
			}

			return event;
		}
	});
});


function loadroles(course) {
	var userId = Meteor.userId();
	return _.reduce(Roles, function(goodroles, roletype) {
		var role = roletype.type;
		var sub = hasRoleUser(course.members, role, userId);
		if (course.roles && course.roles.indexOf(role) !== -1) {
			goodroles.push({
				roletype: roletype,
				role: role,
				subscribed: !!sub,
				course: course
			});
		}
		return goodroles;
	}, []);
}


Router.map(function () {
	this.route('showCourse', {
		path: 'course/:_id/:slug?',
		template: 'courseDetailsPage',
		waitOn: function () {
			return subs.subscribe('courseDetails', this.params._id);
		},
		data: function() {
			var course = Courses.findOne({_id: this.params._id});

			if (!course) return false;

			var userId = Meteor.userId();
			var member = getMember(course.members, userId);
			var data = {
				edit: !!this.params.query.edit,
				roles_details: loadroles(course),
				course: course,
				member: member,
				select: this.params.query.select
			};
			return data;
		},
		onAfterAction: function() {
			var data = this.data();
			if (data) {
				var course = data.course;
				Metatags.setCommonTags(mf('course.windowtitle', {COURSE: course.name}, 'Course: {COURSE}'));
			}
		}
	});

	this.route('showCourseHistory', {
		path: 'course/:_id/:slug/History',
		//template: 'coursehistory',
		waitOn: function () {
			return [
				Meteor.subscribe('courseDetails', this.params._id)
			];
		},
		data: function () {
			var course = Courses.findOne({_id: this.params._id});
			return {
				course: course
			};
		}
	});
});



Router.map(function () {
	this.route('profile', {
		path: 'profile',
		waitOn: function () {
			return [
				Meteor.subscribe('groupsFind', { own: true }),
				Meteor.subscribe('Venues.findFilter', { editor: Meteor.userId() })
			];
		},
		data: function () {
			var data = {};
			var user = Meteor.user();
			data.loggedIn = !!user;
			if (data.loggedIn) {
				var userdata = {
					_id: user._id,
					name: user.username,
					privacy: user.privacy,
					notifications: user.notifications,
					groups: Groups.findFilter({ own: true }),
					venues: Venues.find({ editor: user._id })
				};
				userdata.have_email = user.emails && user.emails.length > 0;
				if (userdata.have_email) {
					userdata.email = user.emails[0].address;
					userdata.verified = !!user.emails[0].verified;
				}

				data.user = userdata;
				data.involvedIn = Courses.findFilter({ userInvolved: user._id });
			}
			return data;
		},
		onAfterAction: function() {
			var user = Meteor.users.findOne();
			if (!user) return;
			Metatags.setCommonTags(mf('profile.settings.windowtitle', {USER: user.username}, 'My Profile Settings - {USER}'));
		}
	});
});

Router.map(function () {
	this.route('groupDetails', {
		path: 'group/:_id/:short?',
		waitOn: function () {
			return [
				subs.subscribe('group', this.params._id),
			];
		},
		data: function () {
			var group;
			var isNew = this.params._id === 'create';
			if (isNew) {
				group = {
					_id: 'create'
				};
			} else {
				group = Groups.findOne({_id: this.params._id});
			}

			if (!group) return false;

			var data = {
				group: group,
				courseQuery: _.extend(this.params.query, {group: group._id}),
				isNew: isNew,
				showCourses: !isNew,
			};


			return data;
		},
		onAfterAction: function() {
			var group = Groups.findOne({_id: this.params._id});
			if (group) {
				Metatags.setCommonTags(group.name);
			}
		}
	});
});


Router.map(function() {
	this.route('venueDetails', {
		path: 'venue/:_id/:name?',
		waitOn: function () {
			return [
				Meteor.subscribe('venueDetails', this.params._id),
			];
		},

		data: function() {
			var id = this.params._id;

			var venue;
			var data = {};
			if (id === 'create') {
				var userId = Meteor.userId();
				venue = new Venue();
				venue.region = cleanedRegion(Session.get('region'));
				venue.editor = userId;
			} else {
				venue = Venues.findOne({_id: this.params._id});
				if (!venue) return false; // Not found
			}

			data.venue = venue;

			return data;
		},

		onAfterAction: function() {
			var data = this.data();
			if (!data) return;

			var venue = data.venue;
			var title;
			if (venue._id) {
				title = venue.name;
			} else {
				title = mf('venue.edit.siteTitle.create', "Create Venue");
			}
			Metatags.setCommonTags(title);
		}
	});
});


Router.route('/profile/unsubscribe/:token', function() {

	var unsubToken = this.params.token;

	var accepted = Profile.Notifications.unsubscribe(unsubToken);

	var query = {};
	if (accepted) {
		query.unsubscribed = '';
	} else {
		query['unsubscribe-error'] = '';
	}

	this.response.writeHead(302, {
		'Location': Router.url('profile', {}, { query: query })
	});

	this.response.end();
}, {
	name: 'profile.unsubscribe',
	where: 'server'
});
