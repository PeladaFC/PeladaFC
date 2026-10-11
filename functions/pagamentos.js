/* Pelada FC · Pix automático pelo Mercado Pago (fase 1: cada grupo usa a própria conta).
   - criarPix: o jogador pede a cobrança; o servidor calcula o valor (nunca confia no app),
     cria o Pix no Mercado Pago e guarda o QR em grupos/{gid}/cobrancas/{chave}.
   - mpWebhook: o Mercado Pago avisa que algo mudou; o servidor busca o pagamento de novo
     no Mercado Pago (com a chave do grupo) e, se estiver aprovado, marca PAGO no Caixa.
   A chave de acesso do Mercado Pago fica em grupos/{gid}/segredos/mp: o administrador grava,
   ninguém consegue ler pelo app (regras do Firestore); só este servidor lê. */
'use strict';
const { onRequest } = require('firebase-functions/v2/https');
const logger = require('firebase-functions/logger');
const admin = require('firebase-admin');

const MP = 'https://api.mercadopago.com';
const URL_WEBHOOK = 'https://southamerica-east1-pelada-fc-990d6.cloudfunctions.net/mpWebhook';
const TAXA = 0.0099;            // taxa do Pix online no Mercado Pago (conferida em 10/10/2026)
const VALIDADE_H = 24;          // o QR vale por 24 horas

const pad = n => String(n).padStart(2, '0');
function agoraRecife() { return new Date(Date.now() - 3 * 3600e3); }
function hojeRecife() { return agoraRecife().toISOString().slice(0, 10); }
function isoRecife(ms) { const d = new Date(ms - 3 * 3600e3); return d.toISOString().slice(0, 19) + '.000-03:00'; }
function stPag(x) { if (!x) return null; if (x === true) return { s: 'pago' }; return x.s ? x : null; }
const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

module.exports = db => {
  async function tokenMP(gid) { const s = await db.doc(`grupos/${gid}/segredos/mp`).get(); return s.exists ? s.data().token : null; }
  async function usuario(req) {
    const h = req.get('Authorization') || '', t = h.startsWith('Bearer ') ? h.slice(7) : '';
    if (!t) throw Object.assign(new Error('Entre na sua conta.'), { http: 401 });
    try { return await admin.auth().verifyIdToken(t); } catch (e) { throw Object.assign(new Error('Entre na sua conta de novo.'), { http: 401 }); }
  }
  const ler = async p => { const s = await db.doc(p).get(); return s.exists ? s.data() : null; };

  // quanto a pessoa deve (calculado aqui, com os dados do banco)
  async function devido(gid, tipo, ref, jid) {
    const cfg = (await ler(`grupos/${gid}/config/geral`)) || {};
    const jog = await ler(`grupos/${gid}/jogadores/${jid}`);
    if (!jog) throw Object.assign(new Error('Jogador não encontrado.'), { http: 404 });
    if (tipo === 'm') {
      if (!/^\d{4}-\d{2}$/.test(ref)) throw Object.assign(new Error('Mês inválido.'), { http: 400 });
      const cx = (await ler(`grupos/${gid}/caixa/${ref}`)) || {};
      if (stPag((cx.mens || {})[jid])) throw Object.assign(new Error('Essa mensalidade já está paga.'), { http: 409 });
      const v = cx.precoMensal != null ? Number(cx.precoMensal) : Number(cfg.mensal) || 0;
      return { v, cfg, desc: `Mensalidade de ${MESES[Number(ref.slice(5)) - 1]}` };
    }
    if (tipo === 'd') {
      const p = await ler(`grupos/${gid}/peladas/${ref}`);
      if (!p) throw Object.assign(new Error('Pelada não encontrada.'), { http: 404 });
      if (stPag((p.diarias || {})[jid])) throw Object.assign(new Error('Essa diária já está paga.'), { http: 409 });
      const cx = (await ler(`grupos/${gid}/caixa/${String(p.data).slice(0, 7)}`)) || {};
      const v = p.precoDiaria != null ? Number(p.precoDiaria) : cx.precoDiaria != null ? Number(cx.precoDiaria) : Number(cfg.diaria) || 0;
      const [, mm, dd] = String(p.data).split('-');
      return { v, cfg, desc: `Diária da pelada de ${dd}/${mm}` };
    }
    throw Object.assign(new Error('Tipo inválido.'), { http: 400 });
  }

  const criarPix = onRequest({ cors: true, maxInstances: 5 }, async (req, res) => {
    try {
      if (req.method !== 'POST') return res.status(405).json({ erro: 'Use POST.' });
      const u = await usuario(req);
      const { gid, tipo, ref, jid } = req.body || {};
      if (![gid, tipo, ref, jid].every(x => typeof x === 'string' && x && x.length < 120 && !x.includes('/')))
        return res.status(400).json({ erro: 'Pedido inválido.' });
      const grupo = await ler(`grupos/${gid}`);
      if (!grupo) return res.status(404).json({ erro: 'Pelada não encontrada.' });
      const adm = (grupo.admins || []).includes(u.uid);
      const pres = await ler(`grupos/${gid}/presencas/${u.uid}`);
      if (!adm && (!pres || pres.jogador !== jid)) return res.status(403).json({ erro: 'Você só pode pagar as suas cobranças.' });
      const token = await tokenMP(gid);
      if (!token) return res.status(412).json({ erro: 'O Pix automático ainda não foi ligado nesta pelada.' });
      const { v, cfg, desc } = await devido(gid, tipo, ref, jid);
      if (!(v > 0)) return res.status(400).json({ erro: 'Não há valor a pagar.' });
      const valor = cfg.pixRepassa ? Math.ceil(v / (1 - TAXA) * 100) / 100 : Math.round(v * 100) / 100;
      const chave = `${tipo}_${ref}_${jid}`, cobRef = db.doc(`grupos/${gid}/cobrancas/${chave}`);
      const ant = (await cobRef.get()).data();
      if (ant && ant.status === 'pending' && ant.valor === valor && ant.expira > Date.now() + 10 * 60e3) return res.json(ant);
      const expira = Date.now() + VALIDADE_H * 3600e3;
      const corpo = {
        transaction_amount: valor,
        description: `${grupo.nome || 'Pelada'} · ${desc}`.slice(0, 120),
        payment_method_id: 'pix',
        payer: { email: u.email || `jogador-${u.uid.slice(0, 8)}@peladafc.app` },
        external_reference: `${gid}|${tipo}|${ref}|${jid}`,
        notification_url: `${URL_WEBHOOK}?g=${encodeURIComponent(gid)}`,
        date_of_expiration: isoRecife(expira)
      };
      const r = await fetch(MP + '/v1/payments', {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json', 'X-Idempotency-Key': `${chave}_${Date.now()}` },
        body: JSON.stringify(corpo)
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) { logger.error('mp criar', r.status, j); return res.status(502).json({ erro: r.status === 401 ? 'A chave do Mercado Pago está errada ou venceu. Avise o administrador.' : 'O Mercado Pago não aceitou o pedido agora. Tente de novo.' }); }
      const td = (j.point_of_interaction || {}).transaction_data || {};
      const dado = { mpId: String(j.id), valor, base: v, status: j.status || 'pending', qr: td.qr_code || '', qr64: td.qr_code_base64 || '', link: td.ticket_url || '', criadoEm: Date.now(), expira, tipo, ref, jid, uid: u.uid, desc };
      await cobRef.set(dado);
      res.json(dado);
    } catch (e) { logger.error(e); res.status(e.http || 500).json({ erro: e.http ? e.message : 'Algo deu errado. Tente de novo.' }); }
  });

  const mpWebhook = onRequest({ maxInstances: 5 }, async (req, res) => {
    try {
      const gid = String(req.query.g || '');
      const id = String(req.query['data.id'] || (req.body && req.body.data && req.body.data.id) || (req.query.topic === 'payment' ? req.query.id : '') || '');
      if (!gid || !/^\d+$/.test(id)) return res.status(200).send('ok');
      const token = await tokenMP(gid);
      if (!token) return res.status(200).send('ok');
      // não confia no aviso: busca o pagamento de novo no Mercado Pago
      const r = await fetch(`${MP}/v1/payments/${id}`, { headers: { Authorization: 'Bearer ' + token } });
      if (!r.ok) { logger.warn('mp buscar', r.status); return res.status(500).send('tente de novo'); }
      const p = await r.json();
      const [g2, tipo, ref, jid] = String(p.external_reference || '').split('|');
      if (g2 !== gid || !tipo || !ref || !jid) return res.status(200).send('ok');
      const chave = `${tipo}_${ref}_${jid}`, cobRef = db.doc(`grupos/${gid}/cobrancas/${chave}`);
      const cob = (await cobRef.get()).data() || {};
      await cobRef.set({ status: p.status, atualizadoEm: Date.now() }, { merge: true });
      if (p.status === 'approved') {
        const val = { s: 'pago', d: hojeRecife(), v: Number(cob.base != null ? cob.base : p.transaction_amount), obs: 'Pix automático', via: 'pix', mp: String(p.id) };
        if (tipo === 'm') await db.doc(`grupos/${gid}/caixa/${ref}`).set({ mens: { [jid]: val } }, { merge: true });
        else if (tipo === 'd') await db.doc(`grupos/${gid}/peladas/${ref}`).set({ diarias: { [jid]: val } }, { merge: true });
        logger.info('pago', gid, chave, p.id);
      }
      res.status(200).send('ok');
    } catch (e) { logger.error(e); res.status(200).send('ok'); }
  });

  return { criarPix, mpWebhook };
};
