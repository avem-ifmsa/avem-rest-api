import async from 'async';
import {Router} from 'express';
import jsonapify, {Resource, Runtime, Property, Template, Ref} from 'jsonapify';

import './members';

import * as common from './common';
import * as logger from '../logger';
import {Member, MbMember} from '../models';

const mbMemberResource = new Resource(MbMember, {
	'type': 'mb-members',
	'id': {
		value: new Property('_id'),
		writable: false,
	},
	'links': {
		value: new Template('/mb-members/${_id}'),
		writable: false,
	},
	'attributes': {
		'dni': new Property('dni'),
		'email': new Property('email'),
		'position': new Property('position'),
		'active-since': new Property('activeSince'),
		'active-until': new Property('activeUntil'),
		'active': {
			value: new Property('active'),
			writable: false,
		},
	},
	'relationships': {
		'member': new Ref('Member', 'member'),
	},
});

Runtime.addResource('MbMember', mbMemberResource);

const router = Router();

router.get('/',
	common.authenticate('token-bearer'),
	jsonapify.enumerate('MbMember'),
	logger.logErrors(), jsonapify.errorHandler());

router.post('/',
	common.authenticate('token-bearer'),
	common.requirePrivilege('mb-member:add'),
	jsonapify.create('MbMember'),
	logger.logErrors(), jsonapify.errorHandler());

router.get('/:id',
	common.authenticate('token-bearer'),
	jsonapify.read(['MbMember', jsonapify.param('id')]),
	logger.logErrors(), jsonapify.errorHandler());

router.put('/:id',
	common.authenticate('token-bearer'),
	common.requirePrivilege(ifNotSelf('mb-member:edit')),
	jsonapify.update(['MbMember', jsonapify.param('id')]),
	logger.logErrors(), jsonapify.errorHandler());

router.delete('/:id',
	common.authenticate('token-bearer'),
	common.requirePrivilege(ifNotSelf('mb-member:remove')),
	jsonapify.remove(['MbMember', jsonapify.param('id')]),
	logger.logErrors(), jsonapify.errorHandler());

function ifNotSelf(priv) {
	return (req, done) => {
		let user = req.auth.user.info;
		let mbMemberId = req.params.id;
		async.waterfall([
			(next) => {
				MbMember.findById(mbMemberId, next);
			},
			(mbMember, next) => {
				if (!mbMember) return next('break', false);
				Member.findById(mbMember.member, next);
			},
			(member, next) => {
				if (!member) return next('break', false);
				next(null, user._id.equals(member.user));
			},
		], (err, isSelf) => {
			if (err && err !== 'break') return done(err, false);
			done(null, isSelf ? false : priv);
		});
	};
}

export default router;
