/* Pelota FC · service worker: só recebe e mostra notificações (não guarda cache, para as atualizações chegarem na hora) */
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('push', e => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (_) { d = { body: e.data ? e.data.text() : '' }; }
  // sempre mostra algo: o iPhone cancela a permissão de quem recebe aviso "silencioso"
  e.waitUntil(Promise.all([self.registration.showNotification(d.title || 'Pelota FC', {
    body: d.body || 'Tem novidade na pelada.', tag: d.tag || undefined, icon: 'icon-192.png', badge: 'icon-192.png',
    // convocação: botões "Vou" e "Não vou" (aparecem no Android; no iPhone, tocar abre o jogo com as duas opções)
    actions: Array.isArray(d.actions) && d.rsvp ? d.actions.slice(0, 2) : undefined,
    data: { url: d.url || self.registration.scope + 'app/', rsvp: d.rsvp || null }
  }), somaContador()]));
});
// número no ícone do app (iPhone com o app na tela de início e Android): soma 1 a cada aviso; o app zera quando é aberto
const CONTADOR = '/__pelota_contador';
async function somaContador() {
  try { const c = await caches.open('pelota-contador'), r = await c.match(CONTADOR), n = (r ? Number(await r.text()) || 0 : 0) + 1;
    await c.put(CONTADOR, new Response(String(n))); if (self.navigator.setAppBadge) await self.navigator.setAppBadge(n); } catch (_) { }
}
// resposta direto da notificação, sem abrir o app: o servidor confere a chave que veio só para esta pessoa
const URL_RESP = 'https://southamerica-east1-pelada-fc-990d6.cloudfunctions.net/respostaPush';
async function responder(n, acao) {
  const dd = n.data || {}, rv = dd.rsvp, url = dd.url;
  let j = { ok: false, titulo: 'Não deu certo', texto: 'Toque aqui para responder pelo app.' };
  try { const r = await fetch(URL_RESP, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...rv, r: acao, a: acao === 'desfazer' ? dd.ant : undefined }) }); j = await r.json(); } catch (_) { }
  const podeDesfazer = j.ok && acao !== 'desfazer' && !j.desfeito && 'ant' in j;
  return self.registration.showNotification(j.titulo || 'Pelota FC', {
    body: j.texto || '', tag: n.tag || undefined, renotify: false, icon: 'icon-192.png', badge: 'icon-192.png',
    actions: podeDesfazer ? [{ action: 'desfazer', title: '↩️ Desfazer' }] : j.desfeito ? [{ action: 'sim', title: '✅ Vou' }, { action: 'nao', title: '❌ Não vou' }] : undefined,
    data: { url, rsvp: rv, ant: j.ant || null }
  });
}
self.addEventListener('notificationclick', e => {
  e.notification.close();
  if (e.action && e.notification.data && e.notification.data.rsvp && ['sim', 'nao', 'desfazer'].includes(e.action)) { e.waitUntil(responder(e.notification, e.action)); return; }
  const url = (e.notification.data && e.notification.data.url) || self.registration.scope + 'app/';
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(cs => {
    for (const c of cs) if (c.url.startsWith(self.registration.scope + 'app/') && 'focus' in c) { if ((url.includes('abrir=') || url.includes('r=ver')) && 'navigate' in c) return c.navigate(url).then(x => (x || c).focus()); return c.focus(); }
    return self.clients.openWindow(url);
  }));
});
