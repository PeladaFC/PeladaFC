/* Pelada FC · casca do app: login, Minhas peladas, criar e entrar por convite.
   Liga o núcleo (core.js) ao Firebase. Com ?mock=1 usa um banco de teste na memória. */

const firebaseConfig = {
  apiKey: "AIzaSyAdKtmbVmdYgqoUJt9-v-sXv5eybznMg2M",
  authDomain: "pelada-fc-990d6.firebaseapp.com",
  projectId: "pelada-fc-990d6",
  storageBucket: "pelada-fc-990d6.firebasestorage.app",
  messagingSenderId: "249043067298",
  appId: "1:249043067298:web:4105a403e6a12440a212fb"
};
const FB = 'https://www.gstatic.com/firebasejs/10.12.2/';
const MOCK = new URLSearchParams(location.search).has('mock');

/* ================= Backend ================= */
let B;
async function backendReal() {
  const [{ initializeApp }, A, F] = await Promise.all([
    import(FB + 'firebase-app.js'), import(FB + 'firebase-auth.js'), import(FB + 'firebase-firestore.js')
  ]);
  const app = initializeApp(firebaseConfig);
  const auth = A.getAuth(app);
  auth.languageCode = 'pt';
  const fs = F.initializeFirestore(app, { ignoreUndefinedProperties: true });
  const ref = p => F.doc(fs, p);
  const erro = e => { const err = new Error(e.message); err.code = (e.code || '').replace(/^(auth|firestore)\//, ''); throw err; };
  return {
    onAuth: cb => A.onAuthStateChanged(auth, u => cb(u ? { uid: u.uid, nome: u.displayName || '', email: u.email || '' } : null)),
    login: (e, s) => A.signInWithEmailAndPassword(auth, e, s).catch(erro),
    cadastrar: async (nome, e, s) => { const c = await A.createUserWithEmailAndPassword(auth, e, s).catch(erro); await A.updateProfile(c.user, { displayName: nome }); return c; },
    google: async () => {
      const prov = new A.GoogleAuthProvider();
      try { return await A.signInWithPopup(auth, prov); }
      catch (e) { if (['auth/popup-blocked', 'auth/operation-not-supported-in-this-environment', 'auth/cancelled-popup-request'].includes(e.code)) return A.signInWithRedirect(auth, prov); erro(e); }
    },
    reset: e => A.sendPasswordResetEmail(auth, e).catch(erro),
    sair: () => A.signOut(auth),
    get: async p => { const s = await F.getDoc(ref(p)).catch(erro); return s.exists() ? s.data() : null; },
    set: (p, d, o) => F.setDoc(ref(p), d, o && o.merge ? { merge: true } : {}).catch(erro),
    del: p => F.deleteDoc(ref(p)).catch(erro),
    listenDoc: (p, cb, err) => F.onSnapshot(ref(p), s => cb({ exists: s.exists(), data: s.exists() ? s.data() : null }), e => err && err(e)),
    listenCol: (p, cb, err) => F.onSnapshot(F.collection(fs, p), s => cb(s.docs.map(d => ({ id: d.id, data: d.data() }))), e => err && err(e)),
    batch: async ops => { const b = F.writeBatch(fs); for (const o of ops) { if (o.op === 'del') b.delete(ref(o.path)); else b.set(ref(o.path), o.data, o.op === 'merge' ? { merge: true } : {}); } await b.commit().catch(erro); }
  };
}
function backendMock() {
  const store = new Map(), docL = new Map(), colL = new Map(), users = new Map();
  let authCb = null, cur = null;
  const clone = x => x == null ? x : JSON.parse(JSON.stringify(x));
  const merge = (a, b) => { const o = (a && typeof a === 'object' && !Array.isArray(a)) ? { ...a } : {}; for (const k in b) { const v = b[k]; o[k] = (v && typeof v === 'object' && !Array.isArray(v) && o[k] && typeof o[k] === 'object' && !Array.isArray(o[k])) ? merge(o[k], v) : v; } return o; };
  const parent = p => p.split('/').slice(0, -1).join('/');
  const fire = p => { setTimeout(() => {
    (docL.get(p) || []).forEach(cb => cb({ exists: store.has(p), data: clone(store.get(p)) ?? null }));
    const c = parent(p); (colL.get(c) || []).forEach(cb => cb(colDocs(c)));
  }, 0); };
  const colDocs = c => [...store.keys()].filter(k => parent(k) === c).map(k => ({ id: k.split('/').pop(), data: clone(store.get(k)) }));
  const add = (m, k, cb) => { if (!m.has(k)) m.set(k, []); m.get(k).push(cb); return () => m.set(k, m.get(k).filter(x => x !== cb)); };
  const setA = u => { cur = u; setTimeout(() => authCb && authCb(u), 0); };
  const api = {
    onAuth: cb => { authCb = cb; setTimeout(() => cb(cur), 0); return () => { }; },
    login: async (e, s) => { const u = users.get(e); if (!u || u.s !== s) { const x = new Error('x'); x.code = 'invalid-credential'; throw x; } setA(u.user); },
    cadastrar: async (nome, e, s) => { if (users.has(e)) { const x = new Error('x'); x.code = 'email-already-in-use'; throw x; } const user = { uid: 'u' + (users.size + 1), nome, email: e }; users.set(e, { s, user }); setA(user); },
    google: async () => api.cadastrar('Teste Google', 'g' + Date.now() + '@gmail.com', 'x'),
    reset: async () => { },
    sair: async () => setA(null),
    get: async p => clone(store.get(p)) ?? null,
    set: async (p, d, o) => { store.set(p, o && o.merge ? merge(store.get(p), clone(d)) : clone(d)); fire(p); },
    del: async p => { store.delete(p); fire(p); },
    listenDoc: (p, cb) => { setTimeout(() => cb({ exists: store.has(p), data: clone(store.get(p)) ?? null }), 0); return add(docL, p, cb); },
    listenCol: (p, cb) => { setTimeout(() => cb(colDocs(p)), 0); return add(colL, p, cb); },
    batch: async ops => { for (const o of ops) { if (o.op === 'del') await api.del(o.path); else await api.set(o.path, o.data, { merge: o.op === 'merge' }); } }
  };
  window.__mock = { store, users, trocar: async (e, s) => { await api.sair(); await api.login(e, s); } };
  return api;
}

/* ================= Utilidades ================= */
const $ = id => document.getElementById(id);
const escH = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const ls = { get: k => { try { return localStorage.getItem(k); } catch (e) { return null; } }, set: (k, v) => { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, v); } catch (e) { } } };
const novoId = () => Array.from(crypto.getRandomValues(new Uint8Array(12)), b => 'abcdefghijklmnopqrstuvwxyz0123456789'[b % 36]).join('');
const novoCodigo = () => Array.from(crypto.getRandomValues(new Uint8Array(6)), b => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[b % 32]).join('');
const POSN = { GOL: 'Goleiro', ZAG: 'Zagueiro', MEI: 'Meio-campo', ATA: 'Atacante' };
const DIASN = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
// texto de quando é a pelada: fixa (toda semana) ou evento livre (datas a definir)
function dataBR(iso) { const [y, m, d] = String(iso).split('-').map(Number); const dt = new Date(y, m - 1, d); return `${DIASN[dt.getDay()].toLowerCase()}, ${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}`; }
function quandoG(G, curto) { if (G.evento && !G.data) return (curto ? '' : '📅 ') + 'Datas livres';
  if (G.evento && G.data) return (curto ? '' : '📅 ') + dataBR(G.data) + (G.hora ? (curto ? ' ' : ' às ') + G.hora : '');
  if (G.dia == null) return G.hora || ''; return curto ? DIASN[G.dia] + ' ' + (G.hora || '') : `📅 ${[0, 6].includes(Number(G.dia)) ? 'Todo' : 'Toda'} ${DIASN[G.dia].toLowerCase()}${G.hora ? ' às ' + G.hora : ''}`; }
function proxSabado() { const d = new Date(); d.setDate(d.getDate() + ((6 - d.getDay() + 7) % 7 || 7)); return d.toISOString().slice(0, 10); }
const ERROS = {
  'invalid-credential': 'E-mail ou senha incorretos.', 'wrong-password': 'E-mail ou senha incorretos.', 'user-not-found': 'Não existe conta com esse e-mail.',
  'email-already-in-use': 'Já existe uma conta com esse e-mail. Toque em "Já tenho conta".', 'invalid-email': 'Esse e-mail não parece válido.',
  'weak-password': 'A senha precisa ter pelo menos 6 caracteres.', 'too-many-requests': 'Muitas tentativas. Espere um pouco e tente de novo.',
  'network-request-failed': 'Sem internet. Verifique a conexão.', 'popup-closed-by-user': 'O login com Google foi fechado antes de terminar.',
  'permission-denied': 'Sem permissão para isso.', 'unavailable': 'Sem conexão com o servidor. Tente de novo.'
};
const msgErro = e => ERROS[e && e.code] || 'Algo deu errado. Tente de novo.';
function aviso(m) { const t = $('toast'); t.textContent = m; t.hidden = false; clearTimeout(aviso.t); aviso.t = setTimeout(() => t.hidden = true, 3200); }

/* ================= Link do app e QR Code ================= */
const LINK_APP = location.origin + location.pathname;
window.linkApp = LINK_APP;
window.qrSVG = texto => {
  if (!window.qrcode) return '';
  const q = window.qrcode(0, 'M'); q.addData(texto); q.make();
  const n = q.getModuleCount(), m = 2, t = n + m * 2; let d = '';
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (q.isDark(y, x)) d += `M${x + m} ${y + m}h1v1h-1z`;
  return `<svg viewBox="0 0 ${t} ${t}" width="100%" role="img" aria-label="QR Code" shape-rendering="crispEdges" style="display:block"><rect width="${t}" height="${t}" fill="#fff"/><path d="${d}" fill="#000"/></svg>`;
};
const MSG_APP = `⚽ *Pelada FC*\nOrganize sua pelada: lista de presença, sorteio de times equilibrados, notas, artilharia e ranking.\n\n👉 ${LINK_APP}\n\n📲 *Para ter o app no celular:*\niPhone: abra o link no Safari → Compartilhar → Adicionar à Tela de Início\nAndroid: abra no Chrome → menu ⋮ → Instalar app`;

/* ================= Leitor de QR Code ================= */
let LEITOR = null;
function carregarJsQR() { if (window.jsQR) return Promise.resolve(); return new Promise((res, rej) => { const s = document.createElement('script'); s.src = 'jsqr.js'; s.onload = res; s.onerror = rej; document.head.appendChild(s); }); }
function extrairCodigo(txt) { const t = String(txt || '').trim(); const m = t.match(/[?&]c=([A-Za-z0-9]{6})(?![A-Za-z0-9])/); if (m) return m[1].toUpperCase(); if (/^[A-Za-z0-9]{6}$/.test(t)) return t.toUpperCase(); return null; }
window.extrairCodigo = extrairCodigo;
async function abrirLeitor() {
  const ov = $('leitor'); ov.hidden = false;
  ov.innerHTML = `<div class="leitor-in"><div class="leitor-top"><b>Aponte para o QR Code do convite</b><button class="btn sm" data-sh="fechar-leitor">Fechar</button></div>
    <div class="leitor-vid"><video id="lv" playsinline muted autoplay></video><div class="leitor-mira"></div></div>
    <p class="leitor-msg" id="leitor-msg">Abrindo a câmera…</p></div>`;
  try {
    await carregarJsQR();
    const st = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
    if (ov.hidden) { st.getTracks().forEach(t => t.stop()); return; }
    const v = $('lv'); v.srcObject = st; await v.play();
    LEITOR = { st, v, c: document.createElement('canvas'), on: true };
    $('leitor-msg').textContent = 'Procurando o código…';
    loopLeitor();
  } catch (e) {
    console.warn(e);
    const m = $('leitor-msg'); if (m) m.innerHTML = 'Não consegui abrir a câmera. Permita o acesso à câmera quando o iPhone perguntar e tente de novo.<br><br>Outro jeito: abra a <b>Câmera</b> do celular, aponte para o QR Code e toque no link que aparecer.';
  }
}
function fecharLeitor() { if (LEITOR) { LEITOR.on = false; LEITOR.st.getTracks().forEach(t => t.stop()); LEITOR = null; } const ov = $('leitor'); ov.hidden = true; ov.innerHTML = ''; }
function loopLeitor() {
  if (!LEITOR || !LEITOR.on) return;
  const { v, c } = LEITOR;
  if (v.readyState >= 2 && v.videoWidth) {
    const w = Math.min(640, v.videoWidth), h = Math.round(v.videoHeight * w / v.videoWidth);
    c.width = w; c.height = h; const x = c.getContext('2d', { willReadFrequently: true }); x.drawImage(v, 0, 0, w, h);
    const r = window.jsQR(x.getImageData(0, 0, w, h).data, w, h, { inversionAttempts: 'dontInvert' });
    if (r && r.data) {
      const cod = extrairCodigo(r.data);
      if (cod) { fecharLeitor(); if (navigator.vibrate) navigator.vibrate(80); codigoLido(cod); return; }
      const m = $('leitor-msg'); if (m) m.textContent = r.data.includes(location.host) ? 'Esse é o QR Code do app, não de uma pelada. Peça o QR Code da pelada.' : 'Esse QR Code não é de uma pelada do app.';
    }
  }
  setTimeout(() => requestAnimationFrame(loopLeitor), 120);
}
function codigoLido(cod) {
  if (EU) { buscarCodigo(cod); return; }
  ls.set('pelada.convite', cod); aviso('Convite lido! Crie sua conta ou entre para participar.'); ir('criar');
}

/* ================= Estado da casca ================= */
let EU = null, PERFIL = null, TELA = 'carregando', GRUPOS = {}, ABERTO = null, unsubGrupo = null, unsubPerfil = null, CONVITE = null, OCUPADO = false;
const pend = new URLSearchParams(location.search).get('c');
if (pend) { ls.set('pelada.convite', pend.toUpperCase()); history.replaceState(null, '', location.pathname + (MOCK ? '?mock=1' : '')); }

function mostrarCasca(on) {
  $('shell').hidden = !on; $('app').hidden = on; $('nav').hidden = on;
  if (on) { $('push').hidden = true; document.title = 'Pelada FC'; }
}
function ir(t) { TELA = t; mostrarCasca(true); render(); }

/* ================= Telas ================= */
function topo(voltar) {
  return `<div class="ob-top">${voltar ? `<button class="btn sm" data-sh="ir" data-v="${voltar}">‹ Voltar</button>` : '<span></span>'}<span></span>${EU ? '' : ''}</div>`;
}
function render() {
  const el = $('shell'); let h = '';
  const t = TELA;
  if (t === 'carregando') h = `<div class="ob-hero"><div class="ob-logo">Pelada<br><span>FC</span></div><p>Carregando…</p></div>`;
  if (t === 'boas') h = `<div class="ob-hero"><div class="ob-logo">Pelada<br><span>FC</span></div><p>Organize a pelada, sorteie times equilibrados e acompanhe quem é o craque da galera.</p></div>
    ${ls.get('pelada.convite') ? `<div class="banner due"><span><b>Você recebeu um convite!</b><br>Crie sua conta ou entre para participar.</span></div>` : ''}
    <button class="btn primary block" data-sh="ir" data-v="criar">Criar conta</button>
    <button class="btn block" data-sh="ir" data-v="login">Já tenho conta</button>
    <div class="ob-div">ou</div>
    <button class="btn block ob-google" data-sh="google">Continuar com o Google</button>
    ${ls.get('pelada.convite') ? '' : '<button class="btn block" data-sh="ler-qr">📷 Recebi um QR Code de convite</button>'}`;
  if (t === 'login') h = topo('boas') + `<h2>Entrar</h2><p class="lead">Bem-vindo de volta.</p>
    <form id="f-login" class="stack" novalidate>
      <label class="field"><span>E-mail</span><input type="email" id="l-email" autocomplete="email" inputmode="email" placeholder="seu@email.com" required></label>
      <label class="field"><span>Senha</span><input type="password" id="l-senha" autocomplete="current-password" placeholder="Sua senha" required></label>
      <button class="btn primary block" type="submit">Entrar</button></form>
    <button class="ob-link" data-sh="reset">Esqueci minha senha</button>
    <div class="ob-div">ou</div>
    <button class="btn block ob-google" data-sh="google">Continuar com o Google</button>
    <p class="sub" style="text-align:center">Não tem conta? <button class="ob-link" data-sh="ir" data-v="criar">Criar conta</button></p>`;
  if (t === 'criar') h = topo('boas') + `<h2>Criar conta</h2><p class="lead">Leva menos de um minuto.</p>
    <form id="f-criar" class="stack" novalidate>
      <label class="field"><span>Nome</span><input type="text" id="c-nome2" autocomplete="name" placeholder="Seu nome completo" required></label>
      <label class="field"><span>E-mail</span><input type="email" id="c-email" autocomplete="email" inputmode="email" placeholder="seu@email.com" required></label>
      <label class="field"><span>Senha</span><input type="password" id="c-senha" autocomplete="new-password" placeholder="Mínimo de 6 caracteres" required></label>
      <button class="btn primary block" type="submit">Criar conta</button></form>
    <div class="ob-div">ou</div>
    <button class="btn block ob-google" data-sh="google">Continuar com o Google</button>
    <p class="sub" style="text-align:center;margin:0">Seus dados ficam guardados no Firebase (Google) e são usados só para organizar as peladas.</p>`;
  if (t === 'perfil') { const p = PERFIL || {}; const pos = UIp.pos || p.pos || 'MEI';
    h = (p.apelido ? topo('minhas') : '') + `<h2>${p.apelido ? 'Meu perfil' : 'Seu perfil de jogador'}</h2><p class="lead">É assim que a galera vai te ver.</p>
    <form id="f-perfil" class="stack" novalidate>
      <div class="row" style="gap:14px;flex-wrap:nowrap"><div class="av bg-${pos}" style="width:84px;height:84px;font-size:30px;${(UIp.foto ?? p.foto) ? `background-image:url('${UIp.foto ?? p.foto}');background-size:cover;background-position:center` : ''}">${(UIp.foto ?? p.foto) ? '' : escH(((p.apelido || p.nome || EU.nome || '?').trim()[0] || '?').toUpperCase())}</div>
        <div class="stack" style="gap:6px"><label class="btn sm">${(UIp.foto ?? p.foto) ? 'Trocar foto' : 'Adicionar foto'}<input type="file" accept="image/*" id="p-foto" class="vh"></label>
        <span class="sub">Ela aparece na carta de jogador e nas artes dos prêmios.</span></div></div>
      <div class="dica-foto"><b>📸 Para a foto ficar boa</b><ul><li>De rosto, olhando para a câmera</li><li>Rosto no centro, do peito para cima</li><li>Lugar claro, sem luz atrás de você</li><li>Sem boné ou óculos escuros cobrindo o rosto</li></ul></div>
      <label class="field"><span>Nome</span><input type="text" id="p-nome" value="${escH(p.nome || EU.nome || '')}" required></label>
      <label class="field"><span>Apelido</span><input type="text" id="p-ap" value="${escH(p.apelido || '')}" placeholder="Como te chamam no campo"></label>
      <label class="field"><span>WhatsApp</span><input type="tel" id="p-tel" value="${escH(p.tel || '')}" placeholder="(81) 99999-9999"></label>
      <div class="field"><span>Posição principal</span><div class="pick">${Object.entries(POSN).map(([k, n]) => `<button type="button" data-sh="pos" data-v="${k}" aria-pressed="${pos === k}">${n}</button>`).join('')}</div></div>
      <button class="btn primary block" type="submit">Salvar</button></form>
    ${p.apelido ? `<button class="btn block" data-sh="sair">Sair da conta</button><p class="sub" style="text-align:center">${escH(EU.email || '')}</p>` : ''}`; }
  if (t === 'minhas') { const ids = Object.keys(GRUPOS); const adm = ids.filter(g => (GRUPOS[g].admins || []).includes(EU.uid)), jog = ids.filter(g => !adm.includes(g));
    const card = (g, papel) => { const G = GRUPOS[g]; return `<button class="ob-pel" data-sh="abrir" data-v="${g}"><div class="av bg-${papel === 'ADMIN' ? 'MEI' : 'ATA'}">${escH((G.nome || '?').split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase())}</div><span class="grow"><b>${escH(G.nome || 'Pelada')}</b><span class="sub">${G.evento ? '<b style="display:inline;font-size:10px;letter-spacing:.05em;color:var(--card-ink);background:var(--card);border-radius:5px;padding:1px 5px;margin-right:4px">EVENTO LIVRE</b>' : ''}${escH(quandoG(G, true))}</span></span><span class="badge2 ${papel === 'ADMIN' ? '' : 'j'}">${papel}</span></button>`; };
    h = `<div class="ob-top"><span class="ob-sim" style="background:var(--pitch);color:var(--pitch-ink)">PELADA FC</span><button class="btn sm" data-sh="ir" data-v="perfil">${escH(PERFIL?.apelido || PERFIL?.nome || 'Perfil')}</button></div>
    <h2>Minhas peladas</h2>
    ${cartaoPush()}
    <button class="ob-opt" data-sh="ir" data-v="compartilhar" style="padding:12px 14px"><span class="ic" style="background:var(--card)">📲</span><span class="grow"><b>Convidar para o app</b><span class="sub">Mostre o QR Code ou mande o link do app</span></span></button>
    ${ids.length ? `<button class="ob-opt" data-sh="ir" data-v="convidar-pelada" style="padding:12px 14px"><span class="ic" style="background:var(--pitch-soft)">⚽</span><span class="grow"><b>Convidar para minha pelada</b><span class="sub">QR Code ou link que já entra na pelada</span></span></button>` : ''}
    ${!ids.length ? `<p class="lead">Você ainda não está em nenhuma pelada. Crie a sua ou entre com o código de um convite.</p>` : ''}
    ${adm.length ? `<div class="sub" style="font-weight:700">ADMINISTRO</div>${adm.map(g => card(g, 'ADMIN')).join('')}` : ''}
    ${jog.length ? `<div class="sub" style="font-weight:700">JOGO</div>${jog.map(g => card(g, 'JOGADOR')).join('')}` : ''}
    <button class="btn primary block" data-sh="ir" data-v="nova">+ Criar uma pelada</button>
    <button class="btn block" data-sh="ir" data-v="codigo">📷 Entrar com QR Code ou código</button>
    <button class="btn block" data-sh="demo">Ver demonstração</button>`; }
  if (t === 'nova') h = topo('minhas') + `<h2>Criar sua pelada</h2><p class="lead">Depois você ajusta tudo nos Ajustes.</p>
    <form id="f-nova" class="stack" novalidate>
      <label class="field"><span>Nome da pelada</span><input type="text" id="n-nome" placeholder="Pelada do Sábado" required></label>
      <div class="field"><span>Tipo</span><div class="pick" id="n-tipo"><button type="button" data-sh="tipo-pel" data-v="fixa" aria-pressed="true">Fixa (toda semana)</button><button type="button" data-sh="tipo-pel" data-v="evento" aria-pressed="false">Evento livre</button></div>
        <p class="sub" id="n-tipo-txt" style="margin:4px 0 0">Tem mensalistas e diaristas, e acontece toda semana no mesmo dia.</p></div>
      <div class="grid2"><label class="field" id="n-dia-box"><span>Dia fixo</span><select id="n-dia">${DIASN.map((d, i) => `<option value="${i}" ${i === 6 ? 'selected' : ''}>${d}</option>`).join('')}</select></label>
      <label class="field"><span>Início</span><input type="time" id="n-hora" value="08:00"></label></div>
      <label class="field"><span>Término</span><input type="time" id="n-fim" value="09:00"></label>
      <div class="grid2"><label class="field"><span>Times</span><select id="n-times"><option>2</option><option>3</option><option>4</option></select></label>
      <label class="field"><span>Jogadores de linha por time</span><input type="number" id="n-por" value="5" min="3" max="11"></label></div>
      <div class="grid2" id="n-fixa-box"><label class="field"><span>Mensalidade (R$)</span><input type="number" id="n-mens" value="80" min="0"></label><label class="field"><span>Diária (R$)</span><input type="number" id="n-dia2" value="20" min="0"></label></div>
      <button class="btn primary block" type="submit">Criar pelada</button></form>`;
  if (t === 'codigo') h = topo('minhas') + `<h2>Entrar numa pelada</h2><p class="lead">Leia o QR Code de quem já está na pelada, ou digite o código de 6 letras.</p>
    <button class="btn primary block" data-sh="ler-qr" style="padding-block:16px;font-size:16px">📷 Ler QR Code do convite</button>
    <div class="ob-div">ou digite o código</div>
    <form id="f-codigo" class="stack" novalidate><label class="field"><span>Código</span><input type="text" id="cod" maxlength="6" autocapitalize="characters" autocomplete="off" placeholder="Ex.: SAB8H2" style="text-transform:uppercase;font-size:22px;letter-spacing:.15em;text-align:center" value="${escH(ls.get('pelada.convite') || '')}"></label>
    <button class="btn block" type="submit">Buscar pelada</button></form>`;
  if (t === 'convite' && CONVITE) { const G = CONVITE.grupo; const pre = UIp.prefere || 'mensalista';
    h = topo('minhas') + `<h2>Você foi convidado!</h2>
    <div class="ob-inv"><div class="h"><span class="sub" style="color:inherit;opacity:.85">Convite para</span><b>${escH(G.nome || 'Pelada')}</b></div>
    <div class="b">${(G.dia != null || G.data || G.evento) ? `<div>${escH(quandoG(G))}${G.evento ? ' · <b>evento livre</b>' : ''}</div>` : ''}<div class="sub">Código ${escH(CONVITE.codigo)}</div></div></div>
    ${G.evento ? '<p class="sub" style="margin:0">É um evento livre, sem cobrança: o administrador marca as datas e você só confirma presença. Quem confirma primeiro garante a vaga.</p>' : `<div class="field"><span>Quero entrar como</span><div class="pick"><button data-sh="pref" data-v="mensalista" aria-pressed="${pre === 'mensalista'}">Mensalista</button><button data-sh="pref" data-v="diarista" aria-pressed="${pre === 'diarista'}">Diarista</button></div>
    <p class="sub" style="margin:4px 0 0">${pre === 'mensalista' ? 'Mensalista entra direto na lista quando tem vaga. O administrador confirma.' : 'Diarista pede vaga a cada pelada e o administrador libera.'}</p></div>`}
    <button class="btn primary block" data-sh="aceitar">Entrar na pelada</button>
    <div class="banner due"><span><b>⏳ Sua entrada vai esperar a autorização do administrador.</b><br>Até ele autorizar, seu nome aparece como pendente no Elenco.</span></div>`; }
  if (t === 'convidar-pelada') { const ids = Object.keys(GRUPOS).sort((a, b) => (GRUPOS[a].nome || '').localeCompare(GRUPOS[b].nome || ''));
    h = topo('minhas') + `<h2>Convidar para minha pelada</h2><p class="lead">Escolha a pelada. A pessoa instala o app e já entra nela.</p>
    ${ids.map(g => { const G = GRUPOS[g]; return `<button class="ob-pel" data-sh="qr-grupo" data-v="${g}"><div class="av bg-MEI">${escH((G.nome || '?').split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase())}</div><span class="grow"><b>${escH(G.nome || 'Pelada')}</b><span class="sub">${escH(quandoG(G, true))} · código ${escH(G.codigo || '')}</span></span><span class="badge2">QR CODE</span></button>`; }).join('')}`; }
  if (t === 'qr-grupo' && UIp.qrg && GRUPOS[UIp.qrg]) { const G = GRUPOS[UIp.qrg], link = LINK_APP + '?c=' + G.codigo;
    const quando = (G.dia != null || G.data || G.evento) ? quandoG(G) + '\n' : '';
    const txt = `⚽ Você está convidado pra *${G.nome || 'pelada'}*!\n${quando}\nEntre na pelada pelo app: ${link}\n\n📲 *Para ter o app no celular:*\niPhone: abra o link no Safari → Compartilhar → Adicionar à Tela de Início\nAndroid: abra no Chrome → menu ⋮ → Instalar app`;
    UIp.qrLink = link; UIp.qrTxt = txt;
    h = topo('convidar-pelada') + `<h2>${escH(G.nome || 'Pelada')}</h2><p class="lead">Com este QR Code, a pessoa instala o app e <b>já entra nesta pelada</b>.</p>
    <div style="background:#fff;padding:16px;border-radius:14px;border:1px solid var(--line);width:min(100%,320px);margin:0 auto">${window.qrSVG(link)}</div>
    <p class="sub" style="text-align:center;margin:0">Aponte a câmera do celular para o código.</p>
    <div class="num" style="font-weight:700;text-align:center;word-break:break-all">${escH(link)}</div>
    <div class="sub" style="text-align:center">Código da pelada: <b>${escH(G.codigo || '')}</b></div>
    <a class="btn primary block" target="_blank" rel="noopener" href="https://wa.me/?text=${encodeURIComponent(txt)}">Enviar convite no WhatsApp</a>
    <button class="btn block" data-sh="copiar-qrg">Copiar link</button>
    ${navigator.share ? '<button class="btn block" data-sh="share-qrg">Compartilhar…</button>' : ''}`; }
  if (t === 'compartilhar') h = topo('minhas') + `<h2>Convidar para o app</h2>
    <p class="lead">Este é o link do app, sem entrar em nenhuma pelada. A pessoa cria a conta e depois cria a pelada dela ou entra com um código.</p>
    <div style="background:#fff;padding:16px;border-radius:14px;border:1px solid var(--line);width:min(100%,320px);margin:0 auto">${window.qrSVG(LINK_APP)}</div>
    <p class="sub" style="text-align:center;margin:0">Peça para a pessoa apontar a câmera do celular para o código.</p>
    <div class="num" style="font-weight:700;text-align:center;word-break:break-all">${escH(LINK_APP)}</div>
    <a class="btn primary block" target="_blank" rel="noopener" href="https://wa.me/?text=${encodeURIComponent(MSG_APP)}">Enviar no WhatsApp</a>
    <button class="btn block" data-sh="copiar-app">Copiar link</button>
    ${navigator.share ? '<button class="btn block" data-sh="share-app">Compartilhar…</button>' : ''}
    <p class="sub" style="margin:0">Para convidar alguém direto para a sua pelada, use o link ou o QR Code que ficam na ⚙️ engrenagem, dentro da pelada.</p>`;
  el.innerHTML = `<div class="ob-in">${h}</div>`;
}
const UIp = {};

/* ================= Fluxos ================= */
async function carregarPerfil() {
  if (unsubPerfil) unsubPerfil();
  return new Promise(res => {
    let first = true;
    unsubPerfil = B.listenDoc('users/' + EU.uid, async s => {
      PERFIL = s.data || null;
      const ids = Object.keys((PERFIL && PERFIL.grupos) || {});
      const gs = {}; await Promise.all(ids.map(async g => { const G = await B.get('grupos/' + g).catch(() => null); if (G) gs[g] = G; }));
      GRUPOS = gs;
      if (first) { first = false; res(); } else if (TELA === 'minhas') render();
    }, e => { console.warn(e); if (first) { first = false; res(); } });
  });
}
// Histórico pessoal de locais (vale para todas as peladas da pessoa)
window.meusLocais = () => (PERFIL && PERFIL.locais) || {};
window.salvarMeuLocal = (id, L) => { if (!EU) return; PERFIL = PERFIL || {}; PERFIL.locais = { ...(PERFIL.locais || {}), [id]: L }; B.set('users/' + EU.uid, { locais: { [id]: L } }, { merge: true }).catch(e => console.warn(e)); };
async function depoisDoLogin() {
  await carregarPerfil();
  if (!PERFIL || !PERFIL.apelido && !PERFIL.pos) { ir('perfil'); return; }
  const conv = ls.get('pelada.convite');
  if (conv) { ls.set('pelada.convite', null); await buscarCodigo(conv); return; }
  // Ao abrir o app (ícone ou site), sempre começa em "Minhas peladas".
  ir('minhas');
  renovarPush();
}
async function buscarCodigo(cod) {
  cod = String(cod || '').trim().toUpperCase();
  if (cod.length !== 6) { aviso('O código tem 6 letras.'); ir('codigo'); return; }
  try {
    const c = await B.get('codigos/' + cod);
    if (!c) { aviso('Não achei nenhuma pelada com esse código.'); ls.set('pelada.convite', cod); ir('codigo'); ls.set('pelada.convite', null); return; }
    if (GRUPOS[c.gid]) { aviso('Você já está nessa pelada.'); abrirGrupo(c.gid); return; }
    const G = await B.get('grupos/' + c.gid);
    if (!G) { aviso('Essa pelada não existe mais.'); ir('minhas'); return; }
    CONVITE = { codigo: cod, gid: c.gid, grupo: G }; UIp.prefere = 'mensalista'; ir('convite');
  } catch (e) { aviso(msgErro(e)); ir('minhas'); }
}
async function aceitarConvite() {
  if (OCUPADO || !CONVITE) return; OCUPADO = true;
  const { gid, codigo, grupo } = CONVITE, p = PERFIL || {};
  try {
    await B.batch([
      { op: 'set', path: `grupos/${gid}/membros/${EU.uid}`, data: { nome: p.nome || EU.nome || '', apelido: p.apelido || '', tel: p.tel || '', pos: p.pos || 'MEI', foto: p.foto || null, prefere: grupo.evento ? null : (UIp.prefere || 'mensalista'), codigo, t: Date.now() } },
      { op: 'merge', path: 'users/' + EU.uid, data: { grupos: { [gid]: { t: Date.now() } } } }
    ]);
    GRUPOS[gid] = grupo; CONVITE = null; aviso('Pronto! Agora é só esperar o administrador autorizar sua entrada.');
    abrirGrupo(gid);
  } catch (e) { aviso(msgErro(e)); }
  OCUPADO = false;
}
async function criarGrupo(f) {
  if (OCUPADO) return; OCUPADO = true;
  const gid = novoId(), codigo = novoCodigo(), p = PERFIL || {}, now = Date.now();
  const cfg = { nome: f.nome, dia: f.dia, hora: f.hora, horaFim: f.fim, golSorteio: false, local: '', times: f.times, porTime: f.por, mensal: f.evento ? 0 : f.mens, diaria: f.evento ? 0 : f.diaria, pix: '', restr: [], nivelPublico: false, evento: !!f.evento, dataEvento: f.data || null };
  try {
    await B.batch([
      { op: 'set', path: 'grupos/' + gid, data: { nome: f.nome, dia: f.dia, hora: f.hora, evento: !!f.evento, data: f.data || null, dono: EU.uid, admins: [EU.uid], codigo, criadoEm: now } },
      { op: 'set', path: 'codigos/' + codigo, data: { gid } },
      { op: 'set', path: `grupos/${gid}/config/geral`, data: cfg },
      { op: 'set', path: `grupos/${gid}/membros/${EU.uid}`, data: { nome: p.nome || EU.nome || '', apelido: p.apelido || '', tel: p.tel || '', pos: p.pos || 'MEI', foto: p.foto || null, prefere: f.evento ? null : 'mensalista', codigo, t: now } },
      { op: 'merge', path: 'users/' + EU.uid, data: { grupos: { [gid]: { t: now } } } }
    ]);
    GRUPOS[gid] = { nome: f.nome, dia: f.dia, hora: f.hora, evento: !!f.evento, data: f.data || null, dono: EU.uid, admins: [EU.uid], codigo };
    aviso('Pelada criada! Agora cadastre o elenco e convide a galera.');
    abrirGrupo(gid);
  } catch (e) { aviso(msgErro(e)); }
  OCUPADO = false;
}
function makeDb(gid) {
  const base = 'grupos/' + gid + '/', unsubs = [];
  return {
    unsubs,
    doc(p) {
      const full = base + p, id = p.split('/').pop();
      return {
        set: d => B.set(full, d), update: d => B.set(full, d, { merge: true }), delete: () => B.del(full),
        get: async () => { const d = await B.get(full); return { exists: !!d, data: () => d, id }; },
        onSnapshot: (n, e) => { const u = B.listenDoc(full, s => n({ exists: s.exists, data: () => s.data, id }), e); unsubs.push(u); return u; }
      };
    },
    collection(p) {
      const full = base + p;
      return { onSnapshot: (n, e) => { const u = B.listenCol(full, docs => n({ docs: docs.map(x => ({ id: x.id, data: () => x.data })) }), e); unsubs.push(u); return u; } };
    }
  };
}
const compartilhar = {
  save: async ({ filename, data }) => {
    const file = new File([data], filename, { type: 'image/png' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file] }); return { status: 'saved' }; }
    const a = document.createElement('a'); a.href = URL.createObjectURL(data); a.download = filename; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000); return { status: 'saved' };
  }
};
function abrirGrupo(gid) {
  const G = GRUPOS[gid]; if (!G) { ir('minhas'); return; }
  ABERTO = gid; ls.set('pelada.ultimo', gid); mostrarCasca(false);
  window.iniciarPelada({ db: makeDb(gid), uid: EU.uid, isAdmin: (G.admins || []).includes(EU.uid), grupo: { ...G }, gid, dl: compartilhar });
  if (unsubGrupo) unsubGrupo();
  unsubGrupo = B.listenDoc('grupos/' + gid, s => { if (!s.exists) return; GRUPOS[gid] = s.data; window.atualizarGrupo({ ...s.data }); }, e => console.warn(e));
}
window.voltarGrupos = () => {
  window.pararPelada(); if (unsubGrupo) { unsubGrupo(); unsubGrupo = null; }
  ABERTO = null; ls.set('pelada.ultimo', null);
  if (!EU) { ir('boas'); return; }
  ir('minhas'); carregarPerfil().then(() => TELA === 'minhas' && render());
};
window.mudarAdmins = async admins => {
  if (!ABERTO) return;
  admins = [...new Set(admins)];
  if (!admins.length) { aviso('A pelada precisa de pelo menos um administrador.'); return; }
  try { await B.set('grupos/' + ABERTO, { admins }, { merge: true }); aviso('Administradores atualizados.'); } catch (e) { aviso(msgErro(e)); }
};
window.sincronizarGrupo = async d => { if (ABERTO) try { GRUPOS[ABERTO] = { ...(GRUPOS[ABERTO] || {}), ...d }; await B.set('grupos/' + ABERTO, d, { merge: true }); } catch (e) { console.warn(e); } };

/* ================= Notificações no celular (Web Push) ================= */
const URL_CHAVE = 'https://southamerica-east1-pelada-fc-990d6.cloudfunctions.net/chavePush';
const PUSH = { pub: null, estado: 'carregando' }; if (MOCK) window.__PUSH = PUSH;
const ehIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const noIcone = () => (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true;
const temPush = () => 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
function b64u(s) { const p = '='.repeat((4 - s.length % 4) % 4), b = atob((s + p).replace(/-/g, '+').replace(/_/g, '/')); return Uint8Array.from(b, c => c.charCodeAt(0)); }
function idSub(endpoint) { let h = 5381; for (let i = 0; i < endpoint.length; i++) h = ((h << 5) + h + endpoint.charCodeAt(i)) >>> 0; return 'd' + h.toString(36) + endpoint.length.toString(36); }
async function chavePublica() {
  if (PUSH.pub) return PUSH.pub;
  if (MOCK) return (PUSH.pub = 'mock');
  const r = await fetch(URL_CHAVE, { cache: 'no-store' }); if (!r.ok) throw new Error('sem servidor');
  return (PUSH.pub = (await r.json()).publica);
}
async function regSW() { if (!('serviceWorker' in navigator)) return null; try { return await navigator.serviceWorker.register('sw.js', { scope: './' }); } catch (e) { console.warn(e); return null; } }
async function avaliarPush() {
  let est;
  if (ehIOS && !noIcone()) est = 'abrir-icone';
  else if (!temPush()) est = 'sem-suporte';
  else {
    try { await chavePublica(); } catch (e) { PUSH.estado = 'indisponivel'; return PUSH.estado; }
    if (Notification.permission === 'denied') est = 'bloqueado';
    else if (Notification.permission === 'granted') { const reg = await navigator.serviceWorker.ready; est = (await reg.pushManager.getSubscription()) ? 'ativo' : 'desligado'; }
    else est = 'desligado';
  }
  PUSH.estado = est; return est;
}
async function salvarSub(sub) {
  const j = sub.toJSON();
  await B.set(`users/${EU.uid}/push/${idSub(j.endpoint)}`, { endpoint: j.endpoint, keys: j.keys, ua: navigator.userAgent.slice(0, 140), t: Date.now() }, { merge: true });
  ls.set('pelada.pushKey', PUSH.pub);
}
async function inscrever() {
  const reg = await navigator.serviceWorker.ready;
  let sub = await reg.pushManager.getSubscription();
  if (sub && ls.get('pelada.pushKey') && ls.get('pelada.pushKey') !== PUSH.pub) { await sub.unsubscribe().catch(() => {}); sub = null; }
  if (!sub) sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64u(PUSH.pub) });
  await salvarSub(sub);
}
function ativarPush() {
  if (!temPush() || !PUSH.pub) { aviso('As notificações ainda não estão disponíveis.'); return; }
  // o pedido de permissão precisa sair direto do toque (exigência do iPhone)
  Notification.requestPermission().then(async perm => {
    if (perm !== 'granted') { PUSH.estado = perm === 'denied' ? 'bloqueado' : 'desligado'; aviso('Sem permissão, as notificações não chegam.'); render(); return; }
    try { await inscrever(); PUSH.estado = 'ativo'; aviso('Notificações ativadas! Já já chega um aviso de teste.'); }
    catch (e) { console.warn(e); aviso('Não deu para ativar agora. Tente de novo.'); }
    render();
  });
}
// toda vez que o app abre: renova a inscrição (o iPhone às vezes "esquece")
async function renovarPush() {
  PUSH.iniciado = true;
  try { await regSW(); if (!EU) return; const est = await avaliarPush();
    if (!MOCK && temPush() && Notification.permission === 'granted' && PUSH.pub) await inscrever();
    if (TELA === 'minhas' && est !== 'carregando') render();
  } catch (e) { console.warn(e); }
}
function cartaoPush() {
  const e = PUSH.estado;
  if (e === 'carregando' && !PUSH.iniciado) setTimeout(renovarPush, 0);
  if (e === 'carregando' || e === 'indisponivel') return '';
  if (e === 'ativo') return `<div class="sub" style="text-align:center">🔔 Notificações ativadas neste celular</div>`;
  const box = (ic, tit, txt, btn) => `<div class="ob-opt" style="padding:12px 14px;cursor:default"><span class="ic" style="background:var(--pitch-soft)">${ic}</span><span class="grow"><b>${tit}</b><span class="sub">${txt}</span>${btn || ''}</span></div>`;
  if (e === 'abrir-icone') return box('📲', 'Receba os avisos da pelada', 'Para ativar as notificações, abra o Pelada FC pelo ícone na tela de início do iPhone.');
  if (e === 'sem-suporte') return box('📵', 'Notificações indisponíveis', 'Este celular não aceita notificações de app da web. No iPhone, precisa do iOS 16.4 ou mais novo.');
  if (e === 'bloqueado') return box('🔕', 'Notificações bloqueadas', 'Para liberar: Ajustes do celular → Notificações → Pelada FC → Permitir.');
  return box('🔔', 'Receba os avisos da pelada', 'Pelada marcada, times, vaga liberada e notas chegam no celular, mesmo com o app fechado.', '<button class="btn primary sm" data-sh="push-ativar" style="margin-top:8px">Ativar notificações</button>');
}

/* ================= Eventos ================= */
document.addEventListener('click', async e => {
  const b = e.target.closest('[data-sh]'); if (!b || !($('shell').contains(b) || $('leitor').contains(b))) return;
  const a = b.dataset.sh, v = b.dataset.v;
  if (a === 'ir') { if (v === 'perfil') { UIp.pos = null; UIp.foto = undefined; } ir(v); }
  if (a === 'pos') { UIp.pos = v; const keep = { nome: $('p-nome').value, ap: $('p-ap').value, tel: $('p-tel').value }; render(); $('p-nome').value = keep.nome; $('p-ap').value = keep.ap; $('p-tel').value = keep.tel; }
  if (a === 'pref') { UIp.prefere = v; render(); }
  if (a === 'google') { try { await B.google(); } catch (err) { aviso(msgErro(err) + ' Se não abrir, use e-mail e senha.'); } }
  if (a === 'reset') { const em = ($('l-email') || {}).value || ''; if (!em) { aviso('Digite seu e-mail acima e toque de novo em "Esqueci minha senha".'); return; } try { await B.reset(em.trim()); aviso('Mandamos um link para criar uma nova senha no seu e-mail.'); } catch (err) { aviso(msgErro(err)); } }
  if (a === 'sair') { ls.set('pelada.ultimo', null); await B.sair(); }
  if (a === 'abrir') abrirGrupo(v);
  if (a === 'tipo-pel') { const ev = v === 'evento'; UIp.tipoPel = v;
    document.querySelectorAll('#n-tipo button').forEach(x => x.setAttribute('aria-pressed', String(x.dataset.v === v)));
    $('n-dia-box').hidden = ev; $('n-fixa-box').hidden = ev;
    $('n-tipo-txt').textContent = ev ? 'Sem cobrança e sem dia fixo: o administrador marca cada pelada na data que quiser, e o grupo continua para os próximos eventos. Ninguém entra como mensalista nem diarista: quem confirma primeiro garante a vaga.' : 'Tem mensalistas e diaristas, e acontece toda semana no mesmo dia.'; }
  if (a === 'push-ativar') ativarPush();
  if (a === 'ler-qr') abrirLeitor();
  if (a === 'fechar-leitor') fecharLeitor();
  if (a === 'qr-grupo') { UIp.qrg = v; ir('qr-grupo'); }
  if (a === 'copiar-qrg') { try { await navigator.clipboard.writeText(UIp.qrLink); aviso('Link da pelada copiado.'); } catch (err) { aviso(UIp.qrLink); } }
  if (a === 'share-qrg') { try { await navigator.share({ title: 'Pelada FC', text: UIp.qrTxt }); } catch (err) { } }
  if (a === 'copiar-app') { try { await navigator.clipboard.writeText(LINK_APP); aviso('Link do app copiado.'); } catch (err) { aviso(LINK_APP); } }
  if (a === 'share-app') { try { await navigator.share({ title: 'Pelada FC', text: MSG_APP }); } catch (err) { } }
  if (a === 'aceitar') aceitarConvite();
  if (a === 'demo') { mostrarCasca(false); window.abrirDemo(); }
});
document.addEventListener('change', e => {
  const t = e.target; if (t.id !== 'p-foto' || !t.files || !t.files[0]) return;
  const keep = { nome: $('p-nome').value, ap: $('p-ap').value, tel: $('p-tel').value };
  aviso('Preparando a foto…');
  window.redimFoto(t.files[0]).then(d => { UIp.foto = d; render(); $('p-nome').value = keep.nome; $('p-ap').value = keep.ap; $('p-tel').value = keep.tel; }, () => aviso('Não consegui abrir essa foto. Tente outra.'));
});
document.addEventListener('submit', async e => {
  const f = e.target; if (!$('shell').contains(f)) return; e.preventDefault();
  if (OCUPADO) return;
  const val = id => ($(id).value || '').trim();
  if (f.id === 'f-login') { if (!val('l-email') || !val('l-senha')) { aviso('Preencha e-mail e senha.'); return; } OCUPADO = true; try { await B.login(val('l-email'), $('l-senha').value); } catch (err) { aviso(msgErro(err)); } OCUPADO = false; }
  if (f.id === 'f-criar') { if (!val('c-nome2') || !val('c-email') || !$('c-senha').value) { aviso('Preencha nome, e-mail e senha.'); return; } OCUPADO = true; try { await B.cadastrar(val('c-nome2'), val('c-email'), $('c-senha').value); } catch (err) { aviso(msgErro(err)); } OCUPADO = false; }
  if (f.id === 'f-perfil') {
    if (!val('p-nome')) { aviso('Coloque seu nome.'); return; }
    const pos = UIp.pos || (PERFIL && PERFIL.pos) || 'MEI';
    OCUPADO = true;
    const foto = UIp.foto !== undefined ? UIp.foto : ((PERFIL && PERFIL.foto) || null);
    try { await B.set('users/' + EU.uid, { nome: val('p-nome'), apelido: val('p-ap'), tel: val('p-tel'), pos, foto, email: EU.email || '' }, { merge: true }); PERFIL = { ...(PERFIL || {}), nome: val('p-nome'), apelido: val('p-ap'), tel: val('p-tel'), pos, foto };
      await Promise.all(Object.keys(GRUPOS).map(g => B.set(`grupos/${g}/membros/${EU.uid}`, { nome: val('p-nome'), apelido: val('p-ap'), tel: val('p-tel'), pos, foto }, { merge: true }).catch(e => console.warn(e))));
      UIp.foto = undefined; OCUPADO = false; await depoisDoLogin(); }
    catch (err) { aviso(msgErro(err)); OCUPADO = false; }
    return;
  }
  if (f.id === 'f-nova') { if (!val('n-nome')) { aviso('Dê um nome para a pelada.'); return; }
    const ev = UIp.tipoPel === 'evento', dataEv = null;
    criarGrupo({ evento: ev, data: dataEv, nome: val('n-nome'), dia: ev ? null : Number($('n-dia').value), hora: $('n-hora').value || '08:00', fim: $('n-fim').value || '', times: Number($('n-times').value) || 2, por: Math.max(3, Math.min(11, Number($('n-por').value) || 5)), mens: Number($('n-mens').value) || 0, diaria: Number($('n-dia2').value) || 0 }); }
  if (f.id === 'f-codigo') buscarCodigo(val('cod'));
});

/* ================= Início ================= */
(async () => {
  mostrarCasca(true); render();
  try { B = MOCK ? backendMock() : await backendReal(); }
  catch (e) { console.error(e); $('shell').innerHTML = `<div class="ob-in"><div class="ob-hero"><div class="ob-logo">Pelada<br><span>FC</span></div><p>Não foi possível conectar. Verifique a internet e abra o app de novo.</p></div></div>`; return; }
  B.onAuth(async u => {
    const antes = EU && EU.uid;
    EU = u;
    if (!u) { if (ABERTO || antes) { window.pararPelada(); if (unsubGrupo) unsubGrupo(); if (unsubPerfil) unsubPerfil(); ABERTO = null; PERFIL = null; GRUPOS = {}; } ir('boas'); return; }
    if (antes === u.uid) return;
    ir('carregando'); await depoisDoLogin();
  });
})();

// Se o navegador devolver a página da memória (voltar/reabrir), recarrega para começar do início.
window.addEventListener('pageshow', e => { if (e.persisted) location.reload(); });
