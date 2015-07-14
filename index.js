var config = require('./config');
var passport = require('./passport');

var mongoose = require('mongoose');
mongoose.connect(config.db.mongo.url);

var express = require('express');
var app = express();

app.set('json spaces', 2);

var cors = require('cors');
var logger = require('./logger');
var passport = require('./passport');
var jsonapify = require('jsonapify');
var bodyParser = require('body-parser');
var compression = require('compression');

app.use(compression());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
app.use(cors(config.cors));
app.use(passport.initialize());
app.use(logger.logRequest());

app.use('/users', require('./controllers/users'));
app.use('/roles', require('./controllers/roles'));
app.use('/oauth2', require('./controllers/oauth2'));
app.use('/clients', require('./controllers/clients'));
app.use('/sessions', require('./controllers/sessions'));
app.use('/access-tokens', require('./controllers/accessTokens'));
app.use('/refresh-tokens', require('./controllers/refreshTokens'));

module.exports = app;
