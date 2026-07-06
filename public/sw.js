self.addEventListener('push', function(event) {
  if (!event.data) return;

  let data = {};
  try {
    data = event.data.json();
  } catch (error) {
    data = { title: 'AgriPulse', body: event.data.text() };
  }

  const options = {
    body: data.body || 'Nouvelle notification',
    icon: data.icon || '/logo_agri_pulse.png',
    badge: data.badge || '/logo_agri_pulse.png',
    vibrate: [100, 50, 100],
    tag: data.tag || 'agripulse-notification',
    renotify: true,
    data: { url: data.url || '/notifications' },
    actions: [
      { action: 'open', title: 'Voir' },
      { action: 'close', title: 'Fermer' },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'AgriPulse', options)
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  if (event.action === 'close') return;

  const url = event.notification.data?.url || '/notifications';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      for (const client of clientList) {
        if (client.url.includes(url) && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
