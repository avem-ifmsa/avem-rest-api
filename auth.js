var _ = require('lodash');
var async = require('async');
var passport = require('passport');
var authRbac = require('auth-rbac');
var jsonapify = require('jsonapify');

var BasicStrategy = require('passport-http').BasicStrategy;
var BearerStrategy = require('passport-http-bearer').Strategy;
var PublicClientStrategy = require('passport-oauth2-public-client').Strategy;
var ClientPasswordStrategy = require('passport-oauth2-client-password').Strategy;

var User = require('./models/user');
var Role = require('./models/role');
var Client = require('./models/client');
var Session = require('./models/session');
var AccessToken = require('./models/accessToken');

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

var authority = authRbac({
	getUser: function(req, cb) {
		cb(null, req.user);
	},
	
	userGetRole: function(user, cb) {
		Role.findById(user.role, cb);
	},
	
	roleHasPrivilege: function(role, priv, cb) {
		cb(null, _.contains(role.privileges, priv));
	},
});

function initialize() {
	return passport.initialize();
};

function authenticateAccessToken() {
	return [
		passport.authenticate('token-bearer', { session: false }),
		authRbac.identify(authority),
	];
};

function authenticatePublicClient() {
	var methods = ['client-basic', 'client-password', 'client-public'];
	return passport.authenticate(methods, { session: false });
};

function requirePrivilege(priv, opts) {
	opts = _.merge({}, opts, { onAccessDenied: sendAccessDenied });
	return authRbac.requirePrivilege(priv, opts);
	
	function sendAccessDenied(req, res, next) {
		next(new jsonapify.errors.HttpError(401));
	}
};

exports.initialize = initialize;
exports.requirePrivilege = requirePrivilege;
exports.authenticateAccessToken = authenticateAccessToken;
exports.authenticatePublicClient = authenticatePublicClient;
