'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _async = require('async');

var _async2 = _interopRequireDefault(_async);

var _express = require('express');

var _jsonapify = require('jsonapify');

var _common = require('./common');

var common = _interopRequireWildcard(_common);

var router = (0, _express.Router)();

router.get('/', common.authenticate(['token-bearer', 'anonymous']), function (req, res) {
	var response = new _jsonapify.Response(res);
	if (req.user) {
		_async2['default'].parallel({
			user: _async2['default'].constant(req.user),
			session: function session(next) {
				common.currentSession(req, next);
			}
		}, function (err, results) {
			if (err) throw err;
			response.meta['authenticated'] = true;
			response.links['this-user'] = '/users/' + results.user._id;
			response.links['this-session'] = '/sessions/' + results.session._id;
			response.send();
		});
	} else {
		response.meta['authenticated'] = false;
		response.links['oauth2-token-url'] = '/oauth2/token';
		response.send();
	}
});

exports['default'] = router;
module.exports = exports['default'];
//# sourceMappingURL=../../app/controllers/root.js.map