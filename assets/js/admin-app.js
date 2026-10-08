/* Mercado ICA — Administrador: arranque e rotas */
(function () {
  const ICA = window.ICA, ad = ICA.admin;
  ICA.theme = 'admin';
  ICA.seedOnce();
  if (/[?&]demo/.test(location.search)) ICA.S.set('admin', 1); // ?demo inicia a sessão de demonstração
  ICA.createRouter(() => document.getElementById('view') || document.getElementById('app'), [
    ['/entrar', ad.login], ['/', ad.dashboard],
    ['/vendas/pedidos', ad.orders], ['/vendas/pedidos/:id', ad.orderView], ['/vendas/faturas', ad.invoices], ['/vendas/envios', ad.shipments], ['/vendas/reembolsos', ad.refunds], ['/vendas/transacoes', ad.transactions],
    ['/catalogo/produtos', ad.products], ['/catalogo/categorias', ad.categories], ['/catalogo/atributos', ad.attributes], ['/catalogo/familias', ad.families],
    ['/clientes', ad.customers], ['/clientes/grupos', ad.groups], ['/clientes/avaliacoes', ad.reviews], ['/clientes/rgpd', ad.gdpr], ['/clientes/:id', ad.customerView],
    ['/marketplace/vendedores', ad.sellers], ['/marketplace/vendedores/:id', ad.sellerEdit], ['/marketplace/produtos', ad.sellerProducts], ['/marketplace/denuncias', ad.flags], ['/marketplace/pagamentos', ad.payouts], ['/marketplace/avaliacoes', ad.sellerReviews], ['/marketplace/rma', ad.rmaAdmin],
    ['/cms', ad.cms],
    ['/marketing/carrinho', ad.cartRules], ['/marketing/catalogo', ad.catalogRules], ['/marketing/campanhas', ad.campaigns], ['/marketing/subscritores', ad.subscribers], ['/marketing/pesquisa', ad.searchTerms],
    ['/relatorios/vendas', ad.repSales], ['/relatorios/clientes', ad.repCust], ['/relatorios/produtos', ad.repProd],
    ['/definicoes/idiomas', ad.locales], ['/definicoes/moedas', ad.currencies], ['/definicoes/canais', ad.channels], ['/definicoes/armazens', ad.warehouses], ['/definicoes/impostos', ad.taxes], ['/definicoes/utilizadores', ad.users], ['/definicoes/funcoes', ad.roles], ['/definicoes/temas', ad.themes], ['/definicoes/importacoes', ad.imports],
    ['/configuracao', ad.config], ['/perfil', ad.profile], ['/notificacoes', ad.notifications],
  ], {
    before: (path) => ad.ensureShell(path),
    after: (path) => { const c = document.getElementById('imali-auth'); if (c) c.disabled = !['/entrar'].includes(path); ICA.markNav(path); },
    notFound: () => '<div class="empty-state"><h2>Página não encontrada</h2><a class="btn btn-primary" href="#/">Voltar ao dashboard</a></div>',
  });
})();
