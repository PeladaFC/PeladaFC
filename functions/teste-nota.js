// node teste-nota.js
const N = require('./notageral'), assert = require('assert');
const o = (u, g, ovr, w = 1) => ({ u, g, kind: 'linha', pos: 'MEI', ovr, w, crit: { tec: ovr / 20 } });
// grupo A é fraco (todo mundo tira nota alta), B é forte. Felipe joga nos dois: 80 em A, 70 em B.
const obs = [o('felipe', 'A', 80), o('felipe', 'B', 70), o('ana', 'A', 85), o('bia', 'B', 75), o('caio', 'A', 60), o('davi', 'B', 50)];
const r = N.notasGerais(obs);
assert(r.gen.A > r.gen.B, 'A deve ser mais generoso que B');
const f = r.porPessoa.felipe.ovr; assert(f > 70 && f < 80, 'Felipe fica entre 70 e 80: ' + f);
// Ana só joga em A (generoso): a nota geral dela cai em relação aos 85
assert(r.porPessoa.ana.ovr < 85, 'Ana cai: ' + r.porPessoa.ana.ovr);
// Bia só joga em B (exigente): sobe em relação aos 75
assert(r.porPessoa.bia.ovr > 75, 'Bia sobe: ' + r.porPessoa.bia.ovr);
// Ana entrando em B: entra mais baixa que os 85 de A
const sg = N.sugestao(r.porPessoa.ana, r.gen.B); assert(sg.ovr < 85, 'sugestão em B: ' + sg.ovr);
// grupo sem ponte: generosidade 0
const r2 = N.notasGerais([o('x', 'C', 70), o('y', 'C', 90)]); assert(Math.abs(r2.gen.C) < 1e-9);
console.log('ok', { gen: r.gen, felipe: f, ana: r.porPessoa.ana.ovr, bia: r.porPessoa.bia.ovr, anaEmB: sg.ovr });
