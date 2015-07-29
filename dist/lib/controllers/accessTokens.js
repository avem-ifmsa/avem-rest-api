'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _express = require('express');

var _jsonapify = require('jsonapify');

var _jsonapify2 = _interopRequireDefault(_jsonapify);

var _common = require('./common');

var common = _interopRequireWildcard(_common);

var _logger = require('../logger');

var logger = _interopRequireWildcard(_logger);

var _models = require('../models');

var _sessions = require('./sessions');

var accessTokenResource = new _jsonapify.Resource(_models.AccessToken, {
	'type': 'access-tokens',
	'id': {
		value: new _jsonapify.Property('value'),
		writable: false
	},
	'links': {
		'self': {
			value: new _jsonapify.Template('/access-tokens/${value}'),
			writable: false
		}
	},
	'attributes': {
		'expires': {
			value: new _jsonapify.Property('expires'),
			writable: false
		},
		'expired': {
			value: new _jsonapify.Property('expired'),
			writable: false
		},
		'expiration-date': {
			value: new _jsonapify.Property('expirationDate'),
			nullable: true
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

router.get('/', common.authenticate('token-bearer'), common.requirePrivilege('access-token:enum'), _jsonapify2['default'].enumerate(accessTokenResource), logger.logErrors(), _jsonapify2['default'].errorHandler());

function ifNotTokenOwner(priv) {
	return function (req) {
		var token = req.params.value;
		var bearer = common.extractAccessToken(req);
		return token !== bearer ? priv : false;
	};
}

router.get('/:value', common.authenticate('token-bearer'), common.requirePrivilege(ifNotTokenOwner('access-token:read')), _jsonapify2['default'].read([accessTokenResource, { value: _jsonapify2['default'].param('value') }]), logger.logErrors(), _jsonapify2['default'].errorHandler());

router['delete']('/:value', common.authenticate('token-bearer'), common.requirePrivilege(ifNotTokenOwner('access-token:remove')), _jsonapify2['default'].remove([accessTokenResource, { value: _jsonapify2['default'].param('value') }]), logger.logErrors(), _jsonapify2['default'].errorHandler());

exports['default'] = router;
exports.resource = accessTokenResource;
//# sourceMappingURL=../../lib/controllers/accessTokens.js.map