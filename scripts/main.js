const applicationServerPublicKey =
  'BFLC04x0AytV6UPLTxBHFtGMlLmmq6Gy-DWvEEu86Bp1POYtvAuQK_LUxlv1iauS6ojsNbVNbz3mfwoGFhJsCQo';
const subscriptionURL = 'https://fire-node.glitch.me/subscribe';

const pushButton = document.querySelector('.js-push-btn');

let isSubscribed = false;
let swRegistration = null;

// Initialize Firebase
const config = {
  apiKey: "AIzaSyDPZ6u2-wMDFTrXMP7H7sAjG4S33-sXlIA",
  authDomain: "pruebawpn.firebaseapp.com",
  databaseURL: "https://pruebawpn.firebaseio.com",
  projectId: "pruebawpn",
  storageBucket: "pruebawpn.appspot.com",
  messagingSenderId: "612760751599"
};
firebase.initializeApp(config);

const messaging = firebase.messaging()

function urlB64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

if ('serviceWorker' in navigator && 'PushManager' in window) {
  console.log('Service Worker and Push is supported');

  navigator.serviceWorker.register('sw.js')
  .then(function(swReg) {
    console.log('Service Worker is registered', swReg);

    // Registrar el service worker al servicio de messaging firebase
    messaging.useServiceWorker(swReg);
    swRegistration = swReg;
    initialiseUI();
  })
  .catch(function(error) {
    console.error('Service Worker Error', error);
  });
} else {
  console.warn('Push messaging is not supported');
  pushButton.textContent = 'Los mensajes Push no están soportados';
}

function initialiseUI() {
  pushButton.addEventListener('click', function() {
    pushButton.disabled = true;
    if (isSubscribed) {
      console.log('estaba suscrito');
      unsubscribeUser();
    } else {
      console.log('no estaba suscrito');
      subscribeUser();
    }
  });

  // Set the initial subscription value
  swRegistration.pushManager.getSubscription()
  .then(function(subscription) {
    isSubscribed = !(subscription === null);

    // updateSubscriptionOnServer(subscription);

    // if (isSubscribed) {
    //   console.log('User IS subscribed.');
    // } else {
    //   console.log('User is NOT subscribed.');
    // }

    updateBtn();
  });
}

function updateBtn() {
  if (Notification.permission === 'denied') {
    pushButton.textContent = 'Mesajes Push bloqueados.';
    pushButton.disabled = true;
    updateSubscriptionOnServer(null);
    return;
  }

  if (isSubscribed) {
    pushButton.textContent = 'Desuscribir a mensajes Push';
  } else {
    pushButton.textContent = 'Suscribir a mensajes Push';
  }

  pushButton.disabled = false;
}

function pedirNotificacion() {
  Notification.requestPermission((status) => {
    console.log('status:', status);
    updateBtn();
  });
}

const suscribirUsuario = () => {
  messaging.requestPermission()
  .then(() => {
    console.log('Recibido permiso.');
    return messaging.getToken()
  })
  .then((token) => {
    console.log('token:', token)
  })
  .catch(function(err) {
    console.log('No se ha obtenido permiso', err);
  });
}

function subscribeUser() {
  console.log('se quiere suscribir al usuario a push manager');
  const applicationServerKey = urlB64ToUint8Array(applicationServerPublicKey);

  swRegistration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: applicationServerKey
  })
  .then(function(subscription) {
    console.log('User is subscribed:', subscription);

    updateSubscriptionOnServer(subscription);

    isSubscribed = true;

    updateBtn();
  })
  .catch(function(err) {
    console.log('Failed to subscribe the user: ', err);
    updateBtn();
  });
}

function unsubscribeUser() {
  swRegistration.pushManager.getSubscription()
  .then(function(subscription) {
    if (subscription) {
      return subscription.unsubscribe();
    }
  })
  .catch(function(error) {
    console.log('Error unsubscribing', error);
  })
  .then(function() {
    updateSubscriptionOnServer(null);

    console.log('User is unsubscribed.');
    isSubscribed = false;

    updateBtn();
  });
}

function updateSubscriptionOnServer(subscription) {
  console.log('subscription:', subscription);
  fetch(subscriptionURL, {
    method: subscription ? 'POST' : 'PUT',
    body: JSON.stringify(subscription),
    headers: {
      'content-type': 'application/json'
    }
  })
  .then(() => {
    console.log('Se suscribió al usuario.');
    const subscriptionJson = document.querySelector('.js-subscription-json');
    const subscriptionDetails =
      document.querySelector('.js-subscription-details');
    if (subscription) {
      subscriptionJson.textContent = JSON.stringify(subscription);
      subscriptionDetails.classList.remove('is-invisible');
    } else {
      subscriptionDetails.classList.add('is-invisible');
    }
  })
  .catch((error) => console.log('Error al suscribir:', error));
}
