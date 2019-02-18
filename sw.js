importScripts('https://www.gstatic.com/firebasejs/5.8.3/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/5.8.3/firebase-messaging.js');

firebase.initializeApp({
  messagingSenderId: '612760751599'
})
const messaging = firebase.messaging();

self.addEventListener('sync', () => {
  const notificationPromise = self.registration.showNotification('Me reconecté', {
    body: 'Ahora ya tengo internet',
  });
  event.waitUntil(notificationPromise);
});

// self.addEventListener('push', (event) => {
//   console.log('[Service Worker] Push Received.')

//   const data = event.data.json()
//   console.log('data:', data)

//   if (Date.parse(data.date) <= (Date.now()-1000*60*5)) {
//     // No mostrar porque la antigüedad es mayor a 5 minutos
//     console.log('Este mensaje push no se mostrará')
//     return
//   }


//   const options = {
//     body: data.body || 'Body de ejemplo',
//     icon: data.icon || 'images/icon.png',
//     badge: data.badge || 'images/badge.png'
//   };
//   // si la notificación es muy antigua, no la muestres
//   const notificationPromise = self.registration.showNotification(data.title, options);
//   event.waitUntil(notificationPromise);
// });

self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification click Received.')
  // event.notification.close();
  // event.waitUntil(
  //   clients.openWindow('https://developers.google.com/web/')
  // );

  console.log('On notification click: ', event.notification.tag);
  event.notification.close();

  // This looks to see if the current is already open and
  // focuses if it is
  event.waitUntil(clients.matchAll({
    type: 'window'
  }).then(function(clientList) {
    for (let i = 0; i < clientList.length; i++) {
      let client = clientList[i];
      if (client.url == '/' && 'focus' in client)
        return client.focus();
    }
    if (clients.openWindow)
      return clients.openWindow('/');
  }));
});
