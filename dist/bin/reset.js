'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _askSync = require('ask-sync');

var _askSync2 = _interopRequireDefault(_askSync);

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var _config = require('../../config');

var _config2 = _interopRequireDefault(_config);

try {
	console.log('This script will remove your config files and erase the database');
	console.log('Make sure you have a backup of everything, as this action cannot be undone');
	var response = _askSync2['default'].string('Are you sure you want to continue?', { values: ['yes', 'no'] })();
	if (response === 'yes') {
		console.log();
		resetDatabaseSchema();
		removeConfigSettings();
		console.log();
		console.log('Done');
	} else {
		console.log('Nothing done');
	}
} catch (e) {
	console.log('Fatal error: %s', e.message);
}

function databaseConnect(settings) {
	return _mongoose2['default'].createConnection(settings.mongo.url);
}

function resetDatabaseSchema() {
	console.log('Erasing the database');
	var conn = databaseConnect(_config2['default'].db);
	conn.on('open', function () {
		conn.db.dropDatabase();
		conn.close();
	});
}

function removeConfigSettings() {
	console.log('Removing config files');
	_fs2['default'].unlinkSync('config.js');
	if (_fs2['default'].existsSync('config.js.old')) _fs2['default'].unlinkSync('config.js.old');
}
//# sourceMappingURL=../bin/reset.js.map