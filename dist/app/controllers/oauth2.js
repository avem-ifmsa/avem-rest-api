'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

var _express = require('express');

var _common = require('./common');

var common = _interopRequireWildcard(_common);

var _logger = require('../logger');

var logger = _interopRequireWildcard(_logger);

var _oauth2 = require('../oauth2');

var _oauth22 = _interopRequireDefault(_oauth2);

var router = (0, _express.Router)();

router.use('/token', common.authenticate('client-public'), _oauth22['default'].token(), logger.logErrors(), _oauth22['default'].errorHandler());

exports['default'] = router;
module.exports = exports['default'];
//# sourceMappingURL=../../app/controllers/oauth2.js.map