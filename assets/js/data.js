/* Mercado ICA — dados fictícios do protótipo (sem base de dados) */
(function () {
  const ICA = (window.ICA = window.ICA || {});

  // gerador pseudo-aleatório determinístico: o protótipo mostra sempre os mesmos dados
  function rng(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const rand = rng(20260101);
  const pick = (a) => a[Math.floor(rand() * a.length)];
  const between = (a, b) => Math.floor(a + rand() * (b - a + 1));
  const daysAgo = (n) => { const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString(); };

  /* ---------- Categorias ---------- */
  const categories = [
    { id: 1, slug: 'construcao-civil', name: 'Construção Civil', emoji: '🏗️', color: '#f59e0b', subs: ['Cimento & Argamassas', 'Ferro & Aço', 'Acabamentos'] },
    { id: 2, slug: 'maquinario-pesado', name: 'Maquinário Pesado', emoji: '🚜', color: '#ea580c', subs: ['Escavadoras', 'Geradores', 'Compactadores'] },
    { id: 3, slug: 'eletronicos-ti', name: 'Eletrónicos & TI', emoji: '💻', color: '#2563eb', subs: ['Portáteis', 'Redes', 'Periféricos'] },
    { id: 4, slug: 'logistica-frota', name: 'Logística & Frota', emoji: '🚚', color: '#7c3aed', subs: ['Veículos', 'Armazenagem', 'Rastreio'] },
    { id: 5, slug: 'energia-solar', name: 'Energia Solar', emoji: '☀️', color: '#eab308', subs: ['Painéis', 'Inversores', 'Baterias'] },
    { id: 6, slug: 'automacao', name: 'Automação', emoji: '⚙️', color: '#0d9488', subs: ['Controladores', 'Sensores', 'Motores'] },
  ];

  /* ---------- Vendedores (os "clientes" do painel Cliente) ---------- */
  const sellers = [
    { id: 1, shop: 'Beira Construções, Lda', owner: 'Hélder Nhamussua', city: 'Beira', email: 'geral@beiraconstrucoes.co.mz', phone: '+258 84 311 2200', since: '2023', status: 'approved', rating: 4.7, color: '#f59e0b', about: 'Materiais de construção para obras residenciais e industriais no centro do país, com entrega em 48h.' },
    { id: 2, shop: 'Maputo Heavy Machinery', owner: 'Teresa Cumbe', city: 'Maputo', email: 'vendas@mhm.co.mz', phone: '+258 82 455 7781', since: '2022', status: 'approved', rating: 4.8, color: '#ea580c', about: 'Venda e aluguer de maquinário pesado, geradores e peças originais com assistência técnica.' },
    { id: 3, shop: 'TechMoz Solutions', owner: 'Gil Matsinhe', city: 'Maputo', email: 'comercial@techmoz.co.mz', phone: '+258 86 900 1234', since: '2023', status: 'approved', rating: 4.5, color: '#2563eb', about: 'Equipamento informático, redes e servidores para empresas e instituições públicas.' },
    { id: 4, shop: 'LogiNorte Transportes', owner: 'Amélia Saize', city: 'Nampula', email: 'frota@loginorte.co.mz', phone: '+258 85 220 9087', since: '2024', status: 'approved', rating: 4.3, color: '#7c3aed', about: 'Veículos comerciais, empilhadoras e soluções de rastreio de frota para o corredor de Nacala.' },
    { id: 5, shop: 'SolarÁfrica Moçambique', owner: 'Nelson Chissano', city: 'Maputo', email: 'info@solarafrica.co.mz', phone: '+258 84 777 6543', since: '2022', status: 'approved', rating: 4.9, color: '#eab308', about: 'Kits solares, inversores e baterias de lítio com instalação certificada em todo o país.' },
    { id: 6, shop: 'AutoMat Industrial', owner: 'Zélia Mondlane', city: 'Matola', email: 'tecnico@automat.co.mz', phone: '+258 87 120 3340', since: '2024', status: 'pending', rating: 0, color: '#0d9488', about: 'Automação industrial, PLCs, sensores e motores para fábricas e agroindústria.' },
  ];

  /* ---------- Produtos ---------- */
  // [nome, categoria, subcategoria(índice), preço, emoji, vendedor, preço antigo (opcional)]
  const P = [
    ['Cimento Portland CEM II 42,5N (saco 50 kg)', 1, 0, 620, '🧱', 1],
    ['Varão de Aço Nervurado 12 mm (barra 12 m)', 1, 1, 1450, '🔩', 1, 1650],
    ['Tijolo Furado 15×20×40 (palete 200 un)', 1, 0, 8900, '🧱', 1],
    ['Tinta Acrílica Premium Exterior 20 L', 1, 2, 4200, '🎨', 1, 4800],
    ['Chapa Zincada Ondulada 3 m', 1, 1, 980, '🏠', 1],
    ['Betoneira Elétrica 400 L', 2, 2, 38500, '🏗️', 2],
    ['Escavadora Hidráulica 20 T', 2, 0, 4850000, '🚜', 2, 5200000],
    ['Mini-Carregadora Skid Steer', 2, 0, 1980000, '🚜', 2],
    ['Gerador Diesel Silencioso 100 kVA', 2, 1, 685000, '⚡', 2, 740000],
    ['Rolo Compactador Vibratório 7 T', 2, 2, 2350000, '🛞', 2],
    ['Martelo Demolidor Hidráulico', 2, 0, 128000, '🔨', 2],
    ['Portátil ProBook 15" i7 / 16 GB / 512 GB', 3, 0, 32900, '💻', 3, 36500],
    ['Router Wi-Fi 6 Dual Band AX3000', 3, 1, 4750, '📡', 3],
    ['Switch Gigabit 24 Portas Gerível', 3, 1, 18900, '🔌', 3],
    ['Impressora Multifunções Laser A4', 3, 2, 14500, '🖨️', 3, 16200],
    ['Monitor 27" 4K IPS', 3, 2, 21400, '🖥️', 3],
    ['Servidor Rack 2U Xeon 64 GB', 3, 1, 295000, '🗄️', 3],
    ['UPS Online 3 kVA', 3, 2, 42000, '🔋', 3],
    ['Camião Basculante 6×4 — 20 m³', 4, 0, 5200000, '🚚', 4],
    ['Empilhadora Elétrica 2,5 T', 4, 1, 890000, '🏭', 4, 950000],
    ['Porta-Paletes Manual 2,5 T', 4, 1, 17800, '📦', 4],
    ['Rastreador GPS para Frota 4G', 4, 2, 3250, '📍', 4],
    ['Estante Industrial Metálica 5 Níveis', 4, 1, 9600, '🗃️', 4],
    ['Pickup 4×4 Cabine Dupla Diesel', 4, 0, 2150000, '🛻', 4, 2300000],
    ['Painel Solar 550 W Monocristalino', 5, 0, 9800, '☀️', 5],
    ['Inversor Híbrido 5 kW', 5, 1, 62000, '🔆', 5, 68000],
    ['Bateria de Lítio 5 kWh (LiFePO4)', 5, 2, 118000, '🔋', 5],
    ['Kit Solar Residencial 3 kW Completo', 5, 0, 215000, '🏡', 5, 240000],
    ['Bomba Solar Submersível 1 HP', 5, 0, 48500, '💧', 5],
    ['Candeeiro Solar LED Rua 100 W', 5, 0, 3900, '💡', 5],
    ['PLC Compacto 24 E/S Digitais', 6, 0, 36800, '🎛️', 6],
    ['Sensor Indutivo M18 PNP', 6, 1, 1250, '🔘', 6],
    ['Motor Trifásico 7,5 kW IE3', 6, 2, 28900, '⚙️', 6, 31500],
    ['Variador de Frequência 11 kW', 6, 0, 41200, '🎚️', 6],
    ['Painel HMI Touch 7"', 6, 0, 24300, '📟', 6],
    ['Câmara Térmica Industrial', 6, 1, 156000, '🌡️', 6],
  ];

  const specsByCat = {
    1: [['Origem', 'Moçambique'], ['Norma', 'EN / ISO'], ['Embalagem', 'Unidade / palete'], ['Garantia', '12 meses']],
    2: [['Condição', 'Novo, com certificado'], ['Potência', 'Conforme ficha técnica'], ['Garantia', '24 meses'], ['Assistência', 'Incluída (1.º ano)']],
    3: [['Garantia', '24 meses'], ['Conectividade', 'Gigabit / Wi-Fi 6'], ['Origem', 'Importado'], ['Fatura', 'Com IVA']],
    4: [['Condição', 'Novo'], ['Capacidade', 'Conforme modelo'], ['Garantia', '24 meses'], ['Entrega', 'Todo o país']],
    5: [['Eficiência', '≥ 21%'], ['Vida útil', '25 anos'], ['Garantia', '10 anos'], ['Instalação', 'Opcional']],
    6: [['Tensão', '24 V DC / 400 V AC'], ['Proteção', 'IP65'], ['Garantia', '18 meses'], ['Certificação', 'CE']],
  };

  const products = P.map((p, i) => {
    const id = i + 1;
    const cat = categories.find((c) => c.id === p[1]);
    const stock = i % 11 === 0 ? between(1, 4) : between(6, 240);
    return {
      id, sku: 'ICA-' + String(1000 + id), slug: 'produto-' + id,
      name: p[0], cat: p[1], catName: cat.name, sub: cat.subs[p[2]], price: p[3], oldPrice: p[6] || null,
      emoji: p[4], color: cat.color, seller: p[5], stock, rating: +(3.9 + rand() * 1.1).toFixed(1), reviews: between(3, 64),
      status: p[5] === 6 ? 'pending' : 'approved',
      tags: [i % 4 === 0 ? 'novo' : '', p[6] ? 'oportunidade' : '', i % 5 === 1 ? 'maisvendido' : ''].filter(Boolean),
      desc: 'Equipamento profissional da categoria ' + cat.name + ', fornecido com fatura, garantia e suporte técnico local. Ideal para obras, indústria e empresas que precisam de fiabilidade no dia a dia.',
      specs: specsByCat[p[1]], sold: between(4, 180),
    };
  });

  /* ---------- Clientes (compradores) ---------- */
  const customerNames = ['Ana Machava', 'Carlos Sitoe', 'Beatriz Langa', 'Dércio Tembe', 'Eulália Mabunda', 'Fernando Cossa', 'Graça Muianga', 'Hugo Bila', 'Inês Chongo', 'João Zimba', 'Lídia Nhantumbo', 'Mário Guambe', 'Neusa Maculuve', 'Osvaldo Tivane'];
  const groups = ['Geral', 'Empresas', 'Grossistas', 'Institucional'];
  const customers = customerNames.map((n, i) => ({
    id: i + 1, name: n, email: n.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ /g, '.') + '@exemplo.co.mz',
    phone: '+258 8' + between(2, 7) + ' ' + between(100, 999) + ' ' + between(1000, 9999),
    group: i % 4 === 0 ? 'Empresas' : i % 5 === 0 ? 'Grossistas' : i % 7 === 0 ? 'Institucional' : 'Geral',
    city: pick(['Maputo', 'Matola', 'Beira', 'Nampula', 'Quelimane', 'Tete', 'Pemba']),
    status: i === 9 ? 'inactive' : 'active', joined: daysAgo(between(20, 400)), orders: between(1, 12), spent: between(5, 90) * 10000,
  }));

  /* ---------- Encomendas ---------- */
  const payMethods = ['M-Pesa', 'e-Mola', 'mKesh', 'iMali Way', 'Cartão', 'Pagamento na entrega'];
  const orderStatuses = ['pending', 'processing', 'completed', 'completed', 'completed', 'canceled', 'closed'];
  const orders = [];
  for (let i = 0; i < 32; i++) {
    const n = between(1, 3), items = [];
    for (let k = 0; k < n; k++) {
      const pr = pick(products.filter((x) => x.price < 3000000));
      items.push({ pid: pr.id, name: pr.name, qty: between(1, 4), price: pr.price, seller: pr.seller, emoji: pr.emoji, color: pr.color });
    }
    const sub = items.reduce((s, x) => s + x.qty * x.price, 0);
    const ship = sub > 100000 ? 0 : 1500, tax = Math.round(sub * 0.16);
    const cu = customers[i % customers.length];
    orders.push({
      id: 1042 - i, number: 'ICA-' + (100420 - i * 3), date: daysAgo(i * 2 + between(0, 1)), customer: cu.name, customerId: cu.id, email: cu.email,
      status: orderStatuses[i % orderStatuses.length], pay: payMethods[i % payMethods.length], items, sub, ship, tax, total: sub + ship + tax,
      city: cu.city, invoiced: i % 3 !== 0, shipped: i % 3 === 2,
    });
  }

  /* ---------- Avaliações ---------- */
  const comments = ['Entrega rápida e produto conforme descrito.', 'Excelente relação qualidade/preço. Recomendo.', 'Vendedor atencioso, tirou todas as dúvidas.', 'Chegou bem embalado e com fatura.', 'Bom produto, mas a entrega atrasou um dia.', 'Já é a segunda compra, tudo perfeito.', 'Qualidade acima do esperado para o preço.'];
  const reviews = [];
  for (let i = 0; i < 26; i++) {
    const pr = products[i % products.length], cu = customers[(i * 3) % customers.length];
    reviews.push({ id: i + 1, pid: pr.id, product: pr.name, customer: cu.name, rating: between(3, 5), title: pick(['Muito satisfeito', 'Recomendo', 'Cumpre o prometido', 'Bom negócio', 'Ótima compra']), comment: pick(comments), date: daysAgo(between(1, 120)), status: i % 6 === 5 ? 'pending' : 'approved', seller: pr.seller });
  }

  /* ---------- Moradas, cupões, CMS ---------- */
  const addresses = [
    { id: 1, name: 'Casa', line: 'Av. Julius Nyerere, 1450', city: 'Maputo', province: 'Maputo Cidade', phone: '+258 84 000 1111', def: true },
    { id: 2, name: 'Armazém', line: 'Zona Industrial da Machava, Lote 22', city: 'Matola', province: 'Maputo Província', phone: '+258 84 000 2222', def: false },
    { id: 3, name: 'Obra Beira', line: 'Rua Major Serpa Pinto, 87', city: 'Beira', province: 'Sofala', phone: '+258 84 000 3333', def: false },
  ];
  const coupons = [
    { code: 'BEMVINDO10', label: '10% no primeiro pedido', type: 'percent', value: 10 },
    { code: 'ICA500', label: '500 MT de desconto', type: 'fixed', value: 500 },
  ];
  const cmsPages = [
    { id: 1, slug: 'sobre-nos', title: 'Sobre o Mercado ICA', status: 'active', body: 'O Mercado ICA é o marketplace B2B moçambicano que liga fornecedores verificados a empresas, empreiteiros e instituições. Reunimos construção, maquinário, tecnologia, logística, energia solar e automação num só lugar, com pagamento por M-Pesa, e-Mola, mKesh e iMali Way.' },
    { id: 2, slug: 'termos', title: 'Termos e Condições', status: 'active', body: 'Ao utilizar a plataforma aceita os termos de compra e venda. Os vendedores são responsáveis pela qualidade e entrega dos produtos; o Mercado ICA garante a mediação do pagamento e a resolução de disputas.' },
    { id: 3, slug: 'privacidade', title: 'Política de Privacidade', status: 'active', body: 'Tratamos os seus dados pessoais de acordo com a legislação moçambicana. Pode solicitar a exportação ou eliminação dos seus dados a qualquer momento na sua conta.' },
    { id: 4, slug: 'devolucoes', title: 'Política de Devoluções', status: 'active', body: 'Pode pedir a devolução (RMA) até 14 dias após a entrega, desde que o produto esteja nas condições originais. O reembolso é feito pelo mesmo meio de pagamento.' },
    { id: 5, slug: 'contactos', title: 'Contactos', status: 'inactive', body: 'Linha de apoio: +258 84 000 0000 · apoio@mercadoica.co.mz · Av. 25 de Setembro, Maputo.' },
  ];

  /* ---------- Painel: transações, pedidos de pagamento, RMA ---------- */
  const transactions = orders.slice(0, 14).map((o, i) => ({ id: 'TX-' + (7700 + i), order: o.number, date: o.date, method: o.pay, amount: o.total, status: i % 5 === 4 ? 'pending' : 'paid', seller: o.items[0].seller }));
  const payoutRequests = sellers.slice(0, 5).flatMap((s, i) => [
    { id: 'PR-' + (300 + i * 2), seller: s.id, shop: s.shop, amount: between(40, 380) * 1000, date: daysAgo(between(1, 20)), status: i % 3 === 0 ? 'pending' : 'paid', method: 'Transferência bancária' },
    { id: 'PR-' + (301 + i * 2), seller: s.id, shop: s.shop, amount: between(40, 380) * 1000, date: daysAgo(between(21, 60)), status: 'paid', method: 'M-Pesa Business' },
  ]);
  const rmaReasons = ['Produto danificado', 'Não corresponde à descrição', 'Entrega incompleta', 'Arrependimento'];
  const rma = orders.slice(0, 8).map((o, i) => ({ id: 'RMA-' + (50 + i), order: o.number, customer: o.customer, product: o.items[0].name, reason: rmaReasons[i % 4], date: daysAgo(i * 3 + 1), status: ['pending', 'approved', 'received', 'resolved', 'declined'][i % 5], seller: o.items[0].seller, qty: 1 }));

  /* ---------- Configurações do admin ---------- */
  const attributes = [
    ['Marca', 'select', true], ['Cor', 'swatch', true], ['Potência (kW)', 'text', false], ['Peso (kg)', 'number', false],
    ['Garantia (meses)', 'number', true], ['Condição', 'select', true], ['Material', 'select', false], ['Tensão', 'select', false],
  ].map((a, i) => ({ id: i + 1, code: a[0].toLowerCase().replace(/[^a-z]+/g, '_'), name: a[0], type: a[1], filterable: a[2], required: i < 2, scope: i % 2 ? 'Canal' : 'Global' }));
  const families = [{ id: 1, name: 'Padrão', attrs: 12 }, { id: 2, name: 'Maquinário', attrs: 18 }, { id: 3, name: 'Eletrónicos', attrs: 15 }, { id: 4, name: 'Energia Solar', attrs: 14 }];
  const locales = [{ id: 1, code: 'pt', name: 'Português', dir: 'LTR' }, { id: 2, code: 'en', name: 'English', dir: 'LTR' }, { id: 3, code: 'es', name: 'Español', dir: 'LTR' }];
  const currencies = [{ id: 1, code: 'MZN', name: 'Metical moçambicano', symbol: 'MT' }, { id: 2, code: 'USD', name: 'Dólar americano', symbol: '$' }, { id: 3, code: 'EUR', name: 'Euro', symbol: '€' }, { id: 4, code: 'ZAR', name: 'Rand sul-africano', symbol: 'R' }];
  const channels = [{ id: 1, code: 'default', name: 'Mercado ICA', host: 'mercadoica.co.mz', locales: 'pt, en', currencies: 'MZN, USD' }];
  const inventorySources = [{ id: 1, code: 'MPT-01', name: 'Armazém Maputo', city: 'Maputo', priority: 1, status: 'active' }, { id: 2, code: 'BEI-01', name: 'Armazém Beira', city: 'Beira', priority: 2, status: 'active' }, { id: 3, code: 'NMP-01', name: 'Armazém Nampula', city: 'Nampula', priority: 3, status: 'inactive' }];
  const taxCategories = [{ id: 1, name: 'IVA Normal', code: 'iva16', desc: 'IVA a 16%', rate: 16 }, { id: 2, name: 'Isento', code: 'iso', desc: 'Bens isentos', rate: 0 }, { id: 3, name: 'IVA Equipamento Solar', code: 'iva-sol', desc: 'Regime especial', rate: 0 }];
  const adminUsers = [
    { id: 1, name: 'Admin ICA', email: 'admin@mercadoica.co.mz', role: 'Administrador', status: 'active', last: daysAgo(0) },
    { id: 2, name: 'Rita Fumo', email: 'rita@mercadoica.co.mz', role: 'Suporte', status: 'active', last: daysAgo(1) },
    { id: 3, name: 'Paulo Manjate', email: 'paulo@mercadoica.co.mz', role: 'Catálogo', status: 'active', last: daysAgo(3) },
    { id: 4, name: 'Sónia Uamusse', email: 'sonia@mercadoica.co.mz', role: 'Financeiro', status: 'inactive', last: daysAgo(40) },
  ];
  const roles = [{ id: 1, name: 'Administrador', perm: 'Todas', users: 1 }, { id: 2, name: 'Suporte', perm: 'Personalizada', users: 1 }, { id: 3, name: 'Catálogo', perm: 'Personalizada', users: 1 }, { id: 4, name: 'Financeiro', perm: 'Personalizada', users: 1 }];
  const cartRules = [
    { id: 1, name: 'Bem-vindo 10%', coupon: 'BEMVINDO10', action: '10% do carrinho', start: '01/01/2026', end: '31/12/2026', status: 'active', used: 142 },
    { id: 2, name: 'Frete grátis > 100.000 MT', coupon: '—', action: 'Envio grátis', start: '01/03/2026', end: '31/12/2026', status: 'active', used: 87 },
    { id: 3, name: 'Desconto ICA 500', coupon: 'ICA500', action: '500 MT fixo', start: '01/06/2026', end: '30/11/2026', status: 'active', used: 31 },
    { id: 4, name: 'Black Friday B2B', coupon: 'BF2026', action: '15% categorias seleccionadas', start: '27/11/2026', end: '30/11/2026', status: 'inactive', used: 0 },
  ];
  const catalogRules = [
    { id: 1, name: 'Promoção Energia Solar', action: '-8% categoria', start: '01/09/2026', end: '31/10/2026', status: 'active', priority: 1 },
    { id: 2, name: 'Desconto Grossistas', action: '-5% grupo Grossistas', start: '01/01/2026', end: '31/12/2026', status: 'active', priority: 2 },
    { id: 3, name: 'Liquidação TI', action: '-12% subcategoria Redes', start: '01/10/2026', end: '15/10/2026', status: 'inactive', priority: 3 },
  ];
  const campaigns = [
    { id: 1, name: 'Lançamento Kits Solares', subject: 'Poupe energia com o novo kit 3 kW', event: 'Aniversário', template: 'Promo verde', status: 'active' },
    { id: 2, name: 'Newsletter Outubro', subject: 'As oportunidades da semana', event: 'Semanal', template: 'Newsletter', status: 'active' },
    { id: 3, name: 'Recuperação de carrinho', subject: 'Esqueceu algo no carrinho?', event: 'Carrinho abandonado', template: 'Lembrete', status: 'inactive' },
  ];
  const subscribers = customers.slice(0, 10).map((c, i) => ({ id: i + 1, email: c.email, name: c.name, subscribed: i % 6 !== 5, date: c.joined }));
  const searchTerms = [['cimento', 312], ['gerador', 245], ['painel solar', 210], ['portátil', 188], ['escavadora', 97], ['plc', 64], ['inversor', 142], ['router', 88]].map((s, i) => ({ id: i + 1, term: s[0], results: between(3, 20), uses: s[1], redirect: i === 2 ? '/categoria/energia-solar' : '—' }));
  const themes = [{ id: 1, name: 'Mercado ICA — Verde', type: 'Tema da loja', status: 'active', sort: 1 }, { id: 2, name: 'Campanha Solar', type: 'Tema da loja', status: 'inactive', sort: 2 }];
  const notifications = [
    { id: 1, text: 'Novo pedido ICA-100420 recebido', time: 'há 5 min', type: 'order' },
    { id: 2, text: 'Vendedor "AutoMat Industrial" aguarda aprovação', time: 'há 1 h', type: 'seller' },
    { id: 3, text: 'Pedido de pagamento PR-300 pendente', time: 'há 3 h', type: 'payment' },
    { id: 4, text: 'Stock baixo: Escavadora Hidráulica 20 T', time: 'ontem', type: 'stock' },
  ];
  const messages = [
    { id: 1, from: 'Ana Machava', subject: 'Prazo de entrega do gerador', text: 'Bom dia, qual é o prazo de entrega para Tete?', date: daysAgo(0), read: false },
    { id: 2, from: 'Carlos Sitoe', subject: 'Pedido de orçamento (10 un)', text: 'Preciso de 10 unidades; existe desconto para quantidade?', date: daysAgo(1), read: false },
    { id: 3, from: 'Beatriz Langa', subject: 'Fatura com NUIT', text: 'Podem emitir a fatura com o NUIT da empresa?', date: daysAgo(3), read: true },
  ];

  Object.assign(ICA, { categories, sellers, products, customers, groups, orders, reviews, addresses, coupons, cmsPages, transactions, payoutRequests, rma, rmaReasons, attributes, families, locales, currencies, channels, inventorySources, taxCategories, adminUsers, roles, cartRules, catalogRules, campaigns, subscribers, searchTerms, themes, notifications, messages, payMethods, util: { rand, pick, between, daysAgo } });
})();
