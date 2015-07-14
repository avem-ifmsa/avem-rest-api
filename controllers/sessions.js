var common = require('./common');
var express = require('express');
var logger = require('../logger');
var jsonapify = require('jsonapify');

var Session = require('../models/session');
var userResource = require('./users').Resource;
var clientResource = require('./clients').Resource;
var sessionResource = jsonapify.resource(Session, {
	type: 'sessions',
	id: {
		value: jsonapify.property('_id'),
		writable: false,
	},
	links: {
		self: {
			value: jsonapify.template('/sessions/{_id}'),
			writable: false,
		},
	},
	relationships: {
		user: {
			value: jsonapify.ref(userResource, 'user'),
			writable: false,
		},
		'owner-client': {
			value: jsonapify.ref(clientResource, 'ownerClient'),
			writable: false,
		},
	},
});

var router = express.Router();

router.get('/',
	common.authenticateWithAccessToken(),
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
	common.authenticateWithAccessToken(),
	common.requirePrivilege(ifNotSessionOwner('session:read')),
	jsonapify.read(sessionResource, jsonapify.param('id')),
	logger.logErrors(), jsonapify.errorHandler());

router.get('/:id',
	common.authenticateWithAccessToken(),
	common.requirePrivilege(ifNotSessionOwner('session:edit')),
	jsonapify.update(sessionResource, jsonapify.param('id')),
	logger.logErrors(), jsonapify.errorHandler());

router.delete('/:id',
	common.authenticateWithAccessToken(),
	common.requirePrivilege(ifNotSessionOwner('session:remove')),
	jsonapify.delete(sessionResource, jsonapify.param('id')),
	logger.logErrors(), jsonapify.errorHandler());

module.exports = exports = router;
exports.Resource = sessionResource;
