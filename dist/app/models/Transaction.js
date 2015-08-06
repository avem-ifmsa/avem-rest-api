'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var transactionSchema = new _mongoose.Schema({
	member: {
		type: _mongoose.Schema.ObjectId,
		ref: 'Member',
		index: true,
		required: true
	},
	activity: {
		type: _mongoose.Schema.ObjectId,
		ref: 'Activity'
	},
	details: {
		type: String
	},
	points: {
		type: Number,
		required: true
	}
});

transactionSchema.virtual('date').get(function () {
	return this._id.getTimestamp();
});

exports['default'] = _mongoose2['default'].model('Transaction', transactionSchema);
module.exports = exports['default'];
//# sourceMappingURL=../../app/models/Transaction.js.map