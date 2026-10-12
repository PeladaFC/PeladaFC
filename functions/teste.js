// Testes das regras de notificação: node teste.js
'use strict';
const R = require('./regras');
const assert = require('assert');
const ctx = {
  grupo: { nome: 'Pelada Teste', admins: ['uA'] }, cfg: { nome: 'Pelada Teste', hora: '18:00', horaFim: '19:00', janelaAval: 24 },
  membros: { uA: {}, uB: {}, uC: {} },
  jog: { jA: { nome: 'Admin Um', apelido: 'Adm' }, jB: { nome: 'João Silva', apelido: 'Joãozinho', tipo: 'mensalista' }, jC: { nome: 'Carlos Lima', tipo: 'diarista' } },
  pres: { uA: { jogador: 'jA' }, uB: { jogador: 'jB' }, uC: { jogador: 'jC' } },
  pel: { p1: { data: '2026-10-10' } }
};
let n = 0; const t = (nome, fn) => { fn(); n++; console.log('✓', nome); };

t('pelada marcada: mensalistas com prazo, diaristas pedem vaga', () => {
  const a = R.pelCriada({ data: '2026-10-10', hora: '18:00', horaFim: '19:00', local: 'Arena X', mensAte: Date.parse('2026-10-09T18:00:00-03:00') }, 'p1', ctx);
  assert.deepStrictEqual(a[0].para.sort(), ['uA', 'uB']); assert.match(a[0].texto, /sáb 10\/10 das 18:00 às 19:00 · Arena X\. Mensalista: confirme até sex 09\/10 às 18:00/);
  assert.deepStrictEqual(a[1].para, ['uC']); assert.match(a[1].texto, /Diarista: peça sua vaga pelo app\. A convocação dos diaristas sai depois de sex 09\/10 às 18:00/);
});
t('evento: nome, valor e aviso para todos', () => {
  const a = R.pelCriada({ data: '2026-10-10', hora: '16:00', local: 'Arena X', extra: true, nome: 'Churrasco', precoDiaria: 30 }, 'p2', ctx);
  assert.strictEqual(a.length, 1); assert.strictEqual(a[0].titulo, '🎉 Churrasco · Pelada Teste');
  assert.match(a[0].texto, /Valor: R\$ 30,00 por atleta \(mensalista também paga\)/);
});
t('convocação avisa só os diaristas convocados', () => {
  const av = R.pelAtualizada({ data: '2026-10-10', conv: {} }, { data: '2026-10-10', hora: '18:00', conv: { jC: 5 }, aprov: { jC: 5 } }, 'p1', ctx);
  assert.strictEqual(av.length, 1); assert.deepStrictEqual(av[0].para, ['uC']); assert.match(av[0].titulo, /Você foi convocado/); assert.match(av[0].texto, /Confirme sua presença/);
});
t('15 minutos antes: só mensalista sem resposta', () => {
  const p = { data: '2026-10-10', mensAte: 1000 * 60e3, resp: { jA: { s: 'sim' } } };
  assert.ok(R.prazoMensChegando(p, 990 * 60e3)); assert.ok(!R.prazoMensChegando(p, 900 * 60e3));
  const av = R.lembreteMens(p, 'p1', ctx); assert.deepStrictEqual(av[0].para, ['uB']);
});
t('cobranças: dia 1º, vence hoje, 5 dias de atraso e dono da conta', () => {
  const c2 = { ...ctx, cfg: { ...ctx.cfg, mensal: 80, vencMens: 10, mpConectadoEm: 1, mpDono: 'uB' }, caixa: { '2026-10': { extras: { x1: { nome: 'Camisa', v: 35, quem: ['jC'], venc: '2026-10-15', pag: {} } } } }, pel: {} };
  const d1 = R.avisosCobranca(c2, '2026-10-01'); assert.ok(d1.some(x => x.para[0] === 'uB' && /Mensalidade de outubro/.test(x.titulo) && /vence dia 10\/10/.test(x.texto) && /A conta que recebe é sua/.test(x.texto)));
  const d10 = R.avisosCobranca(c2, '2026-10-10'); assert.ok(d10.some(x => /Vence hoje/.test(x.titulo)));
  const d15 = R.avisosCobranca(c2, '2026-10-15'); assert.ok(d15.some(x => x.para[0] === 'uC' && /Camisa: R\$ 35,00 vence hoje/.test(x.texto)));
  const d20 = R.avisosCobranca(c2, '2026-10-20'); assert.ok(d20.some(x => /atrasado/.test(x.titulo) && /Camisa/.test(x.texto)));
  assert.ok(R.avisosCobranca(c2, '2026-10-12').length === 0);
});
t('cobrança extra nova avisa a lista', () => {
  const av = R.extrasNovas({ extras: {} }, { extras: { x1: { nome: 'Camisa', v: 35, quem: ['jB', 'jC'], venc: '2026-10-15' } } }, ctx);
  assert.strictEqual(av.length, 2); assert.match(av[0].texto, /Camisa: R\$ 35,00, vence em 15\/10/);
});
t('confirmou em evento com valor: recebe a cobrança', () => {
  const c3 = { ...ctx, pel: { p2: { data: '2026-10-10', extra: true, nome: 'Churrasco', precoDiaria: 30, descontos: { jB: { pct: .5 } } } } };
  const av = R.presAtualizada({ jogador: 'jB', pel: {} }, { jogador: 'jB', pel: { p2: { s: 'sim', t: 1 } } }, 'uB', c3);
  assert.ok(av.some(x => x.para[0] === 'uB' && /R\$ 15,00/.test(x.texto)));
});
t('times sorteados: cada um recebe a cor do próprio time; goleiro extra recebe aviso próprio', () => {
  const b = { data: '2026-10-10', sorteadoEm: 5, times: [{ cor: 0, ids: ['jA'] }, { cor: 1, ids: ['jB'] }], goleiros: ['jC'] };
  const av = R.pelAtualizada({ data: '2026-10-10' }, b, 'p1', ctx);
  assert.strictEqual(av.length, 3);
  assert.deepStrictEqual(av[0].para, ['uA']); assert.match(av[0].texto, /Laranja/);
  assert.deepStrictEqual(av[1].para, ['uB']); assert.match(av[1].texto, /Azul/);
  assert.deepStrictEqual(av[2].para, ['uC']); assert.match(av[2].texto, /gol/);
});
t('mudança sem importância não dispara nada nem lê o banco', () => {
  assert.strictEqual(R.pelMudouAlgo({ stats: {} }, { stats: { jA: { g: 1 } } }), false);
  assert.strictEqual(R.pelMudouAlgo({}, { avalEm: 1 }), true);
});
t('notas publicadas avisam quem jogou', () => {
  const av = R.pelAtualizada({ data: '2026-10-10', jogaram: ['jA', 'jB'] }, { data: '2026-10-10', jogaram: ['jA', 'jB'], avalEm: 9 }, 'p1', ctx);
  assert.deepStrictEqual(av[0].para.sort(), ['uA', 'uB']);
});
t('vaga liberada avisa só o jogador', () => {
  const av = R.pelAtualizada({ data: '2026-10-10', aprov: {} }, { data: '2026-10-10', aprov: { jC: 7 } }, 'p1', ctx);
  assert.deepStrictEqual(av, [{ para: ['uC'], titulo: '✅ Vaga liberada', texto: 'O administrador liberou sua vaga na pelada de sáb 10/10.', tag: 'lib-p1' }]);
});
t('confirmação avisa os administradores, menos quem confirmou', () => {
  const av = R.presAtualizada({ jogador: 'jB', pel: {} }, { jogador: 'jB', pel: { p1: { s: 'sim', t: 1 } } }, 'uB', ctx);
  assert.deepStrictEqual(av[0].para, ['uA']); assert.match(av[0].texto, /Joãozinho confirmou presença · sáb 10\/10/);
  assert.strictEqual(R.presAtualizada({ jogador: 'jA', pel: {} }, { jogador: 'jA', pel: { p1: { s: 'sim', t: 1 } } }, 'uA', ctx).length, 0);
});
t('diarista confirmando vira pedido de vaga; desistência é avisada', () => {
  assert.match(R.presAtualizada({ jogador: 'jC' }, { jogador: 'jC', pel: { p1: { s: 'sim', t: 1 } } }, 'uC', ctx)[0].texto, /pediu vaga/);
  assert.match(R.presAtualizada({ jogador: 'jB', pel: { p1: { s: 'sim', t: 1 } } }, { jogador: 'jB', pel: { p1: { s: 'nao', t: 2 } } }, 'uB', ctx)[0].texto, /desistiu/);
});
t('gols lançados pedem aprovação aos administradores', () => {
  const av = R.presAtualizada({ jogador: 'jB' }, { jogador: 'jB', lanc: { p1: { g: 2, a: 1, t: 3 } } }, 'uB', ctx);
  assert.match(av[0].texto, /Joãozinho lançou 2 gol\(s\) e 1 assist/);
});
t('entrada pelo convite avisa os administradores', () => {
  assert.match(R.membroNovo({ apelido: 'Zé' }, 'uZ', ctx)[0].texto, /Zé entrou pelo convite/);
});
t('recado novo no mural vai para todos; recado antigo não repete', () => {
  const av = R.muralAtualizado({ items: [{ id: 'm1' }] }, { items: [{ id: 'm1' }, { id: 'm2', titulo: 'Atenção', txt: 'Mudou o horário' }] }, ctx);
  assert.strictEqual(av.length, 1); assert.strictEqual(av[0].titulo, '📣 Atenção');
});
t('aviso de avaliação: só depois do término, só uma vez, horário de Recife', () => {
  const p = { data: '2026-10-10', hora: '18:00', horaFim: '19:00', jogaram: ['jA', 'jB'] };
  const fim = Date.parse('2026-10-10T19:00:00-03:00');
  assert.strictEqual(R.avalAbriu(p, ctx.cfg, fim - 60000), false);
  assert.strictEqual(R.avalAbriu(p, ctx.cfg, fim + 60000), true);
  assert.strictEqual(R.avalAbriu({ ...p, pushAvalEm: 1 }, ctx.cfg, fim + 60000), false);
  assert.strictEqual(R.avalAbriu(p, ctx.cfg, fim + 7 * 36e5), false);
  const av = R.avisoAval(p, 'p1', ctx);
  assert.match(av[0].texto, /estrelas até dom 19:00/);
});
t('pelada que vira a meia-noite termina no dia seguinte', () => {
  assert.strictEqual(R.fimDe({ data: '2026-10-10', hora: '23:00', horaFim: '00:30' }, {}), Date.parse('2026-10-11T00:30:00-03:00'));
});
t('avaliação completa aberta avisa todo mundo com o prazo em horário de Recife', () => {
  const av = R.rodadaNova({ status: 'aberta', alvos: ['jA', 'jB'], fim: Date.parse('2026-10-11T15:00:00-03:00') }, ctx);
  assert.deepStrictEqual(av[0].para.sort(), ['uA', 'uB', 'uC']); assert.match(av[0].texto, /Avalie 2 jogadores do Pelada Teste nos 5 critérios até dom 11\/10 15:00/);
});
t('nome do time personalizado aparece no aviso do sorteio', () => {
  const c2 = { ...ctx, cfg: { ...ctx.cfg, nomesTimes: ['Cobra', ''] } };
  const av = R.pelAtualizada({ data: '2026-10-10' }, { data: '2026-10-10', sorteadoEm: 5, times: [{ cor: 0, ids: ['jA'] }, { cor: 1, ids: ['jB'] }] }, 'p1', c2);
  assert.match(av[0].texto, /time Cobra/); assert.match(av[1].texto, /time Azul/);
});
console.log(`\n${n} testes passaram.`);
