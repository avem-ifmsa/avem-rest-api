var async = require('async');
var passport = require('passport');

var AnonymousStrategy = require('passport-anonymous');
var BasicStrategy = require('passport-http').BasicStrategy;
var BearerStrategy = require('passport-http-bearer').Strategy;
var PublicClientStrategy = require('passport-oauth2-public-client').Strategy;
var ClientPasswordStrategy = require('passport-oauth2-client-password').Strategy;

var User = require('./models/user');
var Client = require('./models/client');
var Session = require('./models/session');
var AccessToken = require('./models/accessToken');

passport.use(new AnonymousStrategy);

function authenticateClientWithSecret(clientId, clientSecret, done) {
	Client.findById(clientId, function(err, client) {
		if (err || !client) return done(err, false);
		if (client.secret !== clientSecret) return done(null, false);
		done(null, client);
	});
}

passport.use('client-basic', new BasicStrategy(authenticateClientWithSecret));
passport.use('client-password', new ClientPasswordStrategy(authenticateClientWithSecret));

passport.use('client-public', new PublicClientStrategy(function(clientId, done) {
	Client.findById(clientId, done);
}));

passport.use('token-bearer', new BearerStrategy(function(bearer, done) {
	async.waterfall([
		function(cb) {
			AccessToken.findOne({ value: bearer }, cb);
		},
		function(token, cb) {
			if (!token || token.expired) return cb('break', null);
			Session.findById(token.session, cb);
		},
		function(session, cb) {
			if (!session) return cb('break', null);
			User.findById(session.user, cb);
		},
	], function(err, user) {
		if (err && err !== 'break') return done(err);
		if (!user) return done(null, false);
		done(null, user);
	});
}));

module.exports = passport;
