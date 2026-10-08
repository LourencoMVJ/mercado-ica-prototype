/* Mercado ICA — componentes reutilizáveis: badges, tabelas, formulários, gráficos, shell dos painéis */
(function () {
  const ICA = window.ICA;
  const { $, $$, esc, money, icon, ACT, toast, confirmBox } = ICA;

  /* ---------- Badges de estado ---------- */
  const STATUS = {
    pending: ['Pendente', 'warn'], processing: ['Em processamento', 'info'], completed: ['Concluído', 'ok'], canceled: ['Cancelado', 'bad'], closed: ['Fechado', 'mute'],
    approved: ['Aprovado', 'ok'], declined: ['Recusado', 'bad'], paid: ['Pago', 'ok'], active: ['Ativo', 'ok'], inactive: ['Inativo', 'mute'],
    received: ['Recebido', 'info'], resolved: ['Resolvido', 'ok'], draft: ['Rascunho', 'mute'], shipped: ['Enviado', 'info'], delivered: ['Entregue', 'ok'], refunded: ['Reembolsado', 'mute'],
    open: ['Aberto', 'warn'], yes: ['Sim', 'ok'], no: ['Não', 'mute'], low: ['Stock baixo', 'warn'],
  };
  const badge = (s, label) => { const m = STATUS[s] || [s, 'mute']; return '<span class="badge badge-' + m[1] + '">' + esc(label || m[0]) + '</span>'; };
  const stars = (n, size = '') => '<span class="stars ' + size + '" aria-label="' + n + ' de 5">' + [1, 2, 3, 4, 5].map((i) => '<span class="' + (i <= Math.round(n) ? 'on' : '') + '">' + icon('star') + '</span>').join('') + '</span>';

  /* ---------- Tabelas com pesquisa, filtros, ordenação e paginação ---------- */
  const TB = {};
  function tbBody(id) {
    const t = TB[id], o = t.o;
    let rows = o.rows.filter((r) => {
      if (t.q && o.searchKeys && !o.searchKeys.some((k) => String(r[k] ?? '').toLowerCase().includes(t.q.toLowerCase()))) return false;
      return Object.keys(t.f).every((k) => !t.f[k] || String(r[k]) === t.f[k]);
    });
    if (t.sort) rows = rows.slice().sort((a, b) => (a[t.sort] > b[t.sort] ? 1 : a[t.sort] < b[t.sort] ? -1 : 0) * t.dir);
    const per = o.per || 8, pages = Math.max(1, Math.ceil(rows.length / per));
    t.page = Math.min(t.page, pages);
    const view = rows.slice((t.page - 1) * per, t.page * per);
    const head = o.cols.map((c) => '<th class="' + (c.cls || '') + '">' + (c.sort === false ? esc(c.label) : '<button class="th-sort" data-act="tb-sort" data-tb="' + id + '" data-k="' + (c.sortKey || c.k) + '">' + esc(c.label) + (t.sort === (c.sortKey || c.k) ? '<i>' + (t.dir > 0 ? '▲' : '▼') + '</i>' : '') + '</button>') + '</th>').join('');
    const body = view.map((r) => '<tr' + (o.href ? ' class="row-link" data-href="' + o.href(r) + '"' : '') + '>' + o.cols.map((c) => '<td class="' + (c.cls || '') + '" data-label="' + esc(c.label) + '">' + (c.render ? c.render(r) : esc(r[c.k])) + '</td>').join('') + (o.actions ? '<td class="act-col">' + o.actions(r) + '</td>' : '') + '</tr>').join('');
    const empty = '<tr><td colspan="99" class="empty-row">' + esc(o.emptyText || 'Nenhum resultado para os filtros aplicados.') + '</td></tr>';
    return '<div class="table-scroll"><table class="tbl"><thead><tr>' + head + (o.actions ? '<th class="act-col"></th>' : '') + '</tr></thead><tbody>' + (view.length ? body : empty) + '</tbody></table></div>' +
      '<div class="tb-foot"><span>' + rows.length + ' registo' + (rows.length === 1 ? '' : 's') + '</span><div class="pager">' +
      '<button class="btn btn-ghost btn-sm" data-act="tb-page" data-tb="' + id + '" data-p="' + (t.page - 1) + '"' + (t.page <= 1 ? ' disabled' : '') + '>' + icon('left') + '</button>' +
      '<span>Página ' + t.page + ' de ' + pages + '</span>' +
      '<button class="btn btn-ghost btn-sm" data-act="tb-page" data-tb="' + id + '" data-p="' + (t.page + 1) + '"' + (t.page >= pages ? ' disabled' : '') + '>' + icon('right') + '</button></div></div>';
  }
  function table(id, o) {
    TB[id] = { o, q: '', page: 1, sort: null, dir: 1, f: {} };
    const filters = (o.filters || []).map((f) => '<select class="input input-sm" data-tb-f="' + id + '" data-k="' + f.k + '" aria-label="' + esc(f.label) + '"><option value="">' + esc(f.label) + ': todos</option>' + f.opts.map((v) => '<option value="' + (Array.isArray(v) ? v[0] : v) + '">' + esc(Array.isArray(v) ? v[1] : v) + '</option>').join('') + '</select>').join('');
    return '<div class="card table-card" id="tb-' + id + '"><div class="tb-toolbar">' +
      (o.searchKeys ? '<label class="search-box">' + icon('search') + '<input data-tb-q="' + id + '" placeholder="' + esc(o.searchPlaceholder || 'Pesquisar…') + '" aria-label="Pesquisar"></label>' : '') +
      filters + '<div class="tb-tools">' + (o.tools || '') + '</div></div><div class="tb-body">' + tbBody(id) + '</div></div>';
  }
  const tbRefresh = (id) => { const b = $('#tb-' + id + ' .tb-body'); if (b) b.innerHTML = tbBody(id); };
  ACT['tb-sort'] = (el) => { const t = TB[el.dataset.tb]; const k = el.dataset.k; t.dir = t.sort === k ? -t.dir : 1; t.sort = k; tbRefresh(el.dataset.tb); };
  ACT['tb-page'] = (el) => { TB[el.dataset.tb].page = +el.dataset.p; tbRefresh(el.dataset.tb); };
  ACT['tb-del'] = (el) => confirmBox(el.dataset.q || 'Eliminar este registo? (simulação — nada é apagado de facto ao recarregar)', () => {
    const t = TB[el.dataset.tb]; t.o.rows = t.o.rows.filter((r) => String(r.id) !== el.dataset.rid); tbRefresh(el.dataset.tb); toast('Registo eliminado.');
  }, { danger: true, okLabel: 'Eliminar', title: 'Eliminar' });
  document.addEventListener('input', (e) => { const q = e.target.dataset && e.target.dataset.tbQ; if (q) { TB[q].q = e.target.value; TB[q].page = 1; tbRefresh(q); } });
  document.addEventListener('change', (e) => { const f = e.target.dataset && e.target.dataset.tbF; if (f) { TB[f].f[e.target.dataset.k] = e.target.value; TB[f].page = 1; tbRefresh(f); } });
  document.addEventListener('click', (e) => {
    const tr = e.target.closest('tr[data-href]');
    if (tr && !e.target.closest('a,button,input,select,label')) location.hash = tr.dataset.href;
  });

  /* ---------- Botões de acção em linhas ---------- */
  const rowBtn = (ic, label, href, extra = '') => '<a class="icon-btn" title="' + esc(label) + '" aria-label="' + esc(label) + '" href="' + href + '" ' + extra + '>' + icon(ic) + '</a>';
  const delBtn = (tb, rid) => '<button class="icon-btn danger" title="Eliminar" aria-label="Eliminar" data-act="tb-del" data-tb="' + tb + '" data-rid="' + rid + '">' + icon('trash') + '</button>';

  /* ---------- Formulários ---------- */
  function field(f) {
    const id = 'f-' + f.name, v = f.value ?? '', req = f.required ? ' required' : '', ph = f.placeholder ? ' placeholder="' + esc(f.placeholder) + '"' : '';
    let ctl;
    if (f.type === 'select') ctl = '<select class="input" id="' + id + '" name="' + f.name + '"' + req + '>' + (f.options || []).map((o) => { const val = Array.isArray(o) ? o[0] : o, lab = Array.isArray(o) ? o[1] : o; return '<option value="' + esc(val) + '"' + (String(val) === String(v) ? ' selected' : '') + '>' + esc(lab) + '</option>'; }).join('') + '</select>';
    else if (f.type === 'textarea') ctl = '<textarea class="input" id="' + id + '" name="' + f.name + '" rows="' + (f.rows || 4) + '"' + req + ph + '>' + esc(v) + '</textarea>';
    else if (f.type === 'toggle') ctl = '<label class="switch"><input type="checkbox" name="' + f.name + '"' + (v ? ' checked' : '') + '><span></span></label>';
    else if (f.type === 'file') ctl = '<label class="dropzone" for="' + id + '">' + icon('upload') + '<b>Arraste ficheiros ou clique para carregar</b><small>' + esc(f.hint || 'PNG, JPG até 5 MB') + '</small><input id="' + id + '" type="file" name="' + f.name + '" hidden onchange="this.parentNode.querySelector(\'b\').textContent=this.files[0]?this.files[0].name:\'Carregar\'"></label>';
    else ctl = '<input class="input" id="' + id + '" type="' + (f.type || 'text') + '" name="' + f.name + '" value="' + esc(v) + '"' + req + ph + (f.step ? ' step="' + f.step + '"' : '') + '>';
    return '<div class="field' + (f.span ? ' span-' + f.span : '') + '"><label for="' + id + '">' + esc(f.label) + (f.required ? ' <em>*</em>' : '') + '</label>' + ctl + (f.hint && f.type !== 'file' ? '<small class="hint">' + esc(f.hint) + '</small>' : '') + '</div>';
  }
  const fields = (list) => '<div class="form-grid">' + list.map(field).join('') + '</div>';
  const card = (title, body, tools = '') => '<section class="card"><header class="card-h"><h3>' + title + '</h3>' + tools + '</header><div class="card-b">' + body + '</div></section>';
  const tabs = (items, first = 0) => '<div data-tabs class="tabs-wrap"><div class="tabs" role="tablist">' + items.map((t, i) => '<button role="tab" class="' + (i === first ? 'active' : '') + '" data-act="tab" data-tab="' + t.id + '">' + esc(t.label) + '</button>').join('') + '</div>' + items.map((t, i) => '<div class="pane ' + (i === first ? 'active' : '') + '" data-pane="' + t.id + '">' + t.html + '</div>').join('') + '</div>';
  const pageHead = (title, sub, actions = '', crumbs = '') => '<div class="page-head"><div>' + (crumbs ? '<nav class="crumbs">' + crumbs + '</nav>' : '') + '<h1>' + title + '</h1>' + (sub ? '<p>' + sub + '</p>' : '') + '</div><div class="page-actions">' + actions + '</div></div>';
  const statCard = (label, value, delta, ic, tone = '') => '<div class="stat ' + tone + '"><div class="stat-ic">' + icon(ic) + '</div><div><span>' + esc(label) + '</span><b>' + value + '</b>' + (delta ? '<small class="' + (String(delta).startsWith('-') ? 'neg' : 'pos') + '">' + esc(delta) + ' vs. período anterior</small>' : '') + '</div></div>';
  const kv = (rows) => '<dl class="kv">' + rows.map((r) => '<div><dt>' + esc(r[0]) + '</dt><dd>' + r[1] + '</dd></div>').join('') + '</dl>';

  /* ---------- Gráficos SVG ---------- */
  function lineChart(labels, series, { h = 220, fmt = (v) => v } = {}) {
    const W = 640, H = h, pad = { l: 46, r: 12, t: 12, b: 26 };
    const max = Math.max(...series.flatMap((s) => s.data)) * 1.1 || 1;
    const x = (i) => pad.l + (i * (W - pad.l - pad.r)) / Math.max(1, labels.length - 1), y = (v) => H - pad.b - (v / max) * (H - pad.t - pad.b);
    let g = '';
    for (let i = 0; i <= 4; i++) { const v = (max * i) / 4, yy = y(v); g += '<line x1="' + pad.l + '" x2="' + (W - pad.r) + '" y1="' + yy + '" y2="' + yy + '" class="gl"/><text x="' + (pad.l - 8) + '" y="' + (yy + 4) + '" text-anchor="end" class="gt">' + fmt(Math.round(v)) + '</text>'; }
    labels.forEach((l, i) => { if (labels.length <= 12 || i % 2 === 0) g += '<text x="' + x(i) + '" y="' + (H - 8) + '" text-anchor="middle" class="gt">' + esc(l) + '</text>'; });
    const paths = series.map((s, si) => {
      const pts = s.data.map((v, i) => x(i) + ',' + y(v)).join(' ');
      return '<defs><linearGradient id="ar' + si + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + s.color + '" stop-opacity=".25"/><stop offset="1" stop-color="' + s.color + '" stop-opacity="0"/></linearGradient></defs>' +
        '<polygon points="' + x(0) + ',' + (H - pad.b) + ' ' + pts + ' ' + x(labels.length - 1) + ',' + (H - pad.b) + '" fill="url(#ar' + si + ')"/><polyline points="' + pts + '" fill="none" stroke="' + s.color + '" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>' +
        s.data.map((v, i) => '<circle cx="' + x(i) + '" cy="' + y(v) + '" r="3.5" fill="#fff" stroke="' + s.color + '" stroke-width="2"><title>' + esc(s.name) + ' · ' + esc(labels[i]) + ': ' + fmt(v) + '</title></circle>').join('');
    }).join('');
    return '<svg class="chart" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Gráfico de linhas">' + g + paths + '</svg>' +
      (series.length > 1 ? '<div class="legend">' + series.map((s) => '<span><i style="background:' + s.color + '"></i>' + esc(s.name) + '</span>').join('') + '</div>' : '');
  }
  function barChart(labels, data, color = 'var(--g500)', { h = 200, fmt = (v) => v } = {}) {
    const W = 640, H = h, pad = { l: 46, r: 10, t: 12, b: 26 }, max = Math.max(...data) * 1.1 || 1, bw = (W - pad.l - pad.r) / data.length;
    let g = '';
    for (let i = 0; i <= 4; i++) { const v = (max * i) / 4, yy = H - pad.b - (v / max) * (H - pad.t - pad.b); g += '<line x1="' + pad.l + '" x2="' + (W - pad.r) + '" y1="' + yy + '" y2="' + yy + '" class="gl"/><text x="' + (pad.l - 8) + '" y="' + (yy + 4) + '" text-anchor="end" class="gt">' + fmt(Math.round(v)) + '</text>'; }
    const bars = data.map((v, i) => { const bh = (v / max) * (H - pad.t - pad.b); return '<rect x="' + (pad.l + i * bw + bw * 0.18) + '" y="' + (H - pad.b - bh) + '" width="' + bw * 0.64 + '" height="' + bh + '" rx="4" fill="' + color + '"><title>' + esc(labels[i]) + ': ' + fmt(v) + '</title></rect><text x="' + (pad.l + i * bw + bw / 2) + '" y="' + (H - 8) + '" text-anchor="middle" class="gt">' + esc(labels[i]) + '</text>'; }).join('');
    return '<svg class="chart" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Gráfico de barras">' + g + bars + '</svg>';
  }
  function donut(items) {
    const total = items.reduce((s, i) => s + i.v, 0) || 1, R = 52, C = 2 * Math.PI * R;
    let off = 0;
    const arcs = items.map((i) => { const len = (i.v / total) * C; const a = '<circle r="' + R + '" cx="70" cy="70" fill="none" stroke="' + i.c + '" stroke-width="22" stroke-dasharray="' + len + ' ' + (C - len) + '" stroke-dashoffset="' + -off + '" transform="rotate(-90 70 70)"><title>' + esc(i.l) + ': ' + i.v + '</title></circle>'; off += len; return a; }).join('');
    return '<div class="donut"><svg viewBox="0 0 140 140" role="img" aria-label="Gráfico circular">' + arcs + '<text x="70" y="76" text-anchor="middle" class="dn">' + total + '</text></svg><ul>' + items.map((i) => '<li><i style="background:' + i.c + '"></i>' + esc(i.l) + '<b>' + Math.round((i.v / total) * 100) + '%</b></li>').join('') + '</ul></div>';
  }
  const progress = (pct, label) => '<div class="progress"><div style="width:' + pct + '%"></div></div>' + (label ? '<small>' + label + '</small>' : '');

  /* ---------- Shell dos painéis (admin e cliente/vendedor) ---------- */
  function panelShell({ brand, sub, menu, user, theme, home, switchHref, notifications }) {
    const nav = menu.map((m, i) => m.children
      ? '<div class="nav-group" data-g="' + i + '"><button class="nav-item" data-act="nav-group">' + icon(m.icon) + '<span>' + esc(m.label) + '</span>' + icon('down', 'chev') + '</button><div class="nav-sub">' + m.children.map((c) => '<a href="' + c.href + '" data-match="' + c.href + '">' + esc(c.label) + '</a>').join('') + '</div></div>'
      : '<a class="nav-item" href="' + m.href + '" data-match="' + m.href + '">' + icon(m.icon) + '<span>' + esc(m.label) + '</span>' + (m.badge ? '<em>' + m.badge + '</em>' : '') + '</a>').join('');
    document.getElementById('app').innerHTML = '<div class="panel ' + theme + '"><aside class="sidebar" id="sidebar"><a class="brand" href="' + home + '"><span class="logo">ICA</span><span><b>' + esc(brand) + '</b><small>' + esc(sub) + '</small></span></a><nav>' + nav + '</nav><a class="side-foot" href="' + switchHref + '">' + icon('globe') + '<span>Mudar de perfil</span></a></aside>' +
      '<div class="scrim" data-act="toggle-class" data-target="#sidebar" data-cls="open"></div>' +
      '<div class="main"><header class="topbar"><button class="icon-btn menu-btn" data-act="toggle-class" data-target="#sidebar" data-cls="open" aria-label="Menu">' + icon('menu') + '</button>' +
      '<label class="search-box wide">' + icon('search') + '<input placeholder="Pesquisar pedidos, produtos, clientes…" aria-label="Pesquisa global"></label><div class="topbar-r">' +
      '<div class="dropdown"><button class="icon-btn" data-act="dropdown" aria-label="Notificações">' + icon('bell') + '<i class="dot"></i></button><div class="dd-menu"><h4>Notificações</h4>' + notifications.map((n) => '<a href="#/notificacoes"><b>' + esc(n.text) + '</b><small>' + esc(n.time) + '</small></a>').join('') + '</div></div>' +
      '<div class="dropdown"><button class="user-chip" data-act="dropdown"><span class="avatar">' + esc(user.name[0]) + '</span><span class="who"><b>' + esc(user.name) + '</b><small>' + esc(user.role) + '</small></span>' + icon('down') + '</button><div class="dd-menu right"><a href="' + user.profile + '">' + icon('user') + ' O meu perfil</a><a href="' + switchHref + '">' + icon('globe') + ' Mudar de perfil</a><a href="#" data-act="logout">' + icon('logout') + ' Terminar sessão</a></div></div></div></header><main id="view" class="view"></main></div></div>';
  }
  ACT['nav-group'] = (el) => el.closest('.nav-group').classList.toggle('open');
  function markNav(path) {
    $$('.sidebar a[data-match]').forEach((a) => { const h = a.dataset.match.slice(1); const on = path === h || (h.length > 2 && path.startsWith(h + '/')) || (h.length > 2 && path.startsWith(h)); a.classList.toggle('active', on); if (on) { const g = a.closest('.nav-group'); if (g) g.classList.add('open'); } });
    $('#sidebar') && $('#sidebar').classList.remove('open');
  }

  Object.assign(ICA, { badge, stars, table, tbRefresh, rowBtn, delBtn, field, fields, card, tabs, pageHead, statCard, kv, lineChart, barChart, donut, progress, panelShell, markNav, STATUS });
})();
