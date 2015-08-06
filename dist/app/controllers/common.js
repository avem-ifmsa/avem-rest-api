'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});
exports.authenticate = authenticate;
exports.requirePrivilege = requirePrivilege;
exports.currentSession = currentSession;
exports.extractAccessToken = extractAccessToken;

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _async = require('async');

var _async2 = _interopRequireDefault(_async);

var _jsonapify = require('jsonapify');

var _jsonapify2 = _interopRequireDefault(_jsonapify);

var _authority = require('../authority');

var auth = _interopRequireWildcard(_authority);

var _passport = require('../passport');

var _passport2 = _interopRequireDefault(_passport);

var _models = require('../models');

function authenticate(methods) {
	return [_passport2['default'].authenticate(methods, { session: false }), auth.identify()];
}

function requirePrivilege(priv) {
	return auth.requirePrivilege(priv, {
		onAccessDenied: sendAccessDenied
	});

	function sendAccessDenied(req, res, next) {
		next(new _jsonapify2['default'].errors.HttpError(403));
	}
}

function currentSession(req, callback) {
	var token = extractAccessToken(req);
	_async2['default'].waterfall([function (next) {
		_models.AccessToken.findOne({ value: token }, next);
	}, function (accessToken, next) {
		if (!accessToken) return next('break', null);
		_models.Session.findById(accessToken.session, next);
	}], callback);
}

function extractAccessToken(req) {
	var token = extractFromHeaders(req);
	if (!token) token = extractFromBody(req);
	if (!token) token = extractFromQuery(req);
	return token;

	function extractFromHeaders(req) {
		var authHeader = req.headers.authorization;
		if (!authHeader) return undefined;
		var authData = authHeader.split(' ');
		if (authData.length !== 2 || authData[0] !== 'Bearer') return undefined;
		return authData[1];
	}

	function extractFromBody(req) {
		return req.body['access_token'];
	}

	function extractFromQuery(req) {
		return req.body['access_token'];
	}
}
//# sourceMappingURL=../../app/controllers/common.js.map