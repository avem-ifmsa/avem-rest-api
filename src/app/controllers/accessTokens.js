import {Router} from 'express';
import jsonapify, {Resource, Template, Property, Ref} from 'jsonapify';

import * as common from './common';
import * as logger from '../logger';
import {AccessToken} from '../models';
import {resource as sessionResource} from './sessions';

const accessTokenResource = new Resource(AccessToken, {
	'type': 'access-tokens',
	'id': {
		value: new Property('value'),
		writable: false,
	},
	'links': {
		'self': {
			value: new Template('/access-tokens/${value}'),
			writable: false,
		},
	},
	'attributes': {
		'expires': {
			value: new Property('expires'),
			writable: false,
		},
		'expired': {
			value: new Property('expired'),
			writable: false,
		},
		'expiration-date': {
			value: new Property('expirationDate'),
			nullable: true,
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
	common.requirePrivilege('access-token:enum'),
	jsonapify.enumerate(accessTokenResource),
	logger.logErrors(), jsonapify.errorHandler());

function ifNotTokenOwner(priv) {
	return (req) => {
		let token = req.params.value;
		let bearer = common.extractAccessToken(req);
		return token !== bearer ? priv : false;
	};
}

router.get('/:value',
	common.authenticate('token-bearer'),
	common.requirePrivilege(ifNotTokenOwner('access-token:read')),
	jsonapify.read([accessTokenResource, { value: jsonapify.param('value') }]),
	logger.logErrors(), jsonapify.errorHandler());

router.delete('/:value',
	common.authenticate('token-bearer'),
	common.requirePrivilege(ifNotTokenOwner('access-token:remove')),
	jsonapify.remove([accessTokenResource, { value: jsonapify.param('value') }]),
	logger.logErrors(), jsonapify.errorHandler());

export default router;
export { accessTokenResource as resource };
