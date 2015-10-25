import async from 'async';
import {Router} from 'express';
import jsonapify, {Resource, Runtime, Property, Template} from 'jsonapify';

import './clients';
import {Role} from '../models';
import * as common from './common';
import * as logger from '../logger';

const roleResource = new Resource(Role, {
	'type': 'roles',
	'id': {
		value: new Property('_id'),
		writable: false,
	},
	'links': {
		'self': {
			value: new Template('/roles/${_id}'),
			writable: false,
		},
	},
	'attributes': {
		'name': new Property('name'),
		'description': new Property('description'),
		'privileges': new Property('privileges'),
	},
});

Runtime.addResource('Role', roleResource);

const router = Router();

router.get('/',
	common.authenticate('token-bearer'),
	common.requirePrivilege('role:enum'),
	jsonapify.enumerate('Role'),
	logger.logErrors(), jsonapify.errorHandler());

router.post('/',
	common.authenticate('token-bearer'),
	common.requirePrivilege('role:add'),
	jsonapify.create('Role'),
	logger.logErrors(), jsonapify.errorHandler());

router.get('/:id',
	common.authenticate('token-bearer'),
	common.requirePrivilege('role:read'),
	jsonapify.read(['Role', jsonapify.param('id')]),
	logger.logErrors(), jsonapify.errorHandler());

router.put('/:id',
	common.authenticate('token-bearer'),
	common.requirePrivilege('role:edit'),
	jsonapify.update(['Role', jsonapify.param('id')]),
	logger.logErrors(), jsonapify.errorHandler());

router.delete('/:id',
	common.authenticate('token-bearer'),
	common.requirePrivilege('role:remove'),
	jsonapify.remove(['Role', jsonapify.param('id')]),
	logger.logErrors(), jsonapify.errorHandler());

export default router;
