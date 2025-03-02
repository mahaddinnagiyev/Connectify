self.addEventListener('push', (event) => {
    const data = event.data.json();
    const title = data.title || 'New Notification';
    const options = {
        body: data.body,
        data: data.data,
    };
    console.log(event.waitUntil(self.registration.showNotification(title, options)));
    event.waitUntil(self.registration.showNotification(title, options));
});