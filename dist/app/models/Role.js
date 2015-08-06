'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var roleSchema = new _mongoose.Schema({
	name: {
		type: String,
		index: true,
		unique: true,
		required: true
	},
	description: {
		type: String
	},
	privileges: [{
		type: String
	}]
});

exports['default'] = _mongoose2['default'].model('Role', roleSchema);
module.exports = exports['default'];
//# sourceMappingURL=../../app/models/Role.js.map