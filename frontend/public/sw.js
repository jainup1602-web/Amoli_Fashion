// ─── Amoli Fashion Jewellery — Offline-First Service Worker ───────────────────
// Strategy:
//   Shell (HTML/JS/CSS)  → Cache-first, revalidate in background
//   Images               → Cache-first, network fallback, long TTL
//   API (products/cats)  → Network-first, stale cache fallback (5 min TTL)
//   API (orders/cart)    → Network-only (never stale)
//   Navigate             → Cache-first shell, network revalidate
// ──────────────────────────────────────────────────────────────────────────────

const SHELL_CACHE   = 'amoli-shell-v2';
const IMAGE_CACHE   = 'amoli-images-v2';
const API_CACHE     = 'amoli-api-v2';
const OFFLINE_PAGE  = '/offline';

// App shell — critical assets cached on install
const SHELL_ASSETS = [
  '/',
  '/products',
  '/cart',
  '/offline',
  '/image/Amoli_2.png',
  '/image/Amoli_1.png',
  '/placeholder.svg',
  '/manifest.json',
];

// API routes safe to cache (public, non-personal)
const CACHEABLE_APIS = [
  '/api/products',
  '/api/categories',
  '/api/banners',
  '/api/settings',
  '/api/marquee',
  '/api/showcases',
  '/api/model-gallery',
  '/api/video-reviews',
  '/api/shipping/pincode-info',
];

// API routes that must NEVER be cached
const NEVER_CACHE_APIS = [
  '/api/cart',
  '/api/orders',
  '/api/wishlist',
  '/api/auth',
  '/api/admin',
  '/api/make-admin',
];

const API_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// ── Install ──────────────────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) =>
      Promise.allSettled(
        SHELL_ASSETS.map((url) => cache.add(url).catch(() => {}))
      )
    )
  );
  self.skipWaiting();
});

// ── Activate ─────────────────────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  const CURRENT_CACHES = [SHELL_CACHE, IMAGE_CACHE, API_CACHE];
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => !CURRENT_CACHES.includes(k))
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// ── Helpers ───────────────────────────────────────────────────────────────────
function isCacheableApi(pathname) {
  return CACHEABLE_APIS.some((p) => pathname.startsWith(p));
}

function isNeverCacheApi(pathname) {
  return NEVER_CACHE_APIS.some((p) => pathname.startsWith(p));
}

function isApiCacheFresh(response) {
  if (!response) return false;
  const date = response.headers.get('sw-cached-at');
  if (!date) return false;
  return Date.now() - parseInt(date) < API_CACHE_TTL;
}

function addTimestamp(response) {
  const headers = new Headers(response.headers);
  headers.set('sw-cached-at', Date.now().toString());
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

function offlineApiResponse() {
  return new Response(
    JSON.stringify({ success: false, error: 'offline', message: 'You are offline. Showing cached data.' }),
    { status: 503, headers: { 'Content-Type': 'application/json' } }
  );
}

// ── Fetch ─────────────────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle GET from same origin
  if (request.method !== 'GET') return;
  if (url.protocol === 'chrome-extension:') return;
  if (url.origin !== self.location.origin) return;

  const path = url.pathname;

  // ── 1. Never-cache APIs (cart, orders, auth) — network only ──────────────
  if (path.startsWith('/api/') && isNeverCacheApi(path)) {
    event.respondWith(
      fetch(request).catch(offlineApiResponse)
    );
    return;
  }

  // ── 2. Cacheable APIs — network first, stale fallback ────────────────────
  if (path.startsWith('/api/') && isCacheableApi(path)) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(API_CACHE);
        const cached = await cache.match(request);

        // Return fresh cache immediately (< 5 min old)
        if (cached && isApiCacheFresh(cached)) {
          // Revalidate in background
          fetch(request)
            .then((res) => { if (res.ok) cache.put(request, addTimestamp(res.clone())); })
            .catch(() => {});
          return cached;
        }

        // Try network
        try {
          const res = await fetch(request);
          if (res.ok) {
            cache.put(request, addTimestamp(res.clone()));
          }
          return res;
        } catch {
          // Offline — return stale cache if available
          if (cached) return cached;
          return offlineApiResponse();
        }
      })()
    );
    return;
  }

  // ── 3. Other API calls — network first, offline fallback ─────────────────
  if (path.startsWith('/api/')) {
    event.respondWith(
      fetch(request).catch(offlineApiResponse)
    );
    return;
  }

  // ── 4. Images — cache first, long TTL ────────────────────────────────────
  if (request.destination === 'image') {
    event.respondWith(
      (async () => {
        const cache = await caches.open(IMAGE_CACHE);
        const cached = await cache.match(request);
        if (cached) return cached;

        try {
          const res = await fetch(request);
          if (res.ok) cache.put(request, res.clone());
          return res;
        } catch {
          return (await caches.match('/placeholder.svg')) ||
            new Response('', { status: 404 });
        }
      })()
    );
    return;
  }

  // ── 5. Page navigation — cache first, network revalidate ─────────────────
  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        const cache = await caches.open(SHELL_CACHE);
        const cached = await cache.match(request);

        // Fetch from network in background to update cache
        const networkFetch = fetch(request)
          .then((res) => {
            if (res.ok) cache.put(request, res.clone());
            return res;
          })
          .catch(() => null);

        // Return cached immediately if available, else wait for network
        if (cached) {
          // Still revalidate in background
          networkFetch.catch(() => {});
          return cached;
        }

        const networkRes = await networkFetch;
        if (networkRes) return networkRes;

        // Fully offline — return cached home or offline page
        return (
          (await cache.match('/')) ||
          (await cache.match(OFFLINE_PAGE)) ||
          new Response('<h1>You are offline</h1><p>Please check your internet connection.</p>', {
            headers: { 'Content-Type': 'text/html' },
          })
        );
      })()
    );
    return;
  }

  // ── 6. JS/CSS/Fonts — stale-while-revalidate ─────────────────────────────
  event.respondWith(
    (async () => {
      const cache = await caches.open(SHELL_CACHE);
      const cached = await cache.match(request);

      const networkFetch = fetch(request)
        .then((res) => {
          if (res.ok) cache.put(request, res.clone());
          return res;
        })
        .catch(() => null);

      return cached || (await networkFetch) || new Response('', { status: 504 });
    })()
  );
});

// ── Background Sync — retry failed cart/order actions when back online ────────
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-cart') {
    event.waitUntil(
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) =>
          client.postMessage({ type: 'SYNC_CART' })
        );
      })
    );
  }
});

// ── Push Notifications ────────────────────────────────────────────────────────
self.addEventListener('push', (event) => {
  if (!event.data) return;
  try {
    const data = event.data.json();
    event.waitUntil(
      self.registration.showNotification(data.title || 'Amoli', {
        body: data.body || '',
        icon: '/image/Amoli_2.png',
        badge: '/image/Amoli_2.png',
        data: { url: data.url || '/' },
      })
    );
  } catch {}
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clients) => {
      const existing = clients.find((c) => c.url === url && 'focus' in c);
      if (existing) return existing.focus();
      return self.clients.openWindow(url);
    })
  );
});
