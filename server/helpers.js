const Promise = require('bluebird');
const jsonFile = Promise.promisifyAll(require('jsonfile'));
const webpush = require('web-push');
const path = require('path');

const { DB_FILE } = require('./constants');

const readJsonFile = (filePath = DB_FILE) => {
	return jsonFile.readFileAsync(path.resolve(filePath));
};

const writeJsonFile = (filePath = DB_FILE, data, options = {}) => {
	return jsonFile.writeFileAsync(path.resolve(filePath), data, { spaces: 4, ...options });
};

const getSubscription = async key => {
	const content = await readJsonFile();
	if (content && content.subscriptions && content.subscriptions[key]) return content.subscriptions[key];

	return Promise.reject('No Key Found');
};

const saveToDatabase = async data => {
	return readJsonFile().then(content => {
		return writeJsonFile(DB_FILE, {
			subscriptions: {
				...content.subscriptions,
				...data
			}
		});
	});
};

const sendNotification = (subscription, dataToSend = {}) => {
	const data = 'Let us kill Coronavirus';
	return webpush.sendNotification(subscription, data);
};

module.exports = {
	saveToDatabase,
	readJsonFile,
	writeJsonFile,
	sendNotification,
	getSubscription
};
