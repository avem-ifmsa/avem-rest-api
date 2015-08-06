'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _async = require('async');

var _async2 = _interopRequireDefault(_async);

var _askSync = require('ask-sync');

var _askSync2 = _interopRequireDefault(_askSync);

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var _config = require('../../config');

var _config2 = _interopRequireDefault(_config);

var _appModelsUser = require('../app/models/User');

var _appModelsUser2 = _interopRequireDefault(_appModelsUser);

var _appModelsRole = require('../app/models/Role');

var _appModelsRole2 = _interopRequireDefault(_appModelsRole);

var _appModelsClient = require('../app/models/Client');

var _appModelsClient2 = _interopRequireDefault(_appModelsClient);

_mongoose2['default'].connect(_config2['default'].db.mongo.url);

initializeDatabase(function (err) {
	err ? console.log('Fatal error: %s', err.message) : console.log('Done');
	_mongoose2['default'].disconnect();
});

function initializeDatabase(cb) {
	_async2['default'].waterfall([populateClientCollection, populateRoleCollection, populateUserCollection], cb);
}

function populateClientCollection(done) {
	console.log('> Initialize AVEM Client Collection:');
	createTrustedClient(function (err, client) {
		if (err) return done(err);
		console.log();
		done(null, { trusted: client });
	});
}

function populateRoleCollection(clients, done) {
	console.log('> Initialize AVEM Role Collection:');
	_async2['default'].series({
		user: function user(cb) {
			return createUserRole(clients.trusted, cb);
		},
		admin: function admin(cb) {
			return createAdminRole(clients.trusted, cb);
		}
	}, function (err, results) {
		if (err) return done(err);
		console.log();
		done(null, results);
	});
}

function populateUserCollection(roles, done) {
	console.log('> Initialize AVEM User Collection:');
	createAdminUser(roles.admin, function (err, user) {
		if (err) return done(err);
		console.log();
		done(null, { admin: user });
	});
}

function createTrustedClient(done) {
	var data = (0, _askSync2['default'])({
		name: _askSync2['default'].string('Client name'),
		redirectUri: _askSync2['default'].string('Client redirect URI', { nullable: true })
	});
	var client = new _appModelsClient2['default']();
	client.name = data.name;
	client.redirectUri = data.redirectUri;
	client.trusted = true;
	client.save(function (err, client) {
		if (err) return done(err);
		console.log('Created trusted client:');
		console.log('- Client id: %s', client._id);
		console.log('- Client name: %s', client.name);
		console.log('- Client secret: %s', client.secret);
		console.log('- Client redirect URI: %s', client.redirectUri);
		done(null, client);
	});
}

function createAdminRole(client, done) {
	var role = new _appModelsRole2['default']();
	role.name = 'admin';
	role.description = 'Privileged role for administrative tasks';
	role.privileges = ['user:enum', 'user:add', 'user:read', 'user:edit', 'user:edit-role', 'user:remove', 'role:enum', 'role:add', 'role:read', 'role:edit', 'role:remove', 'client:enum', 'client:add', 'client:read', 'client:edit', 'client:trust', 'client:remove', 'access-token:enum', 'access-token:read', 'access-token:remove', 'refresh-token:enum', 'refresh-token:read', 'refresh-token:remove', 'session:enum', 'session:read', 'session:edit', 'session:remove'];
	role.save(function (err) {
		if (err) return done(err);
		console.log('Created admin role');
		done(null, role);
	});
}

function createUserRole(client, done) {
	var role = new _appModelsRole2['default']();
	role.name = 'user';
	role.privileges = [];
	role.description = 'Standard role for regular users';
	role.save(function (err) {
		if (err) return done(err);
		console.log('Created user role');
		done(null, role);
	});
}

function createAdminUser(role, done) {
	console.log('Creating AVEM Admin User:');
	var data = (0, _askSync2['default'])({
		email: _askSync2['default'].string('User email'),
		password: _askSync2['default'].string('User password', {
			minLength: _config2['default'].security.password.minLength,
			maxLength: _config2['default'].security.password.maxLength
		})
	});
	var user = new _appModelsUser2['default']();
	user.role = role._id;
	user.email = data.email;
	user.password = data.password;
	user.save(function (err) {
		if (err) return done(err, false);
		console.log('Created admin user:');
		console.log('- User email: %s', user.email);
		console.log('- User password: %s', data.password);
		done(null, user);
	});
}
//# sourceMappingURL=../bin/init-db.js.map