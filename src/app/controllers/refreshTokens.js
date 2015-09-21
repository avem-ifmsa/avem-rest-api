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

function ifNotTokenOwner(priv) {
	return (req, done) => {
		async.parallel({
			accessToken: next => {
				let token = common.extractAccessToken(req);
				AccessToken.findOne({ value: token }, next);
			},
			refreshToken: next => {
				let token = req.params.value;
				RefreshToken.findOne({ value: token }, next);
			},
		}, (err, results) => {
			if (err) return done(err);
			if (!results.accessToken) return done(null, false);
			if (!results.refreshToken) return done(null, false);
			let accessTokenSessid = results.accessToken.session;
			let refreshTokenSessid = results.refreshToken.session;
			let isTokenOwner = refreshTokenSessid.equals(accessTokenSessid);
			done(null, isTokenOwner ? false : priv);
		});
	};
}

export default router;
