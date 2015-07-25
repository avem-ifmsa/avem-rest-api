var async = require('async');
var express = require('express');
var jsonapify = require('jsonapify');

var common = require('./common');
var logger = require('../logger');
var AccessToken = require('../models/accessToken');
var RefreshToken = require('../models/refreshToken');
var sessionResource = require('./sessions').resource;

var refreshTokenResource = new jsonapify.Resource(RefreshToken, {
	'type': 'refresh-tokens',
	'id': {
		value: new jsonapify.Property('value'),
		writable: false,
	},
	'links': {
		'self': {
			value: new jsonapify.Template('/refresh-tokens/${value}'),
			writable: false,
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
	common.requirePrivilege('refresh-token:enum'),
	jsonapify.enumerate(refreshTokenResource),
	logger.logErrors(), jsonapify.errorHandler());

function ifNotTokenOwner(priv) {
	return function(req, cb) {
		async.parallel({
			accessToken: function(cb) {
				var token = common.extractAccessToken(req);
				AccessToken.findOne({ value: token }, cb);
			},
			refreshToken: function(cb) {
				var token = req.params.value;
				RefreshToken.findOne({ value: token }, cb);
			},
		}, function(err, results) {
			if (err) return cb(err);
			if (!results.accessToken) return cb(null, false);
			if (!results.refreshToken) return cb(null, false);
			var accessTokenSessionId = results.accessToken.session;
			var refreshTokenSessionId = results.refreshToken.session;
			var tokenOwner = refreshTokenSessionId.equals(accessTokenSessionId);
			cb(null, tokenOwner ? false : priv);
		});
	}
}

router.get('/:value',
	common.authenticate('token-bearer'),
	common.requirePrivilege(ifNotTokenOwner('refresh-token:read')),
	jsonapify.read([refreshTokenResource, { value: jsonapify.param('value') }]),
	logger.logErrors(), jsonapify.errorHandler());

router.delete('/:value',
	common.authenticate('token-bearer'),
	common.requirePrivilege(ifNotTokenOwner('refresh-token:remove')),
	jsonapify.delete([refreshTokenResource, { value: jsonapify.param('value') }]),
	logger.logErrors(), jsonapify.errorHandler());

module.exports = exports = router;
exports.resource = refreshTokenResource;
