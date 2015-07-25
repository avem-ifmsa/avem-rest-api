var express = require('express');
var jsonapify = require('jsonapify');

var common = require('./common');
var logger = require('../logger');
var Session = require('../models/session');
var userResource = require('./users').resource;
var clientResource = require('./clients').resource;

var sessionResource = new jsonapify.Resource(Session, {
	'type': 'sessions',
	'id': {
		value: new jsonapify.Property('_id'),
		writable: false,
	},
	'links': {
		'self': {
			value: new jsonapify.Template('/sessions/${_id}'),
			writable: false,
		},
	},
	'relationships': {
		'user': {
			value: new jsonapify.Ref(userResource, 'user'),
			writable: false,
		},
		'owner-client': {
			value: new jsonapify.Ref(clientResource, 'ownerClient'),
			writable: false,
		},
	},
});

var router = express.Router();

router.get('/',
	common.authenticate('token-bearer'),
	common.requirePrivilege('session:enum'),
	jsonapify.enumerate(sessionResource),
	logger.logErrors(), jsonapify.errorHandler());

function ifNotSessionOwner(priv) {
	return function(req, cb) {
		var user = req.auth.user.info;
		var sessionId = req.params.id;
		Session.findById(sessionId, function(err, session) {
			if (err || !session) return cb(err, false);
			cb(null, session.user !== user._id ? priv : false);
		});
	};
}

router.get('/:id',
	common.authenticate('token-bearer'),
	common.requirePrivilege(ifNotSessionOwner('session:read')),
	jsonapify.read([sessionResource, jsonapify.param('id')]),
	logger.logErrors(), jsonapify.errorHandler());

router.get('/:id',
	common.authenticate('token-bearer'),
	common.requirePrivilege(ifNotSessionOwner('session:edit')),
	jsonapify.update([sessionResource, jsonapify.param('id')]),
	logger.logErrors(), jsonapify.errorHandler());

router.delete('/:id',
	common.authenticate('token-bearer'),
	common.requirePrivilege(ifNotSessionOwner('session:remove')),
	jsonapify.delete([sessionResource, jsonapify.param('id')]),
	logger.logErrors(), jsonapify.errorHandler());

module.exports = exports = router;
exports.resource = sessionResource;
