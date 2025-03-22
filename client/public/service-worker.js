self.addEventListener('push', (event) => {
    const payload = event.data?.json() || {};
    const title = payload.title || 'Yeni Mesaj';

    const options = {
        body: payload.body,
        data: payload.data,
        icon: "./vite.svg",
        bagde: "./vite.svg",
        renotify: true,
        tag: 'New Message',
        vibrate: [200, 100, 200],
        actions: [
            { action: 'open', title: 'Open' },
            { action: 'close', title: 'Close' }
        ],
        sound: './notification.mp3'
    };

    event.waitUntil(self.registration.showNotification(title, options));
});

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', event => {
        if (event.data.type === 'PLAY_SOUND') {
            const audio = new Audio(event.data.url);
            audio.play().catch(error => console.log('Audio error:', error));
        }
    });
}

self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    if (event.action === 'close') {
        return;
    }

    const urlToOpen = new URL(
        `/messenger?room=${event.notification.data.roomId}`,
        self.location.origin
    ).href;

    event.waitUntil(
        clients.matchAll({
            type: 'window',
            includeUncontrolled: true,
        }).then((clientList) => {
            const activeClient = clientList.find(
                (client) =>
                    client.url === urlToOpen && client.visibilityState === 'visible'
            );

            if (activeClient) {
                return activeClient.focus();
            } else {
                return clients.openWindow(urlToOpen);
            }
        })
    );
});
