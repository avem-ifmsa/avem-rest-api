import mongoose, {Schema} from 'mongoose';

const transactionSchema = new Schema({
	member: {
		type: Schema.ObjectId,
		ref: 'Member',
		index: true,
		required: true,
	},
	activity: {
		type: Schema.ObjectId,
		ref: 'Activity',
	},
	details: {
		type: String,
	},
	points: {
		type: Number,
		required: true,
	},
});

transactionSchema.virtual('date').get(function() {
	return this._id.getTimestamp();
});

export default mongoose.model('Transaction', transactionSchema);
