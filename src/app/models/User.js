import _ from 'lodash';
import scrypt from 'scrypt';
import mongoose, {Schema} from 'mongoose';

import config from '../../../config';

const scryptParams = (function(settings) {
	return scrypt.paramsSync(settings.maxtime,
	                         settings.maxmem,
	                         settings.maxmemfrac);
})(config.security.hash.scrypt);

const userSchema = new Schema({
	email: {
		type: String,
		index: true,
		unique: true,
		required: true,
		match: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
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
	let pwLength = password.length;
	if (pwLength < config.security.password.minLength) {
		self.invalidate('password', 'password too short', pwLength);
		throw new Error('password too short');
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
	scrypt.kdf(this._password, scryptParams, (err, hash) => {
		if (err) return next(err);
		this.passwordHash = hash;
		next();
	});
});

userSchema.methods.verifyPassword = function(password, cb) {
	scrypt.verifyKdf(this.passwordHash, password, (err, isMatch) => {
		err ? cb(err) : cb(null, isMatch);
	});
};

export default mongoose.model('User', userSchema);
