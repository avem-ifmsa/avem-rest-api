var uid2 = require('uid2');
var async = require('async');
var config = require('../config');
var Session = require('./session');
var mongoose = require('mongoose');

function randomSecret() {
	return uid2(config.oauth2.client.secret.length);
}

var clientSchema = new mongoose.Schema({
	name: {
		type: String,
		unique: true,
		required: true,
	},
	
	secret: {
		type: String,
		default: randomSecret,
	},
	
	trusted: {
		type: Boolean,
		default: false,
	},
	
	redirectUri: {
		type: String,
	},
});

clientSchema.pre('remove', function(next) {
	Session.find({ clientOwner: this._id }, function(err, results) {
		if (err) return next(err);
		async.each(results, function(session, cb) {
			session.remove(cb);
		});
	});
});

module.exports = mongoose.model('Client', clientSchema);
