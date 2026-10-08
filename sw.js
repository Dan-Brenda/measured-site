/* Measured Size's service worker (Phase 387). Built by release/site.js from the files it keeps. Not edited by hand. */
'use strict';
const VERSION = 'fc3853aacc199796';
const CACHE = 'measured-size-' + VERSION;
const FILES = {
  "bra-size-calculator.html": {
    "text": true,
    "sha256": "3bae11aca17f539bfcc00b9539006dddd5f7a9d5130ba65e0c41a4f0111d529d"
  },
  "bra-size-calculator-data.js": {
    "text": true,
    "sha256": "9502162a8fe19ba8adf76ee7d1fb4e249849883a75fe9faad88db5f6bf649d98"
  },
  "bra-size-calculator.js": {
    "text": true,
    "sha256": "edb1916066a07378979bd483b77a13d02c65cd1aea88d9b0dc43db30c8463b99"
  },
  "manifest.webmanifest": {
    "text": true,
    "sha256": "02083b5df2ee39c096a7715bf339c46d8b5d48d3887d645c909ed7621b46d9c6"
  },
  "icon-192.png": {
    "text": false,
    "sha256": "5bbbb4136054831d18f4787a8be7903e736f12f2566dfd6a69e7517883b44d77"
  },
  "icon-512.png": {
    "text": false,
    "sha256": "77ff817737c0f097c193257907c181132ba53b6d321175e903bdc82e269f5874"
  },
  "icon-maskable-192.png": {
    "text": false,
    "sha256": "76d0091a43dde22f9dd02ebb9146ae111f6953762986c66f2dea0ba5158f13aa"
  },
  "icon-maskable-512.png": {
    "text": false,
    "sha256": "0cf93cc7004110aeee88ecb7f208788f28eb5948624eb009a2d8b393f24878f3"
  },
  "apple-touch-icon.png": {
    "text": false,
    "sha256": "f2204ebb1b6a09f3d61e02ebf48d697079647a4a372abaadc0bdba5182482343"
  }
};
const BASE = new URL('./', self.location).pathname;

function hex(buffer) {
  return Array.from(new Uint8Array(buffer), (b) => b.toString(16).padStart(2, '0')).join('');
}

async function fetchChecked(name) {
  const response = await fetch(new Request(name, { cache: 'reload' }));
  if (!response.ok) throw new Error(name + ': ' + response.status);
  const body = FILES[name].text
    ? new TextEncoder().encode((await response.clone().text()).replace(/\r\n/g, '\n'))
    : await response.clone().arrayBuffer();
  const digest = hex(await crypto.subtle.digest('SHA-256', body));
  if (digest !== FILES[name].sha256) throw new Error(name + ' is not this build');
  return response;
}

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const fetched = await Promise.all(Object.keys(FILES).map(async (name) => [name, await fetchChecked(name)]));
    const cache = await caches.open(CACHE);
    await Promise.all(fetched.map(([name, response]) => cache.put(name, response)));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter((name) => name.startsWith('measured-size-') && name !== CACHE).map((name) => caches.delete(name)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || !url.pathname.startsWith(BASE)) return;
  const name = url.pathname.slice(BASE.length);
  if (!Object.prototype.hasOwnProperty.call(FILES, name)) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    return (await cache.match(name)) || fetch(request);
  })());
});
