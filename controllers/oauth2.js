var auth = require('../auth');
var express = require('express');
var logger = require('../logger');
var oauth2 = require('../oauth2');

var router = express.Router();

router.use('/token',
	auth.authenticatePublicClient(),
	oauth2.token(),
	logger.logErrors(),
	oauth2.errorHandler());

module.exports = router;
