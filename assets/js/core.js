/* Mercado ICA — núcleo do protótipo: utilitários, sessão, router, modais, toasts */
(function () {
  const ICA = (window.ICA = window.ICA || {});
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const money = (n) => new Intl.NumberFormat('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(+n || 0) + ' MT';
  const moneyShort = (n) => (n >= 1e6 ? (n / 1e6).toFixed(1).replace('.', ',') + ' M MT' : n >= 1e3 ? Math.round(n / 1e3) + ' mil MT' : money(n));
  const date = (iso) => { const d = new Date(iso); return String(d.getDate()).padStart(2, '0') + '/' + String(d.getMonth() + 1).padStart(2, '0') + '/' + d.getFullYear(); };
  const dateTime = (iso) => { const d = new Date(iso); return date(iso) + ' ' + String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); };
  const byId = (list, id) => list.find((x) => String(x.id) === String(id));

  /* ---------- Sessão simulada (sessionStorage) ---------- */
  const S = {
    get(k, d) { try { const v = sessionStorage.getItem('ica.' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { sessionStorage.setItem('ica.' + k, JSON.stringify(v)); } catch (e) { /* sem armazenamento: o protótipo continua a funcionar */ } },
    del(k) { try { sessionStorage.removeItem('ica.' + k); } catch (e) { /* ignorar */ } },
  };

  /* ---------- Ícones ---------- */
  const ICONS = {
    home: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
    cart: '<circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>',
    box: '<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>',
    users: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    user: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    settings: '<line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/>',
    chart: '<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>',
    tag: '<path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/>',
    truck: '<rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>',
    file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>',
    bell: '<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>',
    search: '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
    heart: '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>',
    logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>',
    plus: '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
    minus: '<line x1="5" y1="12" x2="19" y2="12"/>',
    edit: '<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>',
    trash: '<polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>',
    eye: '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>',
    check: '<polyline points="20 6 9 17 4 12"/>',
    x: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
    right: '<polyline points="9 18 15 12 9 6"/>',
    left: '<polyline points="15 18 9 12 15 6"/>',
    down: '<polyline points="6 9 12 15 18 9"/>',
    menu: '<line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>',
    store: '<path d="M3 9l1-5h16l1 5"/><path d="M4 9v11h16V9"/><path d="M9 20v-6h6v6"/>',
    credit: '<rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>',
    star: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
    mail: '<path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/><polyline points="22,6 12,13 2,6"/>',
    phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>',
    pin: '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>',
    percent: '<line x1="19" y1="5" x2="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
    globe: '<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
    layers: '<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>',
    refresh: '<polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
    upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>',
    filter: '<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>',
    compare: '<polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/>',
    message: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
    wallet: '<path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"/><path d="M4 6v12c0 1.1.9 2 2 2h14v-4"/><path d="M18 12a2 2 0 0 0 0 4h4v-4z"/>',
    dollar: '<line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>',
    grid: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>',
    list: '<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>',
    flag: '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/>',
    printer: '<polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>',
    lock: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    info: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>',
    clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
    trending: '<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>',
    image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>',
    external: '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>',
  };
  const icon = (n, cls = '') => '<svg class="ic ' + cls + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (ICONS[n] || ICONS.info) + '</svg>';

  /* ---------- Imagem de produto (SVG gerado, sem ficheiros externos) ---------- */
  function shade(hex, amt) {
    const n = parseInt(hex.slice(1), 16), c = (v) => Math.max(0, Math.min(255, v + amt));
    return '#' + [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => c(v).toString(16).padStart(2, '0')).join('');
  }
  function art(emoji, color, label) {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + shade(color, 95) + '"/><stop offset="1" stop-color="' + shade(color, 30) + '"/></linearGradient></defs><rect width="400" height="400" fill="url(#g)"/><circle cx="330" cy="70" r="120" fill="#fff" opacity=".18"/><circle cx="60" cy="360" r="110" fill="#000" opacity=".06"/><text x="200" y="235" font-size="150" text-anchor="middle">' + emoji + '</text>' + (label ? '<text x="200" y="360" font-size="22" font-family="Arial" font-weight="700" fill="#000" opacity=".35" text-anchor="middle">' + esc(label) + '</text>' : '') + '</svg>';
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }
  const pimg = (p, cls = '', n = 0) => { const list = (ICA.productImages && ICA.productImages[p.id]) || []; const fallback = art(n ? ['🔍', '📐', '📦', '🧰'][n % 4] : p.emoji, n ? shade(p.color, n * -18) : p.color); const src = list.length ? list[n % list.length] : fallback; return '<img class="' + cls + '" loading="lazy" referrerpolicy="no-referrer" alt="' + esc(p.name) + '" src="' + esc(src) + '"' + (list.length ? ' onerror="this.onerror=null;this.src=this.dataset.fb" data-fb="' + fallback + '"' : '') + '>'; };

  /* ---------- UI: toast (flash real), modal real, confirmação ---------- */
  const FLASH = { success: ['#D4EDDA', '#155721', 'icon-toast-done'], error: ['#F8D7DA', '#721C24', 'icon-toast-error'], warning: ['#FFF3CD', '#856404', 'icon-toast-exclamation-mark'], info: ['#E2E3E5', '#383D41', 'icon-toast-info'] };
  function toast(msg, type = 'success') {
    let box = $('#toasts');
    if (!box) { box = document.createElement('div'); box.id = 'toasts'; box.className = 'fixed top-5 z-[10003] grid justify-items-end gap-2.5 ltr:right-5'; box.setAttribute('aria-live', 'polite'); document.body.appendChild(box); }
    const f = FLASH[type] || FLASH.success;
    const t = document.createElement('div');
    t.className = 'toast flex w-max max-w-[408px] justify-between gap-12 rounded-lg px-5 py-3 max-sm:max-w-80 max-sm:items-center max-sm:gap-2 max-sm:p-3 transition duration-200';
    t.style.cssText = 'background:' + f[0] + ';color:' + f[1];
    t.innerHTML = '<p class="flex items-center break-words text-sm"><span class="' + f[2] + ' text-2xl ltr:mr-2.5" style="color:' + f[1] + '"></span>' + esc(msg) + '</p><span class="icon-cancel max-h-4 max-w-4 cursor-pointer" style="color:' + f[1] + '" data-act="toast-close"></span>';
    box.appendChild(t);
    setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 300); }, 3200);
  }
  function openModal({ title, body, footer = '', size = '' }) {
    closeModal();
    const w = size === 'lg' ? 'max-w-[820px]' : size === 'sm' ? 'max-w-[420px]' : 'max-w-[568px]';
    const m = document.createElement('div');
    m.id = 'modal';
    m.innerHTML = '<div class="fixed inset-0 z-[10001] bg-gray-500 bg-opacity-50 transition-opacity" data-act="close-modal"></div><div class="fixed inset-0 z-[10002] transform overflow-y-auto transition"><div class="flex min-h-screen items-end justify-center p-4 sm:items-center sm:p-0" data-modal-bg><div class="box-shadow relative z-[999] w-screen ' + w + ' rounded-lg bg-white max-lg:mb-4 max-lg:mt-4 max-md:w-[90%]" role="dialog" aria-modal="true" aria-label="' + esc(title) + '"><div class="flex items-center justify-between gap-2.5 border-b px-4 py-3"><p class="text-lg font-bold text-gray-800">' + esc(title) + '</p><span class="icon-cancel-1 icon-cancel cursor-pointer text-3xl hover:rounded-md hover:bg-gray-100" role="button" tabindex="0" aria-label="Fechar" data-act="close-modal"></span></div><div class="modal-body border-b px-4 py-2.5 max-h-[70vh] overflow-auto">' + body + '</div>' + (footer ? '<div class="flex justify-end gap-2.5 px-4 py-2.5">' + footer + '</div>' : '') + '</div></div></div>';
    m.querySelector('[data-modal-bg]').addEventListener('mousedown', (e) => { if (e.target === e.currentTarget) closeModal(); });
    document.body.appendChild(m);
    document.body.classList.add('overflow-hidden');
    const f = $('input,select,textarea', m); if (f) f.focus();
  }
  function closeModal() { const m = $('#modal'); if (m) m.remove(); document.body.classList.remove('overflow-hidden'); }
  function confirmBox(msg, onOk, { title = 'Confirmar', okLabel = 'Confirmar', danger = false } = {}) {
    ICA._confirm = onOk;
    openModal({ title, size: 'sm', body: '<p class="py-2 text-base text-gray-600">' + msg + '</p>', footer: '<button class="secondary-button" data-act="close-modal">Cancelar</button><button class="primary-button" ' + (danger ? 'style="background:#dc2626;border-color:#dc2626"' : '') + ' data-act="confirm-ok">' + okLabel + '</button>' });
  }
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

  /* ---------- Acções e formulários (delegação global) ---------- */
  const ACT = {};
  const FORMS = {};
  ACT['close-modal'] = closeModal;
  ACT['confirm-ok'] = () => { const f = ICA._confirm; closeModal(); if (f) f(); };
  ACT['toast'] = (el) => toast(el.dataset.msg || 'Operação simulada com sucesso.', el.dataset.type || 'success');
  ACT['back'] = () => history.back();
  ACT['toggle-class'] = (el) => { const t = $(el.dataset.target); if (t) t.classList.toggle(el.dataset.cls || 'open'); };
  ACT['confirm-toast'] = (el) => confirmBox(el.dataset.q || 'Tem a certeza?', () => { toast(el.dataset.msg || 'Concluído (simulação).'); if (el.dataset.go) location.hash = el.dataset.go; }, { danger: el.dataset.danger === '1', okLabel: el.dataset.ok || 'Confirmar' });
  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-act]');
    if (!t) { $$('.dd-menu').forEach((d) => { if (!d.parentNode.contains(e.target)) d.classList.add('hidden'); }); return; }
    const fn = ACT[t.dataset.act];
    if (fn) { e.preventDefault(); fn(t, e); }
  });
  document.addEventListener('submit', (e) => {
    const f = e.target.closest('form');
    if (!f) return;
    e.preventDefault();
    const h = FORMS[f.dataset.form];
    const data = Object.fromEntries(new FormData(f).entries());
    if (h) h(data, f);
    else { toast(f.dataset.msg || 'Guardado com sucesso (simulação).'); if (f.dataset.go) location.hash = f.dataset.go; closeModal(); }
  });
  ACT['dropdown'] = (el, e) => { e.stopPropagation(); const menu = el.parentNode.querySelector('.dd-menu'); const was = menu && !menu.classList.contains('hidden'); $$('.dd-menu').forEach((x) => x.classList.add('hidden')); if (menu && !was) menu.classList.remove('hidden'); };
  ACT['toast-close'] = (el) => { const t = el.closest('.toast'); if (t) t.remove(); };

  /* ---------- Router por hash ---------- */
  function createRouter(outlet, routes, hooks = {}) {
    const compiled = routes.map(([p, fn]) => {
      const keys = [];
      const re = new RegExp('^' + p.replace(/:([a-z]+)/gi, (m, k) => { keys.push(k); return '([^/]+)'; }) + '/?$');
      return { re, keys, fn };
    });
    function run(keepScroll) {
      const raw = location.hash.slice(1) || '/';
      const [path, qs] = raw.split('?');
      const q = Object.fromEntries(new URLSearchParams(qs || ''));
      const y = window.scrollY;
      let hit = null;
      for (const c of compiled) { const m = path.match(c.re); if (m) { const params = {}; c.keys.forEach((k, i) => (params[k] = decodeURIComponent(m[i + 1]))); hit = { c, params }; break; } }
      if (hooks.before && hooks.before(path) === false) return;
      const target = typeof outlet === 'function' ? outlet() : outlet;
      let out = hit ? hit.c.fn({ params: hit.params, q, path }) : (hooks.notFound ? hooks.notFound(path) : '<h1>404</h1>');
      let mount = null;
      if (out && typeof out === 'object') { mount = out.mount; out = out.html; }
      target.innerHTML = out;
      if (mount) mount(target);
      window.scrollTo(0, keepScroll ? y : 0);
      if (hooks.after) hooks.after(path);
    }
    window.addEventListener('hashchange', () => run(false));
    ICA.refresh = () => run(true);
    run(false);
  }

  /* ---------- Carrinho / lista de desejos / comparação (sessão) ---------- */
  const seedOnce = () => {
    if (S.get('seeded')) return;
    S.set('cart', [{ pid: 25, qty: 4 }, { pid: 22, qty: 2 }]);
    S.set('wishlist', [26, 12, 7, 28]);
    S.set('compare', [12, 16]);
    S.set('seeded', 1);
  };

  Object.assign(ICA, { $, $$, esc, money, moneyShort, date, dateTime, byId, S, icon, art, pimg, shade, toast, openModal, closeModal, confirmBox, ACT, FORMS, createRouter, seedOnce });
})();
