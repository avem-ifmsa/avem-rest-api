import bunyan from 'bunyan';

import config from '../../config';

const logger = bunyan({
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

export default logger;

export function logRequest() {
	return (req, res, next) => {
		logger.info({ req: req });
		next();
	};
}

export function logErrors() {
	return (err, req, res, next) => {
		logger.error(err);
		next(err);
	};
}
