require('dotenv').config({
	path: '../.env'
});

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const webpush = require('web-push');
const randomstring = require('randomstring');

const { saveToDatabase, sendNotification, getSubscription } = require('./helpers');

const app = express();
const VAPID_KEYS = {
	PUBLIC_KEY: process.env.PUBLIC_KEY,
	PRIVATE_KEY: process.env.PRIVATE_KEY
};

webpush.setVapidDetails('mailto:work.yomesh@gmail.com', VAPID_KEYS.PUBLIC_KEY, VAPID_KEYS.PRIVATE_KEY);

app.use(cors());
app.use(bodyParser.json());

app.get('/', (req, res) => res.send('Hello World!'));

app.post('/subscriptions', async (req, res) => {
	try {
		const subscription = req.body;
		const key = randomstring.generate({
			length: 7,
			charset: 'alphanumeric'
		});
		await saveToDatabase({
			[key]: subscription
		});
		return res.status(200).json({ message: 'Subscription Saved', key });
	} catch (err) {
		console.log(err);
		return res.status(500).json({ message: 'Something went wrong' });
	}
});

app.get('/notifications/send/:key', async (req, res) => {
	if (!req.params.key) return res.status(400).json({ message: 'Invalid Request' });

	try {
		const subscription = await getSubscription(req.params.key);

		await sendNotification(subscription);
		return res.json({ message: 'Notification sent' });
	} catch (err) {
		console.log(err);
		return res.status(500).json({ message: 'Something went wrong', details: err.message });
	}
});

app.listen(process.env.PORT, () => console.log(`Example app listening on port ${process.env.PORT}!`));
