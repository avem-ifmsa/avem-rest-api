import mongoose, {Schema} from 'mongoose';

const activitySchema = new Schema({
	name: {
		type: String,
		required: true,
	},
	category: {
		type: String,
	},
	description: {
		type: String,
	},
	organizedBy: [{
		type: Schema.ObjectId,
		ref: 'MbMember',
	}],
	points: {
		type: Number,
	},
});

export default mongoose.model('Activity', activitySchema);
