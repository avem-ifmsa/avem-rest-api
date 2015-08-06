import mongoose, {Schema} from 'mongoose';

const roleSchema = new Schema({
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

export default mongoose.model('Role', roleSchema);
