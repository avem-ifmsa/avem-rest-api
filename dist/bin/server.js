'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _lib = require('../lib/');

var _lib2 = _interopRequireDefault(_lib);

var _config = require('../../config');

var _config2 = _interopRequireDefault(_config);

_lib2['default'].listen(_config2['default'].server.port);
//# sourceMappingURL=../bin/server.js.map