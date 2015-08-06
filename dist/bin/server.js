'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _app = require('../app/');

var _app2 = _interopRequireDefault(_app);

var _config = require('../../config');

var _config2 = _interopRequireDefault(_config);

_app2['default'].listen(_config2['default'].server.port);
//# sourceMappingURL=../bin/server.js.map