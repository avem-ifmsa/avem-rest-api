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
	role.privileges = [
		'user:enum', 'user:add', 'user:read', 'user:edit', 'user:edit-role',
		'user:remove',
		'role:enum', 'role:add', 'role:read', 'role:edit', 'role:remove',
		'client:enum', 'client:add', 'client:read', 'client:edit',
		'client:trust', 'client:remove',
		'access-token:enum', 'access-token:read', 'access-token:remove',
		'refresh-token:enum', 'refresh-token:read', 'refresh-token:remove',
		'session:enum', 'session:read', 'session:edit', 'session:remove',
	];
	role.save(err => {
		if (err) return done(err);
		console.log('Created admin role');
		done(null, role);
	});
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
