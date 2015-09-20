import async from 'async';
import {Router} from 'express';
import jsonapify, {Resource, Runtime, Property, Template, Ref} from 'jsonapify';

import './sessions';
import * as common from './common';
import * as logger from '../logger';
import {AccessToken, RefreshToken} from '../models';

const refreshTokenResource = new Resource(RefreshToken, {
	'type': 'refresh-tokens',
	'id': {
		value: new Property('value'),
		writable: false,
	},
	'links': {
		'self': {
			value: new Template('/refresh-tokens/${value}'),
			writable: false,
		},
	},
	'relationships': {
		'session': {
			value: new Ref('Session', 'session'),
			writable: false,
		},
	},
});

Runtime.addResource('RefreshToken', refreshTokenResource);

const router = Router();

router.get('/',
	common.authenticate('token-bearer'),
	common.requirePrivilege('refresh-token:enum'),
	jsonapify.enumerate('RefreshToken'),
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
	jsonapify.read(['RefreshToken', { value: jsonapify.param('value') }]),
	logger.logErrors(), jsonapify.errorHandler());

router.delete('/:value',
	common.authenticate('token-bearer'),
	common.requirePrivilege(ifNotTokenOwner('refresh-token:remove')),
	jsonapify.remove(['RefreshToken', { value: jsonapify.param('value') }]),
	logger.logErrors(), jsonapify.errorHandler());

export default router;
