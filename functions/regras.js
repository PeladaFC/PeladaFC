/* Pelada FC · regras das notificações (sem dependências, testável com node teste.js)
   Recebe os dados como estão no banco e devolve a lista de avisos a mandar:
   [{ para: [uid, ...], titulo, texto, tag }] */
'use strict';
const DIAS3 = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
const CORES = [['Laranja', '🟠'], ['Azul', '🔵'], ['Branco', '⚪'], ['Preto', '⚫']];
const pad = n => String(n).padStart(2, '0');
const parseD = s => { const [y, m, d] = String(s).split('-').map(Number); return new Date(Date.UTC(y, m - 1, d, 12)); };
const dShort = s => { const d = parseD(s); return `${DIAS3[d.getUTCDay()]} ${pad(d.getUTCDate())}/${pad(d.getUTCMonth() + 1)}`; };
function maisHora(h, min) { const [a, b] = String(h || '08:00').split(':').map(Number); const t = (((a * 60 + b + min) % 1440) + 1440) % 1440; return pad(Math.floor(t / 60)) + ':' + pad(t % 60); }
const horaIni = (p, cfg) => (p && p.hora) || (cfg && cfg.hora) || '08:00';
const horaFim = (p, cfg) => (p && p.horaFim) || (cfg && cfg.horaFim) || maisHora(horaIni(p, cfg), 60);
// Recife/Fortaleza: UTC-3 o ano todo
function fimDe(p, cfg) { const i = horaIni(p, cfg), f = horaFim(p, cfg); const d = new Date(`${p.data}T${f}:00-03:00`); if (f <= i) d.setTime(d.getTime() + 864e5); return d.getTime(); }
function janelaH(cfg) { const h = Number(cfg && cfg.janelaAval); return h > 0 ? h : 24; }

function nomeJog(j) { if (!j) return 'Alguém'; return j.apelido || String(j.nome || 'Alguém').split(' ')[0]; }
function uidDoJogador(ctx, jid) { for (const [u, d] of Object.entries(ctx.pres || {})) if (d && d.jogador === jid) return u; return null; }
function participantes(p, pid, ctx) {
  let ids = p.jogaram;
  if (!ids && p.times) { ids = []; for (const t of p.times) { if (t.gk) ids.push(t.gk); ids.push(...(t.ids || [])); } ids.push(...(p.goleiros || [])); }
  if (!ids) { const s = new Set(); for (const [j, r] of Object.entries(p.resp || {})) if (r && r.s === 'sim') s.add(j);
    for (const d of Object.values(ctx.pres || {})) { const r = d && d.pel && d.pel[pid]; if (r && r.s === 'sim' && d.jogador) s.add(d.jogador); } ids = [...s]; }
  return ids;
}
function uidsDe(ctx, jids) { const out = new Set(); for (const j of jids) { const u = uidDoJogador(ctx, j); if (u) out.add(u); } return [...out]; }
const todos = ctx => Object.keys(ctx.membros || {});
const admins = ctx => (ctx.grupo && ctx.grupo.admins) || [];
const nomePelada = ctx => (ctx.cfg && ctx.cfg.nome) || (ctx.grupo && ctx.grupo.nome) || 'Pelada';

function pelCriada(p, pid, ctx) {
  const onde = p.local ? ` · ${p.local}` : '';
  return [{ para: todos(ctx), titulo: `⚽ ${nomePelada(ctx)}`, texto: `Pelada marcada: ${dShort(p.data)} das ${horaIni(p, ctx.cfg)} às ${horaFim(p, ctx.cfg)}${onde}. Confirme sua presença!`, tag: 'pel-' + pid }];
}
// campos que interessam numa atualização da pelada (para não ler o banco à toa)
function pelMudouAlgo(a, b) {
  return (a.sorteadoEm || 0) !== (b.sorteadoEm || 0) || (!a.avalEm && !!b.avalEm) || JSON.stringify(a.aprov || {}) !== JSON.stringify(b.aprov || {}) || JSON.stringify(a.lancOk || {}) !== JSON.stringify(b.lancOk || {});
}
function pelAtualizada(a, b, pid, ctx) {
  const out = [], quando = dShort(b.data);
  if (b.times && (a.sorteadoEm || 0) !== (b.sorteadoEm || 0)) {
    b.times.forEach(t => { const [n, e] = CORES[t.cor] || ['?', '']; const js = (t.gk ? [t.gk] : []).concat(t.ids || []);
      const us = uidsDe(ctx, js); if (us.length) out.push({ para: us, titulo: `🎲 Times sorteados · ${quando}`, texto: `Você está no time ${n} ${e}. Bom jogo!`, tag: 'times-' + pid }); });
    const gx = uidsDe(ctx, b.goleiros || []); if (gx.length) out.push({ para: gx, titulo: `🎲 Times sorteados · ${quando}`, texto: 'Os times saíram. Você joga no gol como extra. Bom jogo!', tag: 'times-' + pid });
  }
  if (!a.avalEm && b.avalEm) out.push({ para: uidsDe(ctx, participantes(b, pid, ctx)), titulo: '📊 Saíram as notas', texto: `Veja a relação das notas, o craque e o pereba da pelada de ${quando}.`, tag: 'notas-' + pid });
  for (const [j, t] of Object.entries(b.aprov || {})) if (t && t !== (a.aprov || {})[j]) { const u = uidDoJogador(ctx, j); if (u) out.push({ para: [u], titulo: '✅ Vaga liberada', texto: `O administrador liberou sua vaga na pelada de ${quando}.`, tag: 'lib-' + pid }); }
  for (const [u, t] of Object.entries(b.lancOk || {})) if (t && t !== (a.lancOk || {})[u]) out.push({ para: [u], titulo: '⚽ Números aprovados', texto: `Seus gols e assistências da pelada de ${quando} foram aprovados.`, tag: 'lanc-' + pid });
  return out;
}
function presAtualizada(a, b, uid, ctx) {
  a = a || {}; b = b || {}; const out = [], jid = b.jogador; if (!jid) return out;
  const nome = nomeJog((ctx.jog || {})[jid]), para = admins(ctx).filter(x => x !== uid);
  if (!para.length) return out;
  for (const [pid, r] of Object.entries(b.pel || {})) {
    const r0 = (a.pel || {})[pid]; if (!r || (r0 && r0.s === r.s && r0.t === r.t)) continue; if (r0 && r0.s === r.s) continue;
    const p = (ctx.pel || {})[pid]; const quando = p ? ' · ' + dShort(p.data) : '';
    const j = (ctx.jog || {})[jid] || {};
    let texto;
    if (r.s === 'sim') texto = (r.esp || j.tipo === 'diarista') ? `${nome} pediu vaga${quando}. Toque em Liberar na lista.` : `${nome} confirmou presença${quando}.`;
    else if (r.s === 'nao') texto = r0 && r0.s === 'sim' ? `${nome} desistiu${quando}.` : `${nome} não vai${quando}.`;
    else continue;
    out.push({ para, titulo: `📋 ${nomePelada(ctx)}`, texto, tag: 'pres-' + pid });
  }
  for (const [pid, L] of Object.entries(b.lanc || {})) {
    const L0 = (a.lanc || {})[pid]; if (!L || (L0 && L0.t === L.t)) continue;
    const p = (ctx.pel || {})[pid];
    out.push({ para, titulo: '⚽ Gols para aprovar', texto: `${nome} lançou ${L.g || 0} gol(s) e ${L.a || 0} assist.${p ? ' na pelada de ' + dShort(p.data) : ''}.`, tag: 'lanc-' + pid });
  }
  return out;
}
function membroNovo(m, uid, ctx) {
  const para = admins(ctx).filter(x => x !== uid); if (!para.length) return [];
  return [{ para, titulo: `👋 ${nomePelada(ctx)}`, texto: `${m.apelido || m.nome || 'Alguém'} entrou pelo convite e espera sua autorização.`, tag: 'membro-' + uid }];
}
function muralAtualizado(a, b, ctx) {
  const vistos = new Set(((a && a.items) || []).map(x => x.id)), out = [];
  for (const m of ((b && b.items) || [])) if (!vistos.has(m.id)) out.push({ para: todos(ctx), titulo: `📣 ${m.titulo || 'Recado do administrador'}`, texto: String(m.txt || '').slice(0, 180), tag: 'mural-' + m.id });
  return out;
}
// avaliação abriu (no término) e ainda não avisamos
function avalAbriu(p, cfg, agora) { if (!p || !p.data || p.pushAvalEm || p.aval) return false; const f = fimDe(p, cfg); return agora >= f && agora < f + Math.min(janelaH(cfg), 6) * 36e5; }
function avisoAval(p, pid, ctx) {
  const loc = new Date(fimDe(p, ctx.cfg) + janelaH(ctx.cfg) * 36e5 - 3 * 36e5); // horário de Recife
  const ate = `${DIAS3[loc.getUTCDay()]} ${pad(loc.getUTCHours())}:${pad(loc.getUTCMinutes())}`;
  return [{ para: uidsDe(ctx, participantes(p, pid, ctx)), titulo: '⭐ Avalie a galera', texto: `Como foi a pelada de ${dShort(p.data)}? Dê suas estrelas, o voto é secreto. Aberta até ${ate}.`, tag: 'aval-' + pid }];
}
module.exports = { dShort, fimDe, janelaH, pelCriada, pelMudouAlgo, pelAtualizada, presAtualizada, membroNovo, muralAtualizado, avalAbriu, avisoAval, participantes, uidsDe };
