var async = require('async');
var config = require('../config');
var mongoose = require('mongoose');

var sessionSchema = new mongoose.Schema({
	user: {
		type: mongoose.Schema.ObjectId,
		ref: 'User',
		required: true,
	},
	
	ownerClient: {
		type: mongoose.Schema.ObjectId,
		ref: 'Client',
		required: true,
	},
	
	tokenDuration: {
		type: Number,
		required: true,
	},
	
	references: {
		type: Number,
		required: true,
		default: 0,
	},
});

sessionSchema.pre('remove', function(next) {
	var AccessToken = require('./accessToken');
	var RefreshToken = require('./refreshToken');
	async.parallel([
		function(cb) {
			AccessToken.remove({ session: this._id }, cb);
		}, function(cb) {
			RefreshToken.remove({ session: this._id }, cb);
		},
	], next);
});

module.exports = mongoose.model('Session', sessionSchema);
