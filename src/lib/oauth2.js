import _ from 'lodash';
import async from 'async';
import oauth2orize from 'oauth2orize';

import config from '../../config';
import User from './models/User';
import Client from './models/Client';
import Session from './models/Session';
import AccessToken from './models/AccessToken';
import RefreshToken from './models/RefreshToken';

const server = oauth2orize();
export default server;

server.serializeClient((client, done) => {
	done(null, client._id);
});

server.deserializeClient((id, done) => {
	Client.findById(id, done);
});

server.exchange(oauth2orize.exchange.password((client, username, password, done) => {
	if (!client || !client.trusted) return done(null, false);
	User.findOne({ email: username }, (err, user) => {
		if (err || !user) return done(err, false);
		user.verifyPassword(password, (err, isMatch) => {
			if (err || !isMatch) return done(err, false);
			let session = new Session;
			session.user = user._id;
			session.ownerClient = client._id;
			let tokenDuration = config.oauth2.token.resourceOwnerDuration;
			session.tokenDuration = tokenDuration;
			let accessToken = new AccessToken;
			let refreshToken = new RefreshToken;
			accessToken.session = refreshToken.session = session._id;
			accessToken.expirationDate = Date.now() + tokenDuration * 1000;
			async.series([
				next => session.save(next),
				next => accessToken.save(next),
				next => refreshToken.save(next),
			], err => {
				if (err) return done(err);
				done(null, accessToken.value, refreshToken.value, {
					expires_in: tokenDuration,
				});
			});
		});
	});
}));

server.exchange(oauth2orize.exchange.refreshToken((client, token, done) => {
	RefreshToken.findOne({ value: token }, (err, refreshToken) => {
		if (err || !refreshToken) return done(err, false);
		Session.findById(refreshToken.session, (err, session) => {
			if (err || !session) return done(err, false);
			let newAccessToken = new AccessToken;
			let newRefreshToken = new RefreshToken;
			let tokenDuration = session.tokenDuration;
			newAccessToken.session = newRefreshToken.session = session._id;
			newAccessToken.expirationDate = Date.now() + tokenDuration * 1000;
			async.series([
				next => refreshToken.remove(next),
				next => newAccessToken.save(next),
				next => newRefreshToken.save(next),
			], err => {
				if (err) return done(err);
				done(null, newAccessToken.value, newRefreshToken.value, {
					expires_in: tokenDuration,
				});
			});
		});
	});
}));

setInterval(() => {
	AccessToken.find({ $lt: { expirationDate: Date.now() }}, (err, results) => {
		if (!err) {
			async.each(results, (accessToken, next) => {
				accessToken.remove(next);
			});
		}
	});
}, config.oauth2.token.removeExpiredInterval * 1000);
