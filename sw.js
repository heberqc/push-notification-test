/*
*
*  Push Notifications codelab
*  Copyright 2015 Google Inc. All rights reserved.
*
*  Licensed under the Apache License, Version 2.0 (the "License");
*  you may not use this file except in compliance with the License.
*  You may obtain a copy of the License at
*
*      https://www.apache.org/licenses/LICENSE-2.0
*
*  Unless required by applicable law or agreed to in writing, software
*  distributed under the License is distributed on an "AS IS" BASIS,
*  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
*  See the License for the specific language governing permissions and
*  limitations under the License
*
*/

/* eslint-env browser, serviceworker, es6 */

'use strict';

self.cache = {
  name: 'cache',
  version: '0.0.2'
};

self.addEventListener('sync', () => {
  const notificationPromise = self.registration.showNotification('Me reconecté', {
    body: 'Ahora ya tengo internet',
  });
  event.waitUntil(notificationPromise);
});

self.addEventListener('push', function(event) {
  console.log('[Service Worker] Push Received.');

  const data = event.data.json();
  console.log('data:', data);

  if (Date.parse(data.date) <= (Date.now()-1000*60*5)) {
    // No mostrar porque la antigüedad es mayor a 5 minutos
    console.log('Este mensaje push no se mostrará');
    return;
  }


  const options = {
    body: data.body || 'Body de ejemplo',
    icon: data.icon || 'images/icon.png',
    badge: data.badge || 'images/badge.png'
  };
  // si la notificación es muy antigua, no la muestres
  const notificationPromise = self.registration.showNotification(data.title, options);
  event.waitUntil(notificationPromise);
});

self.addEventListener('notificationclick', function(event) {
  console.log('[Service Worker] Notification click Received.');

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
