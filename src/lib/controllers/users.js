import {Router} from 'express';
import jsonapify, {Resource, Property, Template, Ref} from 'jsonapify';

import * as common from './common';
import * as logger from '../logger';
import {User} from '../models';
import {resource as roleResource} from './roles';

var userResource = new Resource(User, {
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
		'role': new Ref(roleResource, 'role'),
	},
});

var router = Router();

router.get('/',
	common.authenticate('token-bearer'),
	common.requirePrivilege('user:enum'),
	jsonapify.enumerate(userResource),
	logger.logErrors(), jsonapify.errorHandler());

router.post('/',
	common.authenticate('token-bearer'),
	common.requirePrivilege('user:add'),
	jsonapify.create(userResource),
	logger.logErrors(), jsonapify.errorHandler());

function userIsSelf(req) {
	var id = req.params.id;
	var user = req.auth.user.info;
	return user._id === id;
}

function ifNotSelf(priv) {
	return (req) => {
		return !userIsSelf(req) ? priv : false;
	};
}

function userEditRolePrivilege(req) {
	var user = req.auth.user.info;
	var path = 'body.data.relationships.role.id';
	var newUserRole = _.get(req, path);
	if (!user || !newUserRole) return false;
	var sameRole = user.role.equals(newUserRole);
	return sameRole ? false : 'user:edit-role';
}

function userEditPrivilege(req) {
	if (!userIsSelf(req)) return 'user:edit';
	return userEditRolePrivilege(req);
}

router.get('/:id',
	common.authenticate('token-bearer'),
	common.requirePrivilege(userEditPrivilege),
	jsonapify.read([userResource, jsonapify.param('id')]),
	logger.logErrors(), jsonapify.errorHandler());

router.put('/:id',
	common.authenticate('token-bearer'),
	common.requirePrivilege(userEditPrivilege),
	jsonapify.update([userResource, jsonapify.param('id')]),
	logger.logErrors(), jsonapify.errorHandler());

router.delete('/:id',
	common.authenticate('token-bearer'),
	common.requirePrivilege(ifNotSelf('user:remove')),
	jsonapify.remove([userResource, jsonapify.param('id')]),
	logger.logErrors(), jsonapify.errorHandler());

export default router;
export { userResource as resource };
