import async from 'async';
import {Router} from 'express';
import jsonapify, {Resource, Property, Template, Ref} from 'jsonapify';

import * as common from './common';
import * as logger from '../logger';
import {AccessToken, RefreshToken} from '../models';
import {resource as sessionResource} from './sessions';

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
			value: new Ref(sessionResource, 'session'),
			writable: false,
		},
	},
});

const router = Router();

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
	jsonapify.remove([refreshTokenResource, { value: jsonapify.param('value') }]),
	logger.logErrors(), jsonapify.errorHandler());

export default router;
export { refreshTokenResource as resource };
