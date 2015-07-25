var cors = require('cors');
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var compression = require('compression');

var config = require('./config');
var logger = require('./logger');
var passport = require('./passport');

mongoose.connect(config.db.mongo.url);

var app = express();
app.set('json spaces', 2);

app.use(compression());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
app.use(cors(config.cors));
app.use(passport.initialize());
app.use(logger.logRequest());

app.use('/', require('./controllers/index'));
app.use('/oauth2', require('./controllers/oauth2'));
app.use('/users', require('./controllers/users'));
app.use('/roles', require('./controllers/roles'));
app.use('/clients', require('./controllers/clients'));
app.use('/sessions', require('./controllers/sessions'));
app.use('/access-tokens', require('./controllers/accessTokens'));
app.use('/refresh-tokens', require('./controllers/refreshTokens'));

module.exports = app;
