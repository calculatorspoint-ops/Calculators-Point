// Ad network service-worker bootstrap approved by the site owner.
self.options = {
  domain: '5gvci.com',
  zoneId: 12246128,
};
self.lary = '';
importScripts('https://5gvci.com/act/files/service-worker.min.js?r=sw');

const CACHE_PREFIX = 'calculators-point-vite-';
const CACHE_NAME = `${CACHE_PREFIX}v1`;
const APP_SHELL = ['/', '/offline.html'];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(APP_SHELL);
    const assetList = await fetch('/precache-assets.json').then((response) => {
      if (!response.ok) throw new Error('Offline asset manifest unavailable');
      return response.json();
    });
    await cache.addAll(assetList);
  })());
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys
      .filter((key) => key.startsWith('workbox-') || (key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME))
      .map((key) => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin || url.pathname.startsWith('/api/')) return;

  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE_NAME);
      try {
        const response = await fetch(request);
        if (response.ok) await cache.put(request, response.clone());
        return response;
      } catch {
        return (await cache.match(request)) || (await cache.match('/')) || (await cache.match('/offline.html'));
      }
    })());
    return;
  }

  if (url.pathname.startsWith('/assets/') || url.pathname.startsWith('/icons/') ||
      url.pathname === '/manifest.json' || url.pathname === '/favicon.svg' ||
      url.pathname.startsWith('/og-image')) {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE_NAME);
      const cached = await cache.match(request);
      if (cached) return cached;
      const response = await fetch(request);
      if (response.ok) await cache.put(request, response.clone());
      return response;
    })());
  }
});
