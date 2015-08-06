'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var mbMemberSchema = new _mongoose.Schema({
	member: {
		type: _mongoose.Schema.ObjectId,
		ref: 'Member',
		required: true
	},
	position: {
		type: String,
		required: true
	},
	since: {
		type: Date,
		required: true,
		'default': Date.now
	},
	until: {
		type: Date,
		required: true
	}
});

mbMemberSchema.virtual('active').get(function () {
	var currentDate = new Date();
	return this.since <= currentDate && currentDate < this.until;
});

exports['default'] = _mongoose2['default'].model('MbMember', mbMemberSchema);
module.exports = exports['default'];
//# sourceMappingURL=../../app/models/MbMember.js.map