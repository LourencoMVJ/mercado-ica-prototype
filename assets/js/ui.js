/* Mercado ICA — componentes partilhados (markup e classes reais do Bagisto: admin, vendedor e loja) */
(function () {
  const ICA = window.ICA;
  const { $, $$, esc, money, ACT, toast, confirmBox } = ICA;
  const theme = () => ICA.theme || 'admin'; // 'shop' | 'seller' | 'admin'

  /* ---------- Ícones (fontes de ícones reais de cada tema) ---------- */
  const ICONS = {
    admin: { eye: 'icon-view', edit: 'icon-edit', trash: 'icon-delete', download: 'icon-admin-export', upload: 'icon-clip', plus: 'icon-cross', check: 'icon-tick', x: 'icon-cancel-1', search: 'icon-search', left: 'icon-arrow-left', right: 'icon-arrow-right', down: 'icon-arrow-down', up: 'icon-arrow-up', star: 'icon-star-fill', external: 'icon-store', refresh: 'icon-repeat', print: 'icon-printer', mail: 'icon-mail', calendar: 'icon-calendar', info: 'icon-information', cart: 'icon-cart', user: 'icon-customer', home: 'icon-dashboard', file: 'icon-cms', truck: 'icon-ship', dollar: 'icon-sales' },
    seller: { eye: 'mp-eye-icon', edit: 'mp-pen-icon', trash: 'mp-delete-icon', download: 'mp-export-icon', upload: 'mp-upload-icon', plus: 'icon-add-new', check: 'mp-checked-icon', x: 'mp-cancel-icon', search: 'mp-search-icon', left: 'mp-arrow-left-stylish-icon', right: 'mp-arrow-right-icon', down: 'mp-arrow-down-icon', up: 'mp-arrow-down-icon', star: 'mp-star-fill-icon', external: 'mp-store-icon', refresh: 'mp-history-icon', print: 'mp-export-icon', mail: 'mp-email-icon', calendar: 'mp-calendar-icon', info: 'mp-issue-icon', cart: 'mp-orders-icon', user: 'icon-users', home: 'mp-home-icon', file: 'mp-file-attribute-icon', truck: 'mp-delivery-icon', dollar: 'mp-payments-icon' },
    shop: { eye: 'icon-eye', edit: 'icon-edit', trash: 'icon-bin', download: 'icon-download', upload: 'icon-camera', plus: 'icon-plus', check: 'icon-tick', x: 'icon-cancel', search: 'icon-search', left: 'icon-arrow-left', right: 'icon-arrow-right', down: 'icon-arrow-down', up: 'icon-arrow-up', star: 'icon-star-fill', external: 'icon-share', refresh: 'icon-orders', print: 'icon-download', mail: 'icon-email', calendar: 'icon-calendar', info: 'icon-error', cart: 'icon-cart', user: 'icon-users', home: 'icon-product', file: 'icon-orders', truck: 'icon-truck', dollar: 'icon-dollar-sign' },
  };
  const ico = (n, extra = '') => '<span class="' + (ICONS[theme()][n] || ICONS[theme()].info) + ' ' + extra + '" aria-hidden="true"></span>';
  ICA.ico = ico;

  /* ---------- Etiquetas de estado (label-*) ---------- */
  const STATUS = {
    pending: ['Pendente', 'pending'], processing: ['Em processamento', 'processing'], completed: ['Concluído', 'completed'], canceled: ['Cancelado', 'canceled'], closed: ['Fechado', 'closed'],
    approved: ['Aprovado', 'active'], declined: ['Recusado', 'canceled'], paid: ['Pago', 'completed'], active: ['Ativo', 'active'], inactive: ['Inativo', 'closed'],
    received: ['Recebido', 'processing'], resolved: ['Resolvido', 'completed'], draft: ['Rascunho', 'closed'], shipped: ['Enviado', 'processing'], delivered: ['Entregue', 'completed'], refunded: ['Reembolsado', 'closed'],
    open: ['Aberto', 'pending'], yes: ['Sim', 'active'], no: ['Não', 'closed'], low: ['Stock baixo', 'pending'],
  };
  const badge = (s, label) => { const m = STATUS[s] || [s, 'info']; return '<p class="label-' + m[1] + '">' + esc(label || m[0]) + '</p>'; };
  const stars = (n, size = '') => '<span class="inline-flex items-center gap-0.5" aria-label="' + n + ' de 5">' + [1, 2, 3, 4, 5].map((i) => '<span class="' + ICONS[theme()].star + ' ' + (size === 'lg' ? 'text-2xl' : 'text-lg') + ' ' + (i <= Math.round(n) ? 'text-amber-500' : 'text-gray-400') + '"></span>').join('') + '</span>';

  /* ---------- Datagrid (linhas em grelha, como no Bagisto) ---------- */
  const TB = {};
  const cx = {
    shop: { wrap: 'w-full overflow-x-auto rounded-xl border max-md:rounded-none max-md:border-0', inner: 'table-responsive box-shadow grid w-full overflow-hidden rounded bg-white', head: 'row grid items-center gap-2.5 border-b border-zinc-200 bg-zinc-100 px-6 py-4 text-sm font-medium text-black max-md:p-4', row: 'row grid items-center gap-2.5 border-b bg-white px-6 py-4 font-medium text-gray-600 transition-all max-md:p-4 max-md:text-xs' },
    admin: { wrap: 'w-full', inner: 'table-responsive box-shadow grid w-full overflow-x-auto rounded bg-white', head: 'row grid min-h-[47px] items-center gap-2.5 border-b bg-gray-50 px-4 py-2.5 font-semibold text-gray-600', row: 'row grid items-center gap-2.5 border-b px-4 py-4 text-gray-600 transition-all hover:bg-gray-50' },
  };
  cx.seller = cx.admin;
  function tbBody(id) {
    const t = TB[id], o = t.o, c = cx[theme()];
    let rows = o.rows.filter((r) => {
      if (t.q && o.searchKeys && !o.searchKeys.some((k) => String(r[k] ?? '').toLowerCase().includes(t.q.toLowerCase()))) return false;
      return Object.keys(t.f).every((k) => !t.f[k] || String(r[k]) === t.f[k]);
    });
    if (t.sort) rows = rows.slice().sort((a, b) => (a[t.sort] > b[t.sort] ? 1 : a[t.sort] < b[t.sort] ? -1 : 0) * t.dir);
    const per = o.per || 8, pages = Math.max(1, Math.ceil(rows.length / per));
    t.page = Math.min(t.page, pages);
    const view = rows.slice((t.page - 1) * per, t.page * per);
    const n = o.cols.length + (o.actions ? 1 : 0);
    const gtc = ' style="grid-template-columns: repeat(' + n + ', minmax(0, 1fr))"';
    const head = '<div class="' + c.head + '"' + gtc + '>' + o.cols.map((col) => '<div class="' + (col.cls || '') + '">' + (col.sort === false ? '<p>' + esc(col.label) + '</p>' : '<p class="flex cursor-pointer select-none items-center gap-1.5" role="button" tabindex="0" data-act="tb-sort" data-tb="' + id + '" data-k="' + (col.sortKey || col.k) + '">' + esc(col.label) + (t.sort === (col.sortKey || col.k) ? '<span class="align-text-bottom text-base text-gray-600 ' + (t.dir > 0 ? ICONS[theme()].down : ICONS[theme()].up) + '"></span>' : '') + '</p>') + '</div>').join('') + (o.actions ? '<p class="place-self-end">' + (theme() === 'shop' ? '' : 'Ações') + '</p>' : '') + '</div>';
    const body = view.map((r) => '<div class="' + c.row + (o.href ? ' cursor-pointer' : '') + '"' + gtc + (o.href ? ' data-href="' + o.href(r) + '"' : '') + '>' + o.cols.map((col) => '<div class="break-words ' + (col.cls || '') + '" data-label="' + esc(col.label) + '">' + (col.render ? col.render(r) : esc(r[col.k])) + '</div>').join('') + (o.actions ? '<div class="flex items-center justify-end place-self-end">' + o.actions(r) + '</div>' : '') + '</div>').join('');
    const empty = '<div class="row grid border-b px-4 py-4 text-center text-gray-600"><p class="py-6">' + esc(o.emptyText || 'Nenhum resultado para os filtros aplicados.') + '</p></div>';
    const arrow = 'inline-flex w-full max-w-max cursor-pointer appearance-none items-center justify-between gap-x-1 rounded-md border border-transparent p-1.5 text-center text-gray-600 transition-all marker:shadow hover:bg-gray-200';
    return '<div class="' + c.wrap + '"><div class="' + c.inner + '">' + head + (view.length ? body : empty) +
      '<div class="flex items-center justify-between p-6 max-md:p-2"><p class="text-xs font-medium">' + rows.length + ' registo' + (rows.length === 1 ? '' : 's') + '</p><div class="flex items-center gap-1"><button type="button" class="' + arrow + '" data-act="tb-page" data-tb="' + id + '" data-p="' + (t.page - 1) + '"' + (t.page <= 1 ? ' disabled style="opacity:.4"' : '') + ' aria-label="Página anterior"><span class="' + (theme() === 'admin' ? 'icon-sort-left' : theme() === 'shop' ? 'icon-sort-left' : 'icon-arrow-left') + ' text-2xl"></span></button><span class="max-w-[42px] items-center border-l border-r px-4 py-2 font-medium leading-normal text-black">' + t.page + '</span><span class="text-xs text-gray-600">de ' + pages + '</span><button type="button" class="' + arrow + '" data-act="tb-page" data-tb="' + id + '" data-p="' + (t.page + 1) + '"' + (t.page >= pages ? ' disabled style="opacity:.4"' : '') + ' aria-label="Página seguinte"><span class="' + (theme() === 'admin' || theme() === 'shop' ? 'icon-sort-right' : 'icon-arrow-right') + ' text-2xl"></span></button></div></div></div></div>';
  }
  const selCls = 'rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-600 transition-all hover:border-gray-400 focus:border-gray-400';
  function table(id, o) {
    TB[id] = { o, q: '', page: 1, sort: null, dir: 1, f: {} };
    const filters = (o.filters || []).map((f) => '<select class="' + selCls + '" data-tb-f="' + id + '" data-k="' + f.k + '" aria-label="' + esc(f.label) + '"><option value="">' + esc(f.label) + ': todos</option>' + f.opts.map((v) => '<option value="' + (Array.isArray(v) ? v[0] : v) + '">' + esc(Array.isArray(v) ? v[1] : v) + '</option>').join('') + '</select>').join('');
    return '<div id="tb-' + id + '"><div class="mt-7 flex flex-wrap items-center justify-between gap-4 max-md:block max-md:space-y-3 mb-4">' +
      '<div class="flex flex-wrap items-center gap-2">' + (o.searchKeys ? '<div class="relative"><input type="text" data-tb-q="' + id + '" class="rounded-lg border border-gray-300 bg-white px-3 py-2 pr-9 text-base text-gray-600 transition-all hover:border-gray-400 focus:border-gray-400 max-md:max-w-[250px]" placeholder="' + esc(o.searchPlaceholder || 'Pesquisar') + '" autocomplete="off" aria-label="Pesquisar"><div class="' + ICONS[theme()].search + ' pointer-events-none absolute top-2.5 flex items-center text-xl ltr:right-2.5"></div></div>' : '') + filters + '</div>' +
      '<div class="flex items-center gap-2">' + (o.tools || '') + '</div></div><div class="tb-body">' + tbBody(id) + '</div></div>';
  }
  const tbRefresh = (id) => { const b = $('#tb-' + id + ' .tb-body'); if (b) b.innerHTML = tbBody(id); };
  ACT['tb-sort'] = (el) => { const t = TB[el.dataset.tb]; const k = el.dataset.k; t.dir = t.sort === k ? -t.dir : 1; t.sort = k; tbRefresh(el.dataset.tb); };
  ACT['tb-page'] = (el) => { TB[el.dataset.tb].page = +el.dataset.p; tbRefresh(el.dataset.tb); };
  ACT['tb-del'] = (el) => confirmBox(el.dataset.q || 'Tem a certeza de que pretende eliminar este registo?', () => {
    const t = TB[el.dataset.tb]; t.o.rows = t.o.rows.filter((r) => String(r.id) !== el.dataset.rid); tbRefresh(el.dataset.tb); toast('Registo eliminado com sucesso.');
  }, { danger: true, okLabel: 'Eliminar', title: 'Eliminar' });
  document.addEventListener('input', (e) => { const q = e.target.dataset && e.target.dataset.tbQ; if (q) { TB[q].q = e.target.value; TB[q].page = 1; tbRefresh(q); } });
  document.addEventListener('change', (e) => { const f = e.target.dataset && e.target.dataset.tbF; if (f) { TB[f].f[e.target.dataset.k] = e.target.value; TB[f].page = 1; tbRefresh(f); } });
  document.addEventListener('click', (e) => {
    const tr = e.target.closest('[data-href]');
    if (tr && !e.target.closest('a,button,input,select,label,[data-act]')) location.hash = tr.dataset.href;
  });

  /* ---------- Botões de acção em linhas ---------- */
  const iconBtn = 'cursor-pointer rounded-md p-1.5 text-2xl transition-all hover:bg-gray-200';
  const rowBtn = (ic, label, href, extra = '') => '<a class="' + iconBtn + ' ' + (ICONS[theme()][ic] || ICONS[theme()].info) + '" title="' + esc(label) + '" aria-label="' + esc(label) + '" href="' + href + '" ' + extra + '></a>';
  const delBtn = (tb, rid) => '<span class="' + iconBtn + ' ' + ICONS[theme()].trash + '" role="button" tabindex="0" title="Eliminar" aria-label="Eliminar" data-act="tb-del" data-tb="' + tb + '" data-rid="' + rid + '"></span>';
  const actBtn = (ic, label, act, attrs = '') => '<span class="' + iconBtn + ' ' + (ICONS[theme()][ic] || ICONS[theme()].info) + '" role="button" tabindex="0" title="' + esc(label) + '" aria-label="' + esc(label) + '" data-act="' + act + '" ' + attrs + '></span>';

  /* ---------- Formulários ---------- */
  const lab = () => (theme() === 'shop' ? 'mb-2 block text-base max-sm:text-sm max-sm:mb-1' : 'mb-1.5 flex items-center gap-1 text-xs font-medium text-gray-800');
  const inp = () => (theme() === 'shop' ? 'mb-1.5 w-full rounded-lg border px-5 py-3 text-base font-normal text-gray-600 transition-all hover:border-gray-400 focus:border-gray-400 max-md:px-4 max-md:py-2 max-sm:text-sm' : 'w-full rounded-md border px-3 py-2.5 text-sm text-gray-600 transition-all hover:border-gray-400 focus:border-gray-400');
  function field(f) {
    const id = 'f-' + f.name, v = f.value ?? '', req = f.required ? ' required' : '', ph = f.placeholder ? ' placeholder="' + esc(f.placeholder) + '"' : '';
    let ctl;
    if (f.type === 'select') ctl = '<select class="custom-select ' + inp() + ' bg-white" id="' + id + '" name="' + f.name + '"' + req + '>' + (f.options || []).map((o) => { const val = Array.isArray(o) ? o[0] : o, l = Array.isArray(o) ? o[1] : o; return '<option value="' + esc(val) + '"' + (String(val) === String(v) ? ' selected' : '') + '>' + esc(l) + '</option>'; }).join('') + '</select>';
    else if (f.type === 'textarea') ctl = '<textarea class="' + inp() + '" id="' + id + '" name="' + f.name + '" rows="' + (f.rows || 4) + '"' + req + ph + '>' + esc(v) + '</textarea>';
    else if (f.type === 'toggle') ctl = '<label class="relative inline-flex cursor-pointer items-center"><input type="checkbox" name="' + f.name + '" class="peer sr-only"' + (v ? ' checked' : '') + '><div class="peer h-5 w-9 cursor-pointer rounded-full bg-gray-200 after:absolute after:top-0.5 after:h-4 after:w-4 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[\'\'] ltr:after:left-[2px] peer-checked:bg-navyBlue peer-checked:after:ltr:translate-x-full peer-checked:after:border-white peer-focus:outline-none"></div></label>';
    else if (f.type === 'file') ctl = '<label class="flex cursor-pointer flex-col items-center gap-1 rounded-lg border-2 border-dashed border-gray-300 px-4 py-6 text-center text-sm text-gray-600 hover:border-gray-400" for="' + id + '">' + ico('upload', 'text-3xl') + '<b data-fname>Arraste ficheiros ou clique para carregar</b><small class="text-xs text-gray-500">' + esc(f.hint || 'PNG, JPG até 5 MB') + '</small><input id="' + id + '" type="file" name="' + f.name + '" class="hidden" onchange="this.parentNode.querySelector(\'[data-fname]\').textContent=this.files[0]?this.files[0].name:\'Carregar\'"></label>';
    else if (f.type === 'color') ctl = '<input class="w-full appearance-none rounded-md border text-sm text-gray-600 transition-all hover:border-gray-400" id="' + id + '" type="color" name="' + f.name + '" value="' + esc(v) + '">';
    else ctl = '<input class="' + inp() + '" id="' + id + '" type="' + (f.type || 'text') + '" name="' + f.name + '" value="' + esc(v) + '"' + req + ph + (f.step ? ' step="' + f.step + '"' : '') + '>';
    return '<div class="mb-4' + (f.span ? ' sm:col-span-2' : '') + '"><label for="' + id + '" class="' + lab() + (f.required ? ' required' : '') + '">' + esc(f.label) + (f.required ? ' <span class="text-red-600">*</span>' : '') + '</label>' + ctl + (f.hint && f.type !== 'file' ? '<p class="mt-1 text-xs text-gray-500">' + esc(f.hint) + '</p>' : '') + '</div>';
  }
  const fields = (list) => '<div class="grid gap-x-5 sm:grid-cols-2">' + list.map(field).join('') + '</div>';
  const card = (title, body, tools = '') => '<div class="box-shadow rounded bg-white p-4"><div class="mb-4 flex items-center justify-between gap-2"><p class="text-base font-semibold text-gray-800">' + (title || '') + '</p>' + tools + '</div>' + body + '</div>';

  /* ---------- Abas ---------- */
  const TAB_ON = ['border-blue-600', 'border-b-2', 'text-blue-600', 'transition'];
  const tabs = (items, first = 0) => '<div data-tabs><div class="flex gap-4 overflow-x-auto bg-white pt-2" role="tablist" style="border-bottom:1px solid #e5e7eb">' + items.map((t, i) => '<div role="tab" class="cursor-pointer whitespace-nowrap px-2.5 pb-3.5 text-base font-medium ' + (i === first ? TAB_ON.join(' ') : 'text-gray-300') + '" data-act="tab" data-tab="' + t.id + '">' + esc(t.label) + '</div>').join('') + '</div>' + items.map((t, i) => '<div class="p-5 max-sm:px-0 ' + (i === first ? '' : 'hidden') + '" data-pane="' + t.id + '">' + t.html + '</div>').join('') + '</div>';
  ACT['tab'] = (el) => {
    const wrap = el.closest('[data-tabs]');
    $$('[data-tab]', wrap).forEach((b) => { const on = b === el; TAB_ON.forEach((c) => b.classList.toggle(c, on)); b.classList.toggle('text-gray-300', !on); });
    $$('[data-pane]', wrap).forEach((p) => p.classList.toggle('hidden', p.dataset.pane !== el.dataset.tab));
  };

  const pageHead = (title, sub, actions = '', crumbs = '') => (crumbs ? '<nav class="mb-2 flex flex-wrap items-center gap-1.5 text-sm text-gray-600 crumbs">' + crumbs + '</nav>' : '') + '<div class="mb-5 flex items-center justify-between gap-4 max-sm:flex-wrap"><div class="grid gap-1"><p class="text-xl font-bold text-gray-800">' + title + '</p>' + (sub ? '<p class="text-sm text-gray-600">' + sub + '</p>' : '') + '</div><div class="flex flex-wrap items-center gap-x-2.5 gap-y-2">' + actions + '</div></div>';
  const SVG = { dollar: 'total-sales-B1A9STxj.svg', box: 'total-orders-wduYhIFA.svg', users: 'customers-BfcJGhnh.svg', wallet: 'average-orders-UpY6pgyW.svg', tag: 'unpaid-invoices-BgQgwKF1.svg', default: 'average-orders-UpY6pgyW.svg' };
  const statCard = (label, value, delta, ic) => '<div class="flex min-w-[200px] flex-1 gap-2.5 box-shadow rounded bg-white p-4"><div class="h-[60px] max-h-[60px] w-full max-w-[60px]"><img src="../assets/real/admin/' + (SVG[ic] || SVG.default) + '" alt="" title="' + esc(label) + '"></div><div class="grid place-content-start gap-1"><p class="text-base font-semibold leading-none text-gray-800">' + value + '</p><p class="text-xs font-semibold text-gray-600">' + esc(label) + '</p>' + (delta ? '<div class="flex items-center gap-0.5"><span class="text-base ' + (String(delta).startsWith('-') ? 'icon-down-stat text-red-500' : 'icon-up-stat text-emerald-500') + '"></span><p class="text-xs font-semibold ' + (String(delta).startsWith('-') ? 'text-red-500' : 'text-emerald-500') + '">' + esc(String(delta).replace(/^[+-]/, '')) + '</p></div>' : '') + '</div></div>';
  const stats = (cards) => '<div class="box-shadow rounded bg-white p-4"><div class="flex flex-wrap gap-4">' + cards.join('') + '</div></div>';
  const kv = (rows) => '<div class="grid gap-2.5">' + rows.map((r) => '<div class="flex justify-between gap-4 text-sm"><p class="text-gray-600">' + esc(r[0]) + '</p><p class="text-right font-semibold text-gray-800">' + r[1] + '</p></div>').join('') + '</div>';

  /* ---------- Gráficos SVG ---------- */
  function lineChart(labels, series, { h = 220, fmt = (v) => v } = {}) {
    const W = 640, H = h, pad = { l: 46, r: 12, t: 12, b: 26 };
    const max = Math.max(...series.flatMap((s) => s.data)) * 1.1 || 1;
    const x = (i) => pad.l + (i * (W - pad.l - pad.r)) / Math.max(1, labels.length - 1), y = (v) => H - pad.b - (v / max) * (H - pad.t - pad.b);
    let g = '';
    for (let i = 0; i <= 4; i++) { const v = (max * i) / 4, yy = y(v); g += '<line x1="' + pad.l + '" x2="' + (W - pad.r) + '" y1="' + yy + '" y2="' + yy + '" stroke="#eef0f2"/><text x="' + (pad.l - 8) + '" y="' + (yy + 4) + '" text-anchor="end" font-size="11" fill="#9ca3af">' + fmt(Math.round(v)) + '</text>'; }
    labels.forEach((l, i) => { if (labels.length <= 12 || i % 2 === 0) g += '<text x="' + x(i) + '" y="' + (H - 8) + '" text-anchor="middle" font-size="11" fill="#9ca3af">' + esc(l) + '</text>'; });
    const paths = series.map((s, si) => {
      const pts = s.data.map((v, i) => x(i) + ',' + y(v)).join(' ');
      return '<defs><linearGradient id="ar' + si + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + s.color + '" stop-opacity=".25"/><stop offset="1" stop-color="' + s.color + '" stop-opacity="0"/></linearGradient></defs><polygon points="' + x(0) + ',' + (H - pad.b) + ' ' + pts + ' ' + x(labels.length - 1) + ',' + (H - pad.b) + '" fill="url(#ar' + si + ')"/><polyline points="' + pts + '" fill="none" stroke="' + s.color + '" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>' +
        s.data.map((v, i) => '<circle cx="' + x(i) + '" cy="' + y(v) + '" r="3.5" fill="#fff" stroke="' + s.color + '" stroke-width="2"><title>' + esc(s.name) + ' · ' + esc(labels[i]) + ': ' + fmt(v) + '</title></circle>').join('');
    }).join('');
    return '<svg class="w-full h-auto" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Gráfico de linhas">' + g + paths + '</svg>' +
      (series.length > 1 ? '<div class="mt-2 flex justify-center gap-4 text-xs text-gray-600">' + series.map((s) => '<span><i class="mr-1.5 inline-block h-2.5 w-2.5 rounded-sm" style="background:' + s.color + '"></i>' + esc(s.name) + '</span>').join('') + '</div>' : '');
  }
  function barChart(labels, data, color = '#22c55e', { h = 200, fmt = (v) => v } = {}) {
    const W = 640, H = h, pad = { l: 46, r: 10, t: 12, b: 26 }, max = Math.max(...data) * 1.1 || 1, bw = (W - pad.l - pad.r) / data.length;
    let g = '';
    for (let i = 0; i <= 4; i++) { const v = (max * i) / 4, yy = H - pad.b - (v / max) * (H - pad.t - pad.b); g += '<line x1="' + pad.l + '" x2="' + (W - pad.r) + '" y1="' + yy + '" y2="' + yy + '" stroke="#eef0f2"/><text x="' + (pad.l - 8) + '" y="' + (yy + 4) + '" text-anchor="end" font-size="11" fill="#9ca3af">' + fmt(Math.round(v)) + '</text>'; }
    const bars = data.map((v, i) => { const bh = (v / max) * (H - pad.t - pad.b); return '<rect x="' + (pad.l + i * bw + bw * 0.18) + '" y="' + (H - pad.b - bh) + '" width="' + bw * 0.64 + '" height="' + bh + '" rx="4" fill="' + color + '"><title>' + esc(labels[i]) + ': ' + fmt(v) + '</title></rect><text x="' + (pad.l + i * bw + bw / 2) + '" y="' + (H - 8) + '" text-anchor="middle" font-size="11" fill="#9ca3af">' + esc(labels[i]) + '</text>'; }).join('');
    return '<svg class="w-full h-auto" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Gráfico de barras">' + g + bars + '</svg>';
  }
  function donut(items) {
    const total = items.reduce((s, i) => s + i.v, 0) || 1, R = 52, C = 2 * Math.PI * R;
    let off = 0;
    const arcs = items.map((i) => { const len = (i.v / total) * C; const a = '<circle r="' + R + '" cx="70" cy="70" fill="none" stroke="' + i.c + '" stroke-width="22" stroke-dasharray="' + len + ' ' + (C - len) + '" stroke-dashoffset="' + -off + '" transform="rotate(-90 70 70)"><title>' + esc(i.l) + ': ' + i.v + '</title></circle>'; off += len; return a; }).join('');
    return '<div class="flex flex-wrap items-center gap-5"><svg class="w-[140px] shrink-0" viewBox="0 0 140 140" role="img" aria-label="Gráfico circular">' + arcs + '<text x="70" y="76" text-anchor="middle" font-size="26" font-weight="800" fill="#1f2937">' + total + '</text></svg><ul class="grid min-w-[150px] flex-1 gap-2 text-sm">' + items.map((i) => '<li class="flex items-center gap-2"><i class="inline-block h-2.5 w-2.5 rounded-sm" style="background:' + i.c + '"></i>' + esc(i.l) + '<b class="ml-auto">' + Math.round((i.v / total) * 100) + '%</b></li>').join('') + '</ul></div>';
  }
  const progress = (pct, label) => '<div class="h-2 w-full overflow-hidden rounded-full bg-gray-200"><div class="h-full rounded-full" style="width:' + pct + '%;background:#22c55e"></div></div>' + (label ? '<small class="text-xs text-gray-600">' + label + '</small>' : '');

  /* ---------- Shell do painel de administração ---------- */
  const NAVICON = { admin: { home: 'icon-dashboard', sales: 'icon-sales', box: 'icon-sales', tag: 'icon-product', catalog: 'icon-product', users: 'icon-customer', store: 'icon-store', file: 'icon-cms', percent: 'icon-promotion', chart: 'icon-report', settings: 'icon-settings', globe: 'icon-configuration', message: 'icon-mail', wallet: 'icon-sales', refresh: 'icon-repeat', calendar: 'icon-calendar', star: 'icon-star' },
    seller: { home: 'mp-dashboard-icon', box: 'mp-orders-icon', tag: 'mp-products-icon', users: 'mp-customers-icon', calendar: 'mp-calendar-icon', star: 'mp-customer-reviews-icon', wallet: 'mp-transaction-icon', refresh: 'mp-history-icon', message: 'mp-communication-icon', chart: 'mp-report-icon', store: 'mp-manage-profile-icon', settings: 'mp-setting-icon' } };
  const navIcon = (t, n) => (NAVICON[t] || {})[n] || 'icon-dashboard';
  function adminShell({ menu, user, notifications }) {
    const nav = menu.map((m, i) => {
      const kids = m.children;
      return '<div class="px-4 group/item" data-g="' + i + '"><a href="' + (kids ? '#' : m.href) + '" ' + (kids ? 'data-act="nav-group"' : 'data-match="' + m.href + '"') + ' class="flex gap-2.5 p-1.5 items-center cursor-pointer hover:rounded-lg hover:bg-gray-100 peer nav-top"><span class="' + navIcon('admin', m.icon) + ' text-2xl nav-ic"></span><p class="text-gray-600 font-semibold whitespace-nowrap nav-lb">' + esc(m.label) + '</p></a>' +
        (kids ? '<div class="hidden min-w-[180px] ltr:pl-10 pb-2 rounded-b-lg overflow-hidden nav-sub">' + kids.map((c) => '<a href="' + c.href + '" data-match="' + c.href + '" class="text-sm text-gray-600 whitespace-nowrap py-1 hover:text-blue-600 block">' + esc(c.label) + '</a>').join('') + '</div>' : '') + '</div>';
    }).join('');
    document.getElementById('app').innerHTML = '<div id="app-root" class="h-full ica-green-admin"><div id="flash-box"></div>' +
      '<header class="sticky top-0 z-[10001] flex items-center justify-between border-b bg-white px-2 py-2 sm:px-4 sm:py-2.5"><div class="flex items-center gap-1 sm:gap-1.5"><i class="icon-menu cursor-pointer rounded-md p-1.5 text-xl hover:bg-gray-100 lg:hidden sm:text-2xl" data-act="toggle-side"></i><a href="#/" class="flex flex-shrink-0 items-center"><img src="../assets/real/brand/logo-imali.png" class="h-8 w-auto max-h-10 object-contain sm:h-10" alt="Mercado ICA"></a>' +
      '<div class="relative flex w-[200px] items-center sm:w-[300px] md:w-[400px] lg:w-[525px] xl:max-w-[525px] ltr:ml-2 sm:ltr:ml-2.5 hidden sm:flex"><i class="icon-search absolute top-1.5 flex items-center text-xl ltr:left-2 sm:text-2xl sm:ltr:left-3"></i><input type="text" class="block w-full rounded-lg border bg-white px-8 py-1.5 text-sm leading-6 text-gray-600 transition-all hover:border-gray-400 sm:px-10" placeholder="Pesquisar pedidos, produtos, clientes…" aria-label="Pesquisa global"></div></div>' +
      '<div class="flex items-center gap-1 sm:gap-2.5"><a href="../comprador/index.html" target="_blank" class="hidden sm:flex"><span class="icon-store cursor-pointer rounded-md p-1.5 text-xl transition-all hover:bg-gray-100 sm:text-2xl" title="Visitar a loja"></span></a>' +
      '<div class="relative"><span class="relative flex" data-act="dropdown"><span class="icon-notification cursor-pointer rounded-md p-1.5 text-xl transition-all hover:bg-gray-100 sm:text-2xl" title="Notificações"></span><span class="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500"></span></span><div class="dd-menu absolute right-0 top-10 z-[10010] hidden w-[300px] rounded-lg bg-white box-shadow"><p class="border-b px-4 py-3 text-sm font-semibold">Notificações</p>' + notifications.map((n) => '<a href="#/notificacoes" class="block border-b px-4 py-2.5 hover:bg-gray-100"><b class="block text-sm font-medium">' + esc(n.text) + '</b><small class="text-xs text-gray-500">' + esc(n.time) + '</small></a>').join('') + '<a href="#/notificacoes" class="block px-4 py-2.5 text-center text-sm text-blue-600">Ver todas</a></div></div>' +
      '<div class="relative"><button class="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-blue-400 text-xs font-semibold leading-6 text-white transition-all hover:bg-blue-500 focus:bg-blue-500 sm:h-9 sm:w-9" data-act="dropdown">' + esc(user.name[0]) + '</button><div class="dd-menu absolute right-0 top-11 z-[10010] hidden w-[220px] rounded-lg bg-white box-shadow"><div class="flex items-center gap-1.5 border-b px-4 py-2 sm:px-5 sm:py-2.5"><img src="../assets/real/brand/logo-imali.png" class="h-5 w-5 object-contain" alt=""><p class="text-xs text-gray-400 sm:text-sm">v2.3.10 · ' + esc(user.name) + '</p></div><div class="grid gap-1 pb-2.5"><a class="cursor-pointer px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 sm:px-5 sm:text-base" href="' + user.profile + '">A minha conta</a><a class="cursor-pointer px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 sm:px-5 sm:text-base" href="../index.html">Mudar de perfil</a><a class="cursor-pointer px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 sm:px-5 sm:text-base" href="#" data-act="logout">Terminar sessão</a></div></div></div></div></header>' +
      '<div class="group/container sidebar-not-collapsed flex flex-col lg:flex-row gap-0 lg:gap-4" id="layout"><div class="lg:fixed lg:top-[62px] lg:left-0 lg:z-10 w-full lg:w-auto"><div id="sidebar" class="fixed top-14 z-[1000] h-full w-[270px] bg-white pt-4 shadow-[0px_8px_10px_0px_rgba(0,_0,_0,_0.2)] transition-all duration-300 max-lg:hidden"><div class="journal-scroll h-[calc(100vh-100px)] overflow-auto"><nav class="grid w-full gap-2">' + nav + '</nav></div></div></div>' +
      '<div class="flex min-h-[calc(100vh-62px)] max-w-full flex-1 flex-col bg-white transition-all duration-300 pt-3 px-2 sm:px-4 lg:pt-3 lg:px-4 lg:ltr:pl-[286px]"><div class="pb-4 lg:pb-6"><div class="w-full overflow-x-hidden" id="view"></div></div><div class="mt-auto"><div class="border-t bg-white py-2 text-center text-xs sm:text-sm">Powered by <a class="text-blue-600 hover:underline" href="#/">Mercado ICA</a> · Protótipo de interface</div></div></div></div></div>';
  }
  ACT['toggle-side'] = () => { const s = $('#sidebar'); s.classList.toggle('max-lg:hidden'); s.classList.toggle('!block'); };
  ACT['nav-group'] = (el) => { const g = el.closest('.group\\/item'); const sub = g.querySelector('.nav-sub'); sub.classList.toggle('hidden'); sub.classList.toggle('!grid'); sub.classList.toggle('bg-gray-100'); };

  /* ---------- Shell do painel do vendedor ---------- */
  function sellerShell({ menu, user, notifications }) {
    const nav = menu.map((m) => {
      const kids = m.children;
      return '<div class="group/item"><a href="' + (kids ? '#' : m.href) + '" ' + (kids ? 'data-act="nav-group"' : 'data-match="' + m.href + '"') + ' class="flex cursor-pointer items-center justify-between p-5 hover:bg-gray-50 nav-top"><div class="flex items-center gap-x-4"><span class="' + navIcon('seller', m.icon) + ' text-2xl !leading-7"></span><span class="whitespace-nowrap text-lg font-medium">' + esc(m.label) + '</span></div>' + (m.badge ? '<span class="rounded-full bg-blue-500 px-1.5 text-xs text-white">' + m.badge + '</span>' : (kids ? '<span class="mp-arrow-down-icon text-xl"></span>' : '')) + '</a>' +
        (kids ? '<div class="hidden min-w-[180px] ltr:pl-12 rounded-b z-[100] overflow-hidden nav-sub">' + kids.map((c) => '<a href="' + c.href + '" data-match="' + c.href + '" class="text-base cursor-pointer p-2.5 hover:bg-gray-50 block">' + esc(c.label) + '</a>').join('') + '</div>' : '') + '</div>';
    }).join('');
    document.getElementById('app').innerHTML = '<div id="app-root" class="ica-green-seller"><div id="flash-box"></div>' +
      '<header class="sticky top-0 z-10 items-center justify-between border-b bg-white px-7 py-4 flex max-lg:px-4"><div class="flex items-center gap-1.5"><span class="icon-hamburger mr-2 cursor-pointer text-2xl lg:hidden" data-act="toggle-side" role="button" aria-label="Menu"></span><a href="#/" class="flex items-center"><img src="../assets/real/brand/logo-imali.png" class="h-8 w-auto max-h-10 object-contain sm:max-h-8" width="131" height="29" alt="Mercado ICA"></a>' +
      '<div class="relative ml-5 max-lg:hidden"><span class="mp-search-icon pointer-events-none absolute left-3 top-2.5 text-xl text-gray-400"></span><input type="text" class="block w-[400px] rounded-lg border bg-white px-10 py-2 text-sm text-gray-600 hover:border-gray-400" placeholder="Pesquisar pedidos, produtos, clientes…" aria-label="Pesquisa global"></div></div>' +
      '<div class="flex gap-7"><a href="../comprador/index.html" target="_blank" class="flex"><span class="mp-home-icon cursor-pointer rounded-md p-1 text-2xl transition-all hover:bg-gray-100" title="Página inicial"></span></a><a href="../comprador/index.html#/vendedor/' + user.shopId + '" target="_blank" class="flex"><span class="mp-store-icon cursor-pointer rounded-md p-1 text-2xl transition-all hover:bg-gray-100" title="Visitar a loja"></span></a>' +
      '<a class="relative flex items-baseline" href="#/mensagens"><span class="mp-notification-icon cursor-pointer rounded-md p-1 text-2xl transition-all hover:bg-gray-100"></span><span class="absolute right-0 top-0 -mr-1 -mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 px-1 text-xs text-white">2</span></a>' +
      '<div class="relative"><div class="flex items-baseline" data-act="dropdown"><span class="icon-users cursor-pointer rounded-md p-1 text-2xl transition-all hover:bg-gray-100"></span></div><div class="dd-menu absolute right-0 top-9 z-50 hidden w-[220px] rounded-lg border bg-white p-3 shadow-lg"><div class="grid gap-1"><a class="cursor-pointer rounded-xl px-5 py-2 text-base hover:bg-gray-100" href="' + user.profile + '">O meu perfil</a><a class="cursor-pointer rounded-xl px-5 py-2 text-base hover:bg-gray-100" href="../index.html">Mudar de perfil</a><a class="cursor-pointer rounded-xl px-5 py-2 text-base hover:bg-gray-100" href="#" data-act="logout">Terminar sessão</a></div></div></div></div></header>' +
      '<div class="group/container sidebar-not-collapsed flex gap-4"><div id="sidebar" class="fixed h-full w-[260px] border-r bg-white transition-all duration-300 max-lg:hidden z-[1]"><div class="journal-scroll h-[calc(100vh-114px)] overflow-x-hidden overflow-y-auto"><nav class="grid w-full gap-2">' + nav + '</nav></div></div>' +
      '<div class="max-w-full flex-1 bg-white px-5 py-5 transition-all duration-300 max-lg:!px-5 ltr:pl-[280px]"><div id="view"></div></div></div></div>';
  }
  function markNav(path) {
    $$('#sidebar a[data-match]').forEach((a) => {
      const h = a.dataset.match.slice(1); const on = path === h || (h.length > 2 && path.startsWith(h + '/'));
      a.classList.toggle('text-blue-600', on && !a.classList.contains('nav-top')); a.classList.toggle('font-semibold', on);
      if (a.classList.contains('nav-top')) { a.classList.toggle('bg-blue-600', on); a.classList.toggle('rounded-lg', on && theme() === 'admin'); a.classList.toggle('bg-gray-100', on && theme() === 'seller'); const lb = a.querySelector('.nav-lb'), ic = a.querySelector('.nav-ic'); if (lb) lb.classList.toggle('text-white', on); if (ic) ic.classList.toggle('text-white', on); }
      if (on) { const sub = a.closest('.nav-sub'); if (sub) { sub.classList.remove('hidden'); sub.classList.add('!grid', 'bg-gray-100'); } }
    });
    const s = $('#sidebar'); if (s && window.innerWidth < 1024) { s.classList.add('max-lg:hidden'); s.classList.remove('!block'); }
  }


  /* ---------- Páginas de autenticação (estilo imali-* real) ---------- */
  const SVG_MAIL = '<svg viewBox="0 0 24 24" class="imali-icon-svg"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v13A2.5 2.5 0 0 1 17.5 21h-11A2.5 2.5 0 0 1 4 18.5v-13Zm2.5-.5a.5.5 0 0 0-.5.5v.26l5.74 3.83a1 1 0 0 0 1.12 0L18 5.76V5.5a.5.5 0 0 0-.5-.5h-11Z"/></svg>';
  const SVG_LOCK = '<svg viewBox="0 0 24 24" class="imali-icon-svg"><path d="M12 2a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-1V7a5 5 0 0 0-5-5zm3 8H9V7a3 3 0 0 1 6 0v3z"/></svg>';
  const imaliField = (label, name, type, val, kind, ph, extra = '') => '<div class="imali-field-group"><label class="imali-label" for="' + name + '">' + label + '</label><div class="imali-input-wrapper"><span class="imali-input-icon" aria-hidden="true">' + (kind === 'lock' ? SVG_LOCK : SVG_MAIL) + '</span><input class="imali-input" id="' + name + '" name="' + name + '" type="' + type + '" value="' + esc(val) + '" placeholder="' + esc(ph) + '" required aria-required="true"></div>' + extra + '</div>';
  const imaliAuth = ({ back, title, sub, inner, footer }) => '<div class="imali-body"><div class="imali-page"><main class="imali-main"><div class="imali-background"></div><section class="imali-login-card" aria-labelledby="imali-login-title"><div class="mb-2"><a href="' + back + '" class="imali-link text-sm">← Voltar para o site</a></div><div class="imali-logo-circle"><span class="imali-logo-diamond"></span></div><div class="imali-card-header"><h1 id="imali-login-title">' + title + '</h1><p class="imali-card-subtitle">' + sub + '</p></div>' + inner + '<div class="imali-card-footer"><p class="imali-secondary-text">' + footer + '</p></div></section></main>' +
    '<footer class="imali-footer"><div class="imali-footer-bottom"><div class="imali-footer-brand"><span class="imali-logo-diamond kecil"></span><span class="imali-footer-brand-name">iMali</span><span class="imali-footer-copy">© 2026 iMali B2B Marketplace. Diferente, como tu!</span></div><nav class="imali-footer-links"><a href="../comprador/index.html#/pagina/termos" class="imali-footer-link">Termos de Serviço</a><a href="../comprador/index.html#/pagina/privacidade" class="imali-footer-link">Política de Privacidade</a><a href="../comprador/index.html#/pagina/contactos" class="imali-footer-link">Centro de Ajuda</a><a href="../index.html" class="imali-footer-link">Mudar de perfil</a></nav></div></footer></div></div>';

  Object.assign(ICA, { imaliField, imaliAuth, badge, stars, table, tbRefresh, rowBtn, delBtn, actBtn, field, fields, card, tabs, pageHead, statCard, stats, kv, lineChart, barChart, donut, progress, adminShell, sellerShell, markNav, STATUS });
})();
