var async = require('async');
var express = require('express');
var jsonapify = require('jsonapify');

var common = require('./common');
var logger = require('../logger');
var Role = require('../models/role');
var clientResource = require('./clients').resource;

var roleResource = new jsonapify.Resource(Role, {
	'type': 'roles',
	'id': {
		value: new jsonapify.Property('_id'),
		writable: false,
	},
	'links': {
		'self': {
			value: new jsonapify.Template('/roles/${_id}'),
			writable: false,
		},
	},
	'attributes': {
		'name': new jsonapify.Property('name'),
		'description': new jsonapify.Property('description'),
		'privileges': new jsonapify.Property('privileges'),
	},
});

var router = express.Router();

router.get('/',
	common.authenticate('token-bearer'),
	common.requirePrivilege('role:enum'),
	jsonapify.enumerate(roleResource),
	logger.logErrors(), jsonapify.errorHandler());

router.post('/',
	common.authenticate('token-bearer'),
	common.requirePrivilege('role:add'),
	jsonapify.create(roleResource),
	logger.logErrors(), jsonapify.errorHandler());

router.get('/:id',
	common.authenticate('token-bearer'),
	common.requirePrivilege('role:read'),
	jsonapify.read([roleResource, jsonapify.param('id')]),
	logger.logErrors(), jsonapify.errorHandler());

router.put('/:id',
	common.authenticate('token-bearer'),
	common.requirePrivilege('role:edit'),
	jsonapify.update([roleResource, jsonapify.param('id')]),
	logger.logErrors(), jsonapify.errorHandler());

router.delete('/:id',
	common.authenticate('token-bearer'),
	common.requirePrivilege('role:remove'),
	jsonapify.update([roleResource, jsonapify.param('id')]),
	logger.logErrors(), jsonapify.errorHandler());

module.exports = exports = router;
exports.resource = roleResource;
