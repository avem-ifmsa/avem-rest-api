import {Router} from 'express';
import jsonapify, {Resource, Property, Template, Ref} from 'jsonapify';

import * as common from './common';
import * as logger from '../logger';
import {Session} from '../models';
import {resource as userResource} from './users';
import {resource as clientResource} from './clients';

const sessionResource = new Resource(Session, {
	'type': 'sessions',
	'id': {
		value: new Property('_id'),
		writable: false,
	},
	'links': {
		'self': {
			value: new Template('/sessions/${_id}'),
			writable: false,
		},
	},
	'relationships': {
		'user': {
			value: new Ref(userResource, 'user'),
			writable: false,
		},
		'owner-client': {
			value: new Ref(clientResource, 'ownerClient'),
			writable: false,
		},
	},
});

var router = Router();

router.get('/',
	common.authenticate('token-bearer'),
	common.requirePrivilege('session:enum'),
	jsonapify.enumerate(sessionResource),
	logger.logErrors(), jsonapify.errorHandler());

function ifNotSessionOwner(priv) {
	return (req, callback) => {
		var user = req.auth.user.info;
		var sessionId = req.params.id;
		Session.findById(sessionId, (err, session) => {
			if (err || !session) return callback(err, false);
			callback(null, session.user.equals(user._id) ? false : priv);
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
	jsonapify.remove([sessionResource, jsonapify.param('id')]),
	logger.logErrors(), jsonapify.errorHandler());

export default router;
export { sessionResource as resource };
