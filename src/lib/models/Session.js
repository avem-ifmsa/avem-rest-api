import async from 'async';
import mongoose, {Schema} from 'mongoose';

import config from '../../../config';
import AccessToken from './AccessToken';
import RefreshToken from './RefreshToken';

const sessionSchema = new Schema({
	user: {
		type: Schema.ObjectId,
		ref: 'User',
		required: true,
	},
	ownerClient: {
		type: Schema.ObjectId,
		ref: 'Client',
		required: true,
	},
	tokenDuration: {
		type: Number,
		required: true,
	},
	references: {
		type: Number,
		required: true,
		default: 0,
	},
});

sessionSchema.pre('remove', function(next) {
	async.parallel([
		next => AccessToken.remove({ session: this._id }, next),
		next => RefreshToken.remove({ session: this._id }, next),
	], next);
});

export default mongoose.model('Session', sessionSchema);
