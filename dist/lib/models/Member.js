'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _util = require('util');

var _util2 = _interopRequireDefault(_util);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _async = require('async');

var _async2 = _interopRequireDefault(_async);

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var _Transaction = require('./Transaction');

var _Transaction2 = _interopRequireDefault(_Transaction);

var memberSchema = new _mongoose.Schema({
	user: {
		type: _mongoose.Schema.ObjectId,
		ref: 'User',
		index: true,
		required: true
	},
	name: {
		first: {
			type: String,
			required: true
		},
		last: {
			type: String,
			required: true
		}
	},
	gender: {
		type: String
	},
	birthday: {
		type: Number
	},
	activeUntil: {
		type: Date,
		required: true
	},
	subscribedActivities: [{
		type: _mongoose.Schema.ObjectId,
		ref: 'Activity'
	}],
	performedActivities: [{
		type: _mongoose.Schema.ObjectId,
		ref: 'Activity'
	}]
});

memberSchema.virtual('name.full').get(function () {
	return _util2['default'].format('%s %s', this.name.first, this.name.last);
});

memberSchema.virtual('age').get(function () {
	if (!this.birthday) return null;
	return new Date() - this.birthday;
});

memberSchema.virtual('active').get(function () {
	return this.activeUntil < new Date();
});

memberSchema.methods.getPoints = function (callback) {
	var query = _Transaction2['default'].find({ member: this._id });
	query.sort({ _id: 1 }).select('points').exec(function (err, transactions) {
		if (err) return callback(err);
		var transactionPoints = (0, _lodash2['default'])(transactions).pluck('points');
		callback(null, transactionPoints.reduce(function (total, points) {
			return Math.max(0, total + points);
		}));
	});
};

memberSchema.pre('remove', function (next) {
	_Transaction2['default'].find({ member: this._id }, function (err, transactions) {
		if (err) return next(err);
		_async2['default'].each(transactions, function (transaction, next) {
			transaction.remove(next);
		}, next);
	});
});

exports['default'] = _mongoose2['default'].model('Member', memberSchema);
module.exports = exports['default'];
//# sourceMappingURL=../../lib/models/Member.js.map