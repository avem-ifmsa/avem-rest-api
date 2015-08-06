'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _express = require('express');

var _jsonapify = require('jsonapify');

var _jsonapify2 = _interopRequireDefault(_jsonapify);

var _common = require('./common');

var common = _interopRequireWildcard(_common);

var _logger = require('../logger');

var logger = _interopRequireWildcard(_logger);

var _models = require('../models');

var clientResource = new _jsonapify.Resource(_models.Client, {
	'type': 'clients',
	'id': {
		value: new _jsonapify.Property('_id'),
		writable: false
	},
	'links': {
		'self': {
			value: new _jsonapify.Template('/clients/${_id}'),
			writable: false
		}
	},
	'attributes': {
		'name': new _jsonapify.Property('name'),
		'secret': new _jsonapify.Property('secret'),
		'trusted': new _jsonapify.Property('trusted'),
		'redirect-uri': {
			value: new _jsonapify.Property('redirectUri'),
			nullable: true
		}
	}
});

var router = (0, _express.Router)();

router.get('/', common.authenticate('token-bearer'), common.requirePrivilege('client:enum'), _jsonapify2['default'].enumerate(clientResource), logger.logErrors(), _jsonapify2['default'].errorHandler());

function clientTrustPrivilege(req, cb) {
	var id = req.params.id;
	var path = 'body.data.attributes.trusted';
	var trusted = _lodash2['default'].get(req, path);
	if (!trusted) return _lodash2['default'].defer(cb, null, false);
	_models.Client.findById(id, function (err, client) {
		if (err) return cb(err);
		if (!client) return cb(null, false);
		cb(null, client.trusted ? false : 'client:trust');
	});
}

router.post('/', common.authenticate('token-bearer'), common.requirePrivilege('client:add'), common.requirePrivilege(clientTrustPrivilege), _jsonapify2['default'].create(clientResource), logger.logErrors(), _jsonapify2['default'].errorHandler());

router.get('/:id', common.authenticate('token-bearer'), common.requirePrivilege('client:read'), _jsonapify2['default'].read([clientResource, _jsonapify2['default'].param('id')]), logger.logErrors(), _jsonapify2['default'].errorHandler());

router.put('/:id', common.authenticate('token-bearer'), common.requirePrivilege('client:edit'), common.requirePrivilege(clientTrustPrivilege), _jsonapify2['default'].update([clientResource, _jsonapify2['default'].param('id')]), logger.logErrors(), _jsonapify2['default'].errorHandler());

router['delete']('/:id', common.authenticate('token-bearer'), common.requirePrivilege('client:remove'), _jsonapify2['default'].remove([clientResource, _jsonapify2['default'].param('id')]), logger.logErrors(), _jsonapify2['default'].errorHandler());

exports['default'] = router;
exports.resource = clientResource;
//# sourceMappingURL=../../app/controllers/clients.js.map