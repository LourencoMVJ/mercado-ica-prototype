/* Mercado ICA — painéis (fornecedor e administração) no estilo D.
   Carregado depois de ui.js e antes das páginas do painel: substitui o shell, o cabeçalho de página,
   os cartões, os indicadores e os ecrãs de entrada, para todas as páginas mudarem de uma vez. */
(function () {
  const ICA = window.ICA;
  const { $, $$, esc, icon, ACT } = ICA;
  const chev = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>';

  /* ---------- Shell: menu lateral escuro + barra de topo ---------- */
  function panelShell({ menu, user, notifications, role }) {
    const nav = menu.map((m) => {
      if (!m.children) return '<a class="dp-item" href="' + m.href + '" data-match="' + m.href + '">' + icon(m.icon) + '<span>' + esc(m.label) + '</span>' + (m.badge ? '<em>' + m.badge + '</em>' : '') + '</a>';
      return '<div class="dp-group"><button type="button" class="dp-item" data-act="nav-group" aria-expanded="false">' + icon(m.icon) + '<span>' + esc(m.label) + '</span><i class="dp-chev">' + chev + '</i></button>' +
        '<div class="dp-sub" hidden>' + m.children.map((c) => '<a href="' + c.href + '" data-match="' + c.href + '">' + esc(c.label) + '</a>').join('') + '</div></div>';
    }).join('');
    const unread = (notifications || []).length;
    document.getElementById('app').innerHTML =
      '<div class="dp"><aside id="sidebar" class="dp-side" aria-label="Menu"><a href="#/" class="dp-logo"><img src="../assets/brand/mercado-ica-mark-white.png" alt="Mercado ICA"><small>' + (role === 'admin' ? 'Administração' : 'Painel do fornecedor') + '</small></a>' +
        '<nav class="dp-nav">' + nav + '</nav>' +
        '<div class="dp-side-foot">' + (role === 'admin' ? '<a href="../comprador/index.html" target="_blank">Abrir a loja ›</a>' : '<a href="../comprador/index.html#/vendedor/' + user.shopId + '" target="_blank">Ver a minha loja ›</a>') + '<a href="../index.html">Mudar de perfil ›</a></div></aside>' +
      '<div class="dp-scrim" data-act="toggle-side"></div>' +
      '<div class="dp-main"><header class="dp-top"><button type="button" class="dp-burger" data-act="toggle-side" aria-label="Abrir menu">' + icon('menu') + '</button>' +
        '<label class="dp-search">' + icon('search') + '<span class="d-sr">Pesquisar</span><input type="search" placeholder="Pesquisar pedidos, produtos, clientes…"></label>' +
        '<div class="dp-top-acts">' +
          '<div class="dp-dd"><button type="button" class="dp-ibtn" data-act="dropdown" aria-label="Notificações">' + icon('bell') + (unread ? '<em>' + unread + '</em>' : '') + '</button><div class="dd-menu dp-menu dp-menu-wide hidden"><p>Notificações</p>' +
            (notifications || []).map((n) => '<a href="#/notificacoes"><b>' + esc(n.text) + '</b><small>' + esc(n.time) + '</small></a>').join('') + '<a href="#/notificacoes" class="dp-menu-all">Ver todas</a></div></div>' +
          '<div class="dp-dd"><button type="button" class="dp-user" data-act="dropdown"><span class="dp-av">' + esc(user.name[0]) + '</span><span class="dp-user-n">' + esc(user.name) + '</span>' + chev + '</button><div class="dd-menu dp-menu hidden"><a href="' + user.profile + '">' + (role === 'admin' ? 'A minha conta' : 'Perfil da loja') + '</a><a href="../index.html">Mudar de perfil</a><a href="#" data-act="logout">Terminar sessão</a></div></div>' +
        '</div></header><main class="dp-view"><div id="view"></div></main></div></div>';
    document.body.classList.add('d-panel');
  }
  function markNav(path) {
    $$('#sidebar a[data-match]').forEach((a) => {
      const h = a.dataset.match.slice(1), on = path === h || (h.length > 2 && path.startsWith(h + '/'));
      a.classList.toggle('on', on); if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
    $$('#sidebar .dp-group').forEach((g) => {
      const active = !!g.querySelector('a.on'), btn = g.querySelector('[data-act="nav-group"]');
      btn.classList.toggle('on', active);
      if (active) { g.querySelector('.dp-sub').hidden = false; btn.setAttribute('aria-expanded', 'true'); }
    });
    document.body.classList.remove('dp-open');
  }
  ACT['nav-group'] = (el) => { const sub = el.nextElementSibling, open = sub.hidden; sub.hidden = !open; el.setAttribute('aria-expanded', open); };
  ACT['toggle-side'] = () => document.body.classList.toggle('dp-open');

  /* ---------- Cabeçalho de página, cartões, indicadores ---------- */
  const pageHead = (title, sub, actions = '', crumbs = '') => '<div class="dp-head">' + (crumbs ? '<nav class="dp-crumbs crumbs">' + crumbs + '</nav>' : '') +
    '<div class="dp-head-row"><div><h1>' + title + '</h1>' + (sub ? '<p>' + sub + '</p>' : '') + '</div>' + (actions ? '<div class="dp-head-acts">' + actions + '</div>' : '') + '</div></div>';
  const card = (title, body, tools = '') => '<section class="dp-card">' + (title || tools ? '<header class="dp-card-h"><h2>' + (title || '') + '</h2>' + tools + '</header>' : '') + body + '</section>';
  // indicadores só com texto e números (sem ícones em caixas)
  const statCard = (label, value, delta) => '<div class="dp-kpi"><span>' + esc(label) + '</span><b>' + value + '</b>' + (delta ? '<small class="' + (String(delta).startsWith('-') ? 'dn' : 'up') + '">' + esc(delta) + ' face ao período anterior</small>' : '') + '</div>';
  const stats = (cards) => '<div class="dp-kpis">' + cards.join('') + '</div>';

  /* ---------- Entrar / registar do painel (mesmo desenho da loja) ---------- */
  const BRAND = {
    seller: ['Venda às empresas de <span>Moçambique.</span>', [['8%', 'de comissão só em vendas concluídas'], ['48 h', 'para aprovar a sua loja'], ['11', 'províncias com compradores']]],
    admin: ['Administração do <span>Mercado ICA.</span>', [['24/7', 'monitorização de pedidos e pagamentos'], ['5', 'carteiras e métodos de pagamento'], ['11', 'províncias servidas']]],
  };
  const imaliAuth = ({ back, title, sub, inner, footer }) => {
    const b = BRAND[ICA.theme === 'admin' ? 'admin' : 'seller'];
    return '<div class="d-auth-page"><aside class="d-auth-brand"><span class="d-auth-ring" aria-hidden="true"></span><a href="' + back + '" class="d-auth-home"><img src="../assets/brand/mercado-ica-mark-white.png" alt="Mercado ICA"></a>' +
      '<div class="d-auth-copy"><h2>' + b[0] + '</h2><ul>' + b[1].map((x) => '<li><b>' + x[0] + '</b>' + x[1] + '</li>').join('') + '</ul></div><div class="d-auth-pay"><small>' + (ICA.theme === 'admin' ? 'Acesso reservado à equipa ICA' : 'Receba por M-Pesa, e-Mola, mKesh ou iMali') + '</small></div></aside>' +
      '<main class="d-auth-main"><a href="' + back + '" class="d-back">‹ Voltar à loja</a><span class="d-auth-logo-m"><img src="../assets/brand/mercado-ica-mark.png" alt="Mercado ICA"></span><section class="d-auth-card"><h1>' + title + '</h1><p class="d-auth-sub">' + sub + '</p>' + inner + '</section>' +
      (footer ? '<p class="d-auth-foot">' + footer + '</p>' : '') + '<p class="d-auth-legal">© 2026 Paytek · <a href="../comprador/index.html#/pagina/termos">Termos</a> · <a href="../comprador/index.html#/pagina/privacidade">Privacidade</a> · <a href="../index.html">Mudar de perfil</a></p></main></div>';
  };
  const imaliField = (label, name, type, val, kind, ph, extra = '') => '<div class="d-fld"><label for="' + name + '">' + label + '</label>' +
    (type === 'password' ? '<div class="d-pass"><input id="' + name + '" name="' + name + '" type="password" value="' + esc(val) + '" placeholder="' + esc(ph) + '" required><button type="button" class="d-link d-link-mut" data-act="pw-toggle">Mostrar</button></div>'
      : '<input id="' + name + '" name="' + name + '" type="' + type + '" value="' + esc(val) + '" placeholder="' + esc(ph) + '" required>') + extra + '</div>';
  ACT['pw-toggle'] = (el) => { const i = el.parentNode.querySelector('input'), show = i.type === 'password'; i.type = show ? 'text' : 'password'; el.textContent = show ? 'Esconder' : 'Mostrar'; };

  /* ---------- Gráficos (SVG): curva suave, tooltip ao passar o rato, barras e anel finos ---------- */
  let gid = 0;
  const nfmt = (v) => new Intl.NumberFormat('pt-PT').format(Math.round(v));
  const smooth = (pts) => pts.map((p, i) => {
    if (!i) return 'M' + p[0] + ',' + p[1];
    const a = pts[i - 2] || pts[i - 1], b = pts[i - 1], d = pts[i + 1] || p, t = 0.18;
    return 'C' + (b[0] + (p[0] - a[0]) * t) + ',' + (b[1] + (p[1] - a[1]) * t) + ' ' + (p[0] - (d[0] - b[0]) * t) + ',' + (p[1] - (d[1] - b[1]) * t) + ' ' + p[0] + ',' + p[1];
  }).join(' ');
  const COLS = ['#3AB54A', '#A9ADA5', '#2B2B2B', '#B5E33A'];
  function lineChart(labels, series, { h = 240, fmt = (v) => v } = {}) {
    const id = ++gid, W = 720, H = h, P = { l: 8, r: 8, t: 34, b: 28 };
    const max = Math.max(...series.flatMap((s) => s.data)) * 1.12 || 1;
    const x = (i) => P.l + (i * (W - P.l - P.r)) / Math.max(1, labels.length - 1), y = (v) => H - P.b - (v / max) * (H - P.t - P.b);
    let g = '';
    for (let i = 1; i <= 3; i++) { const yy = y((max * i) / 3.36); g += '<line x1="' + P.l + '" x2="' + (W - P.r) + '" y1="' + yy + '" y2="' + yy + '" stroke="#ECEFE9" stroke-dasharray="3 5"/><text x="' + P.l + '" y="' + (yy - 6) + '" font-size="11" fill="#A9ADA5">' + esc(fmt(Math.round((max * i) / 3.36))) + '</text>'; }
    const step = labels.length > 14 ? Math.ceil(labels.length / 8) : 1;
    // etiquetas alinhadas a partir do fim: a última data aparece sempre, sem sobreposições
    labels.forEach((l, i) => { if ((labels.length - 1 - i) % step === 0) g += '<text x="' + x(i) + '" y="' + (H - 8) + '" text-anchor="' + (i === 0 ? 'start' : i === labels.length - 1 ? 'end' : 'middle') + '" font-size="11" fill="#A9ADA5">' + esc(l) + '</text>'; });
    const body = series.map((s, si) => {
      const c = s.color && si === 0 ? '#3AB54A' : COLS[si % COLS.length], pts = s.data.map((v, i) => [x(i), y(v)]), d = smooth(pts);
      const area = si === 0 ? '<path d="' + d + ' L' + x(labels.length - 1) + ',' + (H - P.b) + ' L' + x(0) + ',' + (H - P.b) + ' Z" fill="url(#dg' + id + ')"/>' : '';
      const last = pts[pts.length - 1];
      return area + '<path d="' + d + '" fill="none" stroke="' + c + '" stroke-width="' + (si ? 2 : 3) + '" stroke-linecap="round"' + (si ? ' stroke-dasharray="5 5"' : '') + '/>' +
        (si === 0 ? '<circle cx="' + last[0] + '" cy="' + last[1] + '" r="5" fill="#fff" stroke="' + c + '" stroke-width="3"/>' : '');
    }).join('');
    const data = esc(JSON.stringify({ l: labels, s: series.map((s) => ({ n: s.name, d: s.data })) }));
    const lastV = series[0].data[series[0].data.length - 1];
    return '<div class="dpc" data-chart="' + data + '" data-fmt="' + (/mil|k/.test(String(fmt(5000))) ? 'mt' : 'n') + '">' +
      '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Gráfico de linhas"><defs><linearGradient id="dg' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3AB54A" stop-opacity=".22"/><stop offset="1" stop-color="#3AB54A" stop-opacity="0"/></linearGradient></defs>' + g + body +
      '<line class="dpc-guide" x1="0" x2="0" y1="' + P.t + '" y2="' + (H - P.b) + '" stroke="#2B2B2B" stroke-width="1" opacity="0"/><circle class="dpc-dot" r="5" fill="#3AB54A" stroke="#fff" stroke-width="2" opacity="0"/></svg>' +
      '<div class="dpc-tip" hidden></div>' +
      (series.length > 1 ? '<div class="dpc-legend">' + series.map((s, si) => '<span><i style="background:' + (si ? COLS[si % COLS.length] : '#3AB54A') + '"></i>' + esc(s.name) + '</span>').join('') + '</div>' : '<div class="dpc-legend"><span>Último: <b>' + esc(String(fmt(lastV))) + '</b></span></div>') + '</div>';
  }
  // tooltip partilhado por todos os gráficos de linhas
  document.addEventListener('mousemove', (e) => {
    const box = e.target.closest && e.target.closest('.dpc');
    document.querySelectorAll('.dpc.hov').forEach((b) => { if (b !== box) { b.classList.remove('hov'); b.querySelector('.dpc-tip').hidden = true; } });
    if (!box) return;
    const svg = box.querySelector('svg'), r = svg.getBoundingClientRect(), vb = svg.viewBox.baseVal, d = JSON.parse(box.dataset.chart), n = d.l.length;
    const sx = vb.width / r.width, px = (e.clientX - r.left) * sx, i = Math.max(0, Math.min(n - 1, Math.round(((px - 8) / (vb.width - 16)) * (n - 1))));
    const X = 8 + (i * (vb.width - 16)) / Math.max(1, n - 1), max = Math.max(...d.s.flatMap((s) => s.d)) * 1.12, Y = vb.height - 28 - (d.s[0].d[i] / max) * (vb.height - 62);
    const gl = box.querySelector('.dpc-guide'), dot = box.querySelector('.dpc-dot'), tip = box.querySelector('.dpc-tip');
    gl.setAttribute('x1', X); gl.setAttribute('x2', X); gl.setAttribute('opacity', '.25'); dot.setAttribute('cx', X); dot.setAttribute('cy', Y); dot.setAttribute('opacity', '1');
    tip.innerHTML = '<small>' + esc(d.l[i]) + '</small>' + d.s.map((s) => '<span>' + esc(s.n) + ' <b>' + (box.dataset.fmt === 'mt' ? nfmt(s.d[i]) + ' MT' : nfmt(s.d[i])) + '</b></span>').join('');
    tip.hidden = false; box.classList.add('hov');
    const left = X / sx, tw = tip.offsetWidth;
    tip.style.left = Math.max(0, Math.min(r.width - tw, left - tw / 2)) + 'px'; tip.style.top = Math.max(0, Y / sx - tip.offsetHeight - 14) + 'px';
  });
  document.addEventListener('mouseleave', () => document.querySelectorAll('.dpc-tip').forEach((t) => { t.hidden = true; }), true);
  function barChart(labels, data, color, { h = 220, fmt = (v) => v } = {}) {
    const W = 720, H = h, P = { l: 8, r: 8, t: 28, b: 28 }, max = Math.max(...data) * 1.15 || 1, bw = (W - P.l - P.r) / data.length, w = Math.min(28, bw * 0.46);
    let g = '';
    for (let i = 1; i <= 3; i++) { const yy = H - P.b - ((max * i) / 3.45 / max) * (H - P.t - P.b); g += '<line x1="' + P.l + '" x2="' + (W - P.r) + '" y1="' + yy + '" y2="' + yy + '" stroke="#ECEFE9" stroke-dasharray="3 5"/>'; }
    const bars = data.map((v, i) => {
      const bh = Math.max(4, (v / max) * (H - P.t - P.b)), cx = P.l + i * bw + bw / 2, last = i === data.length - 1;
      return '<g class="dpc-bar"><title>' + esc(labels[i]) + ': ' + esc(String(fmt(v))) + '</title><rect x="' + (cx - w / 2) + '" y="' + (H - P.b - bh) + '" width="' + w + '" height="' + bh + '" rx="' + Math.min(8, w / 2) + '" fill="' + (last ? '#B5E33A' : '#2B2B2B') + '" opacity="' + (last ? 1 : .82) + '"/>' +
        (last ? '<text x="' + cx + '" y="' + (H - P.b - bh - 8) + '" text-anchor="middle" font-size="12" font-weight="800" fill="#1A1B1A">' + esc(String(fmt(v))) + '</text>' : '') +
        '<text x="' + cx + '" y="' + (H - 8) + '" text-anchor="middle" font-size="11" fill="#A9ADA5">' + esc(labels[i]) + '</text></g>';
    }).join('');
    return '<div class="dpc"><svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Gráfico de barras">' + g + bars + '</svg></div>';
  }
  function donut(items) {
    const total = items.reduce((s, i) => s + i.v, 0) || 1, R = 56, C = 2 * Math.PI * R, gap = items.length > 1 ? 6 : 0, pal = ['#3AB54A', '#2B2B2B', '#B5E33A', '#A9ADA5', '#D7DBD3'];
    let off = 0;
    const arcs = items.map((it, k) => { const len = Math.max(0, (it.v / total) * C - gap); const a = '<circle r="' + R + '" cx="70" cy="70" fill="none" stroke="' + pal[k % pal.length] + '" stroke-width="12" stroke-linecap="round" stroke-dasharray="' + len + ' ' + (C - len) + '" stroke-dashoffset="' + -(off + gap / 2) + '" transform="rotate(-90 70 70)"><title>' + esc(it.l) + ': ' + it.v + '</title></circle>'; off += (it.v / total) * C; return a; }).join('');
    return '<div class="dpc-donut"><svg viewBox="0 0 140 140" role="img" aria-label="Gráfico circular"><circle r="' + R + '" cx="70" cy="70" fill="none" stroke="#F2F4EF" stroke-width="12"/>' + arcs + '<text x="70" y="70" text-anchor="middle" font-size="26" font-weight="900" fill="#1A1B1A" font-family="Montserrat, sans-serif">' + nfmt(total) + '</text><text x="70" y="88" text-anchor="middle" font-size="10.5" fill="#5E625B">total</text></svg>' +
      '<ul>' + items.map((it, k) => '<li><i style="background:' + pal[k % pal.length] + '"></i><span>' + esc(it.l) + '</span><b>' + Math.round((it.v / total) * 100) + '%</b></li>').join('') + '</ul></div>';
  }
  const progress = (pct, label) => '<div class="dpc-prog"><i style="width:' + pct + '%"></i></div>' + (label ? '<small class="mut">' + label + '</small>' : '');

  /* seletor segmentado (substitui os <select> de período) */
  const seg = (act, opts, cur) => '<div class="dp-seg" role="group" aria-label="Período">' + opts.map((o) => '<button type="button" class="' + (o[0] === cur ? 'on' : '') + '" aria-pressed="' + (o[0] === cur) + '" data-act="' + act + '" data-v="' + o[0] + '">' + esc(o[1]) + '</button>').join('') + '</div>';

  Object.assign(ICA, { lineChart, barChart, donut, progress, seg });
  Object.assign(ICA, { sellerShell: (o) => panelShell({ ...o, role: 'seller' }), adminShellD: (o) => panelShell({ ...o, role: 'admin' }), markNav, pageHead, card, statCard, stats, imaliAuth, imaliField });
})();
