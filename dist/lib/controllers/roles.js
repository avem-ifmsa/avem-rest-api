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

var _clients = require('./clients');

var roleResource = new _jsonapify.Resource(_models.Role, {
	'type': 'roles',
	'id': {
		value: new _jsonapify.Property('_id'),
		writable: false
	},
	'links': {
		'self': {
			value: new _jsonapify.Template('/roles/${_id}'),
			writable: false
		}
	},
	'attributes': {
		'name': new _jsonapify.Property('name'),
		'description': new _jsonapify.Property('description'),
		'privileges': new _jsonapify.Property('privileges')
	}
});

var router = (0, _express.Router)();

router.get('/', common.authenticate('token-bearer'), common.requirePrivilege('role:enum'), _jsonapify2['default'].enumerate(roleResource), logger.logErrors(), _jsonapify2['default'].errorHandler());

router.post('/', common.authenticate('token-bearer'), common.requirePrivilege('role:add'), _jsonapify2['default'].create(roleResource), logger.logErrors(), _jsonapify2['default'].errorHandler());

router.get('/:id', common.authenticate('token-bearer'), common.requirePrivilege('role:read'), _jsonapify2['default'].read([roleResource, _jsonapify2['default'].param('id')]), logger.logErrors(), _jsonapify2['default'].errorHandler());

router.put('/:id', common.authenticate('token-bearer'), common.requirePrivilege('role:edit'), _jsonapify2['default'].update([roleResource, _jsonapify2['default'].param('id')]), logger.logErrors(), _jsonapify2['default'].errorHandler());

router['delete']('/:id', common.authenticate('token-bearer'), common.requirePrivilege('role:remove'), _jsonapify2['default'].remove([roleResource, _jsonapify2['default'].param('id')]), logger.logErrors(), _jsonapify2['default'].errorHandler());

exports['default'] = router;
exports.resource = roleResource;
//# sourceMappingURL=../../lib/controllers/roles.js.map