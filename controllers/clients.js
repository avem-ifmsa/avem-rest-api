var _ = require('lodash');
var common = require('./common');
var express = require('express');
var logger = require('../logger');
var jsonapify = require('jsonapify');

var Client = require('../models/client');
var clientResource = jsonapify.resource(Client, {
	type: 'clients',
	id: {
		value: jsonapify.property('_id'),
		writable: false,
	},
	links: {
		self: {
			value: jsonapify.template('/clients/{_id}'),
			writable: false,
		},
	},
	attributes: {
		name: jsonapify.property('name'),
		secret: jsonapify.property('secret'),
		trusted: jsonapify.property('trusted'),
		'redirect-uri': {
			value: jsonapify.property('redirectUri'),
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
	jsonapify.read(clientResource, jsonapify.param('id')),
	logger.logErrors(), jsonapify.errorHandler());

router.put('/:id',
	common.authenticate('token-bearer'),
	common.requirePrivilege('client:edit'),
	common.requirePrivilege(clientTrustPrivilege),
	jsonapify.update(clientResource, jsonapify.param('id')),
	logger.logErrors(), jsonapify.errorHandler());

router.delete('/:id',
	common.authenticate('token-bearer'),
	common.requirePrivilege('client:remove'),
	jsonapify.delete(clientResource, jsonapify.param('id')),
	logger.logErrors(), jsonapify.errorHandler());

module.exports = exports = router;
exports.Resource = clientResource;
