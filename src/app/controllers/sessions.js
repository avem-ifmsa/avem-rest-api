import {Router} from 'express';
import jsonapify, {Resource, Runtime, Property, Template, Ref} from 'jsonapify';

import './users';
import './clients';

import * as common from './common';
import * as logger from '../logger';
import {Session} from '../models';

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
			value: new Ref('User', 'user'),
			writable: false,
		},
		'owner-client': {
			value: new Ref('Client', 'ownerClient'),
			writable: false,
		},
	},
});

Runtime.addResource('Session', sessionResource);

var router = Router();

router.get('/',
	common.authenticate('token-bearer'),
	common.requirePrivilege('session:enum'),
	jsonapify.enumerate('Session'),
	logger.logErrors(), jsonapify.errorHandler());

router.get('/:id',
	common.authenticate('token-bearer'),
	common.requirePrivilege(ifNotSessionOwner('session:read')),
	jsonapify.read(['Session', jsonapify.param('id')]),
	logger.logErrors(), jsonapify.errorHandler());

router.get('/:id',
	common.authenticate('token-bearer'),
	common.requirePrivilege(ifNotSessionOwner('session:edit')),
	jsonapify.update(['Session', jsonapify.param('id')]),
	logger.logErrors(), jsonapify.errorHandler());

router.delete('/:id',
	common.authenticate('token-bearer'),
	common.requirePrivilege(ifNotSessionOwner('session:remove')),
	jsonapify.remove(['Session', jsonapify.param('id')]),
	logger.logErrors(), jsonapify.errorHandler());

function ifNotSessionOwner(priv) {
	return (req, done) => {
		let user = req.auth.user.info;
		let sessionId = req.params.id;
		Session.findById(sessionId, (err, session) => {
			if (err || !session) return done(err, false);
			done(null, session.user.equals(user._id) ? false : priv);
		});
	};
}

export default router;
