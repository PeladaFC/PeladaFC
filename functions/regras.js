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
const BRL = v => 'R$ ' + Number(v || 0).toFixed(2).replace('.', ',');
// data/hora em Recife: "sex 16/10 às 08:00"
function quandoMs(ms) { const d = new Date(ms - 3 * 36e5); return `${DIAS3[d.getUTCDay()]} ${pad(d.getUTCDate())}/${pad(d.getUTCMonth() + 1)} às ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`; }
const horaMs = ms => { const d = new Date(ms - 3 * 36e5); return `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`; };
const ehPA = (p, cfg) => !!((cfg && cfg.evento) || (p && p.extra)); // cobrança por atleta (evento livre ou evento extra)
function precoPel(p, cfg) { if (p.precoDiaria != null) return Number(p.precoDiaria) || 0; return ehPA(p, cfg) ? 0 : Number((cfg || {}).diaria) || 0; }
function valorJog(p, cfg, jid) { const d = (p.descontos || {})[jid]; if (d && d.isento) return 0; if (d && d.v != null) return Number(d.v); return Math.round(precoPel(p, cfg) * (1 - (Number(d && d.pct) || 0)) * 100) / 100; }
const tipoDe = (ctx, uid) => { const j = (ctx.pres || {})[uid] && (ctx.jog || {})[ctx.pres[uid].jogador]; return j ? (j.tipo || 'mensalista') : null; };
function respDe(p, pid, ctx, jid) { let r = (p.resp || {})[jid] || null; for (const d of Object.values(ctx.pres || {})) { const x = d && d.jogador === jid && d.pel && d.pel[pid]; if (x && (!r || (x.t || 0) > (r.t || 0))) r = x; } return r; }

function pelCriada(p, pid, ctx) {
  const g = nomePelada(ctx), onde = p.local ? ` · ${p.local}` : '', cfg = ctx.cfg || {};
  const quando = `${dShort(p.data)} das ${horaIni(p, cfg)} às ${horaFim(p, cfg)}${onde}`;
  if (ehPA(p, cfg)) { // evento livre ou evento extra
    const v = precoPel(p, cfg), nome = p.nome || (p.extra ? 'Evento extra' : g);
    return [{ para: todos(ctx), titulo: `🎉 ${nome} · ${g}`, texto: `${dShort(p.data)} às ${horaIni(p, cfg)}${onde}. ${v > 0 ? `Valor: ${BRL(v)} por atleta${p.extra ? ' (mensalista também paga)' : ''}.` : 'Sem cobrança.'} Confirme pelo app!`, tag: 'pel-' + pid }];
  }
  const mens = [], dia = [];
  for (const u of todos(ctx)) (tipoDe(ctx, u) === 'diarista' ? dia : mens).push(u);
  const out = [];
  if (mens.length) out.push({ para: mens, titulo: `⚽ ${g} · nova pelada`, texto: `${quando}. ${p.mensAte ? `Mensalista: confirme até ${quandoMs(p.mensAte)} para garantir sua vaga.` : 'Confirme sua presença!'}`, tag: 'pel-' + pid });
  if (dia.length) out.push({ para: dia, titulo: `⚽ ${g} · nova pelada`, texto: `${quando}. Diarista: peça sua vaga pelo app.${p.mensAte ? ` A convocação dos diaristas sai depois de ${quandoMs(p.mensAte)}, por ordem de pedido.` : ''}`, tag: 'pel-' + pid });
  return out;
}
// 15 minutos antes do prazo: avisa os mensalistas que ainda não responderam
function prazoMensChegando(p, agora) { return !!(p && p.mensAte && !p.pushMens15 && p.status !== 'encerrada' && !ehPA(p, {}) && agora >= p.mensAte - 15 * 60e3 && agora < p.mensAte); }
function lembreteMens(p, pid, ctx) {
  if (ehPA(p, ctx.cfg)) return [];
  const para = todos(ctx).filter(u => { if (tipoDe(ctx, u) !== 'mensalista') return false; const r = respDe(p, pid, ctx, ctx.pres[u].jogador); return !r || !r.s; });
  if (!para.length) return [];
  return [{ para, titulo: `⏰ Faltam 15 minutos · ${nomePelada(ctx)}`, texto: `Confirme sua presença na pelada de ${dShort(p.data)}. Às ${horaMs(p.mensAte)} fecha o prazo dos mensalistas e as vagas que sobrarem vão para os diaristas convocados.`, tag: 'mens15-' + pid }];
}
// campos que interessam numa atualização da pelada (para não ler o banco à toa)
function pelMudouAlgo(a, b) {
  return (a.sorteadoEm || 0) !== (b.sorteadoEm || 0) || (!a.avalEm && !!b.avalEm) || JSON.stringify(a.conv || {}) !== JSON.stringify(b.conv || {}) || JSON.stringify(a.aprov || {}) !== JSON.stringify(b.aprov || {}) || JSON.stringify(a.lancOk || {}) !== JSON.stringify(b.lancOk || {});
}
function pelAtualizada(a, b, pid, ctx) {
  const out = [], quando = dShort(b.data);
  if (b.times && (a.sorteadoEm || 0) !== (b.sorteadoEm || 0)) {
    b.times.forEach(t => { const [n0, e] = CORES[t.cor] || ['?', '']; const n = String(((ctx.cfg || {}).nomesTimes || [])[t.cor] || '').trim() || n0; const js = (t.gk ? [t.gk] : []).concat(t.ids || []);
      const us = uidsDe(ctx, js); if (us.length) out.push({ para: us, titulo: `🎲 Times sorteados · ${quando}`, texto: `Você está no time ${n} ${e}. Bom jogo!`, tag: 'times-' + pid }); });
    const gx = uidsDe(ctx, b.goleiros || []); if (gx.length) out.push({ para: gx, titulo: `🎲 Times sorteados · ${quando}`, texto: 'Os times saíram. Você joga no gol como extra. Bom jogo!', tag: 'times-' + pid });
  }
  if (!a.avalEm && b.avalEm) out.push({ para: uidsDe(ctx, participantes(b, pid, ctx)), titulo: `🏆 Saiu o resultado · ${nomePelada(ctx)}`, texto: `A votação da pelada de ${quando} terminou. Veja o craque, as notas e os prêmios.`, tag: 'notas-' + pid });
  // diaristas convocados pelo administrador
  for (const [j, t] of Object.entries(b.conv || {})) if (t && !(a.conv || {})[j]) { const u = uidDoJogador(ctx, j); if (!u) continue; const r = respDe(b, pid, ctx, j), v = precoPel(b, ctx.cfg);
    out.push({ para: [u], titulo: `✅ Você foi convocado · ${nomePelada(ctx)}`, texto: `Pelada de ${quando} às ${horaIni(b, ctx.cfg)}${b.local ? ' · ' + b.local : ''}. ${r && r.s === 'sim' ? 'Você já tinha pedido vaga: pague a diária em até 30 minutos para garanti-la.' : 'Confirme sua presença pelo app'}${v > 0 ? `${r && r.s === 'sim' ? '' : ' e pague a diária em até 30 minutos'}. Diária ${BRL(v)}.` : (r && r.s === 'sim' ? '' : '.')}`, tag: 'conv-' + pid }); }
  for (const [j, t] of Object.entries(b.aprov || {})) if (t && t !== (a.aprov || {})[j] && !(b.conv || {})[j]) { const u = uidDoJogador(ctx, j); if (u) out.push({ para: [u], titulo: '✅ Vaga liberada', texto: `O administrador liberou sua vaga na pelada de ${quando}.`, tag: 'lib-' + pid }); }
  for (const [u, t] of Object.entries(b.lancOk || {})) if (t && t !== (a.lancOk || {})[u]) out.push({ para: [u], titulo: '⚽ Números aprovados', texto: `Seus gols e assistências da pelada de ${quando} foram aprovados.`, tag: 'lanc-' + pid });
  return out;
}
function presAtualizada(a, b, uid, ctx) {
  a = a || {}; b = b || {}; const out = [], jid = b.jogador; if (!jid) return out;
  const nome = nomeJog((ctx.jog || {})[jid]), para = admins(ctx).filter(x => x !== uid);
  // quem confirmou num evento com valor recebe o aviso de cobrança
  for (const [pid, r] of Object.entries(b.pel || {})) { const r0 = (a.pel || {})[pid]; if (r && r.s === 'sim' && !(r0 && r0.s === 'sim')) out.push(...cobrancaEvento((ctx.pel || {})[pid], pid, jid, uid, ctx), ...cobrancaConvocado((ctx.pel || {})[pid], pid, jid, uid, ctx)); }
  if (!para.length) return out;
  for (const [pid, r] of Object.entries(b.pel || {})) {
    const r0 = (a.pel || {})[pid]; if (!r || (r0 && r0.s === r.s && r0.t === r.t)) continue; if (r0 && r0.s === r.s) continue;
    const p = (ctx.pel || {})[pid]; const quando = p ? ' · ' + dShort(p.data) : '';
    const j = (ctx.jog || {})[jid] || {};
    let texto;
    if (r.s === 'sim') texto = j.tipo === 'diarista' && !r.esp ? `${nome} (diarista) pediu vaga${quando} e entrou na fila de convocação.` : r.esp ? `${nome} pediu vaga${quando}. Toque em Liberar na lista.` : `${nome} confirmou presença${quando}.`;
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
  return [{ para: uidsDe(ctx, participantes(p, pid, ctx)), titulo: `⭐ Avalie a galera · ${nomePelada(ctx)}`, texto: `Como foi a pelada de ${dShort(p.data)}? Dê suas estrelas até ${ate}. O voto é secreto.`, tag: 'aval-' + pid }];
}
function rodadaNova(r, ctx) {
  if (!r || r.status !== 'aberta') return [];
  const n = (r.alvos || []).length, loc = new Date((r.fim || Date.now()) - 3 * 36e5);
  const ate = `${DIAS3[loc.getUTCDay()]} ${pad(loc.getUTCDate())}/${pad(loc.getUTCMonth() + 1)} ${pad(loc.getUTCHours())}:${pad(loc.getUTCMinutes())}`;
  return [{ para: todos(ctx), titulo: `⭐ Votação do elenco aberta · ${nomePelada(ctx)}`, texto: `Avalie ${n} jogador${n === 1 ? '' : 'es'} da galera nos 5 critérios até ${ate}. O voto é secreto.`, tag: 'rodada' }];
}
/* ---------- diarista convocado: 30 minutos para pagar ---------- */
const PRAZO_PAG = 30 * 60e3;
const mpOn = cfg => !!(cfg && cfg.mpConectadoEm);
// diaristas convocados que confirmaram e ainda não pagaram: [{jid, ate}]
function aPagar(p, pid, ctx) {
  const out = [], cfg = ctx.cfg || {}; if (!p || ehPA(p, cfg) || p.status === 'encerrada' || !mpOn(cfg)) return out;
  for (const [jid, tc] of Object.entries(p.conv || {})) {
    if (!tc || (p.expirou || {})[jid]) continue; const r = respDe(p, pid, ctx, jid); if (!r || r.s !== 'sim') continue;
    if (!(valorJog(p, cfg, jid) > 0) || stPag0((p.diarias || {})[jid])) continue;
    out.push({ jid, ate: Math.max(Number(tc) || 0, Number(r.t) || 0) + PRAZO_PAG });
  }
  return out;
}
const stPag0 = x => !!x && (x === true || !!x.s);
// passou o prazo: tira a vaga e chama o próximo da fila de pedidos
function vencidosConv(p, pid, ctx, agora) {
  const venc = aPagar(p, pid, ctx).filter(x => agora >= x.ate).map(x => x.jid); if (!venc.length) return null;
  const conv = p.conv || {}, exp = p.expirou || {}, jog = ctx.jog || {};
  const fila = Object.keys(jog).filter(j => (jog[j].tipo === 'diarista') && !conv[j] && !exp[j]).map(j => [j, respDe(p, pid, ctx, j)]).filter(([, r]) => r && r.s === 'sim').sort((a, b) => (a[1].t || 0) - (b[1].t || 0)).map(x => x[0]);
  return { venc, prox: fila.slice(0, venc.length) };
}
function avisosVencidos(p, pid, ctx, r) {
  const out = [], g = nomePelada(ctx), quando = dShort(p.data), nome = j => nomeJog((ctx.jog || {})[j]);
  for (const j of r.venc) { const u = uidDoJogador(ctx, j); if (u) out.push({ para: [u], titulo: `⌛ Vaga perdida · ${g}`, texto: `A diária da pelada de ${quando} não foi paga em 30 minutos e a vaga foi para o próximo diarista.`, tag: 'exp-' + pid }); }
  const adm = admins(ctx); if (adm.length) out.push({ para: adm, titulo: `⌛ Vaga repassada · ${g}`, texto: `${r.venc.map(nome).join(', ')} não pagou a diária em 30 minutos.${r.prox.length ? ` ${r.prox.map(nome).join(', ')} foi convocado.` : ' Não há mais diaristas na fila.'}`, tag: 'exp-adm-' + pid });
  return out;
}
function cobrancaConvocado(p, pid, jid, uid, ctx) {
  const cfg = ctx.cfg || {}; if (!p || ehPA(p, cfg) || !(p.conv || {})[jid] || !mpOn(cfg)) return [];
  const v = valorJog(p, cfg, jid); if (!(v > 0) || stPag0((p.diarias || {})[jid])) return [];
  return [{ para: [uid], titulo: `💰 Pague em até 30 minutos · ${nomePelada(ctx)}`, texto: `Diária da pelada de ${dShort(p.data)}: ${BRL(v)}. Pague pelo app até ${horaMs(Date.now() + PRAZO_PAG)} para garantir sua vaga; depois disso ela vai para o próximo diarista.`, tag: 'pag30-' + pid }];
}
/* ---------- cobranças ---------- */
const stPag = x => !!x && (x === true || !!x.s);
const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
const somaDias = (iso, n) => new Date(Date.parse(iso + 'T12:00:00Z') + n * 864e5).toISOString().slice(0, 10);
const dBR = iso => iso.slice(8, 10) + '/' + iso.slice(5, 7);
// tudo que cada jogador deve, com o vencimento. ctx precisa de jog, pres, pel (recentes) e caixa {mes: doc}
function devidas(ctx, hoje) {
  const cfg = ctx.cfg || {}, out = [], jog = ctx.jog || {}, ativo = j => j && j.ativo !== false;
  const usaCaixa = cfg.usarCaixa != null ? !!cfg.usarCaixa : !cfg.evento;
  if (!usaCaixa) return out;
  // mensalidade (mês atual e anterior)
  if (!cfg.evento) for (const m of [hoje.slice(0, 7), somaDias(hoje.slice(0, 7) + '-01', -1).slice(0, 7)]) {
    const cx = (ctx.caixa || {})[m] || {}, v = cx.precoMensal != null ? Number(cx.precoMensal) : Number(cfg.mensal) || 0;
    if (!(v > 0)) continue;
    const venc = `${m}-${pad(Math.min(28, Math.max(1, Number(cfg.vencMens) || 10)))}`;
    for (const [jid, j] of Object.entries(jog)) if (ativo(j) && (j.tipo || 'mensalista') === 'mensalista' && !stPag((cx.mens || {})[jid])) out.push({ jid, tipo: 'm', desc: 'Mensalidade de ' + MESES[Number(m.slice(5)) - 1], v, venc, ini: m + '-01' });
  }
  // diárias e eventos
  for (const [pid, p] of Object.entries(ctx.pel || {})) {
    if (!p || !p.data || p.data < somaDias(hoje, -40)) continue;
    const pa = ehPA(p, cfg); if (!pa && p.status !== 'encerrada') continue; if (p.dividir && p.precoDiaria == null) continue;
    const ids = p.status === 'encerrada' ? (p.jogaram || participantes(p, pid, ctx)) : participantes(p, pid, ctx);
    for (const jid of ids) { const j = jog[jid]; if (!j || (!pa && j.tipo !== 'diarista')) continue; const v = valorJog(p, cfg, jid);
      if (v > 0 && !stPag((p.diarias || {})[jid])) out.push({ jid, tipo: 'd', desc: (p.extra ? (p.nome || 'Evento extra') : pa ? (p.nome || 'Evento') : 'Diária') + ' de ' + dBR(p.data), v, venc: p.data, ini: p.data }); }
  }
  // cobranças extras
  for (const [m, cx] of Object.entries(ctx.caixa || {})) for (const [xid, x] of Object.entries((cx && cx.extras) || {})) {
    if (!x || x.apagado || !(Number(x.v) > 0)) continue; const venc = x.venc || x.d || m + '-10';
    for (const jid of x.quem || []) if (jog[jid] && !stPag((x.pag || {})[jid])) out.push({ jid, tipo: 'x', desc: x.nome || 'Cobrança extra', v: Number(x.v), venc, xid });
  }
  return out;
}
const linhaDono = (ctx, uid) => (ctx.cfg || {}).mpConectadoEm && (ctx.cfg || {}).mpDono === uid ? ' A conta que recebe é sua: pague por outra conta ou marque como pago no app.' : '';
// aviso diário (10h): mensalidade nova no dia 1º, vence hoje, 5 dias de atraso
function avisosCobranca(ctx, hoje) {
  const out = [], g = nomePelada(ctx), atraso = somaDias(hoje, -5);
  for (const c of devidas(ctx, hoje)) {
    const u = uidDoJogador(ctx, c.jid); if (!u) continue; const dono = linhaDono(ctx, u);
    if (c.tipo === 'm' && hoje.slice(8) === '01' && c.ini === hoje) out.push({ para: [u], titulo: `💰 ${c.desc} · ${g}`, texto: `${BRL(c.v)}, vence dia ${dBR(c.venc)}. Pague pelo app com Pix.${dono}`, tag: 'cob-' + c.tipo + c.venc });
    else if (c.venc === hoje) out.push({ para: [u], titulo: `⏰ Vence hoje · ${g}`, texto: `${c.desc}: ${BRL(c.v)} vence hoje. Pague pelo app com Pix e o Caixa confirma na hora.${dono}`, tag: 'cob-' + c.tipo + c.venc });
    else if (c.venc === atraso) out.push({ para: [u], titulo: `🔴 Pagamento atrasado · ${g}`, texto: `${c.desc}: ${BRL(c.v)} venceu há 5 dias. Toque para pagar com Pix.${dono}`, tag: 'cob-' + c.tipo + c.venc });
  }
  return out;
}
// cobrança extra nova: avisa quem está na lista
function extrasNovas(a, b, ctx) {
  const out = [], g = nomePelada(ctx), ea = (a && a.extras) || {};
  for (const [xid, x] of Object.entries((b && b.extras) || {})) {
    if (!x || ea[xid] || !(Number(x.v) > 0)) continue;
    const venc = x.venc || x.d;
    for (const jid of x.quem || []) { const u = uidDoJogador(ctx, jid); if (!u || stPag((x.pag || {})[jid])) continue;
      out.push({ para: [u], titulo: `💰 Nova cobrança · ${g}`, texto: `${x.nome || 'Cobrança'}: ${BRL(x.v)}${venc ? ', vence em ' + dBR(venc) : ''}. Pague pelo app com Pix.${linhaDono(ctx, u)}`, tag: 'x-' + xid }); }
  }
  return out;
}
// confirmou presença num evento com valor por atleta: avisa o valor
function cobrancaEvento(p, pid, jid, uid, ctx) {
  if (!p || !ehPA(p, ctx.cfg) || (p.dividir && p.precoDiaria == null)) return [];
  const v = valorJog(p, ctx.cfg, jid); if (!(v > 0) || stPag((p.diarias || {})[jid])) return [];
  return [{ para: [uid], titulo: `💰 ${p.extra ? (p.nome || 'Evento extra') : (p.nome || 'Evento')} de ${dBR(p.data)} · ${nomePelada(ctx)}`, texto: `${BRL(v)}, vence em ${dBR(p.data)}. Pague pelo app com Pix.${linhaDono(ctx, uid)}`, tag: 'cobev-' + pid }];
}
module.exports = { aPagar, vencidosConv, avisosVencidos, cobrancaConvocado, devidas, avisosCobranca, extrasNovas, cobrancaEvento, prazoMensChegando, lembreteMens, rodadaNova, dShort, fimDe, janelaH, pelCriada, pelMudouAlgo, pelAtualizada, presAtualizada, membroNovo, muralAtualizado, avalAbriu, avisoAval, participantes, uidsDe };
