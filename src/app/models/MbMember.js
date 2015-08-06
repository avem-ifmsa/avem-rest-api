import mongoose, {Schema} from 'mongoose';

const mbMemberSchema = new Schema({
	member: {
		type: Schema.ObjectId,
		ref: 'Member',
		required: true,
	},
	position: {
		type: String,
		required: true,
	},
	since: {
		type: Date,
		required: true,
		default: Date.now,
	},
	until: {
		type: Date,
		required: true,
	},
});

mbMemberSchema.virtual('active').get(function() {
	var currentDate = new Date;
	return this.since <= currentDate && currentDate < this.until;
});

export default mongoose.model('MbMember', mbMemberSchema);
