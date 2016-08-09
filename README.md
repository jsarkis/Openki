Openki  &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; [![Build Status](https://travis-ci.org/schuel/hmmm.svg?branch=master)](https://travis-ci.org/schuel/hmmm) &nbsp; &nbsp; [![CII Best Practices](https://bestpractices.coreinfrastructure.org/projects/250/badge)](https://bestpractices.coreinfrastructure.org/projects/250)
====

**Platform for open education** – Free software built with [Meteor.js](http://meteor.com)

An interactive web-platform in development with the ambition to facilitate a barrier-free access to education for everyone. It is a simple to use open-source tool for local, self-organized knowledge-exchange: As the foundation for mediating non-commercial education opportunities, as the interface between people who embrace themselves for similar subjects and as an instrument, which simplifies the organization of a “peer-to-peer” sharing of knowledge.

<div align="center"><img src="https://cloud.githubusercontent.com/assets/9354955/8768227/87a178c6-2e78-11e5-8ba8-a35c834ecda3.png" width="590" alt="arrow diagram showing connection between individuals, comunities, event-locations and calendars"></div>
<br>
Beside longterm public installations, Openki can be used at unconferences, BarCamps as well as in democratic schools and participatory festivals.

[  read on...](http://about.openki.net "our blog")
<div align="right"> (<span class="octicon octicon-star">★</span> Star us if you like the idea)</div>

- Demo/Playground: [sandbox.openki.net](http://sandbox.openki.net/?region=Englistan "runing here")
- Live: [openki.net](https://openki.net)
- Concept: [about.openki.net](http://about.openki.net "our blog")
- Contact: [openki-core[at]lists.xiala.net](mailto:openki-core[_at_]lists.xiala.net "write us")


All submissions are welcome. To submit a change, [fork this repo](https://github.com/schuel/hmmm/fork), commit your changes, and send us a [pull request](http://help.github.com/send-pull-requests/).


### Features
- :pencil: Easily propose courses and events
- :mag: Fulltext-search them
- :speech_balloon: Simple discussion-board
- :computer: Information-display: live-views for big and small screens with upcomming events
- :pager: frame-URIs to dynamically embed views into other pages
- :cat: Categories with sub-categories
- :door: Regions- and room-system
- :mortar_board: Extendable participant roles
- :white_flower: Groups-, community- and program-system and -filters
- :date: Calendar and iCal exports
- :key: Single-Sign-on (OpenID/OAuth: Github, Facebook, g+)
- :iphone: Responsive design: mobile, tablet and desktop computers
- :ideograph_advantage: I18n: In-browser-GUI for life translation
- :envelope: Email notifications
- :open_file_folder: File upload for course-documentation
- :bird: funny icons for the feature-list in our github-readme :)

#### Intended features
- :white_large_square: White-labeling for groups, locations and regions
- :closed_lock_with_key: Privacy settings and security
- :heavy_check_mark: Voting-/polling-system, fix-a-date schedules
- :mailbox: Privat messaging
- :name_badge: OpenBadges
- :ghost: Customizability
- :ticket: Mozzila Persona
- :8ball: Connection to SocialNetworks APIs
- :iphone: Smartphone App

### Installation (Linux, OSX and Windows)
- To install Meteor locally, run: `curl https://install.meteor.com | sh`  (or download [Installer](https://install.meteor.com/windows) for Win)
- [Download](https://github.com/schuel/hmmm/archive/master.zip) and unzip or `git clone https://github.com/schuel/hmmm.git` Openki into /some/path.
- `cd /some/path/hmmm`
- Run `meteor --settings settings.dev.json`
- Browse to [localhost:3000](http://localhost:3000/) -> done. (admin: `greg`/`greg`, any other visible user has pwd `greg` as well)

#### Documentation
- The technical documentation is here on Github in the <span class="octicon octicon-book"></span>[Wiki](https://github.com/schuel/hmmm/wiki)

### License
- AGPL – GNU Affero General Public License (for the sourcecode) <span class="octicon octicon-mark-github"></span>
- For all course contents and descriptions (if not differently indicated): Creative Commons BY-SA
- For all testing-events descriptions (server/data/testing.events.js): Creative Commons BY-NC-SA
