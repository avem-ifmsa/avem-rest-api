var common = require('./common');
var express = require('express');
var logger = require('../logger');
var jsonapify = require('jsonapify');

var AccessToken = require('../models/accessToken');
var sessionResource = require('./sessions').Resource;
var accessTokenResource = jsonapify.resource(AccessToken, {
	type: 'access-tokens',
	id: {
		value: jsonapify.property('value'),
		writable: false,
	},
	links: {
		self: {
			value: jsonapify.template('/access-tokens/{value}'),
			writable: false,
		},
	},
	attributes: {
		expires: {
			value: jsonapify.property('expires'),
			writable: false,
		},
		expired: {
			value: jsonapify.property('expired'),
			writable: false,
		},
		'expiration-date': {
			value: jsonapify.property('expirationDate'),
			nullable: true,
		},
	},
	relationships: {
		session: {
			value: jsonapify.ref(sessionResource, 'session'),
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
	jsonapify.read(accessTokenResource, { value: jsonapify.param('value') }),
	logger.logErrors(), jsonapify.errorHandler());

router.delete('/:value',
	common.authenticate('token-bearer'),
	common.requirePrivilege(ifNotTokenOwner('access-token:remove')),
	jsonapify.delete(accessTokenResource, { value: jsonapify.param('value') }),
	logger.logErrors(), jsonapify.errorHandler());

module.exports = exports = router;
exports.Resource = accessTokenResource;
