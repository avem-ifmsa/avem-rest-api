'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _uid2 = require('uid2');

var _uid22 = _interopRequireDefault(_uid2);

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var _Session = require('./Session');

var _Session2 = _interopRequireDefault(_Session);

var _config = require('../../../config');

var _config2 = _interopRequireDefault(_config);

function randomToken() {
	return (0, _uid22['default'])(_config2['default'].oauth2.token.length);
}

var accessTokenSchema = new _mongoose.Schema({
	value: {
		type: String,
		index: true,
		unique: true,
		required: true,
		'default': randomToken
	},
	session: {
		type: _mongoose.Schema.ObjectId,
		ref: 'Session',
		index: true,
		required: true
	},
	expirationDate: {
		type: Date,
		required: true
	}
});

accessTokenSchema.virtual('expires').get(function () {
	return !_lodash2['default'].isNull(this.expirationDate) && this.expirationDate !== Infinity;
});

accessTokenSchema.virtual('expired').get(function () {
	return this.expires && this.expirationDate <= new Date();
});

accessTokenSchema.pre('save', function (next) {
	_Session2['default'].findById(this.session, function (err, session) {
		if (err || !session) return next(err);
		++session.references;
		session.save(next);
	});
});

accessTokenSchema.pre('remove', function (next) {
	_Session2['default'].findById(this.session, function (err, session) {
		if (err || !session) return next(err);
		if (--session.references <= 0) return session.remove(next);
		session.save(next);
	});
});

exports['default'] = _mongoose2['default'].model('AccessToken', accessTokenSchema);
module.exports = exports['default'];
//# sourceMappingURL=../../lib/models/AccessToken.js.map