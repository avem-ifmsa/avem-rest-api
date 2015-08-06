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

var _roles = require('./roles');

var userResource = new _jsonapify.Resource(_models.User, {
	'type': 'users',
	'id': {
		value: new _jsonapify.Property('_id'),
		writable: false
	},
	'links': {
		'self': {
			value: new _jsonapify.Template('/users/${_id}'),
			writable: false
		}
	},
	'attributes': {
		'email': new _jsonapify.Property('email'),
		'password': {
			value: new _jsonapify.Property('password'),
			readable: false
		}
	},
	'relationships': {
		'role': new _jsonapify.Ref(_roles.resource, 'role')
	}
});

var router = (0, _express.Router)();

router.get('/', common.authenticate('token-bearer'), common.requirePrivilege('user:enum'), _jsonapify2['default'].enumerate(userResource), logger.logErrors(), _jsonapify2['default'].errorHandler());

router.post('/', common.authenticate('token-bearer'), common.requirePrivilege('user:add'), _jsonapify2['default'].create(userResource), logger.logErrors(), _jsonapify2['default'].errorHandler());

function userIsSelf(req) {
	var id = req.params.id;
	var user = req.auth.user.info;
	return user._id === id;
}

function ifNotSelf(priv) {
	return function (req) {
		return !userIsSelf(req) ? priv : false;
	};
}

function userEditRolePrivilege(req) {
	var user = req.auth.user.info;
	var path = 'body.data.relationships.role.id';
	var newUserRole = _.get(req, path);
	if (!user || !newUserRole) return false;
	var sameRole = user.role.equals(newUserRole);
	return sameRole ? false : 'user:edit-role';
}

function userEditPrivilege(req) {
	if (!userIsSelf(req)) return 'user:edit';
	return userEditRolePrivilege(req);
}

router.get('/:id', common.authenticate('token-bearer'), common.requirePrivilege(userEditPrivilege), _jsonapify2['default'].read([userResource, _jsonapify2['default'].param('id')]), logger.logErrors(), _jsonapify2['default'].errorHandler());

router.put('/:id', common.authenticate('token-bearer'), common.requirePrivilege(userEditPrivilege), _jsonapify2['default'].update([userResource, _jsonapify2['default'].param('id')]), logger.logErrors(), _jsonapify2['default'].errorHandler());

router['delete']('/:id', common.authenticate('token-bearer'), common.requirePrivilege(ifNotSelf('user:remove')), _jsonapify2['default'].remove([userResource, _jsonapify2['default'].param('id')]), logger.logErrors(), _jsonapify2['default'].errorHandler());

exports['default'] = router;
exports.resource = userResource;
//# sourceMappingURL=../../app/controllers/users.js.map