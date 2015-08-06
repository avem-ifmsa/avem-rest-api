'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _scrypt = require('scrypt');

var _scrypt2 = _interopRequireDefault(_scrypt);

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var _config = require('../../../config');

var _config2 = _interopRequireDefault(_config);

var userSchema = new _mongoose.Schema({
	email: {
		type: String,
		index: true,
		unique: true,
		match: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
		required: true
	},
	passwordHash: {
		type: Buffer
	},
	role: {
		type: _mongoose.Schema.ObjectId,
		ref: 'Role',
		required: true
	}
});

userSchema.virtual('password').set(function (password) {
	var pwLength = password.length;
	if (pwLength < _config2['default'].security.password.minLength) {
		self.invalidate('password', 'password too short', pwLength);
		throw new Error('password too short');
	} else if (pwLength > _config2['default'].security.password.maxLength) {
		self.invalidate('password', 'password too long', pwLength);
		throw new Error('password too long');
	}
	this._password = password;
});

userSchema.path('passwordHash').validate(function (value) {
	if (_lodash2['default'].isUndefined(this._password) && _lodash2['default'].isUndefined(this.passwordHash)) {
		self.invalidate('password', 'password field required');
		throw new Error('password field required');
	}
});

userSchema.pre('save', function (next) {
	if (_lodash2['default'].isUndefined(this._password)) return next();
	var self = this;
	var pwBuf = new Buffer(this._password);
	var params = _config2['default'].scryptParams(_scrypt2['default'], _config2['default'].security.hash.scrypt);
	_scrypt2['default'].hash(pwBuf, params, function (err, hash) {
		if (err) return next(err);
		self.passwordHash = hash;
		next();
	});
});

userSchema.methods.verifyPassword = function (password, cb) {
	var pwBuf = new Buffer(password);
	_scrypt2['default'].verify(this.passwordHash, pwBuf, function (err, isMatch) {
		return cb(null, !err && isMatch);
	});
};

exports['default'] = _mongoose2['default'].model('User', userSchema);
module.exports = exports['default'];
//# sourceMappingURL=../../app/models/User.js.map