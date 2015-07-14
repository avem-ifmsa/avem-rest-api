var _ = require('lodash');
var uid2 = require('uid2');
var config = require('../config');
var Session = require('./session');
var mongoose = require('mongoose');

function randomToken() {
	return uid2(config.oauth2.token.length);
}

var accessTokenSchema = new mongoose.Schema({
	value: {
		type: String,
		index: true,
		unique: true,
		default: randomToken,
	},
	
	session: {
		type: mongoose.Schema.ObjectId,
		ref: 'Session',
		index: true,
		required: true,
	},
	
	expirationDate: {
		type: Date,
		required: true,
	},
});

accessTokenSchema.virtual('expires').get(function() {
	return !_.isNull(this.expirationDate) &&
	       this.expirationDate !== Infinity;
});

accessTokenSchema.virtual('expired').get(function() {
	return this.expires && this.expirationDate <= new Date;
});

accessTokenSchema.pre('save', function(next) {
	Session.findById(this.session, function(err, session) {
		if (err || !session) return next(err);
		++session.references;
		session.save(next);
	});
});

accessTokenSchema.pre('remove', function(next) {
	Session.findById(this.session, function(err, session) {
		if (err || !session) return next(err);
		if (--session.references <= 0)
			return session.remove(next);
		session.save(next);
	});
});

module.exports = mongoose.model('AccessToken', accessTokenSchema);
