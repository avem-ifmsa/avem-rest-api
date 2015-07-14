var async = require('async');
var common = require('./common');
var express = require('express');
var logger = require('../logger');
var jsonapify = require('jsonapify');

var Role = require('../models/role');
var clientResource = require('./clients').Resource;
var roleResource = jsonapify.resource(Role, {
	type: 'roles',
	id: {
		value: jsonapify.property('_id'),
		writable: false,
	},
	links: {
		self: {
			value: jsonapify.template('/roles/{_id}'),
			writable: false,
		},
	},
	attributes: {
		name: jsonapify.property('name'),
		description: jsonapify.property('description'),
		privileges: jsonapify.property('privileges'),
	},
});

var router = express.Router();

router.get('/',
	common.authenticateWithAccessToken(),
	common.requirePrivilege('role:enum'),
	jsonapify.enumerate(roleResource),
	logger.logErrors(), jsonapify.errorHandler());

router.post('/',
	common.authenticateWithAccessToken(),
	common.requirePrivilege('role:add'),
	jsonapify.create(roleResource),
	logger.logErrors(), jsonapify.errorHandler());

router.get('/:id',
	common.authenticateWithAccessToken(),
	common.requirePrivilege('role:read'),
	jsonapify.read(roleResource, jsonapify.param('id')),
	logger.logErrors(), jsonapify.errorHandler());

router.put('/:id',
	common.authenticateWithAccessToken(),
	common.requirePrivilege('role:edit'),
	jsonapify.update(roleResource, jsonapify.param('id')),
	logger.logErrors(), jsonapify.errorHandler());

router.delete('/:id',
	common.authenticateWithAccessToken(),
	common.requirePrivilege('role:remove'),
	jsonapify.update(roleResource, jsonapify.param('id')),
	logger.logErrors(), jsonapify.errorHandler());

module.exports = exports = router;
exports.Resource = roleResource;
