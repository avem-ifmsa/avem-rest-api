var _ = require('lodash');
var async = require('async');
var oauth2orize = require('oauth2orize');

var config = require('./config');
var User = require('./models/user');
var Client = require('./models/client');
var Session = require('./models/session');
var AccessToken = require('./models/accessToken');
var RefreshToken = require('./models/refreshToken');

var server = oauth2orize();

server.serializeClient(function(client, done) {
	done(null, client._id);
});

server.deserializeClient(function(id, done) {
	Client.findById(id, done);
});

server.exchange(oauth2orize.exchange.password(function(client, username, password, done) {
	if (!client || !client.trusted) return done(null, false);
	User.findOne({ email: username }, function(err, user) {
		if (err || !user) return done(err, false);
		user.verifyPassword(password, function(err, isMatch) {
			if (err || !isMatch) return done(err, false);
			var session = new Session;
			session.user = user._id;
			session.ownerClient = client._id;
			var tokenDuration = config.oauth2.token.resourceOwnerDuration;
			session.tokenDuration = tokenDuration;
			var accessToken = new AccessToken;
			var refreshToken = new RefreshToken;
			accessToken.session = refreshToken.session = session._id;
			accessToken.expirationDate = Date.now() + tokenDuration * 1000;
			async.series([
				function(cb) { session.save(cb) },
				function(cb) { accessToken.save(cb) },
				function(cb) { refreshToken.save(cb) },
			], function(err) {
				if (err) return done(err);
				done(null, accessToken.value, refreshToken.value, {
					expires_in: tokenDuration,
				});
			});
		});
	});
}));

server.exchange(oauth2orize.exchange.refreshToken(function(client, token, done) {
	RefreshToken.findOne({ value: token }, function(err, refreshToken) {
		if (err || !refreshToken) return done(err, false);
		Session.findById(refreshToken.session, function(err, session) {
			if (err || !session) return done(err, false);
			var newAccessToken = new AccessToken;
			var newRefreshToken = new RefreshToken;
			var tokenDuration = session.tokenDuration;
			newAccessToken.session = newRefreshToken.session = session._id;
			newAccessToken.expirationDate = Date.now() + tokenDuration * 1000;
			async.series([
				function(cb) { refreshToken.remove(cb); },
				function(cb) { newAccessToken.save(cb); },
				function(cb) { newRefreshToken.save(cb); },
			], function(err) {
				if (err) return done(err);
				done(null, newAccessToken.value, newRefreshToken.value, {
					expires_in: tokenDuration,
				});
			});
		});
	});
}));

setInterval(function() {
	AccessToken.find({ $lt: { expirationDate: Date.now() }}, function(err, results) {
		if (!err) {
			async.each(results, function(accessToken, cb) {
				accessToken.remove(cb);
			});
		}
	});
}, config.oauth2.token.removeExpiredInterval * 1000);

module.exports = server;
