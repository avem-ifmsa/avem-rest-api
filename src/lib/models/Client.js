import uid2 from 'uid2';
import async from 'async';
import mongoose, {Schema} from 'mongoose';

import Session from './Session';
import config from '../../../config';

function randomSecret() {
	return uid2(config.oauth2.client.secret.length);
}

const clientSchema = new mongoose.Schema({
	name: {
		type: String,
		unique: true,
		required: true,
	},
	secret: {
		type: String,
		required: true,
		default: randomSecret,
	},
	trusted: {
		type: Boolean,
		default: false,
		required: true,
	},
	redirectUri: {
		type: String,
	},
});

clientSchema.pre('remove', function(next) {
	Session.find({ clientOwner: this._id }, (err, results) => {
		if (err) return next(err);
		async.each(results, (session, next) => session.remove(next));
	});
});

export default mongoose.model('Client', clientSchema);
