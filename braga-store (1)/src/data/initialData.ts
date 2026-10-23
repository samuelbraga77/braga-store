import { Product, Category, StoreSettings, InstitutionalContent } from '../types';

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'eletronicos',
    name: 'Eletrônicos & Smart',
    slug: 'eletronicos',
    description: 'Smartwatches, fones de ouvido sem fio, caixas de som e tecnologia.',
    icon: 'Smartphone',
    order: 1
  },
  {
    id: 'casa-cozinha',
    name: 'Casa & Cozinha',
    slug: 'casa-cozinha',
    description: 'Praticidade, eletroportáteis e decoração para o seu lar.',
    icon: 'Home',
    order: 2
  },
  {
    id: 'acessorios',
    name: 'Acessórios & Moda',
    slug: 'acessorios',
    description: 'Bolsas, mochilas antifurto, óculos e relógios elegantes.',
    icon: 'Watch',
    order: 3
  },
  {
    id: 'beleza-saude',
    name: 'Saúde & Cuidados',
    slug: 'beleza-saude',
    description: 'Massageadores, bem-estar pessoal e cuidados corporais.',
    icon: 'Sparkles',
    order: 4
  },
  {
    id: 'ferramentas-auto',
    name: 'Auto & Ferramentas',
    slug: 'ferramentas-auto',
    description: 'Acessórios automotivos, compressores e utilitários.',
    icon: 'Wrench',
    order: 5
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-smartwatch-ultra',
    title: 'Smartwatch Braga Ultra Series 9 com Pulseira Dupla e Monitor Cardíaco',
    slug: 'smartwatch-braga-ultra-series-9',
    description: 'O Smartwatch Ultra Series 9 combina sofisticação e tecnologia de ponta. Tela AMOLED infinita de 2.02 polegadas com alta definição, monitoramento de frequência cardíaca 24h, oxigenação sanguínea, mais de 100 modos esportivos, NFC para abertura de portas, resistência à água IP68 e bateria de longa duração para até 7 dias de uso intenso. Acompanha duas pulseiras intercambiáveis (silicone esportivo e tecido milanês premium).',
    category: 'eletronicos',
    subcategory: 'Smartwatches',
    price: 389.90,
    promoPrice: 249.90,
    mainImage: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=800&q=80'
    ],
    buyUrl: 'https://bragastore.com.br/checkout/smartwatch-ultra',
    status: 'active',
    isFeatured: true,
    isNew: true,
    isPopular: true,
    stockStatus: 'in_stock',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-fone-anc-pro',
    title: 'Fone de Ouvido Bluetooth Pro com Cancelamento Ativo de Ruído (ANC)',
    slug: 'fone-bluetooth-pro-cancelamento-ruido',
    description: 'Imersão acústica pura com drivers dinâmicos de 40mm e tecnologia de Cancelamento Ativo de Ruído Híbrido até 38dB. Conexão Bluetooth 5.3 estável com baixíssima latência, modo transparência para conversas sem tirar o fone, microfones com redução de ruído ambiental por IA para chamadas cristalinas e bateria de 40 horas contínuas de reprodução.',
    category: 'eletronicos',
    subcategory: 'Áudio',
    price: 299.00,
    promoPrice: 189.90,
    mainImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=800&q=80'
    ],
    buyUrl: 'https://bragastore.com.br/checkout/fone-anc-pro',
    status: 'active',
    isFeatured: true,
    isNew: false,
    isPopular: true,
    stockStatus: 'in_stock',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-garrafa-termica-digital',
    title: 'Garrafa Térmica Inteligente em Aço Inox com Display LED de Temperatura',
    slug: 'garrafa-termica-inteligente-led',
    description: 'Mantenha sua bebida na temperatura ideal por até 24 horas fria ou 12 horas quente. Construída em Aço Inoxidável 304 de parede dupla com vácuo térmico, tampa com sensor touch digital LED para visualização instantânea da temperatura e filtro infusor em inox para chás e frutas.',
    category: 'casa-cozinha',
    subcategory: 'Utilidades',
    price: 89.90,
    promoPrice: 59.90,
    mainImage: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=80'
    ],
    buyUrl: 'https://bragastore.com.br/checkout/garrafa-termica',
    status: 'active',
    isFeatured: false,
    isNew: true,
    isPopular: true,
    stockStatus: 'in_stock',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-mochila-antifurto',
    title: 'Mochila Executiva Antifurto Impermeável com Porta USB e Compartimento para Notebook 15.6"',
    slug: 'mochila-executiva-antifurto-impermeavel',
    description: 'Design moderno, ergonômico e seguro para trabalho, viagens e faculdade. Tecido Oxford repelente à água e resistente a arranhões, zíperes reforçados embutidos com trava por segredo numérico TSA, porta USB externa para carregamento prático de celular e alças acolchoadas respiráveis com suporte para mala.',
    category: 'acessorios',
    subcategory: 'Mochilas',
    price: 249.90,
    promoPrice: 169.90,
    mainImage: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=800&q=80'
    ],
    buyUrl: 'https://bragastore.com.br/checkout/mochila-antifurto',
    status: 'active',
    isFeatured: true,
    isNew: false,
    isPopular: true,
    stockStatus: 'in_stock',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-pistola-massagem',
    title: 'Pistola Massageadora Muscular Fascial Profissional 6 Velocidades',
    slug: 'pistola-massageadora-muscular-fascial',
    description: 'Alívio muscular profundo para atletas e bem-estar diário. Motor brushless potente e silencioso com tecnologia QuietGlide, 6 ajustes de intensidade e 4 cabeças de massagem anatômicas específicas para coluna, pernas, ombros e pontos de tensão muscular localizada.',
    category: 'beleza-saude',
    subcategory: 'Massageadores',
    price: 199.00,
    promoPrice: 129.90,
    mainImage: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&w=800&q=80'
    ],
    buyUrl: 'https://bragastore.com.br/checkout/pistola-massagem',
    status: 'active',
    isFeatured: false,
    isNew: true,
    isPopular: false,
    stockStatus: 'in_stock',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-compressor-portatil',
    title: 'Compressor de Ar Digital Portátil Recarregável 150 PSI para Carro e Moto',
    slug: 'compressor-ar-digital-portatil',
    description: 'Indispensável no porta-malas ou na mochila de viagem. Calibre pneus de carros, motocicletas, bicicletas e bolas esportivas em minutos com precisão digital e desligamento automático na pressão pré-definida. Bateria recarregável via USB-C e lanterna de emergência integrada.',
    category: 'ferramentas-auto',
    subcategory: 'Automotivo',
    price: 219.90,
    promoPrice: 149.90,
    mainImage: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=800&q=80'
    ],
    buyUrl: 'https://bragastore.com.br/checkout/compressor-digital',
    status: 'active',
    isFeatured: true,
    isNew: true,
    isPopular: true,
    stockStatus: 'in_stock',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const INITIAL_SETTINGS: StoreSettings = {
  storeName: 'Braga Store',
  slogan: 'Variedades, Inovação e Qualidade com Compra Segura',
  announcement: '🔥 OFERTAS DA SEMANA COM ATÉ 45% OFF + PARCELAMENTO EM ATÉ 12X',
  email: 'atendimento@bragastore.com.br',
  phone: '(11) 98765-4321',
  whatsapp: '5511987654321',
  instagram: '@bragastore_oficial',
  address: 'São Paulo - SP, Atendimento em todo o território nacional',
  cnpj: 'Configurar no Painel Administrativo',
  heroTitle: 'Os Melhores Produtos Selecionados Para o Seu Dia a Dia',
  heroSubtitle: 'Descubra novidades exclusivas em eletrônicos, utilidades para o lar e acessórios com preços imbatíveis e entrega garantida.',
  heroBadge: 'Seleção Premium 2026',
  heroCtaText: 'Explorar Catálogo',
  heroCtaLink: '#produtos',
  heroImageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=85'
};

export const INITIAL_INSTITUTIONAL: InstitutionalContent = {
  about: `A **Braga Store** nasceu com a missão de aproximar produtos inovadores, práticos e de alta qualidade do público brasileiro, eliminando intermediários desnecessários e proporcionando uma experiência de compra transparente e segura.\n\nNosso catálogo é criteriosamente selecionado por especialistas que testam e avaliam cada produto quanto à durabilidade, usabilidade e custo-benefício. Valorizamos a confiança dos nossos clientes acima de tudo, oferecendo suporte humano dedicado e garantias claras.`,
  contact: `Estamos sempre prontos para atender você com agilidade e cordialidade.\n\n**Canais de Atendimento Oficial:**\n- **E-mail:** atendimento@bragastore.com.br\n- **WhatsApp Suporte:** (11) 98765-4321\n- **Horário de Atendimento:** Segunda a Sexta das 08h às 18h e Sábados das 09h às 13h (Horário de Brasília).\n- **Prazo de Resposta:** Até 2 horas em dias úteis.`,
  privacyPolicy: `A Braga Store respeita rigorosamente a sua privacidade e cumpre integralmente as diretrizes da Lei Geral de Proteção de Dados Pessoais (LGPD - Lei nº 13.709/2018).\n\n1. **Coleta de Dados:** Coletamos apenas as informações estritamente necessárias para a navegação eficiente no site e atendimento a solicitações.\n2. **Segurança:** Utilizamos criptografia SSL de ponta a ponta e padrões rígidos de proteção da informação.\n3. **Não Compartilhamento:** Seus dados cadastrais jamais são vendidos, trocados ou disponibilizados a terceiros não autorizados.\n4. **Seus Direitos:** A qualquer momento, você pode solicitar a consulta, atualização ou exclusão definitiva dos seus dados através do nosso e-mail de suporte.`,
  termsOfUse: `Bem-vindo à Braga Store. Ao navegar ou adquirir produtos através de nossa vitrine virtual, você concorda com os seguintes termos:\n\n1. **Natureza dos Produtos:** Todos os itens anunciados contêm descrições detalhadas, especificações técnicas e links diretos para checkout oficial.\n2. **Preços e Promoções:** Os preços promocionais são válidos enquanto durarem os estoques e podem sofrer alterações sem aviso prévio.\n3. **Links Externos de Compra:** O botão de compra direciona o cliente para o ambiente seguro e oficial da plataforma de processamento correspondente, preservando todos os cupons e identificadores configurados.`,
  shippingPolicy: `Entregamos em todo o território nacional através dos Correios e das principais transportadoras privadas parceiras.\n\n1. **Prazo de Postagem:** Os pedidos são despachados em até 1 a 2 dias úteis após a confirmação do pagamento.\n2. **Código de Rastreamento:** Assim que o pacote for postado, o código de rastreamento é enviado diretamente por e-mail e WhatsApp para acompanhamento em tempo real.\n3. **Prazo Médio de Entrega:** Varia de 5 a 14 dias úteis conforme a sua região e a modalidade de frete selecionada.`,
  returnPolicy: `Sua satisfação e tranquilidade são nossas prioridades absolutas.\n\n1. **Direito de Arrependimento:** Conforme o Artigo 49 do Código de Defesa do Consumidor, você possui até 7 (sete) dias corridos após o recebimento da encomenda para solicitar a devolução ou troca sem qualquer custo.\n2. **Defeito ou Avaria:** Se o produto apresentar qualquer vício de fabricação no prazo de até 90 dias, faremos a substituição imediata ou o reembolso integral do valor pago.\n3. **Como Solicitar:** Basta entrar em contato com nosso atendimento pelo WhatsApp ou e-mail com o número do pedido e fotos/vídeo do produto.`
};
