/* Mercado ICA — Cliente (vendedor): arranque e rotas */
(function () {
  const ICA = window.ICA, sl = ICA.seller;
  ICA.seedOnce();
  const wrap = (fn) => (ctx) => fn(ctx);
  ICA.createRouter(() => document.getElementById('view') || document.getElementById('app'), [
    ['/entrar', sl.login], ['/registar', sl.register], ['/recuperar', sl.recover],
    ['/', sl.dashboard], ['/pedidos', sl.ordersList], ['/pedidos/:id', sl.orderView],
    ['/produtos', sl.products], ['/produtos/novo', sl.productForm], ['/produtos/atribuir', sl.assign], ['/produtos/:id', sl.productForm],
    ['/clientes', sl.customers], ['/reservas', sl.bookings],
    ['/avaliacoes', sl.reviews], ['/avaliacoes-loja', sl.shopReviews],
    ['/transacoes', sl.transactions], ['/pagamentos', sl.payouts],
    ['/devolucoes', sl.rma], ['/devolucoes/:id', sl.rmaView], ['/mensagens', sl.messages],
    ['/relatorios/vendas', sl.repSales], ['/relatorios/clientes', sl.repCust], ['/relatorios/produtos', sl.repProd],
    ['/perfil', sl.profile], ['/notificacoes', sl.notifications],
    ['/definicoes', sl.settings], ['/definicoes/armazens', sl.warehouses], ['/definicoes/utilizadores', sl.users], ['/definicoes/funcoes', sl.roles], ['/definicoes/importar', sl.importPage],
  ].map(([p, f]) => [p, wrap(f)]), { before: (path) => sl.ensureShell(path), after: (path) => ICA.markNav(path) });
})();
