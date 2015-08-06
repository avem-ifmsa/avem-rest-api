import async from 'async';
import jsonapify from 'jsonapify';

import * as auth from '../authority';
import passport from '../passport';
import {Session, AccessToken} from '../models';

export function authenticate(methods) {
	return [
		passport.authenticate(methods, { session: false }),
		auth.identify(),
	];
}

export function requirePrivilege(priv) {
	return auth.requirePrivilege(priv, {
		onAccessDenied: sendAccessDenied,
	});
	
	function sendAccessDenied(req, res, next) {
		next(new jsonapify.errors.HttpError(403));
	}
}

export function currentSession(req, callback) {
	var token = extractAccessToken(req);
	async.waterfall([
		(next) => {
			AccessToken.findOne({ value: token }, next);
		},
		(accessToken, next) => {
			if (!accessToken) return next('break', null);
			Session.findById(accessToken.session, next);
		},
	], callback);
}

export function extractAccessToken(req) {
	var token = extractFromHeaders(req);
	if (!token) token = extractFromBody(req);
	if (!token) token = extractFromQuery(req);
	return token;
	
	function extractFromHeaders(req) {
		var authHeader = req.headers.authorization;
		if (!authHeader)
			return undefined;
		var authData = authHeader.split(' ');
		if (authData.length !== 2 || authData[0] !== 'Bearer')
			return undefined;
		return authData[1];
	}
	
	function extractFromBody(req) {
		return req.body['access_token'];
	}
	
	function extractFromQuery(req) {
		return req.body['access_token'];
	}
}
