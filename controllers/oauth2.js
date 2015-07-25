var express = require('express');

var common = require('./common');
var logger = require('../logger');
var oauth2 = require('../oauth2');

var router = express.Router();

router.use('/token',
	common.authenticate('client-public'),
	oauth2.token(), logger.logErrors(),
	oauth2.errorHandler());

module.exports = router;
