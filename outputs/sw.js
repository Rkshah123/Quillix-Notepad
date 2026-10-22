const CACHE_NAME = 'quillix-notepad-v38';
const APP_ASSETS = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './manifest.webmanifest',
  './icon.svg',
  './quillix-512.png',
  './quillix-icon-180.png',
  './quillix-maskable.png',
  './vendor/codemirror/codemirror.min.css',
  './vendor/codemirror/foldgutter.min.css',
  './vendor/codemirror/dracula.min.css',
  './vendor/codemirror/monokai.min.css',
  './vendor/codemirror/one-dark.min.css',
  './vendor/codemirror/codemirror.min.js',
  './vendor/codemirror/closebrackets.min.js',
  './vendor/codemirror/matchbrackets.min.js',
  './vendor/codemirror/foldcode.min.js',
  './vendor/codemirror/foldgutter.min.js',
  './vendor/codemirror/brace-fold.min.js',
  './vendor/codemirror/indent-fold.min.js',
  './vendor/codemirror/javascript.min.js',
  './vendor/codemirror/clike.min.js',
  './vendor/codemirror/python.min.js',
  './vendor/codemirror/xml.min.js',
  './vendor/codemirror/css.min.js',
  './vendor/codemirror/htmlmixed.min.js',
  './vendor/codemirror/markdown.min.js',
  './vendor/codemirror/sql.min.js',
  './vendor/codemirror/yaml.min.js',
  './vendor/codemirror/typescript.min.js',
  './vendor/pdf-lib.min.js',
  './vendor/mammoth.browser.min.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  if (new URL(event.request.url).origin !== self.location.origin) return;

  /* Navigations and the app shell go network-first. Caching index.html
     cache-first pinned the shell forever, so a new build (and its bumped
     ?v= asset URLs) could never reach an installed app or an open tab. */
  const url = new URL(event.request.url);
  const isNavigation = event.request.mode === 'navigate' ||
    url.pathname.endsWith('/') || url.pathname.endsWith('index.html');

  if (isNavigation) {
    event.respondWith(
      fetch(event.request).then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      }).catch(() => caches.match(event.request).then((cached) => cached || caches.match('./index.html')))
    );
    return;
  }

  /* Same for app assets: network-first with cache fallback. A cache-first
     copy of style.css/script.js under a bumped ?v= URL would keep serving the
     previous build's file forever (the URL never changes again after the
     first cached fetch), so an update could only land via a cache-name bump. */
  event.respondWith(
    fetch(event.request).then((response) => {
      if (response && response.ok) {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
      }
      return response;
    }).catch(() => caches.match(event.request).then((cached) => cached || caches.match('./index.html')))
  );
});
