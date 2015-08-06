'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _cors = require('cors');

var _cors2 = _interopRequireDefault(_cors);

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _compression = require('compression');

var _compression2 = _interopRequireDefault(_compression);

var _config = require('../../config');

var _config2 = _interopRequireDefault(_config);

var _passport = require('./passport');

var _passport2 = _interopRequireDefault(_passport);

var _logger = require('./logger');

var logger = _interopRequireWildcard(_logger);

var _controllers = require('./controllers');

var controllers = _interopRequireWildcard(_controllers);

_mongoose2['default'].connect(_config2['default'].db.mongo.url);

var app = (0, _express2['default'])();
exports['default'] = app;

app.set('json spaces', 2);

app.use((0, _compression2['default'])());
app.use(_bodyParser2['default'].urlencoded({ extended: true }));
app.use(_bodyParser2['default'].json({ type: 'application/vnd.api+json' }));
app.use((0, _cors2['default'])(_config2['default'].cors));
app.use(_passport2['default'].initialize());
app.use(logger.logRequest());

app.use('/', controllers.root);
app.use('/oauth2', controllers.oauth2);
app.use('/users', controllers.users);
app.use('/roles', controllers.roles);
app.use('/clients', controllers.clients);
app.use('/sessions', controllers.sessions);
app.use('/access-tokens', controllers.accessTokens);
app.use('/refresh-tokens', controllers.refreshTokens);
module.exports = exports['default'];
//# sourceMappingURL=../app/index.js.map