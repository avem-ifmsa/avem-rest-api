'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _async = require('async');

var _async2 = _interopRequireDefault(_async);

var _passport = require('passport');

var _passport2 = _interopRequireDefault(_passport);

var _passportHttp = require('passport-http');

var _passportAnonymous = require('passport-anonymous');

var _passportAnonymous2 = _interopRequireDefault(_passportAnonymous);

var _passportHttpBearer = require('passport-http-bearer');

var _passportOauth2PublicClient = require('passport-oauth2-public-client');

var _passportOauth2ClientPassword = require('passport-oauth2-client-password');

var _modelsUser = require('./models/User');

var _modelsUser2 = _interopRequireDefault(_modelsUser);

var _modelsClient = require('./models/Client');

var _modelsClient2 = _interopRequireDefault(_modelsClient);

var _modelsSession = require('./models/Session');

var _modelsSession2 = _interopRequireDefault(_modelsSession);

var _modelsAccessToken = require('./models/AccessToken');

var _modelsAccessToken2 = _interopRequireDefault(_modelsAccessToken);

_passport2['default'].use(new _passportAnonymous2['default']());

function authenticateClientWithSecret(clientId, clientSecret, done) {
	_modelsClient2['default'].findById(clientId, function (err, client) {
		if (err || !client) return done(err, false);
		if (client.secret !== clientSecret) return done(null, false);
		done(null, client);
	});
}

_passport2['default'].use('client-basic', new _passportHttp.BasicStrategy(authenticateClientWithSecret));
_passport2['default'].use('client-password', new _passportOauth2ClientPassword.Strategy(authenticateClientWithSecret));

_passport2['default'].use('client-public', new _passportOauth2PublicClient.Strategy(function (clientId, done) {
	_modelsClient2['default'].findById(clientId, done);
}));

_passport2['default'].use('token-bearer', new _passportHttpBearer.Strategy(function (bearer, done) {
	_async2['default'].waterfall([function (next) {
		_modelsAccessToken2['default'].findOne({ value: bearer }, next);
	}, function (token, next) {
		if (!token || token.expired) return next('break', null);
		_modelsSession2['default'].findById(token.session, next);
	}, function (session, next) {
		if (!session) return next('break', null);
		_modelsUser2['default'].findById(session.user, next);
	}], function (err, user) {
		if (err && err !== 'break') return done(err);
		if (!user) return done(null, false);
		done(null, user);
	});
}));

exports['default'] = _passport2['default'];
module.exports = exports['default'];
//# sourceMappingURL=../lib/passport.js.map