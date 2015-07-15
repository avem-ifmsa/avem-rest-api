var async = require('async');
var common = require('./common');
var express = require('express');
var jsonapify = require('jsonapify');

var router = express.Router();

router.get('/', 
	common.authenticate(['token-bearer', 'anonymous']),
	function(req, res) {
		var response = jsonapify.response(res);
		if (req.user) {
			async.parallel({
				user: async.constant(req.user),
				session: function(cb) {
					common.currentSession(req, cb);
				},
			}, function(err, results) {
				if (err) throw err;
				response.meta('authenticated', true);
				response.link('this-user', '/users/' + results.user._id);
				response.link('this-session', '/sessions/' + results.session._id);
				response.send();
			});
		} else {
			response.meta('authenticated', false);
			response.link('oauth2-token-url', '/oauth2/token');
			response.send();
		}
	});

module.exports = router;
