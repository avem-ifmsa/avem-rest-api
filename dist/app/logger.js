'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});
exports.logRequest = logRequest;
exports.logErrors = logErrors;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _bunyan = require('bunyan');

var _bunyan2 = _interopRequireDefault(_bunyan);

var _config = require('../../config');

var _config2 = _interopRequireDefault(_config);

var logger = (0, _bunyan2['default'])({
	src: true,
	name: 'avem-rest-api',
	streams: [{
		level: 'info',
		stream: process.stdout
	}, {
		level: 'error',
		path: _config2['default'].logging.outputPath
	}],
	serializers: _bunyan2['default'].stdSerializers
});

exports['default'] = logger;

function logRequest() {
	return function (req, res, next) {
		logger.info({ req: req });
		next();
	};
}

function logErrors() {
	return function (err, req, res, next) {
		logger.error(err);
		next(err);
	};
}
//# sourceMappingURL=../app/logger.js.map