/* Mercado ICA — Cliente (vendedor): shell, autenticação, dashboard, produtos, pedidos */
(function () {
  const ICA = window.ICA;
  const { $, esc, money, moneyShort, icon, ACT, FORMS, S, pimg, toast, openModal, byId, date, dateTime, badge } = ICA;
  const D = ICA;
  const SID = 3;
  const sl = (ICA.seller = {});
  const me = () => byId(D.sellers, SID);
  const myProducts = () => D.products.filter((p) => p.seller === SID);
  const months = (n) => { const out = [], names = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'], d = new Date(); for (let i = n - 1; i >= 0; i--) { const m = new Date(d.getFullYear(), d.getMonth() - i, 1); out.push(names[m.getMonth()]); } return out; };
  const series = (n, base, amp, seed = 1) => Array.from({ length: n }, (_, i) => Math.round(base + amp * (0.5 + 0.5 * Math.sin(i * 0.9 + seed)) + i * (base / 25)));
  const H = ICA.pageHead;

  /* Pedidos do vendedor: derivados dos pedidos globais com itens deste vendedor */
  const myOrders = () => {
    const sp = myProducts();
    return D.orders.slice(0, 20).map((o, i) => {
      const items = [0, 1].slice(0, 1 + (i % 2)).map((k) => { const p = sp[(i + k * 3) % sp.length]; return { pid: p.id, name: p.name, qty: 1 + ((i + k) % 3), price: p.price, seller: SID, emoji: p.emoji, color: p.color }; });
      const sub = items.reduce((s, x) => s + x.qty * x.price, 0), tax = Math.round(sub * 0.16);
      return { ...o, items, sub, tax, ship: 0, total: sub + tax, commission: Math.round(sub * 0.08) };
    });
  };
  Object.assign(sl, { me, myProducts, myOrders, months, series });

  /* ---------- Shell ---------- */
  const MENU = [
    { label: 'Dashboard', icon: 'home', href: '#/' },
    { label: 'Pedidos', icon: 'box', href: '#/pedidos', badge: 3 },
    { label: 'Produtos', icon: 'tag', children: [{ label: 'Os meus produtos', href: '#/produtos' }, { label: 'Novo produto', href: '#/produtos/novo' }, { label: 'Atribuir do catálogo', href: '#/produtos/atribuir' }] },
    { label: 'Clientes', icon: 'users', href: '#/clientes' },
    { label: 'Reservas', icon: 'calendar', href: '#/reservas' },
    { label: 'Avaliações', icon: 'star', children: [{ label: 'Produtos', href: '#/avaliacoes' }, { label: 'A minha loja', href: '#/avaliacoes-loja' }] },
    { label: 'Financeiro', icon: 'wallet', children: [{ label: 'Transações', href: '#/transacoes' }, { label: 'Pedidos de pagamento', href: '#/pagamentos' }] },
    { label: 'Devoluções (RMA)', icon: 'refresh', href: '#/devolucoes' },
    { label: 'Mensagens', icon: 'message', href: '#/mensagens', badge: 2 },
    { label: 'Relatórios', icon: 'chart', children: [{ label: 'Vendas', href: '#/relatorios/vendas' }, { label: 'Clientes', href: '#/relatorios/clientes' }, { label: 'Produtos', href: '#/relatorios/produtos' }] },
    { label: 'Perfil da loja', icon: 'store', href: '#/perfil' },
    { label: 'Definições', icon: 'settings', children: [{ label: 'Geral', href: '#/definicoes' }, { label: 'Armazéns', href: '#/definicoes/armazens' }, { label: 'Utilizadores', href: '#/definicoes/utilizadores' }, { label: 'Funções', href: '#/definicoes/funcoes' }, { label: 'Importar produtos', href: '#/definicoes/importar' }] },
  ];
  const AUTH_PATHS = ['/entrar', '/registar', '/recuperar'];
  let shellOn = false;
  function ensureShell(path) {
    const logged = !!S.get('seller');
    if (!logged && !AUTH_PATHS.includes(path)) { location.hash = '#/entrar'; return false; }
    if (logged && AUTH_PATHS.includes(path) && path !== '/registar') { location.hash = '#/'; return false; }
    if (AUTH_PATHS.includes(path)) { shellOn = false; document.getElementById('app').innerHTML = '<div id="view"></div>'; return true; }
    if (!shellOn || !$('#sidebar')) {
      ICA.panelShell({ brand: 'Painel do Cliente', sub: me().shop, theme: 'theme-seller', menu: MENU, home: '#/', switchHref: '../index.html', notifications: D.notifications, user: { name: me().owner, role: 'Vendedor', profile: '#/perfil' } });
      shellOn = true;
    }
    return true;
  }
  sl.ensureShell = ensureShell;
  sl.outlet = () => document.getElementById('view');
  ACT['logout'] = () => { S.del('seller'); shellOn = false; toast('Sessão terminada.', 'info'); location.hash = '#/entrar'; };

  /* ---------- Autenticação ---------- */
  const authShell = (inner) => '<div class="auth-wrap"><div class="auth-art"><a class="brand" href="#/entrar"><span class="logo">ICA</span><span><b>Mercado ICA</b><small>Painel do Cliente</small></span></a><div><h2>Venda para todo o país</h2><p>Gira produtos, pedidos e pagamentos num só painel.</p><ul><li>' + icon('check') + ' Comissão simples de 8% por venda</li><li>' + icon('check') + ' Receba por M-Pesa, e-Mola, mKesh ou banco</li><li>' + icon('check') + ' Relatórios em tempo real</li></ul></div><small style="position:relative;z-index:1;color:#9fe0b8">© 2026 Mercado ICA</small></div><div class="auth-card">' + inner + '</div></div>';
  const login = () => authShell('<form class="auth-form" data-form="s-login"><div><h1>Entrar como vendedor</h1><p class="mut">Aceda ao painel da sua loja.</p></div><div class="demo-hint">Protótipo: qualquer dados funcionam. Conta de demonstração: <b>' + esc(me().email) + '</b></div>' + ICA.fields([{ name: 'email', label: 'Email', type: 'email', value: me().email, span: 2 }, { name: 'pw', label: 'Palavra-passe', type: 'password', value: 'demo1234', span: 2 }]).replace('form-grid', 'form-grid" style="grid-template-columns:1fr') + '<button class="btn btn-primary btn-lg">Entrar</button><a class="center" href="#/recuperar" style="color:var(--g700)">Esqueceu a palavra-passe?</a><p class="sep center">Ainda não vende? <a href="#/registar" style="color:var(--g700);font-weight:600">Abrir a minha loja</a></p></form>');
  const recover = () => authShell('<form class="auth-form" data-msg="Ligação de redefinição enviada." data-go="#/entrar"><h1>Recuperar acesso</h1><div class="field"><label for="re">Email</label><input class="input" id="re" type="email" required></div><button class="btn btn-primary btn-lg">Enviar ligação</button><a class="center" href="#/entrar" style="color:var(--g700)">Voltar</a></form>');
  const REG = { step: 1 };
  function register() {
    const steps = ['Conta', 'Loja', 'Pagamentos'];
    const bar = '<ol class="steps" style="padding:0;margin:0 0 6px">' + steps.map((s, i) => '<li class="' + (REG.step === i + 1 ? 'on' : REG.step > i + 1 ? 'done' : '') + '" style="min-width:0;padding:8px 10px;font-size:13px">' + s + '</li>').join('') + '</ol>';
    const f = [
      [{ name: 'owner', label: 'Nome do responsável', required: true, span: 2 }, { name: 'email', label: 'Email', type: 'email', required: true }, { name: 'phone', label: 'Telefone', type: 'tel' }, { name: 'pw', label: 'Palavra-passe', type: 'password', required: true, span: 2 }],
      [{ name: 'shop', label: 'Nome da loja', required: true, span: 2 }, { name: 'nuit', label: 'NUIT', required: true }, { name: 'city', label: 'Cidade' }, { name: 'cat', label: 'Categoria principal', type: 'select', options: D.categories.map((c) => c.name), span: 2 }, { name: 'about', label: 'Descrição', type: 'textarea', span: 2 }],
      [{ name: 'meth', label: 'Receber pagamentos por', type: 'select', options: ['M-Pesa Business', 'e-Mola Empresas', 'Transferência bancária (NIB)'], span: 2 }, { name: 'acc', label: 'Número da conta / carteira', span: 2 }, { name: 'doc', label: 'Alvará / certidão comercial', type: 'file', span: 2, hint: 'PDF ou imagem' }],
    ][REG.step - 1];
    return authShell('<form class="auth-form" data-form="s-register" style="width:min(460px,100%)"><div><h1>Abrir a minha loja</h1><p class="mut">Passo ' + REG.step + ' de 3</p></div>' + bar + ICA.fields(f) + '<div style="display:flex;gap:10px"><button type="button" class="btn btn-ghost" data-act="reg-prev"' + (REG.step === 1 ? ' disabled' : '') + '>Voltar</button><button class="btn btn-primary" style="flex:1">' + (REG.step === 3 ? 'Submeter candidatura' : 'Continuar') + '</button></div><p class="center sep">Já tem conta? <a href="#/entrar" style="color:var(--g700);font-weight:600">Entrar</a></p></form>');
  }
  ACT['reg-prev'] = () => { REG.step = Math.max(1, REG.step - 1); ICA.refresh(); };
  FORMS['s-login'] = () => { S.set('seller', { id: SID }); toast('Bem-vindo de volta, ' + me().owner.split(' ')[0] + '!'); location.hash = '#/'; };
  FORMS['s-register'] = () => { if (REG.step < 3) { REG.step++; ICA.refresh(); return; } REG.step = 1; openModal({ title: 'Candidatura submetida', size: 'sm', body: '<div class="success" style="padding:10px"><div class="big">' + icon('check') + '</div><p>A nossa equipa analisa os documentos em até 48 h. Enquanto isso, pode explorar o painel em modo demonstração.</p></div>', footer: '<button class="btn btn-primary" data-act="demo-enter">Explorar painel</button>' }); };
  ACT['demo-enter'] = () => { ICA.closeModal(); S.set('seller', { id: SID }); location.hash = '#/'; };

  /* ---------- Dashboard ---------- */
  function dashboard() {
    const o = myOrders(), prods = myProducts(), mo = months(12), rev = series(12, 180000, 140000, 2), ord = series(12, 14, 12, 1);
    const top = prods.slice().sort((a, b) => b.sold - a.sold).slice(0, 5);
    return H('Olá, ' + esc(me().owner.split(' ')[0]) + ' 👋', 'Resumo do desempenho de ' + esc(me().shop) + '.', '<select class="input input-sm" aria-label="Período"><option>Últimos 12 meses</option><option>Últimos 30 dias</option><option>Esta semana</option></select><a class="btn btn-primary" href="#/produtos/novo">' + icon('plus') + ' Novo produto</a>') +
      '<div class="stats">' + ICA.statCard('Vendas totais', moneyShort(rev.reduce((a, b) => a + b, 0)), '+12,4%', 'dollar') + ICA.statCard('Pedidos', ord.reduce((a, b) => a + b, 0), '+8,1%', 'box', 'blue') + ICA.statCard('Saldo disponível', money(184500), '', 'wallet', 'amber') + ICA.statCard('Avaliação da loja', me().rating.toFixed(1) + ' ★', '+0,2', 'star', 'violet') + '</div>' +
      '<div class="grid-2"><div class="stack">' + ICA.card('Vendas (MT)', ICA.lineChart(mo, [{ name: 'Receita', color: 'var(--g500)', data: rev }], { fmt: (v) => (v >= 1000 ? Math.round(v / 1000) + 'k' : v) })) +
      ICA.card('Pedidos recentes', ICA.table('dash-orders', { rows: o.slice(0, 5), per: 5, href: (r) => '#/pedidos/' + r.id, cols: [{ k: 'number', label: 'Pedido', render: (r) => '<b>' + r.number + '</b>' }, { k: 'customer', label: 'Cliente' }, { k: 'total', label: 'Total', render: (r) => money(r.total) }, { k: 'status', label: 'Estado', render: (r) => badge(r.status) }] }).replace('card table-card', 'table-card'), '<a class="btn btn-ghost btn-sm" href="#/pedidos">Ver todos</a>') + '</div><div class="stack">' +
      ICA.card('Estado dos pedidos', ICA.donut([{ l: 'Concluídos', v: 42, c: '#22c55e' }, { l: 'Em processamento', v: 18, c: '#2563eb' }, { l: 'Pendentes', v: 9, c: '#f59e0b' }, { l: 'Cancelados', v: 4, c: '#dc2626' }])) +
      ICA.card('Mais vendidos', '<ul class="list-plain">' + top.map((p) => '<li>' + pimg(p) + '<div><b>' + esc(p.name.slice(0, 34)) + '</b><small>' + p.sold + ' vendidos</small></div><span class="end">' + moneyShort(p.price * p.sold) + '</span></li>').join('') + '</ul>') +
      ICA.card('Stock baixo', '<ul class="list-plain">' + prods.slice(0, 3).map((p, i) => '<li>' + pimg(p) + '<div><b>' + esc(p.name.slice(0, 30)) + '</b><small>' + (3 + i) + ' unidades restantes</small></div><button class="btn btn-ghost btn-sm end" data-act="toast" data-msg="Stock atualizado (simulação).">Repor</button></li>').join('') + '</ul>') + '</div></div>';
  }

  /* ---------- Produtos ---------- */
  function products() {
    const rows = myProducts().map((p) => ({ ...p, stockLabel: p.stock }));
    return H('Os meus produtos', rows.length + ' produtos publicados na sua loja.', '<a class="btn btn-ghost" href="#/produtos/atribuir">' + icon('layers') + ' Atribuir do catálogo</a><a class="btn btn-primary" href="#/produtos/novo">' + icon('plus') + ' Novo produto</a>') +
      ICA.table('s-prod', { rows, per: 7, searchKeys: ['name', 'sku'], searchPlaceholder: 'Pesquisar por nome ou SKU…', filters: [{ k: 'status', label: 'Estado', opts: [['approved', 'Aprovado'], ['pending', 'Pendente']] }, { k: 'sub', label: 'Subcategoria', opts: [...new Set(rows.map((r) => r.sub))] }], href: (r) => '#/produtos/' + r.id,
        tools: '<button class="btn btn-ghost btn-sm" data-act="toast" data-msg="Exportação CSV iniciada.">' + icon('download') + ' Exportar</button>',
        cols: [{ k: 'name', label: 'Produto', render: (r) => '<div class="cell-prod">' + pimg(r) + '<div><b>' + esc(r.name) + '</b><small>' + r.sku + ' · ' + esc(r.sub) + '</small></div></div>' }, { k: 'price', label: 'Preço', render: (r) => money(r.price) }, { k: 'stock', label: 'Stock', render: (r) => (r.stock <= 4 ? '<span class="badge badge-warn">' + r.stock + ' un</span>' : r.stock + ' un') }, { k: 'rating', label: 'Avaliação', render: (r) => ICA.stars(r.rating) }, { k: 'status', label: 'Estado', render: (r) => badge(r.status === 'approved' ? 'active' : 'pending', r.status === 'approved' ? 'Ativo' : 'Em aprovação') }],
        actions: (r) => ICA.rowBtn('edit', 'Editar', '#/produtos/' + r.id) + ICA.delBtn('s-prod', r.id) });
  }
  function productForm({ params }) {
    const p = params.id ? byId(D.products, params.id) : null, isNew = !p;
    const v = p || { name: '', sku: 'ICA-' + (2000 + Math.floor(Math.random() * 900)), price: '', stock: '', desc: '', cat: 3, sub: '' };
    const general = ICA.fields([{ name: 'name', label: 'Nome do produto', value: v.name, required: true, span: 2 }, { name: 'sku', label: 'SKU', value: v.sku, required: true }, { name: 'type', label: 'Tipo de produto', type: 'select', options: ['Simples', 'Configurável', 'Pacote', 'Reserva', 'Virtual'] }, { name: 'short', label: 'Descrição curta', type: 'textarea', rows: 2, span: 2, value: v.desc ? v.desc.slice(0, 90) : '' }, { name: 'desc', label: 'Descrição completa', type: 'textarea', rows: 6, span: 2, value: v.desc }, { name: 'active', label: 'Produto ativo', type: 'toggle', value: true }, { name: 'new', label: 'Marcar como novidade', type: 'toggle', value: isNew }]);
    const price = ICA.fields([{ name: 'price', label: 'Preço (MT)', type: 'number', value: v.price, required: true }, { name: 'special', label: 'Preço especial (MT)', type: 'number', value: v.oldPrice ? v.price : '' }, { name: 'from', label: 'Início do preço especial', type: 'date' }, { name: 'to', label: 'Fim do preço especial', type: 'date' }, { name: 'tax', label: 'Categoria de IVA', type: 'select', options: D.taxCategories.map((t) => t.name) }, { name: 'cost', label: 'Custo (MT)', type: 'number' }]) + '<h4 style="margin:22px 0 10px">Preços por grupo de cliente</h4>' + ICA.table('grp', { rows: D.groups.map((g, i) => ({ id: i, group: g, qty: [1, 10, 50, 100][i], price: Math.round((v.price || 1000) * (1 - i * 0.04)) })), cols: [{ k: 'group', label: 'Grupo' }, { k: 'qty', label: 'Qtd. mínima' }, { k: 'price', label: 'Preço', render: (r) => money(r.price) }], actions: (r) => ICA.delBtn('grp', r.id) });
    const inv = ICA.table('inv', { rows: D.inventorySources.slice(0, 2).map((w, i) => ({ id: i, name: w.name, qty: isNew ? 0 : Math.round((v.stock || 20) / (i + 1)) })), cols: [{ k: 'name', label: 'Armazém' }, { k: 'qty', label: 'Quantidade', render: (r) => '<input class="input input-sm" type="number" value="' + r.qty + '" style="width:110px" aria-label="Quantidade">' }], per: 5 });
    const imgs = '<div class="thumbs" style="margin-bottom:14px">' + (isNew ? '' : [0, 1, 2].map((i) => pimg(v, '', i)).join('')) + '</div>' + ICA.field({ name: 'imgs', label: 'Carregar imagens', type: 'file', hint: 'PNG/JPG, até 5 MB cada' }) + '<div style="height:14px"></div>' + ICA.field({ name: 'vid', label: 'Vídeo', type: 'file', hint: 'MP4 até 50 MB' });
    const cats = '<div class="perm-tree">' + D.categories.map((c) => '<label class="check"><input type="checkbox"' + (v.cat === c.id ? ' checked' : '') + '> <b>' + c.emoji + ' ' + esc(c.name) + '</b></label>' + c.subs.map((s) => '<label class="check" style="padding-left:28px"><input type="checkbox"' + (v.sub === s ? ' checked' : '') + '> ' + esc(s) + '</label>').join('')).join('') + '</div>';
    const seo = ICA.fields([{ name: 'slug', label: 'Slug (URL)', value: 'produto-' + (v.id || 'novo'), span: 2 }, { name: 'mt', label: 'Meta título', value: v.name, span: 2 }, { name: 'md', label: 'Meta descrição', type: 'textarea', rows: 3, span: 2 }]);
    const attrs = ICA.fields([{ name: 'brand', label: 'Marca', type: 'select', options: ['Genérica', 'Huawei', 'Siemens', 'Caterpillar', 'JA Solar'] }, { name: 'cond', label: 'Condição', type: 'select', options: ['Novo', 'Recondicionado'] }, { name: 'war', label: 'Garantia (meses)', type: 'number', value: 24 }, { name: 'wt', label: 'Peso (kg)', type: 'number', value: 12 }]);
    return H(isNew ? 'Novo produto' : 'Editar produto', isNew ? 'Preencha os dados para publicar.' : esc(v.name), '<a class="btn btn-ghost" href="#/produtos">' + icon('left') + ' Voltar</a><button class="btn btn-primary" form="pf">Guardar produto</button>', '<a href="#/produtos">Produtos</a><span>' + (isNew ? 'Novo' : 'Editar') + '</span>') +
      '<form id="pf" data-msg="Produto guardado com sucesso." data-go="#/produtos">' + ICA.card('', ICA.tabs([{ id: 'g', label: 'Geral', html: general }, { id: 'p', label: 'Preço', html: price }, { id: 'i', label: 'Inventário', html: inv }, { id: 'm', label: 'Imagens e vídeos', html: imgs }, { id: 'c', label: 'Categorias', html: cats }, { id: 'a', label: 'Atributos', html: attrs }, { id: 's', label: 'SEO', html: seo }])) + '</form>';
  }
  function assign() {
    const others = D.products.filter((p) => p.seller !== SID && p.status === 'approved');
    return H('Atribuir produto do catálogo', 'Venda produtos já existentes na plataforma com o seu preço e stock.', '<a class="btn btn-ghost" href="#/produtos">' + icon('left') + ' Voltar</a>') +
      ICA.table('assign', { rows: others, per: 7, searchKeys: ['name', 'sku'], searchPlaceholder: 'Pesquisar no catálogo…', cols: [{ k: 'name', label: 'Produto', render: (r) => '<div class="cell-prod">' + pimg(r) + '<div><b>' + esc(r.name) + '</b><small>' + r.sku + '</small></div></div>' }, { k: 'catName', label: 'Categoria' }, { k: 'price', label: 'Preço ref.', render: (r) => money(r.price) }], actions: (r) => '<button class="btn btn-primary btn-sm" data-act="assign-do" data-id="' + r.id + '">Atribuir</button>' });
  }
  ACT['assign-do'] = (el) => { const p = byId(D.products, el.dataset.id); openModal({ title: 'Atribuir: ' + p.name, body: '<form data-msg="Produto atribuído à sua loja.">' + ICA.fields([{ name: 'price', label: 'O seu preço (MT)', type: 'number', value: p.price }, { name: 'qty', label: 'Stock', type: 'number', value: 20 }, { name: 'cond', label: 'Condição', type: 'select', options: ['Novo', 'Recondicionado'] }, { name: 'desc', label: 'Notas', type: 'textarea', span: 2 }]) + '<div style="margin-top:16px;display:flex;justify-content:flex-end;gap:8px"><button type="button" class="btn btn-ghost" data-act="close-modal">Cancelar</button><button class="btn btn-primary">Atribuir</button></div></form>' }); };

  /* ---------- Pedidos ---------- */
  const ordersList = () => H('Pedidos', 'Gerir encomendas dos seus clientes.', '<button class="btn btn-ghost" data-act="toast" data-msg="Exportação iniciada.">' + icon('download') + ' Exportar</button>') +
    ICA.table('s-ord', { rows: myOrders(), per: 8, searchKeys: ['number', 'customer'], searchPlaceholder: 'Pesquisar pedido ou cliente…', filters: [{ k: 'status', label: 'Estado', opts: ['pending', 'processing', 'completed', 'canceled', 'closed'].map((s) => [s, ICA.STATUS[s][0]]) }, { k: 'pay', label: 'Pagamento', opts: D.payMethods }], href: (r) => '#/pedidos/' + r.id,
      cols: [{ k: 'number', label: 'Pedido', render: (r) => '<b>' + r.number + '</b>' }, { k: 'date', label: 'Data', render: (r) => date(r.date) }, { k: 'customer', label: 'Cliente' }, { k: 'pay', label: 'Pagamento' }, { k: 'total', label: 'Total', render: (r) => money(r.total) }, { k: 'status', label: 'Estado', render: (r) => badge(r.status) }], actions: (r) => ICA.rowBtn('eye', 'Ver', '#/pedidos/' + r.id) });
  function orderView({ params }) {
    const o = myOrders().find((x) => String(x.id) === params.id); if (!o) return '<div class="empty-state">Pedido não encontrado.</div>';
    const items = ICA.table('ov-items', { rows: o.items.map((i, k) => ({ ...i, id: k, line: i.qty * i.price })), per: 10, cols: [{ k: 'name', label: 'Produto', render: (r) => '<div class="cell-prod">' + pimg(byId(D.products, r.pid)) + '<div><b>' + esc(r.name) + '</b></div></div>' }, { k: 'price', label: 'Preço', render: (r) => money(r.price) }, { k: 'qty', label: 'Qtd.' }, { k: 'line', label: 'Total', render: (r) => money(r.line) }] }).replace('card table-card', 'table-card');
    return H('Pedido ' + o.number, 'Realizado em ' + dateTime(o.date), badge(o.status) + '<button class="btn btn-ghost" data-act="inv-modal" data-id="' + o.id + '">' + icon('file') + ' Faturar</button><button class="btn btn-ghost" data-act="ship-modal" data-id="' + o.id + '">' + icon('truck') + ' Enviar</button><button class="btn btn-outline-danger" data-act="confirm-toast" data-q="Cancelar o pedido ' + o.number + '?" data-msg="Pedido cancelado." data-danger="1" data-ok="Cancelar pedido">Cancelar</button>', '<a href="#/pedidos">Pedidos</a><span>' + o.number + '</span>') +
      '<div class="grid-2"><div class="stack">' + ICA.card('Itens do pedido', items) + ICA.tabs([{ id: 'inv', label: 'Faturas', html: o.invoiced ? '<p>Fatura <b>FT-' + (7000 + o.id % 900) + '</b> emitida a ' + date(o.date) + ' <button class="btn btn-ghost btn-sm" data-act="toast" data-msg="Fatura transferida.">' + icon('download') + ' PDF</button></p>' : '<p class="mut">Ainda sem faturas.</p>' }, { id: 'sh', label: 'Envios', html: o.shipped ? '<p>Envio <b>EN-' + (500 + o.id % 300) + '</b> · Transportadora ICA Express · Tracking <code>MZ' + (1000000 + o.id) + '</code></p>' : '<p class="mut">Ainda sem envios.</p>' }, { id: 'rf', label: 'Reembolsos', html: '<p class="mut">Sem reembolsos.</p>' }, { id: 'cm', label: 'Comentários', html: '<ul class="timeline"><li><b>Pedido recebido</b><small>' + dateTime(o.date) + '</small></li><li><b>Pagamento confirmado (' + esc(o.pay) + ')</b><small>' + dateTime(o.date) + '</small></li></ul>' }]) + '</div><div class="stack">' +
      ICA.card('Cliente', '<div style="display:flex;gap:12px;align-items:center"><span class="avatar">' + esc(o.customer[0]) + '</span><div><b>' + esc(o.customer) + '</b><div class="mut">' + esc(o.email) + '</div></div></div>') + ICA.card('Morada de entrega', '<p>' + esc(o.customer) + '<br>Av. Julius Nyerere, 1450<br>' + esc(o.city) + ', Moçambique<br>+258 84 000 1111</p>') +
      ICA.card('Resumo financeiro', ICA.kv([['Subtotal', money(o.sub)], ['IVA (16%)', money(o.tax)], ['Comissão ICA (8%)', '-' + money(o.commission)], ['Total do cliente', '<b>' + money(o.total)+ '</b>'], ['A receber', '<b style="color:var(--g700)">' + money(o.sub - o.commission) + '</b>']])) + '</div></div>';
  }
  ACT['inv-modal'] = () => openModal({ title: 'Criar fatura', body: '<form data-msg="Fatura criada com sucesso.">' + ICA.fields([{ name: 'qty', label: 'Quantidade a faturar', type: 'number', value: 1 }, { name: 'nuit', label: 'NUIT do cliente', value: '400123456' }, { name: 'note', label: 'Observações', type: 'textarea', span: 2 }]) + '<div style="margin-top:16px;display:flex;justify-content:flex-end;gap:8px"><button type="button" class="btn btn-ghost" data-act="close-modal">Cancelar</button><button class="btn btn-primary">Criar fatura</button></div></form>' });
  ACT['ship-modal'] = () => openModal({ title: 'Criar envio', body: '<form data-msg="Envio registado. Cliente notificado.">' + ICA.fields([{ name: 'car', label: 'Transportadora', type: 'select', options: ['ICA Express', 'Correios de Moçambique', 'Transportes próprios'] }, { name: 'trk', label: 'Nº de tracking', value: 'MZ' + Math.floor(Math.random() * 9e6 + 1e6) }, { name: 'src', label: 'Armazém de origem', type: 'select', options: D.inventorySources.map((w) => w.name), span: 2 }]) + '<div style="margin-top:16px;display:flex;justify-content:flex-end;gap:8px"><button type="button" class="btn btn-ghost" data-act="close-modal">Cancelar</button><button class="btn btn-primary">Criar envio</button></div></form>' });

  Object.assign(sl, { login, recover, register, dashboard, products, productForm, assign, ordersList, orderView, MENU, H });
})();
