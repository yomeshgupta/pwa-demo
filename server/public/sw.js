const urlB64ToUint8Array = base64String => {
	const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
	const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
	const rawData = atob(base64);
	const outputArray = new Uint8Array(rawData.length);
	for (let i = 0; i < rawData.length; ++i) {
		outputArray[i] = rawData.charCodeAt(i);
	}
	return outputArray;
};

const saveSubscription = async (subscription, email) => {
	const SERVER_URL = 'https://pwa.devtools.tech/subscriptions';
	const response = await fetch(SERVER_URL, {
		method: 'post',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ subscription: JSON.stringify(subscription), email })
	});
	return response.json();
};

const subscribe = async email => {
	try {
		// IF YOU ARE READING THIS THEN DONT USE THIS KEY
		const applicationServerKey = urlB64ToUint8Array(
			'BG_tjsMD8YXsch3wHc2kTnE45sKhGx32AH8Cmyow9np0Yeq4B9x8NFq7ShlFtkt2yJxihgQrubzxhtoSMNfBeio'
		);
		const options = { applicationServerKey, userVisibleOnly: true };
		const subscription = await self.registration.pushManager.subscribe(options);
		const response = await saveSubscription(subscription, email);
		console.log(`Subscribed. Make a request to https://pwa.devtools.tech/notifications/send/${response.key}`);
	} catch (err) {
		console.log('Error', err);
	}
};

const showLocalNotification = (title, body, swRegistration) => {
	const options = {
		body,
		vibrate: [100, 50, 100],
		data: {
			dateOfArrival: Date.now(),
			primaryKey: 1
		},
		actions: [
			{
				action: 'explore',
				title: 'Explore this new world'
			},
			{ action: 'close', title: 'Close notification' }
		] // here you can add more properties like icon, image, vibrate, etc.
	};
	swRegistration.showNotification(title, options);
};

self.addEventListener('push', function(event) {
	if (event.data) {
		showLocalNotification('Hey Hey! Server Side Request', event.data.text(), self.registration);
	} else {
		console.log('Push event but no data');
	}
});

self.addEventListener('message', function(e) {
	data = JSON.parse(e.data);
	subscribe(data.email);
});
