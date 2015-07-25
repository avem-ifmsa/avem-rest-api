var express = require('express');
var jsonapify = require('jsonapify');

var common = require('./common');
var logger = require('../logger');
var AccessToken = require('../models/accessToken');
var sessionResource = require('./sessions').resource;

var accessTokenResource = new jsonapify.Resource(AccessToken, {
	'type': 'access-tokens',
	'id': {
		value: new jsonapify.Property('value'),
		writable: false,
	},
	'links': {
		'self': {
			value: new jsonapify.Template('/access-tokens/${value}'),
			writable: false,
		},
	},
	'attributes': {
		'expires': {
			value: new jsonapify.Property('expires'),
			writable: false,
		},
		'expired': {
			value: new jsonapify.Property('expired'),
			writable: false,
		},
		'expiration-date': {
			value: new jsonapify.Property('expirationDate'),
			nullable: true,
		},
	},
	'relationships': {
		'session': {
			value: new jsonapify.Ref(sessionResource, 'session'),
			writable: false,
		},
	},
});

var router = express.Router();

router.get('/',
	common.authenticate('token-bearer'),
	common.requirePrivilege('access-token:enum'),
	jsonapify.enumerate(accessTokenResource),
	logger.logErrors(), jsonapify.errorHandler());

function ifNotTokenOwner(priv) {
	return function(req) {
		var token = req.params.value;
		var bearer = common.extractAccessToken(req);
		return token !== bearer ? priv : false;
	};
}

router.get('/:value',
	common.authenticate('token-bearer'),
	common.requirePrivilege(ifNotTokenOwner('access-token:read')),
	jsonapify.read([accessTokenResource, { value: jsonapify.param('value') }]),
	logger.logErrors(), jsonapify.errorHandler());

router.delete('/:value',
	common.authenticate('token-bearer'),
	common.requirePrivilege(ifNotTokenOwner('access-token:remove')),
	jsonapify.delete([accessTokenResource, { value: jsonapify.param('value') }]),
	logger.logErrors(), jsonapify.errorHandler());

module.exports = exports = router;
exports.resource = accessTokenResource;
