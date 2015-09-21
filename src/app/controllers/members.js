import {Router} from 'express';
import jsonapify, {Resource, Runtime, Property, Template, Ref, Refs} from 'jsonapify';

import './users';
import './activities';

import * as common from './common';
import * as logger from '../logger';
import {Member} from '../models';

const memberResource = new Resource(Member, {
	'type': 'members',
	'id': {
		value: new Property('_id'),
		writable: false,
	},
	'links': {
		'self': {
			value: new Template('/members/${_id}'),
			writable: false,
		},
	},
	'attributes': {
		'first-name': new Property('name.first'),
		'last-name': new Property('name.last'),
		'full-name': {
			value: new Property('name.full'),
			writable: false,
		},
		'gender': {
			value: new Property('gender'),
			nullable: true,
		},
		'birthday': {
			value: new Property('birthday'),
			nullable: true,
		},
		'age': {
			value: new Property('age'),
			writable: false,
			nullable: true,
		},
		'renew-date': new Property('renewDate'),
		'active': {
			value: new Property('active'),
			writable: false,
		},
		'subscribed-categories': new Property('subscribedCategories'),
	},
	'relationships': {
		'user': new Ref('User', 'user'),
		'performed-activities': new Refs('Activity', 'performedActivities'),
		'subscribed-activities': new Refs('Activity', 'subscribedActivities'),
	},
});

Runtime.addResource('Member', memberResource);

const router = Router();

router.get('/',
	common.authenticate('token-bearer'),
	common.requirePrivilege('member:enum'),
	jsonapify.enumerate('Member'),
	logger.logErrors(), jsonapify.errorHandler());

router.post('/',
	common.authenticate('token-bearer'),
	common.requirePrivilege('member:create'),
	jsonapify.create('Member'),
	logger.logErrors(), jsonapify.errorHandler());

router.get('/:id',
	common.authenticate('token-bearer'),
	common.requirePrivilege(ifNotSelf('member:read')),
	jsonapify.read(['Member', jsonapify.param('id')]),
	logger.logErrors(), jsonapify.errorHandler());

router.put('/:id',
	common.authenticate('token-bearer'),
	common.requirePrivilege(ifNotSelf('member:edit')),
	jsonapify.update(['Member', jsonapify.param('id')]),
	logger.logErrors(), jsonapify.errorHandler());

router.delete('/:id',
	common.authenticate('token-bearer'),
	common.requirePrivilege(ifNotSelf('member:remove')),
	jsonapify.remove(['Member', jsonapify.param('id')]),
	logger.logErrors(), jsonapify.errorHandler());

function ifNotSelf(priv) {
	return (req, done) => {
		let memberId = req.params.id;
		let user = req.auth.user.info;
		Member.findById(memberId, (err, member) => {
			if (err || !member) return done(err, false);
			done(null, user._id.equals(member.user) ? false : priv);
		});
	};
}

export default router;
