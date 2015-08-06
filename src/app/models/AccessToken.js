import _ from 'lodash';
import uid2 from 'uid2';
import mongoose, {Schema} from 'mongoose';

import Session from './Session';
import config from '../../../config';

function randomToken() {
	return uid2(config.oauth2.token.length);
}

const accessTokenSchema = new Schema({
	value: {
		type: String,
		index: true,
		unique: true,
		required: true,
		default: randomToken,
	},
	session: {
		type: Schema.ObjectId,
		ref: 'Session',
		index: true,
		required: true,
	},
	expirationDate: {
		type: Date,
		required: true,
	},
});

accessTokenSchema.virtual('expires').get(function() {
	return !_.isNull(this.expirationDate) &&
	       this.expirationDate !== Infinity;
});

accessTokenSchema.virtual('expired').get(function() {
	return this.expires && this.expirationDate <= new Date;
});

accessTokenSchema.pre('save', function(next) {
	Session.findById(this.session, (err, session) => {
		if (err || !session) return next(err);
		++session.references;
		session.save(next);
	});
});

accessTokenSchema.pre('remove', function(next) {
	Session.findById(this.session, (err, session) => {
		if (err || !session) return next(err);
		if (--session.references <= 0)
			return session.remove(next);
		session.save(next);
	});
});

export default mongoose.model('AccessToken', accessTokenSchema);
