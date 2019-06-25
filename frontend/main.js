/*
*
*  Push Notifications codelab
*  Copyright 2015 Google Inc. A
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
*Codelab
*/

/* eslint-env browser, es6 */

'use strict';

const applicationServerPublicKey = 'BEa2C9BI-H4Ri4ruHGHSJsdEnJFC-hILBxjS8H-LR5A_w0mnZWaCQiyTdVeiBFeYvyiPXpRyUytx4fP0wFLbaiI';

const pushButton = document.querySelector('.js-push-btn');

let isSubscribed = false;
let swRegistration = null;

/******************************************
 * 
 */
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

/******************************************
 * 
 */
function updateBtn() {
  if (Notification.permission === 'denied') {
    pushButton.textContent = 'Push Messaging Blocked.';
    pushButton.disabled = true;
    updateSubscriptionOnServer(null);
    return;
  }

  if (isSubscribed) {
    pushButton.textContent = 'Disable Push Messaging';
  } else {
    pushButton.textContent = 'Enable Push Messaging';
  }

  pushButton.disabled = false;
}

/******************************************
 * 
 */
function updateSubscriptionOnServer(subscription) {
  // saveSubscription saves the subscription to the backend
  const saveSubscription = async subscription => {
  const SERVER_URL = 'http://vps191572.vps.ovh.ca/webpushdemo/savesubscription.php'
  const response = await fetch(SERVER_URL, {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(subscription),
  })
  
  return response.json()
 }
 
  // on met a jour le label
  const subscriptionJson = document.querySelector('#js-subscription-json');

  if (subscription) {
    subscriptionJson.textContent = JSON.stringify(subscription);
  } 
}

/******************************************
 * 
 */
function subscribeUser() {
  const applicationServerKey = urlB64ToUint8Array(applicationServerPublicKey);
  swRegistration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: applicationServerKey
  })
  .then(function(subscription) {
    
    console.log('User is subscribed.');

    updateSubscriptionOnServer(subscription);

    isSubscribed = true;

    updateBtn();
  })
  .catch(function(err) {
    console.log('Failed to subscribe the user: ', err);
    updateBtn();
  });
}

/******************************************
 * 
 */
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

/******************************************
 * 
 */
function initializeUI() {
  // Installation des captures  
  pushButton.addEventListener('click', function() {
    pushButton.disabled = true;
    if (isSubscribed) {
      unsubscribeUser();
    } else {
      subscribeUser();
    }
  });
  
  // Installation des captures
  self.addEventListener('activate', async () => {
    // This will be called only once when the service worker is activated.
    try {
      const options = {}
      const subscription = await self.registration.pushManager.subscribe(options)
      console.log(JSON.stringify(subscription))
    } catch (err) {
      console.log('Error', err)
    }
  });

  // Set the initial subscription value
  swRegistration.pushManager.getSubscription()
  .then(function(subscription) {
    isSubscribed = !(subscription === null);

    // updateSubscriptionOnServer(subscription);

    if (isSubscribed) {
      console.log('User IS subscribed.');
    } else {
      console.log('User is NOT subscribed.');
    }

    updateBtn();
  });
}


/******************************************
 *            MAIN 
 */

if ('serviceWorker' in navigator) {
  if ( 'PushManager' in window) {
    console.log('Service Worker and Push is supported');

    navigator.serviceWorker.register('sw.js')
    .then(function(swReg) {
      console.log('Service Worker is registered', swReg);

      swRegistration = swReg;
      initializeUI();
    })
    .catch(function(error) {
      console.error('Service Worker Error', error);
    });
  } else {
    console.warn('Push messaging is not supported');
    pushButton.textContent = 'Push Not Supported';
  }
} else {
  console.warn('ServiceWorker is not supported');
  pushButton.textContent = 'ServiceWorker Not Supported';
}

