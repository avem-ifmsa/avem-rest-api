import _ from 'lodash';
import scrypt from 'scrypt';
import mongoose, {Schema} from 'mongoose';

import config from '../../../config';

const userSchema = new Schema({
	email: {
		type: String,
		index: true,
		unique: true,
		match: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
		required: true,
	},
	passwordHash: {
		type: Buffer,
	},
	role: {
		type: Schema.ObjectId,
		ref: 'Role',
		required: true,
	},
});

userSchema.virtual('password').set(function(password) {
	var pwLength = password.length;
	if (pwLength < config.security.password.minLength) {
		self.invalidate('password', 'password too short', pwLength);
		throw new Error('password too short');
	} else if (pwLength > config.security.password.maxLength) {
		self.invalidate('password', 'password too long', pwLength);
		throw new Error('password too long');
	}
	this._password = password;
});

userSchema.path('passwordHash').validate(function(value) {
	if (_.isUndefined(this._password) &&
	    _.isUndefined(this.passwordHash)) {
	    	self.invalidate('password', 'password field required');
	    	throw new Error('password field required');
	}
});

userSchema.pre('save', function(next) {
	if (_.isUndefined(this._password))
		return next();
	var self = this;
	var pwBuf = new Buffer(this._password);
	var params = config.scryptParams(scrypt, config.security.hash.scrypt);
	scrypt.hash(pwBuf, params, (err, hash) => {
		if (err) return next(err);
		self.passwordHash = hash;
		next();
	});
});

userSchema.methods.verifyPassword = function(password, cb) {
	var pwBuf = new Buffer(password);
	scrypt.verify(this.passwordHash, pwBuf, (err, isMatch) => {
		return cb(null, !err && isMatch);
	});
};

export default mongoose.model('User', userSchema);
