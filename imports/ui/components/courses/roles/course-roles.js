import { Meteor } from 'meteor/meteor';
import { ReactiveVar } from 'meteor/reactive-var';
import { Template } from 'meteor/templating';

import PleaseLogin from '/imports/ui/lib/please-login.js';

import '/imports/ui/components/buttons/buttons.js';

import './course-roles.html';

Template.courseRole.created = function() {
	this.enrolling = new ReactiveVar(false);
};

Template.courseRole.helpers({
	enrolling: function() { return Template.instance().enrolling.get(); },

	roleSubscribe: function() {
		let role = this.type;
		if (role == 'participant') role = 'interested';

		return 'roles.' + role + '.subscribe';
	},

	roleSubscribed: function() {
		let role = this.type;
		if (role == 'participant') role = 'interested';

		return 'roles.' + role + '.subscribed';
	},

	maySubscribe: function(role) {
		var operator = Meteor.userId();

		// Show the participation buttons even when not logged-in.
		// fun HACK: if we pass an arbitrary string instead of falsy
		// the maySubscribe() will return true if the user could subscribe
		// if they were logged-in. Plain abuse of maySubscribe().
		if (!operator) operator = 'unlogged';

		return maySubscribe(operator, this.course, operator, role);
	}
});

Template.courseRole.events({
	'click .js-role-enroll-btn': function(e, template) {
		if (PleaseLogin()) return;
		template.enrolling.set(true);
		return false;
	},

	'click .js-role-subscribe-btn': function (e, template) {
		Meteor.call("add_role", this.course._id, Meteor.userId(), this.roletype.type);

		// Store the comment
		var comment = template.$('.js-comment').val();
		Meteor.call("change_comment", this.course._id, comment);
		template.enrolling.set(false);
		return false;
	},

	'click .js-role-enroll-cancel': function (e, template) {
		template.enrolling.set(false);
		return false;
	},

	'click .js-role-unsubscribe-btn': function () {
		Meteor.call('remove_role', this.course._id, Meteor.userId(), this.roletype.type);
		return false;
	}
});
