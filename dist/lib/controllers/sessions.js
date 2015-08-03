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

var _users = require('./users');

var _clients = require('./clients');

var sessionResource = new _jsonapify.Resource(_models.Session, {
	'type': 'sessions',
	'id': {
		value: new _jsonapify.Property('_id'),
		writable: false
	},
	'links': {
		'self': {
			value: new _jsonapify.Template('/sessions/${_id}'),
			writable: false
		}
	},
	'relationships': {
		'user': {
			value: new _jsonapify.Ref(_users.resource, 'user'),
			writable: false
		},
		'owner-client': {
			value: new _jsonapify.Ref(_clients.resource, 'ownerClient'),
			writable: false
		}
	}
});

var router = (0, _express.Router)();

router.get('/', common.authenticate('token-bearer'), common.requirePrivilege('session:enum'), _jsonapify2['default'].enumerate(sessionResource), logger.logErrors(), _jsonapify2['default'].errorHandler());

function ifNotSessionOwner(priv) {
	return function (req, callback) {
		var user = req.auth.user.info;
		var sessionId = req.params.id;
		_models.Session.findById(sessionId, function (err, session) {
			if (err || !session) return callback(err, false);
			callback(null, session.user.equals(user._id) ? false : priv);
		});
	};
}

router.get('/:id', common.authenticate('token-bearer'), common.requirePrivilege(ifNotSessionOwner('session:read')), _jsonapify2['default'].read([sessionResource, _jsonapify2['default'].param('id')]), logger.logErrors(), _jsonapify2['default'].errorHandler());

router.get('/:id', common.authenticate('token-bearer'), common.requirePrivilege(ifNotSessionOwner('session:edit')), _jsonapify2['default'].update([sessionResource, _jsonapify2['default'].param('id')]), logger.logErrors(), _jsonapify2['default'].errorHandler());

router['delete']('/:id', common.authenticate('token-bearer'), common.requirePrivilege(ifNotSessionOwner('session:remove')), _jsonapify2['default'].remove([sessionResource, _jsonapify2['default'].param('id')]), logger.logErrors(), _jsonapify2['default'].errorHandler());

exports['default'] = router;
exports.resource = sessionResource;
//# sourceMappingURL=../../lib/controllers/sessions.js.map