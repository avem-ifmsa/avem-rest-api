var bunyan = require('bunyan');
var config = require('./config');

var logger = bunyan({
	src: true,
	name: 'avem-rest-api',
	streams: [
		{
			level: 'info',
			stream: process.stdout,
		}, {
			level: 'error',
			path: config.logging.outputPath,
		}
	],
	serializers: bunyan.stdSerializers,
});

function logRequest() {
	return function(req, res, next) {
		logger.info({ req: req });
		next();
	};
}

function logErrors() {
	return function(err, req, res, next) {
		logger.error(err);
		next(err);
	};
}

module.exports = exports = logger;
exports.logRequest = logRequest;
exports.logErrors = logErrors;
