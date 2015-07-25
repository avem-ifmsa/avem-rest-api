var async = require('async');
var jsonapify = require('jsonapify');

var auth = require('../authority');
var passport = require('../passport');
var Session = require('../models/session');
var AccessToken = require('../models/accessToken');

function authenticate(methods) {
	return [
		passport.authenticate(methods, { session: false }),
		auth.identify(),
	];
}

function requirePrivilege(priv) {
	return auth.requirePrivilege(priv, {
		onAccessDenied: sendAccessDenied,
	});
	
	function sendAccessDenied(req, res, next) {
		next(new jsonapify.errors.HttpError(401));
	}
}

function currentSession(req, cb) {
	var token = extractAccessToken(req);
	async.waterfall([
		function(cb) {
			AccessToken.findOne({ value: token }, cb);
		},
		function(accessToken, cb) {
			if (!accessToken) return cb('break', null);
			Session.findById(accessToken.session, cb);
		},
	], cb);
}

function extractAccessToken(req) {
	var token = extractFromHeaders(req);
	if (!token) token = extractFromBody(req);
	if (!token) token = extractFromQuery(req);
	return token;
	
	function extractFromHeaders(req) {
		var authHeader = req.headers.authorization;
		if (!authHeader)
			return undefined;
		var authData = authHeader.split(' ');
		if (authData.length !== 2 || authData[0] !== 'Bearer')
			return undefined;
		return authData[1];
	}
	
	function extractFromBody(req) {
		return req.body['access_token'];
	}
	
	function extractFromQuery(req) {
		return req.body['access_token'];
	}
}

exports.authenticate = authenticate;
exports.currentSession = currentSession;
exports.requirePrivilege = requirePrivilege;
exports.extractAccessToken = extractAccessToken;
