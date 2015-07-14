var async = require('async');

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

exports.currentSession = currentSession;
exports.extractAccessToken = extractAccessToken;
