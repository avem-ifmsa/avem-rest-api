import _ from 'lodash';
import {Router} from 'express';
import jsonapify, {Resource, Runtime, Template, Property} from 'jsonapify';

import * as common from './common';
import * as logger from '../logger';
import {Client} from '../models';

const clientResource = new Resource(Client, {
	'type': 'clients',
	'id': {
		value: new Property('_id'),
		writable: false,
	},
	'links': {
		'self': {
			value: new Template('/clients/${_id}'),
			writable: false,
		},
	},
	'attributes': {
		'name': new Property('name'),
		'trusted': new Property('trusted'),
		'secret': {
			value: new Property('secret'),
			writable: false,
		},
		'redirect-uri': {
			value: new Property('redirectUri'),
			nullable: true,
		},
	},
});

Runtime.addResource('Client', clientResource);

const router = Router();

router.get('/',
	common.authenticate('token-bearer'),
	common.requirePrivilege('client:enum'),
	jsonapify.enumerate('Client'),
	logger.logErrors(), jsonapify.errorHandler());

router.post('/',
	common.authenticate('token-bearer'),
	common.requirePrivilege('client:add'),
	common.requirePrivilege(clientTrustPrivilege),
	jsonapify.create('Client'),
	logger.logErrors(), jsonapify.errorHandler());

router.get('/:id',
	common.authenticate('token-bearer'),
	common.requirePrivilege('client:read'),
	jsonapify.read(['Client', jsonapify.param('id')]),
	logger.logErrors(), jsonapify.errorHandler());

router.put('/:id',
	common.authenticate('token-bearer'),
	common.requirePrivilege('client:edit'),
	common.requirePrivilege(clientTrustPrivilege),
	jsonapify.update(['Client', jsonapify.param('id')]),
	logger.logErrors(), jsonapify.errorHandler());

router.delete('/:id',
	common.authenticate('token-bearer'),
	common.requirePrivilege('client:remove'),
	jsonapify.remove(['Client', jsonapify.param('id')]),
	logger.logErrors(), jsonapify.errorHandler());

function clientTrustPrivilege(req, cb) {
	let id = req.params.id;
	let newTrusted = false;
	if (req.method === 'post' || req.method === 'put')
		newTrusted = _.get(req.body, 'data.attributes.trusted');
	if (!newTrusted) return cb(null, false);
	Client.findById(id, function(err, client) {
		if (err) return cb(err);
		if (!client) return cb(null, false);
		cb(null, client.trusted ? false : 'client:trust');
	});
}

export default router;
