import _ from 'lodash';
import async from 'async';
import ask from 'ask-sync';
import mongoose from 'mongoose';

import config from '../../config';
import User from '../app/models/User';
import Role from '../app/models/Role';
import Client from '../app/models/Client';

mongoose.connect(config.db.mongo.url);

initializeDatabase(err => {
	err ? console.log('Fatal error: %s', err.message) : console.log('Done');
	mongoose.disconnect();
});

function initializeDatabase(cb) {
	async.waterfall([
		populateClientCollection,
		populateRoleCollection,
		populateUserCollection,
	], cb);
}

function populateClientCollection(done) {
	console.log('> Initialize AVEM Client Collection:');
	createTrustedClient((err, client) => {
		if (err) return done(err);
		console.log();
		done(null, { trusted: client });
	});
}

function populateRoleCollection(clients, done) {
	console.log('> Initialize AVEM Role Collection:');
	async.series({
		user: cb => createUserRole(clients.trusted, cb),
		admin: cb => createAdminRole(clients.trusted, cb),
	}, (err, results) => {
		if (err) return done(err);
		console.log();
		done(null, results);
	});
}

function populateUserCollection(roles, done) {
	console.log('> Initialize AVEM User Collection:');
	createAdminUser(roles.admin, (err, user) => {
		if (err) return done(err);
		console.log();
		done(null, { admin: user });
	});
}

function createTrustedClient(done) {
	let data = ask({
		name: ask.string('Client name'),
		redirectUri: ask.string('Client redirect URI', { nullable: true }),
	});
	let client = new Client;
	client.name = data.name;
	client.redirectUri = data.redirectUri;
	client.trusted = true;
	client.save((err, client) => {
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
	let role = new Role;
	role.name = 'admin';
	role.description = 'Privileged role for administrative tasks';
	role.privileges = expandPrivileges({
		session: ['enum', 'read', 'edit', 'remove' ],
		'access-token': [ 'enum', 'read', 'remove' ],
		'refresh-token': [ 'enum', 'read', 'remove' ],
		client: [ 'enum', 'add', 'read', 'edit', 'remove' ],
		role: [ 'enum', 'add', 'read', 'edit', 'remove' ],
		user: [ 'enum', 'add', 'read', 'edit', 'edit-role', 'remove' ],
		member: [ 'enum', 'add', 'read', 'edit', 'remove' ],
		'mb-member': [ 'enum', 'add', 'read', 'edit', 'remove' ],
		activity: [ 'enum', 'add', 'read', 'edit', 'remove' ],
	});
	role.save(err => {
		if (err) return done(err);
		console.log('Created admin role');
		done(null, role);
	});
}

function expandPrivileges(privs) {
	return _.reduce(privs, (results, actions, actor) => {
		_.each(actions, action => results.push(actor + ':' + action));
		return results;
	}, []);
}

function createUserRole(client, done) {
	let role = new Role;
	role.name = 'user';
	role.privileges = [];
	role.description = 'Standard role for regular users';
	role.save(err => {
		if (err) return done(err);
		console.log('Created user role');
		done(null, role);
	});
}

function createAdminUser(role, done) {
	console.log('Creating AVEM Admin User:');
	let data = ask({
		email: ask.string('User email'),
		password: ask.string('User password', {
			minLength: config.security.password.minLength,
			maxLength: config.security.password.maxLength,
		}),
	});
	let user = new User;
	user.role = role._id;
	user.email = data.email;
	user.password = data.password;
	user.save(err => {
		if (err) return done(err, false);
		console.log('Created admin user:');
		console.log('- User email: %s', user.email);
		console.log('- User password: %s', data.password);
		done(null, user);
	});
}
