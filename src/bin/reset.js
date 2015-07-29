import fs from 'fs';
import path from 'path';
import ask from 'ask-sync';
import mongoose from 'mongoose';

import config from '../../config';

try {
	console.log('This script will remove your config files and erase the database');
	console.log('Make sure you have a backup of everything, as this action cannot be undone');
	let response = ask.string('Are you sure you want to continue?', { values: ['yes','no'] })();
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
	return mongoose.createConnection(settings.mongo.url);
}

function resetDatabaseSchema() {
	console.log('Erasing the database');
	let conn = databaseConnect(config.db);
	conn.on('open', () => {
		conn.db.dropDatabase();
		conn.close();
	});
}

function removeConfigSettings() {
	console.log('Removing config files');
	fs.unlinkSync('config.js');
	if (fs.existsSync('config.js.old'))
		fs.unlinkSync('config.js.old');
}
