'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _async = require('async');

var _async2 = _interopRequireDefault(_async);

var _express = require('express');

var _jsonapify = require('jsonapify');

var _jsonapify2 = _interopRequireDefault(_jsonapify);

var _common = require('./common');

var common = _interopRequireWildcard(_common);

var _logger = require('../logger');

var logger = _interopRequireWildcard(_logger);

var _models = require('../models');

var _sessions = require('./sessions');

var refreshTokenResource = new _jsonapify.Resource(_models.RefreshToken, {
	'type': 'refresh-tokens',
	'id': {
		value: new _jsonapify.Property('value'),
		writable: false
	},
	'links': {
		'self': {
			value: new _jsonapify.Template('/refresh-tokens/${value}'),
			writable: false
		}
	},
	'relationships': {
		'session': {
			value: new _jsonapify.Ref(_sessions.resource, 'session'),
			writable: false
		}
	}
});

var router = (0, _express.Router)();

router.get('/', common.authenticate('token-bearer'), common.requirePrivilege('refresh-token:enum'), _jsonapify2['default'].enumerate(refreshTokenResource), logger.logErrors(), _jsonapify2['default'].errorHandler());

function ifNotTokenOwner(priv) {
	return function (req, cb) {
		_async2['default'].parallel({
			accessToken: function accessToken(cb) {
				var token = common.extractAccessToken(req);
				_models.AccessToken.findOne({ value: token }, cb);
			},
			refreshToken: function refreshToken(cb) {
				var token = req.params.value;
				_models.RefreshToken.findOne({ value: token }, cb);
			}
		}, function (err, results) {
			if (err) return cb(err);
			if (!results.accessToken) return cb(null, false);
			if (!results.refreshToken) return cb(null, false);
			var accessTokenSessionId = results.accessToken.session;
			var refreshTokenSessionId = results.refreshToken.session;
			var tokenOwner = refreshTokenSessionId.equals(accessTokenSessionId);
			cb(null, tokenOwner ? false : priv);
		});
	};
}

router.get('/:value', common.authenticate('token-bearer'), common.requirePrivilege(ifNotTokenOwner('refresh-token:read')), _jsonapify2['default'].read([refreshTokenResource, { value: _jsonapify2['default'].param('value') }]), logger.logErrors(), _jsonapify2['default'].errorHandler());

router['delete']('/:value', common.authenticate('token-bearer'), common.requirePrivilege(ifNotTokenOwner('refresh-token:remove')), _jsonapify2['default'].remove([refreshTokenResource, { value: _jsonapify2['default'].param('value') }]), logger.logErrors(), _jsonapify2['default'].errorHandler());

exports['default'] = router;
exports.resource = refreshTokenResource;
//# sourceMappingURL=../../app/controllers/refreshTokens.js.map