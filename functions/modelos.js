/* Textos das notificações automáticas que o administrador pode editar (Avisos → Automáticos → Editar).
   As [etiquetas] são trocadas pelo app na hora de enviar. O texto padrão é o que o app manda quando ninguém mexeu.
   ESTE ARQUIVO EXISTE EM DOIS LUGARES IGUAIS: functions/modelos.js (servidor) e app/modelos.js (app). O teste confere. */
(function (raiz) {
  // etiquetas: o que cada uma vira, com um exemplo para a prévia
  const ETQ = {
    grupo: ['nome da pelada', 'Pelada do Sábado'],
    data: ['dia da pelada', 'sáb 21/11'],
    hora: ['horário de início', '08:00'],
    quando: ['dia, horário e local', 'sáb 21/11 das 08:00 às 10:00 · Arena Boa Viagem'],
    local: ['local (com o ponto antes)', ' · Arena Boa Viagem'],
    prazo: ['frase do prazo dos mensalistas', 'Mensalista: confirme até sex 20/11 20:00 para garantir sua vaga.'],
    convocacao: ['frase de quando saem os diaristas', ' A convocação dos diaristas sai depois de sex 20/11 20:00, por ordem de pedido.'],
    fecha: ['hora em que fecha o prazo', '20:00'],
    evento: ['nome do evento', 'Churrasco de fim de ano'],
    valor: ['valor', 'R$ 20,00'],
    cobrar: ['frase do valor do evento', 'Valor: R$ 20,00 por atleta.'],
    instrucao: ['o que o diarista precisa fazer', 'Confirme sua presença e pague a diária de R$ 20,00 pelo app em até 30 minutos.'],
    nome: ['nome do jogador', 'Carlos'],
    nomes: ['nomes dos jogadores', 'Carlos'],
    seguinte: ['o que aconteceu com a vaga', ' Bruno foi convocado automaticamente.'],
    movimento: ['o que mudou na lista', 'Carlos confirmou presença · sáb 21/11.'],
    time: ['o time do jogador', 'no Time 2'],
    gols: ['gols', '2'],
    assist: ['assistências', '1'],
    pelada: ['de qual pelada (com espaço antes)', ' na pelada de sáb 21/11'],
    ate: ['até quando', 'dom 22/11 20:00'],
    jogadores: ['quantos jogadores', '12 jogadores'],
    cobranca: ['o que está sendo cobrado', 'Mensalidade de novembro'],
    vence: ['vencimento (com vírgula antes)', ', vence em 10/12'],
    dia: ['data do vencimento', '10/12'],
  };
  // um modelo por notificação: k = chave do aviso na lista dos Automáticos
  const MOD = {
    'pel-mens': { k: 'pelada', n: 'Para os mensalistas', t: '⚽ [grupo] · nova pelada', x: '[quando]. [prazo]' },
    'pel-dia': { k: 'pelada', n: 'Para os diaristas', t: '⚽ [grupo] · nova pelada', x: '[quando]. Diarista: peça sua vaga pelo app.[convocacao]' },
    'pel-ev': { k: 'pelada', n: 'Evento (evento livre ou extra)', t: '🎉 [evento] · [grupo]', x: '[data] às [hora][local]. [cobrar] Confirme pelo app!' },
    'mens15': { k: 'prazo15', n: 'Faltam 15 minutos', t: '⏰ Faltam 15 minutos · [grupo]', x: 'Confirme sua presença na pelada de [data]. Às [fecha] fecha o prazo dos mensalistas e as vagas que sobrarem vão para os diaristas convocados.' },
    'conv': { k: 'convocado', n: 'Diarista convocado', t: '✅ Você foi convocado · [grupo]', x: 'Pelada de [data] às [hora][local]. [instrucao]' },
    'lib': { k: 'convocado', n: 'Vaga liberada pelo administrador', t: '✅ Vaga liberada', x: 'O administrador liberou sua vaga na pelada de [data].' },
    'exp': { k: 'prazopix', n: 'Para o diarista que não pagou', t: '⌛ Vaga perdida · [grupo]', x: 'A diária da pelada de [data] não foi paga em 30 minutos e sua vaga foi liberada.' },
    'exp-adm': { k: 'prazopix', n: 'Para os administradores', t: '⌛ Vaga repassada · [grupo]', x: '[nomes] não pagou a diária em 30 minutos.[seguinte]' },
    'pres': { k: 'presenca', n: 'Movimento da lista', t: '📋 [grupo]', x: '[movimento]' },
    'times': { k: 'times', n: 'Para cada jogador', t: '🎲 Times sorteados · [data]', x: 'Você está [time] ⚽. Bom jogo!' },
    'times-gk': { k: 'times', n: 'Para o goleiro extra', t: '🎲 Times sorteados · [data]', x: 'Os times saíram. Você joga no gol como extra. Bom jogo!' },
    'lanc': { k: 'gols', n: 'Gols para aprovar (administradores)', t: '⚽ Gols para aprovar', x: '[nome] lançou [gols] gol(s) e [assist] assist.[pelada].' },
    'lanc-ok': { k: 'gols', n: 'Gols aprovados (jogador)', t: '⚽ Números aprovados', x: 'Seus gols e assistências da pelada de [data] foram aprovados.' },
    'aval': { k: 'avaliar', n: 'Dar notas da pelada', t: '⭐ Dar notas da pelada · [grupo]', x: 'Como foi a pelada de [data]? Dê suas estrelas até [ate]. O voto é secreto.' },
    'notas': { k: 'resultado', n: 'Resultado da pelada', t: '🏆 Saiu o resultado · [grupo]', x: 'A votação da pelada de [data] terminou. Veja o craque, as notas e os prêmios.' },
    'rodada': { k: 'votacao', n: 'Avaliação geral aberta', t: '⭐ Avaliação geral do elenco aberta · [grupo]', x: 'Avalie [jogadores] da galera nos 5 critérios até [ate]. O voto é secreto.' },
    'cob-hoje': { k: 'cobranca', n: 'No dia do vencimento', t: '⏰ Vence hoje · [grupo]', x: '[cobranca]: [valor] vence hoje. Pague pelo app com Pix e o Caixa confirma na hora.' },
    'cob-atraso': { k: 'cobranca', n: '5 dias depois do vencimento', t: '🔴 Pagamento atrasado · [grupo]', x: '[cobranca]: [valor] venceu há 5 dias. Toque para pagar com Pix.' },
    'cob-extra': { k: 'cobranca', n: 'Cobrança extra nova', t: '💰 Nova cobrança · [grupo]', x: '[cobranca]: [valor][vence]. Pague pelo app com Pix.' },
    'cob-ev': { k: 'cobranca', n: 'Confirmou num evento com valor', t: '💰 [evento] de [dia] · [grupo]', x: '[valor], vence em [dia]. Pague pelo app com Pix.' },
    'pag30': { k: 'cobranca', n: 'Diarista convocado: 30 minutos para pagar', t: '💰 Pague em até 30 minutos · [grupo]', x: 'Diária da pelada de [data]: [valor]. Pague pelo app até [ate] para garantir sua vaga; depois disso ela é liberada para outro diarista.' },
    'membro': { k: 'entrar', n: 'Pedido para entrar', t: '👋 [grupo]', x: '[nome] entrou pelo convite e espera sua autorização.' },
    'niver': { k: 'aniversario', n: 'Aniversariante do dia', t: '🎂 Hoje é aniversário de [nome]!', x: '[grupo]: mande os parabéns para [nome]. 🎉' },
  };
  const LIM_T = 80, LIM_X = 300;
  // troca as [etiquetas]; etiqueta desconhecida fica como está
  function preencher(s, v) { return String(s || '').replace(/\[([a-z]+)\]/g, (m, k) => (v && v[k] != null ? String(v[k]) : m)); }
  // o administrador mexeu neste modelo? (texto diferente do padrão)
  function proprio(textos, m) { const T = textos && textos[m], P = MOD[m]; if (!T || !P) return null; const t = typeof T.t === 'string' && T.t.trim() ? T.t.slice(0, LIM_T) : P.t, x = typeof T.x === 'string' && T.x.trim() ? T.x.slice(0, LIM_X) : P.x; return t === P.t && x === P.x ? null : { t, x }; }
  // aplica o texto próprio do grupo numa notificação pronta {m, v, suf, titulo, texto}
  function aplicar(a, textos) { if (!a || !a.m) return a; const T = proprio(textos, a.m); if (!T) return a; return { ...a, titulo: preencher(T.t, a.v), texto: preencher(T.x, a.v) + (a.suf || '') }; }
  // exemplo para a prévia no app
  function exemplo(s) { const v = {}; for (const k in ETQ) v[k] = ETQ[k][1]; return preencher(s, v); }
  const api = { ETQ, MOD, preencher, proprio, aplicar, exemplo, LIM_T, LIM_X };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else raiz.MODELOS = api;
})(typeof window !== 'undefined' ? window : this);
