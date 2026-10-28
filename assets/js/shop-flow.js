/* Mercado ICA — Comprador (markup real): carrinho, checkout, autenticação, conta, comparação */
(function () {
  const ICA = window.ICA;
  const { $, esc, money, ACT, FORMS, S, pimg, toast, openModal, byId, date, badge } = ICA;
  const D = ICA, sh = ICA.shop, brand = sh.brand;
  const re = () => ICA.refresh();
  const go = (h) => { location.hash = h; };
  const mf = (msg, inner, ok) => '<form data-msg="' + esc(msg) + '">' + inner + '<div class="mt-4 flex justify-end gap-2.5"><button type="button" class="secondary-button" data-act="close-modal">Cancelar</button><button class="primary-button">' + ok + '</button></div></form>';

  /* ---------- Passos do fluxo de compra (D) ---------- */
  const svg = sh.svg;
  const steps = (cur) => '<ol class="d-steps" aria-label="Passos da compra">' + ['Carrinho', 'Entrega e pagamento', 'Confirmação'].map((t, i) =>
    '<li class="' + (i + 1 < cur ? 'done' : i + 1 === cur ? 'on' : '') + '"' + (i + 1 === cur ? ' aria-current="step"' : '') + '><span>' + (i + 1 < cur ? svg('check', 'width:14px;height:14px') : i + 1) + '</span>' + t + '</li>').join('<li class="d-steps-sep" aria-hidden="true">›</li>') + '</ol>';
  const flowHead = (title, cur, extra = '') => '<div class="d-phead d-phead-flow"><div class="d-wrap"><div><h1>' + title + '</h1>' + extra + '</div>' + steps(cur) + '</div></div>';
  const savings = (lines) => lines.reduce((s, l) => s + (l.p.price - l.unit) * l.qty, 0);
  const sumRow = (label, val, cls = '') => '<div class="d-srow ' + cls + '"><span>' + label + '</span><b>' + val + '</b></div>';
  const totalsBlock = (t, lines) => {
    const save = savings(lines);
    return sumRow('Subtotal (' + lines.reduce((s, l) => s + l.qty, 0) + ' un)', money(t.sub + save)) +
      (save ? sumRow('Poupança por volume', '−' + money(save), 'save') : '') +
      (t.disc ? sumRow('Cupão ' + esc(t.coupon.code), '−' + money(t.disc), 'save') : '') +
      sumRow('Envio', t.ship ? money(t.ship) : 'Grátis', t.ship ? '' : 'free') + sumRow('IVA (16%)', money(t.tax)) +
      '<div class="d-stotal"><span>Total</span><b>' + money(t.total) + '</b></div>';
  };
  const walletsRow = '<div class="d-wallets" style="margin:0;padding:0;border:0">' + [['Assets/M-pesa logo.png', 'M-Pesa'], ['Assets/emola logo.png', 'e-Mola'], ['Assets/mkesh logo.png', 'mKesh'], ['logo-imali-small.png', 'iMali']].map((w) => '<img src="' + brand(w[0]) + '" alt="' + w[1] + '">').join('') + '</div>';

  /* ---------- Carrinho (D) ---------- */
  const CS = { coupon: false };
  function cartPage() {
    const lines = sh.cartLines(), t = sh.totals();
    if (!lines.length) return flowHead('Carrinho', 1) + '<div class="d-wrap"><div class="d-empty" style="margin-top:24px"><b>O seu carrinho está vazio</b><p>Explore o catálogo ou peça uma cotação para compras grandes.</p><a class="d-btn d-btn-dark" href="#/categoria/todos">Explorar o catálogo</a></div></div>';
    const bySeller = [...new Set(lines.map((l) => l.p.seller))].map((sid) => [byId(D.sellers, sid), lines.filter((l) => l.p.seller === sid)]);
    const row = (l) => {
      const tier = sh.TIERS.find((x) => l.qty >= x[0]), pct = Math.round((1 - tier[1]) * 100), next = l.qty < 10 && l.p.stock >= 10 ? [10, 5] : l.qty < 50 && l.p.stock >= 50 ? [50, 10] : null;
      return '<div class="d-cline"><a class="d-cimg" href="#/produto/' + l.pid + '">' + pimg(l.p) + '</a><div class="d-cinfo"><a href="#/produto/' + l.pid + '"><b>' + esc(l.p.name) + '</b></a>' +
        '<div class="d-cunit">' + money(l.unit) + ' / un' + (pct ? '<span class="d-tag">−' + pct + '% por volume</span>' : '') + '</div>' +
        (next ? '<small class="d-chint">Mais ' + (next[0] - l.qty) + ' un e poupa ' + next[1] + '% em cada</small>' : '') +
        '<div class="d-cacts2"><div class="d-qty d-qty-sm"><button type="button" data-act="cart-qty" data-pid="' + l.pid + '" data-d="-1" aria-label="Diminuir"' + (l.qty <= 1 ? ' disabled' : '') + '>−</button><input type="number" min="1" max="' + l.p.stock + '" value="' + l.qty + '" data-cartqty="' + l.pid + '" aria-label="Quantidade de ' + esc(l.p.name) + '"><button type="button" data-act="cart-qty" data-pid="' + l.pid + '" data-d="1" aria-label="Aumentar"' + (l.qty >= l.p.stock ? ' disabled' : '') + '>+</button></div>' +
        '<button type="button" class="d-link d-link-mut" data-act="move-wish" data-pid="' + l.pid + '">Guardar para depois</button><button type="button" class="d-link d-link-del" data-act="rm-cart" data-pid="' + l.pid + '">Remover</button></div></div>' +
        '<div class="d-cprice"><b>' + money(l.unit * l.qty) + '</b>' + (pct ? '<s>' + money(l.p.price * l.qty) + '</s>' : '') + '</div></div>';
    };
    const toFree = Math.max(0, sh.FREE_SHIP - (t.sub - t.disc)), shipOpt = S.get('shipping', 'standard');
    const summary = '<aside class="d-sum"><h2>Resumo</h2>' +
      (shipOpt === 'standard' ? '<div class="d-freeship">' + (toFree ? '<p>Faltam <b>' + money(toFree) + '</b> para envio grátis</p>' : '<p class="ok">' + svg('check', 'width:14px;height:14px') + ' Envio grátis desbloqueado</p>') + '<div class="d-bar"><i style="width:' + Math.min(100, Math.round(((t.sub - t.disc) / sh.FREE_SHIP) * 100)) + '%"></i></div></div>' : '') +
      totalsBlock(t, lines) +
      (t.coupon ? '<div class="d-coupon-on"><span>' + svg('check', 'width:14px;height:14px') + esc(t.coupon.label) + '</span><button type="button" class="d-link d-link-del" data-act="coupon-rm">Remover</button></div>'
        : CS.coupon ? '<form data-form="coupon" class="d-coupon"><label class="d-sr" for="d-cp">Código de cupão</label><input id="d-cp" name="code" placeholder="Código de cupão" autocomplete="off" required><button class="d-btn d-btn-dark">Aplicar</button></form>'
        : '<button type="button" class="d-link" data-act="coupon-open">Tem um cupão de desconto?</button>') +
      '<a class="d-btn d-btn-lime d-sum-go" href="#/checkout">Finalizar compra →</a>' +
      '<div class="d-imali"><div><b>Ou 3× de ' + money(Math.round(t.total / 3)) + '</b><span>com crédito iMali para empresas</span></div>' + walletsRow + '</div>' +
      '<a class="d-link d-link-mut" href="#/categoria/todos" style="justify-self:center">Continuar a comprar</a></aside>';
    return flowHead('Carrinho', 1, '<p>' + lines.length + (lines.length === 1 ? ' produto' : ' produtos') + ' de ' + bySeller.length + (bySeller.length === 1 ? ' fornecedor' : ' fornecedores') + '</p>') +
      '<div class="d-wrap d-flow"><div class="d-flow-main">' + bySeller.map(([s, ls]) => '<section class="d-box d-cgroup"><header><span class="d-av" style="background:' + s.color + '">' + esc(s.shop[0]) + '</span><div><b>' + esc(s.shop) + '</b><span class="d-ver">' + svg('check') + 'Fornecedor verificado · envio de ' + esc(s.city) + '</span></div><span class="d-cg-sub">' + money(ls.reduce((a, l) => a + l.unit * l.qty, 0)) + '</span></header>' + ls.map(row).join('') + '</section>').join('') + '</div>' + summary + '</div>' +
      '<div class="d-buybar d-buybar-flow"><div><small>Total</small><b>' + money(t.total) + '</b></div><a class="d-btn d-btn-lime" href="#/checkout">Finalizar compra →</a></div>';
  }
  const setQty = (pid, q) => { const c = sh.cart(), l = c.find((x) => x.pid === pid), p = sh.prod(pid); if (!l) return; l.qty = Math.min(p.stock, Math.max(1, q)); S.set('cart', c); sh.updateHeader(); re(); };
  ACT['cart-qty'] = (el) => { const l = sh.cart().find((x) => x.pid === +el.dataset.pid); if (l) setQty(l.pid, l.qty + +el.dataset.d); };
  document.addEventListener('change', (e) => { const v = e.target.dataset && e.target.dataset.cartqty; if (v) setQty(+v, Math.round(+e.target.value) || 1); });
  ACT['move-wish'] = (el) => { const pid = +el.dataset.pid; S.set('cart', sh.cart().filter((l) => l.pid !== pid)); const w = sh.wish(); if (!w.includes(pid)) { w.push(pid); S.set('wishlist', w); } sh.updateHeader(); re(); toast('Guardado na lista de desejos.', 'info'); };
  ACT['coupon-open'] = () => { CS.coupon = true; re(); setTimeout(() => { const i = $('#d-cp'); if (i) i.focus(); }, 0); };
  ACT['coupon-rm'] = () => { S.del('coupon'); CS.coupon = false; toast('Cupão removido.', 'info'); re(); };
  FORMS['coupon'] = (d) => {
    const c = D.coupons.find((x) => x.code === (d.code || '').trim().toUpperCase());
    if (c) { S.set('coupon', c); CS.coupon = false; toast('Cupão aplicado: ' + c.label); } else { S.del('coupon'); toast('Cupão inválido ou expirado.', 'error'); }
    re();
  };

  /* ---------- Checkout (D) ---------- */
  const CK = { addr: 1, pay: 'mpesa', phone: '84 000 1111', terms: false, company: 'Ana Machava, Lda', nuit: '400123456' };
  const PAY = [['mpesa', 'M-Pesa', 'Carteira Vodacom', brand('Assets/M-pesa logo.png')], ['emola', 'e-Mola', 'Carteira Movitel', brand('Assets/emola logo.png')], ['mkesh', 'mKesh', 'Carteira Tmcel', brand('Assets/mkesh logo.png')], ['imali', 'iMali Way', 'Carteira iMali', brand('logo-imali-small.png')], ['bnpl', 'Crédito iMali', 'Pague em 3×, sem juros', brand('Assets/BNPL logo.png')], ['card', 'Cartão bancário', 'Visa / Mastercard', '']];
  const WALLET = ['mpesa', 'emola', 'mkesh', 'imali'];
  const SHIP = [['standard', 'Normal', '3–5 dias úteis'], ['express', 'Expresso', '1–2 dias úteis'], ['pickup', 'Levantar no fornecedor', 'Disponível em 24 h']];
  function checkout() {
    if (!sh.cartLines().length) { go('#/carrinho'); return ''; }
    if (!sh.buyer()) { S.set('after-login', '#/checkout'); toast('Inicie sessão para finalizar a compra.', 'info'); go('#/entrar'); return ''; }
    const t = sh.totals(), lines = sh.cartLines(), pm = PAY.find((p) => p[0] === CK.pay), shipOpt = S.get('shipping', 'standard');
    const sub = t.sub - t.disc, part = Math.round(t.total / 3);
    const day = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return d.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' }); };
    const radio = (on) => '<i class="d-radio' + (on ? ' on' : '') + '">' + svg('check', 'width:12px;height:12px') + '</i>';
    const shipPrice = (k) => k === 'pickup' ? 'Grátis' : k === 'express' ? money(3500) : sub >= sh.FREE_SHIP ? 'Grátis' : money(1500);
    const addr = '<section class="d-box d-ck"><h2>Morada de entrega</h2><div class="d-opts d-opts-2">' +
      D.addresses.map((a) => '<button type="button" class="d-opt' + (CK.addr === a.id ? ' on' : '') + '" data-act="ck-addr" data-id="' + a.id + '" aria-pressed="' + (CK.addr === a.id) + '">' + radio(CK.addr === a.id) + '<span><b>' + esc(a.name) + '</b><small>' + esc(a.line) + ', ' + esc(a.city) + ' · ' + esc(a.province) + '</small><small>' + esc(a.phone) + '</small></span></button>').join('') +
      '<button type="button" class="d-opt d-opt-add" data-act="addr-new"><span><b>+ Nova morada</b><small>Estaleiro, armazém, escritório…</small></span></button></div>' +
      '<h3 class="d-ck-h3">Dados de faturação</h3><div class="d-row2"><div class="d-fld"><label for="ck-co">Empresa</label><input id="ck-co" data-ck="company" value="' + esc(CK.company) + '"></div><div class="d-fld"><label for="ck-nuit">NUIT</label><input id="ck-nuit" data-ck="nuit" inputmode="numeric" maxlength="9" value="' + esc(CK.nuit) + '"></div></div></section>';
    const ship = '<section class="d-box d-ck"><h2>Envio</h2><div class="d-opts d-opts-3">' +
      SHIP.map((s) => '<button type="button" class="d-opt' + (shipOpt === s[0] ? ' on' : '') + '" data-act="ck-ship" data-id="' + s[0] + '" aria-pressed="' + (shipOpt === s[0]) + '">' + radio(shipOpt === s[0]) + '<span><b>' + s[1] + '</b><small>' + s[2] + '</small></span><em>' + shipPrice(s[0]) + '</em></button>').join('') + '</div></section>';
    const payDetail = WALLET.includes(CK.pay)
      ? '<div class="d-paydet"><div class="d-fld"><label for="ck-ph">Número da carteira ' + esc(pm[1]) + '</label><div class="d-phone"><span>+258</span><input id="ck-ph" data-phone inputmode="tel" value="' + esc(CK.phone) + '"></div></div><p class="d-mut">Vai receber um pedido de confirmação (PIN) no telemóvel. Nada é cobrado antes de confirmar.</p></div>'
      : CK.pay === 'bnpl' ? '<div class="d-paydet"><div class="d-planc d-planc-inline"><ol>' + [['Hoje', 0, 1], ['Em 30 dias', 30, 0], ['Em 60 dias', 60, 0]].map((r) => '<li class="' + (r[2] ? 'ok' : '') + '"><span>' + r[0] + (r[1] ? ' · ' + day(r[1]) : '') + '</span><b>' + money(part) + '</b></li>').join('') + '</ol></div><p class="d-mut">Sem juros para empresas registadas. A aprovação é imediata no passo seguinte.</p></div>'
      : '<div class="d-paydet"><div class="d-fld"><label for="ck-cn">Número do cartão</label><input id="ck-cn" inputmode="numeric" placeholder="0000 0000 0000 0000" autocomplete="cc-number"></div><div class="d-row2"><div class="d-fld"><label for="ck-ce">Validade</label><input id="ck-ce" placeholder="MM/AA" autocomplete="cc-exp"></div><div class="d-fld"><label for="ck-cv">CVV</label><input id="ck-cv" inputmode="numeric" placeholder="123" autocomplete="cc-csc"></div></div></div>';
    const pay = '<section class="d-box d-ck"><h2>Pagamento</h2><div class="d-opts d-opts-pay">' +
      PAY.map((p) => '<button type="button" class="d-opt d-opt-pay' + (CK.pay === p[0] ? ' on' : '') + '" data-act="ck-pay" data-id="' + p[0] + '" aria-pressed="' + (CK.pay === p[0]) + '">' + radio(CK.pay === p[0]) + (p[3] ? '<img src="' + p[3] + '" alt="">' : '<span class="d-cardmark">VISA · MC</span>') + '<span><b>' + esc(p[1]) + '</b><small>' + esc(p[2]) + '</small></span></button>').join('') + '</div>' + payDetail + '</section>';
    const payLabel = CK.pay === 'bnpl' ? 'Pagar ' + money(part) + ' hoje' : 'Pagar ' + money(t.total);
    const summary = '<aside class="d-sum"><h2>O seu pedido</h2><ul class="d-sitems">' + lines.map((l) => '<li><span class="d-sthumb">' + pimg(l.p) + '<em>' + l.qty + '</em></span><span><b>' + esc(l.p.name) + '</b><small>' + money(l.unit) + ' / un</small></span><b>' + money(l.unit * l.qty) + '</b></li>').join('') + '</ul>' +
      totalsBlock(t, lines) +
      '<div class="d-terms"><button type="button" class="d-chk' + (CK.terms ? ' on' : '') + '" role="checkbox" aria-checked="' + CK.terms + '" data-act="ck-terms"><i>' + svg('check') + '</i><span>Li e aceito os</span></button><a href="#/pagina/termos">Termos e Condições</a></div>' +
      '<button type="button" class="d-btn d-btn-lime d-sum-go" data-act="ck-place"' + (CK.terms ? '' : ' aria-disabled="true"') + '>' + payLabel + ' com ' + esc(pm[1]) + '</button>' +
      '<p class="d-secure">' + svg('check', 'width:13px;height:13px') + 'Pagamento seguro processado pela Paytek</p><a class="d-link d-link-mut" href="#/carrinho" style="justify-self:center">Voltar ao carrinho</a></aside>';
    return flowHead('Finalizar compra', 2) + '<div class="d-wrap d-flow"><div class="d-flow-main">' + addr + ship + pay + '</div>' + summary + '</div>' +
      '<div class="d-buybar d-buybar-flow"><div><small>Total</small><b>' + money(t.total) + '</b></div><button type="button" class="d-btn d-btn-lime" data-act="ck-place"' + (CK.terms ? '' : ' aria-disabled="true"') + '>' + (CK.pay === 'bnpl' ? 'Pagar 1.ª prestação' : 'Pagar') + '</button></div>';
  }
  ACT['ck-addr'] = (el) => { CK.addr = +el.dataset.id; re(); };
  ACT['ck-ship'] = (el) => { S.set('shipping', el.dataset.id); re(); };
  ACT['ck-pay'] = (el) => { CK.pay = el.dataset.id; re(); };
  ACT['ck-terms'] = () => { CK.terms = !CK.terms; re(); };
  document.addEventListener('input', (e) => { const d = e.target.dataset || {}; if (d.phone !== undefined) CK.phone = e.target.value; if (d.ck) CK[d.ck] = e.target.value; });
  ACT['addr-new'] = () => openModal({ title: 'Nova morada', body: mf('Morada guardada com sucesso.', ICA.fields([{ name: 'name', label: 'Nome da morada', placeholder: 'Ex.: Estaleiro' }, { name: 'phone', label: 'Telefone', type: 'tel' }, { name: 'line', label: 'Morada', span: 2, required: true }, { name: 'city', label: 'Cidade' }, { name: 'prov', label: 'Província', type: 'select', options: ['Maputo Cidade', 'Maputo Província', 'Gaza', 'Inhambane', 'Sofala', 'Manica', 'Tete', 'Zambézia', 'Nampula', 'Cabo Delgado', 'Niassa'] }]), 'Guardar') });
  ACT['ck-place'] = () => {
    if (!CK.terms) { toast('Aceite os Termos e Condições para continuar.', 'warning'); const b = $('[data-act="ck-terms"]'); if (b) b.focus(); return; }
    if (WALLET.includes(CK.pay) && (CK.phone || '').replace(/\D/g, '').length !== 9) { toast('Indique um número de carteira válido (9 dígitos).', 'error'); const i = $('#ck-ph'); if (i) i.focus(); return; }
    const t = sh.totals(), lines = sh.cartLines(), n = 'ICA-' + (100423 + Math.floor(Math.random() * 500));
    if (!lines.length) { toast('O carrinho está vazio.', 'error'); go('#/carrinho'); return; } // ex.: compra já concluída noutro separador
    const o = { id: Date.now(), number: n, date: new Date().toISOString(), customer: sh.buyer().name, email: sh.buyer().email, status: 'pending', pay: (PAY.find((p) => p[0] === CK.pay) || [])[1], phone: CK.phone, items: lines.map((l) => ({ pid: l.pid, name: l.p.name, qty: l.qty, price: l.unit, seller: l.p.seller, emoji: l.p.emoji, color: l.p.color })), sub: t.sub, ship: t.ship, tax: t.tax, total: t.total, invoiced: false, shipped: false };
    S.set('my-orders', [o].concat(S.get('my-orders', []))); S.set('last-order', o);
    S.set('cart', []); S.del('coupon'); CK.terms = false; sh.updateHeader();
    go(WALLET.includes(CK.pay) ? '#/pagamento/aguardar' : '#/pedido/sucesso');
  };
  function waiting() {
    const o = S.get('last-order', null);
    return { html: flowHead('Confirmar pagamento', 2) + '<div class="d-wrap"><div class="d-box d-center"><div class="d-spin" aria-hidden="true"></div><h2>Confirme no telemóvel</h2><p>Enviámos um pedido de pagamento de <b>' + (o ? money(o.total) : '') + '</b> para <b>+258 ' + esc((o && o.phone) || CK.phone) + '</b> (' + esc((o && o.pay) || '') + '). Introduza o PIN para confirmar.</p><p class="d-mut" aria-live="polite">Esta página atualiza-se sozinha.</p><button type="button" class="d-link d-link-del" data-act="ck-cancel">Cancelar pagamento</button></div></div>',
      mount: () => { clearTimeout(ICA._wt); ICA._wt = setTimeout(() => { if (location.hash.startsWith('#/pagamento')) go('#/pedido/sucesso'); }, 3500); } };
  }
  ACT['ck-cancel'] = () => { clearTimeout(ICA._wt); toast('Pagamento cancelado.', 'error'); go('#/carrinho'); };
  function orderSuccess() {
    const o = S.get('last-order', null) || D.orders[0];
    return flowHead('Pedido confirmado', 3) + '<div class="d-wrap"><div class="d-box d-center"><div class="d-okmark" aria-hidden="true">' + svg('check', 'width:34px;height:34px') + '</div><h2>Obrigado pela sua compra!</h2><p>O pedido <b>' + esc(o.number) + '</b> foi registado e os fornecedores já foram notificados. Enviámos a confirmação para <b>' + esc(o.email) + '</b>.</p>' +
      '<div class="d-okgrid"><div><small>Total pago</small><b>' + money(o.total) + '</b></div><div><small>Método</small><b>' + esc(o.pay) + '</b></div><div><small>Entrega estimada</small><b>3–5 dias úteis</b></div></div>' +
      '<div class="d-okacts"><a class="d-btn d-btn-dark" href="#/conta/pedidos/' + o.id + '">Ver pedido</a><a class="d-btn d-btn-line" href="#/categoria/todos">Continuar a comprar</a></div></div></div>';
  }

  /* ---------- Autenticação (D) ---------- */
  const AU = { sent: '' };
  /* contagem animada dos números do painel da marca (respeita "reduzir movimento") */
  const countUp = (root) => {
    const els = Array.from(root.querySelectorAll('[data-count]')), still = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const paint = (el, v) => { el.textContent = v + (el.dataset.suffix || ''); };
    if (still) return els.forEach((el) => paint(el, +el.dataset.count));
    const t0 = performance.now(), dur = 1200;
    const step = (t) => { const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3); els.forEach((el) => paint(el, Math.round(+el.dataset.count * e))); if (k < 1 && document.body.contains(root)) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  };
  const authShell = (...a) => ({ html: authHtml(...a), mount: countUp });
  const authHtml = (title, sub, inner, foot) =>
    '<div class="d-auth-page"><aside class="d-auth-brand"><span class="d-auth-ring" aria-hidden="true"></span><a href="#/" class="d-auth-home"><img src="../assets/brand/mercado-ica-mark-white.png" alt="Mercado ICA"></a>' +
      '<div class="d-auth-copy"><h2>O mercado das empresas <span>moçambicanas.</span></h2><ul><li><b data-count="' + D.sellers.filter((s) => s.status === 'approved').length + '">0</b>fornecedores verificados</li><li><b data-count="3" data-suffix="×">0×</b>crédito iMali para empresas</li><li><b data-count="11">0</b>províncias com entrega</li></ul></div>' +
      '<div class="d-auth-pay"><small>Pague com</small>' + walletsRow + '</div></aside>' +
    '<main class="d-auth-main"><a href="#/" class="d-back">‹ Voltar à loja</a><a href="#/" class="d-auth-logo-m"><img src="../assets/brand/mercado-ica-mark.png" alt="Mercado ICA"></a><section class="d-auth-card" aria-labelledby="d-auth-t"><h1 id="d-auth-t">' + title + '</h1><p class="d-auth-sub">' + sub + '</p>' + inner + '</section>' +
      (foot ? '<p class="d-auth-foot">' + foot + '</p>' : '') + '<p class="d-auth-legal">© 2026 Paytek · <a href="#/pagina/termos">Termos</a> · <a href="#/pagina/privacidade">Privacidade</a> · <a href="#/pagina/contactos">Ajuda</a></p></main></div>';
  const fld = (label, name, type, o = {}) => '<div class="d-fld' + (o.span ? ' d-span2' : '') + '"><label for="au-' + name + '">' + label + '</label>' +
    (type === 'password' ? '<div class="d-pass"><input id="au-' + name + '" name="' + name + '" type="password"' + (o.value ? ' value="' + esc(o.value) + '"' : '') + ' placeholder="' + esc(o.ph || '') + '" autocomplete="' + (o.ac || 'current-password') + '"' + (o.req === false ? '' : ' required') + (o.meter ? ' data-pwmeter' : '') + '><button type="button" class="d-link d-link-mut" data-act="pw-toggle" aria-label="Mostrar palavra-passe">Mostrar</button></div>'
      : '<input id="au-' + name + '" name="' + name + '" type="' + type + '"' + (o.value ? ' value="' + esc(o.value) + '"' : '') + ' placeholder="' + esc(o.ph || '') + '"' + (o.ac ? ' autocomplete="' + o.ac + '"' : '') + (o.mode ? ' inputmode="' + o.mode + '"' : '') + (o.max ? ' maxlength="' + o.max + '"' : '') + (o.req === false ? '' : ' required') + '>') +
    (o.hint ? '<small class="d-fhint">' + o.hint + '</small>' : '') + (o.meter ? '<div class="d-pwm" data-pwm><i></i><i></i><i></i><i></i><small>Use 8+ caracteres, com números e maiúsculas</small></div>' : '') + '</div>';
  const loginPage = () => authShell('Entrar', 'Aceda à conta da sua empresa no Mercado ICA.',
    '<form data-form="login" class="d-auth-form">' + fld('Email ou conta iMali', 'login', 'text', { value: 'ana.machava@exemplo.co.mz', ph: 'nome@empresa.co.mz', ac: 'username' }) + fld('Palavra-passe', 'password', 'password', { value: 'demo1234', ph: 'A sua palavra-passe' }) +
      '<div class="d-auth-row"><button type="button" class="d-chk on" role="checkbox" aria-checked="true" data-act="au-remember"><i>' + svg('check') + '</i><span>Manter sessão iniciada</span></button><a class="d-link" href="#/recuperar">Esqueceu a palavra-passe?</a></div>' +
      '<button class="d-btn d-btn-dark d-auth-go">Entrar</button><div class="d-or"><span>ou</span></div><button type="button" class="d-btn d-btn-lime d-auth-go" data-act="au-imali"><img src="' + brand('logo-imali-small.png') + '" alt="" class="d-auth-imali">Continuar com iMali</button></form>',
    'Ainda não tem conta? <a class="d-link" href="#/registar">Criar conta empresarial</a>');
  const registerPage = () => authShell('Criar conta empresarial', 'Registe a sua empresa para comprar com fatura, preços por volume e crédito iMali.',
    '<form data-form="register" class="d-auth-form" novalidate><h3 class="d-ck-h3">Empresa</h3><div class="d-auth-grid">' + fld('Nome da empresa', 'company', 'text', { ph: 'Ex.: Machava Construções, Lda', ac: 'organization' }) + fld('NUIT', 'nuit', 'text', { ph: '9 dígitos', mode: 'numeric', max: 9, hint: 'Aparece nas suas faturas.' }) + '</div>' +
      '<h3 class="d-ck-h3">Responsável</h3><div class="d-auth-grid">' + fld('Nome', 'first_name', 'text', { ac: 'given-name' }) + fld('Apelido', 'last_name', 'text', { ac: 'family-name' }) + fld('Email profissional', 'email', 'email', { ph: 'nome@empresa.co.mz', ac: 'email' }) + fld('Telemóvel', 'phone', 'tel', { ph: '84 000 0000', ac: 'tel', mode: 'tel' }) + '</div>' +
      '<h3 class="d-ck-h3">Acesso</h3><div class="d-auth-grid">' + fld('Palavra-passe', 'password', 'password', { ac: 'new-password', meter: true }) + fld('Confirmar palavra-passe', 'password_confirmation', 'password', { ac: 'new-password' }) + fld('Conta iMali Business <em>(opcional)</em>', 'imali', 'text', { ph: 'Para ativar o crédito em 3×', req: false, span: true }) + '</div>' +
      '<button type="button" class="d-chk" role="checkbox" aria-checked="false" data-act="au-terms"><i>' + svg('check') + '</i><span>Aceito os termos e a política de privacidade</span></button>' +
      '<button class="d-btn d-btn-dark d-auth-go">Criar conta</button></form>',
    'Já tem conta? <a class="d-link" href="#/entrar">Entrar</a>');
  const recoverPage = () => AU.sent
    ? authShell('Verifique o seu email', 'Enviámos uma ligação para <b>' + esc(AU.sent) + '</b>. Abra-a para definir uma nova palavra-passe. A ligação é válida durante 1 hora.',
      '<div class="d-auth-form"><a class="d-btn d-btn-dark d-auth-go" href="#/entrar">Voltar a entrar</a><button type="button" class="d-link" data-act="au-resend">Não recebeu? Reenviar</button></div>', '')
    : authShell('Recuperar palavra-passe', 'Indique o email da conta. Enviamos uma ligação para definir uma nova palavra-passe.',
      '<form data-form="recover" class="d-auth-form">' + fld('Email', 'email', 'email', { ph: 'nome@empresa.co.mz', ac: 'email' }) + '<button class="d-btn d-btn-dark d-auth-go">Enviar ligação</button></form>',
      'Lembrou-se? <a class="d-link" href="#/entrar">Entrar</a>');
  const loginAs = (name, email) => { S.set('buyer', { name, email, phone: '+258 84 000 1111' }); sh.updateHeader(); const next = S.get('after-login', '#/'); S.del('after-login'); go(next); }; // por defeito vai para a página inicial; só volta a uma página protegida (ex.: checkout) se o login foi pedido por ela
  ACT['pw-toggle'] = (el) => { const i = el.parentNode.querySelector('input'), show = i.type === 'password'; i.type = show ? 'text' : 'password'; el.textContent = show ? 'Esconder' : 'Mostrar'; el.setAttribute('aria-label', (show ? 'Esconder' : 'Mostrar') + ' palavra-passe'); };
  const chkToggle = (el) => { const on = el.getAttribute('aria-checked') !== 'true'; el.setAttribute('aria-checked', on); el.classList.toggle('on', on); };
  ACT['au-remember'] = chkToggle;
  ACT['au-terms'] = chkToggle;
  ACT['au-imali'] = () => { toast('Sessão iniciada com a conta iMali.'); loginAs('Ana Machava', 'ana.machava@exemplo.co.mz'); };
  ACT['au-resend'] = () => toast('Enviámos de novo a ligação para ' + AU.sent + '.');
  document.addEventListener('input', (e) => {
    if (!e.target.matches || !e.target.matches('[data-pwmeter]')) return;
    const v = e.target.value, score = (v.length >= 8) + /[A-Z]/.test(v) + /\d/.test(v) + /[^A-Za-z0-9]/.test(v), m = e.target.closest('.d-fld').querySelector('[data-pwm]');
    m.dataset.s = v ? score : ''; $('small', m).textContent = !v ? 'Use 8+ caracteres, com números e maiúsculas' : ['Muito fraca', 'Fraca', 'Razoável', 'Boa', 'Forte'][score];
  });
  FORMS['login'] = (d) => { toast('Sessão iniciada com sucesso.'); loginAs('Ana Machava', d.login && d.login.includes('@') ? d.login : 'ana.machava@exemplo.co.mz'); };
  FORMS['register'] = (d, f) => {
    const bad = (name, msg) => { toast(msg, 'error'); const i = f.querySelector('[name="' + name + '"]'); if (i) i.focus(); };
    const miss = ['company', 'nuit', 'first_name', 'last_name', 'email', 'phone', 'password', 'password_confirmation'].find((k) => !(d[k] || '').trim());
    if (miss) return bad(miss, 'Preencha todos os campos obrigatórios.');
    if (!/^\d{9}$/.test(d.nuit)) return bad('nuit', 'O NUIT tem 9 dígitos.');
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(d.email)) return bad('email', 'Indique um email válido.');
    if (d.password.length < 8) return bad('password', 'A palavra-passe precisa de pelo menos 8 caracteres.');
    if (d.password !== d.password_confirmation) return bad('password_confirmation', 'As palavras-passe não coincidem.');
    if ($('[data-act="au-terms"]', f).getAttribute('aria-checked') !== 'true') { toast('Aceite os termos para criar a conta.', 'warning'); return; }
    CK.company = d.company; CK.nuit = d.nuit;
    toast('Conta criada! Bem-vindo(a) ao Mercado ICA.'); loginAs((d.first_name + ' ' + d.last_name).trim(), d.email);
  };
  FORMS['recover'] = (d) => { AU.sent = d.email; re(); };
  window.addEventListener('hashchange', () => { if (!location.hash.startsWith('#/recuperar')) AU.sent = ''; });
  ACT['logout'] = () => { S.del('buyer'); sh.updateHeader(); toast('Sessão terminada.', 'info'); go('#/'); };

  /* ---------- Conta (D) ---------- */
  const myOrders = () => S.get('my-orders', []).concat(D.orders.slice(0, 9).map((o) => ({ ...o, customer: 'Ana Machava', email: 'ana.machava@exemplo.co.mz' })));
  const ACC_TABS = [['', 'Painel'], ['pedidos', 'Pedidos'], ['desejos', 'Desejos'], ['moradas', 'Moradas'], ['perfil', 'Perfil'], ['avaliacoes', 'Avaliações'], ['devolucoes', 'Devoluções'], ['downloads', 'Downloads'], ['privacidade', 'Privacidade']];
  const ST = { pending: ['Pendente', 'warn'], processing: ['Em processamento', 'info'], completed: ['Concluído', 'ok'], canceled: ['Cancelado', 'bad'], closed: ['Fechado', 'mute'], approved: ['Aprovado', 'ok'], declined: ['Recusado', 'bad'], received: ['Recebido', 'info'], resolved: ['Resolvido', 'ok'] };
  const pill = (s) => { const m = ST[s] || [s, 'mute']; return '<span class="d-st d-st-' + m[1] + '">' + esc(m[0]) + '</span>'; };
  const accHead = (t, actions = '', sub = '') => '<div class="d-acc-h"><div><h2>' + t + '</h2>' + (sub ? '<p>' + sub + '</p>' : '') + '</div>' + (actions ? '<div class="d-acc-acts">' + actions + '</div>' : '') + '</div>';
  const btn = (label, attrs, kind = 'line') => '<button type="button" class="d-btn d-btn-' + kind + ' d-btn-md" ' + attrs + '>' + label + '</button>';
  const linkBtn = (label, href, kind = 'line') => '<a class="d-btn d-btn-' + kind + ' d-btn-md" href="' + href + '">' + label + '</a>';
  const emptyAcc = (t, p, cta) => '<div class="d-empty d-empty-sm"><b>' + t + '</b><p>' + p + '</p>' + (cta || '') + '</div>';
  function account(tab, inner) {
    const b = sh.buyer();
    if (!b) { go('#/entrar'); return ''; } // depois de entrar vai para a página inicial (não volta à conta)
    return '<div class="d-phead d-acc-top"><div class="d-wrap"><div class="d-acc-who"><span class="d-av d-av-lg">' + esc(b.name[0]) + '</span><div><h1>Olá, ' + esc(b.name.split(' ')[0]) + '</h1><p>' + esc(b.email) + ' · ' + esc(CK.company) + ' · NUIT ' + esc(CK.nuit) + '</p></div><button type="button" class="d-btn d-btn-o d-btn-md" data-act="logout">Terminar sessão</button></div>' +
      '<nav class="d-pills" aria-label="Secções da conta">' + ACC_TABS.map((t) => '<a href="#/conta' + (t[0] ? '/' + t[0] : '') + '" class="' + (tab === t[0] ? 'on' : '') + '"' + (tab === t[0] ? ' aria-current="page"' : '') + '>' + t[1] + (t[0] === 'desejos' && sh.wish().length ? ' <em>' + sh.wish().length + '</em>' : '') + '</a>').join('') + '</nav></div></div>' +
      '<div class="d-wrap d-acc">' + inner + '</div>';
  }
  /* linha de pedido (painel e lista) */
  const orderRow = (o) => '<a class="d-orow" href="#/conta/pedidos/' + o.id + '"><div class="d-othumbs">' + o.items.slice(0, 3).map((i) => { const p = sh.prod(i.pid); return '<span>' + (p ? pimg(p) : '') + '</span>'; }).join('') + (o.items.length > 3 ? '<span class="d-omore">+' + (o.items.length - 3) + '</span>' : '') + '</div>' +
    '<div class="d-oinfo"><b>' + esc(o.number) + '</b><small>' + date(o.date) + ' · ' + o.items.reduce((s, i) => s + i.qty, 0) + ' un · ' + esc(o.pay || '') + '</small></div>' + pill(o.status) + '<b class="d-ototal">' + money(o.total) + '</b><span class="d-ochev" aria-hidden="true">›</span></a>';
  const trackSteps = (o) => [['Pedido realizado', true], ['Pagamento confirmado', o.status !== 'pending'], ['Em preparação', ['processing', 'completed', 'closed'].includes(o.status)], ['Enviado', o.shipped || ['completed', 'closed'].includes(o.status)], ['Entregue', ['completed', 'closed'].includes(o.status)]];
  const track = (o) => o.status === 'canceled' ? '<div class="d-notice d-notice-bad">Este pedido foi cancelado.</div>' :
    '<ol class="d-track">' + trackSteps(o).map((s, i, a) => { const cur = s[1] && (!a[i + 1] || !a[i + 1][1]); return '<li class="' + (s[1] ? 'done' : '') + (cur ? ' cur' : '') + '"><span>' + (s[1] ? svg('check', 'width:13px;height:13px') : i + 1) + '</span>' + s[0] + '</li>'; }).join('') + '</ol>';

  const accHome = () => {
    const o = myOrders(), live = o.find((x) => ['pending', 'processing'].includes(x.status)), spent = o.filter((x) => ['completed', 'closed'].includes(x.status)).reduce((s, x) => s + x.total, 0);
    const kpi = (n, l, href) => '<a class="d-kpi" href="' + href + '"><b>' + n + '</b><span>' + l + '</span></a>';
    return account('', '<div class="d-acc-grid"><div class="d-acc-col">' +
      '<div class="d-kpis">' + kpi(o.length, 'Pedidos', '#/conta/pedidos') + kpi(o.filter((x) => ['pending', 'processing'].includes(x.status)).length, 'Em curso', '#/conta/pedidos') + kpi(money(spent).replace(',00', ''), 'Total comprado', '#/conta/pedidos') + kpi(sh.wish().length, 'Desejos', '#/conta/desejos') + '</div>' +
      (live ? '<section class="d-box"><div class="d-acc-h"><div><h2>Encomenda em curso</h2><p>' + esc(live.number) + ' · ' + date(live.date) + '</p></div><a class="d-more" href="#/conta/pedidos/' + live.id + '">Ver detalhe</a></div>' + track(live) + '</section>' : '') +
      '<section class="d-box">' + accHead('Pedidos recentes', '<a class="d-more" href="#/conta/pedidos">Ver todos</a>') + '<div class="d-olist">' + o.slice(0, 4).map(orderRow).join('') + '</div></section></div>' +
      '<aside class="d-acc-side"><div class="d-walletcard"><small>Saldo iMali</small><b>' + money(sh.BALANCE) + '</b><div class="d-bar"><i style="width:62%"></i></div><p>Crédito para empresas: <b>250 000 MT</b> disponíveis em 3×</p><div class="d-wc-acts"><a class="d-btn d-btn-lime d-btn-md" href="#/categoria/todos">Comprar</a><button type="button" class="d-btn d-btn-o d-btn-md" data-act="toast" data-msg="Extrato enviado para o seu email (simulação).">Extrato</button></div></div>' +
      '<div class="d-box d-quick"><h2>Atalhos</h2><a href="#/conta/moradas">Moradas de entrega<span>›</span></a><a href="#/conta/perfil">Dados da empresa e NUIT<span>›</span></a><a href="#/conta/devolucoes">Devoluções<span>›</span></a><a href="#/">Pedir cotação<span>›</span></a></div></aside></div>');
  };

  const OS = { st: '', q: '' };
  const ordersFiltered = () => myOrders().filter((o) => (!OS.st || o.status === OS.st) && (!OS.q || o.number.toLowerCase().includes(OS.q.toLowerCase())));
  const ordersPage = () => {
    const all = myOrders(), L = ordersFiltered(), cnt = (s) => all.filter((o) => o.status === s).length;
    return account('pedidos', '<section class="d-box">' + accHead('Pedidos', '', all.length + ' pedidos no total') +
      '<div class="d-otools"><div class="d-tabs">' + [['', 'Todos', all.length], ['pending', 'Pendentes', cnt('pending')], ['processing', 'Em processamento', cnt('processing')], ['completed', 'Concluídos', cnt('completed')], ['canceled', 'Cancelados', cnt('canceled')]].filter((x) => !x[0] || x[2]).map((x) => '<button type="button" class="' + (OS.st === x[0] ? 'on' : '') + '" data-act="o-st" data-s="' + x[0] + '">' + x[1] + ' <small>' + x[2] + '</small></button>').join('') + '</div>' +
      '<label class="d-osearch">' + svg('search', 'width:17px;height:17px') + '<span class="d-sr">Pesquisar pedido</span><input type="search" placeholder="Nº do pedido" value="' + esc(OS.q) + '" data-oq></label></div>' +
      '<div class="d-olist" id="d-olist">' + (L.length ? L.map(orderRow).join('') : emptyAcc('Nenhum pedido encontrado', 'Ajuste o filtro ou a pesquisa.')) + '</div></section>');
  };
  ACT['o-st'] = (el) => { OS.st = el.dataset.s; re(); };
  document.addEventListener('input', (e) => { if (e.target.dataset && e.target.dataset.oq !== undefined) { OS.q = e.target.value; const l = $('#d-olist'); if (l) { const L = ordersFiltered(); l.innerHTML = L.length ? L.map(orderRow).join('') : emptyAcc('Nenhum pedido encontrado', 'Ajuste o filtro ou a pesquisa.'); } } });

  function orderView({ params }) {
    const o = myOrders().find((x) => String(x.id) === params.id);
    if (!o) return account('pedidos', emptyAcc('Pedido não encontrado', 'Pode ter sido removido.', linkBtn('Ver pedidos', '#/conta/pedidos', 'dark')));
    const bySeller = [...new Set(o.items.map((i) => i.seller))];
    const acts = (['pending', 'processing'].includes(o.status) ? btn('Cancelar pedido', 'data-act="confirm-toast" data-q="Cancelar o pedido ' + o.number + '?" data-msg="Pedido cancelado." data-danger="1" data-ok="Cancelar pedido"') : '') + btn('Transferir fatura', 'data-act="toast" data-msg="Fatura transferida (simulação)."') + btn('Repetir pedido', 'data-act="reorder" data-id="' + o.id + '"', 'dark');
    return account('pedidos', '<a class="d-back" href="#/conta/pedidos">‹ Todos os pedidos</a>' +
      '<section class="d-box">' + accHead('Pedido ' + esc(o.number) + ' ' + pill(o.status), acts, 'Realizado a ' + date(o.date) + ' · ' + esc(o.pay || '')) + track(o) + '</section>' +
      '<div class="d-acc-grid"><div class="d-acc-col">' + bySeller.map((sid) => { const s = byId(D.sellers, sid); return '<section class="d-box d-cgroup"><header><span class="d-av" style="background:' + s.color + '">' + esc(s.shop[0]) + '</span><div><b>' + esc(s.shop) + '</b><span class="d-ver">' + svg('check') + 'Fornecedor verificado · ' + esc(s.city) + '</span></div><button type="button" class="d-link" data-act="contact-seller" data-id="' + s.id + '">Contactar</button></header>' +
        o.items.filter((i) => i.seller === sid).map((i) => { const p = sh.prod(i.pid); return '<div class="d-cline"><a class="d-cimg" href="#/produto/' + i.pid + '">' + (p ? pimg(p) : '') + '</a><div class="d-cinfo"><a href="#/produto/' + i.pid + '"><b>' + esc(i.name) + '</b></a><div class="d-cunit">' + (p ? p.sku + ' · ' : '') + money(i.price) + ' / un · ' + i.qty + ' un</div>' +
          (['completed', 'closed'].includes(o.status) ? '<div class="d-cacts2"><a class="d-link" href="#/conta/devolucoes/nova/' + o.id + '">Pedir devolução</a><button type="button" class="d-link d-link-mut" data-act="write-review">Avaliar</button></div>' : '') + '</div><div class="d-cprice"><b>' + money(i.qty * i.price) + '</b></div></div>'; }).join('') + '</section>'; }).join('') + '</div>' +
      '<aside class="d-acc-side"><div class="d-sum"><h2>Resumo</h2>' + sumRow('Subtotal', money(o.sub)) + sumRow('Envio', o.ship ? money(o.ship) : 'Grátis', o.ship ? '' : 'free') + sumRow('IVA (16%)', money(o.tax)) + '<div class="d-stotal"><span>Total</span><b>' + money(o.total) + '</b></div>' +
      '<div class="d-okgrid d-okgrid-1"><div><small>Faturado a</small><b>' + esc(CK.company) + '</b><small>NUIT ' + esc(CK.nuit) + '</small></div><div><small>Entrega</small><b>' + esc(D.addresses[0].name) + '</b><small>' + esc(D.addresses[0].line + ', ' + D.addresses[0].city) + '</small></div></div></div></aside></div>');
  }
  ACT['reorder'] = (el) => { const o = myOrders().find((x) => String(x.id) === el.dataset.id); o.items.forEach((i) => sh.addToCart(i.pid, i.qty)); toast('Produtos adicionados ao carrinho.'); go('#/carrinho'); };

  const profile = () => {
    const b = sh.buyer(), n = b.name.split(' ');
    const dl = (rows) => '<dl class="d-specs d-specs-1">' + rows.map((x) => '<div><dt>' + x[0] + '</dt><dd>' + esc(x[1]) + '</dd></div>').join('') + '</dl>';
    return account('perfil', '<div class="d-acc-grid d-acc-grid-2"><section class="d-box">' + accHead('Dados pessoais', btn('Editar', 'data-act="prof-edit"')) + dl([['Nome', n[0]], ['Apelido', n.slice(1).join(' ') || '—'], ['Email', b.email], ['Telefone', b.phone]]) + '</section>' +
      '<section class="d-box">' + accHead('Empresa', btn('Editar', 'data-act="prof-edit"')) + dl([['Empresa', CK.company], ['NUIT', CK.nuit], ['Morada fiscal', D.addresses[0].line + ', ' + D.addresses[0].city], ['Conta iMali', '+258 ' + CK.phone]]) + '</section></div>' +
      '<section class="d-box d-danger">' + accHead('Eliminar conta', btn('Eliminar conta', 'data-act="confirm-toast" data-q="Eliminar a sua conta? Esta ação é irreversível." data-msg="Pedido de eliminação registado." data-danger="1" data-ok="Eliminar conta"', 'danger'), 'Remove os seus dados pessoais. Os pedidos e as faturas são mantidos pelo período legal.') + '</section>');
  };
  ACT['prof-edit'] = () => { const b = sh.buyer(); openModal({ title: 'Editar perfil', body: mf('Perfil atualizado com sucesso.', ICA.fields([{ name: 'first', label: 'Nome', value: b.name.split(' ')[0] }, { name: 'last', label: 'Apelido', value: b.name.split(' ').slice(1).join(' ') }, { name: 'email', label: 'Email', type: 'email', value: b.email, span: 2 }, { name: 'phone', label: 'Telefone', value: b.phone }, { name: 'nuit', label: 'NUIT', value: CK.nuit }, { name: 'company', label: 'Empresa', value: CK.company, span: 2 }]), 'Guardar') }); };

  const addresses = () => account('moradas', '<section class="d-box">' + accHead('Moradas de entrega', btn('+ Nova morada', 'data-act="addr-new"', 'dark'), 'Escolha a morada no checkout de cada pedido.') +
    '<div class="d-opts d-opts-3">' + D.addresses.map((a) => '<div class="d-opt d-addr' + (a.def ? ' on' : '') + '"><span><b>' + esc(a.name) + (a.def ? ' <em class="d-tag">Predefinida</em>' : '') + '</b><small>' + esc(a.line) + '</small><small>' + esc(a.city) + ' · ' + esc(a.province) + '</small><small>' + esc(a.phone) + '</small><span class="d-addr-acts"><button type="button" class="d-link" data-act="addr-new">Editar</button>' + (a.def ? '' : '<button type="button" class="d-link d-link-mut" data-act="toast" data-msg="Morada definida como predefinida.">Tornar predefinida</button><button type="button" class="d-link d-link-del" data-act="confirm-toast" data-q="Remover a morada ' + esc(a.name) + '?" data-msg="Morada removida." data-danger="1" data-ok="Remover">Remover</button>') + '</span></span></div>').join('') + '</div></section>');

  const wishlist = () => { const L = sh.wish().map(sh.prod).filter((p) => p && p.status === 'approved');
    return account('desejos', '<section class="d-box">' + accHead('Lista de desejos', L.length ? btn('Limpar lista', 'data-act="wish-clear"') : '', L.length + (L.length === 1 ? ' produto guardado' : ' produtos guardados')) +
      (L.length ? '<div class="d-pgrid">' + L.map(sh.dcard).join('') + '</div>' : emptyAcc('A sua lista está vazia', 'Toque no coração de um produto para o guardar aqui.', linkBtn('Explorar o catálogo', '#/categoria/todos', 'dark'))) + '</section>'); };
  ACT['wish-clear'] = () => ICA.confirmBox('Remover todos os produtos da lista de desejos?', () => { S.set('wishlist', []); sh.updateHeader(); toast('Lista de desejos limpa.', 'info'); re(); }, { danger: true, okLabel: 'Limpar lista' });

  const reviewsPage = () => { const L = D.reviews.filter((r) => r.customer === 'Ana Machava' || r.id % 5 === 0).slice(0, 5);
    return account('avaliacoes', '<section class="d-box">' + accHead('As minhas avaliações', '', L.length + ' avaliações') + '<div class="d-rlist">' + L.map((r) => { const p = sh.prod(r.pid);
      return '<article class="d-rev d-rev-acc"><a class="d-cimg" href="#/produto/' + r.pid + '">' + (p ? pimg(p) : '') + '</a><div><div class="d-rev-h"><div><b>' + esc(r.product) + '</b><small>' + date(r.date) + '</small></div>' + pill(r.status) + '</div><span class="d-stars">' + [1, 2, 3, 4, 5].map((i) => '<i class="' + (i <= Math.round(r.rating) ? 'on' : '') + '">★</i>').join('') + '</span><p>' + esc(r.comment) + '</p></div></article>'; }).join('') + '</div></section>'); };

  const rmaList = () => { const L = D.rma.slice(0, 5);
    return account('devolucoes', '<section class="d-box">' + accHead('Devoluções', linkBtn('+ Novo pedido', '#/conta/devolucoes/nova/' + D.orders[2].id, 'dark'), 'Pedidos de devolução, troca ou reparação.') +
      '<div class="d-olist">' + L.map((r) => '<div class="d-orow d-orow-static"><div class="d-oinfo"><b>' + esc(r.id) + ' · ' + esc(r.product) + '</b><small>Pedido ' + esc(r.order) + ' · ' + esc(r.reason) + ' · ' + date(r.date) + '</small></div>' + pill(r.status) + '<button type="button" class="d-btn d-btn-line d-btn-md" data-act="rma-chat" data-id="' + esc(r.id) + '">Conversa</button></div>').join('') + '</div></section>'); };
  ACT['rma-chat'] = (el) => openModal({ title: 'Conversa ' + el.dataset.id, body: '<div class="d-chat"><div class="them">Olá, recebemos o seu pedido de devolução e estamos a analisar.<small>Fornecedor · ontem</small></div><div class="me">Obrigada. Anexei fotografias do dano.<small>Eu · ontem</small></div><div class="them">Aprovado. Pode entregar o artigo no armazém da Matola.<small>Fornecedor · hoje</small></div></div>' + mf('Mensagem enviada.', ICA.fields([{ name: 'msg', label: 'Mensagem', type: 'textarea', rows: 3, span: 2, required: true }]), 'Enviar') });
  const rmaNew = ({ params }) => { const o = myOrders().find((x) => String(x.id) === params.id) || D.orders[2];
    return account('devolucoes', '<a class="d-back" href="#/conta/devolucoes">‹ Devoluções</a><section class="d-box d-form">' + accHead('Pedido de devolução', '', 'Pedido ' + esc(o.number) + ' · ' + date(o.date)) +
      '<form data-msg="Pedido de devolução submetido. O fornecedor responde em 48 h." data-go="#/conta/devolucoes">' + ICA.fields([{ name: 'item', label: 'Produto', type: 'select', options: o.items.map((i) => i.name), span: 2 }, { name: 'qty', label: 'Quantidade', type: 'number', value: 1 }, { name: 'reason', label: 'Motivo', type: 'select', options: D.rmaReasons }, { name: 'res', label: 'Resolução pretendida', type: 'select', options: ['Reembolso', 'Troca', 'Reparação'] }, { name: 'pics', label: 'Fotografias', type: 'file', hint: 'PNG ou JPG até 5 MB' }, { name: 'det', label: 'Descrição do problema', type: 'textarea', span: 2, required: true }]) +
      '<div class="d-form-acts"><a class="d-btn d-btn-line d-btn-md" href="#/conta/devolucoes">Cancelar</a><button class="d-btn d-btn-dark d-btn-md">Submeter pedido</button></div></form></section>'); };

  const downloads = () => account('downloads', '<section class="d-box">' + accHead('Downloads', '', 'Fichas técnicas e manuais dos produtos que comprou.') + '<div class="d-olist">' +
    D.products.slice(5, 11).map((p, i) => '<div class="d-orow d-orow-static"><span class="d-filemark">PDF</span><div class="d-oinfo"><b>Ficha técnica — ' + esc(p.name) + '</b><small>' + (1.2 + i * 0.4).toFixed(1).replace('.', ',') + ' MB · ' + date(D.util.daysAgo(i * 4 + 2)) + '</small></div><button type="button" class="d-btn d-btn-line d-btn-md" data-act="toast" data-msg="Download iniciado (simulação).">Transferir</button></div>').join('') + '</div></section>');

  const gdpr = () => account('privacidade', '<section class="d-box">' + accHead('Privacidade e dados', btn('+ Novo pedido', 'data-act="gdpr-new"', 'dark'), 'Peça uma cópia dos seus dados ou a eliminação, nos termos da lei de proteção de dados.') + '<div class="d-olist">' +
    [{ type: 'Exportação de dados', date: D.util.daysAgo(12), status: 'completed' }, { type: 'Eliminação de dados', date: D.util.daysAgo(40), status: 'pending' }].map((r) => '<div class="d-orow d-orow-static"><div class="d-oinfo"><b>' + r.type + '</b><small>Pedido a ' + date(r.date) + '</small></div>' + pill(r.status) + (r.status === 'completed' ? '<button type="button" class="d-btn d-btn-line d-btn-md" data-act="toast" data-msg="Ficheiro transferido (simulação).">Transferir</button>' : '<span></span>') + '</div>').join('') + '</div></section>');
  ACT['gdpr-new'] = () => openModal({ title: 'Novo pedido de privacidade', body: mf('Pedido registado. Receberá um email em 48 h.', ICA.fields([{ name: 't', label: 'Tipo', type: 'select', options: ['Exportação de dados', 'Eliminação de dados'], span: 2 }, { name: 'm', label: 'Mensagem', type: 'textarea', span: 2 }]), 'Submeter') });

  /* ---------- Comparação ---------- */
  function compare() {
    const L = sh.cmp().map(sh.prod).filter(Boolean);
    if (!L.length) return '<div class="container px-[60px] max-lg:px-8">' + sh.emptyBox('Nada para comparar. Use o ícone de comparar nos produtos.') + '</div>';
    const row = (label, f) => '<tr><td class="border px-4 py-3 font-medium bg-zinc-100 align-top">' + label + '</td>' + L.map((p) => '<td class="border px-4 py-3 align-top">' + f(p) + '</td>').join('') + '</tr>';
    return '<div class="container px-[60px] max-lg:px-8 max-md:px-4 py-10"><h1 class="mb-6 text-3xl font-dmserif max-sm:text-xl">Comparar produtos</h1><div class="overflow-x-auto"><table class="w-full border-collapse text-left"><tbody>' + row('Produto', (p) => '<a href="#/produto/' + p.id + '">' + pimg(p, 'mb-2 h-[120px] w-[120px] rounded-xl object-cover') + '<b>' + esc(p.name) + '</b></a>') + row('Preço', (p) => '<b>' + money(p.price) + '</b>') + row('Avaliação', (p) => sh.stars(p.rating) + ' ' + p.rating) + row('Vendedor', (p) => esc(sh.sellerOf(p).shop)) + row('Categoria', (p) => esc(p.catName)) + row('Stock', (p) => p.stock + ' un') + row('Garantia', (p) => esc(p.specs.find((s) => s[0] === 'Garantia')[1])) + row('', (p) => '<button class="primary-button px-4 py-2 text-sm" data-act="add-cart" data-pid="' + p.id + '">Adicionar</button> <button class="secondary-button px-4 py-2 text-sm" data-act="cmp" data-pid="' + p.id + '">Remover</button>') + '</tbody></table></div></div>';
  }

  Object.assign(sh, { cartPage, checkout, waiting, orderSuccess, loginPage, registerPage, recoverPage, accHome, ordersPage, orderView, profile, addresses, wishlist, reviewsPage, rmaList, rmaNew, downloads, gdpr, compare, loginAs });
})();
