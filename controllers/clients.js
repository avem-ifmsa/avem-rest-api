var _ = require('lodash');
var express = require('express');
var jsonapify = require('jsonapify');

var common = require('./common');
var logger = require('../logger');
var Client = require('../models/client');

var clientResource = new jsonapify.Resource(Client, {
	'type': 'clients',
	'id': {
		value: new jsonapify.Property('_id'),
		writable: false,
	},
	'links': {
		'self': {
			value: new jsonapify.Template('/clients/${_id}'),
			writable: false,
		},
	},
	'attributes': {
		'name': new jsonapify.Property('name'),
		'secret': new jsonapify.Property('secret'),
		'trusted': new jsonapify.Property('trusted'),
		'redirect-uri': {
			value: new jsonapify.Property('redirectUri'),
			nullable: true,
		},
	},
});

var router = express.Router();

router.get('/',
	common.authenticate('token-bearer'),
	common.requirePrivilege('client:enum'),
	jsonapify.enumerate(clientResource),
	logger.logErrors(), jsonapify.errorHandler());

function clientTrustPrivilege(req, cb) {
	var id = req.params.id;
	var path = 'body.data.attributes.trusted';
	var trusted = _.get(req, path);
	if (!trusted) return _.defer(cb, null, false);
	Client.findById(id, function(err, client) {
		if (err) return cb(err);
		if (!client) return cb(null, false);
		cb(null, client.trusted ? false : 'client:trust');
	});
}

router.post('/',
	common.authenticate('token-bearer'),
	common.requirePrivilege('client:add'),
	common.requirePrivilege(clientTrustPrivilege),
	jsonapify.create(clientResource),
	logger.logErrors(), jsonapify.errorHandler());

router.get('/:id',
	common.authenticate('token-bearer'),
	common.requirePrivilege('client:read'),
	jsonapify.read([clientResource, jsonapify.param('id')]),
	logger.logErrors(), jsonapify.errorHandler());

router.put('/:id',
	common.authenticate('token-bearer'),
	common.requirePrivilege('client:edit'),
	common.requirePrivilege(clientTrustPrivilege),
	jsonapify.update([clientResource, jsonapify.param('id')]),
	logger.logErrors(), jsonapify.errorHandler());

router.delete('/:id',
	common.authenticate('token-bearer'),
	common.requirePrivilege('client:remove'),
	jsonapify.delete([clientResource, jsonapify.param('id')]),
	logger.logErrors(), jsonapify.errorHandler());

module.exports = exports = router;
exports.resource = clientResource;
