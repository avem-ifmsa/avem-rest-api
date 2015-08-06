import async from 'async';
import passport from 'passport';
import {BasicStrategy} from 'passport-http';
import AnonymousStrategy from 'passport-anonymous';
import {Strategy as BearerStrategy} from 'passport-http-bearer';
import {Strategy as PublicClientStrategy} from 'passport-oauth2-public-client';
import {Strategy as ClientPasswordStrategy} from 'passport-oauth2-client-password';

import User from './models/User';
import Client from './models/Client';
import Session from './models/Session';
import AccessToken from './models/AccessToken';

passport.use(new AnonymousStrategy);

function authenticateClientWithSecret(clientId, clientSecret, done) {
	Client.findById(clientId, (err, client) => {
		if (err || !client) return done(err, false);
		if (client.secret !== clientSecret) return done(null, false);
		done(null, client);
	});
}

passport.use('client-basic', new BasicStrategy(authenticateClientWithSecret));
passport.use('client-password', new ClientPasswordStrategy(authenticateClientWithSecret));

passport.use('client-public', new PublicClientStrategy((clientId, done) => {
	Client.findById(clientId, done);
}));

passport.use('token-bearer', new BearerStrategy((bearer, done) => {
	async.waterfall([
		(next) => {
			AccessToken.findOne({ value: bearer }, next);
		},
		(token, next) => {
			if (!token || token.expired) return next('break', null);
			Session.findById(token.session, next);
		},
		(session, next) => {
			if (!session) return next('break', null);
			User.findById(session.user, next);
		},
	], (err, user) => {
		if (err && err !== 'break') return done(err);
		if (!user) return done(null, false);
		done(null, user);
	});
}));

export default passport;
