import util from 'util';

import _ from 'lodash';
import async from 'async';
import mongoose, {Schema} from 'mongoose';

import Transaction from './Transaction';

const memberSchema = new Schema({
	user: {
		type: Schema.ObjectId,
		ref: 'User',
		index: true,
		required: true,
	},
	name: {
		first: {
			type: String,
			required: true,
		},
		last: {
			type: String,
			required: true,
		},
	},
	gender: {
		type: String,
	},
	birthday: {
		type: Date,
	},
	renewDate: {
		type: Date,
		required: true,
	},
	performedActivities: [{
		type: Schema.ObjectId,
		ref: 'Activity',
	}],
	subscribedActivities: [{
		type: Schema.ObjectId,
		ref: 'Activity',
	}],
	subscribedCategories: [{
		type: String,
	}],
});

memberSchema.virtual('name.full').get(function() {
	return util.format('%s %s', this.name.first, this.name.last);
});

memberSchema.virtual('age').get(function() {
	if (!this.birthday) return null;
	return new Date - this.birthday;
});

memberSchema.virtual('active').get(function() {
	return this.renewDate > new Date;
});

memberSchema.methods.getPoints = function(callback) {
	var query = Transaction.find({ member: this._id });
	query.sort({ _id: 1 }).select('points').exec((err, transactions) => {
		if (err) return callback(err);
		callback(null, _(transactions).pluck('points').reduce(sum, pts => {
			return Math.max(0, sum + pts);
		}));
	});
};

memberSchema.pre('remove', function(next) {
	Transaction.find({ member: this._id }, (err, transactions) => {
		if (err) return next(err);
		async.each(transactions, (transaction, next) => {
			transaction.remove(next);
		}, next);
	});
});

export default mongoose.model('Member', memberSchema);
