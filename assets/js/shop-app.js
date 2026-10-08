/* Mercado ICA — Comprador: arranque e rotas */
(function () {
  const ICA = window.ICA, sh = ICA.shop;
  ICA.theme = 'shop';
  ICA.seedOnce();
  if (/[?&]demo/.test(location.search)) ICA.S.set('buyer', { name: 'Ana Machava', email: 'ana.machava@exemplo.co.mz', phone: '+258 84 000 1111' }); // ?demo inicia a sessão de demonstração
  sh.layout();
  ICA.createRouter(document.getElementById('view'), [
    ['/', sh.home],
    ['/categoria/:slug', sh.listing],
    ['/pesquisa', sh.listing],
    ['/produto/:id', sh.product],
    ['/comparar', sh.compare],
    ['/carrinho', sh.cartPage],
    ['/checkout', sh.checkout],
    ['/pagamento/aguardar', sh.waiting],
    ['/pedido/sucesso', sh.orderSuccess],
    ['/vendedores', sh.sellers],
    ['/vendedor/:id', sh.sellerPage],
    ['/pagina/:slug', sh.cmsPage],
    ['/entrar', sh.loginPage],
    ['/registar', sh.registerPage],
    ['/recuperar', sh.recoverPage],
    ['/conta', sh.accHome],
    ['/conta/perfil', sh.profile],
    ['/conta/moradas', sh.addresses],
    ['/conta/pedidos', sh.ordersPage],
    ['/conta/pedidos/:id', sh.orderView],
    ['/conta/desejos', sh.wishlist],
    ['/conta/avaliacoes', sh.reviewsPage],
    ['/conta/devolucoes', sh.rmaList],
    ['/conta/devolucoes/nova/:id', sh.rmaNew],
    ['/conta/downloads', sh.downloads],
    ['/conta/privacidade', sh.gdpr],
  ], {
    notFound: sh.notFound,
    after: (path) => {
      sh.updateHeader();
      const authCss = document.getElementById('imali-auth'); if (authCss) authCss.disabled = !['/entrar', '/registar', '/recuperar'].includes(path);
    },
  });
})();
