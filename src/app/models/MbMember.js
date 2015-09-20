import mongoose, {Schema} from 'mongoose';

const mbMemberSchema = new Schema({
	member: {
		type: Schema.ObjectId,
		ref: 'Member',
		required: true,
	},
	dni: {
		type: String,
		required: true,
		uppercase: true,
		match: /^(?:[XYZ]|[0-9])[0-9]{7}[TRWAGMYFPDXBNJZSQVHLCKET]$/i,
	},
	email: {
		type: String,
		required: true,
		match: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
	},
	position: {
		type: String,
		required: true,
	},
	activeSince: {
		type: Date,
		required: true,
		default: Date.now,
	},
	activeUntil: {
		type: Date,
		required: true,
	},
});

mbMemberSchema.virtual('active').get(function() {
	let currentDate = new Date;
	return this.activeSince <= currentDate && currentDate < this.activeUntil;
});

export default mongoose.model('MbMember', mbMemberSchema);
