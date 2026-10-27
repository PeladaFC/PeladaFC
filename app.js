/* Pelota FC · casca do app: login, Minhas peladas, criar e entrar por convite.
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
    token: async () => auth.currentUser ? auth.currentUser.getIdToken() : null,
    get: async p => { const s = await F.getDoc(ref(p)).catch(erro); return s.exists() ? s.data() : null; },
    set: (p, d, o) => F.setDoc(ref(p), d, o && o.merge ? { merge: true } : {}).catch(erro),
    upd: (p, d) => F.updateDoc(ref(p), d).catch(erro),
    del: p => F.deleteDoc(ref(p)).catch(erro),
    listenDoc: (p, cb, err) => F.onSnapshot(ref(p), s => cb({ exists: s.exists(), data: s.exists() ? s.data() : null }), e => err && err(e)),
    listenCol: (p, cb, err) => F.onSnapshot(F.collection(fs, p), s => cb(s.docs.map(d => ({ id: d.id, data: d.data() }))), e => err && err(e)),
    listar: async p => (await F.getDocs(F.collection(fs, p)).catch(erro)).docs.map(d => d.id),
    tirarGrupo: (uid, gid) => F.updateDoc(ref('users/' + uid), { ['grupos.' + gid]: F.deleteField() }).catch(erro),
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
    token: async () => cur ? 'mock' : null,
    get: async p => clone(store.get(p)) ?? null,
    set: async (p, d, o) => { store.set(p, o && o.merge ? merge(store.get(p), clone(d)) : clone(d)); fire(p); },
    upd: async (p, d) => { store.set(p, { ...(store.get(p) || {}), ...clone(d) }); fire(p); },
    del: async p => { store.delete(p); fire(p); },
    listenDoc: (p, cb) => { setTimeout(() => cb({ exists: store.has(p), data: clone(store.get(p)) ?? null }), 0); return add(docL, p, cb); },
    listenCol: (p, cb) => { setTimeout(() => cb(colDocs(p)), 0); return add(colL, p, cb); },
    listar: async p => colDocs(p).map(d => d.id),
    tirarGrupo: async (uid, gid) => { const p = 'users/' + uid, u = clone(store.get(p)) || {}; if (u.grupos) delete u.grupos[gid]; store.set(p, u); fire(p); },
    batch: async ops => { for (const o of ops) { if (o.op === 'del') await api.del(o.path); else await api.set(o.path, o.data, { merge: o.op === 'merge' }); } }
  };
  window.__mock = { store, users, trocar: async (e, s) => { await api.sair(); await api.login(e, s); } };
  return api;
}

/* ================= Utilidades ================= */
const $ = id => document.getElementById(id);
const escH = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const ls = { get: k => { try { return localStorage.getItem(k); } catch (e) { return null; } }, set: (k, v) => { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, v); } catch (e) { } } };
const MP_VOLTA = new URLSearchParams(location.search).get('mp'); // volta do Mercado Pago (?mp=ok|erro)
const novoId = () => Array.from(crypto.getRandomValues(new Uint8Array(12)), b => 'abcdefghijklmnopqrstuvwxyz0123456789'[b % 36]).join('');
const novoCodigo = () => Array.from(crypto.getRandomValues(new Uint8Array(6)), b => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[b % 32]).join('');
const POSN = { GOL: 'Goleiro', ZAG: 'Zagueiro', LAT: 'Lateral', VOL: 'Volante', MEI: 'Meio-campo', ATA: 'Atacante' };
const DIASN = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
// texto de quando é a pelada: fixa (toda semana) ou evento livre (datas a definir)
function dataBR(iso) { const [y, m, d] = String(iso).split('-').map(Number); const dt = new Date(y, m - 1, d); return `${DIASN[dt.getDay()].toLowerCase()}, ${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}`; }
function quandoG(G, curto) { if (G.evento && !G.data) return (curto ? '' : '📅 ') + 'Datas livres';
  if (G.evento && G.data) return (curto ? '' : '📅 ') + dataBR(G.data) + (G.hora ? (curto ? ' ' : ' às ') + G.hora : '');
  if (G.dia == null) return G.hora || ''; return curto ? DIASN[G.dia] + ' ' + (G.hora || '') : `📅 ${[0, 6].includes(Number(G.dia)) ? 'Todo' : 'Toda'} ${DIASN[G.dia].toLowerCase()}${G.hora ? ' às ' + G.hora : ''}`; }
// próximo jogo de um grupo (pelo dia fixo ou pela data do evento)
function proxJogo(G) { if (!G) return null; const [hh, mm] = String(G.hora || '08:00').split(':').map(Number), agora = Date.now();
  if (G.evento) { if (!G.data) return null; const d = new Date(G.data + 'T00:00'); d.setHours(hh || 0, mm || 0, 0, 0); return d.getTime() + 2 * 36e5 > agora ? d : null; }
  if (G.dia == null) return null; const d = new Date(); d.setHours(hh || 0, mm || 0, 0, 0);
  let k = (Number(G.dia) - d.getDay() + 7) % 7; if (k === 0 && d.getTime() + 2 * 36e5 < agora) k = 7; d.setDate(d.getDate() + k); return d; }
function falta(d, longo) { const h0 = new Date(); h0.setHours(0, 0, 0, 0); const dd = new Date(d); dd.setHours(0, 0, 0, 0); const n = Math.round((dd - h0) / 864e5), hora = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  if (n <= 0) return longo ? (d.getTime() < Date.now() ? 'Rolando agora' : `Hoje, ${hora}`) : 'hoje';
  if (n === 1) return longo ? `Amanhã, ${hora}` : 'amanhã';
  return longo ? `${DIASN[d.getDay()]}, ${hora}` : `em ${n} dias`; }
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
const MSG_APP = `⚽ *Pelota FC*\nOrganize sua pelada: lista de presença, sorteio de times equilibrados, notas, artilharia e ranking.\n\n👉 ${LINK_APP}\n\n📲 *Para ter o app no celular:*\niPhone: abra o link no Safari → Compartilhar → Adicionar à Tela de Início\nAndroid: abra no Chrome → menu ⋮ → Instalar app`;

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
function fecharLeitor() { window.__leitorDono = null; if (LEITOR) { LEITOR.on = false; LEITOR.st.getTracks().forEach(t => t.stop()); LEITOR = null; } const ov = $('leitor'); ov.hidden = true; ov.innerHTML = ''; }
function loopLeitor() {
  if (!LEITOR || !LEITOR.on) return;
  const { v, c } = LEITOR;
  if (v.readyState >= 2 && v.videoWidth) {
    const w = Math.min(640, v.videoWidth), h = Math.round(v.videoHeight * w / v.videoWidth);
    c.width = w; c.height = h; const x = c.getContext('2d', { willReadFrequently: true }); x.drawImage(v, 0, 0, w, h);
    const r = window.jsQR(x.getImageData(0, 0, w, h).data, w, h, { inversionAttempts: 'dontInvert' });
    if (r && r.data) {
      const cod = extrairCodigo(r.data);
      if (cod) { const dono = window.__leitorDono; window.__leitorDono = null; fecharLeitor(); if (navigator.vibrate) navigator.vibrate(80); if (dono) dono(cod); else codigoLido(cod); return; }
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
const repUrl = (new URLSearchParams(location.search).get('rep') || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 16);
if (repUrl.length >= 4) { ls.set('pelota.rep', JSON.stringify({ c: repUrl, t: Date.now() })); if (!pend) history.replaceState(null, '', location.pathname + (MOCK ? '?mock=1' : '')); }
function repGuardado() { try { const r = JSON.parse(ls.get('pelota.rep') || 'null'); return r && r.c && Date.now() - r.t < 90 * 864e5 ? r.c : ''; } catch (e) { return ''; } }
if (pend) { ls.set('pelada.convite', pend.toUpperCase()); history.replaceState(null, '', location.pathname + (MOCK ? '?mock=1' : '')); }

function mostrarCasca(on) {
  $('shell').hidden = !on; $('app').hidden = on; $('nav').hidden = on;
  if (on) { $('push').hidden = true; document.title = 'Pelota FC'; }
}
function ir(t) { TELA = t; mostrarCasca(true); render(); }

/* ================= Telas ================= */
function topo(voltar) {
  return `<div class="ob-top">${voltar ? `<button class="btn sm" data-sh="ir" data-v="${voltar}">‹ Voltar</button>` : '<span></span>'}<span></span>${EU ? '' : ''}</div>`;
}
function render() {
  const el = $('shell'); let h = '';
  const t = TELA;
  if (t === 'carregando') h = `<div class="ob-hero"><div class="ob-logo">Pelota<br><span>FC</span></div><p>Carregando…</p></div>`;
  if (t === 'boas') h = `<div class="ob-hero"><div class="ob-logo">Pelota<br><span>FC</span></div><p>Organize a pelada, sorteie times equilibrados e acompanhe quem é o craque da galera.</p></div>
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
    <p class="sub" style="text-align:center;margin:0">Ao criar a conta, você aceita os <a href="termos.html" target="_blank" rel="noopener">Termos de uso</a> e a <a href="privacidade.html" target="_blank" rel="noopener">Política de privacidade</a>.</p>`;
  if (t === 'perfil' && EU && UIp.notasOk === undefined) { UIp.notasOk = null; UIp.notasErro = null; notasServidor('acesso').then(() => { UIp.notasOk = true; if (TELA === 'perfil') render(); }, e => { if (e && e.status === 403) UIp.notasOk = false; else { UIp.notasOk = undefined; UIp.notasErro = (e && e.message) || 'erro'; if (TELA === 'perfil') render(); } }); }
  if (t === 'perfil') { const p = PERFIL || {}; const pos = UIp.pos || p.pos || 'MEI'; const pronto = !!(p.apelido || p.pos);
    h = (pronto ? topo('minhas') : '') + `<h2>${pronto ? 'Meu perfil' : 'Seu perfil de jogador'}</h2><p class="lead">É assim que a galera vai te ver.</p>
    ${EU && UIp.notasOk ? `<button class="btn block primary" data-sh="dono" style="margin-bottom:6px">Painel do dono</button>` : ''}
    ${EU && UIp.notasErro && !UIp.notasOk ? `<button class="btn sm" data-sh="dono-verificar" style="align-self:flex-start;margin-bottom:6px">Não consegui verificar o acesso ao painel. Tocar para tentar de novo</button>` : ''}
    <form id="f-perfil" class="stack" novalidate>
      <div class="row" style="gap:14px;flex-wrap:nowrap"><div class="av bg-${pos}" style="width:84px;height:84px;font-size:30px;${(UIp.foto ?? p.foto) ? `background-image:url('${UIp.foto ?? p.foto}');background-size:cover;background-position:center` : ''}">${(UIp.foto ?? p.foto) ? '' : escH(((p.apelido || p.nome || EU.nome || '?').trim()[0] || '?').toUpperCase())}</div>
        <div class="stack" style="gap:6px"><label class="btn sm">${(UIp.foto ?? p.foto) ? 'Trocar foto' : 'Adicionar foto'}<input type="file" accept="image/*" id="p-foto" class="vh"></label>
        <span class="sub">Ela aparece na carta de jogador e nas artes dos prêmios.</span></div></div>
      <div class="dica-foto"><b>📸 Para a foto ficar boa</b><ul><li>De rosto, olhando para a câmera</li><li>Rosto no centro, do peito para cima</li><li>Lugar claro, sem luz atrás de você</li><li>Sem boné ou óculos escuros cobrindo o rosto</li></ul></div>
      <label class="field"><span>Nome</span><input type="text" id="p-nome" value="${escH(p.nome || EU.nome || '')}" required></label>
      <label class="field"><span>Apelido</span><input type="text" id="p-ap" value="${escH(p.apelido || '')}" placeholder="Como te chamam no campo"></label>
      <div class="grid2"><label class="field"><span>Cidade</span><input type="text" id="p-cidade" value="${escH(UIp.pcid ?? p.cidade ?? '')}" placeholder="Recife" autocomplete="address-level2"></label>
      <label class="field"><span>Estado</span><select id="p-uf"><option value="">Escolha</option>${UFS.map(u => `<option ${(UIp.puf ?? p.uf) === u ? 'selected' : ''}>${u}</option>`).join('')}</select></label></div>
      <label class="field"><span>WhatsApp</span><input type="tel" id="p-tel" value="${escH(p.tel || '')}" placeholder="(81) 99999-9999"></label>
      <div class="field"><span>Posição principal</span><div class="pick">${Object.entries(POSN).map(([k, n]) => `<button type="button" data-sh="pos" data-v="${k}" aria-pressed="${pos === k}">${n}</button>`).join('')}</div></div>
      <button class="btn primary block" type="submit">Salvar</button></form>
    ${EU ? `<button class="btn block" data-sh="sair">Sair da conta</button>${EU.email ? `<p class="sub" style="text-align:center">Você entrou como: <b>${escH(EU.email)}</b></p>` : ''}
      <p class="sub" style="text-align:center;margin:0"><a href="termos.html" target="_blank" rel="noopener">Termos de uso</a> · <a href="privacidade.html" target="_blank" rel="noopener">Política de privacidade</a></p>
      <button class="btn sm" style="align-self:center;margin-top:8px" data-sh="excluir-ver">Excluir minha conta</button>` : ''}`; }
  if (t === 'dono') h = topo('perfil') + abasDono('dono') + telaDono();
  if (t === 'donogrupos') h = topo('perfil') + abasDono('grupos') + telaGruposDono();
  if (t === 'donoreps') h = topo('perfil') + abasDono('reps') + telaRepsDono();
  if (t === 'donorepqr') { const x = repDoQr(), A3 = UIp.repFmt === 'a3', A4 = UIp.repFmt === 'a4' || A3;
    h = topo('donoreps') + (x ? `<h2>${x.codigo ? 'QR Code de ' + escH(x.nome) : 'Pôster do Pelota FC'}</h2><p class="lead">${x.codigo ? `Quem ler este código abre o Pelota FC. As peladas que essa pessoa criar ficam marcadas como trazidas por <b>${escH(x.codigo)}</b>.` : 'Pôster sem representante: o QR Code abre o Pelota FC.'}</p>
    <div class="pick">${x.codigo ? `<button type="button" data-sh="rep-fmt" data-v="a6" aria-pressed="${!A4}">Cartão pequeno</button>` : ''}<button type="button" data-sh="rep-fmt" data-v="a4" aria-pressed="${UIp.repFmt === 'a4'}">Pôster A4</button><button type="button" data-sh="rep-fmt" data-v="a3" aria-pressed="${UIp.repFmt === 'a3'}">Pôster grande (A3)</button></div>
    <p id="rep-gerando" class="sub" style="text-align:center;margin:0">Montando a arte…</p><img id="rep-cartao" alt="${A3 ? 'Pôster A3' : A4 ? 'Pôster A4' : 'Cartão'} com QR Code${x.codigo ? ' do representante ' + escH(x.nome) : ''}" style="width:min(100%,${A4 ? 420 : 360}px);margin:0 auto;display:block;border-radius:${A4 ? 4 : 10}px;border:1px solid var(--line);box-shadow:0 6px 18px rgba(0,0,0,.08)">
    <div class="num" style="font-weight:700;text-align:center;word-break:break-all">${escH(linkRep(x.codigo))}</div>
    ${A4 ? `<label class="field" style="margin:0"><span>Tamanho do PDF</span><select id="rep-tam" style="width:100%">${Object.entries(PAPEL).map(([k, v]) => `<option value="${k}" ${k === (A3 ? 'A3' : 'A4') ? 'selected' : ''}>${k} · ${v[2]}</option>`).join('')}</select></label><button class="btn primary block" data-sh="rep-pdf">Baixar PDF para imprimir</button><button class="btn block" data-sh="rep-baixar">Baixar imagem (PNG)</button>` : '<button class="btn primary block" data-sh="rep-baixar">Baixar para imprimir (PNG)</button>'}
    ${navigator.share ? '<button class="btn block" data-sh="rep-compartilhar">Compartilhar…</button>' : ''}
    <button class="btn block" data-sh="rep-copiar">Copiar link</button>
    <p class="sub" style="margin:0">${A4 ? 'Escolha o tamanho e baixe o PDF. A4 e A3 saem com ótima qualidade; A2 e A1 também ficam bons para ver de longe, como em muro ou banner. Leve o PDF para qualquer gráfica ou imprima em casa.' : 'Tamanho A6 (10,5 × 14,8 cm) em alta resolução. Imprime bem também como adesivo.'}</p>` : '<p class="lead">Representante não encontrado.</p>'); }
  if (t === 'notas') { const N = UIp.nf || {}, [ano, mm] = (N.mes || '2026-01').split('-'), D = N.dados, L = (D && D.linhas) || [];
    const rs = v => 'R$ ' + Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const fdoc = d => d && d.length === 11 ? d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4') : d && d.length === 14 ? d.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5') : '';
    const situacao = l => { const n = l.nota; if (!n) return '<div class="sub">Nota ainda não emitida.</div>';
      if (n.status === 'ok') return `<div class="small" style="color:var(--pitch)"><b>✓ Nota emitida</b>${n.ambiente !== 'producao' ? ' (teste, sem valor fiscal)' : ''}</div>`;
      if (n.status === 'pendente' || n.status === 'emitindo') return '<div class="sub">Enviando ao Emissor Nacional… o app tenta de novo sozinho.</div>';
      if (n.status === 'erro') return `<div class="banner" style="margin:0"><b>A nota foi recusada.</b> ${escH(n.motivo || '')}</div>`;
      return ''; };
    const F = (D && D.nfse) || null;
    const auto = !F ? '' : F.falta && F.falta.length ? `<div class="banner" style="margin:0"><b>Emissão automática ainda não ligada.</b> Falta: ${escH(F.falta.join(', '))}. Enquanto isso, dá para emitir à mão (no fim da tela).</div>`
      : `<div class="panel" style="padding:12px 14px;display:grid;gap:8px"><div class="small"><b>${F.ligado ? 'Emissão automática ligada' : 'Emissão automática desligada'}</b>${F.ligado ? ': todo dia 1º, o app emite a nota do mês anterior para cada organizador.' : '.'}${F.ambiente !== 'producao' ? ' <b>Modo de teste</b>: as notas não têm valor fiscal.' : ''}</div>
        ${F.validade ? `<div class="sub">Certificado digital vale até ${new Date(F.validade).toLocaleDateString('pt-BR')}.${F.validade - Date.now() < 30 * 864e5 ? ' <b>Renove logo!</b>' : ''}</div>` : ''}
        ${L.length && L.some(l => l.doc && (!l.nota || l.nota.status === 'erro')) ? '<button class="btn sm primary" data-sh="nf-emitir" style="justify-self:start">Emitir as notas deste mês agora</button>' : ''}</div>`;
    const card = (l, i) => N.editar === l.gid ? `<form id="f-tomador" class="panel stack" style="padding:12px 14px" data-gid="${escH(l.gid)}">
        <b>${escH(l.grupo)}</b><span class="sub">Dados de quem recebe os Pix desta pelada (o organizador).</span>
        <label class="field"><span>Nome completo</span><input id="t-nome" value="${escH(l.nome)}" required></label>
        <label class="field"><span>CPF ou CNPJ</span><input id="t-doc" inputmode="numeric" value="${escH(fdoc(l.doc))}" required></label>
        <label class="field"><span>E-mail (para mandar a nota)</span><input id="t-email" type="email" value="${escH(l.email)}"></label>
        <div class="row" style="gap:8px"><button class="btn primary" type="submit">Salvar</button><button class="btn" type="button" data-sh="nf-editar" data-v="">Cancelar</button></div></form>`
      : `<div class="panel" style="padding:12px 14px;display:grid;gap:6px">
        <div class="row" style="justify-content:space-between;gap:10px;flex-wrap:nowrap"><b>${escH(l.grupo)}</b><b class="num">${rs(l.total)}</b></div>
        <div class="sub">${l.qtd} ${l.qtd === 1 ? 'Pix aprovado' : 'Pix aprovados'} no mês</div>
        <div class="small">Tomador: <b>${escH(l.nome || '—')}</b>${l.doc ? ` · <span style="white-space:nowrap">${l.tipoDoc || 'CPF'} <span class="num">${fdoc(l.doc)}</span></span>` : ''}${l.email ? `<br>${escH(l.email)}` : ''}</div>
        ${l.doc ? '' : '<div class="banner" style="margin:0">O Mercado Pago não informou o CPF deste organizador. Peça a ele e preencha para emitir a nota.</div>'}
        ${situacao(l)}
        <div class="row" style="gap:8px;flex-wrap:wrap">${l.nota && l.nota.status === 'ok' ? `<button class="btn sm primary" data-sh="nf-pdf" data-v="${escH(l.gid)}">Baixar PDF</button>` : l.doc ? `<button class="btn sm" data-sh="nf-copiar" data-v="${i}">Copiar dados da nota</button>` : ''}<button class="btn sm" data-sh="nf-editar" data-v="${escH(l.gid)}">${l.doc ? 'Corrigir dados' : 'Preencher dados'}</button></div></div>`;
    h = topo('perfil') + abasDono('notas') + `<h2>Notas fiscais</h2><p class="lead">Comissão de 1% dos Pix, separada por organizador. Uma nota para cada um, uma vez por mês.</p>
    <div class="row" style="justify-content:space-between;align-items:center;flex-wrap:nowrap"><button class="btn sm" data-sh="nf-mes" data-v="-1" aria-label="Mês anterior">‹</button><b style="font-size:18px">${MESES[Number(mm) - 1]} de ${ano}</b><button class="btn sm" data-sh="nf-mes" data-v="1" aria-label="Próximo mês">›</button></div>
    ${N.carregando ? '<p class="lead">Somando as comissões…</p>' : N.erro ? `<div class="banner">${escH(N.erro)}</div>` : !L.length ? '<p class="sub">Nenhuma comissão neste mês. Não precisa emitir nota.</p>' : `
    ${auto}
    <div class="panel" style="padding:12px 14px;display:flex;justify-content:space-between;align-items:center"><span>Total do mês · ${L.length} ${L.length === 1 ? 'nota' : 'notas'}</span><b class="num" style="font-size:20px">${rs(D.total)}</b></div>
    <div class="stack" style="gap:10px">${L.map(card).join('')}</div>
    <button class="btn block" data-sh="nf-planilha">Baixar planilha do mês</button>`}
    <details class="panel" style="padding:12px 14px"><summary><b>Emitir à mão (se precisar)</b></summary>
      <a class="btn block" style="margin-top:10px" href="https://www.nfse.gov.br/EmissorNacional/" target="_blank" rel="noopener">Abrir o Emissor Nacional (gratuito)</a><ol class="small" style="padding-left:20px;line-height:1.6;margin:8px 0 0">
      <li>Entre no Emissor Nacional com o gov.br da Kathy ou com o certificado da empresa.</li>
      <li>Toque em <b>Emitir NFS-e</b> e informe o CPF ou CNPJ e o nome do tomador (o organizador).</li>
      <li>Serviço: use o código de <b>agenciamento e intermediação</b> que a contadora indicar.</li>
      <li>Valor e descrição: toque em <b>Copiar dados da nota</b> aqui e cole.</li>
      <li>Emita e mande a nota para o e-mail do organizador.</li></ol>
      <p class="sub" style="margin:8px 0 0">Conta como comissão o Pix aprovado dentro do mês, pelo horário do Recife.</p></details>`; }
  if (t === 'excluir') { const X = UIp.exc || {}, lista = (n, L) => L && L.length ? `<li><b>${n}:</b> ${L.map(escH).join(', ')}</li>` : '';
    h = topo('perfil') + `<h2>Excluir minha conta</h2>
    ${X.carregando ? '<p class="lead">Verificando seus grupos…</p>' : X.bloqueia && X.bloqueia.length ? `<div class="banner" style="border-color:var(--red)"><b>Ainda não dá para excluir.</b> Você é o único administrador de: <b>${X.bloqueia.map(escH).join(', ')}</b>. Abra o grupo, vá em Ajustes e coloque outra pessoa como administradora (ou apague o grupo). Depois volte aqui.</div>` : `
    <p class="lead">Isto apaga sua conta de vez. Não dá para desfazer.</p>
    <ul class="sub" style="line-height:1.6">
      <li>Seu login, seu perfil, sua foto e as notificações deste e de outros celulares são apagados.</li>
      ${lista('Você sai dos grupos', X.sai)}${lista('A administração passa para os outros administradores', X.passa)}${lista('Grupos só seus, que serão apagados', X.apaga)}
      <li>O que o grupo registrou (nome no elenco, gols, notas e pagamentos) continua com o grupo, sem ligação com a sua conta.</li></ul>
    <label class="field"><span>Para confirmar, escreva EXCLUIR</span><input type="text" id="x-conf" autocomplete="off" autocapitalize="characters"></label>
    <button class="btn danger block" data-sh="excluir-ok">Excluir minha conta</button>`}
    <button class="btn block" data-sh="ir" data-v="perfil">Voltar</button>`; }
  const avOk = rid => { try { return !!localStorage.getItem('pelada.avok.' + rid); } catch (e) { return false; } };
  const avAb = g => { const a = GRUPOS[g] && GRUPOS[g].avAberta; return a && a.v === 2 && a.fim > Date.now() && !avOk(a.rid) ? a : null; };
  if (t === 'minhas') { const ids = Object.keys(GRUPOS); const adm = ids.filter(g => (GRUPOS[g].admins || []).includes(EU.uid)), jog = ids.filter(g => !adm.includes(g));
    const ini = n => { const ws = (n || '?').split(/\s+/).filter(Boolean), g = ws.filter(w => w.length > 2); return escH(((g.length ? g : ws).slice(0, 2).map(w => w[0]).join('')).toUpperCase()); };
    const CRESTS = ['#1B6A36', '#C0392B', '#2F6FD0', '#7E57C2', '#E8742A', '#0E7C7B', '#9A6B00'];
    const cor = g => { let x = 0; for (const ch of g) x = (x * 31 + ch.charCodeAt(0)) >>> 0; return CRESTS[x % CRESTS.length]; };
    const prox = ids.map(g => ({ g, d: proxJogo(GRUPOS[g]) })).filter(x => x.d).sort((a, b) => a.d - b.d)[0];
    const card = (g, adm) => { const G = GRUPOS[g], d = proxJogo(G);
      return `<button class="clube" data-sh="abrir" data-v="${g}" style="--cor:${cor(g)}">${G.escudo ? `<span class="escudo img"><img src="${G.escudo}" alt=""></span>` : `<span class="escudo"><span>${ini(G.nome)}</span></span>`}<span class="grow"><b>${escH(G.nome || 'Pelada')}</b><span class="sub">${G.evento ? '<i class="tag-ev">Evento livre</i>' : ''}${escH(quandoG(G, true))}${d ? ` · <em>${escH(falta(d))}</em>` : ''}</span></span>${adm ? '<span class="papel">Admin</span>' : ''}<span class="seta" aria-hidden="true">›</span></button>`; };
    const nomeEu = (PERFIL?.apelido || PERFIL?.nome || '').split(/\s+/)[0];
    const hr = new Date().getHours(), ola = hr < 5 ? 'Boa noite' : hr < 12 ? 'Bom dia' : hr < 18 ? 'Boa tarde' : 'Boa noite';
    const eu = PERFIL || {};
    h = `<div class="ob-top"><span class="ob-sim" style="background:var(--pitch);color:var(--pitch-ink)">PELOTA FC</span><button class="eu-av" data-sh="ir" data-v="perfil" aria-label="Meu perfil" style="${eu.foto ? `background-image:url('${eu.foto}')` : ''}">${eu.foto ? '' : ini(eu.apelido || eu.nome)}</button></div>
    ${prox ? `<button class="home-hero" data-sh="abrir" data-v="${prox.g}"><span class="hh-ola">${ola}${nomeEu ? ', ' + escH(nomeEu) : ''}.</span><span class="hh-q">${escH(falta(prox.d, true))}</span><span class="hh-n">${escH(GRUPOS[prox.g].nome || 'Pelada')}</span><span class="hh-ir">Abrir pelada</span></button>`
      : `<div class="home-hero"><span class="hh-ola">${ola}${nomeEu ? ', ' + escH(nomeEu) : ''}.</span><span class="hh-q">${ids.length ? 'Sem jogo marcado' : 'Bora jogar?'}</span><span class="hh-n">${ids.length ? 'Quando marcarem a próxima, ela aparece aqui.' : 'Crie sua pelada ou entre com o código de um convite.'}</span></div>`}
    ${ids.filter(avAb).map(g => `<button class="alerta-av" data-sh="avaliar" data-v="${g}"><span class="ic">⭐</span><span><b>Avaliação da galera aberta!</b>${escH(GRUPOS[g].nome || 'Pelada')} · dê sua nota para o elenco</span><span class="ir">Avaliar</span></button>`).join('')}
    ${cartaoPush()}
    ${adm.length ? `<h3 class="home-sec">Você administra</h3>${adm.map(g => card(g, true)).join('')}` : ''}
    ${jog.length ? `<h3 class="home-sec">Você joga</h3>${jog.map(g => card(g, false)).join('')}` : ''}
    <div class="home-acoes"><button class="btn primary" data-sh="ir" data-v="nova">+ Criar pelada</button><button class="btn" data-sh="ir" data-v="codigo">📷 Entrar com código</button></div>
    <h3 class="home-sec">Chame a galera</h3>
    <div class="home-conv"><button class="tile" data-sh="ir" data-v="compartilhar"><span class="ic">📲</span><b>Convidar para o app</b><span class="sub">QR Code ou link</span></button>${ids.length ? `<button class="tile" data-sh="ir" data-v="convidar-pelada"><span class="ic">⚽</span><b>Convidar para a pelada</b><span class="sub">Já entra no grupo</span></button>` : ''}</div>
    <button class="ob-link" style="align-self:center;margin-top:4px" data-sh="demo">Ver demonstração do app</button>`; }
  if (t === 'nova') h = topo('minhas') + `<h2>Criar sua pelada</h2><p class="lead">Depois você ajusta tudo nos Ajustes.</p>
    <form id="f-nova" class="stack" novalidate>
      <label class="field"><span>Nome da pelada</span><input type="text" id="n-nome" placeholder="Pelada do Sábado" required></label>
      <div class="grid2"><label class="field"><span>Cidade</span><input type="text" id="n-cidade" placeholder="Recife" autocomplete="address-level2"></label>
      <label class="field"><span>Estado</span><select id="n-uf"><option value="">Escolha</option>${UFS.map(u => `<option>${u}</option>`).join('')}</select></label></div>
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
window.esconderMeuLocal = id => { if (!EU) return; PERFIL = PERFIL || {}; const L = { ...((PERFIL.locais || {})[id] || {}), oculto: true }; PERFIL.locais = { ...(PERFIL.locais || {}), [id]: L }; B.set('users/' + EU.uid, { locais: { [id]: { oculto: true } } }, { merge: true }).catch(e => console.warn(e)); };
window.salvarMeuLocal = (id, L) => { if (!EU) return; PERFIL = PERFIL || {}; PERFIL.locais = { ...(PERFIL.locais || {}), [id]: L }; B.set('users/' + EU.uid, { locais: { [id]: L } }, { merge: true }).catch(e => console.warn(e)); };
async function depoisDoLogin() {
  await carregarPerfil();
  if (!PERFIL || !PERFIL.apelido && !PERFIL.pos) { ir('perfil'); return; }
  const conv = ls.get('pelada.convite');
  if (conv) { ls.set('pelada.convite', null); await buscarCodigo(conv); return; }
  // Voltando do Mercado Pago: reabre a pelada direto nos Ajustes.
  const mv = ls.get('pelada.mpVolta');
  if (MP_VOLTA && mv && GRUPOS[mv]) { ls.set('pelada.mpVolta', null); window.__abrirCfgPix = true; abrirGrupo(mv); renovarPush(); return; }
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
  const cfg = { nome: f.nome, cidade: f.cidade || '', uf: f.uf || '', dia: f.dia, hora: f.hora, horaFim: f.fim, golSorteio: false, local: '', times: f.times, porTime: f.por, mensal: f.evento ? 0 : f.mens, diaria: f.evento ? 0 : f.diaria, pix: '', restr: [], nivelPublico: false, evento: !!f.evento, dataEvento: f.data || null };
  try {
    await B.batch([
      { op: 'set', path: 'grupos/' + gid, data: { nome: f.nome, dia: f.dia, hora: f.hora, evento: !!f.evento, data: f.data || null, dono: EU.uid, admins: [EU.uid], codigo, criadoEm: now, ...(repGuardado() ? { rep: repGuardado() } : {}) } },
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
        set: d => B.set(full, d), update: d => B.set(full, d, { merge: true }), replace: d => B.upd(full, d), delete: () => B.del(full),
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
  save: async ({ filename, data, type }) => {
    const file = new File([data], filename, { type: type || 'image/png' });
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
  unsubGrupo = B.listenDoc('grupos/' + gid, s => { if (!s.exists) { if (ABERTO === gid) { delete GRUPOS[gid]; aviso('Este grupo foi apagado.'); window.voltarGrupos(); } return; } GRUPOS[gid] = s.data; window.atualizarGrupo({ ...s.data }); }, e => console.warn(e));
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
// Apagar o grupo (só quem criou): limpa as coleções, o código do convite e o grupo.
const COLS_GRUPO = ['config', 'jogadores', 'peladas', 'presencas', 'locais', 'caixa', 'avisos', 'mural', 'avaliacoes', 'notificacoes', 'membros'];
window.apagarGrupo = async () => {
  const gid = ABERTO, G = GRUPOS[gid]; if (!gid || !G || G.dono !== EU.uid) { aviso('Só quem criou o grupo pode apagá-lo.'); return; }
  try {
    for (const c of COLS_GRUPO) {
      const ids = await B.listar(`grupos/${gid}/${c}`).catch(() => []);
      const alvo = c === 'membros' ? ids.filter(u => u !== EU.uid) : ids;
      for (let i = 0; i < alvo.length; i += 400) await B.batch(alvo.slice(i, i + 400).map(id => ({ op: 'del', path: `grupos/${gid}/${c}/${id}` }))).catch(e => console.warn(e));
    }
    await B.del(`grupos/${gid}/votos/${EU.uid}`).catch(() => { });
    if (G.codigo) await B.del('codigos/' + G.codigo).catch(e => console.warn(e));
    await B.del(`grupos/${gid}/membros/${EU.uid}`).catch(() => { });
    await B.del('grupos/' + gid);
    await B.tirarGrupo(EU.uid, gid).catch(e => console.warn(e));
    delete GRUPOS[gid]; aviso('Grupo apagado.'); window.voltarGrupos();
  } catch (e) { aviso(msgErro(e)); }
};
// Sair do grupo (quem não criou): deixa de ser membro e de ser administrador.
window.sairGrupo = async () => {
  const gid = ABERTO, G = GRUPOS[gid]; if (!gid || !G) return;
  try {
    if ((G.admins || []).includes(EU.uid)) await B.set('grupos/' + gid, { admins: G.admins.filter(u => u !== EU.uid) }, { merge: true });
    await B.del(`grupos/${gid}/membros/${EU.uid}`).catch(e => console.warn(e));
    await B.tirarGrupo(EU.uid, gid);
    delete GRUPOS[gid]; aviso('Você saiu do grupo.'); window.voltarGrupos();
  } catch (e) { aviso(msgErro(e)); }
};
window.sincronizarGrupo = async d => { if (ABERTO) try { GRUPOS[ABERTO] = { ...(GRUPOS[ABERTO] || {}), ...d }; await B.set('grupos/' + ABERTO, d, { merge: true }); } catch (e) { console.warn(e); } };

/* ================= Notificações no celular (Web Push) ================= */
const URL_CHAVE = 'https://southamerica-east1-pelada-fc-990d6.cloudfunctions.net/chavePush';
/* ---------- Pix automático (Mercado Pago) ---------- */
const URL_PIX = 'https://southamerica-east1-pelada-fc-990d6.cloudfunctions.net/criarPix';
const URL_MPCONTA = 'https://southamerica-east1-pelada-fc-990d6.cloudfunctions.net/mpConectar';
const URL_CONTA = 'https://southamerica-east1-pelada-fc-990d6.cloudfunctions.net/excluirConta';
// excluir a própria conta: 'verificar' (o que vai acontecer) ou 'excluir'
async function contaServidor(acao) {
  if (MOCK) { if (acao === 'verificar') return { sai: Object.keys(GRUPOS).filter(g => !(GRUPOS[g].admins || []).includes(EU.uid)).map(g => GRUPOS[g].nome), passa: [], apaga: Object.keys(GRUPOS).filter(g => (GRUPOS[g].admins || []).includes(EU.uid)).map(g => GRUPOS[g].nome), bloqueia: [] }; return { ok: true }; }
  let t = null; try { t = await B.token(); } catch (e) { }
  if (!t) throw new Error('Entre na sua conta de novo.');
  let r; try { r = await fetch(URL_CONTA, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + t }, body: JSON.stringify({ acao }) }); }
  catch (e) { throw new Error('Sem conexão com o servidor. Tente de novo.'); }
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw Object.assign(new Error(j.erro || 'Não deu certo agora. Tente de novo.'), { bloqueia: j.bloqueia });
  return j;
}
const URL_NOTAS = 'https://southamerica-east1-pelada-fc-990d6.cloudfunctions.net/notasPlataforma';
// notas fiscais da comissão (só a empresa): 'acesso', 'relatorio' {mes} ou 'tomador' {gid, nome, doc, email}
async function notasServidor(acao, extra) {
  if (MOCK) {
    if (acao === 'acesso') return { ok: true };
    if (acao === 'emitir') { (UIp.nfMock || []).forEach(l => { if (l.doc) l.nota = { status: 'ok', chave: '26116062211222333000181000000000000126091234567890', ambiente: 'restrita' }; }); return { ok: 1 }; }
    if (acao === 'pdf') throw new Error('Na demonstração não há PDF.');
    if (acao === 'tomador') { const l = (UIp.nfMock || []).find(x => x.gid === extra.gid); if (l) Object.assign(l, { nome: extra.nome, doc: extra.doc.replace(/\D/g, ''), email: extra.email, tipoDoc: extra.doc.replace(/\D/g, '').length === 14 ? 'CNPJ' : 'CPF' }); return { ok: true }; }
    UIp.nfMock = UIp.nfMock || [{ gid: 'g1', grupo: 'Pelada de Quinta', qtd: 46, total: 37.62, nome: 'Maria Teste da Silva', doc: '12345678909', tipoDoc: 'CPF', email: 'maria@exemplo.com' }, { gid: 'g2', grupo: 'Fut do Pina', qtd: 18, total: 12.4, nome: 'João Exemplo', doc: '', tipoDoc: '', email: '' }];
    return { mes: extra.mes, linhas: UIp.nfMock, total: UIp.nfMock.reduce((s, l) => s + l.total, 0), nfse: { ligado: true, ambiente: 'restrita', falta: [], validade: Date.now() + 300 * 864e5 } };
  }
  let t = null; try { t = await B.token(); } catch (e) { }
  if (!t) throw new Error('Entre na sua conta de novo.');
  let r; try { r = await fetch(URL_NOTAS, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + t }, body: JSON.stringify({ acao, ...(extra || {}) }) }); }
  catch (e) { throw new Error('Sem conexão com o servidor. Tente de novo.'); }
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw Object.assign(new Error(j.erro || 'Não deu certo agora. Tente de novo.'), { status: r.status });
  return j;
}
function abasDono(at) { return `<div class="pick" style="margin:6px 0 4px"><button type="button" data-sh="dono" aria-pressed="${at === 'dono'}">Visão geral</button><button type="button" data-sh="dono-grupos" aria-pressed="${at === 'grupos'}">Grupos</button><button type="button" data-sh="dono-reps" aria-pressed="${at === 'reps'}">Representantes</button><button type="button" data-sh="notas" aria-pressed="${at === 'notas'}">Notas fiscais</button></div>`; }
/* lista de grupos do painel, com várias formas de procurar */
const GF0 = { q: '', sit: 'todos', uf: '', cidade: '', pix: '', pag: '', tipo: '', dia: '', ord: 'recente' };
const DIAS_CURTO = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
const semAcento = t => String(t || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
function gruposFiltrados() { const G = ((UIp.painel || {}).dados || {}).grupos || [], F = UIp.gf || GF0, q = semAcento(F.q).trim();
  let L = G.filter(g => (!q || semAcento([g.nome, g.cidade, g.uf, g.codigo].join(' ')).includes(q))
    && (F.sit === 'todos' || (F.sit === 'ativos' ? g.ativo : !g.ativo)) && (!F.uf || g.uf === F.uf) && (!F.cidade || (g.cidade + ' · ' + g.uf) === F.cidade)
    && (!F.pix || (F.pix === 'sim') === g.pix) && (!F.pag || (F.pag === 'sim') === (g.comissaoMes > 0)) && (!F.tipo || (F.tipo === 'evento') === g.evento)
    && (F.dia === '' || g.dia === Number(F.dia)));
  const ord = { recente: (a, b) => (b.criadoEm || 0) - (a.criadoEm || 0), antigo: (a, b) => (a.criadoEm || 0) - (b.criadoEm || 0), jogadores: (a, b) => b.jogadores - a.jogadores,
    comissao: (a, b) => b.comissaoMes - a.comissaoMes, ultima: (a, b) => String(b.ultima || '').localeCompare(String(a.ultima || '')), nome: (a, b) => a.nome.localeCompare(b.nome) }[F.ord] || (() => 0);
  return L.sort(ord); }
function listaGruposHTML() { const L = gruposFiltrados(), n = v => Number(v || 0).toLocaleString('pt-BR'), rs = v => 'R$ ' + Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const dt = d => d ? d.split('-').reverse().join('/') : '—', dc = ms => ms && ms > 1e11 ? new Date(ms).toLocaleDateString('pt-BR') : '—';
  return `<p class="sub" style="margin:0">${L.length} ${L.length === 1 ? 'grupo encontrado' : 'grupos encontrados'}</p>` + (L.length ? L.map(g => `<div class="panel" style="padding:12px 14px;display:grid;gap:6px">
    <div class="row" style="justify-content:space-between;gap:10px;flex-wrap:nowrap;align-items:flex-start"><div><b style="font-size:17px">${escH(g.nome)}</b><div class="sub">${escH([g.cidade, g.uf].filter(Boolean).join(' · ') || 'Sem cidade')}${g.evento ? ' · evento' : g.dia != null ? ' · ' + DIAS_CURTO[g.dia] : ''}</div></div>
      <span class="small" style="flex:none;padding:3px 10px;border-radius:999px;font-weight:700;background:${g.ativo ? '#d8eedd' : '#e6e8e4'};color:${g.ativo ? '#0F4D27' : '#56665B'}">${g.ativo ? 'Ativo' : 'Parado'}</span></div>
    <div class="small" style="display:flex;flex-wrap:wrap;gap:4px 14px"><span>👥 ${n(g.jogadores)} no elenco · ${n(g.contas)} com conta</span><span>📅 Última pelada: ${dt(g.ultima)}</span>
      <span>${g.pix ? '💳 Pix conectado' : '💳 Sem Pix'}${g.comissaoMes > 0 ? ' · ' + rs(g.comissaoMes) + ' de comissão no mês' : ''}</span><span>🔑 Código ${escH(g.codigo || '—')}</span>${g.rep ? `<span>🤝 Representante ${escH(g.rep)}</span>` : ''}<span>🗓️ Criado em ${dc(g.criadoEm)}</span></div></div>`).join('')
    : '<p class="sub">Nenhum grupo com esses filtros.</p>'); }
function telaGruposDono() { const P = UIp.painel || {}, D = P.dados;
  if (!D) return '<h2>Grupos</h2>' + (P.erro ? `<div class="banner">${escH(P.erro)}</div>` : '<p class="lead">Carregando os grupos…</p>');
  const F = UIp.gf = UIp.gf || { ...GF0 }, G = D.grupos || [];
  const ufs = [...new Set(G.map(g => g.uf).filter(Boolean))].sort(), cids = [...new Set(G.filter(g => g.uf && (!F.uf || g.uf === F.uf)).map(g => g.cidade + ' · ' + g.uf))].sort();
  const sel = (k, rot, ops) => `<label class="field" style="margin:0"><span>${rot}</span><select data-gf="${k}">${ops.map(([v, t]) => `<option value="${escH(v)}" ${String(F[k]) === String(v) ? 'selected' : ''}>${escH(t)}</option>`).join('')}</select></label>`;
  return `<h2>Grupos</h2><p class="lead">Todos os grupos do app. Procure pelo nome, cidade, código de convite ou QR Code.</p>
  <div class="row" style="gap:8px;flex-wrap:nowrap"><label class="field" style="flex:1;min-width:0;margin:0"><input type="search" data-gf="q" value="${escH(F.q)}" placeholder="Nome, cidade ou código" aria-label="Procurar grupo"></label><button class="btn sm" data-sh="dono-qr" aria-label="Ler QR Code do grupo">📷 QR</button></div>
  <div class="pick">${[['todos', 'Todos'], ['ativos', 'Ativos'], ['parados', 'Parados']].map(([v, t]) => `<button type="button" data-sh="gf-sit" data-v="${v}" aria-pressed="${F.sit === v}">${t}</button>`).join('')}</div>
  <details class="panel" style="padding:10px 14px" ${UIp.gfAberto ? 'open' : ''}><summary data-sh="gf-abrir"><b>Mais filtros</b></summary>
    <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-top:10px">
    ${sel('uf', 'Estado', [['', 'Todos'], ...ufs.map(u => [u, u])])}
    ${sel('cidade', 'Cidade', [['', 'Todas'], ...cids.map(c => [c, c])])}
    ${sel('pix', 'Pix', [['', 'Todos'], ['sim', 'Com Pix'], ['nao', 'Sem Pix']])}
    ${sel('pag', 'Pagante', [['', 'Todos'], ['sim', 'Gerou comissão'], ['nao', 'Sem comissão']])}
    ${sel('tipo', 'Tipo', [['', 'Todos'], ['fixa', 'Fixa (toda semana)'], ['evento', 'Evento']])}
    ${sel('dia', 'Dia da pelada', [['', 'Todos'], ...DIAS_CURTO.map((d, i) => [String(i), d])])}
    </div></details>
  <div class="row" style="gap:8px;flex-wrap:nowrap;align-items:flex-end">${sel('ord', 'Ordenar por', [['recente', 'Mais novos'], ['antigo', 'Mais antigos'], ['ultima', 'Pelada mais recente'], ['jogadores', 'Mais jogadores'], ['comissao', 'Mais comissão'], ['nome', 'Nome (A–Z)']])}
    <button class="btn sm" data-sh="gf-limpar" style="flex:none">Limpar filtros</button></div>
  <div id="gf-lista" class="stack" style="gap:10px">${listaGruposHTML()}</div>`; }
/* representantes + simulador do líquido (fase 1: só cadastro; os grupos ligam na fase 2 pelo código da loja) */
const SIM0 = { preco: '19,90', loja: '15', imp: '6', com: '10', regime: 'simples' };
const REGIMES = [['simples', 'Simples Nacional'], ['presumido', 'Lucro Presumido'], ['real', 'Lucro Real'], ['outro', 'Outro']];
const numBR = v => { const x = Number(String(v ?? '').replace(/\./g, '').replace(',', '.')); return isFinite(x) ? x : 0; };
const rsBR = v => 'R$ ' + Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const pctBR = v => Number(v || 0).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + '%';
function contaSim(S, com) { const P = numBR(S.preco), loja = P * numBR(S.loja) / 100, rep = P - loja, imp = rep * numBR(S.imp) / 100, c = rep * (com ?? numBR(S.com)) / 100, liq = rep - imp - c;
  return { P, loja, rep, imp, c, liq, pct: P ? liq / P * 100 : 0 }; }
function simResultadoHTML() { const S = UIp.sim, r = contaSim(S), lin = (t, v, forte) => `<div class="row" style="justify-content:space-between;flex-wrap:nowrap;gap:8px;${forte ? 'border-top:1px solid var(--line);padding-top:8px' : ''}"><span class="small">${forte ? `<b>${t}</b>` : t}</span>${forte ? `<b class="num">${v}</b>` : `<span class="num">${v}</span>`}</div>`;
  return `${lin('Assinante paga', rsBR(r.P))}${lin(`Loja fica com ${pctBR(numBR(S.loja))}`, '− ' + rsBR(r.loja))}${lin('Chega na conta da empresa', rsBR(r.rep))}${lin(`Imposto ${pctBR(numBR(S.imp))}`, '− ' + rsBR(r.imp))}${lin(`Representante ${pctBR(numBR(S.com))}`, '− ' + rsBR(r.c))}
  ${lin('Sobra líquido', `${rsBR(r.liq)} · ${pctBR(r.pct)}`, true)}
  <div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:13px;margin-top:4px"><thead><tr style="text-align:left"><th style="padding:6px 4px">Comissão</th><th style="padding:6px 4px;text-align:right;white-space:nowrap">Representante</th><th style="padding:6px 4px;text-align:right;white-space:nowrap">Líquido</th><th style="padding:6px 4px;text-align:right;white-space:nowrap">% do bruto</th></tr></thead>
  <tbody>${[0, 10, 20, 30].map(c => { const x = contaSim(S, c); return `<tr style="border-top:1px solid var(--line)"><td style="padding:6px 4px">${c ? c + '%' : 'Sem representante'}</td><td class="num" style="padding:6px 4px;text-align:right;white-space:nowrap">${rsBR(x.c)}</td><td class="num" style="padding:6px 4px;text-align:right;white-space:nowrap">${rsBR(x.liq)}</td><td class="num" style="padding:6px 4px;text-align:right;white-space:nowrap">${pctBR(x.pct)}</td></tr>`; }).join('')}</tbody></table></div>`; }
function telaRepsDono() { const R = UIp.reps || {}, S = UIp.sim = UIp.sim || { ...SIM0 }, L = R.lista || [];
  const campo = (k, rot) => `<label class="field" style="margin:0;min-width:0"><span style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${rot}</span><input type="text" inputmode="decimal" data-sim="${k}" value="${escH(S[k])}" style="width:100%;min-width:0"></label>`;
  const ed = R.editar, e = ed === 'novo' ? { ativo: true, pct: 10, meses: 12 } : L.find(x => x.id === ed);
  const form = e ? `<form id="f-rep" class="panel stack" style="padding:14px" data-id="${escH(e.id || '')}"><b style="font-size:18px">${e.id ? 'Editar representante' : 'Novo representante'}</b>
    <label class="field" style="margin:0"><span>Nome</span><input type="text" id="r-nome" value="${escH(e.nome || '')}" placeholder="Nome do representante" required></label>
    <label class="field" style="margin:0"><span>Código do representante</span><input type="text" id="r-codigo" value="${escH(e.codigo || '')}" placeholder="Ex.: JOAO10" autocapitalize="characters" maxlength="16" ${e.id ? 'readonly style="opacity:.7"' : ''}></label>${e.id ? '<p class="sub" style="margin:-4px 0 0">O código não muda depois de criado, para os QR Codes já impressos continuarem valendo.</p>' : ''}
    <p class="sub" style="margin:-4px 0 0">Só letras e números. Na fase 2 vira o código de oferta na Apple e no Google, e é por ele que o app sabe quais grupos esse representante trouxe.</p>
    <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px">
      <label class="field" style="margin:0"><span>Comissão (%)</span><input type="text" inputmode="decimal" id="r-pct" value="${escH(String(e.pct ?? '').replace('.', ','))}"></label>
      <label class="field" style="margin:0"><span>Por quantos meses</span><input type="number" inputmode="numeric" min="0" max="120" id="r-meses" value="${escH(String(e.meses ?? 0))}"></label></div>
    <p class="sub" style="margin:-4px 0 0">Prazo contado a partir da 1ª mensalidade de cada grupo. Coloque 0 para pagar enquanto o grupo for assinante.</p>
    <label class="field" style="margin:0"><span>Chave Pix (opcional)</span><input type="text" id="r-pix" value="${escH(e.pix || e.contato || '')}" placeholder="CPF, e-mail, telefone ou chave aleatória" autocomplete="off"></label>
    <label class="field" style="margin:0"><span>WhatsApp com DDD (opcional)</span><input type="tel" id="r-whats" inputmode="tel" value="${escH(foneBR(e.whats || ''))}" placeholder="(81) 9 9999-9999"></label>
    <p class="sub" style="margin:-4px 0 0">Com o WhatsApp, você manda o relatório do mês para o parceiro com um toque.</p>
    <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px">
      <label class="field" style="margin:0;min-width:0"><span>CPF ou CNPJ (opcional)</span><input type="text" inputmode="numeric" id="r-doc" value="${escH(docBR(e.doc || ''))}" placeholder="Para o termo"></label>
      <label class="field" style="margin:0;min-width:0"><span>Dia do pagamento</span><select id="r-dia" style="width:100%">${[5, 10, 15, 20, 25].map(d => `<option value="${d}" ${Number(e.dia || 10) === d ? 'selected' : ''}>Todo dia ${d}</option>`).join('')}</select></label></div>
    <label class="field" style="margin:0"><span>Anotação (opcional)</span><input type="text" id="r-obs" value="${escH(e.obs || '')}" placeholder="Ex.: cuida da Zona Norte do Recife"></label>
    <label class="row" style="gap:8px;align-items:center"><input type="checkbox" id="r-ativo" ${e.ativo !== false ? 'checked' : ''}> <span>Ativo</span></label>
    <div class="row" style="gap:8px"><button class="btn primary" type="submit" style="flex:1">Salvar</button><button class="btn" type="button" data-sh="rep-editar" data-v="">Cancelar</button></div></form>` : '';
  const prazo = x => Number(x.meses) ? `por ${x.meses} ${Number(x.meses) === 1 ? 'mês' : 'meses'}` : 'enquanto o grupo pagar';
  const card = x => `<div class="panel" style="padding:12px 14px;display:grid;gap:4px;${x.ativo === false ? 'opacity:.6' : ''}"><div class="row" style="justify-content:space-between;flex-wrap:nowrap;gap:8px"><b>${escH(x.nome)}</b><span class="num" style="flex:none;font-size:12px;font-weight:700;letter-spacing:.06em;padding:3px 8px;border-radius:6px;background:var(--surface2,#e3e9df)">${escH(x.codigo)}</span></div>
    <span class="small">${pctBR(x.pct)} da assinatura, ${prazo(x)}${x.ativo === false ? ' · <b>inativo</b>' : ''}</span>
    <span class="sub">Por grupo assinante: ${rsBR(contaSim(S, Number(x.pct)).c)} por mês · Grupos trazidos: ${x.grupos || 0}</span>
    <span class="sub">Regra: a comissão vale enquanto o grupo mantém a assinatura Pro paga, sem interromper. Se o grupo cancelar ou deixar de pagar, a comissão daquele grupo se encerra.</span>
    ${x.pix || x.contato ? `<div class="row" style="gap:8px;flex-wrap:nowrap;align-items:center"><span class="sub" style="min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">Pix: <b>${escH(x.pix || x.contato)}</b></span><button class="btn sm" style="flex:none" data-sh="rep-copiar-pix" data-v="${escH(x.id)}">Copiar Pix</button></div>` : ''}
    ${x.whats ? `<span class="sub">WhatsApp: ${escH(foneBR(x.whats))}</span>` : ''}${x.obs ? `<span class="sub">${escH(x.obs)}</span>` : ''}
    <div class="row" style="gap:8px;margin-top:4px"><button class="btn sm" data-sh="rep-editar" data-v="${escH(x.id)}">Editar</button><button class="btn sm" data-sh="rep-qr" data-v="${escH(x.id)}">QR Code e pôster</button></div>
    <div class="row" style="gap:8px"><button class="btn sm" data-sh="rep-termo" data-v="${escH(x.id)}">📄 Termo de parceria</button><button class="btn sm" data-sh="rep-relpdf" data-v="${escH(x.id)}">📄 Relatório do mês</button></div>
    <span class="sub">Pagamento todo dia ${x.dia || 10}. Os PDFs abrem o compartilhar do celular: escolha o WhatsApp e o contato.</span></div>`;
  return `<h2>Representantes</h2><p class="lead">Quem traz grupos para o app. Você decide quanto cada um ganha e por quanto tempo.</p>
  <div class="panel" style="padding:14px;display:grid;gap:12px"><b style="font-size:18px">Quanto chega líquido</b>
    <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px">${campo('preco', 'Preço (R$/mês)')}${campo('loja', 'Taxa da loja (%)')}${campo('imp', 'Imposto (%)')}${campo('com', 'Comissão (%)')}</div>
    <div style="display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px;align-items:end"><label class="field" style="margin:0;min-width:0"><span>Regime da empresa</span><select data-sim="regime" style="width:100%">${REGIMES.map(([v, t]) => `<option value="${v}" ${S.regime === v ? 'selected' : ''}>${t}</option>`).join('')}</select></label>
      <button class="btn" type="button" data-sh="sim-salvar" style="height:48px">Salvar</button></div>
    <p class="sub" style="margin:0">${R.simSalvo ? `Salvo em ${new Date(R.simSalvo.em).toLocaleDateString('pt-BR')}: ${escH((REGIMES.find(r => r[0] === R.simSalvo.regime) || REGIMES[0])[1])}, imposto de ${pctBR(R.simSalvo.imp)}.` : 'Ainda não salvo: o imposto de 6% é só um exemplo.'} O app não descobre sozinho o regime nem a alíquota da empresa. Quem passa é a contadora; quando mudar, troque aqui e toque em Salvar.</p>
    <div id="sim-res" style="display:grid;gap:6px">${simResultadoHTML()}</div>
    <p class="sub" style="margin:0">Conta feita sobre o que a loja repassa. Apple e Google ficam com 15% no plano de pequena empresa. No Simples Nacional a alíquota sobe conforme o faturamento dos últimos 12 meses, então peça o número atualizado à contadora de tempos em tempos.</p></div>
  <details class="panel" style="padding:10px 14px" ${R.empresa ? '' : 'open'}><summary><b>Dados da empresa nos documentos</b>${R.empresa ? ` <span class="sub">· ${escH(R.empresa.nome)}</span>` : ''}</summary>
    <div class="stack" style="gap:10px;margin-top:10px">
    <label class="field" style="margin:0"><span>Razão social</span><input type="text" id="e-nome" value="${escH((R.empresa || {}).nome || '')}" placeholder="Nome da empresa que opera o Pelota FC"></label>
    <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px"><label class="field" style="margin:0;min-width:0"><span>CNPJ</span><input type="text" inputmode="numeric" id="e-cnpj" value="${escH(docBR((R.empresa || {}).cnpj || ''))}"></label>
    <label class="field" style="margin:0;min-width:0"><span>Cidade</span><input type="text" id="e-cidade" value="${escH((R.empresa || {}).cidade || '')}" placeholder="Recife"></label></div>
    <button class="btn" type="button" data-sh="empresa-salvar">Salvar dados da empresa</button>
    <p class="sub" style="margin:0">Vão no termo de parceria e no relatório em PDF.</p></div></details>
  ${form || `<button class="btn primary block" data-sh="rep-editar" data-v="novo">+ Novo representante</button><button class="btn block" data-sh="rep-qr" data-v="_geral">Pôster A4 sem representante</button>`}
  ${R.erro ? `<div class="banner">${escH(R.erro)}</div>` : ''}
  <div class="stack" style="gap:10px">${R.carregando && !R.lista ? '<p class="lead">Carregando…</p>' : L.length ? L.map(card).join('') : '<p class="sub">Nenhum representante ainda.</p>'}</div>
  <p class="sub" style="margin:0">Quem lê o QR Code do representante e cria uma pelada já fica ligado a ele (vale por 90 dias depois da leitura). O cálculo automático do que pagar chega na fase 2, junto com a assinatura nas lojas.</p>`; }
const foneBR = d => { d = String(d || '').replace(/\D/g, ''); if (d.length > 11 && d.startsWith('55')) d = d.slice(2); return d.length === 11 ? `(${d.slice(0, 2)}) ${d[2]} ${d.slice(3, 7)}-${d.slice(7)}` : d.length === 10 ? `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}` : d; };
function situacaoGrupoRep(g) {
  if (g.repEncerradoEm) return { conta: false, txt: `❌ cancelou a assinatura em ${new Date(g.repEncerradoEm).toLocaleDateString('pt-BR')} · comissão encerrada` };
  if (g.assina) return { conta: true, txt: `✅ assinatura em dia · ${rsBR(g.valorMes || 0)}` };
  return { conta: false, txt: 'ainda não assina o Pro' }; }
function relatorioRep(x) { const hoje = new Date(Date.now() - 3 * 36e5), mes = MESES[hoje.getUTCMonth()].toLowerCase() + ' de ' + hoje.getUTCFullYear();
  const L = x.gruposLista || [], S = L.map(situacaoGrupoRep), contam = S.filter(s => s.conta).length, valor = L.reduce((t, g, i) => t + (S[i].conta ? Number(g.valorMes || 0) : 0), 0);
  const prazo = Number(x.meses) ? `por até ${x.meses} ${Number(x.meses) === 1 ? 'mês' : 'meses'} de cada grupo` : 'enquanto o grupo for assinante';
  return [`*Pelota FC · Relatório do parceiro*`, `Olá, ${String(x.nome).split(' ')[0]}!`, '', `Mês: ${mes}`, `Seu código: ${x.codigo}`, `Sua comissão: ${pctBR(x.pct)} da assinatura, ${prazo}`, '',
    `*Grupos que você trouxe: ${L.length || x.grupos || 0}*`, ...L.slice(0, 30).map((g, i) => `• ${g.nome}${g.cidade ? ` (${g.cidade}${g.uf ? '/' + g.uf : ''})` : ''}\n   ${S[i].txt}`), ...(L.length > 30 ? [`• e mais ${L.length - 30}`] : []), '',
    `Grupos que contam neste mês: ${contam}`, `*Valor a receber: ${rsBR(valor)}*`, '',
    '_Regra: a comissão vale enquanto o grupo mantém a assinatura Pro paga, sem interromper. Se o grupo cancelar ou deixar de pagar, a comissão daquele grupo se encerra._',
    '', L.some(g => g.assina != null) ? 'O pagamento é feito por Pix na chave cadastrada.' : 'A assinatura Pro começa quando o app chegar às lojas. A partir daí, este relatório mostra o valor de cada mês.'].join('\n'); }
const linkRep = c => c ? LINK_APP + '?rep=' + encodeURIComponent(c) : LINK_APP;
const repDoQr = () => UIp.repqr === '_geral' ? { id: '_geral', nome: '', codigo: '' } : ((UIp.reps || {}).lista || []).find(r => r.id === UIp.repqr);
function desenhaQR(g, texto, x, y, lado) { const q = window.qrcode(0, 'M'); q.addData(texto); q.make(); const n = q.getModuleCount(), cel = Math.floor(lado / (n + 4)), tam = cel * (n + 4), ox = x + (lado - tam) / 2, oy = y + (lado - tam) / 2;
  g.fillStyle = '#fff'; g.fillRect(ox, oy, tam, tam); g.fillStyle = '#000'; for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (q.isDark(r, c)) g.fillRect(ox + (c + 2) * cel, oy + (r + 2) * cel, cel, cel); }
function quebra(g, txt, larg) { const L = []; let l = ''; for (const w of String(txt).split(' ')) { const t = l ? l + ' ' + w : w; if (g.measureText(t).width > larg && l) { L.push(l); l = w; } else l = t; } if (l) L.push(l); return L; }
const POSTER_ITENS = [['Lista de presença', 'Cada um confirma pelo app. Mensalistas, diaristas e fila de espera, sem lista no grupo.'],
  ['Times equilibrados', 'Sorteio pela posição e pela nota de cada jogador. Chega de time do dono.'],
  ['Pix automático', 'Mensalidade e diária pelo app, direto na conta do organizador. Marca pago sozinho.'],
  ['Caixa em dia', 'Entradas e saídas anotadas, com prestação de contas pronta para a galera.'],
  ['Notas e ranking', 'A galera dá as notas depois do jogo. No fim do mês sai o craque.'],
  ['Avisos no celular', 'Aviso quando a lista abre, antes do prazo e na hora de pagar. Ninguém precisa cobrar.']];
function posterRep(x) { // A4 em 300 dpi: 2480 x 3508
  const W = 2480, H = 3508, cv = document.createElement('canvas'); cv.width = W; cv.height = H; const g = cv.getContext('2d');
  const fd = "'Saira Condensed','Arial Narrow',Impact,sans-serif", ft = "Figtree,Arial,sans-serif", M = 170;
  g.fillStyle = '#EEF2EB'; g.fillRect(0, 0, W, H);
  const gr = g.createLinearGradient(0, 0, W, 900); gr.addColorStop(0, '#1B6A36'); gr.addColorStop(1, '#0F4D27'); g.fillStyle = gr;
  g.beginPath(); g.moveTo(0, 0); g.lineTo(W, 0); g.lineTo(W, 760); g.lineTo(0, 900); g.closePath(); g.fill();
  g.save(); g.globalAlpha = .07; g.fillStyle = '#fff'; for (let i = -900; i < W + 900; i += 70) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i + 10, 0); g.lineTo(i + 10 - 640, 900); g.lineTo(i - 640, 900); g.closePath(); g.fill(); } g.restore();
  g.textBaseline = 'alphabetic'; g.font = `italic 800 360px ${fd}`; const w1 = g.measureText('PELOTA ').width, w2 = g.measureText('FC').width, x0 = (W - w1 - w2) / 2;
  g.textAlign = 'left'; g.fillStyle = 'rgba(0,0,0,.22)'; g.fillText('PELOTA ', x0 + 10, 470); g.fillText('FC', x0 + w1 + 10, 470);
  g.fillStyle = '#fff'; g.fillText('PELOTA ', x0, 460); g.fillStyle = '#F2C12E'; g.fillText('FC', x0 + w1, 460);
  g.textAlign = 'center'; g.fillStyle = '#fff'; g.font = `600 96px ${ft}`; g.fillText('ORGANIZE SUA PELADA', W / 2, 620);
  g.fillStyle = '#0F4D27'; g.font = `italic 800 170px ${fd}`; g.fillText('A PELADA INTEIRA NO CELULAR', W / 2, 1060);
  g.fillStyle = '#3F5245'; g.font = `500 64px ${ft}`; g.fillText('Menos trabalho para quem organiza. Mais jogo para todo mundo.', W / 2, 1175);
  const colW = (W - 2 * M - 80) / 2, rowH = 440, y0 = 1290;
  POSTER_ITENS.forEach(([tit, txt], i) => { const cx = M + (i % 2) * (colW + 80), cy = y0 + Math.floor(i / 2) * rowH;
    g.fillStyle = '#fff'; g.beginPath(); g.roundRect(cx, cy, colW, rowH - 50, 28); g.fill(); g.strokeStyle = '#D2DBCE'; g.lineWidth = 3; g.stroke();
    g.fillStyle = i % 2 ? '#F0662A' : '#F2C12E'; g.beginPath(); g.arc(cx + 110, cy + 110, 62, 0, Math.PI * 2); g.fill();
    g.fillStyle = i % 2 ? '#fff' : '#0F4D27'; g.textAlign = 'center'; g.font = `italic 800 96px ${fd}`; g.fillText(String(i + 1), cx + 106, cy + 142);
    g.textAlign = 'left'; g.fillStyle = '#132018'; g.font = `700 64px ${ft}`; let tl = tit; while (g.measureText(tl).width > colW - 240 && tl.length > 4) tl = tl.slice(0, -2) + '…'; g.fillText(tl, cx + 200, cy + 132);
    g.fillStyle = '#3F5245'; g.font = `500 50px ${ft}`; quebra(g, txt, colW - 90).slice(0, 3).forEach((l, k) => g.fillText(l, cx + 50, cy + 230 + k * 62)); });
  const by = y0 + 3 * rowH + 20, bh = H - by - 190;
  const gb = g.createLinearGradient(0, by, W, by + bh); gb.addColorStop(0, '#1B6A36'); gb.addColorStop(1, '#0F4D27'); g.fillStyle = gb; g.beginPath(); g.roundRect(M, by, W - 2 * M, bh, 36); g.fill();
  const lado = bh - 120; g.fillStyle = '#fff'; g.beginPath(); g.roundRect(M + 60, by + 60, lado, lado, 20); g.fill(); desenhaQR(g, linkRep(x.codigo), M + 60, by + 60, lado);
  const tx = M + 60 + lado + 80, tw = W - M - 60 - tx; let ty = x.codigo ? by + 200 : by + bh / 2 - 60; g.textAlign = 'left';
  g.fillStyle = '#F2C12E'; g.font = `700 58px ${ft}`; g.fillText('APONTE A CÂMERA DO CELULAR', tx, ty);
  g.fillStyle = '#fff'; g.font = `italic 800 150px ${fd}`; quebra(g, 'CRIE SUA PELADA AGORA', tw).forEach(l => { ty += 150; g.fillText(l, tx, ty); });
  if (x.codigo) { ty += 120; g.fillStyle = 'rgba(255,255,255,.75)'; g.font = `600 50px ${ft}`; g.fillText('SEU REPRESENTANTE', tx, ty);
    ty += 90; g.fillStyle = '#fff'; g.font = `700 76px ${ft}`; let nm = x.nome; while (g.measureText(nm).width > tw && nm.length > 3) nm = nm.slice(0, -2) + '…'; g.fillText(nm, tx, ty);
    ty += 86; g.fillStyle = '#F2C12E'; g.font = `700 62px ${ft}`; g.fillText('Código ' + x.codigo, tx, ty); }
  g.textAlign = 'center'; g.fillStyle = '#3F5245'; g.font = `600 54px ${ft}`; g.fillText('Funciona no celular, iPhone ou Android.', W / 2, H - 100);
  g.fillStyle = '#F2C12E'; g.fillRect(0, H - 40, W * .64, 40); g.fillStyle = '#F0662A'; g.fillRect(W * .64, H - 40, W * .36, 40);
  return cv; }
const PAPEL = { A4: [595.28, 841.89, '21 × 29,7 cm'], A3: [841.89, 1190.55, '29,7 × 42 cm'], A2: [1190.55, 1683.78, '42 × 59,4 cm'], A1: [1683.78, 2383.94, '59,4 × 84,1 cm'] };
const TELAS_POSTER = ['poster/tela-lista.jpg', 'poster/tela-jogo.jpg', 'poster/tela-craque.jpg'];
function carregaTelas() { return UIp.telasPoster = UIp.telasPoster || Promise.all(TELAS_POSTER.map(src => new Promise((ok, erro) => { const im = new Image(); im.onload = () => ok(im); im.onerror = () => { UIp.telasPoster = null; erro(new Error('tela')); }; im.src = src + '?v=2'; }))); }
function celular(g, img, cx, cy, w, ang) { const i = w * .035, sw = w - 2 * i, sh = sw * img.height / img.width, h = sh + 2 * i;
  g.save(); g.translate(cx, cy); g.rotate(ang * Math.PI / 180);
  g.shadowColor = 'rgba(0,0,0,.45)'; g.shadowBlur = 80; g.shadowOffsetY = 40; g.fillStyle = '#0d0f0e'; g.beginPath(); g.roundRect(-w / 2, -h / 2, w, h, w * .14); g.fill();
  g.shadowColor = 'transparent'; g.strokeStyle = '#3a3f3c'; g.lineWidth = w * .008; g.stroke();
  g.beginPath(); g.roundRect(-sw / 2, -sh / 2, sw, sh, w * .11); g.save(); g.clip(); g.drawImage(img, -sw / 2, -sh / 2, sw, sh); g.restore();
  g.restore(); return h; }
async function posterGrande(x) { // A3 em ~250 dpi; desenho em unidades de 2480 x 3508
  const tel = await carregaTelas(), k = 2894 / 2480, W = 2480, H = 3508, cv = document.createElement('canvas'); cv.width = 2894; cv.height = Math.round(H * k);
  const g = cv.getContext('2d'); g.scale(k, k); const fd = "'Saira Condensed','Arial Narrow',Impact,sans-serif", ft = "Figtree,Arial,sans-serif", M = 170;
  const bg = g.createLinearGradient(0, 0, W * .4, H); bg.addColorStop(0, '#1F7A3F'); bg.addColorStop(.55, '#135A2D'); bg.addColorStop(1, '#0B3A1E'); g.fillStyle = bg; g.fillRect(0, 0, W, H);
  g.save(); g.globalAlpha = .05; g.fillStyle = '#fff'; for (let i = -H; i < W + H; i += 90) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i + 14, 0); g.lineTo(i + 14 - H * .6, H); g.lineTo(i - H * .6, H); g.closePath(); g.fill(); } g.restore();
  g.save(); g.strokeStyle = 'rgba(255,255,255,.10)'; g.lineWidth = 14; g.beginPath(); g.arc(W / 2, 1830, 820, 0, Math.PI * 2); g.stroke(); g.beginPath(); g.moveTo(0, 1830); g.lineTo(W, 1830); g.stroke();
  g.fillStyle = 'rgba(255,255,255,.10)'; g.beginPath(); g.arc(W / 2, 1830, 30, 0, Math.PI * 2); g.fill(); g.restore();
  const glow = g.createRadialGradient(W / 2, 1800, 50, W / 2, 1800, 1100); glow.addColorStop(0, 'rgba(242,193,46,.22)'); glow.addColorStop(1, 'rgba(242,193,46,0)'); g.fillStyle = glow; g.fillRect(0, 700, W, 2300);
  g.textBaseline = 'alphabetic'; g.font = `italic 800 210px ${fd}`; const w1 = g.measureText('PELOTA ').width, w2 = g.measureText('FC').width, x0 = (W - w1 - w2) / 2;
  g.textAlign = 'left'; g.fillStyle = 'rgba(0,0,0,.25)'; g.fillText('PELOTA ', x0 + 8, 318); g.fillText('FC', x0 + w1 + 8, 318);
  g.fillStyle = '#fff'; g.fillText('PELOTA ', x0, 310); g.fillStyle = '#F2C12E'; g.fillText('FC', x0 + w1, 310);
  g.textAlign = 'center'; g.fillStyle = 'rgba(255,255,255,.85)'; g.font = `600 64px ${ft}`; g.fillText('ORGANIZE SUA PELADA', W / 2, 410);
  g.font = `italic 800 270px ${fd}`; g.fillStyle = 'rgba(0,0,0,.25)'; g.fillText('CHEGA DE LISTA', W / 2 + 10, 700); g.fillText('NO GRUPO!', W / 2 + 10, 955);
  g.fillStyle = '#fff'; g.fillText('CHEGA DE LISTA', W / 2, 690); g.fillStyle = '#F2C12E'; g.fillText('NO GRUPO!', W / 2, 945);
  celular(g, tel[0], 600, 1880, 560, -9); celular(g, tel[2], W - 600, 1880, 560, 9);
  const hc = celular(g, tel[1], W / 2, 1840, 700, 0);
  const etiqueta = (txt, cx, cy, cor, ang) => { g.save(); g.translate(cx, cy); g.rotate(ang * Math.PI / 180); g.font = `italic 800 74px ${fd}`; const tw = g.measureText(txt).width + 80;
    g.fillStyle = cor; g.beginPath(); g.roundRect(-tw / 2, -62, tw, 112, 16); g.fill(); g.fillStyle = cor === '#F2C12E' ? '#0F4D27' : '#fff'; g.textAlign = 'center'; g.fillText(txt, 0, 22); g.restore(); };
  etiqueta('QUEM VAI?', 470, 1220, '#F2C12E', -9); etiqueta('O CRAQUE', W - 470, 1220, '#F0662A', 9);
  const itens = ['Lista de presença', 'Times equilibrados', 'Pix automático', 'Caixa em dia', 'Notas e ranking', 'Avisos no celular'], pw = (W - 2 * M - 60) / 3;
  itens.forEach((t, i) => { const px = M + (i % 3) * (pw + 30), py = 2700 + Math.floor(i / 3) * 140;
    g.fillStyle = 'rgba(255,255,255,.12)'; g.beginPath(); g.roundRect(px, py, pw, 110, 55); g.fill();
    g.fillStyle = '#F2C12E'; g.beginPath(); g.arc(px + 58, py + 55, 34, 0, Math.PI * 2); g.fill();
    g.strokeStyle = '#0F4D27'; g.lineWidth = 9; g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath(); g.moveTo(px + 42, py + 56); g.lineTo(px + 54, py + 68); g.lineTo(px + 75, py + 43); g.stroke();
    g.fillStyle = '#fff'; g.textAlign = 'left'; g.font = `700 52px ${ft}`; g.fillText(t, px + 112, py + 73); });
  const by = 2990, bh = 400; g.fillStyle = '#fff'; g.beginPath(); g.roundRect(M, by, W - 2 * M, bh, 36); g.fill();
  g.fillStyle = '#F2C12E'; g.beginPath(); g.roundRect(M, by + bh - 18, W - 2 * M, 18, [0, 0, 36, 36]); g.fill();
  desenhaQR(g, linkRep(x.codigo), M + 25, by + 25, bh - 60);
  const tx = M + bh + 30; let ty = x.codigo ? by + 110 : by + 170; g.textAlign = 'left';
  g.fillStyle = '#F0662A'; g.font = `700 52px ${ft}`; g.fillText('APONTE A CÂMERA DO CELULAR', tx, ty);
  ty += 140; g.fillStyle = '#0F4D27'; g.font = `italic 800 150px ${fd}`; g.fillText('CRIE SUA PELADA AGORA', tx, ty);
  if (x.codigo) { ty += 90; g.fillStyle = '#3F5245'; g.font = `600 50px ${ft}`; let lin = 'Representante: ' + x.nome; while (g.measureText(lin + ' · código ' + x.codigo).width > W - M - 40 - tx && lin.length > 20) lin = lin.slice(0, -2) + '…';
    g.fillText(lin + ' · código ', tx, ty); const wl = g.measureText(lin + ' · código ').width; g.fillStyle = '#F0662A'; g.font = `800 50px ${ft}`; g.fillText(x.codigo, tx + wl, ty); }
  g.textAlign = 'center'; g.fillStyle = 'rgba(255,255,255,.85)'; g.font = `600 48px ${ft}`; g.fillText('Funciona no celular, iPhone ou Android.', W / 2, 3470);
  return cv; }
function pdfPagina(cv, PW, PH) { return pdfPaginas([cv], PW, PH); }
function pdfPaginas(cvs, PW, PH) { // PDF com uma imagem JPEG por página
  const enc = new TextEncoder(), partes = [], offs = []; let tam = 0; const add = p => { const u = typeof p === 'string' ? enc.encode(p) : p; partes.push(u); tam += u.length; };
  const n = cvs.length, cont = `q ${PW} 0 0 ${PH} 0 0 cm /Im0 Do Q`, pg = i => 3 + i * 3; add('%PDF-1.4\n');
  offs[1] = tam; add('1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n');
  offs[2] = tam; add(`2 0 obj<</Type/Pages/Kids[${cvs.map((_, i) => pg(i) + ' 0 R').join(' ')}]/Count ${n}>>endobj\n`);
  cvs.forEach((cv, i) => { const b64 = cv.toDataURL('image/jpeg', .9).split(',')[1], bin = atob(b64), img = new Uint8Array(bin.length); for (let k = 0; k < bin.length; k++) img[k] = bin.charCodeAt(k);
    const p = pg(i); offs[p] = tam; add(`${p} 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 ${PW} ${PH}]/Resources<</XObject<</Im0 ${p + 1} 0 R>>>>/Contents ${p + 2} 0 R>>endobj\n`);
    offs[p + 1] = tam; add(`${p + 1} 0 obj<</Type/XObject/Subtype/Image/Width ${cv.width}/Height ${cv.height}/ColorSpace/DeviceRGB/BitsPerComponent 8/Filter/DCTDecode/Length ${img.length}>>stream\n`); add(img); add('\nendstream endobj\n');
    offs[p + 2] = tam; add(`${p + 2} 0 obj<</Length ${cont.length}>>stream\n${cont}\nendstream endobj\n`); });
  const tot = 3 + n * 3, xref = tam; add(`xref\n0 ${tot}\n0000000000 65535 f \n` + offs.slice(1, tot).map(o => String(o).padStart(10, '0') + ' 00000 n \n').join('') + `trailer<</Size ${tot}/Root 1 0 R>>\nstartxref\n${xref}\n%%EOF`);
  return new Blob(partes, { type: 'application/pdf' }); }
async function enviarPDF(blob, nome, titulo) { const f = new File([blob], nome, { type: 'application/pdf' });
  if (navigator.canShare && navigator.canShare({ files: [f] })) { try { await navigator.share({ files: [f], title: titulo }); return; } catch (err) { if (err && err.name === 'AbortError') return; } }
  const u = URL.createObjectURL(blob), el = document.createElement('a'); el.href = u; el.download = nome; document.body.appendChild(el); el.click(); el.remove(); setTimeout(() => URL.revokeObjectURL(u), 3000);
  aviso('PDF baixado: ' + nome + '. Mande pelo WhatsApp como documento.'); }
const docBR = d => { d = String(d || '').replace(/\D/g, ''); return d.length === 11 ? d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4') : d.length === 14 ? d.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5') : d; };
const MESES_MIN = () => MESES.map(m => m.toLowerCase());
function mesRef() { const h = new Date(Date.now() - 3 * 36e5), y = h.getUTCFullYear(), m = h.getUTCMonth(), n = new Date(Date.UTC(y, m + 1, 1));
  return { id: `${y}-${String(m + 1).padStart(2, '0')}`, nome: `${MESES_MIN()[m]} de ${y}`, prox: `${MESES_MIN()[n.getUTCMonth()]} de ${n.getUTCFullYear()}` }; }
function dataExtenso() { const h = new Date(Date.now() - 3 * 36e5); return `${h.getUTCDate()} de ${MESES_MIN()[h.getUTCMonth()]} de ${h.getUTCFullYear()}`; }
// documento A4 (200 dpi) com cabeçalho da marca; quebra de página automática
function docPDF(titulo, sub, blocos) { const W = 1654, H = 2339, M = 150, LW = W - 2 * M, pags = [], ft = "Figtree,Arial,sans-serif", fd = "'Saira Condensed','Arial Narrow',Impact,sans-serif"; let g, y;
  const nova = () => { const cv = document.createElement('canvas'); cv.width = W; cv.height = H; g = cv.getContext('2d'); pags.push(cv);
    g.fillStyle = '#fff'; g.fillRect(0, 0, W, H); const gr = g.createLinearGradient(0, 0, W, 200); gr.addColorStop(0, '#1B6A36'); gr.addColorStop(1, '#0F4D27'); g.fillStyle = gr; g.fillRect(0, 0, W, 190);
    g.textBaseline = 'alphabetic'; g.textAlign = 'left'; g.font = `italic 800 96px ${fd}`; const w1 = g.measureText('PELOTA ').width; g.fillStyle = '#fff'; g.fillText('PELOTA ', M, 128); g.fillStyle = '#F2C12E'; g.fillText('FC', M + w1, 128);
    g.textAlign = 'right'; g.fillStyle = 'rgba(255,255,255,.85)'; g.font = `600 30px ${ft}`; g.fillText('ORGANIZE SUA PELADA', W - M, 120);
    g.fillStyle = '#F2C12E'; g.fillRect(0, H - 22, W * .64, 22); g.fillStyle = '#F0662A'; g.fillRect(W * .64, H - 22, W * .36, 22); y = 300; g.textAlign = 'left'; };
  const cabe = h => { if (y + h > H - 170) nova(); };
  const linhas = (txt, font, larg) => { g.font = font; return String(txt).split('\n').flatMap(p => quebra(g, p, larg)); };
  nova(); g.textAlign = 'left'; g.fillStyle = '#0F4D27'; g.font = `800 62px ${ft}`; g.fillText(titulo, M, y); y += 56;
  if (sub) { g.fillStyle = '#56665B'; g.font = `500 32px ${ft}`; g.fillText(sub, M, y); y += 30; } y += 30; g.fillStyle = '#F2C12E'; g.fillRect(M, y, 160, 8); y += 70;
  for (const b of blocos) { g.textAlign = 'left';
    if (b.h) { cabe(120); y += 14; g.fillStyle = '#0F4D27'; g.font = `800 40px ${ft}`; g.fillText(b.h, M, y); y += 58; }
    if (b.p || b.nota) { const f = b.nota ? `500 28px ${ft}` : `500 34px ${ft}`, L = linhas(b.p || b.nota, f, LW), lh = b.nota ? 42 : 50; if (L.length <= 6) cabe(lh * L.length); for (const l of L) { cabe(lh); g.font = f; g.fillStyle = b.nota ? '#56665B' : '#132018'; g.fillText(l, M, y); y += lh; } y += 22; }
    if (b.li) for (const it of b.li) { const L = linhas(it, `500 34px ${ft}`, LW - 50); cabe(50 * L.length); g.fillStyle = '#1B6A36'; g.beginPath(); g.arc(M + 12, y - 11, 8, 0, Math.PI * 2); g.fill();
      L.forEach(l => { g.font = `500 34px ${ft}`; g.fillStyle = '#132018'; g.fillText(l, M + 46, y); y += 50; }); y += 10; }
    if (b.kv) { for (const [k, v, forte] of b.kv) { const L = linhas(v, `${forte ? 800 : 600} 34px ${ft}`, LW * .58); const h = Math.max(1, L.length) * 46 + 30; cabe(h);
        g.fillStyle = forte ? '#EEF6EF' : '#F6F8F4'; g.fillRect(M, y - 44, LW, h); g.fillStyle = '#3F5245'; g.font = `600 30px ${ft}`; g.fillText(k, M + 24, y);
        L.forEach((l, i) => { g.font = `${forte ? 800 : 600} 34px ${ft}`; g.fillStyle = forte ? '#0F4D27' : '#132018'; g.textAlign = 'right'; g.fillText(l, M + LW - 24, y + i * 46); g.textAlign = 'left'; }); y += h + 8; } y += 24; }
    if (b.tab) { const [cab, ...rows] = b.tab, cw = b.cw, X = cw.reduce((a, w, i) => (a.push(i ? a[i - 1] + cw[i - 1] * LW : M), a), []);
      const linha = (r, head) => { const Ls = r.map((c, i) => linhas(c, `${head ? 700 : 500} 28px ${ft}`, cw[i] * LW - 24)), h = Math.max(...Ls.map(l => l.length)) * 40 + 24; cabe(h);
        if (head) { g.fillStyle = '#0F4D27'; g.fillRect(M, y - 36, LW, h); } else { g.strokeStyle = '#D2DBCE'; g.lineWidth = 2; g.beginPath(); g.moveTo(M, y - 36 + h); g.lineTo(M + LW, y - 36 + h); g.stroke(); }
        Ls.forEach((L, i) => L.forEach((l, k) => { g.font = `${head ? 700 : 500} 28px ${ft}`; g.fillStyle = head ? '#fff' : '#132018'; g.fillText(l, X[i] + 12, y + k * 40); })); y += h; };
      linha(cab, true); rows.forEach(r => linha(r)); y += 40; }
    if (b.assin) { cabe(300); y += 150; const cw = (LW - 120) / 2; b.assin.forEach(([nome, papel], i) => { const x0 = M + i * (cw + 120); g.strokeStyle = '#132018'; g.lineWidth = 2; g.beginPath(); g.moveTo(x0, y); g.lineTo(x0 + cw, y); g.stroke();
        g.fillStyle = '#132018'; g.font = `700 30px ${ft}`; linhas(nome, `700 30px ${ft}`, cw).slice(0, 2).forEach((l, k) => g.fillText(l, x0, y + 46 + k * 40)); g.fillStyle = '#56665B'; g.font = `500 26px ${ft}`; g.fillText(papel, x0, y + 46 + Math.min(2, linhas(nome, `700 30px ${ft}`, cw).length) * 40); }); y += 200; } }
  pags.forEach((cv, i) => { const c = cv.getContext('2d'); c.textAlign = 'right'; c.fillStyle = '#8A9A8E'; c.font = `500 24px ${ft}`; c.fillText(`Página ${i + 1} de ${pags.length}`, W - M, H - 60); c.textAlign = 'left'; c.fillText(titulo, M, H - 60); });
  return pags; }
function termoRep(x) { const E = UIp.reps.empresa || {}, S = UIp.sim || SIM0, r = contaSim(S, Number(x.pct)), M = Number(x.meses) || 0, dia = x.dia || 10;
  const parte = `${E.nome}${E.cnpj ? ', CNPJ ' + docBR(E.cnpj) : ''}`, parc = `${x.nome}${x.doc ? (String(x.doc).length === 14 ? ', CNPJ ' : ', CPF ') + docBR(x.doc) : ''}`;
  return docPDF('Termo de parceria', `Código do parceiro: ${x.codigo}`, [
    { p: `De um lado, ${parte}, responsável pelo aplicativo Pelota FC (EMPRESA). De outro, ${parc} (PARCEIRO). As partes registram aqui as condições da parceria de indicação de grupos.` },
    { h: '1. O que o parceiro faz' }, { p: `O PARCEIRO divulga o Pelota FC e indica grupos de pelada usando o seu código ${x.codigo} e o seu QR Code. Os grupos criados a partir desse QR Code ficam ligados ao PARCEIRO.` },
    { h: '2. Comissão' }, { kv: [['Percentual', `${pctBR(x.pct)} da assinatura Pro`], ['Base de cálculo', 'Valor da assinatura que a Apple ou o Google repassam à EMPRESA'], ['Assinatura hoje', `${rsBR(r.P)} por mês por grupo`], ['Valor por grupo assinante', `${rsBR(r.c)} por mês`, true], ['Duração', M ? `Até ${M} ${M === 1 ? 'mês' : 'meses'} de cada grupo` : 'Enquanto o grupo for assinante']] },
    { nota: 'O valor por grupo acompanha o preço da assinatura e a taxa da loja. Se algum deles mudar, a EMPRESA avisa o PARCEIRO antes.' },
    { h: '3. Regra' }, { p: 'A comissão vale enquanto o grupo mantém a assinatura Pro paga, sem interromper. Se o grupo cancelar ou deixar de pagar, a comissão daquele grupo se encerra.' },
    { h: '4. Pagamento' }, { kv: [['Quando', `Todo dia ${dia} do mês seguinte`], ['Como', 'Pix'], ['Chave Pix do parceiro', x.pix || x.contato || 'a informar']] },
    { p: `Antes de cada pagamento, a EMPRESA envia ao PARCEIRO o relatório do mês, com os grupos que contaram e o valor a receber.` },
    { h: '5. Condições gerais' }, { li: ['Esta parceria não cria vínculo de emprego nem sociedade entre as partes.', 'Qualquer uma das partes pode encerrar a parceria quando quiser, avisando a outra. As comissões já apuradas até o encerramento são pagas normalmente.', 'O PARCEIRO não pode prometer condições ou descontos em nome do Pelota FC que não estejam combinados por escrito.'] },
    { p: `${E.cidade || 'Recife'}, ${dataExtenso()}.` },
    { assin: [[E.nome || 'EMPRESA', 'EMPRESA'], [x.nome, 'PARCEIRO']] }]); }
function relatorioRepPDF(x) { const E = UIp.reps.empresa || {}, L = x.gruposLista || [], St = L.map(situacaoGrupoRep), contam = St.filter(s => s.conta).length, R0 = mesRef();
  const valor = L.reduce((t, g, i) => t + (St[i].conta ? Number(g.valorMes || 0) : 0), 0), M = Number(x.meses) || 0, semAss = !L.some(g => g.assina != null);
  const sit = g => g.repEncerradoEm ? `Cancelou em ${new Date(g.repEncerradoEm).toLocaleDateString('pt-BR')} · encerrada` : g.assina ? 'Assinatura em dia' : 'Ainda não assina';
  return docPDF('Relatório do parceiro', `${R0.nome[0].toUpperCase() + R0.nome.slice(1)} · ${x.nome} · código ${x.codigo}`, [
    { kv: [['Comissão', `${pctBR(x.pct)} da assinatura${M ? `, até ${M} ${M === 1 ? 'mês' : 'meses'} de cada grupo` : ''}`], ['Grupos trazidos', String(L.length || x.grupos || 0)], ['Grupos que contam neste mês', String(contam)], ['Valor a receber', rsBR(valor), true], ['Pagamento', `Dia ${x.dia || 10} de ${R0.prox}, por Pix`], ['Chave Pix', x.pix || x.contato || 'a informar']] },
    { h: 'Grupos' }, L.length ? { tab: [['Grupo', 'Cidade', 'Situação', 'Valor'], ...L.map((g, i) => [g.nome, [g.cidade, g.uf].filter(Boolean).join('/') || '—', sit(g), St[i].conta ? rsBR(g.valorMes || 0) : '—'])], cw: [.32, .2, .33, .15] } : { p: 'Nenhum grupo ligado a este código ainda.' },
    { h: 'Regra' }, { p: 'A comissão vale enquanto o grupo mantém a assinatura Pro paga, sem interromper. Se o grupo cancelar ou deixar de pagar, a comissão daquele grupo se encerra.' },
    ...(semAss ? [{ nota: 'A assinatura Pro começa quando o app chegar às lojas. A partir daí, este relatório mostra o valor de cada mês.' }] : []),
    { nota: `Emitido por ${E.nome || 'Pelota FC'} em ${new Date().toLocaleDateString('pt-BR')}.` }]); }
function cartaoRep(x) { // cartão para imprimir: 1240 x 1748 px (A6 em 300 dpi)
  const W = 1240, H = 1748, cv = document.createElement('canvas'); cv.width = W; cv.height = H; const g = cv.getContext('2d');
  const fd = "'Saira Condensed','Arial Narrow',Impact,sans-serif", ft = "Figtree,Arial,sans-serif";
  g.fillStyle = '#EEF2EB'; g.fillRect(0, 0, W, H);
  const gr = g.createLinearGradient(0, 0, W, 520); gr.addColorStop(0, '#1B6A36'); gr.addColorStop(1, '#0F4D27'); g.fillStyle = gr;
  g.beginPath(); g.moveTo(0, 0); g.lineTo(W, 0); g.lineTo(W, 440); g.lineTo(0, 520); g.closePath(); g.fill();
  g.textAlign = 'center'; g.textBaseline = 'alphabetic';
  g.font = `italic 800 190px ${fd}`; const w1 = g.measureText('PELOTA ').width, w2 = g.measureText('FC').width, x0 = (W - w1 - w2) / 2;
  g.textAlign = 'left'; g.fillStyle = 'rgba(0,0,0,.2)'; g.fillText('PELOTA ', x0 + 6, 266); g.fillText('FC', x0 + w1 + 6, 266);
  g.fillStyle = '#fff'; g.fillText('PELOTA ', x0, 260); g.fillStyle = '#F2C12E'; g.fillText('FC', x0 + w1, 260);
  g.textAlign = 'center'; g.fillStyle = '#fff'; g.font = `600 52px ${ft}`; g.fillText('ORGANIZE SUA PELADA', W / 2, 350);
  const q = window.qrcode(0, 'M'); q.addData(linkRep(x.codigo)); q.make(); const n = q.getModuleCount(), lado = 700, cel = Math.floor(lado / (n + 4)), tam = cel * (n + 4), qx = (W - tam) / 2, qy = 540;
  g.fillStyle = '#fff'; g.fillRect(qx - 20, qy - 20, tam + 40, tam + 40); g.strokeStyle = '#D2DBCE'; g.lineWidth = 4; g.strokeRect(qx - 20, qy - 20, tam + 40, tam + 40);
  g.fillStyle = '#000'; for (let y = 0; y < n; y++) for (let z = 0; z < n; z++) if (q.isDark(y, z)) g.fillRect(qx + (z + 2) * cel, qy + (y + 2) * cel, cel, cel);
  let y = qy + tam + 100; g.fillStyle = '#132018'; g.font = `700 54px ${ft}`; g.fillText('Aponte a câmera do celular', W / 2, y);
  y += 100; g.fillStyle = '#3F5245'; g.font = `600 40px ${ft}`; g.fillText('REPRESENTANTE', W / 2, y);
  y += 88; g.fillStyle = '#0F4D27'; g.font = `italic 800 96px ${fd}`; let nome = String(x.nome || '').toUpperCase(); while (g.measureText(nome).width > W - 160 && nome.length > 3) nome = nome.slice(0, -2) + '…'; g.fillText(nome, W / 2, y);
  y += 86; g.fillStyle = '#F0662A'; g.font = `700 54px ${ft}`; g.fillText('Código ' + x.codigo, W / 2, y);
  g.fillStyle = '#F2C12E'; g.fillRect(0, H - 40, W * .64, 40); g.fillStyle = '#F0662A'; g.fillRect(W * .64, H - 40, W * .36, 40);
  return cv; }
async function carregarReps() { const R = UIp.reps = UIp.reps || {}; R.carregando = true; R.erro = null; if (TELA === 'donoreps') render();
  try { const j = MOCK ? { reps: (UIp.repsMock = UIp.repsMock || [{ id: 'r1', nome: 'João Representante', codigo: 'JOAO10', pct: 10, meses: 12, pix: 'joao@exemplo.com', whats: '81999990000', obs: 'Zona Norte do Recife', ativo: true, grupos: 2, gruposLista: [{ nome: 'Pelada do Sábado', cidade: 'Recife', uf: 'PE', criadoEm: Date.now() - 80 * 864e5, assina: true, valorMes: 1.69 }, { nome: 'Racha da Quinta', cidade: 'Olinda', uf: 'PE', criadoEm: Date.now() - 70 * 864e5, assina: true, repEncerradoEm: Date.now() - 12 * 864e5 }, { nome: 'Fut da Firma', cidade: 'Recife', uf: 'PE', criadoEm: Date.now() - 5 * 864e5, assina: null }] }]).slice(), simulador: UIp.simMock || null, empresa: UIp.empMock || null } : await notasServidor('reps');
    R.lista = j.reps; R.simSalvo = j.simulador || null; R.empresa = j.empresa || null;
    if (R.simSalvo && !UIp.simMexido) { const f = v => String(v).replace('.', ','); UIp.sim = { ...(UIp.sim || SIM0), preco: f(R.simSalvo.preco.toFixed(2)), loja: f(R.simSalvo.loja), imp: f(R.simSalvo.imp), regime: R.simSalvo.regime }; } } catch (e) { R.erro = e.message; }
  R.carregando = false; if (TELA === 'donoreps') render(); }
const REG_ORDEM = ['Nordeste', 'Sudeste', 'Sul', 'Centro-Oeste', 'Norte', 'Sem cidade informada'];
function telaDono() { const P = UIp.painel || {}, D = P.dados;
  if (P.carregando && !D) return '<h2>Painel do dono</h2><p class="lead">Contando usuários, grupos e jogadores…</p>';
  if (P.erro && !D) return `<h2>Painel do dono</h2><div class="banner">${escH(P.erro)}</div><button class="btn block" data-sh="dono-atualizar">Tentar de novo</button>`;
  if (!D) return '<h2>Painel do dono</h2>';
  const n = v => Number(v || 0).toLocaleString('pt-BR'), pl = (v, um, varios) => n(v) + ' ' + (Number(v) === 1 ? um : (varios || um + 's')), rs = v => 'R$ ' + Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const T = D.totais, C = D.contas, [a, m] = D.mes.split('-');
  const tile = (rot, val, sub) => `<div class="panel" style="padding:12px 14px;display:grid;gap:2px"><span class="sub">${rot}</span><b class="num" style="font-size:26px;line-height:1.1">${val}</b>${sub ? `<span class="sub">${sub}</span>` : ''}</div>`;
  const MET = { grupos: 'Grupos', jogadores: 'Jogadores', contas: 'Contas', pagantes: 'Pagantes' }, met = P.met || 'grupos';
  const barras = (lista, ord) => { const L = ord ? lista.slice().sort((x, y) => ord.indexOf(x.nome) - ord.indexOf(y.nome)) : lista; const max = Math.max(1, ...L.map(r => r[met] || 0));
    return L.length ? `<div style="display:grid;gap:10px">${L.map(r => `<div><div class="row" style="justify-content:space-between;flex-wrap:nowrap;gap:8px"><span class="small"><b>${escH(r.nome)}</b></span><b class="num">${n(r[met])}</b></div>
      <div style="height:12px;border-radius:6px;background:var(--surface2,#e3e9df);overflow:hidden;margin-top:4px"><div style="height:100%;width:${Math.round((r[met] || 0) / max * 100)}%;background:${r.nome === 'Sem cidade informada' ? '#9AA79E' : 'var(--pitch,#1B6A36)'};border-radius:6px"></div></div>
      <div class="sub" style="margin-top:3px">${pl(r.grupos, 'grupo')} · ${pl(r.ativos, 'ativo')} · ${pl(r.jogadores, 'jogador', 'jogadores')} · ${pl(r.contas, 'conta')} · ${pl(r.pagantes, 'pagante')}</div></div>`).join('')}</div>` : '<p class="sub" style="margin:0">Nada ainda.</p>'; };
  return `<h2>Painel do dono</h2><p class="lead">Como o app está sendo usado. Só você e a empresa veem esta tela.</p>
  <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px">
    ${tile('Contas criadas', n(C.total), `+${n(C.novas30)} nos últimos 30 dias`)}
    ${tile('Contas ativas', n(C.ativas30), 'usaram nos últimos 30 dias')}
    ${tile('Grupos', n(T.grupos), `${n(T.ativos)} com pelada nos últimos 30 dias`)}
    ${tile('Jogadores no elenco', n(T.jogadores), `${n(T.membros)} entraram com conta`)}
    ${tile('Grupos com Pix', n(T.comPix), 'Mercado Pago conectado')}
    ${tile('Grupos pagantes', n(T.pagantes), `geraram comissão em ${MESES[Number(m) - 1].toLowerCase()}`)}
    ${tile('Pix no mês', n(T.pixMes), rs(T.volumeMes) + ' movimentados')}
    ${tile('Comissão no mês', rs(T.comissaoMes), '1% dos Pix aprovados')}
  </div>
  <p class="sub" style="margin:2px 0 0">${n(C.comCidade)} de ${n(C.total)} contas já têm cidade no cadastro. As outras entram pela cidade da pelada.</p>
  <p class="sub" style="margin:2px 0 0">"Pagantes" conta quem gerou comissão no Pix. Quando a assinatura Pro existir, ela entra aqui também.</p>
  <div class="panel" style="padding:14px;display:grid;gap:12px"><b style="font-size:18px">Uso por região</b>
    <div class="pick">${Object.entries(MET).map(([k, v]) => `<button type="button" data-sh="dono-met" data-v="${k}" aria-pressed="${met === k}">${v}</button>`).join('')}</div>
    ${barras(D.regioes, REG_ORDEM)}
    ${T.semCidade ? `<p class="sub" style="margin:0">${n(T.semCidade)} grupo${T.semCidade === 1 ? '' : 's'} sem cidade. O organizador preenche em Ajustes → Cidade e Estado.</p>` : ''}</div>
  <div class="panel" style="padding:14px;display:grid;gap:12px"><b style="font-size:18px">Por estado</b>${barras(D.estados)}</div>
  <div class="panel" style="padding:14px;display:grid;gap:8px"><b style="font-size:18px">Cidades</b>
    <div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:13px"><thead><tr style="text-align:left"><th style="padding:6px 4px">Cidade</th><th style="padding:6px 4px;text-align:right">Grupos</th><th style="padding:6px 4px;text-align:right">Jog.</th><th style="padding:6px 4px;text-align:right">Contas</th><th style="padding:6px 4px;text-align:right">Pag.</th></tr></thead>
    <tbody>${D.cidades.length ? D.cidades.map(c => `<tr style="border-top:1px solid var(--line,#d2dbce)"><td style="padding:6px 4px">${escH(c.nome)}</td><td class="num" style="padding:6px 4px;text-align:right">${n(c.grupos)}</td><td class="num" style="padding:6px 4px;text-align:right">${n(c.jogadores)}</td><td class="num" style="padding:6px 4px;text-align:right">${n(c.contas)}</td><td class="num" style="padding:6px 4px;text-align:right">${n(c.pagantes)}</td></tr>`).join('') : '<tr><td colspan="5" class="sub" style="padding:6px 4px">Nenhuma cidade informada ainda.</td></tr>'}</tbody></table></div></div>
  <p class="sub" style="text-align:center;margin:0">Atualizado às ${new Date(D.em).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}${P.carregando ? ' · atualizando…' : ''}</p>
  <button class="btn block" data-sh="dono-atualizar">Atualizar números</button>`; }
async function carregarPainel() { const P = UIp.painel = UIp.painel || {}; P.carregando = true; P.erro = null; if (TELA === 'dono' || TELA === 'donogrupos') render();
  try { P.dados = MOCK ? painelMock() : await notasServidor('painel'); } catch (e) { P.erro = e.message; }
  P.carregando = false; if (TELA === 'dono' || TELA === 'donogrupos') render(); }
function painelMock() { const r = (nome, grupos, ativos, jogadores, contas, pagantes) => ({ nome, grupos, ativos, jogadores, contas, pagantes, comissaoMes: pagantes * 9.4 });
  return { em: Date.now(), mes: new Date(Date.now() - 3 * 36e5).toISOString().slice(0, 7), contas: { total: 412, novas30: 58, ativas30: 296, comCidade: 187 },
    totais: { grupos: 23, ativos: 19, jogadores: 486, membros: 351, comPix: 9, pagantes: 7, pixMes: 214, volumeMes: 5180.5, comissaoMes: 51.81, semCidade: 2 },
    regioes: [r('Nordeste', 17, 15, 372, 268, 6), r('Sudeste', 3, 2, 61, 44, 1), r('Sul', 1, 1, 18, 12, 0), r('Sem cidade informada', 2, 1, 35, 27, 0)],
    estados: [r('PE', 14, 12, 310, 221, 5), r('PB', 2, 2, 41, 30, 1), r('SP', 2, 1, 40, 29, 1), r('RN', 1, 1, 21, 17, 0), r('RJ', 1, 1, 21, 15, 0), r('RS', 1, 1, 18, 12, 0)],
    grupos: [['Pelada do Sábado', 'Recife', 'PE', 'SAB8H2', 6, 1, 22, 18, 1, 37.62], ['Fut do Pina', 'Recife', 'PE', 'PINA42', 3, 1, 16, 9, 1, 12.4], ['Racha da Quinta', 'Olinda', 'PE', 'QNT77A', 4, 1, 14, 11, 0, 0],
      ['Society dos Amigos', 'João Pessoa', 'PB', 'SOC9KP', 2, 1, 20, 15, 1, 8.1], ['Pelada da Firma', 'São Paulo', 'SP', 'FIRM3X', 5, 0, 12, 4, 0, 0], ['Baba de Domingo', 'Natal', 'RN', 'BABA21', 0, 1, 21, 17, 0, 0],
      ['Torneio de Natal', 'Recife', 'PE', 'NATAL1', null, 0, 30, 12, 1, 0]].map(([nome, cidade, uf, codigo, dia, ativo, jogadores, contas, pix, comissaoMes], i) => ({ gid: 'g' + i, nome, cidade, uf, codigo, dia: dia == null ? null : dia, evento: dia == null,
      ativo: !!ativo, jogadores, contas, pix: !!pix, pixMes: comissaoMes ? Math.round(comissaoMes / .2) : 0, comissaoMes, ultima: ativo ? '2026-10-2' + (i % 7) : '2026-08-1' + i, criadoEm: Date.now() - i * 9 * 864e5, regiao: '' })),
    cidades: [r('Recife · PE', 9, 8, 203, 146, 4), r('Olinda · PE', 3, 2, 62, 41, 1), r('Jaboatão dos Guararapes · PE', 2, 2, 45, 34, 0), r('João Pessoa · PB', 2, 2, 41, 30, 1), r('São Paulo · SP', 2, 1, 40, 29, 1), r('Natal · RN', 1, 1, 21, 17, 0), r('Rio de Janeiro · RJ', 1, 1, 21, 15, 0), r('Porto Alegre · RS', 1, 1, 18, 12, 0)] }; }
function baixarPdf(r) { const b = atob(r.pdf), u8 = new Uint8Array(b.length); for (let i = 0; i < b.length; i++) u8[i] = b.charCodeAt(i);
  const u = URL.createObjectURL(new Blob([u8], { type: 'application/pdf' })), el = document.createElement('a'); el.href = u; el.download = r.nome || 'nota.pdf'; document.body.appendChild(el); el.click(); el.remove(); setTimeout(() => URL.revokeObjectURL(u), 4000); }
// notas da comissão do organizador (administrador do grupo aberto): 'listar' ou 'pdf' {mes}
const URL_NOTA_ORG = 'https://southamerica-east1-pelada-fc-990d6.cloudfunctions.net/notaComissao';
window.notasComissao = async (acao, mes) => {
  if (MOCK) { if (acao === 'pdf') throw new Error('Na demonstração não há PDF.'); return { notas: [{ mes: '2026-09', valor: 37.62, chave: '26116062211222333000181000000000000126091234567890', teste: true }] }; }
  let t = null; try { t = await B.token(); } catch (e) { }
  if (!t) throw new Error('Entre na sua conta de novo.');
  let r; try { r = await fetch(URL_NOTA_ORG, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + t }, body: JSON.stringify({ gid: ABERTO, acao, mes }) }); }
  catch (e) { throw new Error('Sem conexão com o servidor. Tente de novo.'); }
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.erro || 'Não deu certo agora. Tente de novo.');
  if (acao === 'pdf') baixarPdf(j);
  return j;
};
async function carregarNotas() { const N = UIp.nf; N.carregando = true; N.erro = null; N.editar = null; render();
  try { N.dados = await notasServidor('relatorio', { mes: N.mes }); } catch (e) { N.erro = e.message; N.dados = null; }
  N.carregando = false; if (TELA === 'notas') render(); }
function textoNota(l, mes) { const [a, m] = mes.split('-');
  return `Tomador: ${l.nome}\n${l.tipoDoc || 'CPF'}: ${l.doc}\n${l.email ? 'E-mail: ' + l.email + '\n' : ''}Valor: ${Number(l.total).toFixed(2).replace('.', ',')}\nDescrição: Comissão de intermediação de pagamentos via aplicativo Pelota FC (grupo ${l.grupo}), competência ${m}/${a}. ${l.qtd} pagamentos por Pix.`; }
// conectar (vai para o Mercado Pago autorizar) ou desconectar a conta do grupo
window.mpConta = async acao => {
  if (!ABERTO) throw new Error('Abra a pelada de novo.');
  if (MOCK) {
    if (acao === 'desconectar') { await B.set(`grupos/${ABERTO}/config/geral`, { mpConectadoEm: null, pixAuto: false, mpDono: null, mpDonoJid: null, mpConta: null }, { merge: true }); return {}; }
    if (acao === 'info') { await B.set(`grupos/${ABERTO}/config/geral`, { mpConta: { nome: 'Maria Teste da Silva', doc: '***.456.789-**', tipoDoc: 'CPF' } }, { merge: true }); return {}; }
    await B.set(`grupos/${ABERTO}/config/geral`, { mpConectadoEm: Date.now(), mpTaxaApp: 0.01, mpTeste: false, mpDono: null, mpDonoJid: null, mpConta: { nome: 'Maria Teste da Silva', doc: '***.456.789-**', tipoDoc: 'CPF' } }, { merge: true }); aviso('Mercado Pago conectado!'); return {};
  }
  let t = null; try { t = await B.token(); } catch (e) { }
  if (!t) throw new Error('Entre na sua conta de novo.');
  let r; try { r = await fetch(URL_MPCONTA, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + t }, body: JSON.stringify({ gid: ABERTO, acao }) }); }
  catch (e) { throw new Error('Sem conexão com o servidor. Tente de novo.'); }
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.erro || 'Não deu certo agora. Tente de novo.');
  if (j.url) { ls.set('pelada.mpVolta', ABERTO); location.assign(j.url); }
  return j;
};
{ const mpVolta = MP_VOLTA;
  if (mpVolta) { history.replaceState(null, '', location.pathname + (MOCK ? '?mock=1' : ''));
    if (mpVolta === 'ok') window.__mpConfirmar = true;
    setTimeout(() => aviso(mpVolta === 'ok' ? '✅ Mercado Pago conectado! Confira se é a conta certa.' : 'Não deu para conectar o Mercado Pago. Tente de novo em Ajustes.'), 1800); } }
window.pixCriar = async ({ tipo, ref, jid }) => {
  if (!ABERTO) throw new Error('Abra a pelada de novo.');
  if (MOCK) {
    const d = { mpId: 'mock' + Date.now(), valor: 80, base: 80, status: 'pending', qr: '00020126580014br.gov.bcb.pix0136teste-mock5204000053039865802BR5925PELOTA FC TESTE6009RECIFE62070503***6304ABCD', qr64: '', link: '', criadoEm: Date.now(), tipo, ref, jid };
    await B.set(`grupos/${ABERTO}/cobrancas/${tipo}_${ref}_${jid}`, d); window.__ultimaCobranca = { gid: ABERTO, tipo, ref, jid }; return d;
  }
  let t = null; try { t = await B.token(); } catch (e) { }
  if (!t) throw new Error('Entre na sua conta de novo.');
  let r; try { r = await fetch(URL_PIX, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + t }, body: JSON.stringify({ gid: ABERTO, tipo, ref, jid }) }); }
  catch (e) { throw new Error('Sem conexão com o servidor. Tente de novo.'); }
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.erro || 'Não deu para gerar o Pix agora.');
  return j;
};
if (MOCK) window.__pixAprovar = async () => { const c = window.__ultimaCobranca; if (!c) return; const val = { s: 'pago', d: new Date().toISOString().slice(0, 10), v: 80, obs: 'Pix automático', via: 'pix', mp: 'mock' };
  if (c.tipo === 'x') { const [m, xid] = c.ref.split('~'); await B.set(`grupos/${c.gid}/caixa/${m}`, { extras: { [xid]: { pag: { [c.jid]: val } } } }, { merge: true }); return; }
  if (c.tipo === 'm') await B.set(`grupos/${c.gid}/caixa/${c.ref}`, { mens: { [c.jid]: val } }, { merge: true }); else await B.set(`grupos/${c.gid}/peladas/${c.ref}`, { diarias: { [c.jid]: val } }, { merge: true }); };
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
  if (e === 'abrir-icone') return box('📲', 'Receba os avisos da pelada', 'Para ativar as notificações, abra o Pelota FC pelo ícone na tela de início do iPhone.');
  if (e === 'sem-suporte') return box('📵', 'Notificações indisponíveis', 'Este celular não aceita notificações de app da web. No iPhone, precisa do iOS 16.4 ou mais novo.');
  if (e === 'bloqueado') return box('🔕', 'Notificações bloqueadas', 'Para liberar: Ajustes do celular → Notificações → Pelota FC → Permitir.');
  return box('🔔', 'Receba os avisos da pelada', 'Pelada marcada, times, vaga liberada e notas chegam no celular, mesmo com o app fechado.', '<button class="btn primary sm" data-sh="push-ativar" style="margin-top:8px">Ativar notificações</button>');
}

/* ================= Eventos ================= */
document.addEventListener('click', async e => {
  const b = e.target.closest('[data-sh]'); if (!b || !($('shell').contains(b) || $('leitor').contains(b))) return;
  const a = b.dataset.sh, v = b.dataset.v;
  if (a === 'ir') { if (v === 'perfil') { UIp.pos = null; UIp.foto = undefined; } ir(v); }
  if (a === 'pos') { UIp.pos = v; const keep = { nome: $('p-nome').value, ap: $('p-ap').value, tel: $('p-tel').value }; UIp.pcid = $('p-cidade').value; UIp.puf = $('p-uf').value; render(); $('p-nome').value = keep.nome; $('p-ap').value = keep.ap; $('p-tel').value = keep.tel; }
  if (a === 'pref') { UIp.prefere = v; render(); }
  if (a === 'google') { try { await B.google(); } catch (err) { aviso(msgErro(err) + ' Se não abrir, use e-mail e senha.'); } }
  if (a === 'reset') { const em = ($('l-email') || {}).value || ''; if (!em) { aviso('Digite seu e-mail acima e toque de novo em "Esqueci minha senha".'); return; } try { await B.reset(em.trim()); aviso('Mandamos um link para criar uma nova senha no seu e-mail.'); } catch (err) { aviso(msgErro(err)); } }
  if (a === 'sair') { ls.set('pelada.ultimo', null); await B.sair(); }
  if (a === 'excluir-ver') { UIp.exc = { carregando: true }; ir('excluir'); try { UIp.exc = await contaServidor('verificar'); } catch (e) { UIp.exc = {}; aviso(e.message); } if (TELA === 'excluir') render(); }
  if (a === 'excluir-ok') { if ((($('x-conf') || {}).value || '').trim().toUpperCase() !== 'EXCLUIR') { aviso('Escreva EXCLUIR para confirmar.'); return; }
    b.disabled = true; b.textContent = 'Excluindo…';
    try { await contaServidor('excluir'); ls.set('pelada.ultimo', null); UIp.exc = null; try { await B.sair(); } catch (e) { } aviso('Sua conta foi excluída.'); ir('boas'); }
    catch (e) { b.disabled = false; b.textContent = 'Excluir minha conta'; aviso(e.message); if (e.bloqueia) { UIp.exc = { bloqueia: e.bloqueia }; render(); } } }
  if (a === 'abrir') abrirGrupo(v);
  if (a === 'avaliar') { window.__abrirAval = true; abrirGrupo(v); }
  if (a === 'tipo-pel') { const ev = v === 'evento'; UIp.tipoPel = v;
    document.querySelectorAll('#n-tipo button').forEach(x => x.setAttribute('aria-pressed', String(x.dataset.v === v)));
    $('n-dia-box').hidden = ev; $('n-fixa-box').hidden = ev;
    $('n-tipo-txt').textContent = ev ? 'Sem cobrança e sem dia fixo: o administrador marca cada pelada na data que quiser, e o grupo continua para os próximos eventos. Ninguém entra como mensalista nem diarista: quem confirma primeiro garante a vaga.' : 'Tem mensalistas e diaristas, e acontece toda semana no mesmo dia.'; }
  if (a === 'push-ativar') ativarPush();
  if (a === 'dono') { ir('dono'); if (!UIp.painel || !UIp.painel.dados) carregarPainel(); }
  if (a === 'dono-atualizar') carregarPainel();
  if (a === 'dono-grupos') { ir('donogrupos'); if (!UIp.painel || !UIp.painel.dados) carregarPainel(); }
  if (a === 'dono-reps') { ir('donoreps'); carregarReps(); }
  if (a === 'rep-qr' || a === 'rep-fmt') { if (a === 'rep-qr') { UIp.repqr = v; UIp.repFmt = v === '_geral' ? (UIp.repFmt === 'a6' || !UIp.repFmt ? 'a3' : UIp.repFmt) : (UIp.repFmt || 'a6'); ir('donorepqr'); } else { UIp.repFmt = v; render(); }
    await (document.fonts ? document.fonts.ready : null); const x = repDoQr(), im = $('rep-cartao'); if (x && im) { try { UIp.repCv = UIp.repFmt === 'a3' ? await posterGrande(x) : UIp.repFmt === 'a4' ? posterRep(x) : cartaoRep(x); im.src = UIp.repCv.toDataURL('image/jpeg', .85); } catch (err) { aviso('Não consegui montar a arte. Tente de novo.'); } const gm = $('rep-gerando'); if (gm) gm.remove(); } }
  if (a === 'rep-baixar' || a === 'rep-compartilhar' || a === 'rep-pdf') { const x = repDoQr(), cv = UIp.repCv; if (!x || !cv) return;
    const pdf = a === 'rep-pdf', tam = pdf ? (($('rep-tam') || {}).value || 'A4') : '', nomeArq = `PelotaFC_${UIp.repFmt === 'a3' ? 'poster_grande' : UIp.repFmt === 'a4' ? 'poster' : 'QR'}${pdf ? '_' + tam : ''}${x.codigo ? '_' + x.codigo : ''}.${pdf ? 'pdf' : 'png'}`;
    const blob = pdf ? pdfPagina(cv, PAPEL[tam][0], PAPEL[tam][1]) : await new Promise(r => cv.toBlob(r, 'image/png'));
    if (a === 'rep-compartilhar') { try { await navigator.share({ files: [new File([blob], nomeArq, { type: 'image/png' })], title: 'Pelota FC' }); return; } catch (err) { if (err && err.name === 'AbortError') return; } }
    const u = URL.createObjectURL(blob), el = document.createElement('a'); el.href = u; el.download = nomeArq; document.body.appendChild(el); el.click(); el.remove(); setTimeout(() => URL.revokeObjectURL(u), 3000); aviso('Arquivo baixado: ' + nomeArq); }
  if (a === 'rep-copiar') { const x = repDoQr(); if (x) { try { await navigator.clipboard.writeText(linkRep(x.codigo)); aviso('Link copiado.'); } catch (err) { aviso(linkRep(x.codigo)); } } }
  if (a === 'sim-salvar') { const S = UIp.sim, d = { preco: numBR(S.preco), loja: numBR(S.loja), imp: numBR(S.imp), regime: S.regime || 'simples' };
    if (!(d.preco > 0) || !(d.loja >= 0 && d.loja <= 100) || !(d.imp >= 0 && d.imp <= 100)) { aviso('Confira os números.'); return; }
    b.disabled = true; try { if (MOCK) UIp.simMock = { ...d, em: Date.now() }; else await notasServidor('sim-salvar', d); UIp.simMexido = false; aviso('Valores salvos.'); await carregarReps(); } catch (err) { aviso(err.message); b.disabled = false; } }
  if (a === 'empresa-salvar') { const d = { nome: ($('e-nome').value || '').trim(), cnpj: ($('e-cnpj').value || '').replace(/\D/g, ''), cidade: ($('e-cidade').value || '').trim() };
    if (!d.nome) { aviso('Coloque a razão social.'); return; } if (d.cnpj && d.cnpj.length !== 14) { aviso('CNPJ incompleto.'); return; }
    b.disabled = true; try { if (MOCK) UIp.empMock = { ...d, em: Date.now() }; else await notasServidor('empresa-salvar', d); aviso('Dados da empresa salvos.'); await carregarReps(); } catch (err) { aviso(err.message); b.disabled = false; } }
  if (a === 'rep-termo' || a === 'rep-relpdf') { const x = ((UIp.reps || {}).lista || []).find(r => r.id === v); if (!x) return;
    if (!(UIp.reps || {}).empresa) { aviso('Antes, preencha os dados da empresa (logo acima).'); return; }
    b.disabled = true; try { await (document.fonts ? document.fonts.ready : null); const termo = a === 'rep-termo', pags = termo ? termoRep(x) : relatorioRepPDF(x);
      const nome = `PelotaFC_${termo ? 'termo_parceria' : 'relatorio_' + mesRef().id}_${x.codigo}.pdf`;
      await enviarPDF(pdfPaginas(pags, 595.28, 841.89), nome, termo ? `Termo de parceria Pelota FC · ${x.nome}` : `Relatório Pelota FC · ${x.nome}`); } catch (err) { aviso('Não consegui gerar o PDF. Tente de novo.'); }
    b.disabled = false; }
  if (a === 'rep-copiar-pix') { const x = ((UIp.reps || {}).lista || []).find(r => r.id === v); if (x) { const k = x.pix || x.contato; try { await navigator.clipboard.writeText(k); aviso('Chave Pix copiada.'); } catch (err) { aviso(k); } } }
  if (a === 'rep-relatorio') { const x = ((UIp.reps || {}).lista || []).find(r => r.id === v); if (!x || !x.whats) return; let n = x.whats.replace(/\D/g, ''); if (n.length <= 11) n = '55' + n;
    window.open('https://wa.me/' + n + '?text=' + encodeURIComponent(relatorioRep(x)), '_blank', 'noopener'); }
  if (a === 'rep-editar') { UIp.reps = UIp.reps || {}; UIp.reps.editar = v || null; render(); }
  if (a === 'gf-sit') { UIp.gf.sit = v; render(); }
  if (a === 'gf-limpar') { UIp.gf = { ...GF0 }; render(); }
  if (a === 'gf-abrir') { UIp.gfAberto = !UIp.gfAberto; }
  if (a === 'dono-qr') { window.__leitorDono = cod => { UIp.gf = { ...GF0, q: cod }; ir('donogrupos'); }; abrirLeitor(); }
  if (a === 'dono-verificar') { UIp.notasOk = undefined; UIp.notasErro = null; render(); }
  if (a === 'dono-met') { UIp.painel.met = v; render(); }
  if (a === 'notas') { const d = new Date(Date.now() - 3 * 36e5); d.setUTCDate(1); d.setUTCMonth(d.getUTCMonth() - 1); UIp.nf = { mes: d.toISOString().slice(0, 7) }; ir('notas'); carregarNotas(); }
  if (a === 'nf-mes') { const [y, m] = UIp.nf.mes.split('-').map(Number), d = new Date(Date.UTC(y, m - 1 + Number(v), 1)); UIp.nf.mes = d.toISOString().slice(0, 7); carregarNotas(); }
  if (a === 'nf-emitir') { b.disabled = true; b.textContent = 'Emitindo… (pode levar um minuto)'; try { const r = await notasServidor('emitir', { mes: UIp.nf.mes }); aviso(r.ok ? `${r.ok} nota${r.ok === 1 ? '' : 's'} emitida${r.ok === 1 ? '' : 's'}.` : 'Nenhuma nota nova emitida. Veja a situação de cada uma.'); } catch (err) { aviso(err.message); } carregarNotas(); }
  if (a === 'nf-pdf') { b.disabled = true; try { baixarPdf(await notasServidor('pdf', { mes: UIp.nf.mes, gid: v })); } catch (err) { aviso(err.message); } b.disabled = false; }
  if (a === 'nf-editar') { UIp.nf.editar = v || null; render(); }
  if (a === 'nf-copiar') { const l = UIp.nf.dados.linhas[Number(v)], txt = textoNota(l, UIp.nf.mes); try { await navigator.clipboard.writeText(txt); aviso('Dados da nota copiados.'); } catch (err) { aviso(txt); } }
  if (a === 'nf-planilha') { const D = UIp.nf.dados, q = x => '"' + String(x ?? '').replace(/"/g, '""') + '"';
    const linhas = [['Grupo', 'Tomador', 'Tipo', 'CPF/CNPJ', 'E-mail', 'Pix aprovados', 'Comissão (R$)', 'Descrição'].map(q).join(';')]
      .concat(D.linhas.map(l => [l.grupo, l.nome, l.tipoDoc, l.doc, l.email, l.qtd, Number(l.total).toFixed(2).replace('.', ','), textoNota(l, D.mes).split('Descrição: ')[1]].map(q).join(';')));
    const blob = new Blob(['\ufeff' + linhas.join('\r\n')], { type: 'text/csv;charset=utf-8' }), u = URL.createObjectURL(blob), el = document.createElement('a');
    el.href = u; el.download = `PelotaFC_notas_${D.mes}.csv`; document.body.appendChild(el); el.click(); el.remove(); setTimeout(() => URL.revokeObjectURL(u), 2000); }
  if (a === 'ler-qr') abrirLeitor();
  if (a === 'fechar-leitor') fecharLeitor();
  if (a === 'qr-grupo') { UIp.qrg = v; ir('qr-grupo'); }
  if (a === 'copiar-qrg') { try { await navigator.clipboard.writeText(UIp.qrLink); aviso('Link da pelada copiado.'); } catch (err) { aviso(UIp.qrLink); } }
  if (a === 'share-qrg') { try { await navigator.share({ title: 'Pelota FC', text: UIp.qrTxt }); } catch (err) { } }
  if (a === 'copiar-app') { try { await navigator.clipboard.writeText(LINK_APP); aviso('Link do app copiado.'); } catch (err) { aviso(LINK_APP); } }
  if (a === 'share-app') { try { await navigator.share({ title: 'Pelota FC', text: MSG_APP }); } catch (err) { } }
  if (a === 'aceitar') aceitarConvite();
  if (a === 'demo') { mostrarCasca(false); window.abrirDemo(); }
});
document.addEventListener('change', e => {
  const t = e.target; if (t.id !== 'p-foto' || !t.files || !t.files[0]) return;
  const keep = { nome: $('p-nome').value, ap: $('p-ap').value, tel: $('p-tel').value };
  aviso('Preparando a foto…');
  window.redimFoto(t.files[0]).then(d => { UIp.foto = d; render(); $('p-nome').value = keep.nome; $('p-ap').value = keep.ap; $('p-tel').value = keep.tel; }, () => aviso('Não consegui abrir essa foto. Tente outra.'));
});
['input', 'change'].forEach(tipo => document.addEventListener(tipo, e => {
  const el = e.target.closest && e.target.closest('[data-gf]'); if (!el || TELA !== 'donogrupos') return;
  UIp.gf = UIp.gf || { ...GF0 }; UIp.gf[el.dataset.gf] = el.value; if (el.dataset.gf === 'uf') UIp.gf.cidade = '';
  if (el.dataset.gf === 'q') { const box = $('gf-lista'); if (box) box.innerHTML = listaGruposHTML(); } else if (tipo === 'change') render();
}));
document.addEventListener('input', e => {
  const el = e.target.closest && e.target.closest('[data-sim]'); if (!el || TELA !== 'donoreps') return;
  UIp.sim = UIp.sim || { ...SIM0 }; UIp.sim[el.dataset.sim] = el.value; UIp.simMexido = true; const box = $('sim-res'); if (box) box.innerHTML = simResultadoHTML();
});
document.addEventListener('submit', async e => {
  const f = e.target; if (!$('shell').contains(f)) return; e.preventDefault();
  if (OCUPADO) return;
  const val = id => ($(id).value || '').trim();
  if (f.id === 'f-login') { if (!val('l-email') || !val('l-senha')) { aviso('Preencha e-mail e senha.'); return; } OCUPADO = true; try { await B.login(val('l-email'), $('l-senha').value); } catch (err) { aviso(msgErro(err)); } OCUPADO = false; }
  if (f.id === 'f-criar') { if (!val('c-nome2') || !val('c-email') || !$('c-senha').value) { aviso('Preencha nome, e-mail e senha.'); return; } OCUPADO = true; try { await B.cadastrar(val('c-nome2'), val('c-email'), $('c-senha').value); } catch (err) { aviso(msgErro(err)); } OCUPADO = false; }
  if (f.id === 'f-rep') { const nome = val('r-nome'), codigo = (val('r-codigo') || nome.split(' ')[0] + numBR(val('r-pct'))).toUpperCase().normalize('NFD').replace(/[^A-Z0-9]/g, '');
    const dados = { id: f.dataset.id || '', nome, codigo, pct: numBR(val('r-pct')), meses: Number(val('r-meses') || 0), pix: val('r-pix'), doc: val('r-doc').replace(/\D/g, ''), dia: Number(($('r-dia') || {}).value || 10), whats: val('r-whats').replace(/\D/g, ''), contato: '', obs: val('r-obs'), ativo: $('r-ativo').checked };
    if (!nome) { aviso('Coloque o nome.'); return; } if (codigo.length < 4) { aviso('O código precisa de pelo menos 4 letras ou números.'); return; }
    if (dados.doc && dados.doc.length !== 11 && dados.doc.length !== 14) { aviso('CPF ou CNPJ incompleto.'); return; }
    if (dados.whats && (dados.whats.length < 10 || dados.whats.length > 13)) { aviso('Confira o WhatsApp: DDD e número.'); return; }
    if (!(dados.pct >= 0 && dados.pct <= 100)) { aviso('A comissão vai de 0 a 100%.'); return; } if (!(dados.meses >= 0 && dados.meses <= 120)) { aviso('O prazo vai de 0 a 120 meses.'); return; }
    OCUPADO = true;
    try { if (MOCK) { const M = UIp.repsMock; if (M.some(x => x.codigo === codigo && x.id !== dados.id)) throw new Error('Esse código já é de outro representante.');
        const i = M.findIndex(x => x.id === dados.id); if (i >= 0) M[i] = { ...M[i], ...dados }; else M.push({ ...dados, id: 'r' + Date.now(), grupos: 0 }); }
      else await notasServidor('rep-salvar', dados);
      UIp.reps.editar = null; aviso('Representante salvo.'); await carregarReps(); } catch (err) { aviso(err.message); }
    OCUPADO = false; return; }
  if (f.id === 'f-tomador') { const doc = val('t-doc').replace(/\D/g, '');
    if (!val('t-nome')) { aviso('Coloque o nome completo.'); return; } if (doc.length !== 11 && doc.length !== 14) { aviso('CPF ou CNPJ incompleto.'); return; }
    OCUPADO = true; try { await notasServidor('tomador', { gid: f.dataset.gid, nome: val('t-nome'), doc, email: val('t-email') }); aviso('Dados salvos.'); OCUPADO = false; carregarNotas(); } catch (err) { OCUPADO = false; aviso(err.message); } return; }
  if (f.id === 'f-perfil') {
    if (!val('p-nome')) { aviso('Coloque seu nome.'); return; }
    if (!val('p-cidade') || !$('p-uf').value) { aviso('Diga sua cidade e seu estado.'); return; }
    const pos = UIp.pos || (PERFIL && PERFIL.pos) || 'MEI';
    OCUPADO = true;
    const foto = UIp.foto !== undefined ? UIp.foto : ((PERFIL && PERFIL.foto) || null);
    try { await B.set('users/' + EU.uid, { nome: val('p-nome'), apelido: val('p-ap'), tel: val('p-tel'), pos, foto, cidade: val('p-cidade'), uf: $('p-uf').value, email: EU.email || '' }, { merge: true }); PERFIL = { ...(PERFIL || {}), nome: val('p-nome'), apelido: val('p-ap'), tel: val('p-tel'), pos, foto, cidade: val('p-cidade'), uf: $('p-uf').value }; UIp.pcid = UIp.puf = undefined;
      await Promise.all(Object.keys(GRUPOS).map(g => B.set(`grupos/${g}/membros/${EU.uid}`, { nome: val('p-nome'), apelido: val('p-ap'), tel: val('p-tel'), pos, foto }, { merge: true }).catch(e => console.warn(e))));
      UIp.foto = undefined; OCUPADO = false; await depoisDoLogin(); }
    catch (err) { aviso(msgErro(err)); OCUPADO = false; }
    return;
  }
  if (f.id === 'f-nova') { if (!val('n-nome')) { aviso('Dê um nome para a pelada.'); return; } if (!val('n-cidade') || !$('n-uf').value) { aviso('Diga a cidade e o estado da pelada.'); return; }
    const ev = UIp.tipoPel === 'evento', dataEv = null;
    criarGrupo({ evento: ev, data: dataEv, nome: val('n-nome'), cidade: val('n-cidade'), uf: $('n-uf').value, dia: ev ? null : Number($('n-dia').value), hora: $('n-hora').value || '08:00', fim: $('n-fim').value || '', times: Number($('n-times').value) || 2, por: Math.max(3, Math.min(11, Number($('n-por').value) || 5)), mens: Number($('n-mens').value) || 0, diaria: Number($('n-dia2').value) || 0 }); }
  if (f.id === 'f-codigo') buscarCodigo(val('cod'));
});

/* ================= Início ================= */
(async () => {
  mostrarCasca(true); render();
  try { B = MOCK ? backendMock() : await backendReal(); }
  catch (e) { console.error(e); $('shell').innerHTML = `<div class="ob-in"><div class="ob-hero"><div class="ob-logo">Pelota<br><span>FC</span></div><p>Não foi possível conectar. Verifique a internet e abra o app de novo.</p></div></div>`; return; }
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

// Voltou ao app depois de muito tempo parado (ou o celular "acordou" o app guardado na memória):
// recomeça em "Minhas peladas", como se tivesse aberto agora.
(() => {
  const PARADO_MS = 30 * 60 * 1000;
  let saiuEm = null;
  const voltarAoInicio = () => {
    if (!EU || saiuEm == null || Date.now() - saiuEm < PARADO_MS) return;
    saiuEm = null;
    const sh = document.getElementById('sheet'); if (sh) sh.innerHTML = '';
    if (ABERTO) window.voltarGrupos(); else if (TELA !== 'minhas' && TELA !== 'perfil') ir('minhas');
    window.scrollTo(0, 0);
  };
  document.addEventListener('visibilitychange', () => { if (document.hidden) saiuEm = Date.now(); else voltarAoInicio(); });
  window.addEventListener('pagehide', () => { saiuEm = Date.now(); });
  window.addEventListener('pageshow', e => { if (e.persisted) voltarAoInicio(); });
})();
