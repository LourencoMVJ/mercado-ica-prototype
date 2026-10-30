/* Mercado ICA — Comprador (fiel às views Blade reais): layout, home, listagem, produto, vendedores */
(function () {
  const ICA = window.ICA;
  const { $, $$, esc, money, ACT, FORMS, S, pimg, toast, openModal, byId, date } = ICA;
  const D = ICA;
  const shop = (ICA.shop = {});
  const BR = 'ICA_BRAND'; // marcador (apenas documentação): imagens de marca em assets/real/brand
  const brand = (f) => '../assets/real/brand/' + f;
  const ic = (n, c = '') => '<span class="icon-' + n + ' ' + c + '"></span>';

  /* ---------- Estado da sessão ---------- */
  const cart = () => S.get('cart', []);
  const wish = () => S.get('wishlist', []);
  const cmp = () => S.get('compare', []);
  const buyer = () => S.get('buyer', null);
  const prod = (id) => byId(D.products, id);
  const sellerOf = (p) => byId(D.sellers, p.seller);
  const liveProducts = () => D.products.filter((p) => p.status === 'approved');
  const cartCount = () => cart().reduce((s, l) => s + l.qty, 0);
  /* preço por volume: 10+ unidades -5%, 50+ unidades -10% (o mesmo em cartões, produto, carrinho e checkout) */
  const TIERS = [[50, 0.9], [10, 0.95], [1, 1]];
  const FREE_SHIP = 100000;
  const unitPrice = (p, qty) => Math.round(p.price * TIERS.find((t) => qty >= t[0])[1]);
  const cartLines = () => cart().map((l) => { const p = prod(l.pid); return p && { ...l, p, unit: unitPrice(p, l.qty) }; }).filter(Boolean);
  const totals = () => {
    const lines = cartLines(), sub = lines.reduce((s, l) => s + l.unit * l.qty, 0), cp = S.get('coupon', null);
    const disc = cp ? (cp.type === 'percent' ? Math.round((sub * cp.value) / 100) : Math.min(cp.value, sub)) : 0;
    // envio: levantamento grátis; expresso 3500 MT sempre; normal 1500 MT, grátis a partir de FREE_SHIP
    const shipOpt = S.get('shipping', 'standard'), shipCost = !lines.length || shipOpt === 'pickup' ? 0 : shipOpt === 'express' ? 3500 : sub - disc >= FREE_SHIP ? 0 : 1500;
    const tax = Math.round((sub - disc) * 0.16);
    return { sub, disc, ship: shipCost, tax, total: sub - disc + shipCost + tax, coupon: cp };
  };
  Object.assign(shop, { cart, wish, cmp, buyer, prod, sellerOf, cartLines, cartCount, totals, liveProducts, brand, ic, TIERS, unitPrice, FREE_SHIP });

  /* ---------- Estado vazio (mini-carrinho) ---------- */
  const emptyBox = (msg) => '<div class="m-auto grid w-full place-content-center items-center justify-items-center py-32 text-center"><p class="text-xl max-md:text-sm" role="heading">' + msg + '</p></div>';
  Object.assign(shop, { emptyBox });

  /* ---------- Layout D (cabeçalho, rodapé, gaveta, barra inferior, mini-carrinho) ---------- */
  const SPRITE = '<svg width="0" height="0" style="position:absolute" aria-hidden="true">' +
    '<symbol id="d-search" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></symbol>' +
    '<symbol id="d-cart" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/><path d="M2 3h3l2.6 12.4a2 2 0 0 0 2 1.6h8.2a2 2 0 0 0 2-1.5L22 7H6"/></symbol>' +
    '<symbol id="d-heart" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z"/></symbol>' +
    '<symbol id="d-user" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></symbol>' +
    '<symbol id="d-home" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"><path d="M3 10 12 3l9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/></symbol>' +
    '<symbol id="d-grid" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></symbol>' +
    '<symbol id="d-menu" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h10"/></symbol>' +
    '<symbol id="d-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 5 5 9-10"/></symbol>' +
    '<symbol id="d-wallet" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"><path d="M20 7V5a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15v12H5a2 2 0 0 1-2-2V6"/><circle cx="16" cy="14" r="1.3" fill="currentColor"/></symbol>' +
    '<symbol id="d-eye" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></symbol>' +
    '<symbol id="d-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></symbol></svg>';
  const svg = (id, st = '') => '<svg class="d-ic"' + (st ? ' style="' + st + '"' : '') + ' aria-hidden="true"><use href="#d-' + id + '"/></svg>';
  shop.svg = svg;
  const logo = (f, alt = 'Mercado ICA') => '<img src="../assets/brand/' + f + '" alt="' + alt + '">';
  const BALANCE = 125430; // saldo iMali de demonstração
  shop.BALANCE = BALANCE;
  const balHidden = () => { try { return localStorage.getItem('ica.balHidden') === '1'; } catch (e) { return false; } };
  const balBlock = (extra = '') => '<div class="d-bal ' + extra + '" data-d-bal>' + svg('wallet', 'color:var(--d-lime)') + '<span style="flex:1"><small>Saldo iMali</small><b data-d-balval></b></span><button type="button" class="d-eye" data-act="d-bal-eye" aria-label="Esconder saldo">' + svg('eye', 'width:17px;height:17px') + '</button></div>';

  function updateHeader() {
    const n = cartCount(), w = wish().length, b = buyer(), hid = balHidden();
    $$('[data-d-cart]').forEach((c) => { c.textContent = n; c.dataset.n = n; });
    $$('[data-d-wish]').forEach((c) => { c.textContent = w; c.dataset.n = w; });
    const tot = $('#hdr-cart-total'); if (tot) tot.textContent = n ? money(totals().total) : 'Vazio';
    const u = $('#hdr-auth'); if (u) u.innerHTML = authBlock();
    $$('[data-d-bal]').forEach((el) => {
      el.style.display = b ? '' : 'none';
      el.classList.toggle('is-hidden', hid);
      $('[data-d-balval]', el).textContent = hid ? '••••• MT' : money(BALANCE);
      const e = $('.d-eye', el); e.setAttribute('aria-label', hid ? 'Mostrar saldo' : 'Esconder saldo'); e.setAttribute('aria-pressed', hid);
    });
    const dr = $('#mini-cart-body'); if (dr) dr.innerHTML = miniCart();
  }
  function authBlock() {
    const b = buyer();
    if (!b) return '<a href="#/entrar" class="d-auth-btn o">Entrar</a><a href="#/registar" class="d-auth-btn l">Criar conta</a>';
    return '<div style="position:relative"><div class="d-act" role="button" tabindex="0" aria-haspopup="true" data-act="user-menu"><span class="d-ico">' + svg('user') + '</span><span class="d-lbl"><small>Olá, ' + esc(b.name.split(' ')[0]) + '</small>Conta</span></div>' +
      '<div id="user-menu" class="d-umenu"><p>' + esc(b.name) + '</p><a href="#/conta">Painel</a><a href="#/conta/pedidos">Pedidos</a><a href="#/conta/desejos">Lista de desejos</a><a href="#/conta/perfil">Perfil</a><a href="#" data-act="logout">Terminar sessão</a></div></div>';
  }
  ACT['user-menu'] = (el, e) => { e.stopPropagation(); $('#user-menu').classList.toggle('open'); };
  document.addEventListener('click', (e) => { const m = $('#user-menu'); if (m && !e.target.closest('#hdr-auth')) m.classList.remove('open'); });
  ACT['d-bal-eye'] = () => { try { localStorage.setItem('ica.balHidden', balHidden() ? '0' : '1'); } catch (e) { /* sem armazenamento */ } updateHeader(); };
  function miniCart() {
    const lines = cartLines(), t = totals();
    return '<div class="flex items-start justify-between border-b border-zinc-200 p-6 max-md:p-5"><div><p class="text-2xl font-medium max-md:text-xl" style="color:#1d2433;">Carrinho de compras</p><p class="text-base max-sm:text-xs" style="color:#6c7480;">Entrega grátis acima de 100.000 MT</p></div><span class="icon-cancel cursor-pointer text-3xl" role="button" tabindex="0" data-act="drawer" aria-label="Fechar"></span></div>' +
      '<div class="flex-1 overflow-auto p-6 max-md:p-5">' + (lines.length ? '<div class="grid gap-12 max-md:gap-5">' + lines.map((l) => '<div class="flex gap-x-5 max-md:gap-x-4"><a href="#/produto/' + l.pid + '" data-act="drawer">' + pimg(l.p, 'max-w-28 max-h-28 rounded-xl max-md:max-h-20 max-md:max-w-[76px]') + '</a><div class="grid flex-1 place-content-start justify-stretch gap-y-2.5"><div class="flex justify-between gap-2"><a href="#/produto/' + l.pid + '" data-act="drawer"><p class="text-base font-medium max-md:font-normal max-sm:text-sm">' + esc(l.p.name) + '</p></a><p class="text-lg max-md:font-semibold max-sm:text-sm">' + money(l.unit) + '</p></div><div class="flex items-center justify-between"><span class="text-sm text-zinc-500">Qtd.: ' + l.qty + '</span><span class="cursor-pointer text-base" style="color:#19b51f;" role="button" tabindex="0" data-act="rm-cart" data-pid="' + l.pid + '">Remover</span></div></div></div>').join('') + '</div>' : emptyBox('O carrinho está vazio.')) + '</div>' +
      '<div class="border-t border-zinc-200 p-6 max-md:p-5"><div class="mb-5 flex items-center justify-between"><p class="text-sm font-medium text-zinc-500">Subtotal</p><p class="text-3xl font-semibold max-md:text-2xl">' + money(t.sub) + '</p></div><div class="grid gap-2.5"><a href="#/checkout" data-act="drawer" class="imali-primary-btn block rounded-2xl px-11 py-4 text-center text-base font-medium text-white" style="background:#19b51f;">Finalizar compra</a><a href="#/carrinho" data-act="drawer" class="block cursor-pointer text-center text-base font-medium" style="color:#19b51f;">Ver carrinho</a></div></div>';
  }
  function layout() {
    const cats = D.categories;
    document.getElementById('app').innerHTML = SPRITE +
      '<header class="d-hdr"><div class="d-wrap">' +
        '<button type="button" class="d-burger" data-act="d-cats" aria-label="Abrir categorias">' + svg('menu') + '</button>' +
        '<a class="d-logo" href="#/">' + logo('mercado-ica-mark-white.png') + '</a>' +
        '<form class="d-search" data-form="search" role="search">' + svg('search') + '<label class="d-sr" for="d-q">Pesquisar</label><input id="d-q" name="q" type="search" placeholder="Pesquisar produtos, marcas ou fornecedores…" autocomplete="off" list="sugg"><datalist id="sugg">' + D.searchTerms.map((t) => '<option value="' + esc(t.term) + '">').join('') + '</datalist>' +
          '<span class="d-scat"><label class="d-sr" for="d-cat">Categoria</label><select id="d-cat" name="cat"><option value="">Todas as categorias</option>' + cats.map((c) => '<option value="' + c.slug + '">' + esc(c.name) + '</option>').join('') + '</select><svg aria-hidden="true"><use href="#d-chev"/></svg></span></form>' +
        '<nav class="d-acts" aria-label="Conta">' + balBlock() +
          '<a class="d-act d-hide-m" href="#/conta/desejos"><span class="d-ico">' + svg('heart') + '<span class="d-cnt" data-d-wish></span></span><span class="d-lbl"><small>Guardados</small>Desejos</span></a>' +
          '<div id="hdr-auth" class="d-acts d-hide-m"></div>' +
          '<a class="d-act" role="button" tabindex="0" data-act="drawer"><span class="d-ico">' + svg('cart') + '<span class="d-cnt" id="hdr-cart-count" data-d-cart></span></span><span class="d-lbl d-hide-m"><small id="hdr-cart-total"></small>Carrinho</span></a>' +
        '</nav></div></header>' +
      '<div id="app-flash"></div><main id="main"><div id="view"></div></main>' + footer() +
      '<nav class="d-tabbar" aria-label="Navegação"><a href="#/" data-tab="/">' + svg('home') + 'Início</a><a data-act="d-cats" role="button" tabindex="0">' + svg('grid') + 'Categorias</a><a href="#/conta/desejos" data-tab="/conta/desejos">' + svg('heart') + 'Desejos</a><a data-act="drawer" role="button" tabindex="0">' + svg('cart') + '<span class="d-cnt" data-d-cart></span>Carrinho</a><a href="#/conta" data-tab="/conta">' + svg('user') + 'Conta</a></nav>' +
      '<div class="d-drawer" id="d-drawer"><div class="d-scrim" data-act="d-cats-close"></div><div class="d-panel"><a class="d-logo" href="#/" data-act="d-cats-close" style="margin-bottom:12px">' + logo('mercado-ica-mark-white.png') + '</a>' + balBlock() +
        cats.map((c) => '<details><summary>' + esc(c.name) + '</summary><a href="#/categoria/' + c.slug + '" data-act="d-cats-close">Ver tudo</a>' + c.subs.map((s) => '<a href="#/categoria/' + c.slug + '" data-act="d-cats-close">' + esc(s) + '</a>').join('') + '</details>').join('') +
        '<details><summary>Fornecedores</summary><a href="#/vendedores" data-act="d-cats-close">Todos os fornecedores</a></details></div></div>' +
      '<div class="fixed inset-0 z-[1000] hidden bg-gray-500 bg-opacity-50" id="drawer-scrim" data-act="drawer"></div><aside id="mini-cart" class="fixed inset-y-0 right-0 z-[1001] flex w-full max-w-[500px] translate-x-full flex-col bg-white shadow-lg transition-transform duration-300" aria-label="Carrinho"><div id="mini-cart-body" class="flex h-full flex-col"></div></aside>';
    updateHeader();
  }
  ACT['d-cats'] = () => $('#d-drawer').classList.add('open');
  ACT['d-cats-close'] = (el) => { $('#d-drawer').classList.remove('open'); if (el.getAttribute('href')) location.hash = el.getAttribute('href'); };
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { const d = $('#d-drawer'); if (d) d.classList.remove('open'); } });
  function markTab(path) { $$('.d-tabbar [data-tab]').forEach((a) => a.classList.toggle('on', a.dataset.tab === '/' ? path === '/' : path.startsWith(a.dataset.tab))); }
  function footer() {
    const link = (h, t) => '<li><a href="' + h + '">' + t + '</a></li>';
    const pay = [['Assets/M-pesa logo.png', 'M-Pesa'], ['Assets/emola logo.png', 'e-Mola'], ['Assets/mkesh logo.png', 'mKesh'], ['logo-imali-small.png', 'iMali'], ['Assets/BNPL logo.png', 'Pagar depois (BNPL)']];
    return '<footer class="d-foot"><div class="d-wrap">' +
      '<div><a class="d-logo" href="#/">' + logo('mercado-ica-logo-white.png', 'Mercado ICA — B2B Connectivity Hub') + '</a><p>O marketplace B2B de Moçambique, com pagamentos iMali integrados.</p>' +
        '<form class="d-news" data-form="newsletter"><label class="d-sr" for="d-nl">Email</label><input id="d-nl" type="email" name="email" required placeholder="O seu email profissional"><button class="d-btn d-btn-lime">Subscrever</button></form></div>' +
      '<div><h4>Comprar</h4><ul>' + link('#/categoria/todos', 'Catálogo') + link('#/vendedores', 'Fornecedores') + link('#/comparar', 'Comparar produtos') + link('#/conta/pedidos', 'Os meus pedidos') + '</ul></div>' +
      '<div><h4>Ajuda</h4><ul>' + link('#/pagina/contactos', 'Central de ajuda') + link('#/conta/devolucoes', 'Devoluções') + link('../cliente/index.html', 'Vender no Mercado ICA') + link('#/pagina/sobre-nos', 'Sobre nós') + '</ul></div>' +
      '<div><h4>Formas de pagamento</h4><div class="d-paylogos">' + pay.map((p) => '<img src="' + brand(p[0]) + '" alt="' + p[1] + '">').join('') + '</div></div>' +
      '</div><div class="d-legal"><div class="d-wrap"><span>© 2026 Paytek. Todos os direitos reservados.</span><span><a href="#/pagina/termos">Termos</a> · <a href="#/pagina/privacidade">Privacidade</a> · <a href="#/conta/privacidade">Cookies</a></span></div></div></footer>';
  }
  // o aviso de cookies só aparece na página inicial (nunca no login nem noutras páginas), até ser aceite ou recusado
  function syncCookie(path) {
    const c = $('#cookie');
    if (path === '/' && !S.get('cookie')) { if (!c) cookieBar(); }
    else if (c) c.remove();
  }
  function cookieBar() {
    const c = document.createElement('div'); c.id = 'cookie'; c.className = 'd-cookie'; c.setAttribute('role', 'dialog'); c.setAttribute('aria-label', 'Cookies');
    c.innerHTML = '<b>Utilizamos cookies</b><span>Para melhorar a sua experiência e analisar o tráfego do site.</span><div><button class="d-btn d-btn-lime" data-act="cookie">Aceitar</button><button class="d-btn d-btn-o" data-act="cookie">Recusar</button></div>';
    document.body.appendChild(c);
  }
  ACT['cookie'] = () => { S.set('cookie', 1); const c = $('#cookie'); if (c) c.remove(); };
  ACT['drawer'] = () => { const m = $('#mini-cart'), s = $('#drawer-scrim'); const open = m.classList.contains('translate-x-full'); m.classList.toggle('translate-x-full', !open); s.classList.toggle('hidden', !open); };
  FORMS['search'] = (d) => { const q = (d.q || '').trim(); location.hash = !q && d.cat ? '#/categoria/' + d.cat : '#/pesquisa?q=' + encodeURIComponent(q); };
  FORMS['newsletter'] = (d, f) => { toast('Subscrição confirmada! Obrigado.'); f.reset(); };

  /* ---------- Carrinho / desejos / comparação ---------- */
  function addToCart(pid, qty = 1) {
    const c = cart(), l = c.find((x) => x.pid === pid);
    if (l) l.qty += qty; else c.push({ pid, qty });
    S.set('cart', c); updateHeader();
  }
  shop.addToCart = addToCart;
  ACT['add-cart'] = (el) => { addToCart(+el.dataset.pid, +el.dataset.qty || 1); toast('Produto adicionado ao carrinho com sucesso.'); };
  ACT['rm-cart'] = (el) => { S.set('cart', cart().filter((l) => l.pid !== +el.dataset.pid)); updateHeader(); ICA.refresh(); toast('Produto removido do carrinho.', 'info'); };
  const toggleList = (key, pid, on, off, max) => {
    let l = S.get(key, []);
    if (l.includes(pid)) { l = l.filter((x) => x !== pid); toast(off, 'info'); }
    else { if (max && l.length >= max) { toast('Pode comparar até ' + max + ' produtos.', 'error'); return; } l.push(pid); toast(on); }
    S.set(key, l); updateHeader(); ICA.refresh();
  };
  ACT['wish'] = (el) => toggleList('wishlist', +el.dataset.pid, 'Produto adicionado à lista de desejos.', 'Produto removido da lista de desejos.');
  ACT['cmp'] = (el) => toggleList('compare', +el.dataset.pid, 'Produto adicionado à comparação.', 'Produto removido da comparação.', 4);

  /* ---------- Cartão de produto D ---------- */
  function dcard(p) {
    const s = sellerOf(p), off = p.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : 0, fav = wish().includes(p.id);
    return '<article class="d-card"><div class="d-im"><a href="#/produto/' + p.id + '" tabindex="-1" aria-hidden="true">' + pimg(p) + '</a>' +
      (off ? '<span class="d-badge sale">-' + off + '%</span>' : p.tags.includes('novo') ? '<span class="d-badge">Novo</span>' : '') +
      '<button type="button" class="d-fav' + (fav ? ' on' : '') + '" data-act="d-wish" data-pid="' + p.id + '" aria-pressed="' + fav + '" aria-label="Guardar ' + esc(p.name) + '">' + svg('heart', 'width:17px;height:17px') + '</button></div>' +
      '<div class="d-bd"><span class="d-ver">' + svg('check') + esc(s.shop) + '</span><h3><a href="#/produto/' + p.id + '">' + esc(p.name) + '</a></h3>' +
      '<div class="d-pr"><b>' + money(p.price) + '</b>' + (p.oldPrice ? '<s>' + money(p.oldPrice) + '</s>' : '') + '<small>/ un</small></div>' +
      '<div class="d-vol"><span>10+ un<b>' + money(Math.round(p.price * 0.95)) + '</b></span><span>50+ un<b>' + money(Math.round(p.price * 0.9)) + '</b></span></div>' +
      '<div class="d-cacts"><button type="button" class="d-btn d-btn-line" data-act="quote" data-pid="' + p.id + '">Pedir cotação</button><button type="button" class="d-btn d-btn-dark d-add" data-act="d-add" data-pid="' + p.id + '" aria-label="Adicionar ' + esc(p.name) + ' ao carrinho">' + svg('cart', 'width:18px;height:18px') + '</button></div></div></article>';
  }
  shop.dcard = dcard;
  ACT['d-add'] = (el) => {
    const p = prod(+el.dataset.pid); addToCart(p.id, 1);
    $$('[data-d-cart]').forEach((c) => { c.classList.remove('bump'); void c.offsetWidth; c.classList.add('bump'); });
    el.classList.add('done'); el.innerHTML = svg('check', 'width:18px;height:18px');
    toast(p.name + ' adicionado ao carrinho.');
  };
  ACT['d-wish'] = (el) => {
    const pid = +el.dataset.pid; let l = wish(); const on = !l.includes(pid);
    l = on ? l.concat(pid) : l.filter((x) => x !== pid); S.set('wishlist', l);
    $$('[data-act="d-wish"][data-pid="' + pid + '"]').forEach((b) => { b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
    updateHeader(); toast(on ? 'Guardado na lista de desejos.' : 'Removido da lista de desejos.', on ? 'success' : 'info');
  };

  /* ---------- Home D ---------- */
  const HS = { tab: 0 };
  const TOP_IDS = [25, 9, 13, 4, 26, 1, 16, 22, 33, 15, 2, 29];
  const CAT_PHOTO = { 1: 1, 2: 7, 3: 12, 4: 19, 5: 26, 6: 31 };
  const PROVINCES = ['Maputo Cidade', 'Maputo Província', 'Gaza', 'Inhambane', 'Sofala', 'Manica', 'Tete', 'Zambézia', 'Nampula', 'Cabo Delgado', 'Niassa'];
  const catCount = (id) => liveProducts().filter((p) => p.cat === id).length;
  function topGrid() {
    const L = liveProducts(), cat = HS.tab;
    const list = TOP_IDS.map(prod).filter((p) => p && p.status === 'approved' && (!cat || p.cat === cat)).concat(cat ? L.filter((p) => p.cat === cat && !TOP_IDS.includes(p.id)) : []);
    return list.slice(0, 5).map(dcard).join('');
  }
  ACT['d-tab'] = (el) => { HS.tab = +el.dataset.cat; $$('#d-tabs button').forEach((b) => b.classList.toggle('on', b === el)); $('#d-top-grid').innerHTML = topGrid(); };
  ACT['d-scroll'] = (el) => { const t = document.getElementById(el.dataset.to); if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' }); };
  FORMS['rfq'] = (d, f) => { toast('Pedido de cotação enviado. Os fornecedores respondem em 24 h.'); f.reset(); };
  function home() {
    const L = liveProducts(), cats = D.categories, sellers = D.sellers.filter((s) => s.status === 'approved');
    const kit = prod(28), part = kit.price / 3;
    const day = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return d.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' }); };
    const wallets = '<div class="d-wallets">' + [['Assets/M-pesa logo.png', 'M-Pesa'], ['Assets/emola logo.png', 'e-Mola'], ['Assets/mkesh logo.png', 'mKesh'], ['logo-imali-small.png', 'iMali']].map((w) => '<img src="' + brand(w[0]) + '" alt="' + w[1] + '">').join('') + '</div>';
    const html =
      '<div class="d-top"><div class="d-wrap">' +
        '<nav class="d-cats" id="d-catnav" aria-label="Categorias"><a href="#/categoria/todos">Todas as categorias<span class="d-n">' + L.length + '</span></a>' +
          cats.map((c) => '<a href="#/categoria/' + c.slug + '" data-mega="' + c.id + '">' + esc(c.name) + '<span class="d-n">' + catCount(c.id) + '</span></a>').join('') + '<div class="d-mega" id="d-mega"></div></nav>' +
        '<div class="d-hero" id="d-hero">' +
          '<article class="d-slide on"><div class="d-brandmark"><img src="../assets/brand/ica-white.png" alt="iCA"></div><div class="d-copy"><h1>Compras da empresa, <span>sem complicar.</span></h1><p>Fornecedores verificados, preços por volume e pagamento com a carteira que já usa.</p></div></article>' +
          '<article class="d-slide"><div class="d-photo">' + pimg(prod(25)) + '</div><div class="d-copy"><h2>Energia própria, <span>até -15%.</span></h2><p>Kits, painéis e inversores de fornecedores com instalação certificada em todo o país.</p><a class="d-btn d-btn-lime" href="#/categoria/energia-solar">Ver ofertas solares →</a></div></article>' +
          '<article class="d-slide d-slide-3"><span class="d-vshape"></span><div class="d-art"><div class="d-planc"><div class="d-hd"><img src="' + brand('Imali banner.png') + '" alt="iMali — Diferente, como tu!"><small>Crédito para empresas</small></div><small style="color:var(--d-mut);font-size:12px">' + esc(kit.name) + '</small><div class="d-tot">' + money(kit.price) + '</div><div class="d-bar"><i></i></div><ol>' +
            [['Hoje', 0, 1], ['Em 30 dias', 30, 0], ['Em 60 dias', 60, 0]].map((r) => '<li class="' + (r[2] ? 'ok' : '') + '"><span>' + r[0] + (r[1] ? ' · ' + day(r[1]) : '') + '</span><b>' + money(part) + '</b></li>').join('') + '</ol>' + wallets + '</div></div>' +
            '<div class="d-copy"><h2>Compre hoje, <span>pague em 3×.</span></h2><p>Pagamento diferido para empresas registadas, aprovado no checkout.</p><a class="d-btn d-btn-lime" href="#/" data-act="d-scroll" data-to="d-credito">Saber mais →</a></div></article>' +
          '<div class="d-dots" role="tablist" aria-label="Destaques"><button class="on" aria-label="Destaque 1"></button><button aria-label="Destaque 2"></button><button aria-label="Destaque 3"></button></div>' +
        '</div></div></div>' +
      '<div class="d-trust"><div class="d-wrap">' +
        '<div class="d-t"><b><em>' + sellers.length + '</em>Fornecedores verificados</b><small>Documentação validada pela ICA</small></div>' +
        '<div class="d-t"><b><em>100%</em>Fatura com NUIT</b><small>Em todas as compras</small></div>' +
        '<div class="d-t"><b><em>3×</em>Pague depois</b><small>Crédito iMali para empresas</small></div>' +
        '<div class="d-t"><b><em>11</em>Províncias</b><small>Entrega em todo o país</small></div></div></div>' +
      '<section class="d-sec"><div class="d-wrap"><div class="d-sh"><div><h2>Mais pedidos por empresas</h2><p>Preços de fornecedor, com desconto por volume.</p></div>' +
        '<div class="d-tabs" id="d-tabs"><button type="button" class="' + (HS.tab ? '' : 'on') + '" data-act="d-tab" data-cat="0">Todos</button>' + cats.slice(0, 5).map((c) => '<button type="button" class="' + (HS.tab === c.id ? 'on' : '') + '" data-act="d-tab" data-cat="' + c.id + '">' + esc(c.name.split(' ')[0]) + '</button>').join('') + '</div></div>' +
        '<div class="d-grid" id="d-top-grid">' + topGrid() + '</div></div></section>' +
      '<section class="d-sec"><div class="d-wrap"><div class="d-sh"><div><h2>Compre por setor</h2><p>Seis setores, fornecedores especializados em cada um.</p></div><a class="d-more" href="#/categoria/todos">Ver catálogo completo</a></div>' +
        '<div class="d-catgrid">' + cats.map((c) => '<a class="d-cat" href="#/categoria/' + c.slug + '">' + pimg(prod(CAT_PHOTO[c.id])) + '<div><b>' + esc(c.name) + '</b><small>' + catCount(c.id) + ' produtos →</small></div></a>').join('') + '</div></div></section>' +
      '<section class="d-sec" id="d-cotacao"><div class="d-wrap"><div class="d-rfq"><span class="d-vshape"></span>' +
        '<div><h2>Compra grande? <span>Peça cotação.</span></h2><p>Diga o que precisa uma vez e receba propostas de vários fornecedores verificados.</p><ol><li><span>1</span>Descreva o produto, a quantidade e o local</li><li><span>2</span>Os fornecedores respondem com proposta</li><li><span>3</span>Compare, aceite e pague com iMali</li></ol></div>' +
        '<form data-form="rfq"><div class="d-fld"><label for="rfq-p">Produto</label><input id="rfq-p" name="product" required placeholder="Ex.: Painel Solar 550 W" list="sugg"></div>' +
          '<div class="d-row2"><div class="d-fld"><label for="rfq-q">Quantidade</label><input id="rfq-q" name="qty" type="number" min="1" required placeholder="120"></div><div class="d-fld"><label for="rfq-l">Entrega</label><select id="rfq-l" name="where">' + PROVINCES.map((p) => '<option>' + p + '</option>').join('') + '</select></div></div>' +
          '<button class="d-btn d-btn-lime">Enviar pedido de cotação →</button></form></div></div></section>' +
      '<section class="d-sec"><div class="d-wrap"><div class="d-sh"><div><h2>Oportunidades da semana</h2><p>Lotes com preço reduzido, por tempo limitado.</p></div><a class="d-more" href="#/categoria/todos?sort=desconto">Ver todas</a></div>' +
        '<div class="d-grid">' + L.filter((p) => p.oldPrice && p.id !== 27).slice(0, 5).map(dcard).join('') + '</div></div></section>' +
      '<section class="d-sec" id="d-credito"><div class="d-wrap"><div class="d-credit"><div><h2>Compre hoje, pague em 3×</h2><p>Crédito iMali para empresas registadas no Mercado ICA. Aprovação no checkout, sem papelada.</p><a class="d-btn d-btn-dark" href="#/registar">Ativar crédito iMali →</a></div>' +
        '<div class="d-plan"><div class="d-row"><span>' + esc(kit.name) + '</span><b>' + money(kit.price) + '</b></div><div class="d-bar"><i></i></div><div class="d-row"><span>Hoje</span><b>' + money(part) + '</b></div><div class="d-row" style="color:var(--d-mut)"><span>+30 dias · +60 dias</span><span>2 × ' + money(part) + '</span></div>' + wallets + '</div></div></div></section>' +
      '<section class="d-sec"><div class="d-wrap"><div class="d-sh"><div><h2>Fornecedores verificados</h2><p>Empresas moçambicanas com documentação validada.</p></div><a class="d-more" href="#/vendedores">Todos os fornecedores</a></div>' +
        '<div class="d-sellers">' + sellers.map((s) => '<a class="d-seller" href="#/vendedor/' + s.id + '"><span class="d-av" style="background:' + s.color + '">' + esc(s.shop[0]) + '</span><b>' + esc(s.shop) + '</b><small>' + esc(s.city) + ' · desde ' + s.since + '</small><span class="d-meta"><span>★ ' + s.rating.toFixed(1) + '</span><span>' + D.products.filter((p) => p.seller === s.id && p.status === 'approved').length + ' produtos</span></span></a>').join('') + '</div></div></section>';
    return { html, mount: mountHome };
  }
  function mountHome(root) {
    /* destaques rotativos (pára com o rato por cima e respeita "reduzir movimento") */
    clearInterval(ICA._heroT);
    const hero = $('#d-hero', root), slides = $$('.d-slide', hero), dots = $$('.d-dots button', hero); let cur = 0;
    const go = (i) => { cur = (i + slides.length) % slides.length; slides.forEach((s, k) => s.classList.toggle('on', k === cur)); dots.forEach((d, k) => d.classList.toggle('on', k === cur)); };
    const auto = () => { clearInterval(ICA._heroT); ICA._heroT = setInterval(() => { if (!document.body.contains(hero)) return clearInterval(ICA._heroT); go(cur + 1); }, 6000); };
    dots.forEach((d, k) => d.addEventListener('click', () => { go(k); auto(); }));
    hero.addEventListener('mouseenter', () => clearInterval(ICA._heroT));
    hero.addEventListener('mouseleave', auto);
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) auto();
    /* mega menu das categorias */
    const nav = $('#d-catnav', root), mega = $('#d-mega', root); let t;
    const open = (id) => {
      const c = D.categories.find((x) => x.id === id), ps = liveProducts().filter((p) => p.cat === id);
      mega.innerHTML = '<div><h4>' + esc(c.name) + '</h4><ul>' + c.subs.map((s) => '<li><a href="#/categoria/' + c.slug + '">' + esc(s) + ' <small>' + ps.filter((p) => p.sub === s).length + '</small></a></li>').join('') + '<li><a href="#/categoria/' + c.slug + '" style="color:var(--d-g-600)">Ver tudo em ' + esc(c.name) + ' →</a></li></ul></div>' + (ps[0] ? '<div class="d-pic">' + pimg(ps[0]) + '</div>' : '<div></div>');
      mega.classList.add('open'); $$('[data-mega]', nav).forEach((a) => a.classList.toggle('on', +a.dataset.mega === id));
    };
    nav.addEventListener('mouseover', (e) => { const a = e.target.closest('[data-mega]'); if (a) { clearTimeout(t); open(+a.dataset.mega); } else if (e.target.closest('#d-mega')) clearTimeout(t); });
    nav.addEventListener('mouseleave', () => { t = setTimeout(() => { mega.classList.remove('open'); $$('[data-mega]', nav).forEach((a) => a.classList.remove('on')); }, 180); });
  }

  /* ---------- Listagem / pesquisa (D) ---------- */
  const LS = { sub: '', sellers: [], max: 0, rating: 0, sale: false, sort: 'relevancia', key: '', sheet: false, closed: [] }; // closed: grupos de filtros minimizados (mantém-se entre categorias)
  const SORTS = [['relevancia', 'Relevância'], ['vendas', 'Mais vendidos'], ['desconto', 'Maior desconto'], ['preco-asc', 'Preço: menor para maior'], ['preco-desc', 'Preço: maior para menor'], ['avaliacao', 'Melhor avaliados']];
  const LS_RESET = { sub: '', sellers: [], max: 0, rating: 0, sale: false };
  function listing({ params, q, path }) {
    const slug = path.startsWith('/pesquisa') ? 'pesquisa' : params.slug;
    const key = slug + '|' + (q.q || '');
    if (LS.key !== key) Object.assign(LS, LS_RESET, { sheet: false, sort: q.sort === 'vendas' ? 'vendas' : q.sort === 'desconto' ? 'desconto' : 'relevancia', key });
    const cat = slug === 'pesquisa' ? null : D.categories.find((c) => c.slug === slug);
    let base = liveProducts().filter((p) => !cat || p.cat === cat.id);
    if (slug === 'pesquisa' && q.q) base = base.filter((p) => (p.name + ' ' + p.catName + ' ' + p.sub + ' ' + sellerOf(p).shop).toLowerCase().includes(q.q.toLowerCase()));
    const cap = base.reduce((m, p) => Math.max(m, p.price), 0), maxOn = LS.max && LS.max < cap;
    let L = base;
    if (LS.sub) L = L.filter((p) => p.sub === LS.sub);
    if (LS.sellers.length) L = L.filter((p) => LS.sellers.includes(p.seller));
    if (maxOn) L = L.filter((p) => p.price <= LS.max);
    if (LS.rating) L = L.filter((p) => p.rating >= LS.rating);
    if (LS.sale) L = L.filter((p) => p.oldPrice);
    const sorters = { relevancia: (a, b) => b.sold - a.sold, vendas: (a, b) => b.sold - a.sold, desconto: (a, b) => (b.oldPrice ? 1 - b.price / b.oldPrice : 0) - (a.oldPrice ? 1 - a.price / a.oldPrice : 0), 'preco-asc': (a, b) => a.price - b.price, 'preco-desc': (a, b) => b.price - a.price, avaliacao: (a, b) => b.rating - a.rating };
    L = L.slice().sort(sorters[LS.sort]);

    const isSearch = slug === 'pesquisa';
    const title = isSearch ? (q.q ? 'Resultados para “' + esc(q.q) + '”' : 'Pesquisa') : cat ? esc(cat.name) : 'Todos os produtos';
    const lead = isSearch ? 'Procurámos em produtos, setores e fornecedores.' : cat ? 'Fornecedores verificados de ' + esc(cat.name.toLowerCase()) + ', com entrega em todo o país.' : 'O catálogo completo do Mercado ICA.';
    const subs = cat ? cat.subs : [...new Set(base.map((p) => p.sub))];
    const sellersIn = [...new Set(base.map((p) => p.seller))];
    const chk = (on, act, attrs, label, n) => '<button type="button" class="d-chk' + (on ? ' on' : '') + '" role="checkbox" aria-checked="' + on + '" data-act="' + act + '" ' + attrs + '><i>' + svg('check') + '</i><span>' + label + '</span>' + (n != null ? '<small>' + n + '</small>' : '') + '</button>';
    const used = { sub: LS.sub ? 1 : 0, price: maxOn ? 1 : 0, sale: LS.sale ? 1 : 0, seller: LS.sellers.length, rating: LS.rating ? 1 : 0 };
    const group = (g, t, inner) => { const shut = LS.closed.includes(g), n = used[g];
      return '<div class="d-fg' + (shut ? ' shut' : '') + '" data-g="' + g + '"><button type="button" class="d-fg-h" data-act="flt-fold" data-g="' + g + '" aria-expanded="' + !shut + '"><span>' + t + '</span>' +
        '<em class="d-fg-n" data-n="' + n + '" aria-label="' + n + (n === 1 ? ' filtro ativo' : ' filtros ativos') + '">' + n + '</em><svg aria-hidden="true"><use href="#d-chev"/></svg></button><div class="d-fg-b">' + inner + '</div></div>'; };
    const allShut = ['sub', 'price', 'sale', 'seller', 'rating'].every((g) => LS.closed.includes(g));
    const filters =
      '<aside class="d-flt' + (LS.sheet ? ' open' : '') + '" id="d-flt" aria-label="Filtros"><div class="d-flt-hd"><b>Filtros</b><button type="button" class="d-link d-link-mut" data-act="flt-fold-all">' + (allShut ? 'Expandir' : 'Minimizar') + '</button><button type="button" class="d-link" data-act="flt-reset">Limpar tudo</button><button type="button" class="d-flt-x" data-act="d-filters" aria-label="Fechar filtros">✕</button></div>' +
      (subs.length ? group('sub', 'Subcategoria',subs.map((s) => chk(LS.sub === s, 'flt-sub', 'data-v="' + esc(s) + '"', esc(s), base.filter((p) => p.sub === s).length)).join('')) : '') +
      (cap ? group('price', 'Preço máximo','<div class="d-range"><input type="range" min="0" max="' + cap + '" step="' + Math.max(100, Math.round(cap / 200 / 100) * 100) + '" value="' + (maxOn ? LS.max : cap) + '" data-range="max" aria-label="Preço máximo"><div><span>' + money(0) + '</span><b id="rng-val">' + (maxOn ? 'até ' + money(LS.max) : 'Qualquer preço') + '</b></div></div>') : '') +
      group('sale', 'Ofertas',chk(LS.sale, 'flt-sale', '', 'Só com desconto', base.filter((p) => p.oldPrice).length)) +
      group('seller', 'Fornecedor',sellersIn.map((id) => chk(LS.sellers.includes(id), 'flt-seller', 'data-id="' + id + '"', esc(byId(D.sellers, id).shop), base.filter((p) => p.seller === id).length)).join('')) +
      group('rating', 'Avaliação',[4.5, 4].map((r) => chk(LS.rating === r, 'flt-rating', 'data-v="' + r + '"', '★ ' + String(r).replace('.', ',') + ' ou mais', base.filter((p) => p.rating >= r).length)).join('')) +
      '<button type="button" class="d-btn d-btn-dark d-flt-go" data-act="d-filters">Ver ' + L.length + (L.length === 1 ? ' produto' : ' produtos') + '</button></aside>';

    const chips = [];
    if (LS.sub) chips.push(['flt-sub', 'data-v="' + esc(LS.sub) + '"', esc(LS.sub)]);
    if (maxOn) chips.push(['flt-max', '', 'Até ' + money(LS.max)]);
    if (LS.sale) chips.push(['flt-sale', '', 'Com desconto']);
    LS.sellers.forEach((id) => chips.push(['flt-seller', 'data-id="' + id + '"', esc(byId(D.sellers, id).shop)]));
    if (LS.rating) chips.push(['flt-rating', 'data-v="' + LS.rating + '"', '★ ' + String(LS.rating).replace('.', ',') + '+']);
    const toolbar = '<div class="d-tool"><div class="d-tool-l"><button type="button" class="d-fbtn" data-act="d-filters">' + svg('grid', 'width:17px;height:17px') + 'Filtros' + (chips.length ? '<em>' + chips.length + '</em>' : '') + '</button><p><b>' + L.length + '</b> ' + (L.length === 1 ? 'produto' : 'produtos') + '</p>' +
      chips.map((c) => '<button type="button" class="d-chip" data-act="' + c[0] + '" ' + c[1] + ' aria-label="Remover filtro ' + c[2] + '">' + c[2] + '<span aria-hidden="true">✕</span></button>').join('') + (chips.length > 1 ? '<button type="button" class="d-link" data-act="flt-reset">Limpar</button>' : '') + '</div>' +
      '<label class="d-sort"><span>Ordenar</span><span class="d-scat"><select data-sort aria-label="Ordenar">' + SORTS.map((o) => '<option value="' + o[0] + '"' + (LS.sort === o[0] ? ' selected' : '') + '>' + o[1] + '</option>').join('') + '</select><svg aria-hidden="true"><use href="#d-chev"/></svg></span></label></div>';
    const body = L.length ? '<div class="d-pgrid">' + L.map(dcard).join('') + '</div>' :
      '<div class="d-empty"><b>Nenhum produto encontrado</b><p>' + (chips.length ? 'Experimente remover alguns filtros.' : 'Experimente outro termo ou explore os setores.') + '</p>' + (chips.length ? '<button type="button" class="d-btn d-btn-dark" data-act="flt-reset">Limpar filtros</button>' : '<a class="d-btn d-btn-dark" href="#/categoria/todos">Ver todo o catálogo</a>') + '</div>';
    const pills = '<nav class="d-pills" aria-label="Setores"><a href="#/categoria/todos" class="' + (!cat && !isSearch ? 'on' : '') + '">Todos</a>' + D.categories.map((c) => '<a href="#/categoria/' + c.slug + '" class="' + (cat && cat.id === c.id ? 'on' : '') + '">' + esc(c.name) + '</a>').join('') + '</nav>';
    const html = '<div class="d-phead"><div class="d-wrap"><nav class="d-crumbs" aria-label="Caminho"><a href="#/">Início</a><span>/</span>' + (isSearch ? 'Pesquisa' : cat ? '<a href="#/categoria/todos">Catálogo</a><span>/</span>' + esc(cat.name) : 'Catálogo') + '</nav>' +
      '<h1>' + title + '</h1><p>' + lead + '</p>' + pills + '</div></div>' +
      '<div class="d-wrap d-lst">' + filters + '<div class="d-lst-main">' + toolbar + body + '</div></div><div class="d-flt-scrim" data-act="d-filters"></div>';
    return { html, mount: () => document.body.classList.toggle('d-flt-open', LS.sheet) };
  }
  const re = () => ICA.refresh();
  ACT['flt-sub'] = (el) => { LS.sub = LS.sub === el.dataset.v ? '' : el.dataset.v; re(); };
  ACT['flt-rating'] = (el) => { LS.rating = LS.rating === +el.dataset.v ? 0 : +el.dataset.v; re(); };
  ACT['flt-seller'] = (el) => { const id = +el.dataset.id; LS.sellers = LS.sellers.includes(id) ? LS.sellers.filter((x) => x !== id) : LS.sellers.concat(id); re(); };
  ACT['flt-sale'] = () => { LS.sale = !LS.sale; re(); };
  ACT['flt-max'] = () => { LS.max = 0; re(); };
  ACT['flt-reset'] = () => { Object.assign(LS, LS_RESET); re(); };
  /* minimizar / expandir grupos de filtros sem redesenhar a página */
  const paintFold = () => $$('#d-flt .d-fg').forEach((fg) => { const shut = LS.closed.includes(fg.dataset.g); fg.classList.toggle('shut', shut); $('.d-fg-h', fg).setAttribute('aria-expanded', !shut); });
  ACT['flt-fold'] = (el) => { const g = el.dataset.g; LS.closed = LS.closed.includes(g) ? LS.closed.filter((x) => x !== g) : LS.closed.concat(g); paintFold(); };
  ACT['flt-fold-all'] = (el) => { const all = $$('#d-flt .d-fg').map((fg) => fg.dataset.g), shutAll = !all.every((g) => LS.closed.includes(g)); LS.closed = shutAll ? all : []; el.textContent = shutAll ? 'Expandir' : 'Minimizar'; paintFold(); };
  ACT['d-filters'] = () => { LS.sheet = !LS.sheet; const f = $('#d-flt'); if (f) f.classList.toggle('open', LS.sheet); document.body.classList.toggle('d-flt-open', LS.sheet); };
  window.addEventListener('hashchange', () => { LS.sheet = false; document.body.classList.remove('d-flt-open'); });
  document.addEventListener('change', (e) => { const d = e.target.dataset || {}; if (d.sort !== undefined) { LS.sort = e.target.value; re(); } if (d.range) { LS.max = +e.target.value; re(); } });
  document.addEventListener('input', (e) => { const d = e.target.dataset || {}; if (d.range) { const b = $('#rng-val'); if (b) b.textContent = money(+e.target.value); } });

  /* ---------- Página de produto (D) ---------- */
  const PS = { pid: 0, img: 0, qty: 1, opt: 0 };
  const VARIANTS = ['Standard', 'Com instalação', 'Pack empresarial'];
  function product({ params }) {
    const p = prod(params.id);
    if (!p || p.status !== 'approved') return '<div class="d-wrap"><div class="d-empty" style="margin-top:32px"><b>Produto não encontrado</b><p>Pode ter sido removido ou ainda estar em aprovação.</p><a class="d-btn d-btn-dark" href="#/categoria/todos">Ver o catálogo</a></div></div>';
    if (PS.pid !== p.id) Object.assign(PS, { pid: p.id, img: 0, qty: 1, opt: 0 });
    PS.qty = Math.min(PS.qty, p.stock); // nunca acima do stock disponível
    const s = sellerOf(p), c = D.categories.find((x) => x.id === p.cat), fav = wish().includes(p.id);
    const nImg = Math.max(1, ((ICA.productImages || {})[p.id] || []).length), off = p.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;
    const unit = unitPrice(p, PS.qty), total = unit * PS.qty;
    const revs = D.reviews.filter((r) => r.pid === p.id && r.status === 'approved');
    const dist = [5, 4, 3, 2, 1].map((n) => [n, revs.filter((r) => Math.round(r.rating) === n).length]);
    const stars5 = (n) => '<span class="d-stars" aria-label="' + String(n).replace('.', ',') + ' de 5">' + [1, 2, 3, 4, 5].map((i) => '<i class="' + (i <= Math.round(n) ? 'on' : '') + '">★</i>').join('') + '</span>';
    const tierRows = [[1, 9], [10, 49], [50, 0]].map(([a, b], i) => { const u = unitPrice(p, a), on = PS.qty >= a && (!b || PS.qty <= b), out = a > p.stock;
      return '<button type="button" class="d-tier' + (on ? ' on' : '') + '" data-act="pdp-tier" data-q="' + a + '"' + (out ? ' disabled title="Stock insuficiente"' : '') + '><span>' + a + (b ? '–' + b : '+') + ' un</span><b>' + money(u) + '</b><small>' + (out ? 'Sem stock' : i ? '-' + (i === 1 ? 5 : 10) + '%' : 'Preço base') + '</small></button>'; }).join('');
    const nextTier = PS.qty < 10 && p.stock >= 10 ? [10, 5] : PS.qty < 50 && p.stock >= 50 ? [50, 10] : null;
    const gallery = '<div class="d-gal"><button type="button" class="d-gal-main" data-act="zoom" aria-label="Ampliar imagem">' + pimg(p, '', PS.img) + (off ? '<span class="d-badge sale">-' + off + '%</span>' : '') + '</button>' +
      (nImg > 1 ? '<div class="d-gal-th">' + Array.from({ length: nImg }, (_, i) => '<button type="button" class="' + (PS.img === i ? 'on' : '') + '" data-act="pdp-img" data-i="' + i + '" aria-label="Imagem ' + (i + 1) + '">' + pimg(p, '', i) + '</button>').join('') + '</div>' : '') + '</div>';
    const buy = '<div class="d-buy">' +
      '<a class="d-ver" href="#/vendedor/' + s.id + '">' + svg('check') + esc(s.shop) + ' · fornecedor verificado</a>' +
      '<h1>' + esc(p.name) + '</h1>' +
      '<div class="d-meta-row"><a href="#/" data-act="d-scroll" data-to="d-revs">' + stars5(p.rating) + ' <b>' + String(p.rating).replace('.', ',') + '</b> <span>(' + p.reviews + ' avaliações)</span></a><span>Ref. ' + p.sku + '</span></div>' +
      '<div class="d-price"><b>' + money(unit) + '</b>' + (PS.qty < 10 && p.oldPrice ? '<s>' + money(p.oldPrice) + '</s>' : '') + '<small>/ un · IVA 16% no checkout</small></div>' +
      '<div class="d-fg2"><h3>Preço por volume</h3><div class="d-tiers">' + tierRows + '</div>' + (nextTier ? '<p class="d-hint">Compre ' + (nextTier[0] - PS.qty) + ' un a mais e poupe ' + nextTier[1] + '% em cada unidade.</p>' : PS.qty >= 10 ? '<p class="d-hint ok">' + svg('check', 'width:14px;height:14px') + ' Preço por volume aplicado.</p>' : '<p class="d-hint">Stock atual não permite compra por volume. Para quantidades maiores, peça cotação.</p>') + '</div>' +
      '<div class="d-fg2"><h3>Variante</h3><div class="d-vars">' + VARIANTS.map((o, i) => '<button type="button" class="' + (PS.opt === i ? 'on' : '') + '" data-act="pdp-opt" data-i="' + i + '" aria-pressed="' + (PS.opt === i) + '">' + o + '</button>').join('') + '</div></div>' +
      '<div class="d-qrow"><div class="d-qty"><button type="button" data-act="pdp-qty" data-d="-1" aria-label="Diminuir">−</button><input type="number" min="1" max="' + p.stock + '" value="' + PS.qty + '" data-pdpqty aria-label="Quantidade"><button type="button" data-act="pdp-qty" data-d="1" aria-label="Aumentar"' + (PS.qty >= p.stock ? ' disabled' : '') + '>+</button></div>' +
        '<div class="d-stock ' + (p.stock > 10 ? 'ok' : 'low') + '"><i></i>' + (p.stock > 10 ? 'Em stock · ' + p.stock + ' un' : p.stock === 1 ? 'Última unidade' : 'Últimas ' + p.stock + ' unidades') + '</div></div>' +
      '<div class="d-total"><span>Total (' + PS.qty + ' un)</span><b>' + money(total) + '</b></div>' +
      '<div class="d-ctas"><button type="button" class="d-btn d-btn-dark" data-act="pdp-add">' + svg('cart', 'width:18px;height:18px') + 'Adicionar ao carrinho</button><button type="button" class="d-btn d-btn-lime" data-act="pdp-buy">Comprar agora</button></div>' +
      '<div class="d-ctas2"><button type="button" class="d-btn d-btn-line" data-act="quote" data-pid="' + p.id + '">Pedir cotação</button><button type="button" class="d-iconbtn' + (fav ? ' on' : '') + '" data-act="d-wish" data-pid="' + p.id + '" aria-pressed="' + fav + '" aria-label="Guardar nos desejos">' + svg('heart') + '</button><button type="button" class="d-iconbtn" data-act="cmp" data-pid="' + p.id + '" aria-label="Comparar" title="Comparar"><span class="icon-compare" style="font-size:20px"></span></button></div>' +
      '<div class="d-imali"><div><b>Ou 3× de ' + money(Math.round(total / 3)) + '</b><span>com crédito iMali para empresas</span></div><div class="d-wallets" style="margin:0;padding:0;border:0">' + [['Assets/M-pesa logo.png', 'M-Pesa'], ['Assets/emola logo.png', 'e-Mola'], ['Assets/mkesh logo.png', 'mKesh'], ['logo-imali-small.png', 'iMali']].map((w) => '<img src="' + brand(w[0]) + '" alt="' + w[1] + '">').join('') + '</div></div>' +
      '<ul class="d-perks"><li><b>Entrega em todo o país</b>Envio a partir de ' + esc(s.city) + '</li><li><b>Fatura com NUIT</b>Emitida pelo fornecedor</li><li><b>Garantia</b>' + esc((p.specs.find((x) => x[0] === 'Garantia') || ['', 'Conforme fabricante'])[1]) + '</li></ul>' +
      '</div>';
    const secNav = '<nav class="d-snav" aria-label="Secções"><a href="#/" data-act="d-scroll" data-to="d-desc">Descrição</a><a href="#/" data-act="d-scroll" data-to="d-spec">Especificações</a><a href="#/" data-act="d-scroll" data-to="d-revs">Avaliações (' + p.reviews + ')</a><a href="#/" data-act="d-scroll" data-to="d-sell">Fornecedor</a></nav>';
    const specs = [['Referência', p.sku], ['Categoria', p.catName + ' › ' + p.sub]].concat(p.specs);
    const revList = revs.length ? revs.map((r) => '<article class="d-rev"><div class="d-rev-h"><span class="d-av" style="background:var(--d-char-700)">' + esc(r.customer[0]) + '</span><div><b>' + esc(r.customer) + '</b><small>' + date(r.date) + '</small></div>' + stars5(r.rating) + '</div><h4>' + esc(r.title) + '</h4><p>' + esc(r.comment) + '</p></article>').join('') : '<p class="d-mut">Ainda não há avaliações publicadas deste produto. Seja o primeiro a avaliar.</p>';
    const nProd = D.products.filter((x) => x.seller === s.id && x.status === 'approved').length;
    const related = liveProducts().filter((x) => x.cat === p.cat && x.id !== p.id).slice(0, 4);
    const html =
      '<div class="d-phead d-phead-sm"><div class="d-wrap"><nav class="d-crumbs" aria-label="Caminho"><a href="#/">Início</a><span>/</span><a href="#/categoria/' + c.slug + '">' + esc(c.name) + '</a><span>/</span>' + esc(p.sub) + '</nav></div></div>' +
      '<div class="d-wrap d-pdp">' + gallery + buy + '</div>' +
      '<div class="d-wrap">' + secNav +
        '<section class="d-box" id="d-desc"><h2>Descrição</h2><p>' + esc(p.desc) + '</p><p>Fornecido por ' + esc(s.shop) + ', com fatura (NUIT), documentação técnica e suporte pós-venda. Entregas para todas as províncias.</p></section>' +
        '<section class="d-box" id="d-spec"><h2>Especificações</h2><dl class="d-specs">' + specs.map((x) => '<div><dt>' + esc(x[0]) + '</dt><dd>' + esc(x[1]) + '</dd></div>').join('') + '</dl></section>' +
        '<section class="d-box" id="d-revs"><h2>Avaliações</h2><div class="d-revs"><div class="d-rsum"><b>' + String(p.rating).replace('.', ',') + '</b>' + stars5(p.rating) + '<small>' + p.reviews + ' avaliações</small>' +
          (revs.length ? '<small class="d-dist-note">Distribuição dos ' + revs.length + (revs.length === 1 ? ' comentário publicado' : ' comentários publicados') + '</small><div class="d-dist">' + dist.map(([n, k]) => '<div><span>' + n + '★</span><i><em style="width:' + Math.round((k / revs.length) * 100) + '%"></em></i><span>' + k + '</span></div>').join('') + '</div>' : '') +
          '<button type="button" class="d-btn d-btn-dark" data-act="write-review">Escrever avaliação</button></div><div class="d-rlist">' + revList + '</div></div></section>' +
        '<section class="d-box d-sellbox" id="d-sell"><span class="d-av" style="background:' + s.color + '">' + esc(s.shop[0]) + '</span><div><span class="d-ver">' + svg('check') + 'Fornecedor verificado</span><h2>' + esc(s.shop) + '</h2><p>' + esc(s.about) + '</p><div class="d-sstats"><span><b>★ ' + s.rating.toFixed(1).replace('.', ',') + '</b>avaliação</span><span><b>' + nProd + '</b>produtos</span><span><b>' + esc(s.city) + '</b>sede</span><span><b>' + s.since + '</b>no Mercado ICA desde</span></div></div>' +
          '<div class="d-sellacts"><a class="d-btn d-btn-dark" href="#/vendedor/' + s.id + '">Ver loja</a><button type="button" class="d-btn d-btn-line" data-act="contact-seller" data-id="' + s.id + '">Contactar</button></div></section>' +
        (related.length ? '<section class="d-sec"><div class="d-sh"><div><h2>Também em ' + esc(c.name) + '</h2></div><a class="d-more" href="#/categoria/' + c.slug + '">Ver tudo</a></div><div class="d-pgrid">' + related.map(dcard).join('') + '</div></section>' : '') +
      '</div>' +
      '<div class="d-buybar"><div><small>' + PS.qty + ' un · ' + money(unit) + '/un</small><b>' + money(total) + '</b></div><button type="button" class="d-btn d-btn-lime" data-act="pdp-add">' + svg('cart', 'width:18px;height:18px') + 'Adicionar</button></div>';
    return { html, mount: () => document.body.classList.add('d-has-buybar') };
  }
  window.addEventListener('hashchange', () => document.body.classList.remove('d-has-buybar'));
  ACT['pdp-img'] = (el) => { PS.img = +el.dataset.i; re(); };
  ACT['pdp-opt'] = (el) => { PS.opt = +el.dataset.i; re(); };
  ACT['pdp-qty'] = (el) => { PS.qty = Math.max(1, PS.qty + +el.dataset.d); re(); };
  ACT['pdp-tier'] = (el) => { PS.qty = +el.dataset.q; re(); }; // escolher um escalão define a quantidade mínima desse escalão
  document.addEventListener('change', (e) => { if (e.target.dataset && e.target.dataset.pdpqty !== undefined) { PS.qty = Math.max(1, Math.round(+e.target.value) || 1); re(); } });
  ACT['pdp-add'] = () => { const p = prod(PS.pid); addToCart(PS.pid, PS.qty); $$('[data-d-cart]').forEach((c) => { c.classList.remove('bump'); void c.offsetWidth; c.classList.add('bump'); }); toast(PS.qty + ' × ' + p.name + ' adicionado ao carrinho.'); };
  ACT['pdp-buy'] = () => { addToCart(PS.pid, PS.qty); location.hash = '#/checkout'; };
  /* visualizador de imagens em ecrã inteiro (substitui o modal genérico) */
  const LB = { pid: 0, i: 0, n: 1, last: null };
  function paintLightbox() {
    const box = $('#d-lb'); if (!box) return;
    const p = prod(LB.pid);
    $('.d-lb-fig', box).innerHTML = pimg(p, '', LB.i);
    $('.d-lb-count', box).textContent = (LB.i + 1) + ' / ' + LB.n;
    $$('.d-lb-th button', box).forEach((b, k) => { b.classList.toggle('on', k === LB.i); b.setAttribute('aria-current', k === LB.i); });
  }
  function openLightbox(pid, i) {
    const p = prod(pid); LB.pid = pid; LB.i = i; LB.n = Math.max(1, ((ICA.productImages || {})[pid] || []).length); LB.last = document.activeElement;
    const nav = LB.n > 1;
    const box = document.createElement('div'); box.id = 'd-lb'; box.className = 'd-lb'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-modal', 'true'); box.setAttribute('aria-label', 'Imagens de ' + p.name);
    box.innerHTML = '<div class="d-lb-top"><span class="d-lb-title">' + esc(p.name) + '</span><span class="d-lb-count"></span><button type="button" class="d-lb-btn" data-act="lb-close" aria-label="Fechar">✕</button></div>' +
      '<div class="d-lb-stage" data-act="lb-close">' + (nav ? '<button type="button" class="d-lb-btn d-lb-prev" data-act="lb-go" data-d="-1" aria-label="Imagem anterior">‹</button>' : '') + '<figure class="d-lb-fig"></figure>' + (nav ? '<button type="button" class="d-lb-btn d-lb-next" data-act="lb-go" data-d="1" aria-label="Imagem seguinte">›</button>' : '') + '</div>' +
      (nav ? '<div class="d-lb-th">' + Array.from({ length: LB.n }, (_, k) => '<button type="button" data-act="lb-to" data-i="' + k + '" aria-label="Imagem ' + (k + 1) + '">' + pimg(p, '', k) + '</button>').join('') + '</div>' : '');
    document.body.appendChild(box); document.body.classList.add('d-lb-open');
    paintLightbox(); $('[data-act="lb-close"].d-lb-btn', box).focus();
  }
  function closeLightbox() {
    const box = $('#d-lb'); if (!box) return;
    box.remove(); document.body.classList.remove('d-lb-open');
    if (LB.i !== PS.img && PS.pid === LB.pid) { PS.img = LB.i; re(); } else if (LB.last) LB.last.focus();
  }
  ACT['zoom'] = () => openLightbox(PS.pid, PS.img);
  ACT['lb-close'] = (el, e) => { if (e.target.closest('.d-lb-fig img, .d-lb-prev, .d-lb-next') && el.classList.contains('d-lb-stage')) return; closeLightbox(); };
  ACT['lb-go'] = (el, e) => { e.stopPropagation(); LB.i = (LB.i + +el.dataset.d + LB.n) % LB.n; paintLightbox(); };
  ACT['lb-to'] = (el) => { LB.i = +el.dataset.i; paintLightbox(); };
  document.addEventListener('keydown', (e) => {
    if (!$('#d-lb')) return;
    if (e.key === 'Escape') closeLightbox();
    else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { LB.i = (LB.i + (e.key === 'ArrowRight' ? 1 : -1) + LB.n) % LB.n; paintLightbox(); }
  });
  window.addEventListener('hashchange', () => { const b = $('#d-lb'); if (b) { b.remove(); document.body.classList.remove('d-lb-open'); } });
  const mform = (msg, inner, ok, danger) => '<form data-msg="' + esc(msg) + '"><div class="form-grid">' + inner + '</div><div style="margin-top:16px;display:flex;justify-content:flex-end;gap:8px"><button type="button" class="secondary-button" data-act="close-modal">Cancelar</button><button class="' + (danger ? 'btn btn-danger' : 'primary-button') + '">' + ok + '</button></div></form>';
  shop.mform = mform;
  const f = (label, name, o = {}) => ICA.field({ label, name, ...o });
  ACT['quote'] = (el) => { const p = prod(+el.dataset.pid); openModal({ title: 'Pedir cotação', body: '<p class="mut" style="margin-bottom:14px">' + esc(p.name) + '</p>' + mform('Pedido enviado! O vendedor responde em 24 h.', f('Quantidade', 'qty', { type: 'number', value: 10, required: true }) + f('Prazo desejado', 'when', { type: 'date' }) + f('Observações', 'msg', { type: 'textarea', span: 2 }), 'Enviar pedido') }); };
  ACT['contact-seller'] = (el) => { const s = byId(D.sellers, el.dataset.id); openModal({ title: 'Contactar ' + s.shop, body: mform('Mensagem enviada ao vendedor.', f('Assunto', 'subject', { value: 'Dúvida sobre produto', span: 2 }) + f('Mensagem', 'msg', { type: 'textarea', span: 2, required: true }), 'Enviar') }); };
  ACT['write-review'] = () => {
    if (!buyer()) { toast('Inicie sessão para avaliar.', 'info'); location.hash = '#/entrar'; return; }
    openModal({ title: 'Escrever avaliação', body: '<div class="field" style="margin-bottom:12px"><label>Classificação</label><div class="star-pick" id="sp">' + [1, 2, 3, 4, 5].map((i) => '<button type="button" class="on" data-act="pick-star" data-n="' + i + '" aria-label="' + i + ' estrelas"><span class="icon-star-fill text-2xl"></span></button>').join('') + '</div></div>' + mform('Avaliação enviada para moderação. Obrigado!', f('Título', 'title', { span: 2 }) + f('Comentário', 'comment', { type: 'textarea', span: 2, required: true }), 'Publicar') });
  };
  ACT['pick-star'] = (el) => $$('#sp button').forEach((b, i) => b.classList.toggle('on', i < +el.dataset.n));

  /* ---------- Fornecedores, loja do fornecedor, páginas de texto, 404 (D) ---------- */
  const sellerProducts = (s) => liveProducts().filter((p) => p.seller === s.id);
  const sellerCats = (s) => [...new Set(sellerProducts(s).map((p) => p.cat))].map((id) => D.categories.find((c) => c.id === id));
  /* diretório de fornecedores: linhas com fotografias dos produtos de cada um (sem avatares de letra) */
  const SL = { q: '', cat: 0, sort: 'rating' };
  const DIR_SORTS = [['rating', 'Melhor avaliação'], ['products', 'Mais produtos'], ['since', 'Há mais tempo no Mercado ICA'], ['name', 'Nome (A–Z)']];
  function sellerCards(list) {
    if (!list.length) return '<p class="d-dir-none">Nenhum fornecedor corresponde à pesquisa.</p>';
    return list.map((s) => {
      const ps = sellerProducts(s), subs = [...new Set(ps.map((p) => p.sub))];
      return '<a class="d-dir-row" href="#/vendedor/' + s.id + '"><span class="d-dir-pics">' + ps.slice(0, 3).map((p) => '<span>' + pimg(p) + '</span>').join('') + '</span>' +
        '<span class="d-dir-info"><b>' + esc(s.shop) + '</b><small>' + esc(s.city) + ' · no Mercado ICA desde ' + s.since + '</small><small class="d-dir-subs">' + esc(subs.join(', ')) + '</small></span>' +
        '<span class="d-dir-num"><b>' + s.rating.toFixed(1).replace('.', ',') + '</b><small>avaliação</small></span>' +
        '<span class="d-dir-num"><b>' + ps.length + '</b><small>' + (ps.length === 1 ? 'produto' : 'produtos') + '</small></span>' +
        '<span class="d-btn d-btn-line d-btn-md">Ver loja</span></a>';
    }).join('');
  }
  const dirList = () => {
    let L = D.sellers.filter((s) => s.status === 'approved');
    if (SL.q) L = L.filter((s) => (s.shop + ' ' + s.city).toLowerCase().includes(SL.q.toLowerCase()));
    if (SL.cat) L = L.filter((s) => sellerProducts(s).some((p) => p.cat === SL.cat));
    const by = { rating: (a, b) => b.rating - a.rating, products: (a, b) => sellerProducts(b).length - sellerProducts(a).length, since: (a, b) => a.since - b.since, name: (a, b) => a.shop.localeCompare(b.shop) };
    return L.slice().sort(by[SL.sort]);
  };
  const pageHead = (title, crumb, lead = '', extra = '') => '<div class="d-phead"><div class="d-wrap"><nav class="d-crumbs" aria-label="Caminho"><a href="#/">Início</a><span>/</span>' + crumb + '</nav><h1>' + title + '</h1>' + (lead ? '<p>' + lead + '</p>' : '') + extra + '</div></div>';
  const pageTitle = (t, crumb) => pageHead(t, crumb);
  const sellers = () => {
    const L = dirList(), total = D.sellers.filter((s) => s.status === 'approved').length;
    const sel = (attr, opts, cur) => '<span class="d-scat"><select ' + attr + '>' + opts.map((o) => '<option value="' + o[0] + '"' + (String(cur) === String(o[0]) ? ' selected' : '') + '>' + esc(o[1]) + '</option>').join('') + '</select><svg aria-hidden="true"><use href="#d-chev"/></svg></span>';
    return pageHead('Fornecedores', 'Fornecedores', 'Empresas registadas no Mercado ICA, com NUIT e documentação conferida.') +
      '<div class="d-wrap"><div class="d-box d-dir">' +
        '<div class="d-dir-tools"><label class="d-osearch">' + svg('search', 'width:17px;height:17px') + '<span class="d-sr">Pesquisar fornecedor</span><input type="search" placeholder="Nome ou cidade" value="' + esc(SL.q) + '" data-sq></label>' +
          '<label class="d-sort"><span>Setor</span>' + sel('data-scat aria-label="Setor"', [[0, 'Todos']].concat(D.categories.map((c) => [c.id, c.name])), SL.cat) + '</label>' +
          '<label class="d-sort"><span>Ordenar</span>' + sel('data-ssort aria-label="Ordenar"', DIR_SORTS, SL.sort) + '</label>' +
          '<p class="d-dir-count" id="d-dir-count">' + L.length + ' de ' + total + '</p></div>' +
        '<div class="d-dir-list" id="d-dir">' + sellerCards(L) + '</div></div>' +
      '<p class="d-dir-foot">Vende para empresas? <a class="d-link" href="../cliente/index.html#/registar">Registe a sua empresa como fornecedor</a></p></div>';
  };
  document.addEventListener('input', (e) => {
    if (!e.target.dataset || e.target.dataset.sq === undefined) return;
    SL.q = e.target.value; const L = dirList(), box = $('#d-dir'), c = $('#d-dir-count');
    if (box) box.innerHTML = sellerCards(L);
    if (c) c.textContent = L.length + ' de ' + D.sellers.filter((s) => s.status === 'approved').length;
  });
  document.addEventListener('change', (e) => { const d = e.target.dataset || {}; if (d.scat !== undefined) { SL.cat = +e.target.value; re(); } if (d.ssort !== undefined) { SL.sort = e.target.value; re(); } });
  const SP = { sid: 0, cat: 0 };
  function sellerPage({ params }) {
    const s = byId(D.sellers, params.id);
    if (!s || s.status !== 'approved') return notFound();
    if (SP.sid !== s.id) Object.assign(SP, { sid: s.id, cat: 0 });
    const all = sellerProducts(s), cats = sellerCats(s), L = all.filter((p) => !SP.cat || p.cat === SP.cat);
    const head = '<div class="d-phead d-shead"><div class="d-wrap"><nav class="d-crumbs" aria-label="Caminho"><a href="#/">Início</a><span>/</span><a href="#/vendedores">Fornecedores</a><span>/</span>' + esc(s.shop) + '</nav>' +
      '<div class="d-shead-row"><span class="d-av d-av-xl" style="background:' + s.color + '">' + esc(s.shop[0]) + '</span><div class="d-shead-info"><span class="d-ver d-ver-lime">' + svg('check') + 'Fornecedor verificado</span><h1>' + esc(s.shop) + '</h1><div class="d-sstats d-sstats-dark"><span><b>★ ' + s.rating.toFixed(1).replace('.', ',') + '</b>avaliação</span><span><b>' + all.length + '</b>produtos</span><span><b>' + esc(s.city) + '</b>sede</span><span><b>' + s.since + '</b>no Mercado ICA desde</span></div></div>' +
      '<div class="d-shead-acts"><button type="button" class="d-btn d-btn-lime d-btn-md" data-act="contact-seller" data-id="' + s.id + '">Contactar</button><button type="button" class="d-btn d-btn-o d-btn-md" data-act="report-seller">Denunciar</button></div></div></div></div>';
    return head + '<div class="d-wrap"><section class="d-sec" style="padding-top:24px"><div class="d-sh"><div><h2>Produtos</h2></div>' +
      (cats.length > 1 ? '<div class="d-tabs"><button type="button" class="' + (SP.cat ? '' : 'on') + '" data-act="sp-cat" data-cat="0">Todos <small>' + all.length + '</small></button>' + cats.map((c) => '<button type="button" class="' + (SP.cat === c.id ? 'on' : '') + '" data-act="sp-cat" data-cat="' + c.id + '">' + esc(c.name) + ' <small>' + all.filter((p) => p.cat === c.id).length + '</small></button>').join('') + '</div>' : '') + '</div>' +
      '<div class="d-pgrid">' + L.map(dcard).join('') + '</div></section>' +
      '<section class="d-sec"><div class="d-acc-grid d-acc-grid-2"><div class="d-box"><h2>Sobre</h2><p>' + esc(s.about) + '</p></div><div class="d-box"><h2>Contactos</h2><dl class="d-specs d-specs-1"><div><dt>Responsável</dt><dd>' + esc(s.owner) + '</dd></div><div><dt>Email</dt><dd>' + esc(s.email) + '</dd></div><div><dt>Telefone</dt><dd>' + esc(s.phone) + '</dd></div><div><dt>Cidade</dt><dd>' + esc(s.city) + '</dd></div></dl></div></div></section></div>';
  }
  ACT['sp-cat'] = (el) => { SP.cat = +el.dataset.cat; re(); };
  ACT['report-seller'] = () => openModal({ title: 'Denunciar fornecedor', body: mform('Denúncia registada. A nossa equipa irá analisar.', f('Motivo', 'reason', { type: 'select', options: ['Produto falsificado', 'Preços enganosos', 'Comportamento abusivo', 'Outro'], span: 2 }) + f('Detalhes', 'msg', { type: 'textarea', span: 2 }), 'Denunciar', true) });
  const cmsPage = ({ params }) => { const pg = D.cmsPages.find((x) => x.slug === params.slug); if (!pg) return notFound();
    return pageHead(esc(pg.title), esc(pg.title), '', '<nav class="d-pills" aria-label="Informação">' + D.cmsPages.map((x) => '<a href="#/pagina/' + x.slug + '" class="' + (x.slug === pg.slug ? 'on' : '') + '">' + esc(x.title) + '</a>').join('') + '</nav>') +
      '<div class="d-wrap"><div class="d-acc-grid" style="margin-top:24px"><article class="d-box d-prose"><p>' + esc(pg.body) + '</p></article>' +
      '<aside class="d-box d-quick"><h2>Precisa de ajuda?</h2><a href="#/pagina/contactos">Falar connosco<span>›</span></a><a href="#/conta/devolucoes">Devoluções<span>›</span></a><a href="#/conta/pedidos">Os meus pedidos<span>›</span></a></aside></div></div>'; };
  const notFound = () => '<div class="d-wrap"><div class="d-nf"><b>404</b><h1>Página não encontrada</h1><p>A página que procura pode ter mudado de endereço ou já não existir.</p><div class="d-okacts"><a class="d-btn d-btn-dark" href="#/">Ir para o início</a><a class="d-btn d-btn-line" href="#/categoria/todos">Ver o catálogo</a></div></div></div>';

  Object.assign(shop, { layout, updateHeader, markTab, syncCookie, home, listing, product, sellers, sellerPage, cmsPage, notFound, sellerCards, pageTitle, f });
})();
