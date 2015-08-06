'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _uid2 = require('uid2');

var _uid22 = _interopRequireDefault(_uid2);

var _async = require('async');

var _async2 = _interopRequireDefault(_async);

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var _Session = require('./Session');

var _Session2 = _interopRequireDefault(_Session);

var _config = require('../../../config');

var _config2 = _interopRequireDefault(_config);

function randomSecret() {
	return (0, _uid22['default'])(_config2['default'].oauth2.client.secret.length);
}

var clientSchema = new _mongoose2['default'].Schema({
	name: {
		type: String,
		unique: true,
		required: true
	},
	secret: {
		type: String,
		required: true,
		'default': randomSecret
	},
	trusted: {
		type: Boolean,
		'default': false,
		required: true
	},
	redirectUri: {
		type: String
	}
});

clientSchema.pre('remove', function (next) {
	_Session2['default'].find({ clientOwner: this._id }, function (err, results) {
		if (err) return next(err);
		_async2['default'].each(results, function (session, next) {
			return session.remove(next);
		});
	});
});

exports['default'] = _mongoose2['default'].model('Client', clientSchema);
module.exports = exports['default'];
//# sourceMappingURL=../../app/models/Client.js.map