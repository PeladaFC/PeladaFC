/* Pelota FC · service worker: só recebe e mostra notificações (não guarda cache, para as atualizações chegarem na hora) */
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('push', e => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (_) { d = { body: e.data ? e.data.text() : '' }; }
  // sempre mostra algo: o iPhone cancela a permissão de quem recebe aviso "silencioso"
  e.waitUntil(Promise.all([self.registration.showNotification(d.title || 'Pelota FC', {
    body: d.body || 'Tem novidade na pelada.', tag: d.tag || undefined, icon: 'icon-192.png', badge: 'icon-192.png',
    data: { url: d.url || self.registration.scope }
  }), somaContador()]));
});
// número no ícone do app (iPhone com o app na tela de início e Android): soma 1 a cada aviso; o app zera quando é aberto
const CONTADOR = '/__pelota_contador';
async function somaContador() {
  try { const c = await caches.open('pelota-contador'), r = await c.match(CONTADOR), n = (r ? Number(await r.text()) || 0 : 0) + 1;
    await c.put(CONTADOR, new Response(String(n))); if (self.navigator.setAppBadge) await self.navigator.setAppBadge(n); } catch (_) { }
}
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || self.registration.scope;
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(cs => {
    for (const c of cs) if (c.url.startsWith(self.registration.scope) && 'focus' in c) { if (url.includes('abrir=') && 'navigate' in c) return c.navigate(url).then(x => (x || c).focus()); return c.focus(); }
    return self.clients.openWindow(url);
  }));
});
