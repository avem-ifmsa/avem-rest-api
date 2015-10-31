import _ from 'lodash';
import {Router} from 'express';
import jsonapify, {Property, Ref, Resource, Runtime, Template} from 'jsonapify';

import './roles';

import {User} from '../models';
import * as common from './common';
import * as logger from '../logger';

const userResource = new Resource(User, {
	'type': 'users',
	'id': {
		value: new Property('_id'),
		writable: false,
	},
	'links': {
		'self': {
			value: new Template('/users/${_id}'),
			writable: false,
		},
	},
	'attributes': {
		'email': new Property('email'),
		'password': {
			value: new Property('password'),
			readable: false,
		},
	},
	'relationships': {
		'role': new Ref('Role', 'role'),
	},
});

Runtime.addResource('User', userResource);

const router = Router();

router.get('/',
	common.authenticate('token-bearer'),
	common.requirePrivilege('user:enum'),
	jsonapify.enumerate('User'),
	logger.logErrors(), jsonapify.errorHandler());

router.post('/',
	common.authenticate('token-bearer'),
	common.requirePrivilege('user:add'),
	jsonapify.create('User'),
	logger.logErrors(), jsonapify.errorHandler());

router.get('/:id',
	common.authenticate('token-bearer'),
	jsonapify.read(['User', jsonapify.param('id')]),
	logger.logErrors(), jsonapify.errorHandler());

router.put('/:id',
	common.authenticate('token-bearer'),
	common.requirePrivilege(userEditPrivilege),
	jsonapify.update(['User', jsonapify.param('id')]),
	logger.logErrors(), jsonapify.errorHandler());

router.delete('/:id',
	common.authenticate('token-bearer'),
	common.requirePrivilege(ifNotSelf('user:remove')),
	jsonapify.remove(['User', jsonapify.param('id')]),
	logger.logErrors(), jsonapify.errorHandler());

export default router;

function userEditPrivilege(req) {
	let user = req.auth.user.info;
	if (!user) return false;
	if (userIsSelf(req) && !userRoleChanged(req)) return false;
	return 'user:edit';
}

function ifNotSelf(priv) {
	return req => {
		let user = req.auth.user.info;
		if (!user || userIsSelf(req, user)) return false;
		return priv;
	};
}

function userRoleChanged(req, user) {
	let userRole = user.role;
	if (req.method === 'put')
		userRole = _.get(req.body, 'data.relationships.role.id');
	return !user.role.equals(userRole);
}

function userIsSelf(req, user) {
	let userId = req.params.id;
	return user._id.equals(userId);
}
