import async from 'async';
import {Router} from 'express';
import jsonapify, {Response} from 'jsonapify';

import * as common from './common';

const router = Router();

router.get('/',
	common.authenticate(['token-bearer', 'anonymous']),
	(req, res, next) => {
		req.user ? authenticatedResponse(req, res, next)
		         : unauthenticatedResponse(req, res, next);
	},
	jsonapify.errorHandler());

function authenticatedResponse(req, res, next) {
	let response = new Response(res);
	async.parallel({
		user: async.constant(req.user),
		session: next => {
			common.currentSession(req, next);
		},
	}, (err, results) => {
		if (err) return next(err);
		response.meta['authenticated'] = true;
		response.links['this-user'] = '/users' + results.user._id;
		response.links['this-session'] = '/sessions/' + results.session._id;
		response.send();
	});
}

function unauthenticatedResponse(req, response) {
	response.meta['authenticated'] = false;
	response.links['oauth2-token-url'] = '/oauth2/token';
	response.send();
}

export default router;
