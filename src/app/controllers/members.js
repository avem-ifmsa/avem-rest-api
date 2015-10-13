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
	},
	'relationships': {
		'user': new Ref('User', 'user'),
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
	common.authenticate(['token-bearer', 'anonymous']),
	common.requirePrivilege(memberRenewPrivilege),
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
	common.requirePrivilege(memberRenewPrivilege),
	jsonapify.update(['Member', jsonapify.param('id')]),
	logger.logErrors(), jsonapify.errorHandler());

router.delete('/:id',
	common.authenticate('token-bearer'),
	common.requirePrivilege(ifNotSelf('member:remove')),
	jsonapify.remove(['Member', jsonapify.param('id')]),
	logger.logErrors(), jsonapify.errorHandler());

export default router;

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

function memberRenewDateSet(req) {
	return !!_.get(req.body, 'data.attributes.renew-date');
}

function memberRenewDateChanged(req, member) {
	let memberRenewDate = member.renewDate;
	if (req.method === 'put')
		memberRenewDate = _.get(req.body, 'data.attributes.renew-date');
	return member.renewDate !== memberRenewDate;
}

function memberRenewPrivilege(req, done) {
	let memberId = req.params.id;
	if (req.method === 'post') {
		if (memberRenewDateSet(req))
			return done(null, 'member:renew');
		return done(null, false);
	} else {
		Member.findById(memberId, (err, member) => {
			if (err || !member) return done(err, false);
			if (memberRenewDateChanged(req, member))
				return done(null, 'member:renew');
			return done(null, false);
		});
	}
}
