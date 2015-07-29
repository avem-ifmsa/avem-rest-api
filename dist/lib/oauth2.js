'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _async = require('async');

var _async2 = _interopRequireDefault(_async);

var _oauth2orize = require('oauth2orize');

var _oauth2orize2 = _interopRequireDefault(_oauth2orize);

var _config = require('../../config');

var _config2 = _interopRequireDefault(_config);

var _modelsUser = require('./models/User');

var _modelsUser2 = _interopRequireDefault(_modelsUser);

var _modelsClient = require('./models/Client');

var _modelsClient2 = _interopRequireDefault(_modelsClient);

var _modelsSession = require('./models/Session');

var _modelsSession2 = _interopRequireDefault(_modelsSession);

var _modelsAccessToken = require('./models/AccessToken');

var _modelsAccessToken2 = _interopRequireDefault(_modelsAccessToken);

var _modelsRefreshToken = require('./models/RefreshToken');

var _modelsRefreshToken2 = _interopRequireDefault(_modelsRefreshToken);

var server = (0, _oauth2orize2['default'])();
exports['default'] = server;

server.serializeClient(function (client, done) {
	done(null, client._id);
});

server.deserializeClient(function (id, done) {
	_modelsClient2['default'].findById(id, done);
});

server.exchange(_oauth2orize2['default'].exchange.password(function (client, username, password, done) {
	if (!client || !client.trusted) return done(null, false);
	_modelsUser2['default'].findOne({ email: username }, function (err, user) {
		if (err || !user) return done(err, false);
		user.verifyPassword(password, function (err, isMatch) {
			if (err || !isMatch) return done(err, false);
			var session = new _modelsSession2['default']();
			session.user = user._id;
			session.ownerClient = client._id;
			var tokenDuration = _config2['default'].oauth2.token.resourceOwnerDuration;
			session.tokenDuration = tokenDuration;
			var accessToken = new _modelsAccessToken2['default']();
			var refreshToken = new _modelsRefreshToken2['default']();
			accessToken.session = refreshToken.session = session._id;
			accessToken.expirationDate = Date.now() + tokenDuration * 1000;
			_async2['default'].series([function (next) {
				return session.save(next);
			}, function (next) {
				return accessToken.save(next);
			}, function (next) {
				return refreshToken.save(next);
			}], function (err) {
				if (err) return done(err);
				done(null, accessToken.value, refreshToken.value, {
					expires_in: tokenDuration
				});
			});
		});
	});
}));

server.exchange(_oauth2orize2['default'].exchange.refreshToken(function (client, token, done) {
	_modelsRefreshToken2['default'].findOne({ value: token }, function (err, refreshToken) {
		if (err || !refreshToken) return done(err, false);
		_modelsSession2['default'].findById(refreshToken.session, function (err, session) {
			if (err || !session) return done(err, false);
			var newAccessToken = new _modelsAccessToken2['default']();
			var newRefreshToken = new _modelsRefreshToken2['default']();
			var tokenDuration = session.tokenDuration;
			newAccessToken.session = newRefreshToken.session = session._id;
			newAccessToken.expirationDate = Date.now() + tokenDuration * 1000;
			_async2['default'].series([function (next) {
				return refreshToken.remove(next);
			}, function (next) {
				return newAccessToken.save(next);
			}, function (next) {
				return newRefreshToken.save(next);
			}], function (err) {
				if (err) return done(err);
				done(null, newAccessToken.value, newRefreshToken.value, {
					expires_in: tokenDuration
				});
			});
		});
	});
}));

setInterval(function () {
	_modelsAccessToken2['default'].find({ $lt: { expirationDate: Date.now() } }, function (err, results) {
		if (!err) {
			_async2['default'].each(results, function (accessToken, next) {
				accessToken.remove(next);
			});
		}
	});
}, _config2['default'].oauth2.token.removeExpiredInterval * 1000);
module.exports = exports['default'];
//# sourceMappingURL=../lib/oauth2.js.map