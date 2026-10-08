/* Mercado ICA — Comprador: layout, home, listagem, produto, vendedores */
(function () {
  const ICA = window.ICA;
  const { $, $$, esc, money, icon, ACT, FORMS, S, pimg, toast, openModal, closeModal, byId, date } = ICA;
  const D = ICA;
  const shop = (ICA.shop = {});

  /* ---------- Estado da sessão ---------- */
  const cart = () => S.get('cart', []);
  const wish = () => S.get('wishlist', []);
  const cmp = () => S.get('compare', []);
  const buyer = () => S.get('buyer', null);
  const prod = (id) => byId(D.products, id);
  const sellerOf = (p) => byId(D.sellers, p.seller);
  const liveProducts = () => D.products.filter((p) => p.status === 'approved');
  const cartCount = () => cart().reduce((s, l) => s + l.qty, 0);
  const cartLines = () => cart().map((l) => ({ ...l, p: prod(l.pid) })).filter((l) => l.p);
  const totals = () => {
    const lines = cartLines(), sub = lines.reduce((s, l) => s + l.p.price * l.qty, 0), cp = S.get('coupon', null);
    const disc = cp ? (cp.type === 'percent' ? Math.round((sub * cp.value) / 100) : Math.min(cp.value, sub)) : 0;
    const shipOpt = S.get('shipping', 'standard'), shipCost = !lines.length ? 0 : shipOpt === 'pickup' ? 0 : sub - disc >= 100000 ? 0 : shipOpt === 'express' ? 3500 : 1500;
    const tax = Math.round((sub - disc) * 0.16);
    return { sub, disc, ship: shipCost, tax, total: sub - disc + shipCost + tax, coupon: cp };
  };
  Object.assign(shop, { cart, wish, cmp, buyer, prod, sellerOf, cartLines, cartCount, totals, liveProducts });

  /* ---------- Cartão de produto ---------- */
  function pcard(p) {
    const w = wish().includes(p.id), c = cmp().includes(p.id), off = p.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;
    return '<article class="pcard"><div class="pimg"><a href="#/produto/' + p.id + '" aria-label="' + esc(p.name) + '">' + pimg(p) + '</a><div class="tags">' + (off ? '<span class="tag off">-' + off + '%</span>' : '') + (p.tags.includes('novo') ? '<span class="tag">Novo</span>' : '') + (p.stock <= 4 ? '<span class="tag dark">Últimas unidades</span>' : '') + '</div>' +
      '<div class="qa"><button class="' + (w ? 'on' : '') + '" data-act="wish" data-pid="' + p.id + '" aria-label="Lista de desejos" title="Lista de desejos">' + icon('heart') + '</button><button class="' + (c ? 'on' : '') + '" data-act="cmp" data-pid="' + p.id + '" aria-label="Comparar" title="Comparar">' + icon('compare') + '</button><button data-act="quick" data-pid="' + p.id + '" aria-label="Ver rápido" title="Ver rápido">' + icon('eye') + '</button></div></div>' +
      '<div class="pb"><a class="seller" href="#/vendedor/' + p.seller + '">' + esc(sellerOf(p).shop) + '</a><h3><a href="#/produto/' + p.id + '">' + esc(p.name) + '</a></h3><div class="rate">' + ICA.stars(p.rating) + '<span>(' + p.reviews + ')</span></div>' +
      '<div class="price"><b>' + money(p.price) + '</b>' + (p.oldPrice ? '<s>' + money(p.oldPrice) + '</s>' : '') + '</div><button class="btn btn-primary btn-sm add" data-act="add-cart" data-pid="' + p.id + '">' + icon('cart') + ' Adicionar ao carrinho</button></div></article>';
  }
  shop.pcard = pcard;
  const pgrid = (list, cls = '') => list.length ? '<div class="grid-products ' + cls + '">' + list.map(pcard).join('') + '</div>' : '<div class="empty-state"><h3>Sem produtos</h3></div>';
  shop.pgrid = pgrid;

  /* ---------- Layout ---------- */
  function updateHeader() {
    const set = (id, n) => { const e = $('#' + id); if (e) { e.textContent = n; e.style.display = n ? '' : 'none'; } };
    set('cnt-cart', cartCount()); set('cnt-wish', wish().length); set('cnt-cmp', cmp().length);
    const u = $('#hdr-user'); if (u) u.innerHTML = icon('user') + '<span class="t">' + (buyer() ? esc(buyer().name.split(' ')[0]) : 'Entrar') + '</span>';
    const dr = $('#mini-cart'); if (dr) dr.innerHTML = miniCart();
  }
  function miniCart() {
    const lines = cartLines(), t = totals();
    return '<header><h3>Carrinho (' + cartCount() + ')</h3><button class="icon-btn" data-act="drawer" aria-label="Fechar">' + icon('x') + '</button></header><div class="d-body">' +
      (lines.length ? lines.map((l) => '<div class="mini-line">' + pimg(l.p) + '<div><b>' + esc(l.p.name) + '</b><div class="mut">' + l.qty + ' × ' + money(l.p.price) + '</div></div><button class="icon-btn danger" data-act="rm-cart" data-pid="' + l.pid + '" aria-label="Remover">' + icon('trash') + '</button></div>').join('') : '<div class="empty-state">O carrinho está vazio.</div>') +
      '</div><footer><div class="row" style="display:flex;justify-content:space-between"><span>Subtotal</span><b>' + money(t.sub) + '</b></div><a class="btn btn-ghost" data-act="drawer" href="#/carrinho">Ver carrinho</a><a class="btn btn-primary" data-act="drawer" href="#/checkout">Finalizar compra</a></footer>';
  }
  function layout() {
    document.getElementById('app').innerHTML =
      '<div class="topstrip"><div class="container"><span>' + icon('truck') + ' Entrega em todo o país · Pagamento por M-Pesa, e-Mola, mKesh e iMali Way</span><span class="hide-m"><a href="#/pagina/contactos">Apoio: +258 84 000 0000</a> · <a href="#/vendedores">Vender no Mercado ICA</a> · <a href="../cliente/index.html">Área do Cliente</a></span></div></div>' +
      '<header class="shop-header"><div class="container hdr-main"><button class="icon-btn mobile-only" data-act="toggle-class" data-target="#catnav" data-cls="show" aria-label="Menu">' + icon('menu') + '</button><a class="shop-logo" href="#/"><span class="logo">ICA</span><span>Mercado <em>ICA</em></span></a>' +
      '<form class="hdr-search" data-form="search" role="search"><select name="cat" aria-label="Categoria"><option value="">Todas</option>' + D.categories.map((c) => '<option value="' + c.slug + '">' + esc(c.name) + '</option>').join('') + '</select><input name="q" placeholder="Procurar cimento, geradores, painéis solares…" aria-label="Pesquisar produtos" list="sugg"><datalist id="sugg">' + D.searchTerms.map((t) => '<option value="' + esc(t.term) + '">').join('') + '</datalist><button aria-label="Pesquisar">' + icon('search') + '</button></form>' +
      '<div class="hdr-actions"><a class="hdr-btn" href="#/comparar">' + icon('compare') + '<span class="t">Comparar</span><i class="cnt" id="cnt-cmp"></i></a><a class="hdr-btn" href="#/conta/desejos">' + icon('heart') + '<span class="t">Desejos</span><i class="cnt" id="cnt-wish"></i></a><a class="hdr-btn" id="hdr-user" href="#/conta"></a><button class="hdr-btn" data-act="drawer" aria-label="Carrinho">' + icon('cart') + '<span class="t">Carrinho</span><i class="cnt" id="cnt-cart"></i></button></div></div>' +
      '<nav class="cat-nav" id="catnav" aria-label="Categorias"><div class="container"><a href="#/categoria/todos">' + icon('grid') + ' Todos os produtos</a>' + D.categories.map((c) => '<a href="#/categoria/' + c.slug + '" data-cat="' + c.slug + '">' + c.emoji + ' ' + esc(c.name) + '</a>').join('') + '<a href="#/vendedores">' + icon('store') + ' Vendedores</a></div></nav></header>' +
      '<main id="view"></main>' +
      '<footer class="shop-footer"><div class="container"><div class="foot-grid"><div><a class="shop-logo" href="#/" style="color:#fff"><span class="logo">ICA</span><span>Mercado ICA</span></a><p style="margin:14px 0;max-width:340px">O marketplace B2B de Moçambique: fornecedores verificados, pagamentos seguros e entrega em todo o país.</p>' +
      '<form class="coupon" data-form="newsletter"><input class="input" type="email" placeholder="O seu email" required aria-label="Email"><button class="btn btn-primary">Subscrever</button></form><div class="pay-logos"><span style="background:#e60000">M-PESA</span><span style="background:#f26a21">e-Mola</span><span style="background:#0070c0">mKesh</span><span style="background:#22c55e">iMali Way</span></div></div>' +
      '<div><h4>Comprar</h4>' + D.categories.slice(0, 5).map((c) => '<a href="#/categoria/' + c.slug + '">' + esc(c.name) + '</a>').join('') + '</div><div><h4>Ajuda</h4><a href="#/pagina/sobre-nos">Sobre nós</a><a href="#/pagina/devolucoes">Devoluções</a><a href="#/pagina/termos">Termos e Condições</a><a href="#/pagina/privacidade">Privacidade</a><a href="#/pagina/contactos">Contactos</a></div><div><h4>A minha conta</h4><a href="#/conta">Painel</a><a href="#/conta/pedidos">Pedidos</a><a href="#/conta/devolucoes">Devoluções (RMA)</a><a href="#/vendedores">Seja vendedor</a></div></div>' +
      '<div class="foot-bottom"><span>© 2026 Mercado ICA · Protótipo de interface, sem dados reais</span><span>Maputo · Beira · Nampula</span></div></div></footer>' +
      '<aside class="drawer" id="mini-cart" aria-label="Carrinho"></aside><div class="drawer-scrim" data-act="drawer"></div>';
    if (!S.get('cookie')) cookieBar();
    updateHeader();
  }
  function cookieBar() {
    const c = document.createElement('div'); c.className = 'cookie'; c.id = 'cookie';
    c.innerHTML = '<b>🍪 Utilizamos cookies</b><span class="mut">Para melhorar a sua experiência e analisar o tráfego do site.</span><div style="display:flex;gap:8px"><button class="btn btn-primary btn-sm" data-act="cookie">Aceitar</button><button class="btn btn-ghost btn-sm" data-act="cookie">Recusar</button></div>';
    document.body.appendChild(c);
  }
  ACT['cookie'] = () => { S.set('cookie', 1); const c = $('#cookie'); if (c) c.remove(); };
  ACT['drawer'] = () => { $('#mini-cart').classList.toggle('open'); $('.drawer-scrim').classList.toggle('open'); };
  FORMS['search'] = (d) => { location.hash = '#/pesquisa?q=' + encodeURIComponent(d.q || '') + (d.cat ? '&cat=' + d.cat : ''); };
  FORMS['newsletter'] = (d, f) => { toast('Subscrição confirmada! Obrigado.'); f.reset(); };

  /* ---------- Acções de carrinho, desejos, comparação ---------- */
  function addToCart(pid, qty = 1) {
    const c = cart(), l = c.find((x) => x.pid === pid);
    if (l) l.qty += qty; else c.push({ pid, qty });
    S.set('cart', c); updateHeader();
  }
  shop.addToCart = addToCart;
  ACT['add-cart'] = (el) => { addToCart(+el.dataset.pid, +el.dataset.qty || 1); toast('Produto adicionado ao carrinho.'); };
  ACT['rm-cart'] = (el) => { S.set('cart', cart().filter((l) => l.pid !== +el.dataset.pid)); updateHeader(); ICA.refresh(); toast('Produto removido do carrinho.', 'info'); };
  const toggleList = (key, pid, on, off, max) => {
    let l = S.get(key, []);
    if (l.includes(pid)) { l = l.filter((x) => x !== pid); toast(off, 'info'); }
    else { if (max && l.length >= max) { toast('Pode comparar até ' + max + ' produtos.', 'error'); return; } l.push(pid); toast(on); }
    S.set(key, l); updateHeader(); ICA.refresh();
  };
  ACT['wish'] = (el) => toggleList('wishlist', +el.dataset.pid, 'Adicionado à lista de desejos.', 'Removido da lista de desejos.');
  ACT['cmp'] = (el) => toggleList('compare', +el.dataset.pid, 'Adicionado à comparação.', 'Removido da comparação.', 4);
  ACT['quick'] = (el) => {
    const p = prod(+el.dataset.pid);
    openModal({ title: p.name, size: 'lg', body: '<div class="grid-eq"><div>' + pimg(p, 'qv') + '</div><div><p class="mut">' + esc(sellerOf(p).shop) + '</p><div style="margin:8px 0">' + ICA.stars(p.rating) + ' <span class="mut">(' + p.reviews + ' avaliações)</span></div><div class="price" style="margin-bottom:12px"><b style="font-size:26px">' + money(p.price) + '</b>' + (p.oldPrice ? '<s>' + money(p.oldPrice) + '</s>' : '') + '</div><p>' + esc(p.desc) + '</p></div></div>', footer: '<a class="btn btn-ghost" data-act="close-modal" href="#/produto/' + p.id + '">Ver detalhes</a><button class="btn btn-primary" data-act="add-cart" data-pid="' + p.id + '">Adicionar ao carrinho</button>' });
  };

  /* ---------- Home ---------- */
  function home() {
    const L = liveProducts();
    const section = (cls, title, link, inner) => '<section class="sec ' + cls + '"><div class="container"><div class="sec-h"><h2>' + title + '</h2>' + (link ? '<a href="' + link + '">Ver todos ' + icon('right') + '</a>' : '') + '</div>' + inner + '</div></section>';
    return '<section class="hero"><div class="container"><div><span class="hero-tag"><b>B2B</b> Fornecedores verificados em todo o país</span><h1>Tudo o que a sua obra precisa, <span>numa só plataforma</span></h1><p>Construção, maquinário, tecnologia, logística, energia solar e automação. Compare preços, peça orçamentos e pague por M-Pesa, e-Mola, mKesh ou iMali Way.</p><div class="hero-cta"><a class="btn btn-primary btn-lg" href="#/categoria/todos">Comprar agora</a><a class="btn btn-dark btn-lg" href="#/pagina/contactos">Falar com especialista</a></div></div>' +
      '<div class="hero-art" aria-hidden="true"><div class="tile t1">' + pimg(prod(7)) + '</div><div class="tile t2">' + pimg(prod(28)) + '</div><div class="tile t3">' + pimg(prod(12)) + '</div><div class="tile t4">' + pimg(prod(33)) + '</div><div class="hero-badge"><b>+1.200</b>produtos disponíveis</div></div></div></section>' +
      '<div class="trust"><div class="container"><div>' + icon('shield') + '<span><b>Compra protegida</b><small>Pagamento só liberado na entrega</small></span></div><div>' + icon('truck') + '<span><b>Entrega nacional</b><small>Maputo, Beira, Nampula e mais</small></span></div><div>' + icon('wallet') + '<span><b>Carteiras móveis</b><small>M-Pesa, e-Mola, mKesh, iMali</small></span></div><div>' + icon('refresh') + '<span><b>Devolução em 14 dias</b><small>Processo simples (RMA)</small></span></div></div></div>' +
      section('', 'Novidades', '#/categoria/todos', pgrid(L.filter((p) => p.tags.includes('novo')).slice(0, 4))) +
      section('alt', 'Categorias em Destaque', '', '<div class="cat-grid">' + D.categories.map((c) => '<a class="cat-tile" href="#/categoria/' + c.slug + '"><i style="background:' + c.color + '22">' + c.emoji + '</i>' + esc(c.name) + '<small>' + L.filter((p) => p.cat === c.id).length + ' produtos</small></a>').join('') + '</div>') +
      section('', 'Oportunidades da Semana', '#/categoria/todos?sort=desconto', pgrid(L.filter((p) => p.oldPrice).slice(0, 4))) +
      section('alt', 'Mais Vendidos', '#/categoria/todos?sort=vendas', pgrid(L.slice().sort((a, b) => b.sold - a.sold).slice(0, 4))) +
      '<section class="sec dark"><div class="container promo-band"><div><h2>Compre à escala da <span>sua cadeia de valor</span></h2><p>Peça orçamentos a vários fornecedores, negocie quantidade e acompanhe cada encomenda. Tudo registado, com fatura e IVA.</p><a class="btn btn-primary btn-lg" href="#/vendedores">Conhecer vendedores</a></div><div class="promo-stats"><div><b>6</b>vendedores verificados</div><div><b>36</b>produtos em catálogo</div><div><b>4</b>carteiras móveis</div><div><b>14 dias</b>para devoluções</div></div></div></section>' +
      section('', 'Vendedores em Destaque', '#/vendedores', sellerCards(D.sellers.filter((s) => s.status === 'approved').slice(0, 3))) +
      '<div class="container"><div class="partners"><span>M-PESA</span><span>e-MOLA</span><span>mKESH</span><span>iMALI WAY</span><span>VISA</span></div></div>';
  }
  function sellerCards(list) {
    return '<div class="seller-cards">' + list.map((s) => '<a class="seller-card" href="#/vendedor/' + s.id + '"><div class="top"><span class="logo-s" style="background:' + s.color + '">' + esc(s.shop[0]) + '</span><div><b>' + esc(s.shop) + '</b><div class="mut">' + icon('pin') + ' ' + esc(s.city) + '</div></div></div><div>' + ICA.stars(s.rating) + ' <span class="mut">' + s.rating.toFixed(1) + '</span></div><p class="mut">' + esc(s.about) + '</p><span class="mut">' + D.products.filter((p) => p.seller === s.id && p.status === 'approved').length + ' produtos</span></a>').join('') + '</div>';
  }

  /* ---------- Listagem / pesquisa ---------- */
  const LS = { sub: '', sellers: [], max: 6000000, rating: 0, sort: 'relevancia', view: 'grid', key: '' };
  function listing({ params, q, path }) {
    const slug = path.startsWith('/pesquisa') ? 'pesquisa' : params.slug;
    const key = slug + '|' + (q.q || '') + '|' + (q.cat || '');
    if (LS.key !== key) { Object.assign(LS, { sub: '', sellers: [], max: 6000000, rating: 0, sort: q.sort === 'vendas' ? 'vendas' : q.sort === 'desconto' ? 'desconto' : 'relevancia', key }); }
    const cat = slug === 'pesquisa' ? D.categories.find((c) => c.slug === q.cat) : D.categories.find((c) => c.slug === slug);
    let L = liveProducts().filter((p) => !cat || p.cat === cat.id);
    if (slug === 'pesquisa' && q.q) L = L.filter((p) => (p.name + ' ' + p.catName + ' ' + p.sub).toLowerCase().includes(q.q.toLowerCase()));
    const baseList = L;
    if (LS.sub) L = L.filter((p) => p.sub === LS.sub);
    if (LS.sellers.length) L = L.filter((p) => LS.sellers.includes(p.seller));
    L = L.filter((p) => p.price <= LS.max && p.rating >= LS.rating);
    const sorters = { relevancia: (a, b) => b.sold - a.sold, vendas: (a, b) => b.sold - a.sold, desconto: (a, b) => (b.oldPrice ? 1 - b.price / b.oldPrice : 0) - (a.oldPrice ? 1 - a.price / a.oldPrice : 0), 'preco-asc': (a, b) => a.price - b.price, 'preco-desc': (a, b) => b.price - a.price, avaliacao: (a, b) => b.rating - a.rating };
    L = L.slice().sort(sorters[LS.sort]);
    const title = slug === 'pesquisa' ? 'Resultados para “' + esc(q.q || 'todos') + '”' : cat ? cat.emoji + ' ' + esc(cat.name) : 'Todos os produtos';
    const subs = cat ? cat.subs : [...new Set(baseList.map((p) => p.sub))];
    const sellersIn = [...new Set(baseList.map((p) => p.seller))];
    const chips = [LS.sub && '<button class="chip" data-act="flt-clear" data-k="sub">' + esc(LS.sub) + ' ✕</button>', ...LS.sellers.map((id) => '<button class="chip" data-act="flt-seller" data-id="' + id + '">' + esc(byId(D.sellers, id).shop) + ' ✕</button>'), LS.rating && '<button class="chip" data-act="flt-clear" data-k="rating">' + LS.rating + '★ ou mais ✕</button>'].filter(Boolean);
    return '<div class="page-title"><div class="container"><nav class="crumbs"><a href="#/">Início</a><span>' + (cat ? esc(cat.name) : 'Produtos') + '</span></nav><h1>' + title + '</h1></div></div><div class="container listing">' +
      '<aside class="filters" id="filters"><div class="fbox"><h4>Subcategorias</h4>' + subs.map((s) => '<label class="check"><input type="radio" name="sub" ' + (LS.sub === s ? 'checked' : '') + ' data-act="flt-sub" data-v="' + esc(s) + '"> ' + esc(s) + '<span>' + baseList.filter((p) => p.sub === s).length + '</span></label>').join('') + '<label class="check"><input type="radio" name="sub" ' + (!LS.sub ? 'checked' : '') + ' data-act="flt-sub" data-v=""> Todas</label></div>' +
      '<div class="fbox"><h4>Preço máximo: <b>' + money(LS.max) + '</b></h4><input type="range" min="1000" max="6000000" step="1000" value="' + LS.max + '" data-range="max" aria-label="Preço máximo"></div>' +
      '<div class="fbox"><h4>Vendedor</h4>' + sellersIn.map((id) => '<label class="check"><input type="checkbox" data-act="flt-seller" data-id="' + id + '" ' + (LS.sellers.includes(id) ? 'checked' : '') + '> ' + esc(byId(D.sellers, id).shop) + '</label>').join('') + '</div>' +
      '<div class="fbox"><h4>Avaliação mínima</h4>' + [4, 3, 0].map((r) => '<label class="check"><input type="radio" name="rt" data-act="flt-rating" data-v="' + r + '" ' + (LS.rating === r ? 'checked' : '') + '> ' + (r ? r + ' estrelas ou mais' : 'Todas') + '</label>').join('') + '</div></aside>' +
      '<div><div class="sortbar"><div style="display:flex;gap:10px;align-items:center"><button class="btn btn-ghost btn-sm filter-toggle" data-act="toggle-class" data-target="#filters" data-cls="open">' + icon('filter') + ' Filtros</button><b>' + L.length + '</b> produtos</div><div style="display:flex;gap:10px;align-items:center"><select class="input input-sm" data-sort aria-label="Ordenar">' + [['relevancia', 'Relevância'], ['vendas', 'Mais vendidos'], ['desconto', 'Maior desconto'], ['preco-asc', 'Preço: menor'], ['preco-desc', 'Preço: maior'], ['avaliacao', 'Melhor avaliados']].map((o) => '<option value="' + o[0] + '"' + (LS.sort === o[0] ? ' selected' : '') + '>' + o[1] + '</option>').join('') + '</select><div class="view-toggle"><button class="' + (LS.view === 'grid' ? 'on' : '') + '" data-act="view" data-v="grid" aria-label="Grelha">' + icon('grid') + '</button><button class="' + (LS.view === 'list' ? 'on' : '') + '" data-act="view" data-v="list" aria-label="Lista">' + icon('list') + '</button></div></div></div>' +
      (chips.length ? '<div class="chips" style="margin-bottom:16px">' + chips.join('') + '</div>' : '') +
      (L.length ? pgrid(L, LS.view === 'list' ? 'list' : '') : '<div class="empty-state card"><h3>Nenhum produto encontrado</h3><p>Ajuste os filtros ou pesquise outro termo.</p></div>') + '</div></div>';
  }
  const re = () => ICA.refresh();
  ACT['flt-sub'] = (el) => { LS.sub = el.dataset.v; re(); };
  ACT['flt-rating'] = (el) => { LS.rating = +el.dataset.v; re(); };
  ACT['flt-seller'] = (el) => { const id = +el.dataset.id; LS.sellers = LS.sellers.includes(id) ? LS.sellers.filter((x) => x !== id) : LS.sellers.concat(id); re(); };
  ACT['flt-clear'] = (el) => { LS[el.dataset.k] = el.dataset.k === 'rating' ? 0 : ''; re(); };
  ACT['view'] = (el) => { LS.view = el.dataset.v; re(); };
  document.addEventListener('change', (e) => { if (e.target.dataset && e.target.dataset.sort !== undefined) { LS.sort = e.target.value; re(); } if (e.target.dataset && e.target.dataset.act && e.target.matches('input')) { const f = ACT[e.target.dataset.act]; if (f && e.target.dataset.act.startsWith('flt-')) f(e.target); } });
  document.addEventListener('change', (e) => { if (e.target.dataset && e.target.dataset.range) { LS.max = +e.target.value; re(); } });
  document.addEventListener('input', (e) => { if (e.target.dataset && e.target.dataset.range) { const b = e.target.closest('.fbox').querySelector('b'); if (b) b.textContent = money(+e.target.value); } });

  /* ---------- Página de produto ---------- */
  const PS = { pid: 0, img: 0, qty: 1, opt: 0, tab: 'desc' };
  function product({ params }) {
    const p = prod(params.id);
    if (!p) return '<div class="container page-main empty-state"><h2>Produto não encontrado</h2><a class="btn btn-primary" href="#/">Voltar ao início</a></div>';
    if (PS.pid !== p.id) Object.assign(PS, { pid: p.id, img: 0, qty: 1, opt: 0 });
    const s = sellerOf(p), w = wish().includes(p.id), opts = ['Standard', 'Com instalação', 'Pack empresarial'], off = p.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;
    const related = liveProducts().filter((x) => x.cat === p.cat && x.id !== p.id).slice(0, 4);
    const revs = D.reviews.filter((r) => r.pid === p.id && r.status === 'approved');
    const revList = (revs.length ? revs : D.reviews.filter((r) => r.status === 'approved').slice(0, 3)).map((r) => '<div class="rev"><header><span class="avatar">' + esc(r.customer[0]) + '</span><div><b>' + esc(r.customer) + '</b><div>' + ICA.stars(r.rating) + ' <span class="mut">' + date(r.date) + '</span></div></div></header><b>' + esc(r.title) + '</b><p>' + esc(r.comment) + '</p></div>').join('');
    const tab = (id, label, html) => ({ id, label, html });
    return '<div class="container"><nav class="crumbs" style="padding-top:18px"><a href="#/">Início</a><span><a href="#/categoria/' + D.categories.find((c) => c.id === p.cat).slug + '">' + esc(p.catName) + '</a></span><span>' + esc(p.sub) + '</span></nav>' +
      '<div class="pdp"><div class="gallery"><div class="thumbs-v">' + [0, 1, 2, 3].map((i) => '<button class="' + (PS.img === i ? 'on' : '') + '" data-act="pdp-img" data-i="' + i + '" aria-label="Imagem ' + (i + 1) + '">' + pimg(p, '', i) + '</button>').join('') + '</div><div class="main-img" data-act="zoom">' + pimg(p, '', PS.img) + '</div></div>' +
      '<div class="pdp-info"><a class="badge badge-ok" href="#/vendedor/' + s.id + '">' + icon('shield') + ' &nbsp;' + esc(s.shop) + '</a><h1>' + esc(p.name) + '</h1><div class="pdp-meta">' + ICA.stars(p.rating, 'lg') + '<span>' + p.rating + ' (' + p.reviews + ' avaliações)</span><span>SKU: ' + p.sku + '</span><span>' + p.sold + ' vendidos</span></div>' +
      '<div class="pdp-price"><b>' + money(p.price) + '</b>' + (p.oldPrice ? '<s>' + money(p.oldPrice) + '</s><span class="tag off">-' + off + '%</span>' : '') + '</div><p class="mut">IVA (16%) calculado no checkout.</p><p style="margin:12px 0">' + esc(p.desc) + '</p>' +
      '<b>Variante</b><div class="opt-row">' + opts.map((o, i) => '<button class="opt ' + (PS.opt === i ? 'on' : '') + '" data-act="pdp-opt" data-i="' + i + '">' + o + '</button>').join('') + '</div>' +
      '<p>' + (p.stock > 10 ? '<span class="badge badge-ok">Em stock (' + p.stock + ')</span>' : '<span class="badge badge-warn">Apenas ' + p.stock + ' em stock</span>') + '</p>' +
      '<div class="buy-row"><div class="qty"><button data-act="pdp-qty" data-d="-1" aria-label="Menos">' + icon('minus') + '</button><span>' + PS.qty + '</span><button data-act="pdp-qty" data-d="1" aria-label="Mais">' + icon('plus') + '</button></div><button class="btn btn-primary btn-lg" data-act="pdp-add">' + icon('cart') + ' Adicionar ao carrinho</button><button class="btn btn-dark btn-lg" data-act="pdp-buy">Comprar agora</button></div>' +
      '<div class="toolbar"><button class="btn btn-ghost" data-act="wish" data-pid="' + p.id + '">' + icon('heart') + (w ? ' Na lista de desejos' : ' Lista de desejos') + '</button><button class="btn btn-ghost" data-act="cmp" data-pid="' + p.id + '">' + icon('compare') + ' Comparar</button><button class="btn btn-ghost" data-act="quote" data-pid="' + p.id + '">' + icon('file') + ' Pedir orçamento</button><button class="btn btn-ghost" data-act="share">' + icon('external') + ' Partilhar</button></div>' +
      '<div class="seller-box" style="margin-top:18px"><span class="avatar" style="background:' + s.color + ';color:#fff;width:48px;height:48px">' + esc(s.shop[0]) + '</span><div><b>' + esc(s.shop) + '</b><div class="mut">' + icon('pin') + ' ' + esc(s.city) + ' · ' + ICA.stars(s.rating) + '</div></div><button class="btn btn-ghost btn-sm" style="margin-left:auto" data-act="contact-seller" data-id="' + s.id + '">' + icon('message') + ' Contactar</button></div>' +
      '<div class="perks"><div>' + icon('truck') + ' Entrega estimada em 2–5 dias úteis</div><div>' + icon('shield') + ' Garantia do fornecedor e compra protegida</div><div>' + icon('refresh') + ' Devolução até 14 dias</div></div></div></div>' +
      '<section class="card" style="margin-bottom:34px"><div class="card-b">' + ICA.tabs([
        tab('desc', 'Descrição', '<p style="max-width:80ch">' + esc(p.desc) + ' Este artigo é fornecido por <b>' + esc(s.shop) + '</b> e inclui fatura com NUIT, documentação técnica e suporte pós-venda. Entregas para todas as províncias, com possibilidade de levantamento no armazém.</p>'),
        tab('spec', 'Especificações', '<table class="spec-table"><tbody><tr><td>Categoria</td><td>' + esc(p.catName) + ' › ' + esc(p.sub) + '</td></tr><tr><td>Referência</td><td>' + p.sku + '</td></tr>' + p.specs.map((x) => '<tr><td>' + esc(x[0]) + '</td><td>' + esc(x[1]) + '</td></tr>').join('') + '</tbody></table>'),
        tab('rev', 'Avaliações (' + p.reviews + ')', '<div class="grid-eq"><div><div style="display:flex;gap:14px;align-items:center"><b style="font-size:44px">' + p.rating + '</b><div>' + ICA.stars(p.rating, 'lg') + '<div class="mut">' + p.reviews + ' avaliações</div></div></div><div class="rating-bars" style="margin-top:14px">' + [5, 4, 3, 2, 1].map((n, i) => '<div><span>' + n + '★</span>' + ICA.progress([62, 24, 9, 3, 2][i]) + '<span class="mut">' + [62, 24, 9, 3, 2][i] + '%</span></div>').join('') + '</div><button class="btn btn-primary" style="margin-top:16px" data-act="write-review">Escrever avaliação</button></div><div>' + revList + '</div></div>'),
        tab('ship', 'Entrega e devoluções', '<p>Entrega standard em 2–5 dias úteis (1.500 MT; grátis acima de 100.000 MT). Entrega expresso em 24–48 h (3.500 MT). Levantamento gratuito no armazém do vendedor. Devoluções (RMA) até 14 dias após a entrega.</p>'),
      ], ['desc', 'spec', 'rev', 'ship'].indexOf(PS.tab)) + '</div></section>' +
      '<div class="sec-h"><h2>Produtos relacionados</h2></div>' + pgrid(related) + '<div style="height:50px"></div></div>';
  }
  ACT['pdp-img'] = (el) => { PS.img = +el.dataset.i; re(); };
  ACT['pdp-opt'] = (el) => { PS.opt = +el.dataset.i; re(); };
  ACT['pdp-qty'] = (el) => { PS.qty = Math.max(1, PS.qty + +el.dataset.d); re(); };
  ACT['pdp-add'] = () => { addToCart(PS.pid, PS.qty); toast('Adicionado ao carrinho (' + PS.qty + ').'); };
  ACT['pdp-buy'] = () => { addToCart(PS.pid, PS.qty); location.hash = '#/checkout'; };
  ACT['zoom'] = () => openModal({ title: 'Ampliar imagem', size: 'lg', body: pimg(prod(PS.pid), '', PS.img) });
  ACT['share'] = () => toast('Ligação copiada para a área de transferência.', 'info');
  ACT['quote'] = (el) => { const p = prod(+el.dataset.pid); openModal({ title: 'Pedir orçamento', body: '<form data-form="quote" data-msg="Pedido enviado! O vendedor responde em 24 h."><p class="mut" style="margin-bottom:14px">' + esc(p.name) + '</p>' + ICA.fields([{ name: 'qty', label: 'Quantidade', type: 'number', value: 10, required: true }, { name: 'when', label: 'Prazo desejado', type: 'date' }, { name: 'msg', label: 'Observações', type: 'textarea', span: 2, placeholder: 'Local de entrega, condições de pagamento…' }]) + '<div style="margin-top:16px;display:flex;justify-content:flex-end;gap:8px"><button type="button" class="btn btn-ghost" data-act="close-modal">Cancelar</button><button class="btn btn-primary">Enviar pedido</button></div></form>' }); };
  ACT['contact-seller'] = (el) => { const s = byId(D.sellers, el.dataset.id); openModal({ title: 'Contactar ' + s.shop, body: '<form data-msg="Mensagem enviada ao vendedor.">' + ICA.fields([{ name: 'subject', label: 'Assunto', value: 'Dúvida sobre produto', span: 2 }, { name: 'msg', label: 'Mensagem', type: 'textarea', span: 2, required: true }]) + '<div style="margin-top:16px;display:flex;justify-content:flex-end;gap:8px"><button type="button" class="btn btn-ghost" data-act="close-modal">Cancelar</button><button class="btn btn-primary">Enviar</button></div></form>' }); };
  let stars = 5;
  ACT['write-review'] = () => {
    if (!buyer()) { toast('Inicie sessão para avaliar.', 'info'); location.hash = '#/entrar'; return; }
    stars = 5;
    openModal({ title: 'Escrever avaliação', body: '<form data-msg="Avaliação enviada para moderação. Obrigado!"><div class="field"><label>Classificação</label><div class="star-pick" id="sp">' + [1, 2, 3, 4, 5].map((i) => '<button type="button" class="on" data-act="pick-star" data-n="' + i + '" aria-label="' + i + ' estrelas">' + icon('star') + '</button>').join('') + '</div></div><div style="height:12px"></div>' + ICA.fields([{ name: 'title', label: 'Título', span: 2 }, { name: 'comment', label: 'Comentário', type: 'textarea', span: 2, required: true }]) + '<div style="margin-top:16px;display:flex;justify-content:flex-end;gap:8px"><button type="button" class="btn btn-ghost" data-act="close-modal">Cancelar</button><button class="btn btn-primary">Publicar</button></div></form>' });
  };
  ACT['pick-star'] = (el) => { stars = +el.dataset.n; $$('#sp button').forEach((b, i) => b.classList.toggle('on', i < stars)); };

  /* ---------- Vendedores ---------- */
  const sellers = () => '<div class="page-title"><div class="container"><nav class="crumbs"><a href="#/">Início</a><span>Vendedores</span></nav><h1>Vendedores verificados</h1></div></div><div class="container page-main">' + sellerCards(D.sellers.filter((s) => s.status === 'approved')) + '<div class="card" style="margin-top:34px"><div class="card-b" style="display:flex;gap:20px;align-items:center;flex-wrap:wrap;justify-content:space-between"><div><h3>Quer vender no Mercado ICA?</h3><p class="mut">Abra a sua loja, publique produtos e receba por carteira móvel ou transferência.</p></div><a class="btn btn-primary btn-lg" href="../cliente/index.html#/registar">Tornar-me vendedor</a></div></div></div>';
  function sellerPage({ params }) {
    const s = byId(D.sellers, params.id), L = liveProducts().filter((p) => p.seller === s.id);
    return '<div class="hero" style="background:linear-gradient(110deg,' + s.color + 'cc,#030213)"><div class="container" style="grid-template-columns:1fr;padding:40px 0;color:#fff"><div style="display:flex;gap:18px;align-items:center;flex-wrap:wrap"><span class="logo-s" style="display:grid;place-items:center;width:84px;height:84px;border-radius:22px;background:#fff;color:' + s.color + ';font-size:36px;font-weight:800">' + esc(s.shop[0]) + '</span><div><h1 style="margin:0;font-size:28px;text-transform:none;font-family:var(--font)">' + esc(s.shop) + '</h1><p style="color:#e5e7eb">' + icon('pin') + ' ' + esc(s.city) + ' · Vendedor desde ' + s.since + ' · ' + s.rating.toFixed(1) + ' ★</p></div><div style="margin-left:auto;display:flex;gap:8px"><button class="btn btn-primary" data-act="contact-seller" data-id="' + s.id + '">' + icon('message') + ' Contactar</button><button class="btn btn-ghost" data-act="report-seller">' + icon('flag') + ' Denunciar</button></div></div></div></div>' +
      '<div class="container page-main">' + ICA.tabs([{ id: 'prods', label: 'Produtos (' + L.length + ')', html: pgrid(L) }, { id: 'about', label: 'Sobre', html: '<p style="max-width:70ch">' + esc(s.about) + '</p><dl class="kv" style="max-width:420px;margin-top:16px"><div><dt>Responsável</dt><dd>' + esc(s.owner) + '</dd></div><div><dt>Email</dt><dd>' + esc(s.email) + '</dd></div><div><dt>Telefone</dt><dd>' + esc(s.phone) + '</dd></div></dl>' }, { id: 'revs', label: 'Avaliações', html: D.reviews.filter((r) => r.status === 'approved').slice(0, 5).map((r) => '<div class="rev"><header><span class="avatar">' + esc(r.customer[0]) + '</span><div><b>' + esc(r.customer) + '</b><div>' + ICA.stars(r.rating) + '</div></div></header><p>' + esc(r.comment) + '</p></div>').join('') }]) + '</div>';
  }
  ACT['report-seller'] = () => openModal({ title: 'Denunciar vendedor', body: '<form data-msg="Denúncia registada. A nossa equipa irá analisar.">' + ICA.fields([{ name: 'reason', label: 'Motivo', type: 'select', options: ['Produto falsificado', 'Preços enganosos', 'Comportamento abusivo', 'Outro'], span: 2 }, { name: 'msg', label: 'Detalhes', type: 'textarea', span: 2 }]) + '<div style="margin-top:16px;display:flex;justify-content:flex-end;gap:8px"><button type="button" class="btn btn-ghost" data-act="close-modal">Cancelar</button><button class="btn btn-danger">Denunciar</button></div></form>' });
  const cmsPage = ({ params }) => { const pg = D.cmsPages.find((x) => x.slug === params.slug); return pg ? '<div class="container page-main"><article class="cms"><h1>' + esc(pg.title) + '</h1><p>' + esc(pg.body) + '</p></article></div>' : notFound(); };
  const notFound = () => '<div class="container page-main empty-state"><h1 style="font-size:72px;font-family:var(--display);color:var(--g500)">404</h1><h2>Página não encontrada</h2><p>A ligação que seguiu não existe neste protótipo.</p><a class="btn btn-primary" style="margin-top:16px" href="#/">Voltar ao início</a></div>';

  Object.assign(shop, { layout, updateHeader, home, listing, product, sellers, sellerPage, cmsPage, notFound, sellerCards });
})();
