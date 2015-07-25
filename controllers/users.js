var express = require('express');
var jsonapify = require('jsonapify');

var common = require('./common');
var logger = require('../logger');
var User = require('../models/user');
var roleResource = require('./roles').resource;

var userResource = new jsonapify.Resource(User, {
	'type': 'users',
	'id': {
		value: new jsonapify.Property('_id'),
		writable: false,
	},
	'links': {
		'self': {
			value: new jsonapify.Template('/users/${_id}'),
			writable: false,
		},
	},
	'attributes': {
		'email': new jsonapify.Property('email'),
		'password': {
			value: new jsonapify.Property('password'),
			readable: false,
		},
	},
	'relationships': {
		'role': new jsonapify.Ref(roleResource, 'role'),
	},
});

var router = express.Router();

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
	return function(req) {
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
	jsonapify.delete([userResource, jsonapify.param('id')]),
	logger.logErrors(), jsonapify.errorHandler());

module.exports = exports = router;
exports.resource = userResource;
