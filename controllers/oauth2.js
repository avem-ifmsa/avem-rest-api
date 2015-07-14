var common = require('./common');
var express = require('express');
var logger = require('../logger');
var oauth2 = require('../oauth2');

var router = express.Router();

router.use('/token',
	common.authenticatePublicClient(),
	oauth2.token(),
	logger.logErrors(),
	oauth2.errorHandler());

module.exports = router;
