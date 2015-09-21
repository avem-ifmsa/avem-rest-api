import {Router} from 'express';
import jsonapify, {Resource, Runtime, Property, Template, Refs} from 'jsonapify';

import './mbMembers';
import * as common from './common';
import * as logger from '../logger';
import {Activity, Member} from '../models';

const activityResource = new Resource(Activity, {
	'type': 'activities',
	'id': {
		value: new Property('_id'),
		writable: false,
	},
	'links': {
		'self': {
			value: new Template('/activities/${_id}'),
			writable: false,
		},
	},
	'attributes': {
		'name': new Property('name'),
		'description': {
			value: new Property('description'),
			nullable: true,
		},
		'category': {
			value: new Property('category'),
			nullable: true,
		},
		'points': new Property('points'),
	},
	'relationships': {
		'organized-by': new Refs('MbMember', 'organizedBy'),
	},
});

Runtime.addResource('Activity', activityResource);

const router = Router();

router.get('/',
	common.authenticate('token-bearer'),
	jsonapify.enumerate('Activity'),
	logger.logErrors(), jsonapify.errorHandler());

router.post('/',
	common.authenticate('token-bearer'),
	common.requirePrivilege('activity:create'),
	jsonapify.create('Activity'),
	logger.logErrors(), jsonapify.errorHandler());

router.get('/:id',
	common.authenticate('token-bearer'),
	jsonapify.read(['Activity', jsonapify.param('id')]),
	logger.logErrors(), jsonapify.errorHandler());

router.put('/:id',
	common.authenticate('token-bearer'),
	common.requirePrivilege('activity:edit'),
	jsonapify.update(['Activity', jsonapify.param('id')]),
	logger.logErrors(), jsonapify.errorHandler());

router.delete('/:id',
	common.authenticate('token-bearer'),
	common.requirePrivilege('activity:remove'),
	jsonapify.remove(['Activity', jsonapify.param('id')]),
	logger.logErrors(), jsonapify.errorHandler());

export default router;
