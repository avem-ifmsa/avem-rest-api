'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _async = require('async');

var _async2 = _interopRequireDefault(_async);

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var _config = require('../../../config');

var _config2 = _interopRequireDefault(_config);

var _AccessToken = require('./AccessToken');

var _AccessToken2 = _interopRequireDefault(_AccessToken);

var _RefreshToken = require('./RefreshToken');

var _RefreshToken2 = _interopRequireDefault(_RefreshToken);

var sessionSchema = new _mongoose.Schema({
	user: {
		type: _mongoose.Schema.ObjectId,
		ref: 'User',
		required: true
	},
	ownerClient: {
		type: _mongoose.Schema.ObjectId,
		ref: 'Client',
		required: true
	},
	tokenDuration: {
		type: Number,
		required: true
	},
	references: {
		type: Number,
		required: true,
		'default': 0
	}
});

sessionSchema.pre('remove', function (next) {
	var _this = this;

	_async2['default'].parallel([function (next) {
		return _AccessToken2['default'].remove({ session: _this._id }, next);
	}, function (next) {
		return _RefreshToken2['default'].remove({ session: _this._id }, next);
	}], next);
});

exports['default'] = _mongoose2['default'].model('Session', sessionSchema);
module.exports = exports['default'];
//# sourceMappingURL=../../lib/models/Session.js.map