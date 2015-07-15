var mongoose = require('mongoose');

var roleSchema = new mongoose.Schema({
	name: {
		type: String,
		index: true,
		unique: true,
		required: true,
	},
	description: {
		type: String,
	},
	privileges: [{
		type: String,
	}],
});

module.exports = mongoose.model('Role', roleSchema);
