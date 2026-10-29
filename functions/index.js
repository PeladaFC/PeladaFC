/* Pelota FC · servidor de notificações (Firebase Cloud Functions, 2ª geração)
   Usa o padrão aberto Web Push (VAPID). As chaves e as inscrições ficam no próprio Firestore,
   então dá para levar tudo para outro servidor (ex.: Cloudflare) sem ninguém precisar reativar nada.

   Onde fica cada coisa:
   - servidor/vapid               chaves VAPID (as regras bloqueiam qualquer acesso pelo app)
   - users/{uid}/push/{id}        inscrições de cada celular (cada pessoa só mexe nas suas)
   Proteções de custo: nenhuma função grava nos documentos que a disparam (sem laço infinito),
   no máximo 5 instâncias por função e leitura do banco só quando algo relevante mudou. */
'use strict';
const { setGlobalOptions } = require('firebase-functions/v2');
const { onDocumentCreated, onDocumentUpdated, onDocumentWritten } = require('firebase-functions/v2/firestore');
const { onSchedule } = require('firebase-functions/v2/scheduler');
const { onRequest } = require('firebase-functions/v2/https');
const logger = require('firebase-functions/logger');
const admin = require('firebase-admin');
const webpush = require('web-push');
const R = require('./regras');

admin.initializeApp();
const db = admin.firestore();
setGlobalOptions({ region: 'southamerica-east1', maxInstances: 5, memory: '256MiB', timeoutSeconds: 60 });

const URL_APP = 'https://pelotafc.com.br/app/';

/* Pix automático (Mercado Pago) */
const { interno: PAG, ...pagamentos } = require('./pagamentos')(db);
Object.assign(exports, pagamentos);
/* Notas fiscais da comissão: relatório, emissão automática no Emissor Nacional e PDF para o organizador */
const { interno: NFSE, ...notas } = require('./nfse')(db, PAG);
Object.assign(exports, notas);
/* Excluir a própria conta (pedido das lojas) */
Object.assign(exports, require('./conta')(db));
const MAX_DESTINOS = 300;

/* ---------- chaves VAPID ---------- */
let CHAVES = null;
async function chaves() {
  if (CHAVES) return CHAVES;
  const ref = db.doc('servidor/vapid');
  CHAVES = await db.runTransaction(async tx => {
    const s = await tx.get(ref);
    if (s.exists && s.data().publica) return s.data();
    const k = webpush.generateVAPIDKeys();
    const d = { publica: k.publicKey, privada: k.privateKey, criadoEm: Date.now() };
    tx.set(ref, d);
    return d;
  });
  webpush.setVapidDetails('mailto:contato@peladafc.app', CHAVES.publica, CHAVES.privada);
  return CHAVES;
}

// O app pede a chave pública para poder ativar as notificações
exports.chavePush = onRequest({ cors: true, maxInstances: 3 }, async (req, res) => {
  try { const k = await chaves(); res.set('Cache-Control', 'public, max-age=3600').json({ publica: k.publica }); }
  catch (e) { logger.error(e); res.status(500).json({ erro: 'indisponivel' }); }
});

/* ---------- envio ---------- */
async function enviarPara(uids, aviso) {
  await chaves();
  const lista = [...new Set(uids || [])].slice(0, MAX_DESTINOS);
  const payload = JSON.stringify({ title: aviso.titulo, body: aviso.texto, tag: aviso.tag || undefined, url: aviso.url || URL_APP });
  let ok = 0, mortos = 0;
  await Promise.all(lista.map(async uid => {
    const subs = await db.collection(`users/${uid}/push`).get();
    await Promise.all(subs.docs.map(async d => {
      const s = d.data();
      try { await webpush.sendNotification({ endpoint: s.endpoint, keys: s.keys }, payload, { TTL: 86400, urgency: 'high' }); ok++; }
      catch (e) {
        if (e.statusCode === 404 || e.statusCode === 410) { mortos++; await d.ref.delete().catch(() => {}); }
        else logger.warn('falha ao enviar', uid, e.statusCode, e.body);
      }
    }));
  }));
  logger.info('aviso', aviso.tag, { destinos: lista.length, entregues: ok, removidos: mortos });
}
// Erros do app: uma vez por dia (na rotina das 10h), se apareceram erros novos, avisa no celular do dono do app
async function avisarErros() {
  const ref = db.doc('servidor/plataforma'), plat = (await ref.get()).data() || {}, agora = Date.now();
  const desde = Number(plat.errosVistoAte) || agora - 864e5;
  const q = await db.collection('erros').where('em', '>', desde).select('chave').get();
  await ref.set({ errosVistoAte: agora }, { merge: true });
  if (q.empty) return;
  const n = q.size, tipos = new Set(q.docs.map(d => d.get('chave'))).size, uids = [];
  for (const em of plat.emails || []) { try { uids.push((await admin.auth().getUserByEmail(em)).uid); } catch (e) { } }
  if (!uids.length) return;
  await enviarPara(uids, { titulo: 'Pelota FC · erros no app', texto: `${n} erro${n === 1 ? '' : 's'} novo${n === 1 ? '' : 's'} desde ontem (${tipos} tipo${tipos === 1 ? '' : 's'}). Abra o Painel do dono → Erros.`, tag: 'erros-app', url: URL_APP + '?abrir=erros' });
}
async function enviarTodos(avisos) { for (const a of avisos) if (a && a.para && a.para.length) await enviarPara(a.para, a); }

/* ---------- contexto do grupo (lido só quando precisa) ---------- */
async function contexto(gid, { jog = false, pres = false, membros = false, pel = false, caixa = false } = {}) {
  const base = db.doc(`grupos/${gid}`);
  const [g, c, j, p, m, pl] = await Promise.all([
    base.get(), base.collection('config').doc('geral').get(),
    jog ? base.collection('jogadores').get() : null,
    pres ? base.collection('presencas').get() : null,
    membros ? base.collection('membros').get() : null,
    pel ? base.collection('peladas').orderBy('data', 'desc').limit(10).get() : null
  ]);
  const cx = caixa ? await base.collection('caixa').orderBy(admin.firestore.FieldPath.documentId(), 'desc').limit(3).get() : null;
  const map = q => q ? Object.fromEntries(q.docs.map(d => [d.id, d.data()])) : {};
  return { gid, grupo: g.exists ? g.data() : {}, cfg: c.exists ? c.data() : {}, jog: map(j), pres: map(p), membros: map(m), pel: map(pl), caixa: map(cx) };
}

/* ---------- gatilhos ---------- */
exports.pushPeladaCriada = onDocumentCreated('grupos/{gid}/peladas/{pid}', async ev => {
  const p = ev.data && ev.data.data(); if (!p) return;
  const ctx = await contexto(ev.params.gid, { membros: true, jog: true, pres: true });
  await enviarTodos(R.pelCriada(p, ev.params.pid, ctx));
});

exports.pushPeladaAtualizada = onDocumentUpdated('grupos/{gid}/peladas/{pid}', async ev => {
  const a = ev.data.before.data() || {}, b = ev.data.after.data() || {};
  if (!R.pelMudouAlgo(a, b)) return;
  const ctx = await contexto(ev.params.gid, { pres: true });
  await enviarTodos(R.pelAtualizada(a, b, ev.params.pid, ctx));
});

exports.pushPresenca = onDocumentWritten('grupos/{gid}/presencas/{uid}', async ev => {
  const a = ev.data.before.exists ? ev.data.before.data() : null, b = ev.data.after.exists ? ev.data.after.data() : null;
  if (!b) return;
  const ctx = await contexto(ev.params.gid, { jog: true, pel: true });
  await enviarTodos(R.presAtualizada(a, b, ev.params.uid, ctx));
});

exports.pushMembroNovo = onDocumentCreated('grupos/{gid}/membros/{uid}', async ev => {
  const m = ev.data && ev.data.data(); if (!m) return;
  const ctx = await contexto(ev.params.gid);
  await enviarTodos(R.membroNovo(m, ev.params.uid, ctx));
});

exports.pushMural = onDocumentWritten('grupos/{gid}/mural/{doc}', async ev => {
  const a = ev.data.before.exists ? ev.data.before.data() : null, b = ev.data.after.exists ? ev.data.after.data() : null;
  if (!b) return;
  const ctx = await contexto(ev.params.gid, { membros: true });
  await enviarTodos(R.muralAtualizado(a, b, ctx));
});

exports.pushAvaliacaoCompleta = onDocumentCreated('grupos/{gid}/avaliacoes/{rid}', async ev => {
  const r = ev.data && ev.data.data(); if (!r) return;
  const ctx = await contexto(ev.params.gid, { membros: true });
  await enviarTodos(R.rodadaNova(r, ctx));
});

// Boas-vindas: confirma na hora que a notificação chegou no celular
exports.pushAtivado = onDocumentCreated('users/{uid}/push/{id}', async ev => {
  const s = ev.data && ev.data.data(); if (!s || !s.endpoint) return;
  await chaves();
  try {
    await webpush.sendNotification({ endpoint: s.endpoint, keys: s.keys },
      JSON.stringify({ title: '🔔 Notificações ativadas', body: 'Pronto! É assim que os avisos da pelada vão chegar no seu celular.', tag: 'boas-vindas', url: URL_APP }), { TTL: 3600 });
  } catch (e) { if (e.statusCode === 404 || e.statusCode === 410) await ev.data.ref.delete().catch(() => {}); else logger.warn(e.statusCode, e.body); }
});

// A cada 15 minutos: avisa quem jogou que a avaliação abriu (no término da pelada)
exports.pushAvaliacao = onSchedule({ schedule: 'every 15 minutes', timeZone: 'America/Recife', maxInstances: 1 }, async () => {
  const agora = Date.now(), ontem = new Date(agora - 2 * 864e5).toISOString().slice(0, 10);
  const grupos = await db.collection('grupos').select().get();
  for (const g of grupos.docs) {
    const ps = await g.ref.collection('peladas').where('data', '>=', ontem).get();
    if (ps.empty) continue;
    const cfgS = await g.ref.collection('config').doc('geral').get(), cfg = cfgS.exists ? cfgS.data() : {};
    const abrir = ps.docs.filter(d => R.avalAbriu(d.data(), cfg, agora));
    if (!abrir.length) continue;
    const ctx = await contexto(g.id, { pres: true });
    for (const d of abrir) {
      await d.ref.update({ pushAvalEm: agora }); // marca antes de enviar: nunca avisa duas vezes
      await enviarTodos(R.avisoAval(d.data(), d.id, ctx));
    }
  }
});

// Cobrança extra nova (caixa/{mês}.extras): avisa quem está na lista
exports.pushCobrancaExtra = onDocumentWritten('grupos/{gid}/caixa/{mes}', async ev => {
  const a = ev.data.before.exists ? ev.data.before.data() : null, b = ev.data.after.exists ? ev.data.after.data() : null;
  if (!b || !b.extras) return;
  const novas = Object.keys(b.extras).filter(k => !((a && a.extras) || {})[k]); if (!novas.length) return;
  const ctx = await contexto(ev.params.gid, { pres: true });
  await enviarTodos(R.extrasNovas(a, b, ctx));
});

// A cada 15 minutos: 15 min antes do prazo dos mensalistas, lembra quem ainda não respondeu
exports.pushPrazoMensalistas = onSchedule({ schedule: 'every 15 minutes', timeZone: 'America/Recife', maxInstances: 1 }, async () => {
  const agora = Date.now(), hoje = new Date(agora - 3 * 36e5).toISOString().slice(0, 10);
  const grupos = await db.collection('grupos').select().get();
  for (const g of grupos.docs) {
    const ps = await g.ref.collection('peladas').where('data', '>=', hoje).get();
    const alvo = ps.docs.filter(d => R.prazoMensChegando(d.data(), agora + 5 * 60e3)); // agenda de 15 em 15: pega a janela
    if (!alvo.length) continue;
    const ctx = await contexto(g.id, { pres: true, jog: true, membros: true });
    for (const d of alvo) { await d.ref.update({ pushMens15: agora }); await enviarTodos(R.lembreteMens(d.data(), d.id, ctx)); }
  }
});

// Todo dia às 10h: mensalidade nova (dia 1º), vence hoje e 5 dias de atraso,
// e, na mesma rotina (sem custo de agendamento extra), a nota fiscal da comissão: dia 1º emite o mês anterior
exports.pushCobrancas = onSchedule({ schedule: '0 10 * * *', timeZone: 'America/Recife', maxInstances: 1, memory: '512MiB', timeoutSeconds: 540 }, async () => {
  const hoje = new Date(Date.now() - 3 * 36e5).toISOString().slice(0, 10);
  try { await NFSE.tarefaDiaria(hoje); } catch (e) { logger.error('nota fiscal', e.message); }
  try { await avisarErros(); } catch (e) { logger.error('aviso de erros', e.message); }
  const grupos = await db.collection('grupos').select().get();
  for (const g of grupos.docs) {
    try { const ctx = await contexto(g.id, { pres: true, jog: true, pel: true, caixa: true }); await enviarTodos(R.avisosCobranca(ctx, hoje)); }
    catch (e) { logger.warn('cobrancas', g.id, e.message); }
  }
});

// A cada 5 minutos: diarista convocado que confirmou e não pagou em 30 minutos perde a vaga para o próximo da fila
exports.pushPrazoPagamento = onSchedule({ schedule: 'every 5 minutes', timeZone: 'America/Recife', maxInstances: 1 }, async () => {
  const agora = Date.now(), hoje = new Date(agora - 3 * 36e5).toISOString().slice(0, 10);
  const grupos = await db.collection('grupos').select().get();
  for (const g of grupos.docs) {
    const ps = await g.ref.collection('peladas').where('data', '>=', hoje).get();
    const comConv = ps.docs.filter(d => { const p = d.data(); return p.conv && Object.keys(p.conv).length && p.status !== 'encerrada'; });
    if (!comConv.length) continue;
    const ctx = await contexto(g.id, { pres: true, jog: true });
    if (!ctx.cfg.mpConectadoEm) continue;
    for (const d of comConv) {
      const p = d.data(), r = R.vencidosConv(p, d.id, ctx, agora); if (!r) continue;
      const up = {}; for (const j of r.venc) { up['expirou.' + j] = agora; up['conv.' + j] = admin.firestore.FieldValue.delete(); up['aprov.' + j] = admin.firestore.FieldValue.delete(); }
      for (const j of r.prox) { up['conv.' + j] = agora; up['aprov.' + j] = agora; }
      await d.ref.update(up); // a convocação do próximo dispara o aviso dele (pushPeladaAtualizada)
      await enviarTodos(R.avisosVencidos(p, d.id, ctx, r));
    }
  }
});
