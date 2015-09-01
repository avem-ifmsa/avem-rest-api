import async from 'async';
import {Router} from 'express';
import {Response} from 'jsonapify';

import * as common from './common';

const router = Router();

router.get('/', common.authenticate(['token-bearer', 'anonymous']),
	(req, res) => {
		const response = new Response(res);
		if (req.user) {
			async.parallel({
				user: async.constant(req.user),
				session: (next) => {
					common.currentSession(req, next);
				},
			}, (err, results) => {
				if (err) throw err;
				response.meta['authenticated'] = true;
				response.links['this-user'] = '/users/' + results.user._id;
				response.links['this-session'] = '/sessions/' + results.session._id;
				response.send();
			});
		} else {
			response.meta['authenticated'] = false;
			response.links['oauth2-token-url'] = '/oauth2/token';
			response.send();
		}
	});

export default router;
