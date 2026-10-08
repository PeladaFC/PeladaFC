/* ---------- constantes ---------- */
const POS={GOL:'Goleiro',ZAG:'Zagueiro',MEI:'Meio-campo',ATA:'Atacante'};
const CRIT={
  linha:[['tec','Técnica'],['fis','Físico'],['pas','Passe'],['fin','Finalização'],['mar','Marcação']],
  GOL:[['ref','Reflexo'],['posi','Posicionamento'],['sai','Saída do gol'],['rep','Reposição'],['com','Comunicação']]
};
const DIAS=['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'];
const DIAS3=['DOM','SEG','TER','QUA','QUI','SEX','SÁB'];
const MESES=['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
const CORES=[{n:'Laranja',c:'#E8742A',e:'🟠'},{n:'Azul',c:'#2F6FD0',e:'🔵'},{n:'Branco',c:'#F4F4F0',e:'⚪'},{n:'Preto',c:'#22262A',e:'⚫'}];
const AVISOS={
  convocacao:{n:'Convocação',d:'Abre a lista e chama todo mundo'},
  cobrar:{n:'Cobrar respostas',d:'Lista quem ainda não respondeu'},
  lista:{n:'Lista de presença',d:'Confirmados, espera e pendentes'},
  times:{n:'Times sorteados',d:'Escalação de cada time'},
  resultado:{n:'Resultado e prêmios',d:'Craque, artilheiro, garçom e goleiro'},
  pagamento:{n:'Cobrança',d:'Quem deve mensalidade ou diária'}
};
const NOTIF={
  confirmou:{n:'Alguém confirmou',d:'"Fulano confirmou presença"',def:true},
  desistiu:{n:'Alguém desistiu',d:'Estava confirmado e saiu da lista',def:true},
  naoVai:{n:'Alguém recusou',d:'Respondeu que não vai',def:false},
  pedido:{n:'Pedido de vaga',d:'Diarista ou alguém da espera pedindo para jogar',def:true},
  espera:{n:'Foi para a espera',d:'Confirmou com a lista já cheia',def:true},
  subiu:{n:'Abriu vaga',d:'Alguém saiu da espera e entrou na lista',def:true},
  cheia:{n:'Lista completa',d:'Todas as vagas da linha preenchidas',def:true},
  aviso:{n:'Hora de mandar mensagem',d:'Os avisos programados na aba Avisos',def:true}
};
const DEF_CFG={nivelPublico:false,nome:'Pelada de Sábado',dia:6,hora:'08:00',local:'',times:2,porTime:5,mensal:80,diaria:20,pix:'',link:'',restr:[]};
const ICON={
  jogo:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M12 7l4 3-1.5 4.5h-5L8 10z"/><path d="M12 3v4M21 10l-5 0M3 10h5M7 20l2.5-5.5M17 20l-2.5-5.5"/></svg>',
  elenco:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M8 3l-5 3 2 4 2-1v12h10V9l2 1 2-4-5-3c0 2-2 3-4 3S8 5 8 3z"/></svg>',
  avisos:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4M12 13v3l2 1"/></svg>',
  convidar:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="9" cy="8" r="4"/><path d="M2 21c0-4 3-6.5 7-6.5s7 2.5 7 6.5"/><path d="M19 8v6M16 11h6"/></svg>',
  bell:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 16V11a6 6 0 1 1 12 0v5l2 2H4z"/><path d="M10 21h4"/></svg>',
  ranking:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M7 6H4a3 3 0 0 0 3 4M17 6h3a3 3 0 0 1-3 4M12 14v4M8 21h8"/></svg>',
  caixa:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18M16 15h2"/></svg>',
  cfg:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>'
};

/* ---------- estado ---------- */
let S={config:null,jog:{},pel:{},caixa:{},avisos:{},feed:null,pres:{},locais:{},mural:null,membros:{},votos:{},avals:{}};
let REAL=null;               // estado real guardado enquanto a demonstração está aberta
let dl=null, ARTS=[], REAL_ID=null, MSG_ORIG='';
let db=null, isAdmin=false, demo=false, ready=false, loaded=0;
let UI={tab:'jogo',sub:'presenca',filtro:'todos',busca:'',rk:'nota',ano:new Date().getFullYear(),mes:null,sel:null,confirmEnd:false,showHist:false};
try{const t=localStorage.getItem('pelada.tab');if(t)UI.tab=t}catch(e){}
const pending={}, timers={}, queues={};
const COL={jogadores:'jog',peladas:'pel',caixa:'caixa',avisos:'avisos',presencas:'pres',locais:'locais',membros:'membros',votos:'votos',avaliacoes:'avals'};
let myId=null;
const ADM=()=>demo?!UI.comoJogador:isAdmin;

/* ---------- utilidades ---------- */
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmtN=n=>n==null||isNaN(n)?'–':(Math.round(n*10)/10).toFixed(1).replace('.',',');
const BRL=v=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(v||0);
const uid=p=>p+'_'+Math.random().toString(36).slice(2,9)+Date.now().toString(36).slice(-3);
const pad=n=>String(n).padStart(2,'0');
const iso=d=>d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());
const parseD=s=>{const[y,m,d]=s.split('-').map(Number);return new Date(y,m-1,d)};
const dLong=s=>{const d=parseD(s);return DIAS[d.getDay()]+', '+pad(d.getDate())+'/'+pad(d.getMonth()+1)};
const dShort=s=>{const d=parseD(s);return DIAS3[d.getDay()]+' '+pad(d.getDate())+'/'+pad(d.getMonth()+1)};
const cfg=()=>Object.assign({},DEF_CFG,S.config||{});
const J=id=>S.jog[id]||{nome:'(removido)',pos:'MEI'};
const nm=id=>{const j=J(id);return j.apelido||j.nome};
const initials=s=>String(s||'?').trim().split(/\s+/).slice(0,2).map(w=>w[0]).join('').toUpperCase();
const sum=a=>a.reduce((x,y)=>x+y,0);
const isPlain=o=>o&&typeof o==='object'&&!Array.isArray(o);
function merge(a,b){const o=isPlain(a)?{...a}:{};for(const k in b){o[k]=isPlain(b[k])&&isPlain(o[k])?merge(o[k],b[k]):b[k]}return o}
function toast(m){const t=document.getElementById('toast');t.textContent=m;t.hidden=false;clearTimeout(toast.t);toast.t=setTimeout(()=>t.hidden=true,2600)}

/* ---------- gravação ---------- */
function slotGet(path){const[c,id]=path.split('/');return c==='config'?S.config:c==='eventos'?S.feed:S[COL[c]][id]}
function slotSet(path,v){const[c,id]=path.split('/');if(c==='config')S.config=v;else if(c==='eventos')S.feed=v;else if(v==null)delete S[COL[c]][id];else S[COL[c]][id]=v}
function chain(path,fn){queues[path]=(queues[path]||Promise.resolve()).then(fn).catch(writeErr);return queues[path]}
function writeErr(e){console.warn(e);toast(e&&(e.code==='invalid_argument'||e.code==='permission-denied')?(ADM()?'Não foi possível salvar. Verifique a conexão.':'Só o administrador pode alterar isso.'):e&&e.code==='quota_exceeded'?'O banco da pelada encheu. Apague registros antigos.':'Não foi possível salvar. Tente de novo.')}
function put(path,data){slotSet(path,data);render();if(demo||!db)return;delete pending[path];return chain(path,()=>db.doc(path).set(data))}
function del(path){slotSet(path,null);render();if(demo||!db)return;return chain(path,()=>db.doc(path).delete())}
function patch(path,part){
  slotSet(path,merge(slotGet(path),part));render();
  if(demo||!db)return;
  pending[path]=merge(pending[path],part);
  clearTimeout(timers[path]);
  timers[path]=setTimeout(()=>{const p=pending[path];delete pending[path];if(p)chain(path,()=>db.doc(path).update(p))},450);
}
function withPending(colName,map){for(const p in pending){const[c,id]=p.split('/');if(c===colName&&map[id])map[id]=merge(map[id],pending[p])}return map}

/* ---------- regras do jogo ---------- */
function critKey(pos){return pos==='GOL'?CRIT.GOL:CRIT.linha}
/* avaliação do jogador na escala de 0 a 100 (como no FIFA); a nota do jogo continua de 0 a 10 */
const ovr=n=>Math.round((Number(n)||0)*10);
function nomeTime(cor){const v=((cfg().nomesTimes||[])[cor]||'').trim();return v||(CORES[cor]||{n:'Time'}).n}
function notaInicial(j){const g=j.critGalera||{};const k=critKey(j.pos).map(([c])=>Number(g[c]??j.crit?.[c]??3));return sum(k)/k.length*2}
function encerradas(){return Object.entries(S.pel).filter(([,p])=>p.status==='encerrada').sort((a,b)=>b[1].data.localeCompare(a[1].data))}
let NOTA_CACHE=null;
/* Nota do jogador (0 a 10)
   - Nota do jogo: média das estrelas recebidas × 2 (precisa de pelo menos 2 votos).
   - Usa as últimas 10 peladas com nota, a mais recente pesa 1,0 e cada anterior pesa 10% menos (0,9; 0,81…).
   - A nota inicial (dada pelo administrador) começa valendo como 3 peladas e perde meio ponto de peso
     a cada pelada avaliada; depois de 6 peladas avaliadas ela não conta mais. */
const ULTIMAS=10,DECAI=.9;
function historicoNotas(jid){const out=[];
  for(const[pid,p] of Object.entries(S.pel).sort((a,b)=>b[1].data.localeCompare(a[1].data))){if(!p.aval&&p.status!=='encerrada')continue;
    const n=notaJogo(p,pid,jid);if(n!=null)out.push({pid,data:p.data,n});if(out.length>=ULTIMAS)break}
  return out}
function pesoInicial(qtd){return Math.max(0,3-.5*qtd)}
function notaAtual(id){
  if(!NOTA_CACHE){NOTA_CACHE={};
    for(const jid in S.jog){
      const ini=notaInicial(S.jog[jid]),hs=historicoNotas(jid);let W=pesoInicial(hs.length),T=ini*W;
      hs.forEach((x,k)=>{const w=Math.pow(DECAI,k);W+=w;T+=x.n*w});
      NOTA_CACHE[jid]=W?T/W:ini;
    }}
  return NOTA_CACHE[id]??5;
}
function abertas(){return Object.entries(S.pel).filter(([,p])=>p.status!=='encerrada').sort((a,b)=>a[1].data.localeCompare(b[1].data))}
function atual(){const a=abertas();return a.length?a[0]:null}
function ativos(){return Object.entries(S.jog).filter(([,j])=>j.ativo!==false).map(([id])=>id)}
function pidOf(p){return Object.keys(S.pel).find(k=>S.pel[k]===p)}
function respDe(p,pid){
  const resp={...(p.resp||{})};pid=pid||pidOf(p);if(!pid)return resp;
  for(const[u,doc] of Object.entries(S.pres||{})){const j=doc.jogador,r=doc.pel&&doc.pel[pid];if(!j||!r)continue;
    if(!resp[j]||(resp[j].t||0)<(r.t||0))resp[j]={s:r.s,t:r.t,app:true,esp:!!r.esp}}
  return resp;
}
function vinculo(jid){return Object.entries(S.pres||{}).find(([,d])=>d.jogador===jid)?.[0]||null}
function lista(p,pid){
  const c=cfg(),vagas=c.times*c.porTime,resp=respDe(p,pid);
  const aprov=p.aprov||{},sim=ativos().filter(id=>resp[id]?.s==='sim');
  // liberado: o administrador autorizou depois do pedido
  const lib=id=>aprov[id]&&aprov[id]>=(resp[id].t||0)-1000;
  // precisa de liberação: diarista que confirmou pelo app, ou quem confirmou com a lista cheia
  const precisa=id=>resp[id].esp||(J(id).tipo==='diarista'&&resp[id].app);
  const ok=id=>!precisa(id)||lib(id);
  const gks=sim.filter(id=>J(id).pos==='GOL'&&ok(id)).sort((a,b)=>(resp[a].t||0)-(resp[b].t||0));
  const gkAguard=sim.filter(id=>J(id).pos==='GOL'&&!ok(id));
  const line=sim.filter(id=>J(id).pos!=='GOL');
  const key=id=>lib(id)?Math.max(aprov[id],resp[id].t||0):(resp[id].t||0);
  const elig=line.filter(ok).sort((a,b)=>{const ma=lib(a)?1:0,mb=lib(b)?1:0;return ma-mb||key(a)-key(b)});
  const aguard=line.filter(id=>!ok(id)).sort((a,b)=>(resp[a].t||0)-(resp[b].t||0));
  // na espera, mensalista sempre vem antes de diarista (mantendo a ordem de chegada dentro de cada grupo)
  const esp=elig.slice(vagas).concat(aguard),ehD=id=>J(id).tipo==='diarista'?1:0;
  const espera=esp.map((id,i)=>[id,i]).sort((a,b)=>ehD(a[0])-ehD(b[0])||a[1]-b[1]).map(x=>x[0]);
  return{vagas,gks,escalados:elig.slice(0,vagas),espera,aguardando:aguard.concat(gkAguard),
    nao:ativos().filter(id=>resp[id]?.s==='nao'),
    pend:ativos().filter(id=>!resp[id]||!resp[id].s)};
}
function posLinha(id){const j=J(id);if(j.pos!=='GOL')return j.pos;return j.pos2&&j.pos2!=='GOL'?j.pos2:'MEI'}
function sortear(p,T){
  const{escalados,gks}=lista(p),N=notaAtual,noSorteio=!!cfg().golSorteio;
  // padrão: goleiro é extra e não entra no sorteio; o time é formado só pelos jogadores de linha
  const gk=noSorteio?gks.slice().sort((a,b)=>N(b)-N(a)):[];
  const teamsGk=Array.from({length:T},(_,i)=>gk[i]||null);
  const line=escalados.concat(gk.slice(T));
  const L=Array.from({length:T},()=>[]);
  for(const pos of['ZAG','MEI','ATA']){
    const ps=line.filter(id=>posLinha(id)===pos).map(id=>({id,k:N(id)+(Math.random()-.5)*1.2})).sort((a,b)=>b.k-a.k);
    for(const x of ps){let best=0,bs=Infinity;
      L.forEach((arr,i)=>{const sc=arr.filter(id=>posLinha(id)===pos).length*1e4+arr.length*100+sum(arr.map(N));if(sc<bs){bs=sc;best=i}});
      L[best].push(x.id)}
  }
  const restr=cfg().restr||[];
  const gkAvg=gk.length?sum(gk.slice(0,T).map(N))/Math.min(T,gk.length):0;
  const cost=()=>{
    const means=L.map((arr,i)=>(arr.length?sum(arr.map(N))/arr.length:0)+(teamsGk[i]?(N(teamsGk[i])-gkAvg)*.3:0));
    const m=sum(means)/T;let c=sum(means.map(x=>(x-m)**2))*10;
    const sz=L.map(a=>a.length);c+=Math.max(0,Math.max(...sz)-Math.min(...sz)-1)*50;
    for(const pos of['ZAG','MEI','ATA']){const n=L.map(a=>a.filter(id=>posLinha(id)===pos).length);c+=Math.max(0,Math.max(...n)-Math.min(...n)-1)*3}
    for(const r of restr){const ta=L.findIndex(a=>a.includes(r.a)),tb=L.findIndex(a=>a.includes(r.b));
      if(ta<0||tb<0)continue;if(r.tipo==='separar'&&ta===tb)c+=20;if(r.tipo==='juntar'&&ta!==tb)c+=20}
    return c};
  let c=cost();
  for(let it=0;it<4000&&T>1;it++){
    const i=Math.floor(Math.random()*T);let j=Math.floor(Math.random()*T);if(i===j)continue;
    if(!L[i].length||!L[j].length)continue;
    const a=Math.floor(Math.random()*L[i].length);
    let cand=L[j].map((id,k)=>k);
    if(Math.random()<.75){const same=cand.filter(k=>posLinha(L[j][k])===posLinha(L[i][a]));if(same.length)cand=same}
    const b=cand[Math.floor(Math.random()*cand.length)];
    [L[i][a],L[j][b]]=[L[j][b],L[i][a]];
    const c2=cost();if(c2<=c)c=c2;else[L[i][a],L[j][b]]=[L[j][b],L[i][a]];
  }
  const ord={ZAG:0,MEI:1,ATA:2};
  return L.map((arr,i)=>({cor:i,gk:teamsGk[i],ids:arr.sort((a,b)=>ord[posLinha(a)]-ord[posLinha(b)])}));
}
function teamMedia(t){const ids=(t.gk?[t.gk]:[]).concat(t.ids);return ids.length?sum(ids.map(notaAtual))/ids.length:0}
function jogaram(p){if(p.jogaram)return p.jogaram;if(p.times)return p.times.flatMap(t=>(t.gk?[t.gk]:[]).concat(t.ids)).concat((p.goleiros||[]).filter(id=>S.jog[id]));return p.resp||1?lista(p).escalados.concat(lista(p).gks):[]}
/* horário de início e término */
function maisHora(h,min){const[a,b]=String(h||'08:00').split(':').map(Number);const t=((a*60+b+min)%1440+1440)%1440;return pad(Math.floor(t/60))+':'+pad(t%60)}
function horaIniDe(p){return(p&&p.hora)||cfg().hora}
function horaFimDe(p){return(p&&p.horaFim)||cfg().horaFim||maisHora(horaIniDe(p),60)}
function horarioTxt(p){return horaIniDe(p)+' às '+horaFimDe(p)}
function fimDe(p){const d=parseD(p.data),i=horaIniDe(p),f=horaFimDe(p),[h,m]=f.split(':').map(Number);d.setHours(h,m,0,0);if(f<=i)d.setDate(d.getDate()+1);return d}
function janelaH(){const h=Number(cfg().janelaAval);return h>0?h:24}
function fimAval(p){return fimDe(p).getTime()+janelaH()*36e5}
function posAberto(p){const f=fimDe(p).getTime(),n=Date.now();return n>=f&&n<fimAval(p)}
/* avaliação secreta em estrelas.
   Cada voto fica em votos/{uid} (só a própria pessoa e os administradores conseguem ler).
   Enquanto a avaliação está aberta ninguém vê médias. Quando fecha, o app de um administrador
   consolida as médias na pelada (p.aval) e só então elas aparecem e entram na nota. */
const MIN_VOTOS=2;
function meusVotos(pid){const d=(S.votos||{})[myId];return(d&&d.v&&d.v[pid])||{}}
function votosDe(pid){const out={};for(const[u,d] of Object.entries(S.votos||{})){const v=d&&d.v&&d.v[pid];const jog=(d&&d.jogador)||(S.pres[u]||{}).jogador;if(v&&jog)out[jog]=v}return out}
/* Detecção de votos fora da curva ("avacalhação").
   Para cada eleitor, compara cada voto dele com a média que os OUTROS deram para o mesmo jogador.
   - desvio médio até 1 estrela: voto normal, peso 100%
   - de 1 a 2,5 estrelas: o peso cai aos poucos até 15%
   - acima de 2,5 estrelas: peso 15%
   - mesma nota para todo mundo (4 ou mais votos): peso no máximo 50%
   - se já foi fora da curva em 2 das últimas 5 peladas: peso cai pela metade
   Tudo automático e silencioso: ninguém é avisado e os votos continuam secretos. */
function pesoBase(dev,chapado){let w=dev<=1?1:dev>=2.5?.15:1-(dev-1)/1.5*.85;if(chapado)w=Math.min(w,.5);return w}
/* Régua de cada avaliador: quem é mais exigente (dá 1-2) e quem é mais bonzinho (dá 4-5) passam para a mesma régua
   antes de qualquer conta. O app tira a diferença entre a média de cada um e a média geral da galera;
   assim conta QUEM você acha melhor ou pior, não o tamanho do número. */
function ajustarRegua(vs){ // vs: {avaliador:{alvo:valor}} → mesma forma, com os valores ajustados
  const todos=[];for(const[V,m] of Object.entries(vs))for(const[t,v] of Object.entries(m||{}))if(t!==V&&Number(v))todos.push(Number(v));
  if(!todos.length)return{};const G=sum(todos)/todos.length,out={};
  for(const[V,m] of Object.entries(vs)){const its=Object.entries(m||{}).filter(([t,v])=>t!==V&&Number(v));if(!its.length)continue;
    const mv=sum(its.map(([,v])=>Number(v)))/its.length,off=its.length>=2?mv-G:0;
    out[V]={};for(const[t,v] of its)out[V][t]=Number(v)-off}
  return out}
function analiseBase(pid){const bruto=votosDe(pid),vs=ajustarRegua(bruto),out={};
  for(const[V,m] of Object.entries(vs)){const its=Object.entries(m);if(!its.length)continue;
    const difs=[];for(const[t,v] of its){const os=Object.entries(vs).filter(([o])=>o!==V&&o!==t).map(([,mm])=>mm[t]).filter(x=>x!=null);
      if(os.length>=2)difs.push(v-sum(os)/os.length)}
    const vals=Object.entries(bruto[V]||{}).filter(([t,v])=>t!==V&&Number(v)).map(([,v])=>Number(v)),chapado=vals.length>=4&&vals.every(x=>x===vals[0]);
    const dev=difs.length>=2?sum(difs.map(Math.abs))/difs.length:0,lado=difs.length?sum(difs)/difs.length:0;
    out[V]={dev,lado,chapado,qtd:vals.length,media:vals.length?sum(vals)/vals.length:0,wb:pesoBase(dev,chapado)}}
  return out}
function analisarVotos(pid){const p=S.pel[pid]||{},base=analiseBase(pid);
  const ant=Object.entries(S.pel).filter(([k,q])=>k!==pid&&q.data<p.data).sort((a,b)=>b[1].data.localeCompare(a[1].data)).slice(0,5).map(([k])=>[k,analiseBase(k)]);
  for(const[V,x] of Object.entries(base)){x.hist=ant.filter(([,b])=>b[V]&&b[V].wb<.6).map(([k])=>k);
    x.w=x.wb*(x.hist.length>=2?.5:1)}
  const r={},vs=ajustarRegua(votosDe(pid));
  for(const[V,m] of Object.entries(vs)){const w=base[V]?base[V].w:1;for(const[t,v] of Object.entries(m)){(r[t]=r[t]||{s:0,w:0,n:0});r[t].s+=v*w;r[t].w+=w;if(w>0)r[t].n++}}
  const aval={};for(const t in r)if(r[t].w>0)aval[t]={m:Math.round(Math.max(1,Math.min(5,r[t].s/r[t].w))*100)/100,n:r[t].n};
  return{aval,eleitores:base}}
function apurar(pid){return analisarVotos(pid).aval}
const FECHANDO=new Set();
function consolidarAvaliacoes(){if(demo||!ADM()||!S.votosOk)return;const now=Date.now();
  for(const[pid,p] of Object.entries(S.pel)){if(p.aval||FECHANDO.has(pid)||!jogaram(p).length||(!p.times&&p.status!=='encerrada'))continue;
    if(now<fimAval(p))continue;FECHANDO.add(pid);patch('peladas/'+pid,{aval:apurar(pid),avalEm:now})}}
function avalPublicada(p){return!!p.aval}
// nota do jogo (0 a 10): média das estrelas recebidas × 2, com pelo menos 2 votos
function notaJogo(p,pid,jid){const a=p.aval&&p.aval[jid];if(a&&a.n>=MIN_VOTOS)return a.m*2;const n=p.stats?.[jid]?.n;return typeof n==='number'?n:null}
function rankingNotas(p,pid){return jogaram(p).filter(id=>S.jog[id]).map(id=>({id,n:notaJogo(p,pid,id),a:(p.aval||{})[id]}))
  .sort((x,y)=>(y.n??-1)-(x.n??-1)||((y.a||{}).n||0)-((x.a||{}).n||0)||nm(x.id).localeCompare(nm(y.id)))}
function craquePereba(p,pid){if(!p.aval)return{};const r=rankingNotas(p,pid).filter(x=>x.n!=null);if(r.length<2)return{};return{mvp:r[0].id,per:r[r.length-1].id}}
function premiosDe(p,pid){pid=pid||pidOf(p);const pr={...(p.premios||{})},cp=craquePereba(p,pid);
  if(!pr.mvp&&cp.mvp)pr.mvp=cp.mvp;if(!pr.per&&cp.per)pr.per=cp.per;return pr}
/* gols e assistências lançados pelo próprio jogador: ficam pendentes até um administrador aprovar */
function lancStatus(p,u,L){if(!L)return null;if((p.lancOk||{})[u]>=L.t)return'ok';if((p.lancRec||{})[u]>=L.t)return'rec';return'pend'}
function lancPendentes(){const out=[];for(const[u,d] of Object.entries(S.pres||{})){if(!d||!d.jogador||!S.jog[d.jogador])continue;
  for(const[pid,L] of Object.entries(d.lanc||{})){const p=S.pel[pid];if(p&&lancStatus(p,u,L)==='pend')out.push({u,pid,p,L,j:d.jogador})}}
  return out.sort((a,b)=>a.L.t-b.L.t)}
function trim10(o){return Object.fromEntries(Object.entries(o||{}).sort((x,y)=>String(x[0]).localeCompare(String(y[0]))).slice(-10))}
/* estatísticas por período (datas 'AAAA-MM-DD', fim exclusivo). Ajustes do administrador entram pelo mês. */
function estatPeriodo(ini,fim){
  const dentro=d=>(!ini||d>=ini)&&(!fim||d<fim);
  // conta a pelada encerrada ou com a avaliação já fechada
  const enc=Object.entries(S.pel).filter(([,p])=>(p.status==='encerrada'||p.aval)&&dentro(p.data));
  const st={};for(const id in S.jog)st[id]={j:0,g:0,a:0,mvp:0,art:0,gar:0,gol:0,per:0,notas:[],ajG:0,ajA:0};
  for(const[pid,p] of enc){
    for(const id of jogaram(p)){if(!st[id])continue;st[id].j++;const n=notaJogo(p,pid,id);if(n!=null)st[id].notas.push(n)}
    for(const id in p.stats||{}){if(!st[id])continue;st[id].g+=p.stats[id].g||0;st[id].a+=p.stats[id].a||0}
    const pr=premiosDe(p,pid);for(const k of['mvp','art','gar','gol','per'])if(st[pr[k]])st[pr[k]][k]++;
  }
  for(const[id,j] of Object.entries(S.jog))for(const[mes,aj] of Object.entries(j.ajustes||{})){if(!st[id]||!dentro(mes+'-15'))continue;
    st[id].g+=aj.g||0;st[id].a+=aj.a||0;st[id].ajG+=aj.g||0;st[id].ajA+=aj.a||0}
  for(const id in st){const s=st[id];s.g=Math.max(0,s.g);s.a=Math.max(0,s.a);s.media=s.notas.length?sum(s.notas)/s.notas.length:null}
  return{st,total:enc.length};
}
function temporada(ano){return estatPeriodo(ano?ano+'-01-01':null,ano?(Number(ano)+1)+'-01-01':null)}
function proximaData(){const c=cfg(),d=new Date();d.setHours(0,0,0,0);while(d.getDay()!==Number(c.dia))d.setDate(d.getDate()+1);return iso(d)}

/* ---------- avisos programados ---------- */
function ocorrencias(a,now=new Date()){
  const[h,m]=(a.hora||'09:00').split(':').map(Number);
  const last=new Date(now);last.setHours(h,m,0,0);
  while(last.getDay()!==Number(a.dia)||last>now)last.setDate(last.getDate()-1),last.setHours(h,m,0,0);
  const next=new Date(last);next.setDate(next.getDate()+7);
  return{last,next};
}
function avisosVencidos(){
  const now=new Date(),out=[];
  for(const[id,a] of Object.entries(S.avisos)){if(a.ativo===false)continue;
    const{last}=ocorrencias(a,now);const key=iso(last);
    if(now-last<36*3600e3&&!(a.feitos||{})[key])out.push({id,a,key,when:last})}
  return out.sort((x,y)=>x.when-y.when);
}
function proximosAvisos(){
  const now=new Date();
  return Object.entries(S.avisos).filter(([,a])=>a.ativo!==false).map(([id,a])=>{
    const{last,next}=ocorrencias(a,now);const feito=(a.feitos||{})[iso(last)];
    return{id,a,when:(!feito&&now-last<36*3600e3)?last:next}}).sort((x,y)=>x.when-y.when);
}
function relTempo(d){const ms=d-new Date(),h=Math.round(Math.abs(ms)/36e5);
  if(ms<0)return h<1?'agora':'há '+h+'h';if(h<1)return'em menos de 1h';if(h<36)return'em '+h+'h';return'em '+Math.round(h/24)+' dias'}

/* ---------- locais ---------- */
// Cadastro manual. Cada local fica salvo na pelada e também no histórico da pessoa (users/{uid}.locais).
function selLocais(id,sel,vazio){const ls=Object.entries(S.locais).sort((a,b)=>a[1].nome.localeCompare(b[1].nome));
  return`<select id="${id}"><option value="">${ls.length?vazio:'Nenhum local salvo'}</option>${ls.map(([k,L])=>`<option value="${k}" ${sel===k?'selected':''}>${esc(L.nome)}</option>`).join('')}</select>`}
function mapaURL(nome,end){const q=[nome,end].filter(Boolean).join(', ');return q?'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(q):''}
function localDe(p){const lid=(p&&p.localId)||(!p||!p.local?cfg().localId:null),L=lid&&S.locais[lid];
  if(L)return{id:lid,nome:L.nome,end:L.end||'',tel:L.tel||'',url:L.end?mapaURL(L.nome,L.end):''};
  const nome=(p&&p.local)||cfg().local;return nome?{nome,end:'',tel:'',url:''}:null}
// mapa e botões de navegação a partir do endereço
const navQ=(nome,end)=>[nome,end].filter(Boolean).join(', ');
function mapaEmbed(nome,end){return`<iframe class="mapa" loading="lazy" referrerpolicy="no-referrer-when-downgrade" title="Mapa do local" src="https://maps.google.com/maps?q=${encodeURIComponent(navQ(nome,end))}&z=16&output=embed"></iframe>`}
function navBotoes(nome,end){const q=encodeURIComponent(navQ(nome,end)),qe=encodeURIComponent(end);
  return`<div class="navs"><a class="btn sm" target="_blank" rel="noopener" href="https://www.google.com/maps/dir/?api=1&destination=${q}">Google Maps</a><a class="btn sm" target="_blank" rel="noopener" href="https://waze.com/ul?q=${qe}&navigate=yes">Waze</a><a class="btn sm" target="_blank" rel="noopener" href="https://maps.apple.com/?daddr=${q}">Mapas (iPhone)</a></div>`}
function blocoMapa(nome,end){return end?mapaEmbed(nome,end)+navBotoes(nome,end):''}
function telLink(tel){const t=String(tel||'').replace(/\D/g,'');return t?`<a class="btn sm" href="tel:${t}">Ligar</a>${waLink(tel,'Olá! Gostaria de saber sobre horário para uma pelada.')?`<a class="btn sm" target="_blank" rel="noopener" href="${waLink(tel,'Olá! Gostaria de saber sobre horário para uma pelada.')}">WhatsApp</a>`:''}`:''}
function formLocal(L,pre){L=L||{};
  return`<label class="field"><span>Nome do local</span><input type="text" id="l-nome" value="${esc(L.nome||pre||'')}" placeholder="Ex.: Arena Boa Viagem"></label>
    <label class="field"><span>Endereço <i class="opc">opcional</i></span><input type="text" id="l-end" value="${esc(L.end||'')}" placeholder="Rua, número, bairro, cidade" data-mapa="l-mapa-prev" autocomplete="street-address"></label>
    <div id="l-mapa-prev">${blocoMapa(L.nome,L.end)}</div>
    <label class="field"><span>Telefone <i class="opc">opcional</i></span><input type="tel" id="l-tel" value="${esc(L.tel||'')}" placeholder="(81) 99999-9999"></label>`}
function lerFormLocal(){const g=x=>(document.getElementById(x)||{value:''}).value.trim();return{nome:g('l-nome'),end:g('l-end'),tel:g('l-tel')}}
let mapaT=null;
function atualizarPrevia(inp){clearTimeout(mapaT);mapaT=setTimeout(()=>{const box=document.getElementById(inp.dataset.mapa);if(!box)return;
  const nome=(document.getElementById('l-nome')||{}).value||'',end=inp.value.trim();box.innerHTML=end.length>=6?blocoMapa(nome.trim(),end):''},800)}
// histórico pessoal (fica no perfil da pessoa, vale para todas as peladas dela)
function historicoLocais(){return demo?{}:((window.meusLocais&&window.meusLocais())||{})}
function guardarNoHistorico(id,L){if(demo||!window.salvarMeuLocal)return;window.salvarMeuLocal(id,{nome:L.nome||'',end:L.end||'',tel:L.tel||'',t:Date.now()})}
function sheetLocal(id,pre){
  const L=id?S.locais[id]:null;
  openSheet(id?'Editar local':'Novo local',`<div class="stack">${formLocal(L,pre)}
    <button class="btn primary block" data-act="save-local" data-l="${id||''}">Salvar local</button>
    ${id?`<button class="btn danger block" data-act="del-local" data-l="${id}">Apagar local</button>`:''}</div>`);
}
function sheetLocais(){
  const ls=Object.entries(S.locais).sort((a,b)=>a[1].nome.localeCompare(b[1].nome));
  openSheet('Locais',`<div class="stack"><div class="panel"><div class="list">
    ${ls.length?ls.map(([id,L])=>`<div class="item"><div class="grow"><div class="name">${esc(L.nome)}</div><div class="sub">${esc([L.end,L.tel].filter(Boolean).join(' · ')||'Sem endereço')}</div>${notaCampoHTML(id)}</div>
      <button class="btn sm" data-act="edit-local" data-l="${id}" aria-label="Editar">✎</button></div>`).join(''):'<div class="empty">Nenhum local salvo ainda.</div>'}
    </div></div>
    <button class="btn block" data-act="add-local">+ Cadastrar local</button></div>`);
}

/* ---------- escolher o local da pelada ---------- */
let LP=null;
function abrirSeletor(alvo){LP={alvo,step:'lista'};openSheet('Onde vai ser a pelada?','<div id="lp"></div>');renderSeletor()}
function locaisDisponiveis(){
  const out={},hist=historicoLocais();
  for(const[id,L] of Object.entries(S.locais))out[id]={...L,t:Math.max(L.usadoEm||0,(hist[id]||{}).t||0),daPelada:true};
  for(const[id,L] of Object.entries(hist))if(!out[id]&&L&&L.nome)out[id]={...L,daPelada:false};
  return Object.entries(out).sort((a,b)=>(b[1].t||0)-(a[1].t||0)||a[1].nome.localeCompare(b[1].nome));
}
function renderSeletor(){
  const el=document.getElementById('lp');if(!el||!LP)return;let h='';
  if(LP.step==='lista'){
    const ls=locaisDisponiveis();
    h+=`<button class="btn primary block" data-act="lp-novo" style="margin-bottom:12px">+ Cadastrar novo local</button>`;
    h+=ls.length?`<div class="sub" style="margin-bottom:6px;font-weight:700">LOCAIS QUE VOCÊ JÁ USOU</div><div class="panel"><div class="list">`+
      ls.map(([id,L])=>`<button class="pickrow" data-act="lp-sel" data-v="${id}"><span class="grow"><b>${esc(L.nome)}</b><span class="sub">${esc([L.end,L.tel].filter(Boolean).join(' · ')||'Sem endereço')}</span>${L.daPelada&&notaCampoHTML(id)?`<span class="livre">${notaCampoHTML(id)}</span>`:''}${!L.daPelada?'<span class="sub">De outra pelada sua</span>':''}</span><span class="go">›</span></button>`).join('')+'</div></div>'
      :`<div class="empty">Você ainda não cadastrou nenhum local. Os locais que você usar ficam guardados aqui para as próximas vezes.</div>`;
  }else{
    h+=`<div class="crumbs"><button data-act="lp-voltar">‹ Locais que você já usou</button></div><div class="stack">${formLocal(null,'')}
      <button class="btn primary block" data-act="lp-salvar">Salvar e usar este local</button>
      <p class="sub" style="margin:0">Fica salvo só na sua pelada e no seu histórico de locais.</p></div>`;
  }
  el.innerHTML=h;
}
function usarLocal(id){
  const alvo=LP&&LP.alvo;LP=null;
  if(!S.locais[id]){const H=historicoLocais()[id];if(H)put('locais/'+id,{nome:H.nome,end:H.end||'',tel:H.tel||'',usadoEm:Date.now()})}
  const L=S.locais[id]||historicoLocais()[id]||{};guardarNoHistorico(id,L);
  closeSheet();
  if(alvo==='np'){UI.npLoc=id;render()}
  else if(alvo&&S.pel[alvo]){patch('peladas/'+alvo,{localId:id,local:L.nome||''});toast('Local atualizado.')}
}
function sheetComoChegar(pid){const LL=localDe(S.pel[pid]);if(!LL)return;
  openSheet(LL.nome,`<div class="stack">${LL.end?`<div class="sub">📍 ${esc(LL.end)}</div>${blocoMapa(LL.nome,LL.end)}`:'<div class="sub">Este local ainda não tem endereço.</div>'}
    ${LL.tel?`<div class="row" style="gap:6px"><span class="sub num">📞 ${esc(LL.tel)}</span>${telLink(LL.tel)}</div>`:''}</div>`)}
/* avaliação dos campos */
const CRIT_CAMPO=[['gram','Gramado'],['atend','Atendimento'],['amb','Ambiente'],['banh','Banheiros'],['tam','Tamanho do campo']];
function avalLocal(lid){
  const rs=[];
  for(const[pid,p] of Object.entries(S.pel))if(p.localId===lid&&p.avalCampo&&Object.keys(p.avalCampo).length)rs.push(p.avalCampo);
  for(const d of Object.values(S.pres||{}))for(const[pid,a] of Object.entries(d.avalCampo||{}))if(S.pel[pid]&&S.pel[pid].localId===lid&&a&&Object.keys(a).length)rs.push(a);
  if(!rs.length)return null;
  const crit={};for(const[k] of CRIT_CAMPO){const v=rs.map(r=>Number(r[k])).filter(Boolean);crit[k]=v.length?sum(v)/v.length:null}
  const vals=Object.values(crit).filter(x=>x!=null);
  return{n:rs.length,media:vals.length?sum(vals)/vals.length:null,crit};
}
function notaCampoHTML(lid){const a=avalLocal(lid);return a&&a.media?`<span class="rnota">★ ${fmtN(a.media)} <span class="sub">(${a.n})</span></span>`:''}
function estrelasInput(val,attrs){return`<div class="st">${[1,2,3,4,5].map(v=>`<button class="${(val||0)>=v?'on':''}" ${attrs} data-v="${v}" aria-label="${v} estrela${v>1?'s':''}">★</button>`).join('')}</div>`}
function formAvalCampo(pid,atual,quem){
  return CRIT_CAMPO.map(([k,n])=>`<div class="rate"><span>${n}</span>${estrelasInput(atual&&atual[k],`data-act="aval-campo" data-p="${pid}" data-c="${k}" data-q="${quem}"`)}</div>`).join('')}
function avalPendenteJogador(){
  const j=meuJogador();if(!j)return null;const d=S.pres[myId]||{};
  const enc=encerradas().filter(([pid,p])=>p.localId&&S.locais[p.localId]&&jogaram(p).includes(j)&&(Date.now()-parseD(p.data))<15*864e5);
  const alvo=enc.find(([pid])=>!(d.avalCampo||{})[pid]||Object.keys(d.avalCampo[pid]).length<CRIT_CAMPO.length);
  return alvo||null;
}

/* agenda do campo */
function proxDias(n=7){const out=[],d=new Date();d.setHours(0,0,0,0);for(let i=0;i<n;i++){out.push(new Date(d));d.setDate(d.getDate()+1)}return out}
function slotsLivres(L,n=7){const now=new Date(),out=[];
  for(const dia of proxDias(n)){const ds=iso(dia);
    for(const h of (L.horarios||[]).filter(h=>Number(h.d)===dia.getDay()).sort((a,b)=>a.i.localeCompare(b.i))){
      const[hh,mm]=h.i.split(':').map(Number),ini=new Date(dia);ini.setHours(hh,mm,0,0);if(ini<now)continue;
      const res=(L.reservas||{})[ds+'_'+h.i];out.push({data:ds,i:h.i,f:h.f,livre:!res||res.s==='recusada'})}}
  return out}
function waLink(tel,txt){const t=String(tel||'').replace(/\D/g,'');if(!t)return'';return'https://wa.me/'+(t.length<=11?'55'+t:t)+'?text='+encodeURIComponent(txt)}
function detalheLocal(id){const L=S.locais[id],sl=slotsLivres(L),c=cfg();
  const porDia={};sl.forEach(x=>(porDia[x.data]=porDia[x.data]||[]).push(x));
  const wa=waLink(L.tel,`Olá! Vi o ${L.nome} no app da ${c.nome}. Vocês têm horário disponível para uma pelada?`);
  return`<div class="stack"><div class="loccard"><div class="pin">📍</div><div class="grow"><div class="name">${esc(L.nome)}</div><div class="sub">${esc([L.tipo,L.valor?BRL(L.valor)+'/h':'',L.end,L.cidade].filter(Boolean).join(' · '))}</div></div></div>
    <div class="row">${(L.mapa||L.end||L.nome)?`<a class="btn sm" target="_blank" rel="noopener" href="${esc(L.mapa||mapaURL(L.nome,[L.end,L.cidade,L.uf].filter(Boolean).join(', ')))}">Ver no mapa</a>`:''}
      ${wa?`<a class="btn sm" target="_blank" rel="noopener" href="${wa}">Chamar no WhatsApp</a><span class="sub num">${esc(L.tel)}</span>`:'<span class="sub">Sem contato cadastrado</span>'}</div>
    ${(()=>{const a=avalLocal(id);return a?`<div class="panel"><h3>Avaliação dos jogadores</h3><div style="margin:8px 0 10px"><span class="rnota" style="font-size:20px">${starsHTML(Math.round(a.media*2)/2)} ${fmtN(a.media)}</span> <span class="sub">· ${a.n} avaliaç${a.n>1?'ões':'ão'}</span></div>
      ${CRIT_CAMPO.map(([k,n])=>a.crit[k]==null?'':`<div class="rbar"><span>${n}</span><div class="meter"><i style="width:${a.crit[k]/5*100}%"></i></div><b class="num">${fmtN(a.crit[k])}</b></div>`).join('')}</div>`
      :'<div class="sub">Este campo ainda não tem avaliações. Depois da pelada, os jogadores podem avaliar.</div>'})()}
    <button class="btn primary block" data-act="lp-sel" data-v="${id}">Usar este local</button></div>`}
function sheetAgenda(id){const L=S.locais[id];
  const hs=(L.horarios||[]).map((h,i)=>({...h,k:i})).sort((a,b)=>a.d-b.d||a.i.localeCompare(b.i));
  const res=Object.entries(L.reservas||{}).filter(([k])=>k.slice(0,10)>=iso(new Date())).sort();
  openSheet('Agenda · '+L.nome,`<div class="stack">
    <div class="banner"><span>Esta é a área do <b>dono do campo</b>. No protótipo, você simula o dono. Na versão final, ele terá login próprio.</span></div>
    <div class="panel"><div class="panel-h"><h3>Pedidos de reserva</h3></div><div class="list">
      ${res.length?res.map(([k,v])=>`<div class="item"><div class="grow"><div class="name">${dShort(k.slice(0,10))} · ${k.slice(11)}</div><div class="sub">${esc(v.quem||'')} · ${v.s==='pedido'?'aguardando':v.s==='confirmada'?'confirmada':'recusada'}</div></div>
        ${v.s==='pedido'?`<button class="btn sm primary" data-act="res" data-l="${id}" data-k="${k}" data-v="confirmada">Confirmar</button><button class="btn sm" data-act="res" data-l="${id}" data-k="${k}" data-v="recusada">Recusar</button>`:`<button class="btn sm" data-act="res" data-l="${id}" data-k="${k}" data-v="del">Liberar</button>`}</div>`).join(''):'<div class="empty">Nenhum pedido.</div>'}</div></div>
    <div class="panel"><div class="panel-h"><h3>Horários para aluguel</h3><span class="sub">toda semana</span></div><div class="list">
      ${hs.length?hs.map(h=>`<div class="item"><div class="grow"><b>${DIAS[h.d]}</b> <span class="num">${h.i}–${h.f}</span></div><button class="btn sm" data-act="del-hor" data-l="${id}" data-i="${h.k}" aria-label="Apagar horário">✕</button></div>`).join(''):'<div class="empty">Nenhum horário cadastrado.</div>'}</div>
      <div class="grid2" style="margin-top:10px"><label class="field"><span>Dia</span><select id="h-dia">${DIAS.map((d,i)=>`<option value="${i}">${d}</option>`).join('')}</select></label>
      <div class="grid2"><label class="field"><span>Início</span><input type="time" id="h-ini" value="19:00"></label><label class="field"><span>Fim</span><input type="time" id="h-fim" value="20:00"></label></div></div>
      <button class="btn primary block" style="margin-top:8px" data-act="add-hor" data-l="${id}">+ Adicionar horário</button></div></div>`)}
function sheetDono(){const ls=Object.entries(S.locais).sort((a,b)=>a[1].nome.localeCompare(b[1].nome));
  openSheet('Área do dono do campo',`<div class="stack"><p class="sub" style="margin:0">Aqui o dono publica os horários livres e responde aos pedidos de reserva. No protótipo, você testa como se fosse o dono.</p>
    <div class="panel"><div class="list">${ls.length?ls.map(([id,L])=>{const pend=Object.values(L.reservas||{}).filter(v=>v.s==='pedido').length;
      return`<button class="pickrow" data-act="agenda" data-l="${id}"><span class="grow"><b>${esc(L.nome)}</b><span class="sub">${(L.horarios||[]).length} horários por semana${L.cidade?' · '+esc(L.cidade):''}</span></span>${pend?`<span class="cnt">${pend} pedido${pend>1?'s':''}</span>`:''}<span class="go">›</span></button>`}).join(''):'<div class="empty">Cadastre um local primeiro.</div>'}</div></div></div>`)}


/* ---------- mensagens para o WhatsApp ---------- */
function msg(tipo,ctx={}){
  const c=cfg(),pe=atual(),p=ctx.pel||(pe&&pe[1]);
  const quando=p?`📅 *${dLong(p.data)}* das *${horaIniDe(p)}* às *${horaFimDe(p)}*`:`📅 *${DIAS[c.dia]}* das *${c.hora}* às *${horaFimDe(null)}*`;
  const LL=localDe(p),onde=LL?LL.nome+(LL.end?' · '+LL.end:'')+(LL.url?'\n🗺️ '+LL.url:''):'';
  const head=`⚽ *${c.nome.toUpperCase()}*`;
  if(tipo==='convocacao')return[head,quando,onde?'📍 '+onde:'','',`São ${c.times*c.porTime} vagas na linha + goleiros. Mensalista tem prioridade.`,'Responda aqui: ✅ vou  |  ❌ não vou'].filter((x,i)=>x!==''||i===3).join('\n');
  if(!p&&tipo!=='pagamento'&&tipo!=='convite')return head+'\n\nAinda não tem pelada marcada. Marque a próxima no app.';
  if(tipo==='cobrar'){const l=lista(p);if(!l.pend.length)return head+'\n'+quando+'\n\nTodo mundo já respondeu. Valeu! 🙌';
    return[head,quando,'',`⏰ Ainda faltam ${l.pend.length} responder:`,...l.pend.map(id=>'• '+nm(id)),'','Confirma aí pra gente fechar a lista! ✅ ou ❌'].join('\n')}
  if(tipo==='lista'){const l=lista(p),out=[head,quando,onde?'📍 '+onde:'',''];
    out.push(`✅ *Confirmados* (${l.escalados.length}/${l.vagas})`);l.escalados.forEach((id,i)=>out.push(`${i+1}. ${nm(id)}${J(id).tipo==='diarista'?' (D)':''}`));
    if(l.gks.length){out.push('','🧤 *Goleiros*');l.gks.forEach(id=>out.push('• '+nm(id)))}
    if(l.espera.length){out.push('','⏳ *Lista de espera*');l.espera.forEach((id,i)=>out.push(`${i+1}. ${nm(id)}${l.aguardando.includes(id)?' (aguardando liberação)':''}`))}
    if(l.nao.length)out.push('','❌ Não vão: '+l.nao.map(nm).join(', '));
    if(l.pend.length)out.push('','❓ Sem resposta: '+l.pend.map(nm).join(', '));
    if(l.vagas>l.escalados.length)out.push('',`Ainda tem ${l.vagas-l.escalados.length} vaga(s)!`);
    return out.filter((x,i,a)=>!(x===''&&a[i-1]==='')).join('\n')}
  if(tipo==='times'){if(!p.times)return head+'\n'+quando+'\n\nOs times ainda não foram sorteados.';
    const out=[head,quando,'','*TIMES SORTEADOS*'];
    p.times.forEach(t=>{const co=CORES[t.cor];out.push('',`${co.e} *${nomeTime(t.cor).toUpperCase()}* · média ${ovr(teamMedia(t))}`);
      if(t.gk)out.push('🧤 '+nm(t.gk));t.ids.forEach(id=>out.push(`${posLinha(id)} ${nm(id)}`))});
    {const gx=(p.goleiros||[]).filter(id=>S.jog[id]);if(gx.length)out.push('','🧤 *GOLEIROS*',...gx.map(id=>nm(id)))}
    out.push('','Bom jogo! ⚽');return out.join('\n')}
  if(tipo==='resultado'){const pr=premiosDe(p),st=p.stats||{},out=[`🏁 *RESULTADO · ${dShort(p.data)}*`,''];
    if(p.times&&p.vit&&p.vit.some(v=>v>0)){p.times.forEach((t,i)=>out.push(`${CORES[t.cor].e} ${nomeTime(t.cor)}: ${p.vit[i]||0} vitória(s)`));out.push('')}
    if(pr.mvp)out.push('🏆 Craque da pelada: *'+nm(pr.mvp)+'*');
    if(pr.art)out.push(`⚽ Artilheiro: *${nm(pr.art)}* (${st[pr.art]?.g||0} gol${(st[pr.art]?.g||0)===1?'':'s'})`);
    if(pr.gar)out.push(`🅰️ Garçom: *${nm(pr.gar)}* (${st[pr.gar]?.a||0} assist.)`);
    if(pr.gol)out.push('🧤 Melhor goleiro: *'+nm(pr.gol)+'*');
    if(pr.per)out.push('🐢 Pereba da pelada: *'+nm(pr.per)+'*');
    {const pid0=pidOf(p),rn=p.aval?rankingNotas(p,pid0).filter(x=>x.n!=null):[];if(rn.length){out.push('','*Notas da galera*');rn.forEach((x,i)=>out.push(`${i+1}º ${nm(x.id)} · ${fmtN(x.n)}`))}}
    const gols=Object.entries(st).filter(([,s])=>s.g>0).sort((a,b)=>b[1].g-a[1].g);
    if(gols.length){out.push('','*Gols*');gols.forEach(([id,s])=>out.push(`• ${nm(id)} ${s.g}`))}
    out.push('','Valeu, rapaziada! Até a próxima 💪');return out.join('\n')}
  if(tipo==='pagamento'){const m=ctx.mes||mesAtual(),d=devedores(m),[y,mm]=m.split('-').map(Number);
    const out=[`💰 *PENDÊNCIAS · ${MESES[mm-1].toUpperCase()}/${y}*`,''];
    if(!d.mens.length&&!d.dia.length)return out.concat(['Tudo pago! Obrigado, galera 🙌']).join('\n');
    if(d.mens.length){out.push(`*Mensalidade* (${BRL(c.mensal)})`);d.mens.forEach(id=>out.push('• '+nm(id)))}
    if(d.dia.length){out.push('',`*Diárias* (${BRL(c.diaria)})`);d.dia.forEach(x=>out.push(`• ${nm(x.id)} · ${dShort(x.data)}`))}
    if(c.pix)out.push('','Pix: '+c.pix);return out.join('\n')}
  if(tipo==='convite'){const j=ctx.jid?J(ctx.jid):null;
    return[`Fala${j?', '+(j.apelido||j.nome.split(' ')[0]):''}! 👋`,`Você está convidado pra *${c.nome}*.`,(()=>{const pe2=atual();return pe2?`📅 Próxima: *${dLong(pe2[1].data)}* às *${pe2[1].hora||c.hora}*`:`📅 ${[0,6].includes(Number(c.dia))?'Todo':'Toda'} ${DIAS[c.dia].toLowerCase()} às ${c.hora}`})(),(()=>{const pe2=atual(),LL=localDe(pe2&&pe2[1]);return LL?'📍 '+LL.nome+(LL.end?' · '+LL.end:'')+(LL.url?'\n🗺️ '+LL.url:''):''})(),linkConvite()?'\nEntre na pelada pelo app: '+linkConvite():'',INSTALAR,'\nConfirma por aqui se topa!'].filter(Boolean).join('\n')}
  return'';
}

/* ---------- caixa ---------- */
function mesAtual(){const d=new Date();return d.getFullYear()+'-'+pad(d.getMonth()+1)}
function devedores(m){
  const cx=S.caixa[m]||{},mens=ativos().filter(id=>J(id).tipo==='mensalista'&&!(cx.mens||{})[id]);
  const dia=[];for(const[,p] of Object.entries(S.pel)){if(!p.data.startsWith(m)||p.status!=='encerrada')continue;
    for(const id of jogaram(p))if(J(id).tipo==='diarista'&&!(p.diarias||{})[id])dia.push({id,data:p.data})}
  return{mens,dia};
}

/* ---------- nível da pelada (estrelas) ---------- */
function nivelPelada(){const ids=ativos();if(ids.length<4)return null;
  const m=sum(ids.map(notaAtual))/ids.length;return Math.max(0,Math.min(5,Math.round(m)/2))}
function starsHTML(v){return`<span class="stars" aria-label="${String(v).replace('.',',')} de 5 estrelas">★★★★★<span style="width:${v/5*100}%">★★★★★</span></span>`}
function nivelVisivel(){return ADM()||!!cfg().nivelPublico}

/* ---------- notificações ---------- */
function prefs(){const p={};for(const k in NOTIF)p[k]=NOTIF[k].def;return Object.assign(p,cfg().notif||{})}
function feedItems(){
  const out=[...((S.feed||{}).items||[])];
  for(const[u,doc] of Object.entries(S.pres||{})){const j=doc.jogador;if(!j||!S.jog[j])continue;
    for(const[pid,r] of Object.entries(doc.pel||{})){const p=S.pel[pid];if(!p||!r.t)continue;const q=' · '+dShort(p.data);
      let tipo,texto;
      if(r.s==='sim'){const l=lista(p,pid);if(l.aguardando.includes(j)){tipo='pedido';texto=`${nm(j)} (${J(j).tipo}) pediu vaga pelo app. Toque em Liberar na lista`}else if(l.espera.includes(j)){tipo='espera';texto=`${nm(j)} confirmou pelo app e está na espera`}else{tipo='confirmou';texto=`${nm(j)} confirmou pelo app`}}
      else if(r.a==='sim'){tipo='desistiu';texto=`${nm(j)} desistiu pelo app`}
      else{tipo='naoVai';texto=`${nm(j)} respondeu pelo app que não vai`}
      out.push({id:u+pid,tipo,texto:texto+q,t:r.t})}}
  return out.sort((a,b)=>b.t-a.t);
}
/* notificações de cada jogador (calculadas a partir dos dados da pelada) */
function meuJogador(){const d=myId&&S.pres[myId];return d&&S.jog[d.jogador]?d.jogador:null}
function itensJogador(){
  const j=meuJogador(),out=[];
  for(const m of ((S.mural||{}).items||[]))out.push({id:'m'+m.id,tipo:'recado',titulo:m.titulo||'Recado do administrador',texto:m.txt,t:m.t,longo:true});
  if(!j)return out.sort((a,b)=>b.t-a.t);
  const c=cfg();
  for(const[pid,p] of Object.entries(S.pel)){const q=dShort(p.data)+' das '+horarioTxt(p),LL=localDe(p),onde=LL?' · '+LL.nome:'';
    if(p.avalEm&&jogaram(p).includes(j)){const rn=rankingNotas(p,pid).filter(x=>x.n!=null),i=rn.findIndex(x=>x.id===j);
      out.push({id:'notas'+pid,tipo:'resultado',titulo:'Saíram as notas',texto:`Pelada de ${dShort(p.data)}: ${i>=0?`sua nota foi ${fmtN(rn[i].n)} (${i+1}º de ${rn.length}).`:'veja a relação das notas.'}`,t:p.avalEm,act:'notas',arg:pid})}
    if(p.status==='encerrada'){
      const st=(p.stats||{})[j],nj=notaJogo(p,pid,j);if(p.encerradaEm&&jogaram(p).includes(j))out.push({id:'enc'+pid,tipo:'resultado',titulo:'Resultado da pelada',texto:`Pelada de ${dShort(p.data)} encerrada.${typeof nj==='number'?' Sua nota: '+fmtN(nj)+'.':''}${st?.g?' Gols: '+st.g+'.':''}`,t:p.encerradaEm});
      const pr=premiosDe(p,pid);const nomes={mvp:'craque da pelada',art:'artilheiro',gar:'garçom',gol:'melhor goleiro'};
      for(const k in nomes)if(pr[k]===j&&p.encerradaEm)out.push({id:'pr'+pid+k,tipo:'resultado',titulo:'Parabéns! 🏆',texto:`Você foi o ${nomes[k]} da pelada de ${dShort(p.data)}.`,t:p.encerradaEm+1});
      continue}
    const l=lista(p,pid),r=respDe(p,pid)[j];
    const t0=p.criadoEm||0;
    out.push({id:'nova'+pid,tipo:'convoca',titulo:'Pelada marcada',texto:`${q}${onde}. ${l.vagas>l.escalados.length?`Temos ${l.vagas-l.escalados.length} vaga(s) na linha. Confirme sua presença!`:'A lista está cheia, mas você pode entrar na espera.'}`,t:t0,act:'tab-jogo'});
    for(const[aid,a] of Object.entries(S.avisos)){if(a.ativo===false||!['convocacao','cobrar','lista'].includes(a.tipo))continue;
      const{last}=ocorrencias(a);if(last.getTime()<t0||last>new Date())continue;
      if(!r||!r.s||r.t<last.getTime())out.push({id:'lem'+pid+aid+iso(last),tipo:'convoca',titulo:'Lembrete',texto:`Você ainda não confirmou a pelada de ${q}. ${l.vagas>l.escalados.length?'Restam '+(l.vagas-l.escalados.length)+' vaga(s).':'Lista cheia, ainda dá para entrar na espera.'}`,t:last.getTime(),act:'tab-jogo'})}
    const ap=(p.aprov||{})[j];if(ap&&r&&r.s==='sim'&&l.escalados.concat(l.gks).includes(j))out.push({id:'lib'+pid+ap,tipo:'convoca',titulo:'Vaga liberada ✅',texto:`O administrador liberou sua vaga na pelada de ${q}.`,t:ap});
    if(p.times&&p.sorteadoEm){const ti=p.times.findIndex(tm=>tm.gk===j||tm.ids.includes(j));
      if(ti>=0)out.push({id:'times'+pid+p.sorteadoEm,tipo:'convoca',titulo:'Times sorteados',texto:`Você está no time ${nomeTime(p.times[ti].cor)} ${CORES[p.times[ti].cor].e} na pelada de ${q}.`,t:p.sorteadoEm})}}
  const pa=avalPendenteJogador();if(pa){const[pid,p]=pa;if(p.encerradaEm)out.push({id:'aval'+pid,tipo:'convoca',titulo:'Avalie o campo',texto:`Como estava o ${S.locais[p.localId].nome} na pelada de ${dShort(p.data)}? Avalie gramado, atendimento, ambiente, banheiros e tamanho.`,t:p.encerradaEm+2})}
  return out.filter(x=>x.t).sort((a,b)=>b.t-a.t);
}
function vistoLocal(){try{return Number(localStorage.getItem('pelada.visto.'+(myId||'x')))||0}catch(e){return 0}}
function marcarVisto(){try{localStorage.setItem('pelada.visto.'+(myId||'x'),String(Date.now()))}catch(e){}}
function itensVisiveis(){if(ADM()){const pr=prefs();return feedItems().filter(i=>pr[i.tipo]!==false)}return itensJogador()}
const PUSH_VISTOS=new Set();let PUSH_PRONTO=false;
function checarPush(){
  if(!ready)return;const its=itensVisiveis();
  if(!PUSH_PRONTO){its.forEach(i=>PUSH_VISTOS.add(i.id));PUSH_PRONTO=true;return}
  const novos=its.filter(i=>!PUSH_VISTOS.has(i.id));novos.forEach(i=>PUSH_VISTOS.add(i.id));
  const i=novos.find(x=>Date.now()-x.t<10*60e3);if(!i)return;
  const el=document.getElementById('push');el.innerHTML=`<span class="ic">⚽</span><span class="grow"><b>${esc(cfg().nome)} · ${esc(i.titulo||NOTIF[i.tipo]?.n||'Notificação')}</b><span>${esc(String(i.texto).slice(0,140))}</span></span>`;
  el.hidden=false;clearTimeout(checarPush.t);checarPush.t=setTimeout(()=>el.hidden=true,6000);
}
function naoLidas(){
  if(!ADM()){const v=vistoLocal();return itensJogador().filter(i=>i.t>v).length}
  const f=S.feed||{},visto=f.visto||0,pr=prefs();
  return feedItems().filter(i=>i.t>visto&&pr[i.tipo]!==false).length+(pr.aviso?avisosVencidos().length:0);
}
function notificar(evs){
  const pr=prefs();evs=evs.filter(e=>pr[e.tipo]);if(!evs.length)return;
  const now=Date.now(),f=S.feed||{items:[],visto:0};
  const novos=evs.map((e,i)=>({id:uid('e'),tipo:e.tipo,texto:e.texto,t:now+i}));
  put('eventos/feed',{...f,items:novos.reverse().concat(f.items||[]).slice(0,80)});
}
function eventosPresenca(p,before,after,j,cur,v){
  const quando=' · '+dShort(p.data),evs=[];
  if(v==='sim'&&cur!=='sim'){
    if(after.espera.includes(j))evs.push({tipo:'espera',texto:`${nm(j)} confirmou e foi para a espera (${after.espera.indexOf(j)+1}º)${quando}`});
    else evs.push({tipo:'confirmou',texto:`${nm(j)} confirmou presença (${after.escalados.length}/${after.vagas})${quando}`});
    if(after.escalados.length>=after.vagas&&before.escalados.length<before.vagas)evs.push({tipo:'cheia',texto:`Lista completa: ${after.vagas} na linha${quando}`});
  }
  if(cur==='sim'&&v!=='sim')evs.push({tipo:'desistiu',texto:`${nm(j)} desistiu${quando}`});
  if(cur!=='sim'&&v==='nao')evs.push({tipo:'naoVai',texto:`${nm(j)} não vai${quando}`});
  for(const id of after.escalados)if(!before.escalados.includes(id)&&id!==j)evs.push({tipo:'subiu',texto:`${nm(id)} saiu da espera e entrou na lista${quando}`});
  notificar(evs);
}
function quandoTxt(t){const d=new Date(t),hoje=new Date();const h=pad(d.getHours())+':'+pad(d.getMinutes());
  return iso(d)===iso(hoje)?'hoje '+h:DIAS3[d.getDay()]+' '+pad(d.getDate())+'/'+pad(d.getMonth()+1)+' '+h}
function sheetNotif(){
  document.getElementById('push').hidden=true;
  if(!ADM()){const v=vistoLocal(),its=itensJogador().slice(0,40);
    openSheet('Notificações',`<div class="stack"><div class="panel"><div class="list">${its.length?its.map(i=>`<div class="item" style="align-items:flex-start"><div class="grow"><div class="name">${i.t>v?'<span class="dot-new"></span>':''}${esc(i.titulo||'')}</div>${i.longo?`<div class="recado">${esc(i.texto)}</div>`:`<div>${esc(i.texto)}</div>`}<div class="sub">${quandoTxt(i.t)}</div></div></div>`).join(''):`<div class="empty">${meuJogador()?'Nada novo por aqui.':'Escolha seu nome na aba Jogo para receber as notificações da pelada.'}</div>`}</div></div>
      <p class="sub" style="margin:0">Por enquanto, as notificações aparecem quando o app está aberto.</p></div>`);
    marcarVisto();render();return}
  const f=S.feed||{},visto=f.visto||0,pr=prefs(),A=ADM();
  const due=pr.aviso?avisosVencidos():[];
  const items=feedItems().filter(i=>pr[i.tipo]!==false).slice(0,40);
  let h='<div class="stack"><div class="panel"><div class="list">';
  for(const v of due)h+=`<div class="item"><div class="grow"><div class="name"><span class="dot-new"></span>Hora de mandar: ${esc(AVISOS[v.a.tipo]?.n)}</div><div class="sub">${DIAS3[v.when.getDay()]} ${pad(v.when.getHours())}:${pad(v.when.getMinutes())}</div></div><button class="btn sm" data-act="msg" data-v="${v.a.tipo}" data-aviso="${v.id}" data-key="${v.key}">Gerar</button></div>`;
  for(const i of items)h+=`<div class="item"><div class="grow"><div class="name">${i.t>visto?'<span class="dot-new"></span>':''}${esc(i.texto)}</div><div class="sub">${esc(NOTIF[i.tipo]?.n||'')} · ${quandoTxt(i.t)}</div></div>${i.act==='agenda'?`<button class="btn sm primary" data-act="agenda" data-l="${i.arg}">Responder</button>`:''}</div>`;
  if(!due.length&&!items.length)h+='<div class="empty">Nada novo por aqui.</div>';
  h+='</div></div>';
  if(A){h+=`<div class="panel"><h3 style="margin-bottom:2px">O que chega para mim</h3><div class="sub" style="margin-bottom:6px">Escolha quais notificações aparecem no sino.</div>`;
    for(const[k,n] of Object.entries(NOTIF))h+=`<div class="sw-row"><div><div class="name">${n.n}</div><div class="sub">${esc(n.d)}</div></div><button class="toggle" role="switch" aria-checked="${!!pr[k]}" aria-label="${esc(n.n)}" data-act="pref" data-v="${k}"></button></div>`;
    h+='</div>'}
  openSheet('Notificações',h+'</div>');
  if(A&&feedItems().some(i=>i.t>visto))put('eventos/feed',{...f,items:f.items||[],visto:Date.now()});
}

/* ---------- artes para redes sociais ---------- */
const ART={bg1:'#0B3F20',bg2:'#17602F',chalk:'rgba(255,255,255,.13)',y:'#F2C12E',w:'#FFFFFF',w2:'rgba(255,255,255,.72)'};
const POSCOR={GOL:'#C99A10',ZAG:'#3F7BC6',MEI:'#8E5FC0',ATA:'#D2533B'};
const PREMIO={mvp:{t:'Craque da pelada',s:'CRAQUE'},art:{t:'Artilheiro',s:'ARTILHEIRO'},gar:{t:'Garçom',s:'GARÇOM'},gol:{t:'Melhor goleiro',s:'GOLEIRO'}};
async function fontsReady(){try{await Promise.all(['800 120px "Saira Condensed"','700 60px "Saira Condensed"','600 36px Figtree','500 30px Figtree'].map(f=>document.fonts.load(f)))}catch(e){}}
function fit(ctx,text,maxW,size,weight,fam){let s=size;do{ctx.font=`${weight} ${s}px ${fam}`;s-=4}while(ctx.measureText(text).width>maxW&&s>20);return s+4}
function campo(ctx,W,H){
  const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,ART.bg1);g.addColorStop(1,ART.bg2);ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  ctx.fillStyle='rgba(255,255,255,.035)';for(let y=0;y<H;y+=180)ctx.fillRect(0,y,W,90);
  ctx.strokeStyle=ART.chalk;ctx.lineWidth=6;
  ctx.strokeRect(40,40,W-80,H-80);
  ctx.beginPath();ctx.moveTo(40,H/2);ctx.lineTo(W-40,H/2);ctx.stroke();
  ctx.beginPath();ctx.arc(W/2,H/2,150,0,Math.PI*2);ctx.stroke();
  ctx.strokeRect(W/2-260,H-40-200,520,200);ctx.strokeRect(W/2-260,40,520,200);
  // brilho, linhas de velocidade e retícula
  const gl=ctx.createRadialGradient(W*.8,H*.18,10,W*.8,H*.18,W*.7);gl.addColorStop(0,'rgba(242,193,46,.22)');gl.addColorStop(1,'rgba(242,193,46,0)');ctx.fillStyle=gl;ctx.fillRect(0,0,W,H);
  ctx.save();ctx.translate(W,0);ctx.rotate(Math.PI/5);
  for(let i=0;i<26;i++){const y=-200+i*70+((i*37)%23),len=200+((i*97)%380),x=-((i*53)%300)-100;
    ctx.fillStyle=i%5===0?'rgba(242,193,46,.35)':'rgba(255,255,255,.08)';ctx.fillRect(x-len,y,len,i%5===0?6:3)}
  ctx.restore();
  ctx.fillStyle='rgba(255,255,255,.10)';for(let y=0;y<9;y++)for(let x=0;x<9;x++){ctx.beginPath();ctx.arc(70+x*26,H-300+y*26,Math.max(.5,5-(x+y)*.45),0,Math.PI*2);ctx.fill()}
  ctx.fillStyle=ART.y;ctx.beginPath();ctx.moveTo(W-40,40);ctx.lineTo(W-40,150);ctx.lineTo(W-150,40);ctx.closePath();ctx.fill();
  ctx.fillStyle='#F0662A';ctx.beginPath();ctx.moveTo(40,H-40);ctx.lineTo(40,H-130);ctx.lineTo(130,H-40);ctx.closePath();ctx.fill();
}
function premioStat(p,k){const id=premiosDe(p)[k],s=(p.stats||{})[id]||{};
  if(k==='art')return(s.g||0)+(s.g===1?' GOL':' GOLS');
  if(k==='gar')return(s.a||0)+(s.a===1?' ASSISTÊNCIA':' ASSISTÊNCIAS');
  const n=notaJogo(p,pidOf(p),id);return typeof n==='number'?'NOTA '+fmtN(n):'';
}
function cabecalho(ctx,W,p){
  const c=cfg();ctx.textBaseline='alphabetic';
  ctx.fillStyle=ART.w2;ctx.font='600 34px Figtree, sans-serif';ctx.textAlign='left';ctx.fillText(c.nome.toUpperCase(),90,130);
  ctx.textAlign='right';ctx.fillText(dShort(p.data),W-90,130);ctx.textAlign='left';
}
function arteGeral(p){
  const W=1080,H=1350,cv=document.createElement('canvas');cv.width=W;cv.height=H;const ctx=cv.getContext('2d');
  campo(ctx,W,H);cabecalho(ctx,W,p);
  ctx.fillStyle=ART.y;ctx.font='800 150px "Saira Condensed", Impact, sans-serif';ctx.fillText('DESTAQUES',86,290);
  ctx.fillStyle=ART.w;ctx.font='700 58px "Saira Condensed", Impact, sans-serif';ctx.fillText('DA PELADA',92,355);
  const PR=premiosDe(p),ks=['mvp','art','gar','gol'].filter(k=>PR[k]);
  const top=430,rowH=Math.min(210,(H-top-110)/Math.max(1,ks.length));
  ks.forEach((k,i)=>{const y=top+i*rowH,id=PR[k],j=J(id);
    ctx.fillStyle='rgba(0,0,0,.28)';ctx.beginPath();ctx.roundRect(80,y,W-160,rowH-24,22);ctx.fill();
    const cx=80+28+62,cy=y+(rowH-24)/2,im=imgDe(id);ctx.fillStyle=POSCOR[j.pos]||'#555';ctx.beginPath();ctx.arc(cx,cy,62,0,Math.PI*2);ctx.fill();
    if(im)circFoto(ctx,im,cx,cy,62);
    ctx.strokeStyle=ART.w;ctx.lineWidth=5;ctx.beginPath();ctx.arc(cx,cy,62,0,Math.PI*2);ctx.stroke();
    if(!im){ctx.fillStyle=ART.w;ctx.textAlign='center';ctx.font='800 54px "Saira Condensed", Impact, sans-serif';ctx.fillText(initials(nm(id)),cx,cy+19);ctx.textAlign='left'}
    const tx=cx+92;ctx.fillStyle=ART.y;ctx.font='700 34px "Saira Condensed", Impact, sans-serif';ctx.fillText(PREMIO[k].t.toUpperCase(),tx,cy-28);
    const stat=premioStat(p,k);ctx.font='800 46px "Saira Condensed", Impact, sans-serif';const sw=stat?ctx.measureText(stat).width:0;
    ctx.fillStyle=ART.w;fit(ctx,nm(id).toUpperCase(),W-160-28-(tx-80)-sw-50,78,800,'"Saira Condensed", Impact, sans-serif');ctx.fillText(nm(id).toUpperCase(),tx,cy+42);
    if(stat){ctx.fillStyle=ART.y;ctx.font='800 46px "Saira Condensed", Impact, sans-serif';ctx.textAlign='right';ctx.fillText(stat,W-80-28,cy+40);ctx.textAlign='left'}
  });
  return cv;
}
function arteIndividual(p,k){
  const W=1080,H=1350,cv=document.createElement('canvas');cv.width=W;cv.height=H;const ctx=cv.getContext('2d');
  const id=premiosDe(p)[k],j=J(id),FAM='"Saira Condensed", Impact, sans-serif';
  campo(ctx,W,H);cabecalho(ctx,W,p);
  ctx.textAlign='center';ctx.fillStyle=ART.y;fit(ctx,PREMIO[k].t.toUpperCase(),W-180,130,800,FAM);ctx.fillText(PREMIO[k].t.toUpperCase(),W/2,300);
  const cy=600,im=imgDe(id);ctx.fillStyle=POSCOR[j.pos]||'#555';ctx.beginPath();ctx.arc(W/2,cy,200,0,Math.PI*2);ctx.fill();
  if(im)circFoto(ctx,im,W/2,cy,200);
  ctx.strokeStyle=ART.y;ctx.lineWidth=12;ctx.beginPath();ctx.arc(W/2,cy,200,0,Math.PI*2);ctx.stroke();
  if(!im){ctx.fillStyle=ART.w;ctx.font=`800 190px ${FAM}`;ctx.fillText(initials(nm(id)),W/2,cy+66)}
  ctx.fillStyle=ART.w;fit(ctx,nm(id).toUpperCase(),W-160,170,800,FAM);ctx.fillText(nm(id).toUpperCase(),W/2,965);
  ctx.fillStyle=ART.w2;ctx.font='600 36px Figtree, sans-serif';ctx.fillText(POS[j.pos].toUpperCase(),W/2,1025);
  const stat=premioStat(p,k);
  if(stat){ctx.font=`800 84px ${FAM}`;const sw=ctx.measureText(stat).width+90;
    ctx.fillStyle=ART.y;ctx.beginPath();ctx.roundRect(W/2-sw/2,1080,sw,120,18);ctx.fill();
    ctx.fillStyle='#1E1700';ctx.fillText(stat,W/2,1168)}
  ctx.textAlign='left';return cv;
}
async function sheetArtes(pid){
  const p=S.pel[pid],PR=premiosDe(p,pid),ks=['mvp','art','gar','gol'].filter(k=>PR[k]);
  if(!ks.length){toast('Escolha os prêmios antes de gerar as artes.');return}
  openSheet('Artes da pelada','<div class="empty">Desenhando as artes…</div>');
  await fontsReady();await Promise.all(ks.map(k=>carregarImg(fotoDe(PR[k]))));
  ARTS.forEach(a=>URL.revokeObjectURL(a.url));ARTS=[];
  const mk=async(cv,nome,label)=>{const blob=await new Promise(r=>cv.toBlob(r,'image/png'));ARTS.push({blob,url:URL.createObjectURL(blob),nome,label})};
  await mk(arteGeral(p),`destaques-${p.data}.png`,'Destaques');
  for(const k of ks)await mk(arteIndividual(p,k),`${k==='mvp'?'craque':k==='art'?'artilheiro':k==='gar'?'garcom':'goleiro'}-${p.data}.png`,PREMIO[k].t+' · '+nm(PR[k]));
  const body=document.getElementById('sheet-body');if(!body)return;
  const btn=i=>dl?`<button class="btn sm ${i===0?'primary':''}" data-act="salvar-arte" data-i="${i}">Salvar imagem</button>`:'';
  body.innerHTML=`<div class="stack"><div class="art-main"><img src="${ARTS[0].url}" alt="Arte com os destaques da pelada">${btn(0)}</div>
    <h3>Individuais</h3><div class="arts">${ARTS.slice(1).map((a,i)=>`<figure><img src="${a.url}" alt="${esc(a.label)}"><figcaption>${esc(a.label)}</figcaption>${btn(i+1)}</figure>`).join('')}</div>
    <p class="sub" style="margin:0">${dl?'No celular, "Salvar imagem" abre o compartilhamento: dá para mandar direto para o Instagram ou WhatsApp.':'Toque e segure a imagem para salvar.'} Formato 1080×1350, o tamanho do feed do Instagram.</p></div>`;
}

/* ---------- carta do jogador ---------- */
const TIERS=[{min:8,n:'OURO',a:'#7A5A0C',b:'#F3D27A',c:'#FFF4CF',ink:'#2B1E00'},{min:6,n:'PRATA',a:'#5E6873',b:'#C9D1D8',c:'#F2F5F7',ink:'#1C232A'},{min:0,n:'BRONZE',a:'#5C3418',b:'#C98A55',c:'#F1D2B4',ink:'#2A1607'}];
function tierDe(n){return TIERS.find(t=>n>=t.min)}
function arteCarta(id){
  const W=1080,H=1350,cv=document.createElement('canvas');cv.width=W;cv.height=H;const ctx=cv.getContext('2d');
  const j=J(id),n=notaAtual(id),t=tierDe(n),FAM='"Saira Condensed", Impact, sans-serif';
  // fundo
  const bg=ctx.createLinearGradient(0,0,W,H);bg.addColorStop(0,'#0B1A12');bg.addColorStop(1,'#13301F');ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
  ctx.strokeStyle='rgba(255,255,255,.05)';ctx.lineWidth=4;for(let x=-H;x<W;x+=60){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x+H,H);ctx.stroke()}
  const glw=ctx.createRadialGradient(W/2,H*.4,20,W/2,H*.4,W*.75);glw.addColorStop(0,t.b+'66');glw.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=glw;ctx.fillRect(0,0,W,H);
  for(let i=0;i<14;i++){const y=120+i*85,len=120+((i*71)%220);ctx.fillStyle=i%4===0?t.b+'99':'rgba(255,255,255,.07)';ctx.fillRect(i%2?W-60-len:60,y,len,i%4===0?6:3)}
  // contorno da carta: escudo com cantos chanfrados
  const cx=140,cy=95,cw=800,ch=1160,cut=70;
  const shape=()=>{ctx.beginPath();ctx.moveTo(cx+cut,cy);ctx.lineTo(cx+cw-cut,cy);ctx.lineTo(cx+cw,cy+cut);ctx.lineTo(cx+cw,cy+ch-210);ctx.lineTo(cx+cw/2,cy+ch);ctx.lineTo(cx,cy+ch-210);ctx.lineTo(cx,cy+cut);ctx.closePath()};
  ctx.save();ctx.shadowColor='rgba(0,0,0,.55)';ctx.shadowBlur=60;ctx.shadowOffsetY=20;shape();
  const g=ctx.createLinearGradient(cx,cy,cx+cw,cy+ch);g.addColorStop(0,t.c);g.addColorStop(.45,t.b);g.addColorStop(1,t.a);ctx.fillStyle=g;ctx.fill();ctx.restore();
  ctx.save();shape();ctx.clip();
  ctx.fillStyle='rgba(255,255,255,.18)';ctx.beginPath();ctx.moveTo(cx,cy+380);ctx.lineTo(cx+cw,cy+120);ctx.lineTo(cx+cw,cy+200);ctx.lineTo(cx,cy+460);ctx.fill();
  // listras finas e hexágonos de fundo
  ctx.strokeStyle='rgba(255,255,255,.16)';ctx.lineWidth=2;for(let x=cx-ch;x<cx+cw;x+=18){ctx.beginPath();ctx.moveTo(x,cy+ch);ctx.lineTo(x+ch*.6,cy);ctx.stroke()}
  ctx.strokeStyle=t.a+'33';ctx.lineWidth=3;const hx=(x,y,r)=>{ctx.beginPath();for(let k=0;k<6;k++){const a=Math.PI/3*k+Math.PI/6;ctx.lineTo(x+r*Math.cos(a),y+r*Math.sin(a))}ctx.closePath();ctx.stroke()};
  for(let row=0;row<5;row++)for(let col=0;col<4;col++)hx(cx+cw-60-col*70-(row%2)*35,cy+60+row*60,32);
  // faixa diagonal com a cor da posição
  ctx.fillStyle=(POSCOR[j.pos]||'#555')+'cc';ctx.beginPath();ctx.moveTo(cx,cy+ch-330);ctx.lineTo(cx+cw,cy+ch-470);ctx.lineTo(cx+cw,cy+ch-450);ctx.lineTo(cx,cy+ch-310);ctx.fill();
  ctx.restore();
  // chevrons nos cantos de cima
  ctx.fillStyle=t.a;[[cx+cut+20,cy+24,1],[cx+cw-cut-20,cy+24,-1]].forEach(([x,y,d])=>{for(let k=0;k<3;k++){ctx.beginPath();ctx.moveTo(x+d*k*22,y);ctx.lineTo(x+d*(k*22+14),y);ctx.lineTo(x+d*(k*22+6),y+14);ctx.lineTo(x+d*(k*22-8),y+14);ctx.fill()}});
  ctx.lineWidth=10;ctx.strokeStyle=t.a;shape();ctx.stroke();
  ctx.lineWidth=3;ctx.strokeStyle='rgba(255,255,255,.6)';ctx.save();ctx.translate(W/2,cy+ch/2);ctx.scale(.965,.97);ctx.translate(-W/2,-(cy+ch/2));shape();ctx.stroke();ctx.restore();
  // nota e posição
  ctx.fillStyle=t.ink;ctx.textAlign='center';
  ctx.font=`800 170px ${FAM}`;ctx.fillText(String(ovr(n)),cx+175,cy+230);
  ctx.font=`700 70px ${FAM}`;ctx.fillText(j.pos,cx+175,cy+310);
  ctx.fillRect(cx+110,cy+340,130,5);
  ctx.font='600 30px Figtree, sans-serif';ctx.fillText(t.n,cx+175,cy+395);
  // avatar com iniciais
  const ax=cx+cw-280,ay=cy+290,ar=190;
  const imc=imgDe(id);ctx.fillStyle=POSCOR[j.pos]||'#555';ctx.beginPath();ctx.arc(ax,ay,ar,0,Math.PI*2);ctx.fill();
  if(imc)circFoto(ctx,imc,ax,ay,ar);
  ctx.lineWidth=10;ctx.strokeStyle=t.c;ctx.beginPath();ctx.arc(ax,ay,ar,0,Math.PI*2);ctx.stroke();
  if(!imc){ctx.fillStyle='#fff';ctx.font=`800 170px ${FAM}`;ctx.fillText(initials(nm(id)),ax,ay+60)}
  // nome
  // faixa do nome
  ctx.save();ctx.translate(W/2,cy+600);ctx.transform(1,0,-.18,1,0,0);
  ctx.fillStyle=t.ink;ctx.fillRect(-(cw-90)/2,-78,cw-90,112);ctx.fillStyle=t.b;ctx.fillRect(-(cw-90)/2,30,cw-90,8);ctx.restore();
  ctx.fillStyle=t.c;fit(ctx,nm(id).toUpperCase(),cw-170,108,800,FAM);ctx.fillText(nm(id).toUpperCase(),W/2,cy+630);
  // atributos (critérios de 1 a 5 viram 2 a 10)
  const cr=critKey(j.pos).map(([k,lb])=>[lb.slice(0,3).toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace('POS','POS'),Math.round(Number((j.critGalera||{})[k]??j.crit?.[k]??3)*20)]);
  const{st}=temporada(UI.ano);const s=st[id]||{};
  cr.push([j.pos==='GOL'?'JOG':'GOL',j.pos==='GOL'?(s.j||0):(s.g||0)]);
  cr.forEach(([lb,v],i)=>{const col=i<3?0:1,row=i%3,x=col?W/2+60:cx+130,y=cy+770+row*95;
    ctx.fillStyle=t.ink;ctx.textAlign='left';ctx.font=`800 78px ${FAM}`;ctx.fillText(String(v),x,y);
    ctx.font=`700 54px ${FAM}`;ctx.fillText(lb,x+(v>=100?150:v>=10?105:65),y);
    const bw=230,fr=Math.max(0,Math.min(1,v/10));ctx.fillStyle='rgba(0,0,0,.15)';ctx.fillRect(x,y+12,bw,8);ctx.fillStyle=t.a;ctx.fillRect(x,y+12,bw*fr,8)});
  ctx.fillRect(W/2-2,cy+700,4,270);
  // rodapé
  ctx.textAlign='center';ctx.font='600 30px Figtree, sans-serif';ctx.fillText(cfg().nome.toUpperCase(),W/2,cy+ch-120);
  ctx.font='500 24px Figtree, sans-serif';ctx.fillText(j.tipo==='diarista'?'DIARISTA':'MENSALISTA',W/2,cy+ch-82);
  const nv=nivelPelada();
  if(nv!=null&&cfg().nivelPublico){const r0=18,gap=44,x0=W/2-gap*2,y0=cy+ch-168;
    const star=(x,y)=>{ctx.beginPath();for(let k=0;k<10;k++){const rr=k%2?r0*.45:r0,a=-Math.PI/2+k*Math.PI/5;ctx.lineTo(x+rr*Math.cos(a),y+rr*Math.sin(a))}ctx.closePath()};
    for(let i=0;i<5;i++){const x=x0+i*gap;ctx.fillStyle='rgba(0,0,0,.18)';star(x,y0);ctx.fill();
      const f=Math.max(0,Math.min(1,nv-i));if(f>0){ctx.save();ctx.beginPath();ctx.rect(x-r0,y0-r0,2*r0*f,2*r0);ctx.clip();ctx.fillStyle=t.ink;star(x,y0);ctx.fill();ctx.restore()}}}
  ctx.textAlign='left';return cv;
}
async function sheetCarta(id){
  openSheet('Carta de '+nm(id),'<div class="empty">Desenhando a carta…</div>');
  await fontsReady();await carregarImg(fotoDe(id));ARTS.forEach(a=>URL.revokeObjectURL(a.url));ARTS=[];
  const blob=await new Promise(r=>arteCarta(id).toBlob(r,'image/png'));
  ARTS.push({blob,url:URL.createObjectURL(blob),nome:`carta-${(nm(id)||'jogador').toLowerCase().normalize('NFD').replace(/[^a-z0-9]+/g,'-')}.png`});
  const body=document.getElementById('sheet-body');if(!body)return;
  body.innerHTML=`<div class="stack"><div class="art-main"><img src="${ARTS[0].url}" alt="Carta de jogador de ${esc(nm(id))}"></div>
    ${dl?'<button class="btn primary block" data-act="salvar-arte" data-i="0">Salvar imagem</button>':''}
    <p class="sub" style="margin:0">A cor muda com a avaliação: bronze até 59, prata de 60 a 79 e ouro a partir de 80. Os atributos vêm da avaliação completa da galera (ou da inicial, se ainda não teve) e a avaliação se atualiza a cada pelada.${dl?'':' Toque e segure a imagem para salvar.'}</p></div>`;
}

/* ---------- fotos dos jogadores ---------- */
const FOTO_CACHE={};
function fotoDe(id){const j=S.jog[id];if(j&&j.foto)return j.foto;const u=Object.keys(S.pres||{}).find(k=>S.pres[k].jogador===id);const m=u&&S.membros&&S.membros[u];return(m&&m.foto)||null}
function fotoStyle(f){return f?`background-image:url('${f}');background-size:cover;background-position:center;`:''}
function avHTML(id){const j=J(id),f=fotoDe(id);return`<div class="av bg-${j.pos}" style="${fotoStyle(f)}" ${f?`role="img" aria-label="${esc(nm(id))}"`:''}>${f?'':esc(initials(nm(id)))}</div>`}
window.redimFoto=function(file,lado=384){return new Promise((res,rej)=>{const url=URL.createObjectURL(file),im=new Image();
  im.onload=()=>{const w=im.naturalWidth,h=im.naturalHeight,q0=Math.min(w,h),sx=(w-q0)/2,sy=(h-q0)/2,c=document.createElement('canvas');c.width=c.height=lado;const x=c.getContext('2d');
    x.fillStyle='#fff';x.fillRect(0,0,lado,lado);x.drawImage(im,sx,sy,q0,q0,0,0,lado,lado);URL.revokeObjectURL(url);
    let q=.8,d=c.toDataURL('image/jpeg',q);while(d.length>60000&&q>.35){q-=.1;d=c.toDataURL('image/jpeg',q)}res(d)};
  im.onerror=()=>{URL.revokeObjectURL(url);rej(new Error('foto'))};im.src=url})};
function carregarImg(src){return new Promise(r=>{if(!src)return r(null);if(FOTO_CACHE[src])return r(FOTO_CACHE[src]);const im=new Image();im.onload=()=>{FOTO_CACHE[src]=im;r(im)};im.onerror=()=>r(null);im.src=src})}
function imgDe(id){const f=fotoDe(id);return f?FOTO_CACHE[f]||null:null}
function circFoto(ctx,img,cx,cy,r){ctx.save();ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.clip();ctx.drawImage(img,cx-r,cy-r,r*2,r*2);ctx.restore()}

/* ---------- grupo, convite e membros (versão independente) ---------- */
let GRUPO=null,GID=null;
const INSTALAR='\n📲 *Para ter o app no celular:*\niPhone: abra o link no Safari → Compartilhar → Adicionar à Tela de Início\nAndroid: abra no Chrome → menu ⋮ → Instalar app';
function linkConvite(){return GRUPO&&GRUPO.codigo?location.origin+location.pathname+'?c='+GRUPO.codigo:''}
function membrosSemCadastro(){const vinc=new Set(Object.keys(S.pres||{}).filter(u=>S.pres[u].jogador&&S.jog[S.pres[u].jogador]));
  return Object.entries(S.membros||{}).filter(([u])=>!vinc.has(u)).sort((a,b)=>(b[1].t||0)-(a[1].t||0))}
function euPendente(){if(demo||!myId||!(S.membros||{})[myId])return false;const d=S.pres[myId];return!(d&&d.jogador&&S.jog[d.jogador])}
function painelPendentes(){const adms=(GRUPO&&GRUPO.admins)||[];const ms=membrosSemCadastro().filter(([u])=>!adms.includes(u));if(!ms.length)return'';
  return`<div class="panel" style="margin-bottom:12px;border-color:var(--card)"><div class="panel-h"><h3>Pendentes</h3><span class="cnt" style="font-size:12px;font-weight:700;background:var(--card);color:var(--card-ink);border-radius:10px;padding:2px 8px">${ms.length}</span></div>
    <div class="sub" style="margin-bottom:6px">Entraram pelo convite e estão esperando a autorização do administrador.</div><div class="list">
    ${ms.map(([u,m])=>`<div class="item"><div class="av bg-${m.pos||'MEI'}" style="${fotoStyle(m.foto)}">${m.foto?'':esc(initials(m.apelido||m.nome))}</div><div class="grow"><div class="name">${esc(m.apelido||m.nome||'Sem nome')}${u===myId?' (você)':''}</div><div class="sub">${esc([POS[m.pos]||'',m.prefere?'quer ser '+m.prefere:''].filter(Boolean).join(' · '))}</div></div><span class="chip" style="background:var(--card);color:var(--card-ink);white-space:nowrap">⏳ Pendente</span></div>`).join('')}</div></div>`}
function painelMembros(){const ms=membrosSemCadastro();
  return`<div class="panel" style="margin-bottom:12px;border-color:var(--card)"><div class="panel-h"><h3>Pendentes</h3><span class="cnt" style="font-size:12px;font-weight:700;background:var(--card);color:var(--card-ink);border-radius:10px;padding:2px 8px">${ms.length}</span></div>
    <div class="sub" style="margin-bottom:6px">Estão esperando sua autorização. Toque em Autorizar para colocar no elenco com a nota inicial, ou em Já está se a pessoa já foi cadastrada.</div><div class="list">
    ${ms.map(([u,m])=>`<div class="item"><div class="av bg-${m.pos||'MEI'}" style="${fotoStyle(m.foto)}">${m.foto?'':esc(initials(m.apelido||m.nome))}</div><div class="grow"><div class="name">${esc(m.apelido||m.nome||'Sem nome')}${u===myId?' (você)':''}</div><div class="sub">${esc([POS[m.pos]||'',m.prefere?'quer ser '+m.prefere:'',m.tel||''].filter(Boolean).join(' · '))}</div></div>
      <div class="row" style="gap:4px;flex-wrap:nowrap"><button class="btn sm primary" data-act="membro-cad" data-u="${u}">${(GRUPO&&(GRUPO.admins||[]).includes(u))?'Entrar no elenco':'Autorizar'}</button><button class="btn sm" data-act="membro-vinc" data-u="${u}" aria-label="Já está no elenco">Já está</button></div></div>`).join('')}</div></div>`}
function renderAdmins(){const el=document.getElementById('adm-list');if(!el||!GRUPO)return;const adms=GRUPO.admins||[];
  const nome=u=>{const m=(S.membros||{})[u];const j=S.pres[u]&&S.jog[S.pres[u].jogador];return(j&&(j.apelido||j.nome))||(m&&(m.apelido||m.nome))||'Sem nome'};
  const outros=Object.keys(S.membros||{}).filter(u=>!adms.includes(u));
  el.innerHTML=`<div class="list">${adms.map(u=>`<div class="item"><div class="grow name">${esc(nome(u))}${u===myId?' (você)':''}${u===GRUPO.dono?' · criador':''}</div>${u!==GRUPO.dono&&u!==myId?`<button class="btn sm" data-act="adm-rem" data-u="${u}">Remover</button>`:''}</div>`).join('')}</div>
    ${outros.length?`<div class="row" style="margin-top:8px;flex-wrap:nowrap"><select id="adm-novo" class="grow"><option value="">Tornar administrador…</option>${outros.map(u=>`<option value="${u}">${esc(nome(u))}</option>`).join('')}</select><button class="btn sm primary" data-act="adm-add">Adicionar</button></div>`:'<div class="sub" style="margin-top:6px">Quem entrar pelo convite pode virar administrador aqui.</div>'}`}

/* ---------- render ---------- */
function render(){
  NOTA_CACHE=null;consolidarAvaliacoes();consolidarRodadas();
  const app=document.getElementById('app');
  const ae=document.activeElement,aid=ae&&ae.id,sel=aid&&ae.selectionStart!=null?[ae.selectionStart,ae.selectionEnd]:null;
  renderNav();setTimeout(checarPush,0);
  app.innerHTML=renderTop()+(ready?renderTab():'<div class="empty">Carregando a pelada…</div>');
  if(aid&&!document.getElementById('sheet').contains(ae)){const el=document.getElementById(aid);if(el&&el!==ae){el.focus();if(sel)try{el.setSelectionRange(sel[0],sel[1])}catch(e){}}}
}
function renderTop(){
  const c=cfg();
  const nv=ready?nivelPelada():null;
  const nvTxt=nv!=null&&nivelVisivel()?` · <span class="nivel">${starsHTML(nv)} ${String(nv).replace('.',',')}${ADM()&&!c.nivelPublico?' (só você vê)':''}</span>`:'';
  let h=`<div class="top"><button class="iconbtn" data-act="voltar-grupos" aria-label="Minhas peladas" style="flex:none">‹</button><div class="brand grow">${esc(c.nome)}<small>${ADM()?'Administrador':'Jogador'}${nvTxt}</small></div>`;
  {const n=ready?naoLidas():0;
    h+=`<div class="row" style="flex-wrap:nowrap">${!demo&&GRUPO&&GRUPO.codigo?`<button class="iconbtn" data-act="qr-pelada" aria-label="Convidar para a pelada">${ICON.convidar}</button>`:''}<button class="iconbtn bell" data-act="notif" aria-label="Notificações${n?', '+n+' novas':''}">${ICON.bell}${n?`<span class="badge num">${n>9?'9+':n}</span>`:''}</button>${ADM()?`<button class="iconbtn" data-act="cfg" aria-label="Ajustes da pelada">${ICON.cfg}</button>`:''}</div>`}
  h+='</div>';
  if(demo)h+=`<div class="banner demo"><span><b>Demonstração.</b> ${UI.comoJogador?'Você está vendo o app como um jogador vê.':'Dados de exemplo. Nada aqui é salvo.'}</span><div class="row" style="gap:6px"><button class="btn sm" data-act="como-jogador">${UI.comoJogador?'Ver como administrador':'Ver como jogador'}</button></div></div>`;
  return h;
}
function renderNav(){
  const tabs=[['jogo','Jogo'],['elenco','Elenco'],['avisos','Avisos'],['ranking','Ranking'],['caixa','Caixa']].filter(([k])=>ADM()||!['avisos','caixa'].includes(k));
  if(!tabs.some(([k])=>k===UI.tab))UI.tab='jogo';
  document.getElementById('nav').innerHTML='<div class="in">'+tabs.map(([k,n])=>`<button data-act="tab" data-v="${k}" ${UI.tab===k?'aria-current="page"':''}>${ICON[k]}${n}</button>`).join('')+'</div>';
}
function renderTab(){
  const A=ADM();
  if(!Object.keys(S.jog).length&&!demo&&UI.tab==='jogo'){
    return A?`<div class="stack"><div class="board"><div class="when">Bora montar<br>a pelada</div><div class="where">Três passos e o app já sorteia times equilibrados.</div></div>
      <div class="panel stack"><div class="row between"><div><b>1. Ajustes</b><div class="sub">Dia, horário, local, vagas e valores</div></div><button class="btn primary sm" data-act="cfg">Configurar</button></div>
      <div class="row between"><div><b>2. Elenco</b><div class="sub">Cadastre cada jogador com posição e nota</div></div><button class="btn sm" data-act="add-jog">Adicionar</button></div>
      <div class="row between"><div><b>3. Convide a galera</b><div class="sub">Mande o link no grupo do WhatsApp</div></div><button class="btn sm" data-act="msg" data-v="convite">Convidar</button></div>
      <div class="row between"><div><b>4. Avisos</b><div class="sub">Programe os horários das mensagens</div></div><button class="btn sm" data-act="tab" data-v="avisos">Programar</button></div></div>
      ${membrosSemCadastro().length?painelMembros():''}</div>`
    :`<div class="board"><div class="when">Bem-vindo!</div><div class="where">Você entrou na ${esc(cfg().nome)}.</div></div>${euPendente()?bannerPendente():''}`;
  }
  return({jogo:tJogo,elenco:tElenco,avisos:tAvisos,ranking:tRanking,caixa:tCaixa}[UI.tab]||tJogo)(A);
}

// guarda data e horários da próxima pelada; o término acompanha o início até ser mudado à mão
function guardarNp(t){UI[t.dataset.np]=t.value;
  if(t.dataset.np==='npFim')UI.npFimManual=true;
  if(t.dataset.np==='npHora'&&!UI.npFimManual&&t.value){const f=document.getElementById('np-fim');UI.npFim=maisHora(t.value,60);if(f)f.value=UI.npFim}}
function bannerPendente(){return`<div class="banner due" style="margin-top:12px"><span><b>⏳ Sua entrada está esperando a autorização do administrador.</b><br>Assim que ele autorizar, seu nome entra no elenco e você já pode confirmar presença.</span></div>`}
/* --- Jogo --- */
function tJogo(A){
  const c=cfg();let h='';
  if(!A&&euPendente())h+=bannerPendente().replace('margin-top:12px','margin:0 0 12px');
  if(!A){const pend=avalPendenteJogador();if(pend){const[pid,p]=pend,L=S.locais[p.localId],d=S.pres[myId]||{};
    h+=`<div class="panel" style="margin-bottom:12px;border-color:var(--card)"><div class="panel-h"><h3>Como estava o campo?</h3></div>
      <div class="sub" style="margin-bottom:4px">${esc(L.nome)} · pelada de ${dShort(p.data)}</div>${formAvalCampo(pid,(d.avalCampo||{})[pid],'me')}
      <div class="sub" style="margin-top:4px">Sua avaliação ajuda a galera a escolher onde jogar.</div></div>`}}
  h+=cartaoAvCompleta();
  h+=painelPosJogo();
  if(A)h+=painelAprovar();
  if(A)for(const v of avisosVencidos())h+=`<div class="banner due"><span><b>Hora de mandar: ${esc(AVISOS[v.a.tipo]?.n||'')}</b><br>Programado para ${DIAS3[v.when.getDay()]} ${pad(v.when.getHours())}:${pad(v.when.getMinutes())}</span><button class="btn sm" data-act="msg" data-v="${v.a.tipo}" data-aviso="${v.id}" data-key="${v.key}">Gerar mensagem</button></div>`;
  const cur=atual();
  if(!cur){
    h+=`<div class="board"><div class="when">Sem pelada<br>marcada</div><div class="where">${esc(DIAS[c.dia])} das ${esc(horarioTxt(null))}${c.local?' · '+esc(c.local):''}</div></div>`;
    if(A){
      if(UI.npLoc===undefined)UI.npLoc=(c.localId&&S.locais[c.localId])?c.localId:null;
      const L=UI.npLoc&&S.locais[UI.npLoc];
      h+=`<div class="panel stack" style="margin-top:12px"><h3>Marcar a próxima</h3>
      <div class="field"><span><i class="stepn">1</i>Onde vai ser?</span>
      ${L?`<div class="loccard"><div class="pin">📍</div><div class="grow"><div class="name">${esc(L.nome)}</div><div class="sub">${esc([L.end,L.tel].filter(Boolean).join(' · ')||'Sem endereço')}</div></div></div><div class="lado" style="margin-top:6px"><button class="btn sm" data-act="lp-abrir" data-v="np">Trocar local</button><button class="btn sm" data-act="edit-local" data-l="${UI.npLoc}">Editar informações</button></div>${L.end?blocoMapa(L.nome,L.end):''}`
        :`<button class="btn primary block" data-act="lp-abrir" data-v="np">Escolher o local</button>`}
      </div>
      ${L?`<div class="field"><span><i class="stepn">2</i>Quando?</span>
      <label class="field"><span>Data</span><input type="date" id="np-data" data-np="npData" value="${UI.npData||proximaData()}"></label>
      <div class="lado"><label class="field"><span>Início</span><input type="time" id="np-hora" data-np="npHora" value="${esc(UI.npHora||c.hora)}"></label>
      <label class="field"><span>Término</span><input type="time" id="np-fim" data-np="npFim" value="${esc(UI.npFim||horaFimDe(null))}"></label></div>
</div>
      <button class="btn primary block btn-grande" data-act="nova-pel">Abrir lista de presença</button>`
      :`<p class="sub" style="margin:0">Depois de escolher o local, você define a data e o horário.</p>`}</div>`}
    return h+renderHist(A);
  }
  const[pid,p]=cur,l=lista(p);
  h+=`<div class="board"><div class="when">${dShort(p.data)}<br>${esc(horaIniDe(p))}<small class="ate"> às ${esc(horaFimDe(p))}</small></div><div class="where row" style="gap:8px">${(()=>{const LL=localDe(p);return LL?`<span>📍 ${esc(LL.nome)}${LL.end?' · '+esc(LL.end):''}</span>${LL.end||LL.tel?`<button class="btn sm" style="background:rgba(255,255,255,.16);border-color:transparent;color:inherit" data-act="como-chegar" data-p="${pid}">${LL.end?'🗺️ Como chegar':'📞 Contato'}</button>`:''}`:'Local a definir'})()}${A?`<button class="btn sm" style="background:rgba(255,255,255,.16);border-color:transparent;color:inherit" data-act="trocar-local" data-p="${pid}">${localDe(p)?'Trocar local':'Definir local'}</button>`:''}</div>
    <div class="stats"><div class="stat"><b class="num">${l.escalados.length}/${l.vagas}</b><span>Linha</span></div><div class="stat"><b class="num">${l.gks.length}</b><span>Goleiros</span></div><div class="stat"><b class="num">${l.espera.length}</b><span>Espera</span></div><div class="stat"><b class="num">${l.pend.length}</b><span>Sem resposta</span></div></div></div>`;
  h+=`<div class="seg" style="margin-block:12px" role="group">${[['presenca','Presença'],['times','Times'],['pos','Pós-jogo']].map(([k,n])=>`<button data-act="sub" data-v="${k}" aria-pressed="${UI.sub===k}">${n}</button>`).join('')}</div>`;
  if(!A)h+=painelJogador(pid,p,l);
  if(UI.sub==='presenca')h+=subPresenca(pid,p,l,A);
  else if(UI.sub==='times')h+=subTimes(pid,p,l,A);
  else h+=subPos(pid,p,A);
  return h+renderHist(A);
}
function rowPlayer(id,right,extra=''){
  const j=J(id);
  return`<div class="item">${avHTML(id)}<div class="grow"><div class="name">${esc(nm(id))}</div><div class="sub row" style="gap:5px"><span class="chip p-${j.pos}">${j.pos}</span><span>${j.tipo==='diarista'?'Diarista':'Mensalista'}</span>${extra}</div></div>${right}</div>`;
}
function subPresenca(pid,p,l,A){
  const resp=respDe(p,pid);
  const wait=new Set(l.espera);
  const order=ativos().sort((a,b)=>{const ra=resp[a]?.s,rb=resp[b]?.s,w=s=>s==='sim'?0:!s?1:2;return w(ra)-w(rb)||nm(a).localeCompare(nm(b))});
  let h=`<div class="panel"><div class="panel-h"><h3>Quem vai?</h3>${A?'<div class="row"><button class="btn sm" data-act="msg" data-v="convocacao">Convocar</button><button class="btn sm" data-act="msg" data-v="cobrar">Cobrar</button><button class="btn sm primary" data-act="msg" data-v="lista">Lista</button></div>':''}</div>`;
  if(!order.length)h+=`<div class="empty">Ninguém no elenco ainda.${A?' <button class="btn sm" data-act="add-jog">Adicionar jogador</button>':''}</div>`;
  h+='<div class="list">';
  for(const id of order){const s=resp[id]?.s;
    const ag=l.aguardando.includes(id);const extra=(ag?'<span class="chip tag-espera">PEDIU VAGA</span>':wait.has(id)?'<span class="chip tag-espera">ESPERA</span>':'')+(resp[id]?.app?'<span class="chip solid">PELO APP</span>':'');
    const libBtn=A&&ag?`<button class="btn sm primary" data-act="liberar" data-p="${pid}" data-j="${id}" ${J(id).pos!=='GOL'&&l.escalados.length>=l.vagas?'disabled title="Lista cheia"':''}>Liberar</button>`:'';
    const right=A?`${libBtn}<div class="rsvp"><button aria-label="Vai" class="${s==='sim'?'on-sim':''}" data-act="rsvp" data-p="${pid}" data-j="${id}" data-v="sim">✓</button><button aria-label="Não vai" class="${s==='nao'?'on-nao':''}" data-act="rsvp" data-p="${pid}" data-j="${id}" data-v="nao">✕</button></div>`
      :`<span class="chip solid">${s==='sim'?'VAI':s==='nao'?'NÃO VAI':'—'}</span>`;
    h+=rowPlayer(id,right,extra)}
  h+='</div></div>';
  if(A)h+=`<div class="row" style="margin-top:12px"><button class="btn danger sm" data-act="cancel-pel" data-p="${pid}">Cancelar esta pelada</button></div>`;
  return h;
}
function subTimes(pid,p,l,A){
  const c=cfg();let h='';
  if(A)h+=`<div class="panel stack"><div class="row between"><div><b>${l.escalados.length} na linha · ${l.gks.length} goleiro(s)</b><div class="sub">${c.golSorteio?'Goleiros entram no sorteio':'Goleiros ficam fora do sorteio (extra)'} · equilibra por nota e posição${(c.restr||[]).length?' · respeita '+c.restr.length+' regra(s)':''}</div></div>
    <div class="row"><select id="nt" aria-label="Número de times" style="width:auto">${[2,3,4].map(n=>`<option value="${n}" ${(p.nTimes||c.times)==n?'selected':''}>${n} times</option>`).join('')}</select>
    <button class="btn primary" data-act="sortear" data-p="${pid}" ${l.escalados.length<2?'disabled':''}>${p.times?'Sortear de novo':'Sortear'}</button></div></div></div>`;
  if(!p.times)return h+`<div class="empty">Os times aparecem aqui depois do sorteio.</div>`;
  const med=p.times.map(teamMedia),mx=Math.max(...med),mn=Math.min(...med);
  h+=`<div class="panel" style="margin-block:12px"><div class="row between"><b>Equilíbrio</b><span class="num small muted">diferença de ${ovr(mx-mn)} ponto${ovr(mx-mn)===1?'':'s'} na média</span></div><div class="meter" style="margin-top:8px"><i style="width:${Math.max(5,100-(mx-mn)*60)}%"></i></div>${A?'<div class="sub" style="margin-top:6px">Toque em um jogador e depois em outro de outro time para trocar os dois.</div>':''}</div>`;
  h+='<div class="teams">';
  p.times.forEach((t,ti)=>{const co=CORES[t.cor];
    h+=`<div class="team"><div class="team-h"><div class="row"><span class="sw" style="background:${co.c}"></span>${A?`<button class="tnome" data-act="time-nome" data-c="${t.cor}" aria-label="Mudar o nome do time">${esc(nomeTime(t.cor))} ✎</button>`:`<b>${esc(nomeTime(t.cor))}</b>`}</div><span class="nota num" style="font-size:20px">${ovr(teamMedia(t))}</span></div><ul>`;
    const ids=(t.gk?[['GOL',t.gk]]:[]).concat(t.ids.map(id=>[posLinha(id),id]));
    for(const[pos,id] of ids){const isSel=UI.sel&&UI.sel.id===id;
      const inner=`<span class="chip p-${pos}" style="min-width:38px;justify-content:center">${pos}</span><span class="grow name">${esc(nm(id))}</span><span class="num muted small">${ovr(notaAtual(id))}</span>`;
      h+=`<li class="${isSel?'sel':''}">${A?`<button data-act="swap" data-p="${pid}" data-t="${ti}" data-j="${id}">${inner}</button>`:inner}</li>`}
    h+='</ul></div>'});
  h+='</div>';
  {const gx=(p.goleiros||[]).filter(id=>S.jog[id]);if(gx.length)h+=`<div class="panel" style="margin-top:12px"><div class="panel-h"><h3>🧤 Goleiros</h3><span class="sub">extra · fora do sorteio</span></div><div class="list">${gx.map(id=>`<div class="item">${avHTML(id)}<div class="grow name">${esc(nm(id))}</div><span class="num muted small">${ovr(notaAtual(id))}</span></div>`).join('')}</div></div>`}
  if(A)h+=`<button class="btn block primary" style="margin-top:12px" data-act="msg" data-v="times">Mandar times no WhatsApp</button>`;
  return h;
}
function quandoCurto(t){const d=new Date(t);return`${DIAS3[d.getDay()]} ${pad(d.getDate())}/${pad(d.getMonth()+1)} ${pad(d.getHours())}:${pad(d.getMinutes())}`}
function statusVotacao(p,pid,ids){const f=fimDe(p).getTime(),n=Date.now(),fa=fimAval(p);
  const cont=ADM()&&!p.aval?` ${Object.keys(votosDe(pid)).filter(j=>ids.includes(j)).length} de ${ids.length} já votaram.`:'';
  if(p.aval)return'Avaliação encerrada. As notas abaixo são a média secreta da galera.';
  if(n<f)return`A avaliação abre no término da pelada (${quandoCurto(f)}) e fica aberta por ${janelaH()}h.`;
  if(n<fa)return`Avaliação aberta até ${quandoCurto(fa)}. Os votos são secretos e as notas só aparecem quando ela fechar.${cont}`;
  return'Avaliação encerrada. As notas aparecem assim que um administrador abrir o app.'+cont}
// relação das notas de uma pelada, da maior para a menor
function tabelaNotas(pid,p,A){const st=p.stats||{},pr=premiosDe(p,pid),r=rankingNotas(p,pid);let pos=0;
  return`<div class="list">${r.map(x=>{const s=st[x.id]||{};if(x.n!=null)pos++;
    const step=(f,lbl,v)=>A?`<div class="stepbox"><div class="step"><button data-act="stat" data-p="${pid}" data-j="${x.id}" data-f="${f}" data-d="-1" aria-label="Menos ${lbl}">−</button><output class="num">${v}</output><button data-act="stat" data-p="${pid}" data-j="${x.id}" data-f="${f}" data-d="1" aria-label="Mais ${lbl}">+</button></div><span class="lbl">${lbl}</span></div>`:'';
    return`<div class="item" style="flex-wrap:wrap"><span class="pos num" style="width:22px;text-align:center;font-weight:800">${x.n!=null?pos+'º':'–'}</span>${avHTML(x.id)}<div class="grow" style="min-width:110px"><div class="name">${esc(nm(x.id))}${pr.mvp===x.id?' 🏆':''}${pr.per===x.id?' 🐢':''}</div>
      <div class="sub">${x.n!=null?`${x.a?x.a.n+' voto'+(x.a.n>1?'s':''):''}`:(x.a?`só ${x.a.n} voto, não conta`:'sem votos')}${A?'':` · ⚽ ${s.g||0} · 🅰️ ${s.a||0}`}</div></div>
      ${A?`<div class="row" style="gap:6px">${step('g','Gols',s.g||0)}${step('a','Assist.',s.a||0)}</div>`:''}<span class="nota num" style="min-width:44px;text-align:right">${x.n!=null?fmtN(x.n):'—'}</span></div>`}).join('')}</div>`}
function sheetNotasPelada(pid){const p=S.pel[pid];if(!p)return;const A=ADM(),ids=jogaram(p);
  openSheet('Pelada de '+dShort(p.data),`<div class="stack"><div class="sub">${statusVotacao(p,pid,ids)}</div>
    ${p.aval||A?`<div class="panel"><div class="panel-h"><h3>${p.aval?'Notas da pelada':'Gols e assistências'}</h3>${p.aval?'<span class="sub">0 a 10</span>':''}</div>${tabelaNotas(pid,p,A)}</div>`:''}
    ${A?'<p class="sub" style="margin:0">Como administrador, você pode corrigir os gols e as assistências de cada jogador nesta pelada.</p>':''}</div>`)}
function subPos(pid,p,A){
  const ids=jogaram(p),st=p.stats||{},pr=premiosDe(p,pid),manual=p.premios||{};
  if(!ids.length)return`<div class="empty">Confirme a presença e sorteie os times antes do pós-jogo.</div>`;
  let h='';
  if(p.times&&A){h+=`<div class="panel" style="margin-bottom:12px"><h3 style="margin-bottom:8px">Vitórias por time</h3><div class="row" style="gap:16px">`;
    p.times.forEach((t,i)=>{const v=(p.vit||[])[i]||0;h+=`<div class="stepbox"><div class="step"><button data-act="vit" data-p="${pid}" data-i="${i}" data-d="-1" aria-label="Menos">−</button><output class="num">${v}</output><button data-act="vit" data-p="${pid}" data-i="${i}" data-d="1" aria-label="Mais">+</button></div><span class="lbl">${esc(nomeTime(t.cor))}</span></div>`});
    h+='</div></div>'}
  h+=`<div class="panel"><div class="panel-h"><h3>${p.aval?'Notas da pelada':'Avaliação da galera'}</h3>${p.aval?'<span class="sub">0 a 10</span>':''}</div><div class="sub" style="margin-bottom:6px">${statusVotacao(p,pid,ids)}</div>${tabelaNotas(pid,p,A)}</div>`;
  const opts=(list,v)=>'<option value="">—</option>'+list.map(id=>`<option value="${id}" ${v===id?'selected':''}>${esc(nm(id))}</option>`).join('');
  const sugArt=ids.slice().sort((a,b)=>(st[b]?.g||0)-(st[a]?.g||0))[0],sugGar=ids.slice().sort((a,b)=>(st[b]?.a||0)-(st[a]?.a||0))[0];
  const gks=ids.filter(id=>J(id).pos==='GOL');
  const auto=k=>!manual[k]&&pr[k]?'<div class="sub">Pelos votos da galera</div>':(k==='mvp'||k==='per')&&!p.aval?'<div class="sub">Sai pelos votos quando a avaliação fechar</div>':'';
  h+=`<div class="panel" style="margin-top:12px"><h3 style="margin-bottom:10px">Prêmios</h3><div class="awards">
    <div class="award"><label for="pr-mvp">🏆 Craque</label>${A?`<select id="pr-mvp" data-act="premio" data-p="${pid}" data-f="mvp">${opts(ids,pr.mvp)}</select>${auto('mvp')}`:esc(pr.mvp?nm(pr.mvp):'—')}</div>
    <div class="award"><label for="pr-per">🐢 Pereba</label>${A?`<select id="pr-per" data-act="premio" data-p="${pid}" data-f="per">${opts(ids,pr.per)}</select>${auto('per')}`:esc(pr.per?nm(pr.per):'—')}</div>
    <div class="award"><label for="pr-art">⚽ Artilheiro</label>${A?`<select id="pr-art" data-act="premio" data-p="${pid}" data-f="art">${opts(ids,pr.art)}</select>${!pr.art&&st[sugArt]?.g?`<div class="sub">Sugestão: ${esc(nm(sugArt))}</div>`:''}`:esc(pr.art?nm(pr.art):'—')}</div>
    <div class="award"><label for="pr-gar">🅰️ Garçom</label>${A?`<select id="pr-gar" data-act="premio" data-p="${pid}" data-f="gar">${opts(ids,pr.gar)}</select>${!pr.gar&&st[sugGar]?.a?`<div class="sub">Sugestão: ${esc(nm(sugGar))}</div>`:''}`:esc(pr.gar?nm(pr.gar):'—')}</div>
    <div class="award"><label for="pr-gol">🧤 Goleiro</label>${A?`<select id="pr-gol" data-act="premio" data-p="${pid}" data-f="gol">${opts(gks.length?gks:ids,pr.gol)}</select>`:esc(pr.gol?nm(pr.gol):'—')}</div></div></div>`;
  {const LL=p.localId&&S.locais[p.localId];if(LL)h+=`<div class="panel" style="margin-top:12px"><div class="panel-h"><h3>Avalie o campo</h3><span class="sub">${esc(LL.nome)}</span></div>
    ${A?formAvalCampo(pid,p.avalCampo,'adm'):'<div class="sub">O administrador avalia aqui. Você avalia pelo cartão na aba Jogo depois da pelada.</div>'}
    ${notaCampoHTML(p.localId)?`<div class="sub" style="margin-top:6px">Nota geral do campo: ${notaCampoHTML(p.localId)}</div>`:''}</div>`}
  if(A){
    const temPremio=['mvp','art','gar','gol'].some(k=>pr[k]);
    h+=`<div class="stack" style="margin-top:12px"><button class="btn warn" data-act="arte" data-p="${pid}" ${temPremio?'':'disabled'}>Gerar artes dos destaques</button><button class="btn" data-act="msg" data-v="resultado">Mandar resultado no WhatsApp</button>`;
    h+=UI.confirmEnd?`<div class="confirm"><b>Encerrar a pelada de ${dShort(p.data)}?</b><span class="small">A pelada vai para o histórico. A galera ainda pode avaliar até ${janelaH()}h depois do término.</span><div class="row"><button class="btn primary" data-act="encerrar" data-p="${pid}">Encerrar</button><button class="btn" data-act="confirm-end" data-v="0">Voltar</button></div></div>`
      :`<button class="btn primary" data-act="confirm-end" data-v="1">Encerrar pelada</button>`;
    h+='</div>'}
  return h;
}
/* cartão do jogador depois do término: avaliar a galera e lançar seus gols e assistências */
function posJogoMeu(){const j=meuJogador();if(!j)return null;
  return Object.entries(S.pel).filter(([,p])=>jogaram(p).includes(j)&&posAberto(p)).sort((a,b)=>fimDe(b[1])-fimDe(a[1]))[0]||null}
function painelPosJogo(){const pp=posJogoMeu();if(!pp)return'';const[pid,p]=pp,j=meuJogador(),doc=S.pres[myId]||{};
  const outros=jogaram(p).filter(id=>id!==j&&S.jog[id]).sort((a,b)=>nm(a).localeCompare(nm(b)));
  const meus=meusVotos(pid),feitos=outros.filter(id=>meus[id]).length;
  const L=(doc.lanc||{})[pid],stt=lancStatus(p,myId,L),ap=(p.stats||{})[j]||{};
  const rasc=(UI.lanc&&UI.lanc[pid])||{g:L?L.g:(ap.g||0),a:L?L.a:(ap.a||0)};
  const aberto=UI.votoAberto===pid||feitos<outros.length;
  let h=`<div class="panel stack" style="margin-bottom:12px;border-color:var(--card)"><div class="panel-h"><h3>Pós-jogo · ${dShort(p.data)}</h3><span class="sub num">${feitos}/${outros.length} avaliados</span></div>`;
  h+=`<div class="sub" style="margin-top:-4px">Dê de 1 a 5 estrelas para cada um que jogou. 🔒 Seu voto é secreto. Aberta até ${quandoCurto(fimAval(p))}; depois saem as notas, o craque 🏆 e o pereba 🐢.</div><div class="sub" style="font-style:italic;opacity:.85">⚖️ Avacalhou na votação? O app foi programado para perceber. Além de atrapalhar a pelada, seu voto passa a valer menos.</div>`;
  if(aberto)h+=`<div class="list">${outros.map(id=>`<div class="item">${avHTML(id)}<div class="grow name">${esc(nm(id))}</div>${estrelasInput(meus[id],`data-act="voto" data-p="${pid}" data-j="${id}"`)}</div>`).join('')}</div>`;
  else h+=`<div class="row between"><span>✓ Você avaliou todo mundo.</span><button class="btn sm" data-act="voto-abrir" data-p="${pid}">Rever votos</button></div>`;
  const stp=(f,lbl)=>`<div class="stepbox"><div class="step"><button data-act="lanc-step" data-p="${pid}" data-f="${f}" data-d="-1" aria-label="Menos ${lbl}">−</button><output class="num">${rasc[f]||0}</output><button data-act="lanc-step" data-p="${pid}" data-f="${f}" data-d="1" aria-label="Mais ${lbl}">+</button></div><span class="lbl">${lbl}</span></div>`;
  const stTxt=stt==='ok'?'✅ Aprovado pelo administrador.':stt==='rec'?'❌ O administrador não aprovou. Confira e envie de novo.':stt==='pend'?'⏳ Enviado. Aguardando a aprovação de um administrador.':'Seus números só contam depois que um administrador aprovar.';
  h+=`<div style="border-top:1px solid var(--line);padding-top:10px"><b>Seus números</b><div class="row" style="gap:12px;margin:8px 0">${stp('g','Gols')}${stp('a','Assist.')}<button class="btn primary" data-act="lanc-enviar" data-p="${pid}">${L?'Enviar de novo':'Enviar'}</button></div><div class="sub">${stTxt}</div></div>`;
  return h+'</div>'}
function painelAprovar(){const ps=lancPendentes();if(!ps.length)return'';
  return`<div class="panel" style="margin-bottom:12px;border-color:var(--card)"><div class="panel-h"><h3>Gols e assistências para aprovar</h3><span class="cnt" style="font-size:12px;font-weight:700;background:var(--card);color:var(--card-ink);border-radius:10px;padding:2px 8px">${ps.length}</span></div><div class="list">
    ${ps.map(x=>{const ap=(x.p.stats||{})[x.j]||{};return`<div class="item">${avHTML(x.j)}<div class="grow"><div class="name">${esc(nm(x.j))}</div><div class="sub">${dShort(x.p.data)} · ⚽ ${x.L.g||0} gol${x.L.g===1?'':'s'} · 🅰️ ${x.L.a||0} assist.${(ap.g||ap.a)?` <span class="muted">(hoje: ${ap.g||0} e ${ap.a||0})</span>`:''}</div></div>
      <div class="row" style="gap:4px;flex-wrap:nowrap"><button class="btn sm primary" data-act="lanc-ok" data-p="${x.pid}" data-u="${x.u}">Aprovar</button><button class="btn sm" data-act="lanc-rec" data-p="${x.pid}" data-u="${x.u}" aria-label="Recusar">✕</button></div></div>`}).join('')}</div></div>`}
function renderHist(A){
  const enc=encerradas();if(!enc.length)return'';
  const show=UI.showHist?enc:enc.slice(0,3);
  let h=`<div class="panel" style="margin-top:16px"><div class="panel-h"><h3>Últimas peladas</h3></div>`;
  for(const[pid,p] of show){const pr=premiosDe(p,pid);
    h+=`<div class="hist"><div class="grow"><b class="num">${dShort(p.data)}</b><div class="sub">${jogaram(p).length} jogadores${pr.mvp?' · 🏆 '+esc(nm(pr.mvp)):''}${pr.art?' · ⚽ '+esc(nm(pr.art)):''}</div></div><div class="row" style="gap:4px;flex-wrap:nowrap"><button class="btn sm" data-act="notas-pel" data-p="${pid}">Notas</button>${A?`${Object.values(pr).some(Boolean)?`<button class="btn sm" data-act="arte" data-p="${pid}">Artes</button>`:''}<button class="btn sm" data-act="msg" data-v="resultado" data-p="${pid}">Resultado</button>`:''}</div></div>`}
  if(enc.length>3)h+=`<button class="btn sm block" style="margin-top:8px" data-act="hist">${UI.showHist?'Mostrar menos':'Ver todas ('+enc.length+')'}</button>`;
  return h+'</div>';
}

function painelJogador(pid,p,l){

  const doc=S.pres[myId];
  if(!doc||!S.jog[doc.jogador]){
    const tomados=new Set(Object.values(S.pres).map(x=>x.jogador));
    const ops=ativos().filter(id=>!tomados.has(id)).sort((a,b)=>nm(a).localeCompare(nm(b)));
    return`<div class="panel stack" style="margin-bottom:12px"><h3>Quem é você?</h3><div class="sub">Escolha seu nome uma vez. Depois é só tocar em "Vou" ou "Não vou". Mensalista com vaga entra na hora; diarista e lista de espera dependem da liberação do administrador.</div>
      <div class="row" style="flex-wrap:nowrap"><select id="eu-sou" class="grow"><option value="">Seu nome no elenco</option>${ops.map(id=>`<option value="${id}">${esc(nm(id))}</option>`).join('')}</select><button class="btn primary" data-act="eu-sou">Sou eu</button></div>
      <div class="sub">Não achou seu nome? Peça ao administrador para te cadastrar.</div></div>`}
  const j=doc.jogador,s=respDe(p,pid)[j]?.s;
  let status='Você ainda não respondeu.';
  if(s==='sim'){const i=l.escalados.indexOf(j);status=l.aguardando.includes(j)?'Pedido enviado. Aguardando o administrador liberar sua vaga.':J(j).pos==='GOL'?'Confirmado no gol. ✓':i>=0?`Você está na lista: ${i+1}º de ${l.vagas}.`:`Você é o ${l.espera.indexOf(j)+1}º da espera.`}
  if(s==='nao')status='Você avisou que não vai.';
  return`<div class="panel stack" style="margin-bottom:12px;border-color:var(--pitch)"><div class="row between"><h3>Você vai, ${esc(nm(j))}?</h3><button class="btn sm" data-act="eu-trocar">Não sou eu</button></div>
    <div class="row" style="flex-wrap:nowrap"><button class="btn grow ${s==='sim'?'primary':''}" data-act="eu-vou" data-p="${pid}" data-v="sim">✓ Vou</button><button class="btn grow ${s==='nao'?'danger':''}" data-act="eu-vou" data-p="${pid}" data-v="nao">✕ Não vou</button></div>
    <div class="sub">${status}</div></div>`;
}

/* ---------- avaliação completa (5 critérios, de tempos em tempos) ----------
   O administrador abre uma rodada (todos ou só alguns jogadores, ex.: novatos) com prazo.
   Cada um avalia os outros nos 5 critérios (1 a 5 estrelas), pode pular quem não conhece.
   Votos secretos em votos/{uid}.av. Ao fechar, o app do administrador calcula a média de cada critério
   (com o mesmo peso menor para quem avacalha) e grava em jogadores/{id}.critGalera.
   Essa média vira a "estrela" do jogador e substitui a nota inicial do cadastro no cálculo da nota. */
const MIN_AV=2;
function critDe(jid){return critKey(J(jid).pos)}
function rodadaAberta(){return Object.entries(S.avals||{}).filter(([,r])=>r&&r.status==='aberta').sort((a,b)=>(b[1].criadoEm||0)-(a[1].criadoEm||0))[0]||null}
function alvosDe(r){return(r.alvos||[]).filter(id=>S.jog[id])}
function meusAv(rid){const d=(S.votos||{})[myId];return((d&&d.av)||{})[rid]||{}}
function feitoAv(jid,v){if(!v)return false;if(v.ns)return true;return critDe(jid).every(([c])=>Number(v[c])>0)}
function paraMimAvaliar(r){const eu=meuJogador();return alvosDe(r).filter(id=>id!==eu)}
function progressoAv(rid,r){const mv=meusAv(rid),ids=paraMimAvaliar(r);return{feitos:ids.filter(id=>feitoAv(id,mv[id])).length,total:ids.length}}
function quandoFim(t){const d=new Date(t);return`${DIAS3[d.getDay()]} ${pad(d.getDate())}/${pad(d.getMonth()+1)} ${pad(d.getHours())}:${pad(d.getMinutes())}`}
function avG(id,px){const j=J(id),f=fotoDe(id);return`<div class="av bg-${j.pos}" style="width:${px}px;height:${px}px;font-size:${Math.round(px*.38)}px;${fotoStyle(f)}" ${f?`role="img" aria-label="${esc(nm(id))}"`:''}>${f?'':esc(initials(nm(id)))}</div>`}

// apuração: média ponderada por critério; quem foge muito da galera pesa menos
function apurarRodada(rid){
  const bruto={};for(const[u,d] of Object.entries(S.votos||{})){const v=d&&d.av&&d.av[rid];const jog=(d&&d.jogador)||(S.pres[u]||{}).jogador;if(v&&jog)bruto[jog]=v}
  // achata em "alvo|critério" para usar a mesma régua do pós-jogo
  const plano={};for(const[V,m] of Object.entries(bruto)){plano[V]={};for(const[t,cr] of Object.entries(m||{})){if(t===V||!cr||cr.ns||!S.jog[t])continue;
    for(const[c] of critDe(t)){const x=Number(cr[c]);if(x)plano[V][t+'|'+c]=x}}}
  const vs=ajustarRegua(plano),peso={};
  for(const[V,m] of Object.entries(vs)){const difs=[];
    for(const[k,v] of Object.entries(m)){const os=Object.entries(vs).filter(([o])=>o!==V&&o!==k.split('|')[0]).map(([,mm])=>mm[k]).filter(x=>x!=null);if(os.length>=2)difs.push(Math.abs(v-sum(os)/os.length))}
    const vals=Object.values(plano[V]||{}),chapado=vals.length>=8&&vals.every(x=>x===vals[0]);
    peso[V]=pesoBase(difs.length>=3?sum(difs)/difs.length:0,chapado)}
  const res={};
  for(const[V,m] of Object.entries(vs)){const w=peso[V]??1,alvos=new Set();
    for(const[k,v] of Object.entries(m)){const[t,c]=k.split('|');const r=res[t]=res[t]||{s:{},w:{},quem:new Set()};r.s[c]=(r.s[c]||0)+v*w;r.w[c]=(r.w[c]||0)+w;r.quem.add(V)}}
  const out={};for(const[t,r] of Object.entries(res)){const c={};for(const k in r.s)if(r.w[k]>0)c[k]=Math.round(Math.max(1,Math.min(5,r.s[k]/r.w[k]))*100)/100;out[t]={crit:c,n:r.quem.size}}
  return out}
const FECHANDO_AV=new Set();
function fecharRodada(rid){const r=S.avals[rid];if(!r||FECHANDO_AV.has(rid))return;FECHANDO_AV.add(rid);
  const res=apurarRodada(rid),now=Date.now();
  put('avaliacoes/'+rid,{...r,status:'fechada',fechadaEm:now,resultado:res});
  for(const[jid,x] of Object.entries(res)){const j=S.jog[jid];if(!j||x.n<MIN_AV)continue;
    put('jogadores/'+jid,{...j,critGalera:x.crit,critN:x.n,critEm:now})}
}
function consolidarRodadas(){if(demo||!ADM()||!S.votosOk)return;const ra=rodadaAberta();if(ra&&Date.now()>=(ra[1].fim||0))fecharRodada(ra[0])}

/* cartão para quem precisa avaliar */
function cartaoAvCompleta(){const ra=rodadaAberta();if(!ra||!meuJogador())return'';const[rid,r]=ra,{feitos,total}=progressoAv(rid,r);if(!total)return'';
  const ok=feitos>=total;
  return`<div class="panel stack" style="margin-bottom:12px;border-color:var(--card)"><div class="panel-h"><h3>⭐ Avaliação completa</h3><span class="sub num">${feitos}/${total}</span></div>
    <div class="sub" style="margin-top:-4px">${ok?'✓ Você já avaliou todo mundo. Pode rever até o prazo.':`Avalie ${total} jogador${total>1?'es':''} nos 5 critérios. 🔒 Secreto. Até ${quandoFim(r.fim)}.`}</div>
    <div class="row" style="gap:4px;flex-wrap:nowrap;overflow:hidden">${paraMimAvaliar(r).slice(0,8).map(id=>avHTML(id)).join('')}${total>8?`<span class="sub">+${total-8}</span>`:''}</div>
    <button class="btn ${ok?'':'primary'} block" data-act="av-abrir">${ok?'Rever minhas avaliações':feitos?'Continuar avaliando':'Avaliar agora'}</button></div>`}

/* tela de avaliar: um jogador por vez, com foto grande */
function sheetAvaliar(){const ra=rodadaAberta();if(!ra){closeSheet();toast('A avaliação já fechou.');return}const[rid,r]=ra,ids=paraMimAvaliar(r);if(!ids.length){closeSheet();return}
  UI.avi=Math.max(0,Math.min(ids.length-1,UI.avi||0));const id=ids[UI.avi],mv=meusAv(rid),v=mv[id]||{},{feitos,total}=progressoAv(rid,r),j=J(id);
  openSheet('Avaliação completa',`<div class="stack">
    <div class="avstrip">${ids.map((x,i)=>`<button class="avthumb ${i===UI.avi?'on':''}" data-act="av-ir" data-v="${i}" aria-label="${esc(nm(x))}">${avHTML(x)}${feitoAv(x,mv[x])?'<span class="ok">✓</span>':''}</button>`).join('')}</div>
    <div class="sub" style="text-align:center">${feitos} de ${total} avaliados · até ${quandoFim(r.fim)}</div>
    <div style="display:flex;flex-direction:column;align-items:center;gap:6px">${avG(id,112)}<div style="font-family:var(--f-display);font-weight:800;font-size:24px;text-transform:uppercase">${esc(nm(id))}</div>
      <div class="sub">${esc(j.nome||'')}${j.nome&&j.apelido?' · ':''}<span class="chip p-${j.pos}">${j.pos}</span> ${esc(POS[j.pos]||'')}</div></div>
    ${v.ns?`<div class="banner"><span>Você marcou que não sabe avaliar ${esc(nm(id))}.</span></div>`
      :`<div class="panel">${critDe(id).map(([c,n])=>`<div class="rate"><span>${n}</span>${estrelasInput(v[c],`data-act="av-voto" data-j="${id}" data-c="${c}"`)}</div>`).join('')}</div>`}
    <button class="btn sm block" data-act="av-ns" data-j="${id}">${v.ns?'Quero avaliar':'Não sei avaliar este jogador'}</button>
    <div class="lado"><button class="btn" data-act="av-ir" data-v="${UI.avi-1}" ${UI.avi===0?'disabled':''}>‹ Anterior</button><button class="btn ${feitoAv(id,v)?'primary':''}" data-act="av-ir" data-v="${UI.avi+1}" ${UI.avi>=ids.length-1?'disabled':''}>Próximo ›</button></div>
    <div class="sub" style="text-align:center;font-style:italic;opacity:.85">⚖️ Avacalhou na votação? O app foi programado para perceber. Além de atrapalhar a pelada, seu voto passa a valer menos.</div></div>`)}
function votarAv(jid,patchV){const ra=rodadaAberta();if(!ra){toast('A avaliação já fechou.');return}const rid=ra[0],eu=meuJogador();if(!eu||jid===eu)return;
  const mv=(S.votos||{})[myId]||{},av={...(mv.av||{})},cur={...((av[rid]||{})[jid]||{})};
  const novo=patchV(cur);av[rid]={...(av[rid]||{}),[jid]:novo};
  const ks=Object.keys(av).sort().slice(-3),av3={};ks.forEach(k=>av3[k]=av[k]);
  put('votos/'+myId,{...mv,jogador:eu,av:av3,t:Date.now()})}

/* tela do administrador: abrir rodada escolhendo quem (com fotos) ou ver andamento */
function sheetAvAdmin(){const ra=rodadaAberta();
  if(ra){const[rid,r]=ra,ids=alvosDe(r),vs=Object.entries(S.votos||{}).filter(([,d])=>d&&d.av&&d.av[rid]);
    const comecaram=vs.length,concluiram=vs.filter(([u,d])=>{const jog=d.jogador||(S.pres[u]||{}).jogador;const alvo=ids.filter(x=>x!==jog);return alvo.length&&alvo.every(x=>feitoAv(x,d.av[rid][x]))}).length;
    openSheet('Avaliação completa',`<div class="stack"><div class="banner due"><span><b>Aberta até ${quandoFim(r.fim)}</b><br>${ids.length} jogador${ids.length>1?'es':''} em avaliação · ${comecaram} pessoa(s) começaram · ${concluiram} concluíram</span></div>
      <div class="avgrid">${ids.map(id=>`<div class="avcard on">${avG(id,56)}<b>${esc(nm(id))}</b><span class="chip p-${J(id).pos}">${J(id).pos}</span></div>`).join('')}</div>
      <button class="btn primary block" data-act="av-encerrar" data-r="${rid}">Encerrar agora e calcular</button>
      <button class="btn danger block" data-act="av-cancelar" data-r="${rid}">Cancelar avaliação</button>
      <p class="sub" style="margin:0">Ao encerrar, cada jogador avaliado por pelo menos ${MIN_AV} pessoas ganha a estrela da galera, que passa a valer no lugar da nota inicial do cadastro.</p></div>`);return}
  if(!UI.avSel)UI.avSel=new Set();const sel=UI.avSel;
  const ids=ativos().sort((a,b)=>(!!S.jog[a].critGalera)-(!!S.jog[b].critGalera)||nm(a).localeCompare(nm(b)));
  openSheet('Nova avaliação completa',`<div class="stack"><p class="sub" style="margin:0">Escolha quem a galera vai avaliar nos 5 critérios. Os marcados com <b>NOVO</b> ainda não têm avaliação da galera.</p>
    <div class="row" style="gap:6px"><button class="btn sm" data-act="av-sel" data-v="todos">Todos</button><button class="btn sm" data-act="av-sel" data-v="novos">Só os novos</button><button class="btn sm" data-act="av-sel" data-v="nenhum">Limpar</button></div>
    <div class="avgrid">${ids.map(id=>`<button class="avcard ${sel.has(id)?'on':''}" data-act="av-tog" data-j="${id}" aria-pressed="${sel.has(id)}">${avG(id,56)}<b>${esc(nm(id))}</b><span class="chip p-${J(id).pos}">${J(id).pos}</span>${S.jog[id].critGalera?'':'<span class="novo">NOVO</span>'}${sel.has(id)?'<span class="ok">✓</span>':''}</button>`).join('')}</div>
    <label class="field"><span>Prazo para avaliar</span><select id="av-prazo">${[1,2,3,5,7].map(d=>`<option value="${d}" ${d===3?'selected':''}>${d} dia${d>1?'s':''}</option>`).join('')}</select></label>
    <button class="btn primary block btn-grande" data-act="av-criar" ${sel.size?'':'disabled'}>Abrir avaliação · ${sel.size} jogador${sel.size===1?'':'es'}</button></div>`)}

/* estrela (radar) dos 5 critérios, com comparação */
function valoresCrit(jid){const j=J(jid),src=j.critGalera||j.crit||{};return critDe(jid).map(([c])=>Number(src[c]??(j.crit||{})[c]??3))}
function radarSVG(labels,series){const W=300,H=260,cx=150,cy=136,R=92,n=labels.length,ang=i=>-Math.PI/2+i*2*Math.PI/n;
  const pt=(i,v)=>[cx+Math.cos(ang(i))*R*v/5,cy+Math.sin(ang(i))*R*v/5];
  let s=`<svg viewBox="0 0 ${W} ${H}" class="radar" role="img" aria-label="Estrela de habilidades">`;
  for(let l=1;l<=5;l++)s+=`<polygon points="${labels.map((_,i)=>pt(i,l).join(',')).join(' ')}" class="rg${l===5?' ext':''}"/>`;
  labels.forEach((_,i)=>{const[x,y]=pt(i,5);s+=`<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" class="rg"/>`});
  series.forEach(se=>{s+=`<polygon points="${se.vals.map((v,i)=>pt(i,v).join(',')).join(' ')}" class="rs" style="fill:${se.cor};stroke:${se.cor}"/>`;
    se.vals.forEach((v,i)=>{const[x,y]=pt(i,v);s+=`<circle cx="${x}" cy="${y}" r="3.5" style="fill:${se.cor}"/>`})});
  labels.forEach((t,i)=>{const[x,y]=pt(i,6.1);const v=series[0].vals[i];s+=`<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="middle" class="rl">${esc(t)}<tspan x="${x}" dy="14" class="rv">${Math.round(v*20)}</tspan></text>`});
  return s+'</svg>'}
function painelEstrela(id){const j=J(id),labels=critDe(id).map(([,n])=>n),cmp=UI.cmp&&S.jog[UI.cmp]&&UI.cmp!==id&&critKey(J(UI.cmp).pos)===critKey(j.pos)?UI.cmp:null;
  const series=[{vals:valoresCrit(id),cor:'#1B6A36'}];if(cmp)series.push({vals:valoresCrit(cmp),cor:'#E8742A'});
  const fonte=j.critGalera?`Avaliação da galera · ${j.critN||''} voto(s) · ${new Date(j.critEm).toLocaleDateString('pt-BR',{month:'short',year:'numeric'})}`:'Avaliação inicial do cadastro';
  const outros=ativos().filter(x=>x!==id&&critKey(J(x).pos)===critKey(j.pos)).sort((a,b)=>nm(a).localeCompare(nm(b)));
  return`<div class="panel"><div class="panel-h"><h3>⭐ Estrela</h3><span class="sub">${esc(fonte)}</span></div>${radarSVG(labels,series)}
    <div class="row" style="gap:8px;flex-wrap:nowrap;align-items:center"><span class="legenda" style="--c:#1B6A36">${esc(nm(id))}</span>${cmp?`<span class="legenda" style="--c:#E8742A">${esc(nm(cmp))}</span>`:''}</div>
    <label class="field" style="margin-top:8px"><span>Comparar com</span><select data-act="cmp" data-j="${id}"><option value="">Ninguém</option>${outros.map(x=>`<option value="${x}" ${x===cmp?'selected':''}>${esc(nm(x))}</option>`).join('')}</select></label></div>`}

/* --- Elenco --- */
function tElenco(A){
  const q=UI.busca.trim().toLowerCase();
  const{st}=temporada(UI.ano);
  let ids=Object.keys(S.jog).filter(id=>{const j=S.jog[id];
    if(UI.filtro==='inativos')return j.ativo===false;if(j.ativo===false)return false;
    if(['GOL','ZAG','MEI','ATA'].includes(UI.filtro)&&j.pos!==UI.filtro)return false;
    if(UI.filtro==='diarista'&&j.tipo!=='diarista')return false;if(UI.filtro==='mensalista'&&j.tipo==='diarista')return false;
    return!q||(j.nome+' '+(j.apelido||'')).toLowerCase().includes(q)});
  ids.sort((a,b)=>notaAtual(b)-notaAtual(a));
  let h=`<div class="row between" style="margin-bottom:10px"><h2>Elenco <span class="muted num">${ativos().length}</span></h2>${A?'<button class="btn primary" data-act="add-jog">+ Jogador</button>':''}</div>
    <input type="text" id="busca" placeholder="Buscar jogador" value="${esc(UI.busca)}" data-in="busca" style="margin-bottom:10px">
    <div class="pick" style="margin-bottom:12px">${[['todos','Todos'],['GOL','GOL'],['ZAG','ZAG'],['MEI','MEI'],['ATA','ATA'],['mensalista','Mensalistas'],['diarista','Diaristas'],['inativos','Inativos']].map(([k,n])=>`<button data-act="filtro" data-v="${k}" aria-pressed="${UI.filtro===k}">${n}</button>`).join('')}</div>`;
  if(A){const ra=rodadaAberta();h+=`<button class="btn block ${ra?'':'warn'}" data-act="av-admin" style="margin-bottom:12px">${ra?`⭐ Avaliação completa aberta · até ${quandoFim(ra[1].fim)}`:'⭐ Nova avaliação completa (5 critérios)'}</button>`}
  h+=cartaoAvCompleta();
  if(membrosSemCadastro().length&&!demo)h+=A?painelMembros():painelPendentes();
  if(!A&&euPendente())h=bannerPendente().replace('margin-top:12px','margin:0 0 12px')+h;
  if(!Object.keys(S.jog).length){
    h+=`<div class="panel stack" style="text-align:center;padding-block:22px">
      <div style="font-size:40px;line-height:1">👕</div><h3 style="align-self:center">Elenco vazio</h3>
      <p class="sub" style="margin:0">${A?'Monte o elenco de dois jeitos: convide a galera para entrar pelo app, ou cadastre cada jogador você mesmo.':'Ainda não tem ninguém no elenco. Chame a galera para a pelada!'}</p>
      <button class="btn primary block" data-act="qr-pelada">📲 Convidar pelo QR Code ou link</button>
      ${A?'<button class="btn block" data-act="add-jog">✍️ Adicionar jogador manualmente</button>':''}
      ${A?'<p class="sub" style="margin:0;text-align:left">Quem entrar pelo convite aparece aqui em cima, em "Pendentes", para você autorizar e dar a nota inicial.</p>':''}</div>`;
    return h;
  }
  const linha=(id,tag='')=>{const s=st[id]||{};
    return`<button class="item" data-act="ver-jog" data-j="${id}" style="all:unset;display:flex;align-items:center;gap:10px;padding:10px 0;border-top:1px solid var(--line);cursor:pointer">
      ${avHTML(id)}<div class="grow"><div class="name">${esc(nm(id))}</div><div class="sub row" style="gap:5px"><span class="chip p-${S.jog[id].pos}">${S.jog[id].pos}</span>${tag}<span>${S.jog[id].tipo==='diarista'?'Diarista':'Mensalista'} · ${s.j||0} jogos · ${s.g||0} gols</span></div></div><span class="nota num">${ovr(notaAtual(id))}</span></button>`};
  if(UI.filtro==='inativos'){h+='<div class="panel"><div class="list">'+(ids.length?ids.map(id=>linha(id)).join(''):'<div class="empty">Nenhum jogador aqui.</div>')+'</div></div>';return h}
  const set=new Set(ids),cur=atual();
  const exc=cur?lista(cur[1],cur[0]).espera.filter(id=>set.has(id)):[];
  const mens=ids.filter(id=>S.jog[id].tipo!=='diarista');
  const espIds=exc.concat(ids.filter(id=>S.jog[id].tipo==='diarista'&&!exc.includes(id)));
  if(UI.filtro!=='diarista')h+=`<div class="panel" style="margin-bottom:12px"><div class="panel-h"><h3>Mensalistas <span class="muted num">${mens.length}</span></h3></div><div class="list">${mens.length?mens.map(id=>linha(id)).join(''):'<div class="empty">Nenhum mensalista aqui.</div>'}</div></div>`;
  if(UI.filtro!=='mensalista')h+=`<div class="panel"><div class="panel-h"><h3>Lista de espera <span class="muted num">${espIds.length}</span></h3></div>
    <div class="sub" style="margin-bottom:4px">Diaristas e quem confirmou com a lista cheia. Mensalista tem prioridade na espera.</div>
    <div class="list">${espIds.length?espIds.map(id=>linha(id,exc.includes(id)?`<span class="chip" style="background:var(--card);color:var(--card-ink)">${exc.indexOf(id)+1}º na espera ${dShort(cur[1].data)}</span>`:'')).join(''):'<div class="empty">Ninguém na espera.</div>'}</div></div>`;
  return h;
}

/* --- Avisos --- */
function tAvisos(A){
  let h=`<div class="row between" style="margin-bottom:6px"><h2>Avisos</h2>${A?'<button class="btn primary" data-act="add-aviso">+ Aviso</button>':''}</div>
    <p class="small muted" style="margin:0 0 12px">No horário programado, o app mostra um alerta no topo da aba Jogo com a mensagem pronta para mandar no grupo.</p>`;
  const prox=proximosAvisos();
  if(!prox.length)h+=`<div class="panel empty">Nenhum aviso programado.${A?'<br><br><button class="btn sm" data-act="avisos-padrao">Usar sugestão de agenda</button>':''}</div>`;
  else{h+='<div class="panel"><div class="list">';
    for(const{id,a,when} of prox){const t=AVISOS[a.tipo]||{n:a.tipo,d:''};const past=when<new Date();
      h+=`<div class="item"><div style="width:52px;text-align:center;flex:none"><div style="font-family:var(--f-display);font-weight:800;font-size:18px;line-height:1">${DIAS3[a.dia]}</div><div class="num small">${esc(a.hora)}</div></div>
        <div class="grow"><div class="name">${esc(t.n)}</div><div class="sub">${esc(t.d)} · <span style="${past?'color:var(--red);font-weight:600':''}">${past?'pendente':relTempo(when)}</span></div></div>
        ${A?`<div class="row" style="gap:4px"><button class="btn sm" data-act="msg" data-v="${a.tipo}">Ver</button><button class="btn sm" data-act="edit-aviso" data-a="${id}" aria-label="Editar">✎</button></div>`:''}</div>`}
    h+='</div></div>'}
  if(A){const ina=Object.entries(S.avisos).filter(([,a])=>a.ativo===false);
    if(ina.length)h+=`<div class="panel" style="margin-top:12px"><h3 style="margin-bottom:6px">Pausados</h3><div class="list">${ina.map(([id,a])=>`<div class="item"><div class="grow">${esc(AVISOS[a.tipo]?.n)} · ${DIAS3[a.dia]} ${esc(a.hora)}</div><button class="btn sm" data-act="edit-aviso" data-a="${id}">Editar</button></div>`).join('')}</div></div>`;
    h+=`<div class="panel" style="margin-top:12px"><h3 style="margin-bottom:8px">Mensagens avulsas</h3><div class="pick">${Object.entries(AVISOS).map(([k,v])=>`<button data-act="msg" data-v="${k}">${v.n}</button>`).join('')}<button data-act="msg" data-v="convite">Convite</button></div></div>`}
  return h;
}

/* --- Ranking --- */
function periodo(){const hoje=new Date();if(!UI.ref)UI.ref={y:hoje.getFullYear(),m:hoje.getMonth()+1};const{y,m}=UI.ref,per=UI.per||'mes';
  if(per==='mes'){const ny=m===12?y+1:y,nm2=m===12?1:m+1;return{ini:`${y}-${pad(m)}-01`,fim:`${ny}-${pad(nm2)}-01`,txt:`${MESES[m-1]} ${y}`}}
  if(per==='sem'){const s1=m<=6;return{ini:s1?`${y}-01-01`:`${y}-07-01`,fim:s1?`${y}-07-01`:`${y+1}-01-01`,txt:`${s1?'1º':'2º'} semestre ${y}`}}
  return{ini:`${y}-01-01`,fim:`${y+1}-01-01`,txt:String(y)}}
function navPeriodo(d){const per=UI.per||'mes';let{y,m}=UI.ref;
  if(per==='mes'){m+=d;if(m<1){m=12;y--}if(m>12){m=1;y++}}else if(per==='sem'){m=(m<=6?1:7)+d*6;if(m<1){m=7;y--}if(m>12){m=1;y++}}else y+=d;
  UI.ref={y,m}}
function tRanking(){
  const P=periodo(),{st,total}=estatPeriodo(P.ini,P.fim),rk=UI.rk||'nota';
  const md=id=>st[id].media;
  const filtro={nota:id=>md(id)!=null,g:id=>st[id].g>0,a:id=>st[id].a>0,pr:id=>st[id].mvp+st[id].art+st[id].gar+st[id].gol+st[id].per>0,j:id=>st[id].j>0}[rk];
  const key={nota:id=>md(id),g:id=>st[id].g,a:id=>st[id].a,pr:id=>st[id].mvp*3+st[id].art+st[id].gar+st[id].gol,j:id=>st[id].j}[rk];
  const ids=Object.keys(S.jog).filter(id=>S.jog[id].ativo!==false&&filtro(id)).sort((a,b)=>key(b)-key(a)||st[b].j-st[a].j||nm(a).localeCompare(nm(b)));
  const cols={nota:['Média','J','G','A'],g:['Gols','J','A','Média'],a:['Assist.','J','G','Média'],pr:['🏆','⚽','🅰️','🧤'],j:['Jogos','%','G','A']}[rk];
  const fm=id=>md(id)==null?'—':fmtN(md(id));
  const vals=id=>{const s=st[id];return{nota:[fm(id),s.notas.length,s.g,s.a],g:[s.g,s.j,s.a,fm(id)],a:[s.a,s.j,s.g,fm(id)],pr:[s.mvp,s.art,s.gar,s.gol],j:[s.j,total?Math.round(s.j/total*100):0,s.g,s.a]}[rk]};
  const per=UI.per||'mes';
  let h=`<div class="row between" style="margin-bottom:10px"><h2>Ranking</h2></div>
    <div class="seg" style="margin-bottom:10px" role="group">${[['mes','Mês'],['sem','Semestre'],['ano','Ano']].map(([k,n])=>`<button data-act="per" data-v="${k}" aria-pressed="${per===k}">${n}</button>`).join('')}</div>
    <div class="row between" style="margin-bottom:12px;flex-wrap:nowrap"><button class="btn sm" data-act="per-nav" data-d="-1" aria-label="Período anterior">‹</button><b style="font-family:var(--f-display);font-size:20px;text-transform:uppercase">${P.txt}</b><button class="btn sm" data-act="per-nav" data-d="1" aria-label="Próximo período">›</button></div>
    <div class="pick" style="margin-bottom:12px">${[['nota','Melhor nota'],['g','Artilharia'],['a','Assistências'],['pr','Prêmios'],['j','Presença']].map(([k,n])=>`<button data-act="rk" data-v="${k}" aria-pressed="${rk===k}">${n}</button>`).join('')}</div>
    <div class="panel"><div class="sub" style="margin-bottom:8px">${total} pelada(s) no período · ${rk==='nota'?'média das notas dadas pela galera em cada pelada':rk==='g'||rk==='a'?'inclui ajustes do administrador':''}</div>`;
  if(!ids.length)return h+`<div class="empty">${total?'Ninguém pontuou aqui neste período.':'Nenhuma pelada concluída neste período.'}</div></div>`;
  h+=`<div class="rank"><span></span><span class="h" style="text-align:left">Jogador</span>${cols.map(c=>`<span class="h">${c}</span>`).join('')}`;
  ids.forEach((id,i)=>{const v=vals(id);
    h+=`<div class="line"></div><span class="pos num">${i+1}</span><span style="min-width:0"><span class="name">${esc(nm(id))}</span> <span class="chip p-${S.jog[id].pos}">${S.jog[id].pos}</span></span>${v.map((x,k)=>`<span class="v ${k===0?'hi':''}">${x}</span>`).join('')}`});
  return h+'</div></div>';
}

/* --- Caixa --- */
function tCaixa(A){
  const m=UI.mes||mesAtual(),[y,mm]=m.split('-').map(Number),c=cfg(),cx=S.caixa[m]||{};
  const mensal=ativos().filter(id=>J(id).tipo==='mensalista');
  const pagosM=mensal.filter(id=>(cx.mens||{})[id]);
  const pels=Object.entries(S.pel).filter(([,p])=>p.data.startsWith(m)&&p.status==='encerrada').sort((a,b)=>a[1].data.localeCompare(b[1].data));
  let diariasPagas=0;for(const[,p] of pels)for(const id of jogaram(p))if(J(id).tipo==='diarista'&&(p.diarias||{})[id])diariasPagas++;
  const desp=cx.desp||[],totDesp=sum(desp.map(d=>Number(d.v)||0));
  const ent=pagosM.length*c.mensal+diariasPagas*c.diaria;
  let h=`<div class="row between" style="margin-bottom:10px"><h2>Caixa</h2><div class="row" style="gap:4px"><button class="iconbtn" data-act="mes" data-d="-1" aria-label="Mês anterior">‹</button><b style="min-width:110px;text-align:center">${MESES[mm-1]} ${y}</b><button class="iconbtn" data-act="mes" data-d="1" aria-label="Próximo mês">›</button></div></div>
    <div class="money"><div><span>Entradas</span><b class="num">${BRL(ent)}</b></div><div><span>Saídas</span><b class="num">${BRL(totDesp)}</b></div><div><span>Saldo</span><b class="num" style="color:${ent-totDesp<0?'var(--red)':'var(--pitch)'}">${BRL(ent-totDesp)}</b></div></div>`;
  if(A)h+=`<button class="btn block warn" style="margin-top:12px" data-act="msg" data-v="pagamento" data-m="${m}">Cobrar pendências no WhatsApp</button>`;
  h+=`<div class="panel" style="margin-top:12px"><div class="panel-h"><h3>Mensalidades</h3><span class="sub num">${pagosM.length}/${mensal.length} · ${BRL(c.mensal)}</span></div><div class="list">`;
  if(!mensal.length)h+='<div class="empty">Nenhum mensalista.</div>';
  for(const id of mensal.sort((a,b)=>nm(a).localeCompare(nm(b)))){const ok=(cx.mens||{})[id];
    h+=`<div class="item"><div class="grow name">${esc(nm(id))}</div>${A?`<button class="paid ${ok?'on':''}" data-act="pagou-m" data-m="${m}" data-j="${id}">${ok?'PAGO':'DEVE'}</button>`:`<span class="paid ${ok?'on':''}">${ok?'PAGO':'DEVE'}</span>`}</div>`}
  h+='</div></div>';
  h+=`<div class="panel" style="margin-top:12px"><div class="panel-h"><h3>Diárias</h3><span class="sub">${BRL(c.diaria)} por jogo</span></div>`;
  let any=false;
  for(const[pid,p] of pels){const ds=jogaram(p).filter(id=>J(id).tipo==='diarista');if(!ds.length)continue;any=true;
    h+=`<div class="sub" style="margin-top:8px;font-weight:700">${dShort(p.data)}</div><div class="list">`;
    for(const id of ds){const ok=(p.diarias||{})[id];h+=`<div class="item"><div class="grow name">${esc(nm(id))}</div>${A?`<button class="paid ${ok?'on':''}" data-act="pagou-d" data-p="${pid}" data-j="${id}">${ok?'PAGO':'DEVE'}</button>`:`<span class="paid ${ok?'on':''}">${ok?'PAGO':'DEVE'}</span>`}</div>`}
    h+='</div>'}
  if(!any)h+='<div class="empty">Nenhum diarista jogou neste mês.</div>';
  h+='</div>';
  h+=`<div class="panel" style="margin-top:12px"><div class="panel-h"><h3>Despesas</h3><span class="sub num">${BRL(totDesp)}</span></div><div class="list">`;
  desp.forEach(d=>{h+=`<div class="item"><div class="grow"><div class="name">${esc(d.d)}</div></div><b class="num">${BRL(d.v)}</b>${A?`<button class="btn sm" data-act="del-desp" data-m="${m}" data-id="${d.id}" aria-label="Apagar despesa">✕</button>`:''}</div>`});
  if(!desp.length)h+='<div class="empty">Nenhuma despesa lançada.</div>';
  h+='</div>';
  if(A)h+=`<div class="row" style="margin-top:10px;flex-wrap:nowrap"><input type="text" id="desp-d" placeholder="Aluguel do campo, bola…" class="grow"><input type="number" id="desp-v" placeholder="R$" inputmode="decimal" style="width:90px"><button class="btn primary" data-act="add-desp" data-m="${m}">Lançar</button></div>`;
  return h+'</div>';
}

/* ---------- folhas (sheets) ---------- */
function openSheet(title,body,foot=''){
  document.getElementById('sheet').innerHTML=`<div class="scrim" data-act="close-bg"><div class="sheet" role="dialog" aria-modal="true" aria-label="${esc(title)}"><div class="sheet-h"><h2>${esc(title)}</h2><button class="iconbtn" data-act="close" aria-label="Fechar">✕</button></div><div id="sheet-body">${body}</div>${foot}</div></div>`;
}
function closeSheet(){document.getElementById('sheet').innerHTML='';F=null}
let F=null;

function sheetMsg(tipo,ctx={}){
  const text=msg(tipo,ctx);
  const titulo=tipo==='convite'?'Convite':AVISOS[tipo]?.n||'Mensagem';
  const tel=ctx.jid&&J(ctx.jid).tel?String(J(ctx.jid).tel).replace(/\D/g,''):'';
  const fone=tel?(tel.length<=11?'55'+tel:tel):'';
  MSG_ORIG=text;
  openSheet(titulo,`<div class="row between" style="margin-bottom:6px"><span class="sub">✎ Toque no texto para editar do seu jeito</span><button class="btn sm" data-act="msg-reset">Restaurar texto</button></div>
    <textarea id="msg-text" rows="14" class="num" aria-label="Texto da mensagem, editável">${esc(text)}</textarea>
    <div class="stack" style="margin-top:12px">
      ${ADM()?`<button class="btn primary block" data-act="enviar-app" data-titulo="${esc(titulo)}">Enviar no app para todos</button>`:''}
      <a class="btn block" id="wa-link" target="_blank" rel="noopener" href="https://wa.me/${fone}?text=${encodeURIComponent(text)}">Abrir no WhatsApp${fone?' (direto para '+esc(nm(ctx.jid))+')':''}</a>
      <button class="btn block" data-act="copy">Copiar mensagem</button>
      ${ctx.aviso?`<button class="btn warn block" data-act="aviso-feito" data-a="${ctx.aviso}" data-key="${ctx.key}">Já mandei · tirar o alerta</button>`:''}
      <p class="sub" style="margin:0">"Enviar no app" chega como notificação para cada jogador. O WhatsApp é opcional: abre com o texto daqui, e você escolhe o grupo.</p></div>`);
}
function sheetCfg(){
  const c=cfg();F={restr:(c.restr||[]).slice(),golSorteio:!!c.golSorteio};
  openSheet('Ajustes da pelada',`<div class="stack">
    <label class="field"><span>Nome da pelada</span><input type="text" id="c-nome" value="${esc(c.nome)}"></label>
    <div class="grid2"><label class="field"><span>Dia fixo</span><select id="c-dia">${DIAS.map((d,i)=>`<option value="${i}" ${c.dia==i?'selected':''}>${d}</option>`).join('')}</select></label>
    <label class="field"><span>Início</span><input type="time" id="c-hora" value="${esc(c.hora)}"></label></div>
    <label class="field"><span>Término</span><input type="time" id="c-fim" value="${esc(horaFimDe(null))}"></label>
    <label class="field"><span>Local padrão</span>${selLocais('c-localid',c.localId,'Sem local padrão')}</label>
    <button class="btn sm" data-act="locais">Gerenciar locais</button>
    <div class="grid2"><label class="field"><span>Times por pelada</span><select id="c-times">${[2,3,4].map(n=>`<option ${c.times==n?'selected':''}>${n}</option>`).join('')}</select></label>
    <label class="field"><span>Jogadores de linha por time</span><input type="number" id="c-portime" min="3" max="11" value="${c.porTime}"></label></div>
    <div class="grid2"><label class="field"><span>Mensalidade (R$)</span><input type="number" id="c-mensal" min="0" step="0.01" value="${c.mensal}"></label>
    <label class="field"><span>Diária (R$)</span><input type="number" id="c-diaria" min="0" step="0.01" value="${c.diaria}"></label></div>
    <label class="field"><span>Chave Pix</span><input type="text" id="c-pix" value="${esc(c.pix)}" placeholder="Telefone, e-mail ou chave aleatória"></label>
    <label class="row"><input type="checkbox" id="c-nivelpub" ${c.nivelPublico?'checked':''}> Mostrar o nível da pelada (estrelas) para os jogadores</label>
    <div class="panel"><h3 style="margin-bottom:6px">Convite</h3><div class="sub">Link para a galera entrar na pelada</div><div class="num" style="font-weight:700;word-break:break-all;margin:4px 0">${esc(linkConvite())}</div><div class="sub">Código: <b>${esc((GRUPO||{}).codigo||'')}</b></div>
      <div class="row" style="margin-top:8px"><button class="btn sm" data-act="msg" data-v="convite">Mensagem de convite</button><button class="btn sm" data-act="copiar-link">Copiar link</button><button class="btn sm" data-act="qr-pelada">QR Code</button></div></div>
    <div class="panel"><h3 style="margin-bottom:6px">Administradores</h3><div id="adm-list"></div></div>
    <div class="panel"><h3 style="margin-bottom:4px">Nomes dos times</h3><div class="sub" style="margin-bottom:8px">Deixe em branco para usar o nome da cor.</div>
      <div class="stack" style="gap:8px">${CORES.map((co,i)=>`<label class="row" style="gap:8px;flex-wrap:nowrap"><span class="sw" style="background:${co.c};width:18px;height:18px;border-radius:5px;flex:none;border:1px solid var(--line)"></span><input type="text" id="c-tn${i}" maxlength="24" placeholder="${co.n}" value="${esc((c.nomesTimes||[])[i]||'')}"></label>`).join('')}</div></div>
    <div class="panel"><h3 style="margin-bottom:4px">Avaliação pós-jogo</h3><div class="sub" style="margin-bottom:8px">Depois do término, a galera vota em segredo. Quando fecha, saem as notas, o craque e o pereba.</div>
      <label class="field"><span>Fica aberta por</span><select id="c-janela">${[6,12,24,36,48,72].map(h=>`<option value="${h}" ${janelaH()===h?'selected':''}>${h} horas${h===24?' (padrão)':''}</option>`).join('')}</select></label></div>
    <div class="panel"><h3 style="margin-bottom:4px">Goleiros</h3><div class="sub" style="margin-bottom:8px">O time é formado pelos jogadores de linha. Escolha se o goleiro entra no sorteio.</div>
      <div class="pick" id="gol-pick"><button type="button" data-act="gol-sorteio" data-v="0" aria-pressed="${!c.golSorteio}">Goleiro extra</button><button type="button" data-act="gol-sorteio" data-v="1" aria-pressed="${!!c.golSorteio}">Goleiro no sorteio</button></div>
      <div class="sub" id="gol-txt" style="margin-top:6px">${c.golSorteio?'Cada time recebe um goleiro no sorteio.':'Os goleiros ficam fora do sorteio e jogam como extras.'}</div></div>
    <div class="panel"><h3 style="margin-bottom:4px">Regras do sorteio</h3><div class="sub" style="margin-bottom:8px">Ex.: dois irmãos que não podem cair juntos.</div><div id="restr"></div>
      <div class="grid2" style="margin-top:8px"><select id="r-a"><option value="">Jogador</option>${Object.keys(S.jog).map(id=>`<option value="${id}">${esc(nm(id))}</option>`).join('')}</select>
      <select id="r-b"><option value="">Jogador</option>${Object.keys(S.jog).map(id=>`<option value="${id}">${esc(nm(id))}</option>`).join('')}</select></div>
      <div class="row" style="margin-top:8px"><button class="btn sm" data-act="add-restr" data-v="separar">Separar</button><button class="btn sm" data-act="add-restr" data-v="juntar">Sempre juntos</button></div></div>
    <button class="btn primary block" data-act="save-cfg">Salvar ajustes</button></div>`);
  renderRestr();renderAdmins();
}
function renderRestr(){const el=document.getElementById('restr');if(!el)return;
  el.innerHTML=F.restr.length?F.restr.map((r,i)=>`<div class="item"><div class="grow small"><b>${esc(nm(r.a))}</b> ${r.tipo==='separar'?'separado de':'junto com'} <b>${esc(nm(r.b))}</b></div><button class="btn sm" data-act="del-restr" data-i="${i}" aria-label="Remover regra">✕</button></div>`).join(''):'<div class="sub">Nenhuma regra.</div>'}

function sheetJog(id){
  const j=id?S.jog[id]:null;
  F=j?JSON.parse(JSON.stringify({...j,_id:id})):{nome:'',apelido:'',tel:'',pos:'MEI',pos2:'',tipo:'mensalista',conv:'',crit:{},_id:null};
  openSheet(id?'Editar jogador':'Novo jogador','<div id="jf"></div>');renderJogForm();
}
function renderJogForm(){
  const el=document.getElementById('jf');if(!el)return;
  const cr=critKey(F.pos);
  const ini=notaInicial(F);
  el.innerHTML=`<div class="stack">
    <div class="row" style="gap:12px;flex-wrap:nowrap"><div class="av bg-${F.pos}" style="width:64px;height:64px;font-size:24px;${fotoStyle(F.foto)}">${F.foto?'':esc(initials(F.apelido||F.nome||'?'))}</div>
      <div class="row" style="gap:6px"><label class="btn sm">${F.foto?'Trocar foto':'Adicionar foto'}<input type="file" accept="image/*" id="f-foto" class="vh"></label>${F.foto?'<button class="btn sm" data-act="f-foto-rem">Remover</button>':''}</div></div>
    <div class="dica-foto"><b>📸 Para a foto ficar boa</b><ul><li>De rosto, olhando para a câmera</li><li>Rosto no centro, do peito para cima</li><li>Lugar claro, sem luz atrás de você</li><li>Sem boné ou óculos escuros cobrindo o rosto</li></ul></div>
    <label class="field"><span>Nome</span><input type="text" id="f-nome" data-f="nome" value="${esc(F.nome)}" placeholder="Nome completo"></label>
    <div class="grid2"><label class="field"><span>Apelido</span><input type="text" id="f-apelido" data-f="apelido" value="${esc(F.apelido)}" placeholder="Como chamam no campo"></label>
    <label class="field"><span>WhatsApp</span><input type="tel" id="f-tel" data-f="tel" value="${esc(F.tel)}" placeholder="(81) 99999-9999"></label></div>
    <div class="field"><span>Posição principal</span><div class="pick">${Object.entries(POS).map(([k,n])=>`<button data-act="f-pos" data-v="${k}" aria-pressed="${F.pos===k}">${n}</button>`).join('')}</div></div>
    <label class="field"><span>Também joga de</span><select id="f-pos2" data-f="pos2"><option value="">Só na principal</option>${Object.entries(POS).filter(([k])=>k!==F.pos).map(([k,n])=>`<option value="${k}" ${F.pos2===k?'selected':''}>${n}</option>`).join('')}</select></label>
    <div class="field"><span>Tipo</span><div class="pick"><button data-act="f-tipo" data-v="mensalista" aria-pressed="${F.tipo!=='diarista'}">Mensalista</button><button data-act="f-tipo" data-v="diarista" aria-pressed="${F.tipo==='diarista'}">Diarista</button></div></div>
    <label class="field"><span>Convidado por</span><select id="f-conv" data-f="conv"><option value="">—</option>${Object.keys(S.jog).filter(x=>x!==F._id).map(x=>`<option value="${x}" ${F.conv===x?'selected':''}>${esc(nm(x))}</option>`).join('')}</select></label>
    <div class="panel"><div class="row between"><h3>Avaliação inicial</h3><span class="nota num">${ovr(ini)}</span></div>
      <div class="sub" style="margin:4px 0 6px">${F._id&&encerradas().length?'Base da nota. Depois de cada pelada, a nota se ajusta com as avaliações do jogo.':'Quem convidou dá de 1 a 5 em cada item. Depois de cada pelada, a nota se ajusta com as avaliações do jogo.'}</div>
      ${cr.map(([k,n])=>`<div class="crit"><span>${n}</span><div class="dots">${[1,2,3,4,5].map(v=>`<button data-act="f-crit" data-k="${k}" data-v="${v}" class="${Number(F.crit[k]||3)>=v?'on':''}" aria-label="${n} ${v}">${v}</button>`).join('')}</div></div>`).join('')}</div>
    <button class="btn primary block" data-act="save-jog">${F._id?'Salvar':'Adicionar ao elenco'}</button>
    ${F._id?`<div class="row"><button class="btn grow" data-act="msg" data-v="convite" data-j="${F._id}">Mandar convite</button><button class="btn ${S.jog[F._id]?.ativo===false?'':'danger'} grow" data-act="toggle-ativo" data-j="${F._id}">${S.jog[F._id]?.ativo===false?'Reativar':'Inativar'}</button></div>`:''}</div>`;
}
function sheetVerJog(id){
  const j=J(id),{st}=temporada(UI.ano),s=st[id]||{},A=ADM();
  const hist=historicoNotas(id).slice(0,8).map(x=>[x.pid,S.pel[x.pid],x.n]);
  const mesK=mesAtual(),aj=(j.ajustes||{})[mesK]||{};
  openSheet(nm(id),`<div class="stack">
    <div class="board"><div class="row between"><div><div class="when" style="font-size:56px">${ovr(notaAtual(id))}</div><div class="where">${POS[j.pos]}${j.pos2?' · também '+POS[j.pos2].toLowerCase():''} · ${j.tipo==='diarista'?'Diarista':'Mensalista'}</div></div></div>
    <div class="stats"><div class="stat"><b>${s.j||0}</b><span>Jogos ${UI.ano}</span></div><div class="stat"><b>${s.g||0}</b><span>Gols</span></div><div class="stat"><b>${s.a||0}</b><span>Assist.</span></div><div class="stat"><b>${s.mvp||0}</b><span>Craque</span></div></div></div>
    <div class="panel small"><div class="row between"><span>${j.critGalera?'Base da avaliação da galera':'Nota inicial'}</span><b class="num">${ovr(notaInicial(j))}</b></div>${j.conv?`<div class="row between" style="margin-top:4px"><span>Convidado por</span><b>${esc(nm(j.conv))}</b></div>`:''}<div class="row between" style="margin-top:4px"><span>Confirma pelo app</span><b>${vinculo(id)?'Sim':'Ainda não'}</b></div>${j.tel?`<div class="row between" style="margin-top:4px"><span>WhatsApp</span><b class="num">${esc(j.tel)}</b></div>`:''}
      ${hist.length?`<div style="margin-top:8px"><span class="muted">Últimas notas</span><div class="row" style="margin-top:4px">${hist.map(([,p,n])=>`<span class="chip solid num">${dShort(p.data).slice(4)} · ${fmtN(n)}</span>`).join('')}</div></div>`:''}</div>
    ${A?`<div class="panel"><div class="panel-h"><h3>Ajustar total de ${UI.ano}</h3></div><div class="sub" style="margin-bottom:8px">Corrija gols e assistências que não foram lançados nas peladas. O ajuste entra no mês atual.</div>
      <div class="row" style="gap:16px">${[['g','Gols',s.g||0],['a','Assist.',s.a||0]].map(([f,lbl,v])=>`<div class="stepbox"><div class="step"><button data-act="ajuste" data-j="${id}" data-f="${f}" data-d="-1" aria-label="Menos ${lbl}">−</button><output class="num">${v}</output><button data-act="ajuste" data-j="${id}" data-f="${f}" data-d="1" aria-label="Mais ${lbl}">+</button></div><span class="lbl">${lbl}</span></div>`).join('')}</div>
      ${(s.ajG||s.ajA)?`<div class="sub" style="margin-top:6px">Inclui ajustes do administrador: ${s.ajG>0?'+':''}${s.ajG||0} gol(s) e ${s.ajA>0?'+':''}${s.ajA||0} assist.</div>`:''}</div>`:''}
    ${painelEstrela(id)}
    <button class="btn warn block" data-act="carta" data-j="${id}">Ver carta do jogador</button>
    ${A?`<div class="row"><button class="btn primary grow" data-act="edit-jog" data-j="${id}">Editar</button><button class="btn grow" data-act="msg" data-v="convite" data-j="${id}">Convite</button></div>`:''}</div>`);
}
function sheetAviso(id){
  const a=id?S.avisos[id]:{tipo:'convocacao',dia:(cfg().dia+5)%7,hora:'19:00',ativo:true};
  openSheet(id?'Editar aviso':'Novo aviso',`<div class="stack">
    <label class="field"><span>Mensagem</span><select id="a-tipo">${Object.entries(AVISOS).map(([k,v])=>`<option value="${k}" ${a.tipo===k?'selected':''}>${v.n}</option>`).join('')}</select></label>
    <div class="grid2"><label class="field"><span>Dia</span><select id="a-dia">${DIAS.map((d,i)=>`<option value="${i}" ${a.dia==i?'selected':''}>${d}</option>`).join('')}</select></label>
    <label class="field"><span>Horário</span><input type="time" id="a-hora" value="${esc(a.hora)}"></label></div>
    <label class="row"><input type="checkbox" id="a-ativo" ${a.ativo!==false?'checked':''}> Ativo</label>
    <button class="btn primary block" data-act="save-aviso" data-a="${id||''}">Salvar aviso</button>
    ${id?`<button class="btn danger block" data-act="del-aviso" data-a="${id}">Apagar aviso</button>`:''}</div>`);
}

/* ---------- ações ---------- */
document.addEventListener('click',e=>{
  const b=e.target.closest('[data-act]');if(!b)return;
  const act=b.dataset.act,d=b.dataset;
  if(act==='close-bg'&&e.target!==b)return;
  if(b.tagName==='SELECT')return;
  const A=ADM();
  switch(act){
    case'tab':UI.tab=d.v;UI.sel=null;try{localStorage.setItem('pelada.tab',d.v)}catch(_){};render();window.scrollTo(0,0);break;
    case'sub':UI.sub=d.v;UI.sel=null;UI.confirmEnd=false;render();break;
    case'filtro':UI.filtro=d.v;render();break;
    case'rk':UI.rk=d.v;render();break;
    case'per':UI.per=d.v;render();break;
    case'per-nav':periodo();navPeriodo(Number(d.d));render();break;
    case'hist':UI.showHist=!UI.showHist;render();break;
    case'mes':{const[y,m]=(UI.mes||mesAtual()).split('-').map(Number);const dt=new Date(y,m-1+Number(d.d),1);UI.mes=dt.getFullYear()+'-'+pad(dt.getMonth()+1);render();break}
    case'close':case'close-bg':closeSheet();break;
    case'cfg':if(A)sheetCfg();break;
    case'demo-on':startDemo();break;
    case'demo-off':stopDemo();break;
    case'add-jog':if(A)sheetJog(null);break;
    case'ver-jog':sheetVerJog(d.j);break;
    case'edit-jog':sheetJog(d.j);break;
    case'f-pos':F.pos=d.v;if(F.pos2===d.v)F.pos2='';renderJogForm();break;
    case'f-tipo':F.tipo=d.v;renderJogForm();break;
    case'f-foto-rem':F.foto=null;renderJogForm();break;
    case'f-crit':F.crit[d.k]=Number(d.v);renderJogForm();break;
    case'save-jog':{if(!F.nome.trim()){toast('Coloque o nome do jogador.');document.getElementById('f-nome')?.focus();return}
      const id=F._id||uid('j');const{_id,...data}=F;data.nome=data.nome.trim();data.apelido=(data.apelido||'').trim();
      const crit={};critKey(data.pos).forEach(([k])=>crit[k]=Number(data.crit[k]||3));data.crit=crit;
      if(!_id){data.ativo=true;data.criadoEm=Date.now()}
      const uidM=data._uid;delete data._uid;
      put('jogadores/'+id,data);if(uidM)put('presencas/'+uidM,{...(S.pres[uidM]||{pel:{}}),jogador:id});closeSheet();toast(_id?'Jogador atualizado.':'Jogador adicionado.');break}
    case'toggle-ativo':{const j=S.jog[d.j];put('jogadores/'+d.j,{...j,ativo:j.ativo===false});closeSheet();toast(j.ativo===false?'Jogador reativado.':'Jogador inativado.');break}
    case'nova-pel':{const data=document.getElementById('np-data').value;if(!data){toast('Escolha a data.');return}
      const id='p_'+data+'_'+Math.random().toString(36).slice(2,5);
      const hi=document.getElementById('np-hora').value||cfg().hora;
      put('peladas/'+id,{data,hora:hi,horaFim:document.getElementById('np-fim').value||maisHora(hi,60),localId:UI.npLoc||null,local:(S.locais[UI.npLoc]||{}).nome||'',status:'aberta',resp:{},criadoEm:Date.now()});
      if(UI.npLoc&&S.locais[UI.npLoc])put('locais/'+UI.npLoc,{...S.locais[UI.npLoc],usadoEm:Date.now()});
      UI.npLoc=undefined;UI.npData=UI.npHora=UI.npFim=null;UI.npFimManual=false;UI.sub='presenca';toast('Pelada marcada. Agora é só convocar.');break}
    case'cancel-pel':if(b.dataset.sure){del('peladas/'+d.p);toast('Pelada cancelada.')}else{b.dataset.sure='1';b.textContent='Toque de novo para cancelar';setTimeout(()=>{if(b.isConnected){delete b.dataset.sure;b.textContent='Cancelar esta pelada'}},3500)}break;
    case'rsvp':{const p=S.pel[d.p],cur=respDe(p,d.p)[d.j]?.s;const v=cur===d.v?null:d.v;const before=lista(p,d.p);
      const now=Date.now(),cheia=before.escalados.length>=before.vagas&&J(d.j).pos!=='GOL'&&!before.escalados.includes(d.j);
      patch('peladas/'+d.p,{resp:{[d.j]:{s:v,t:now,esp:v==='sim'&&cheia}},aprov:{[d.j]:v==='sim'&&!cheia?now:null}});
      if(v==='sim'&&cheia)toast(`Lista cheia: ${nm(d.j)} foi para a espera.`);
      eventosPresenca(S.pel[d.p],before,lista(S.pel[d.p],d.p),d.j,cur,v);break}
    case'eu-sou':{const jid=document.getElementById('eu-sou').value;if(!jid){toast('Escolha seu nome na lista.');return}
      if(!myId){toast('Entre na sua conta para confirmar.');return}
      put('presencas/'+myId,{jogador:jid,pel:{}});toast('Pronto! Agora é só confirmar.');break}
    case'eu-trocar':if(myId){del('presencas/'+myId)}break;
    case'eu-vou':{const doc=S.pres[myId];if(!doc)return;const p=S.pel[d.p],prev=respDe(p,d.p)[doc.jogador]?.s||null;
      if(prev===d.v)return;
      const l0=lista(p,d.p),jj=doc.jogador,cheia=d.v==='sim'&&J(jj).pos!=='GOL'&&!l0.escalados.includes(jj)&&l0.escalados.length>=l0.vagas;
      const pel=Object.fromEntries(Object.entries({...(doc.pel||{}),[d.p]:{s:d.v,t:Date.now(),a:prev,esp:cheia}}).sort((x,y)=>x[1].t-y[1].t).slice(-10));
      put('presencas/'+myId,{...doc,pel});toast(d.v!=='sim'?'Resposta enviada: não vai.':(cheia||J(jj).tipo==='diarista')?'Pedido enviado. Agora é só aguardar o administrador liberar.':'Presença confirmada!');break}
    case'como-jogador':document.getElementById('push').hidden=true;PUSH_PRONTO=false;PUSH_VISTOS.clear();UI.comoJogador=!UI.comoJogador;UI.sub='presenca';closeSheet();render();window.scrollTo(0,0);break
    case'notif':sheetNotif();break;
    case'voltar-grupos':if(window.voltarGrupos)window.voltarGrupos();break;
    case'qr-pelada':{const l=linkConvite(),txt=msg('convite');openSheet('Convidar para a pelada',`<div class="stack" style="text-align:center">
      <p class="sub" style="margin:0">Com este QR Code ou link, a pessoa instala o app e <b>já entra na ${esc(cfg().nome)}</b>.</p>
      <div style="background:#fff;padding:14px;border-radius:12px;width:min(100%,300px);margin:0 auto;border:1px solid var(--line)">${window.qrSVG?window.qrSVG(l):''}</div>
      <p class="sub" style="margin:0">Aponte a câmera do celular para o código.</p>
      <div class="num" style="font-weight:700;word-break:break-all">${esc(l)}</div>
      <div class="sub">Código da pelada: <b>${esc((GRUPO||{}).codigo||'')}</b></div>
      <a class="btn primary block" target="_blank" rel="noopener" href="https://wa.me/?text=${encodeURIComponent(txt)}">Enviar convite no WhatsApp</a>
      <button class="btn block" data-act="copiar-link">Copiar link</button>
      ${ADM()?'<button class="btn block" data-act="msg" data-v="convite">Editar a mensagem antes</button>':''}
      <p class="sub" style="margin:0;text-align:left">Quer mandar só o app, sem entrar na pelada? Toque em ‹, depois em <b>Convidar para o app</b>.</p></div>`);break}
    case'copiar-link':{const l=linkConvite();(navigator.clipboard?navigator.clipboard.writeText(l):Promise.reject()).then(()=>toast('Link copiado.'),()=>toast(l));break}
    case'membro-cad':{const m=S.membros[d.u]||{};
      sheetJog(null);F.nome=m.nome||'';F.apelido=m.apelido||'';F.tel=m.tel||'';F.pos=m.pos||'MEI';F.pos2=m.pos2||'';F.tipo=m.prefere==='diarista'?'diarista':'mensalista';F.foto=m.foto||null;F._uid=d.u;renderJogForm();break}
    case'membro-vinc':{const m=S.membros[d.u]||{};const ops=Object.keys(S.jog).filter(id=>!Object.values(S.pres).some(x=>x.jogador===id)).sort((a,b)=>nm(a).localeCompare(nm(b)));
      openSheet('Vincular '+(m.apelido||m.nome||''),`<div class="stack"><p class="sub" style="margin:0">Escolha quem é essa pessoa no elenco. Depois disso, ela confirma presença pelo próprio celular.</p>
        <select id="vinc-sel"><option value="">Jogador do elenco</option>${ops.map(id=>`<option value="${id}">${esc(nm(id))}</option>`).join('')}</select>
        <button class="btn primary block" data-act="membro-vinc-ok" data-u="${d.u}">Vincular</button></div>`);break}
    case'membro-vinc-ok':{const jid=document.getElementById('vinc-sel').value;if(!jid){toast('Escolha o jogador.');return}
      put('presencas/'+d.u,{...(S.pres[d.u]||{pel:{}}),jogador:jid});closeSheet();toast('Vinculado.');break}
    case'adm-add':{const u=document.getElementById('adm-novo').value;if(!u)return;window.mudarAdmins&&window.mudarAdmins([...(GRUPO.admins||[]),u]);break}
    case'adm-rem':window.mudarAdmins&&window.mudarAdmins((GRUPO.admins||[]).filter(x=>x!==d.u));break;
    case'aval-campo':{const v=Number(d.v);
      if(d.q==='adm'){patch('peladas/'+d.p,{avalCampo:{[d.c]:v}});break}
      const doc=S.pres[myId];if(!doc){toast('Escolha seu nome na aba Jogo primeiro.');return}
      const av={...(doc.avalCampo||{})};av[d.p]={...(av[d.p]||{}),[d.c]:v};
      put('presencas/'+myId,{...doc,avalCampo:av});
      if(Object.keys(av[d.p]).length===CRIT_CAMPO.length)toast('Obrigado! Avaliação do campo enviada.');break}
    case'ob-abrir':closeSheet();obAbrir();break;
    case'ob':OB.step=d.v;obRender();break;
    case'ob-sair':obFechar();break;
    case'ob-tipo':OB.tipo=d.v;OB.step=d.v==='campo'?'campo':'perfil';obRender();break;
    case'ob-pos':OB.pos=d.v;obRender();break;
    case'ob-toast':toast(d.v);break;
    case'ob-dono':obFechar();if(!demo)startDemo();sheetDono();break;
    case'ob-entrar':obFechar();if(!demo)startDemo();if((d.v==='jog')!==!!UI.comoJogador){UI.comoJogador=d.v==='jog';PUSH_PRONTO=false;PUSH_VISTOS.clear()}UI.tab='jogo';UI.sub='presenca';render();window.scrollTo(0,0);break;
    case'enviar-app':{const txt=document.getElementById('msg-text').value.trim();if(!txt){toast('A mensagem está vazia.');return}
      const m=S.mural||{items:[]};put('mural/geral',{items:[{id:uid('m'),t:Date.now(),titulo:d.titulo,txt}].concat(m.items||[]).slice(0,30)});
      closeSheet();toast('Enviado no app. Todos os jogadores recebem nas notificações.');break}
    case'tab-jogo':UI.tab='jogo';closeSheet();render();break;
    case'locais':sheetLocais();break;
    case'msg-reset':{const t=document.getElementById('msg-text');t.value=MSG_ORIG;t.dispatchEvent(new Event('input',{bubbles:true}));toast('Texto original restaurado.');break}
    case'trocar-local':abrirSeletor(d.p);break;
    case'lp-abrir':abrirSeletor(d.v);break;
    case'np-rapido':LP={alvo:'np'};usarLocal(d.v);break;
    case'lp-sel':UI.npData=UI.npHora=null;usarLocal(d.v);break;
    case'lp-slot':LP.slot=LP.slot===d.v?null:d.v;renderSeletor();break;
    case'lp-reservar':{const L=S.locais[d.v],k=LP.slot;
      put('locais/'+d.v,{...L,reservas:{...(L.reservas||{}),[k]:{s:'pedido',quem:cfg().nome,t:Date.now()}}});
      UI.npData=k.slice(0,10);UI.npHora=k.slice(11);toast('Pedido de reserva enviado ao dono do campo.');usarLocal(d.v);break}
    case'dono':sheetDono();break;
    case'agenda':sheetAgenda(d.l);break;
    case'add-hor':{const L=S.locais[d.l],i=document.getElementById('h-ini').value,f=document.getElementById('h-fim').value;if(!i||!f||f<=i){toast('O fim precisa ser depois do início.');return}
      put('locais/'+d.l,{...L,horarios:[...(L.horarios||[]),{d:Number(document.getElementById('h-dia').value),i,f}]});sheetAgenda(d.l);toast('Horário adicionado.');break}
    case'del-hor':{const L=S.locais[d.l];put('locais/'+d.l,{...L,horarios:(L.horarios||[]).filter((_,i)=>i!==Number(d.i))});sheetAgenda(d.l);break}
    case'res':{const L=S.locais[d.l],rs={...(L.reservas||{})};if(d.v==='del')delete rs[d.k];else rs[d.k]={...rs[d.k],s:d.v,tr:Date.now()};
      put('locais/'+d.l,{...L,reservas:rs});sheetAgenda(d.l);toast(d.v==='confirmada'?'Reserva confirmada.':d.v==='recusada'?'Reserva recusada.':'Horário liberado.');break}
    case'lp-novo':LP.step='novo';renderSeletor();document.querySelector('.sheet').scrollTop=0;break;
    case'lp-voltar':LP.step='lista';renderSeletor();break;
    case'como-chegar':sheetComoChegar(d.p);break;
    case'lp-salvar':{const f=lerFormLocal();if(!f.nome){toast('Coloque o nome do local.');document.getElementById('l-nome').focus();return}
      const id=uid('l');put('locais/'+id,{...f,usadoEm:Date.now()});guardarNoHistorico(id,f);toast('Local salvo.');setTimeout(()=>usarLocal(id),0);break}
    case'salvar-trocar':{const v=document.getElementById('tl-loc').value;if(!v){toast('Escolha um local salvo ou salve um novo.');return}
      patch('peladas/'+d.p,{localId:v,local:S.locais[v].nome});closeSheet();toast('Local atualizado.');break}
    case'add-local':sheetLocal(null);break;
    case'edit-local':sheetLocal(d.l);break;
    case'save-local':{const f=lerFormLocal();if(!f.nome){toast('Coloque o nome do local.');return}
      const id=d.l||uid('l');if(!d.l)UI.novoLocal=id;put('locais/'+id,{...(d.l?S.locais[d.l]:{}),...f});guardarNoHistorico(id,f);
      closeSheet();toast('Local salvo.');break}
    case'del-local':del('locais/'+d.l);closeSheet();toast('Local apagado.');break;
    case'liberar':{const p=S.pel[d.p],l=lista(p,d.p);
      if(J(d.j).pos!=='GOL'&&l.escalados.length>=l.vagas){toast('Lista cheia. Libere quando abrir uma vaga.');return}
      patch('peladas/'+d.p,{aprov:{[d.j]:Date.now()}});toast(`${nm(d.j)} liberado para jogar.`);break}
    case'pref':{const pr=prefs();pr[d.v]=!pr[d.v];put('config/geral',{...cfg(),...(S.config||{}),notif:pr});
      b.setAttribute('aria-checked',String(pr[d.v]));break}
    case'arte':sheetArtes(d.p);break;
    case'carta':sheetCarta(d.j);break;
    case'salvar-arte':{const a=ARTS[Number(d.i)];if(!a||!dl)return;
      dl.save({filename:a.nome,data:a.blob}).then(r=>{if(r&&r.status==='saved')toast('Imagem pronta.')},e=>{if(e&&e.name!=='AbortError')toast('Não deu para salvar. Toque e segure a imagem.')});break}
    case'sortear':{const T=Number(document.getElementById('nt').value)||cfg().times;const times=sortear(S.pel[d.p],T);UI.sel=null;
      const goleiros=cfg().golSorteio?[]:lista(S.pel[d.p],d.p).gks;
      patch('peladas/'+d.p,{times,goleiros,nTimes:T,vit:times.map(()=>0),sorteadoEm:Date.now()});toast('Times sorteados.');break}
    case'swap':{const p=S.pel[d.p],ti=Number(d.t);
      if(!UI.sel){UI.sel={t:ti,id:d.j};render();break}
      if(UI.sel.id===d.j||UI.sel.t===ti){UI.sel=UI.sel.id===d.j?null:{t:ti,id:d.j};render();break}
      const times=JSON.parse(JSON.stringify(p.times));const A1=UI.sel,B1={t:ti,id:d.j};
      const place=(tm,from,to)=>{if(tm.gk===from)tm.gk=to;else tm.ids=tm.ids.map(x=>x===from?to:x)};
      place(times[A1.t],A1.id,B1.id);place(times[B1.t],B1.id,A1.id);UI.sel=null;
      patch('peladas/'+d.p,{times});break}
    case'stat':{const p=S.pel[d.p],s=p.stats?.[d.j]||{},dl=Number(d.d);let v;
      if(d.f==='n')v=s.n==null?6:Math.min(10,Math.max(0,s.n+dl*.5));else v=Math.max(0,(s[d.f]||0)+dl);
      patch('peladas/'+d.p,{stats:{[d.j]:{[d.f]:v}}});break}
    case'vit':{const p=S.pel[d.p],vit=(p.vit||p.times.map(()=>0)).slice();vit[d.i]=Math.max(0,(vit[d.i]||0)+Number(d.d));patch('peladas/'+d.p,{vit});break}
    case'confirm-end':UI.confirmEnd=d.v==='1';render();break;
    case'encerrar':{const p=S.pel[d.p];UI.confirmEnd=false;UI.sub='presenca';patch('peladas/'+d.p,{status:'encerrada',jogaram:jogaram(p),encerradaEm:Date.now()});toast('Pelada encerrada. Notas atualizadas.');break}
    case'msg':{const ctx={};if(d.p)ctx.pel=S.pel[d.p];if(d.j)ctx.jid=d.j;if(d.m)ctx.mes=d.m;if(d.aviso){ctx.aviso=d.aviso;ctx.key=d.key}sheetMsg(d.v,ctx);break}
    case'copy':{const t=document.getElementById('msg-text');navigator.clipboard?.writeText(t.value).then(()=>toast('Mensagem copiada.'),()=>{t.select();toast('Selecione e copie o texto.')})||(t.select(),toast('Selecione e copie o texto.'));break}
    case'aviso-feito':{const a=S.avisos[d.a];const feitos=Object.fromEntries(Object.entries({...(a.feitos||{}),[d.key]:true}).sort().slice(-12));put('avisos/'+d.a,{...a,feitos});closeSheet();toast('Alerta resolvido.');break}
    case'add-aviso':sheetAviso(null);break;
    case'edit-aviso':sheetAviso(d.a);break;
    case'save-aviso':{const id=d.a||uid('a'),old=d.a?S.avisos[d.a]:{};
      put('avisos/'+id,{...old,tipo:document.getElementById('a-tipo').value,dia:Number(document.getElementById('a-dia').value),hora:document.getElementById('a-hora').value||'09:00',ativo:document.getElementById('a-ativo').checked});closeSheet();toast('Aviso salvo.');break}
    case'del-aviso':del('avisos/'+d.a);closeSheet();toast('Aviso apagado.');break;
    case'avisos-padrao':{const dia=cfg().dia,w=n=>(dia+n+7)%7;
      [['convocacao',w(-4),'09:00'],['cobrar',w(-2),'19:00'],['lista',w(-1),'20:00'],['times',dia,'07:00'],['resultado',dia,'12:00'],['pagamento',1,'10:00']]
        .forEach(([tipo,d2,hora])=>put('avisos/'+uid('a'),{tipo,dia:d2,hora,ativo:true}));toast('Agenda sugerida criada. Ajuste à vontade.');break}
    case'premio':break;
    case'add-restr':{const a=document.getElementById('r-a').value,bb=document.getElementById('r-b').value;if(!a||!bb||a===bb){toast('Escolha dois jogadores diferentes.');return}F.restr.push({a,b:bb,tipo:d.v});renderRestr();break}
    case'del-restr':F.restr.splice(Number(d.i),1);renderRestr();break;
    case'voto':{const doc=S.pres[myId];if(!doc||!doc.jogador||d.j===doc.jogador)return;const v=Number(d.v);
      const p=S.pel[d.p];if(!p||!posAberto(p)){toast('A avaliação desta pelada já fechou.');return}
      const mv=(S.votos||{})[myId]||{},vp={...((mv.v||{})[d.p]||{})};vp[d.j]=vp[d.j]===v?0:v;
      put('votos/'+myId,{jogador:doc.jogador,v:trim10({...(mv.v||{}),[d.p]:vp}),t:Date.now()});break}
    case'ajuste':{const j=S.jog[d.j];if(!j)return;const k=mesAtual(),cur={...((j.ajustes||{})[k]||{})};
      const{st}=temporada(UI.ano);if(Number(d.d)<0&&(st[d.j][d.f]||0)<=0)return;
      cur[d.f]=(cur[d.f]||0)+Number(d.d);put('jogadores/'+d.j,{...j,ajustes:{...(j.ajustes||{}),[k]:cur}});sheetVerJog(d.j);break}
    case'av-admin':UI.avSel=null;sheetAvAdmin();break;
    case'av-tog':{UI.avSel.has(d.j)?UI.avSel.delete(d.j):UI.avSel.add(d.j);const sc=document.querySelector('.sheet').scrollTop;sheetAvAdmin();document.querySelector('.sheet').scrollTop=sc;break}
    case'av-sel':{const ids=ativos();UI.avSel=new Set(d.v==='todos'?ids:d.v==='novos'?ids.filter(x=>!S.jog[x].critGalera):[]);const sc=document.querySelector('.sheet').scrollTop;sheetAvAdmin();document.querySelector('.sheet').scrollTop=sc;break}
    case'av-criar':{if(!UI.avSel||!UI.avSel.size)return;const dias=Number(document.getElementById('av-prazo').value)||3,rid=uid('r');
      put('avaliacoes/'+rid,{criadoEm:Date.now(),fim:Date.now()+dias*864e5,alvos:[...UI.avSel],status:'aberta'});UI.avSel=null;closeSheet();toast('Avaliação aberta! A galera já pode avaliar.');break}
    case'av-encerrar':fecharRodada(d.r);closeSheet();toast('Avaliação encerrada. Estrelas e notas atualizadas.');break;
    case'av-cancelar':if(b.dataset.sure){const r=S.avals[d.r];put('avaliacoes/'+d.r,{...r,status:'cancelada'});closeSheet();toast('Avaliação cancelada.')}else{b.dataset.sure='1';b.textContent='Toque de novo para cancelar'}break;
    case'av-abrir':UI.avi=0;{const ra=rodadaAberta();if(ra){const mv=meusAv(ra[0]),ids=paraMimAvaliar(ra[1]);const i=ids.findIndex(x=>!feitoAv(x,mv[x]));UI.avi=i<0?0:i}}sheetAvaliar();break;
    case'av-ir':UI.avi=Number(d.v);sheetAvaliar();document.querySelector('.sheet').scrollTop=0;break;
    case'av-voto':{const v=Number(d.v);votarAv(d.j,cur=>{const n={...cur};delete n.ns;n[d.c]=n[d.c]===v?0:v;return n});sheetAvaliar();break}
    case'av-ns':votarAv(d.j,cur=>cur.ns?{}:{ns:true});sheetAvaliar();break;
    case'time-nome':{const cor=Number(d.c);openSheet('Nome do time',`<div class="stack"><div class="row" style="gap:8px;flex-wrap:nowrap"><span class="sw" style="background:${CORES[cor].c};width:22px;height:22px;border-radius:6px;flex:none;border:1px solid var(--line)"></span><input type="text" id="tn-in" maxlength="24" placeholder="${CORES[cor].n}" value="${esc((cfg().nomesTimes||[])[cor]||'')}"></div>
      <p class="sub" style="margin:0">Ex.: Cobra, Lagartixa. Em branco volta a ser "${CORES[cor].n}". Vale para as próximas peladas também.</p><button class="btn primary block" data-act="time-nome-ok" data-c="${cor}">Salvar nome</button></div>`);setTimeout(()=>document.getElementById('tn-in')?.focus(),50);break}
    case'time-nome-ok':{const cor=Number(d.c),v=document.getElementById('tn-in').value.trim(),arr=CORES.map((_,i)=>(cfg().nomesTimes||[])[i]||'');arr[cor]=v;
      put('config/geral',{...(S.config||{}),nomesTimes:arr});closeSheet();toast('Nome do time salvo.');break}
    case'notas-pel':sheetNotasPelada(d.p);break;
    case'voto-abrir':UI.votoAberto=UI.votoAberto===d.p?null:d.p;render();break;
    case'lanc-step':{const doc=S.pres[myId]||{},L=(doc.lanc||{})[d.p],ap=(S.pel[d.p].stats||{})[doc.jogador]||{};
      UI.lanc=UI.lanc||{};const r=UI.lanc[d.p]||{g:L?L.g:(ap.g||0),a:L?L.a:(ap.a||0)};r[d.f]=Math.max(0,Math.min(30,(r[d.f]||0)+Number(d.d)));UI.lanc[d.p]=r;render();break}
    case'lanc-enviar':{const doc=S.pres[myId];if(!doc||!doc.jogador)return;const L=(doc.lanc||{})[d.p],ap=(S.pel[d.p].stats||{})[doc.jogador]||{};
      const r=(UI.lanc&&UI.lanc[d.p])||{g:L?L.g:(ap.g||0),a:L?L.a:(ap.a||0)};
      put('presencas/'+myId,{...doc,lanc:trim10({...(doc.lanc||{}),[d.p]:{g:r.g||0,a:r.a||0,t:Date.now()}})});if(UI.lanc)delete UI.lanc[d.p];
      toast('Enviado! Agora um administrador precisa aprovar.');break}
    case'lanc-ok':{const doc=S.pres[d.u],L=doc&&doc.lanc&&doc.lanc[d.p];if(!L||!doc.jogador)return;
      patch('peladas/'+d.p,{stats:{[doc.jogador]:{g:L.g||0,a:L.a||0}},lancOk:{[d.u]:L.t}});toast(`Números de ${nm(doc.jogador)} aprovados.`);break}
    case'lanc-rec':{const doc=S.pres[d.u],L=doc&&doc.lanc&&doc.lanc[d.p];if(!L)return;patch('peladas/'+d.p,{lancRec:{[d.u]:L.t}});toast('Lançamento recusado.');break}
    case'gol-sorteio':{F.golSorteio=d.v==='1';document.querySelectorAll('#gol-pick button').forEach(x=>x.setAttribute('aria-pressed',String(x.dataset.v===d.v)));
      document.getElementById('gol-txt').textContent=F.golSorteio?'Cada time recebe um goleiro no sorteio.':'Os goleiros ficam fora do sorteio e jogam como extras.';break}
    case'save-cfg':{const g=id=>document.getElementById(id).value;
      put('config/geral',{...(S.config||{}),nome:g('c-nome').trim()||DEF_CFG.nome,dia:Number(g('c-dia')),hora:g('c-hora')||'08:00',horaFim:g('c-fim')||maisHora(g('c-hora')||'08:00',60),localId:g('c-localid')||null,local:(S.locais[g('c-localid')]||{}).nome||'',times:Number(g('c-times')),porTime:Math.max(3,Math.min(11,Number(g('c-portime'))||5)),mensal:Number(g('c-mensal'))||0,diaria:Number(g('c-diaria'))||0,pix:g('c-pix').trim(),nivelPublico:document.getElementById('c-nivelpub').checked,golSorteio:F.golSorteio,janelaAval:Number(g('c-janela'))||24,nomesTimes:CORES.map((_,i)=>g('c-tn'+i).trim()),restr:F.restr});
      if(window.sincronizarGrupo)window.sincronizarGrupo({nome:g('c-nome').trim()||DEF_CFG.nome,dia:Number(g('c-dia')),hora:g('c-hora')||'08:00'});
      closeSheet();toast('Ajustes salvos.');break}
    case'pagou-m':{const cx=S.caixa[d.m]||{mens:{},desp:[]};put('caixa/'+d.m,{...cx,mens:{...(cx.mens||{}),[d.j]:!(cx.mens||{})[d.j]}});break}
    case'pagou-d':{const p=S.pel[d.p];patch('peladas/'+d.p,{diarias:{[d.j]:!(p.diarias||{})[d.j]}});break}
    case'add-desp':{const ds=document.getElementById('desp-d').value.trim(),v=Number(String(document.getElementById('desp-v').value).replace(',','.'));
      if(!ds||!v){toast('Coloque a descrição e o valor.');return}const cx=S.caixa[d.m]||{mens:{},desp:[]};
      put('caixa/'+d.m,{...cx,desp:[...(cx.desp||[]),{id:uid('d'),d:ds,v}]});break}
    case'del-desp':{const cx=S.caixa[d.m];put('caixa/'+d.m,{...cx,desp:cx.desp.filter(x=>x.id!==d.id)});break}
  }
});
document.addEventListener('change',e=>{
  if(e.target.dataset&&e.target.dataset.np)guardarNp(e.target);
  const t=e.target;
  if(t.dataset.act==='cmp'){UI.cmp=t.value||null;const sc=document.querySelector('.sheet').scrollTop;sheetVerJog(t.dataset.j);document.querySelector('.sheet').scrollTop=sc}
  if(t.dataset.act==='premio'){patch('peladas/'+t.dataset.p,{premios:{[t.dataset.f]:t.value||null}})}
  if(t.dataset.act==='ano'){UI.ano=Number(t.value);render()}
  if(t.id==='f-foto'&&t.files&&t.files[0]&&F){toast('Preparando a foto…');window.redimFoto(t.files[0]).then(d=>{F.foto=d;renderJogForm()},()=>toast('Não consegui abrir essa foto. Tente outra.'))}
  if(t.dataset.f&&F){F[t.dataset.f]=t.value}
});
document.addEventListener('input',e=>{
  const t=e.target;
  if(t.dataset.in==='busca'){UI.busca=t.value;render()}
  if(t.dataset.f&&F)F[t.dataset.f]=t.value;
  if(t.dataset.mapa)atualizarPrevia(t);
  if(t.dataset.np)guardarNp(t);
  if(t.id==='msg-text'){const a=document.getElementById('wa-link');if(a)a.href=a.href.split('?')[0]+'?text='+encodeURIComponent(t.value)}
});
document.addEventListener('keydown',e=>{if(e.key!=='Escape')return;if(document.getElementById('sheet').innerHTML)closeSheet();else if(!document.getElementById('ob').hidden)obFechar()});
setInterval(()=>{if(!document.getElementById('sheet').innerHTML&&document.activeElement?.tagName!=='INPUT')render()},60000);


/* ---------- primeiro acesso (simulação, nada é salvo) ---------- */
let OB={step:'boas',pos:'MEI',tipo:'organizar'};
function obAbrir(){OB={step:'boas',pos:'MEI',tipo:'organizar'};document.getElementById('ob').hidden=false;obRender()}
function obFechar(){document.getElementById('ob').hidden=true}
function obRender(){
  const el=document.getElementById('ob'),st=OB.step;
  const top=(back)=>`<div class="ob-top">${back?`<button class="btn sm" data-act="ob" data-v="${back}">‹ Voltar</button>`:'<span></span>'}<span class="ob-sim">Simulação</span><button class="btn sm" data-act="ob-sair">Sair</button></div>`;
  const prog=(n,t)=>`<div class="ob-prog">${Array.from({length:t},(_,i)=>`<i class="${i<n?'on':''}"></i>`).join('')}</div>`;
  let h='';
  if(st==='boas')h=top()+`<div class="ob-hero"><div class="ob-logo">Pelada<br><span>FC</span></div><p>Organize a pelada, sorteie times equilibrados e acompanhe quem é o craque da galera.</p></div>
    <button class="btn primary block" data-act="ob" data-v="criar">Criar conta</button>
    <button class="btn block" data-act="ob" data-v="login">Já tenho conta</button>
    <div class="ob-div">ou</div>
    <button class="btn block" data-act="ob" data-v="convite">Recebi um convite</button>`;
  if(st==='login')h=top('boas')+`<h2>Entrar</h2><p class="lead">Bem-vindo de volta.</p>
    <button class="btn block ob-google" data-act="ob" data-v="minhas">Continuar com o Google</button>
    <div class="ob-div">ou com e-mail</div>
    <label class="field"><span>E-mail</span><input type="text" id="ob-email" inputmode="email" placeholder="seu@email.com"></label>
    <label class="field"><span>Senha</span><input type="password" id="ob-senha" placeholder="••••••••"></label>
    <button class="ob-link" data-act="ob-toast" data-v="Enviaríamos um link para criar uma nova senha.">Esqueci minha senha</button>
    <button class="btn primary block" data-act="ob" data-v="minhas">Entrar</button>
    <p class="sub" style="text-align:center">Não tem conta? <button class="ob-link" data-act="ob" data-v="criar">Criar conta</button></p>`;
  if(st==='criar')h=top('boas')+prog(1,3)+`<h2>Criar conta</h2><p class="lead">Leva menos de um minuto.</p>
    <button class="btn block ob-google" data-act="ob" data-v="escolha">Continuar com o Google</button>
    <div class="ob-div">ou com e-mail</div>
    <label class="field"><span>Nome</span><input type="text" id="ob-nome" placeholder="Seu nome completo"></label>
    <label class="field"><span>E-mail</span><input type="text" id="ob-email2" inputmode="email" placeholder="seu@email.com"></label>
    <label class="field"><span>Senha</span><input type="password" id="ob-senha2" placeholder="Mínimo de 8 caracteres"></label>
    <button class="btn primary block" data-act="ob" data-v="escolha">Continuar</button>
    <p class="sub" style="text-align:center;margin:0">Ao continuar, você aceita os Termos de uso e a Política de privacidade.</p>`;
  if(st==='escolha')h=top('criar')+prog(2,3)+`<h2>O que você quer fazer?</h2><p class="lead">Dá para fazer as duas coisas depois. Escolha por onde começar.</p>
    <button class="ob-opt" data-act="ob-tipo" data-v="organizar"><span class="ic">📋</span><span class="grow"><b>Organizar uma pelada</b><span class="sub">Crie a pelada, convide a galera e vire o administrador.</span></span></button>
    <button class="ob-opt" data-act="ob-tipo" data-v="jogar"><span class="ic">⚽</span><span class="grow"><b>Jogar numa pelada</b><span class="sub">Recebeu um convite? Entre com o link ou o código.</span></span></button>
`;
  if(st==='perfil'){const pos=OB.pos;h=top('escolha')+prog(3,3)+`<h2>Seu perfil de jogador</h2><p class="lead">É assim que a galera vai te ver.</p>
    <label class="field"><span>Apelido</span><input type="text" id="ob-ap" placeholder="Como te chamam no campo"></label>
    <label class="field"><span>WhatsApp</span><input type="tel" id="ob-tel" placeholder="(81) 99999-9999"></label>
    <div class="field"><span>Posição principal</span><div class="pick">${Object.entries(POS).map(([k,n])=>`<button data-act="ob-pos" data-v="${k}" aria-pressed="${pos===k}">${n}</button>`).join('')}</div></div>
    <p class="sub" style="margin:0">Sua nota inicial é dada por quem te convidou. Se você já joga em outra pelada do app, pode compartilhar sua nota depois.</p>
    <button class="btn primary block" data-act="ob" data-v="${OB.tipo==='organizar'?'nova':'convite'}">Continuar</button>`}
  if(st==='convite')h=top(OB.tipo==='jogar'?'perfil':'boas')+`<h2>Você foi convidado!</h2>
    <div class="ob-inv"><div class="h"><span class="sub" style="color:inherit;opacity:.85">Felipe te convidou para</span><b>Pelada do Sábado</b></div>
    <div class="b"><div>📅 Todo sábado, 08:00</div><div>📍 Arena Boa Viagem · Recife</div><div>👥 20 jogadores · mensal R$ 80 ou diária R$ 20</div><div class="nivel">${starsHTML(3)} Nível 3 de 5</div></div></div>
    <label class="field"><span>Entrar como</span><div class="pick"><button data-act="ob-toast" data-v="Mensalista: entra direto na lista quando tem vaga." aria-pressed="true">Mensalista</button><button data-act="ob-toast" data-v="Diarista: o administrador libera sua vaga a cada pelada.">Diarista</button></div></label>
    <label class="row"><input type="checkbox" id="ob-share"> Compartilhar minha nota com o administrador</label>
    <button class="btn primary block" data-act="ob" data-v="${OB.tipo==='jogar'?'minhas':'criar'}">${OB.tipo==='jogar'?'Aceitar convite':'Criar conta para aceitar'}</button>
    <p class="sub" style="margin:0">Sem um link? <button class="ob-link" data-act="ob-toast" data-v="O jogador poderia digitar o código de 6 letras da pelada.">Digitar código da pelada</button></p>`;
  if(st==='nova')h=top('perfil')+`<h2>Criar sua pelada</h2><p class="lead">Depois você ajusta tudo nos Ajustes.</p>
    <label class="field"><span>Nome da pelada</span><input type="text" id="ob-pn" value="Pelada do Sábado"></label>
    <div class="grid2"><label class="field"><span>Dia fixo</span><select id="ob-pd">${DIAS.map((d,i)=>`<option ${i===6?'selected':''}>${d}</option>`).join('')}</select></label>
    <label class="field"><span>Horário</span><input type="time" id="ob-ph" value="08:00"></label></div>
    <div class="field"><span>Onde?</span><button class="btn block" data-act="ob-toast" data-v="Aqui você escolhe um local que já usou ou cadastra um novo.">📍 Escolher o local</button></div>
    <div class="grid2"><label class="field"><span>Times</span><select id="ob-pt"><option>2</option><option>3</option><option>4</option></select></label>
    <label class="field"><span>Jogadores de linha por time</span><input type="number" id="ob-pp" value="5" min="3" max="11"></label></div>
    <div class="grid2"><label class="field"><span>Mensalidade (R$)</span><input type="number" id="ob-pm" value="80"></label><label class="field"><span>Diária (R$)</span><input type="number" id="ob-pdi" value="20"></label></div>
    <button class="btn primary block" data-act="ob" data-v="convidar">Criar pelada</button>`;
  if(st==='convidar')h=top('nova')+`<h2>Chame a galera</h2><p class="lead">Mande o link no grupo. Cada um cria a conta e entra direto na sua pelada.</p>
    <div class="ob-inv"><div class="h"><b>Pelada do Sábado</b></div><div class="b"><div class="sub">Link de convite</div><div class="num" style="font-weight:700;word-break:break-all">peladafc.app/c/SAB8H2</div><div class="sub">Código: <b>SAB8H2</b></div></div></div>
    <button class="btn block" data-act="ob-toast" data-v="Abriria o WhatsApp com o convite pronto.">Enviar convite no WhatsApp</button>
    <button class="btn block" data-act="ob-toast" data-v="Link copiado (simulação).">Copiar link</button>
    <button class="btn primary block" data-act="ob" data-v="minhas">Ir para minhas peladas</button>`;
  if(st==='minhas')h=top()+`<h2>Minhas peladas</h2><p class="lead">Olá! Escolha uma pelada para abrir.</p>
    <div class="sub" style="font-weight:700">ADMINISTRO</div>
    <button class="ob-pel" data-act="ob-entrar" data-v="adm"><div class="av bg-MEI">PS</div><span class="grow"><b>Pelada do Sábado</b><span class="sub">Sábado 08:00 · Arena Boa Viagem</span></span><span class="badge2">ADMIN</span></button>
    <div class="sub" style="font-weight:700">JOGO</div>
    <button class="ob-pel" data-act="ob-entrar" data-v="jog"><div class="av bg-ATA">RA</div><span class="grow"><b>Racha dos Amigos</b><span class="sub">Quarta 20:00 · Quadra do Bairro · você confirmou</span></span><span class="badge2 j">JOGADOR</span></button>
    <button class="btn block" data-act="ob" data-v="nova">+ Criar outra pelada</button>
    <button class="btn block" data-act="ob" data-v="convite">Entrar com convite</button>
    <p class="sub" style="margin:0">Abrir uma pelada leva para a tela que você já conhece, como administrador ou como jogador.</p>`;
  el.innerHTML=`<div class="ob-in">${h}</div>`;el.scrollTop=0;
}

/* ---------- demonstração ---------- */
function startDemo(){
  REAL=S;demo=true;REAL_ID=myId;myId='demo-me';
  const nomes=[['Tiago Moura','Goleiro','GOL',''],['Ronaldo Sá','Rato','GOL',''],['André Lima','Dedé','ZAG','MEI'],['Bruno Paiva','','ZAG',''],['Caio Rocha','Caio','ZAG',''],['Diego Alves','Alemão','ZAG','MEI'],['Edson Cruz','Didi','MEI',''],['Felipe Nunes','Lipe','MEI','ATA'],['Gustavo Reis','Gugu','MEI',''],['Heitor Melo','','MEI','ZAG'],['Igor Santos','Igão','MEI',''],['João Pedro','JP','ATA',''],['Kauã Ferraz','','ATA','MEI'],['Lucas Brito','Luquinha','ATA',''],['Marcos Vidal','Marquinhos','ATA',''],['Nando Costa','Nandinho','ZAG',''],['Otávio Leal','Tavinho','MEI',''],['Paulo Dias','Paulão','ZAG',''],['Rafael Gil','Rafa','ATA','MEI'],['Sérgio Lins','Serginho','MEI',''],['Vitor Hugo','VH','ATA',''],['Wesley Teles','Wes','MEI','ATA']];
  const jog={};const r=s=>{let x=Math.sin(s)*1e4;return x-Math.floor(x)};
  nomes.forEach(([n,a,pos,pos2],i)=>{const crit={};critKey(pos).forEach(([k],ki)=>crit[k]=1+Math.floor(r(i*7+ki)*5));
    jog['d'+i]={nome:n,apelido:a,pos,pos2,tipo:i%5===4?'diarista':'mensalista',crit,ativo:true,tel:''}});
  const hoje=new Date(),prox=proximaData(),pass=new Date(parseD(prox));pass.setDate(pass.getDate()-7);
  const resp={};Object.keys(jog).forEach((id,i)=>{if(i<17)resp[id]={s:'sim',t:1000+i};else if(i<19)resp[id]={s:'nao',t:2000}});
  const ids=Object.keys(jog),stats={};ids.slice(0,14).forEach((id,i)=>stats[id]={n:5+Math.round(r(i+50)*8)/2,g:jog[id].pos==='ATA'?Math.floor(r(i+9)*3):0,a:jog[id].pos==='MEI'?Math.floor(r(i+3)*3):0});
  const mes=iso(hoje).slice(0,7);
  S={config:{...DEF_CFG,nome:'Pelada do Sábado',local:'Arena Boa Viagem',localId:'l1',pix:'(81) 99999-0000'},jog,
    locais:{l1:{nome:'Arena Boa Viagem',end:'Boa Viagem',uf:'PE',cidade:'Recife',tipo:'Society',valor:200,mapa:'',obs:'Exemplo',usadoEm:2,tel:'(81) 99999-1111'},l2:{nome:'Quadra do Bairro',end:'Casa Amarela',uf:'PE',cidade:'Recife',tipo:'Quadra',valor:120,mapa:'',obs:'Exemplo',usadoEm:1},l3:{nome:'Society da Praia',end:'Casa Caiada',uf:'PE',cidade:'Olinda',tipo:'Society',valor:150,mapa:'',obs:'Exemplo'}},
    pel:{p_demo1:{data:iso(pass),hora:'08:00',localId:'l1',local:'Arena Boa Viagem',encerradaEm:Date.now()-5*864e5,avalCampo:{gram:4,atend:5,amb:4,banh:3,tam:4},status:'encerrada',jogaram:ids.slice(0,14),stats,premios:{mvp:'d11',art:'d11',gar:'d7',gol:'d0'},diarias:{d4:true}},
         p_demo2:{data:prox,hora:'08:00',local:'Arena Boa Viagem',localId:'l1',status:'aberta',resp,criadoEm:Date.now()-26*36e5}},
    caixa:{[mes]:{mens:{d0:true,d1:true,d2:true,d3:true,d5:true,d6:true,d7:true},desp:[{id:'x1',d:'Aluguel do campo',v:400},{id:'x2',d:'Bola nova',v:120}]}},
    avisos:{a1:{tipo:'convocacao',dia:2,hora:'09:00',ativo:true},a2:{tipo:'cobrar',dia:4,hora:'19:00',ativo:true},a3:{tipo:'lista',dia:5,hora:'20:00',ativo:true},a4:{tipo:'times',dia:6,hora:'07:00',ativo:true}},
    mural:{items:[{id:'m1',t:Date.now()-3*36e5,titulo:'Recado do administrador',txt:'Galera, sábado tem pelada na Arena Boa Viagem às 8h. Chegar 15 min antes para dividir os coletes. Quem ainda não confirmou, confirma no app!'}]},
    feed:{visto:0,items:[{id:'e2',tipo:'confirmou',texto:`Lipe confirmou presença (16/10) · ${dShort(prox)}`,t:Date.now()-36e5},{id:'e1',tipo:'desistiu',texto:`Alemão desistiu · ${dShort(prox)}`,t:Date.now()-72e5}]}};
  S.votos={};S.avals={};S.membros=S.membros||{};
  S.pres={'demo-x':{jogador:'d8',pel:{p_demo2:{s:'sim',t:Date.now()-18e5,a:null}},avalCampo:{p_demo1:{gram:3,atend:4,amb:5,banh:2,tam:4}}},'demo-w':{jogador:'d5',pel:{},avalCampo:{p_demo1:{gram:4,atend:4,amb:4,banh:3,tam:5}}},'demo-y':{jogador:'d19',pel:{p_demo2:{s:'sim',t:Date.now()-6e5,a:null}}}};
  UI.tab='jogo';UI.sub='presenca';render();window.scrollTo(0,0);
}
function stopDemo(){if(!REAL||!db){if(window.voltarGrupos)window.voltarGrupos();return}demo=false;myId=REAL_ID;S=REAL||{config:null,jog:{},pel:{},caixa:{},avisos:{},feed:null,pres:{},locais:{},mural:null};UI.comoJogador=false;REAL=null;render()}

/* ---------- conexão com o banco (Firebase via app.js) ---------- */
window.iniciarPelada=function(ctx){
  window.pararPelada();
  S={config:null,jog:{},pel:{},caixa:{},avisos:{},feed:null,pres:{},locais:{},mural:null,membros:{},votos:{},avals:{}};
  demo=false;REAL=null;ready=false;loaded=0;db=ctx.db;myId=ctx.uid;isAdmin=!!ctx.isAdmin;dl=ctx.dl||null;GRUPO=ctx.grupo;GID=ctx.gid;
  UI.tab='jogo';UI.sub='presenca';UI.npLoc=undefined;UI.comoJogador=false;PUSH_PRONTO=false;PUSH_VISTOS.clear();
  closeSheet();render();window.scrollTo(0,0);
  const N=11;const done=()=>{if(++loaded===N){ready=true;render()}};
  const onErr=e=>{console.warn(e);toast('Não foi possível carregar os dados. Verifique a internet.')};
  const one=(path,key)=>{let first=true;db.doc(path).onSnapshot(snap=>{const tgt=demo?REAL:S;tgt[key]=snap.exists?snap.data():null;if(first){first=false;done()}else if(!demo)render()},e=>{onErr(e);if(first){first=false;done()}})};
  const live=(name,key)=>{let first=true;db.collection(name).onSnapshot(snap=>{
    const m={};snap.docs.forEach(x=>m[x.id]=x.data());const tgt=demo?REAL:S;tgt[key]=withPending(name,m);
    if(first){first=false;done()}else if(!demo)render()},e=>{onErr(e);if(first){first=false;done()}})};
  one('eventos/feed','feed');one('config/geral','config');one('mural/geral','mural');
  live('jogadores','jog');live('peladas','pel');live('caixa','caixa');live('avisos','avisos');live('presencas','pres');live('locais','locais');live('membros','membros');live('avaliacoes','avals');
  ouvirVotos();
};
// votos: o administrador lê todos (para apurar quando a avaliação fecha); o jogador lê só os dele
let unsubVotos=null;
function ouvirVotos(){if(unsubVotos){try{unsubVotos()}catch(e){}unsubVotos=null}if(!db||demo)return;S.votosOk=false;
  const fim=()=>{S.votosOk=true;render()};
  if(isAdmin)unsubVotos=db.collection('votos').onSnapshot(snap=>{const m={};snap.docs.forEach(x=>m[x.id]=x.data());S.votos=withPending('votos',m);fim()},e=>console.warn(e));
  else unsubVotos=db.doc('votos/'+myId).onSnapshot(snap=>{S.votos={...(S.votos||{}),[myId]:snap.exists?snap.data():undefined};if(!snap.exists)delete S.votos[myId];fim()},e=>console.warn(e))}
window.pararPelada=function(){if(db&&db.unsubs)db.unsubs.splice(0).forEach(u=>{try{u()}catch(e){}});db=null;ready=false;demo=false;REAL=null};
window.atualizarGrupo=function(g){GRUPO=g;const adm=!!(g&&(g.admins||[]).includes(myId));if(adm!==isAdmin){isAdmin=adm;ouvirVotos();if(!adm&&['avisos','caixa'].includes(UI.tab))UI.tab='jogo'}render();renderAdmins()};
window.abrirDemo=function(){window.pararPelada();S={config:null,jog:{},pel:{},caixa:{},avisos:{},feed:null,pres:{},locais:{},mural:null,membros:{},votos:{},avals:{}};myId=null;isAdmin=true;GRUPO={codigo:'DEMO01',admins:[]};ready=true;startDemo()};
