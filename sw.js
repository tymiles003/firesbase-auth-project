const dynamicCacheName = 'site-dynamic-v1';
const staticCacheName   = 'site-static-v1';
             console.log('site-version-v1');
const assets = [
    '/',
    '/index.html',
    '/fallback.html', 
    '/img/profile.jpg',
    '/img/Stethoscope.jpg',
    '/img/icons/icon-144x144.png',
    '/img/icons/icon-192x192.png',
    '/img/icons/icon-72x72.png',
    '/img/icons/icon-96x96.png',
    '/manifest.json',
    '/css/style.css',
    '/scripts/auth.js',
    '/scripts/app.js',
    '/scripts/index.js',
    '/scripts/init.js',
    '/scripts/pin_location.js',
    'https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/js/materialize.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/css/materialize.min.css',
    'https://fonts.googleapis.com/icon?family=Material+Icons',
    'https://fonts.gstatic.com/s/materialicons/v48/flUhRq6tzZclQEJ-Vdg-IuiaDsNcIhQ8tQ.woff2'
];

// cache size limit function 
const limitCacheSize = (name, size) => {
    caches.open(name).then(cache => {
        cache.keys().then(keys => {
            if (keys.length > size) {
                cache.delete(keys[0]).then(limitCacheSize(name, size));
            }
        });
    });
};

// install event 
self.addEventListener('install', evt => {
    // console.log('service worker installed jdslk');
    evt.waitUntil(
        caches.open(staticCacheName).then((cache) => {
            cache.addAll(assets);
            // console.log('caching shell assets...jdslk');
        })
    );
});

// activate event
self.addEventListener('activate', evt => {
    // console.log('service worker activated jdslk');
    evt.waitUntil(
        caches.keys().then(keys => {
            // console.log(keys);
            return Promise.all(keys
                .filter(key => key !== staticCacheName && key !== dynamicCacheName)
                .map(key => caches.delete(key))
            );
        })
    );
});

// fetch event 
self.addEventListener('fetch', evt => {
    if (evt.request.url.indexOf('firestore.googleapis.com') === -1) {
        // console.log('fetching jdslk');
        evt.respondWith(
            caches.match(evt.request).then(cacheRes => {
                return cacheRes || fetch(evt.request).then(fetchRes => {
                    return caches.open(dynamicCacheName).then(cache => {
                        cache.put(evt.request.url, fetchRes.clone());
                        // check cached items size
                        limitCacheSize(dynamicCacheName, 30);
                        return fetchRes;
                    })
                });
            }).catch(() => caches.match('fallback.html'))
        );
    }
});


// //listen to notification clicks
// self.addEventListener('notificationclick', event => {
//     const notification = event.notification;
//     const action = event.action;
//     if (action === 'close') {
//         notification.close();
//     } else {
//         clients.openWindow('/respond');
//     }
// });

// self.addEventListener('notificationclose', event => {
//     const notification = event.notification;
//     const primaryKey = notification.data.primaryKey;
//     console.log('Closed Notification', event);
// }); 