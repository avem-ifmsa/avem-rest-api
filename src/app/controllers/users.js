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

function userIsSelf(req) {
	let id = req.params.id;
	let user = req.auth.user.info;
	return user._id.equals(id);
}

function ifNotSelf(priv) {
	return (req) => {
		return !userIsSelf(req) ? priv : false;
	};
}

function userEditRolePrivilege(req) {
	let user = req.auth.user.info;
	if (!user) return false;
	let newRole = user.role;
	if (req.method === 'put')
		newRole = _.get(req.body, 'data.relationships.role.id');
	var sameRole = user.role.equals(newRole);
	return sameRole ? false : 'user:edit-role';
}

function userEditPrivilege(req) {
	if (!userIsSelf(req)) return 'user:edit';
	return userEditRolePrivilege(req);
}

export default router;
