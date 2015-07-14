var _ = require('lodash');
var util = require('util');
var async = require('async');
var config = require('./config');
var express = require('express');
var mongoose = require('mongoose');
var jsonapify = require('jsonapify');
var common = require('./controllers/common');

var cors = require('cors');
var logger = require('./logger');
var passport = require('./passport');
var bodyParser = require('body-parser');
var compression = require('compression');

mongoose.connect(config.db.mongo.url);

var app = express();
app.set('json spaces', 2);

app.use(compression());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
app.use(cors(config.cors));
app.use(passport.initialize());
app.use(logger.logRequest());

app.get('/',
	passport.authenticate(['token-bearer', 'anonymous'], { session: false }),
	function(req, res) {
		var response = jsonapify.response(res);
		if (req.user) {
			response.meta('authenticated', true);
			response.link('this-user', '/users/' + req.user._id);
			common.currentSession(req, function(err, session) {
				if (err) throw err;
				response.link('this-session', '/sessions/' + session._id);
				response.send();
			});
		} else {
			response.meta('authenticated', false);
			response.link('oauth2-token-url', '/oauth2/token');
			response.send();
		}
	});

app.use('/users', require('./controllers/users'));
app.use('/roles', require('./controllers/roles'));
app.use('/oauth2', require('./controllers/oauth2'));
app.use('/clients', require('./controllers/clients'));
app.use('/sessions', require('./controllers/sessions'));
app.use('/access-tokens', require('./controllers/accessTokens'));
app.use('/refresh-tokens', require('./controllers/refreshTokens'));

module.exports = app;
