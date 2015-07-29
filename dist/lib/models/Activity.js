'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var activitySchema = new _mongoose.Schema({
	name: {
		type: String,
		required: true
	},
	category: {
		type: String
	},
	description: {
		type: String
	},
	organizedBy: [{
		type: _mongoose.Schema.ObjectId,
		ref: 'MbMember'
	}],
	points: {
		type: Number
	}
});

exports['default'] = _mongoose2['default'].model('Activity', activitySchema);
module.exports = exports['default'];
//# sourceMappingURL=../../lib/models/Activity.js.map