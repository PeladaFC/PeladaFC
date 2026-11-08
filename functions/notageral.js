/* Pelota FC · nota geral do app (sem dependências, testável com node teste-nota.js)
   Cada grupo dá notas na sua própria régua: numa pelada fraca, o mesmo jogador tira nota maior que numa forte.
   Modelo: nota do jogador no grupo = nível do jogador + "generosidade" do grupo.
   Os jogadores que estão em mais de um grupo servem de ponte para descobrir a generosidade de cada grupo.
   Grupo sem ponte fica com generosidade 0 (nada a corrigir). */
'use strict';
const LAMBDA = 0.5;    // puxa a generosidade para 0 quando há poucas pontes
const ITER = 40;
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));

// obs: [{ u, g, kind, ovr (0-100), w, crit: {k: 1..5}, pos }]
function calibrar(obs) {
  const chave = o => o.u + '|' + o.kind;
  const nivel = {}, gen = {};
  for (const o of obs) gen[o.g] = 0;
  const porU = {}; for (const o of obs) (porU[chave(o)] = porU[chave(o)] || []).push(o);
  const porG = {}; for (const o of obs) (porG[o.g] = porG[o.g] || []).push(o);
  const media = (L, f) => { let t = 0, w = 0; for (const o of L) { t += f(o) * o.w; w += o.w; } return w ? t / w : 0; };
  for (const k in porU) nivel[k] = media(porU[k], o => o.ovr);
  for (let it = 0; it < ITER; it++) {
    // só quem joga em mais de um grupo informa a generosidade (quem está num grupo só não diz nada sobre a régua)
    for (const g in porG) { let t = 0, w = 0; for (const o of porG[g]) { if (porU[chave(o)].length < 2) continue; t += (o.ovr - nivel[chave(o)]) * o.w; w += o.w; } gen[g] = t / (w + LAMBDA); }
    for (const k in porU) nivel[k] = media(porU[k], o => o.ovr - gen[o.g]);
  }
  return { nivel, gen, porU };
}

// resultado por pessoa: nota geral e atributos já na régua do app
function notasGerais(obs) {
  const { nivel, gen, porU } = calibrar(obs), out = {};
  for (const k in porU) {
    const [u, kind] = k.split('|'), L = porU[k], W = L.reduce((t, o) => t + o.w, 0);
    const crit = {}; const ks = new Set(); L.forEach(o => Object.keys(o.crit || {}).forEach(c => ks.add(c)));
    for (const c of ks) { let t = 0, w = 0; for (const o of L) if (o.crit && o.crit[c] != null) { t += (o.crit[c] * 20 - gen[o.g]) * o.w; w += o.w; } crit[c] = Math.round(clamp(t / w, 20, 99)); }
    const pos = (() => { const c = {}; L.forEach(o => { c[o.pos] = (c[o.pos] || 0) + o.w; }); return Object.entries(c).sort((a, b) => b[1] - a[1])[0][0]; })();
    const r = { ovr: Math.round(clamp(nivel[k], 0, 99)), kind, pos, crit, grupos: L.length, peso: W };
    // a pessoa pode ter nota de linha e de goleiro: fica a de quem joga mais
    if (!out[u] || out[u].peso < W) out[u] = r;
  }
  return { porPessoa: out, gen };
}

// nota sugerida para alguém que está entrando num grupo: nível dele + generosidade do grupo novo
function sugestao(pessoa, genGrupo) {
  if (!pessoa) return null;
  const g = Number(genGrupo) || 0;
  return { ovr: Math.round(clamp(pessoa.ovr + g, 0, 99) * 10) / 10, crit: Object.fromEntries(Object.entries(pessoa.crit || {}).map(([k, v]) => [k, Math.round(clamp((v + g) / 20, 1, 5) * 10) / 10])), n: pessoa.grupos };
}

const pesoObs = x => (x.aval ? 1 : 0.3) * (1 + Math.min(Number(x.j) || 0, 20) / 5);
module.exports = { calibrar, notasGerais, sugestao, pesoObs };
