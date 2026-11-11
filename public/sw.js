self.addEventListener('push', (event) => {
  let payload = { title: 'Happy Nest', body: 'New PG update', url: '/notifications' };
  try {
    if (event.data) payload = { ...payload, ...event.data.json() };
  } catch {
    payload.body = event.data ? event.data.text() : payload.body;
  }
  event.waitUntil(
    self.registration.showNotification(payload.title || 'Happy Nest', {
      body: payload.body,
      icon: '/logo.png',
      data: { url: payload.url || '/notifications' },
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = event.notification.data?.url || '/notifications';
  event.waitUntil(self.clients.openWindow(target));
});
