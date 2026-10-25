/* Pelota FC · excluir a própria conta (exigência das lojas).
   Apaga o perfil, as inscrições de notificação e a participação em cada grupo; depois apaga o login.
   Grupos: se a pessoa for a única administradora e houver outras pessoas no grupo, a exclusão é bloqueada
   até ela passar a administração para alguém. Se for a única pessoa do grupo, o grupo é apagado junto.
   Os registros do elenco (nome digitado pelo administrador, gols, notas) continuam no grupo, sem o vínculo com a conta. */
'use strict';
const { onRequest } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');
module.exports = db => {
  async function usuario(req) {
    const h = req.get('Authorization') || '', t = h.startsWith('Bearer ') ? h.slice(7) : '';
    if (!t) throw Object.assign(new Error('Entre na sua conta.'), { http: 401 });
    try { return await admin.auth().verifyIdToken(t); } catch (e) { throw Object.assign(new Error('Entre na sua conta de novo.'), { http: 401 }); }
  }
  // o que acontece com cada grupo se a conta for apagada
  async function plano(uid) {
    const u = await db.doc('users/' + uid).get(), ids = new Set(Object.keys((u.exists && u.data().grupos) || {}));
    (await db.collection('grupos').where('admins', 'array-contains', uid).get()).forEach(d => ids.add(d.id));
    const out = { sai: [], apaga: [], bloqueia: [], passa: [] };
    for (const gid of ids) {
      const g = await db.doc('grupos/' + gid).get(); if (!g.exists) continue;
      const G = g.data(), nome = G.nome || 'Pelada', admins = G.admins || [];
      if (!admins.includes(uid)) { out.sai.push({ gid, nome }); continue; }
      const outrosAdm = admins.filter(x => x !== uid);
      if (outrosAdm.length) { out.passa.push({ gid, nome, admins: outrosAdm, dono: G.dono === uid ? outrosAdm[0] : G.dono }); continue; }
      const membros = (await db.collection(`grupos/${gid}/membros`).get()).docs.filter(d => d.id !== uid).length;
      if (membros) out.bloqueia.push({ gid, nome, membros }); else out.apaga.push({ gid, nome });
    }
    return out;
  }
  const excluirConta = onRequest({ cors: true, maxInstances: 3 }, async (req, res) => {
    try {
      if (req.method !== 'POST') return res.status(405).json({ erro: 'Use POST.' });
      const u = await usuario(req), uid = u.uid, acao = (req.body || {}).acao;
      const P = await plano(uid), nomes = L => L.map(x => x.nome);
      if (acao !== 'excluir') return res.json({ sai: nomes(P.sai), passa: nomes(P.passa), apaga: nomes(P.apaga), bloqueia: nomes(P.bloqueia) });
      if (P.bloqueia.length) return res.status(409).json({ erro: `Você é o único administrador de: ${nomes(P.bloqueia).join(', ')}. Coloque outra pessoa como administradora (Ajustes do grupo) ou apague o grupo antes de excluir a conta.`, bloqueia: nomes(P.bloqueia) });
      const tirar = async gid => { for (const c of ['membros', 'presencas', 'votos']) await db.doc(`grupos/${gid}/${c}/${uid}`).delete().catch(() => {}); };
      for (const x of P.sai) await tirar(x.gid);
      for (const x of P.passa) { await db.doc('grupos/' + x.gid).update({ admins: x.admins, dono: x.dono }); await tirar(x.gid); }
      for (const x of P.apaga) { await db.recursiveDelete(db.doc('grupos/' + x.gid)); const cods = await db.collection('codigos').where('gid', '==', x.gid).get(); for (const c of cods.docs) await c.ref.delete(); }
      await db.recursiveDelete(db.doc('users/' + uid));
      await admin.auth().deleteUser(uid).catch(e => { if (e.code !== 'auth/user-not-found') throw e; });
      res.json({ ok: true });
    } catch (e) { console.error(e); res.status(e.http || 500).json({ erro: e.http ? e.message : 'Não deu para excluir agora. Tente de novo.' }); }
  });
  return { excluirConta };
};
