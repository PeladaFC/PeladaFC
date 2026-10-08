/* Pelada FC · service worker: só recebe e mostra notificações (não guarda cache, para as atualizações chegarem na hora) */
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('push', e => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (_) { d = { body: e.data ? e.data.text() : '' }; }
  // sempre mostra algo: o iPhone cancela a permissão de quem recebe aviso "silencioso"
  e.waitUntil(self.registration.showNotification(d.title || 'Pelada FC', {
    body: d.body || 'Tem novidade na pelada.', tag: d.tag || undefined, icon: 'icon-192.png', badge: 'icon-192.png',
    data: { url: d.url || self.registration.scope }
  }));
});
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || self.registration.scope;
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(cs => {
    for (const c of cs) if (c.url.startsWith(self.registration.scope) && 'focus' in c) return c.focus();
    return self.clients.openWindow(url);
  }));
});
