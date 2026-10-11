/* Pelada FC · Pix automático pelo Mercado Pago, com comissão da plataforma (split).
   - mpConectar: o administrador do grupo toca em "Conectar Mercado Pago"; o servidor devolve o
     endereço de autorização do Mercado Pago (OAuth) ou desconecta a conta.
   - mpRetorno: o Mercado Pago volta para cá com um código; o servidor troca pela chave da conta
     do grupo e guarda em grupos/{gid}/segredos/mp.
   - criarPix: o jogador pede a cobrança; o servidor calcula o valor (nunca confia no app),
     cria o Pix no Mercado Pago e guarda o QR em grupos/{gid}/cobrancas/{chave}.
   - mpWebhook: o Mercado Pago avisa que algo mudou; o servidor busca o pagamento de novo
     no Mercado Pago (com a chave do grupo) e, se estiver aprovado, marca PAGO no Caixa.
   A aplicação do Mercado Pago é da plataforma: servidor/mp guarda {clientId, clientSecret, comissao}
   (gravado pelo configurar-mp.sh). Cada cobrança leva application_fee = comissão da plataforma,
   que o Mercado Pago separa sozinho para a conta do app. Nada disso é lido pelo app (regras). */
'use strict';
const { onRequest } = require('firebase-functions/v2/https');
const logger = require('firebase-functions/logger');
const admin = require('firebase-admin');

const MP = 'https://api.mercadopago.com';
const BASE = 'https://southamerica-east1-pelada-fc-990d6.cloudfunctions.net';
const URL_WEBHOOK = BASE + '/mpWebhook', URL_RETORNO = BASE + '/mpRetorno';
const URL_APP = 'https://peladafc.github.io/PeladaFC/';
const TAXA = 0.0099;            // taxa do Pix online no Mercado Pago (conferida em 10/10/2026)
const VALIDADE_H = 24;          // o QR vale por 24 horas
const COMISSAO_PADRAO = 0.01;   // comissão da plataforma, se servidor/mp não disser outra

const pad = n => String(n).padStart(2, '0');
function agoraRecife() { return new Date(Date.now() - 3 * 3600e3); }
function hojeRecife() { return agoraRecife().toISOString().slice(0, 10); }
function isoRecife(ms) { const d = new Date(ms - 3 * 3600e3); return d.toISOString().slice(0, 19) + '.000-03:00'; }
function stPag(x) { if (!x) return null; if (x === true) return { s: 'pago' }; return x.s ? x : null; }
const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

module.exports = db => {
  const erro = (m, http) => Object.assign(new Error(m), { http });
  async function plataforma() {
    const d = (await db.doc('servidor/mp').get()).data() || {};
    return { id: d.clientId || '', segredo: d.clientSecret || '', comissao: d.comissao != null ? Number(d.comissao) : COMISSAO_PADRAO };
  }
  async function trocaOAuth(corpo) {
    const r = await fetch(MP + '/oauth/token', { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(corpo) });
    const j = await r.json().catch(() => ({}));
    if (!r.ok || !j.access_token) { logger.error('mp oauth', r.status, j.message || j.error); throw erro('O Mercado Pago não liberou a conta.', 502); }
    return { token: j.access_token, refresh: j.refresh_token || null, expira: Date.now() + (Number(j.expires_in) || 15552000) * 1000, mpUser: j.user_id != null ? String(j.user_id) : null };
  }
  // chave da conta do grupo; renova sozinha quando está perto de vencer (vale ~6 meses)
  async function contaMP(gid) {
    const ref = db.doc(`grupos/${gid}/segredos/mp`), s = await ref.get();
    if (!s.exists || !s.data().token) return null;
    let d = s.data();
    if (d.refresh && d.expira && d.expira < Date.now() + 15 * 864e5) {
      try { const P = await plataforma(); const n = await trocaOAuth({ client_id: P.id, client_secret: P.segredo, grant_type: 'refresh_token', refresh_token: d.refresh }); await ref.set(n, { merge: true }); d = { ...d, ...n }; }
      catch (e) { logger.warn('renovar chave', gid, e.message); }
    }
    return d;
  }
  async function tokenMP(gid) { const d = await contaMP(gid); return d ? d.token : null; }
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
      if (p.dividir && p.precoDiaria == null) throw Object.assign(new Error('O valor desta pelada ainda está sendo dividido. Espere o administrador fechar.'), { http: 409 });
      const base = p.precoDiaria != null ? Number(p.precoDiaria) : cx.precoDiaria != null ? Number(cx.precoDiaria) : Number(cfg.diaria) || 0;
      // desconto, isenção ou valor combinado deste atleta (o administrador define)
      const dsc = (p.descontos || {})[jid] || null;
      const v = dsc && dsc.isento ? 0 : dsc && dsc.v != null ? Number(dsc.v) : Math.round(base * (1 - (Number(dsc && dsc.pct) || 0)) * 100) / 100;
      const [, mm, dd] = String(p.data).split('-');
      return { v, cfg, desc: `Diária da pelada de ${dd}/${mm}` };
    }
    if (tipo === 'x') {
      const [m, xid] = ref.split('~');
      if (!/^\d{4}-\d{2}$/.test(m || '') || !/^[a-z0-9]{2,30}$/.test(xid || '')) throw Object.assign(new Error('Cobrança inválida.'), { http: 400 });
      const cx = (await ler(`grupos/${gid}/caixa/${m}`)) || {}, x = (cx.extras || {})[xid];
      if (!x || !(x.quem || []).includes(jid)) throw Object.assign(new Error('Cobrança não encontrada.'), { http: 404 });
      if (stPag((x.pag || {})[jid])) throw Object.assign(new Error('Essa cobrança já está paga.'), { http: 409 });
      return { v: Number(x.v) || 0, cfg, desc: String(x.nome || 'Cobrança extra').slice(0, 60) };
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
      const conta = await contaMP(gid), token = conta && conta.token;
      if (!token) return res.status(412).json({ erro: 'O Pix automático ainda não foi ligado nesta pelada.' });
      const { v, cfg, desc } = await devido(gid, tipo, ref, jid);
      // o dono da conta que recebe não paga por Pix (o Mercado Pago recusa pagar para si mesmo)
      if (conta.por) {
        if (cfg.mpDono !== conta.por) await db.doc(`grupos/${gid}/config/geral`).set({ mpDono: conta.por }, { merge: true });
        const pd = await ler(`grupos/${gid}/presencas/${conta.por}`);
        if (pd && pd.jogador === jid) return res.status(409).json({ erro: 'A conta do Mercado Pago que recebe é sua. Pagar para si mesmo não é permitido: marque sua parte como paga no Caixa.', dono: true });
      }
      if (!(v > 0)) return res.status(400).json({ erro: 'Não há valor a pagar.' });
      const com = conta.via === 'oauth' ? (await plataforma()).comissao : 0;
      const valor = cfg.pixRepassa !== false ? Math.ceil(v / (1 - TAXA - com) * 100) / 100 : Math.round(v * 100) / 100;
      const fee = com > 0 ? Math.round(valor * com * 100) / 100 : 0;
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
      if (fee > 0) corpo.application_fee = fee;
      const r = await fetch(MP + '/v1/payments', {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json', 'X-Idempotency-Key': `${chave}_${Date.now()}` },
        body: JSON.stringify(corpo)
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) { logger.error('mp criar', r.status, j); return res.status(502).json({ erro: r.status === 401 ? 'A chave do Mercado Pago está errada ou venceu. Avise o administrador.' : 'O Mercado Pago não aceitou o pedido agora. Tente de novo.' }); }
      const td = (j.point_of_interaction || {}).transaction_data || {};
      const dado = { mpId: String(j.id), valor, base: v, fee, status: j.status || 'pending', qr: td.qr_code || '', qr64: td.qr_code_base64 || '', link: td.ticket_url || '', criadoEm: Date.now(), expira, tipo, ref, jid, uid: u.uid, desc };
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
        else if (tipo === 'x') { const [m, xid] = ref.split('~'); await db.doc(`grupos/${gid}/caixa/${m}`).set({ extras: { [xid]: { pag: { [jid]: val } } } }, { merge: true }); }
        logger.info('pago', gid, chave, p.id);
      }
      res.status(200).send('ok');
    } catch (e) { logger.error(e); res.status(200).send('ok'); }
  });

  // conectar / desconectar a conta do Mercado Pago do grupo (só administrador)
  const mpConectar = onRequest({ cors: true, maxInstances: 5 }, async (req, res) => {
    try {
      if (req.method !== 'POST') return res.status(405).json({ erro: 'Use POST.' });
      const u = await usuario(req);
      const { gid, acao } = req.body || {};
      if (typeof gid !== 'string' || !gid || gid.length > 120 || gid.includes('/')) return res.status(400).json({ erro: 'Pedido inválido.' });
      const grupo = await ler(`grupos/${gid}`);
      if (!grupo || !(grupo.admins || []).includes(u.uid)) return res.status(403).json({ erro: 'Só o administrador pode fazer isso.' });
      if (acao === 'desconectar') {
        await db.doc(`grupos/${gid}/segredos/mp`).delete();
        await db.doc(`grupos/${gid}/config/geral`).set({ mpConectadoEm: null, pixAuto: false, mpDono: null }, { merge: true });
        return res.json({ ok: true });
      }
      const P = await plataforma();
      if (!P.id || !P.segredo) return res.status(503).json({ erro: 'O Pix automático ainda está sendo preparado. Tente mais tarde.' });
      const estado = require('crypto').randomBytes(18).toString('hex');
      await db.doc(`servidor/mp/estados/${estado}`).set({ gid, uid: u.uid, criadoEm: Date.now() });
      const q = new URLSearchParams({ client_id: P.id, response_type: 'code', platform_id: 'mp', state: estado, redirect_uri: URL_RETORNO });
      res.json({ url: 'https://auth.mercadopago.com.br/authorization?' + q });
    } catch (e) { logger.error(e); res.status(e.http || 500).json({ erro: e.http ? e.message : 'Algo deu errado. Tente de novo.' }); }
  });

  // o Mercado Pago volta para cá depois que o administrador autoriza
  const mpRetorno = onRequest({ maxInstances: 5 }, async (req, res) => {
    const volta = r => res.redirect(302, URL_APP + '?mp=' + r);
    try {
      const code = String(req.query.code || ''), estado = String(req.query.state || '');
      if (!code || !/^[a-f0-9]{36}$/.test(estado)) return volta('erro');
      const eRef = db.doc(`servidor/mp/estados/${estado}`), e = (await eRef.get()).data();
      await eRef.delete().catch(() => { });
      if (!e || Date.now() - e.criadoEm > 30 * 60e3) return volta('erro');
      const P = await plataforma();
      const n = await trocaOAuth({ client_id: P.id, client_secret: P.segredo, grant_type: 'authorization_code', code, redirect_uri: URL_RETORNO });
      await db.doc(`grupos/${e.gid}/segredos/mp`).set({ ...n, via: 'oauth', em: Date.now(), por: e.uid });
      await db.doc(`grupos/${e.gid}/config/geral`).set({ mpConectadoEm: Date.now(), mpTaxaApp: P.comissao, mpTeste: false, mpDono: e.uid }, { merge: true });
      logger.info('mp conectado', e.gid, n.mpUser);
      volta('ok');
    } catch (err) { logger.error(err); volta('erro'); }
  });

  return { criarPix, mpWebhook, mpConectar, mpRetorno };
};
