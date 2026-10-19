import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db, auth } from '../firebase/config';
import { handleFirestoreError, OperationType } from '../firebase/errors';
import {
  Product,
  Category,
  Banner,
  StoreSettings,
  InstitutionalPage,
  ContactMessage,
  AuditLog,
  AdminUser,
  Order,
  Review,
} from '../types';

export const INITIAL_ADMIN_EMAIL = 'samuel3266sa@gmail.com';

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  storeName: 'Braga Store',
  tagline: 'Sua loja virtual completa e moderna',
  logoUrl: '',
  faviconUrl: '',
  primaryColor: '#0F172A',
  accentColor: '#2563EB',
  trackingUrl: 'https://app.kaiross.com.br/rastreio',
  cnpj: '66.417.299/0001-92',
  announcementBar: {
    enabled: false,
    text: 'Bem-vindo à Braga Store — confira nossa curadoria de produtos.',
    link: '/produtos',
  },
  contact: {
    email: 'contato@bragastore.com.br',
    phone: '',
    whatsapp: '',
    address: '',
    businessHours: 'Segunda a Sexta, das 09h às 18h',
    instagram: '',
    tiktok: '',
    facebook: '',
  },
  seo: {
    defaultTitle: 'Braga Store — Loja Virtual',
    defaultDescription: 'Loja virtual moderna com catálogo completo, produtos selecionados e as melhores ofertas.',
    googleSearchConsoleTag: '',
    metaKeywords: 'loja virtual, compras, ofertas, braga store, produtos',
  },
  navigation: [
    { id: '1', label: 'Início', url: '/', order: 1, isActive: true },
    { id: '2', label: 'Todos os produtos', url: '/produtos', order: 2, isActive: true },
    { id: '3', label: 'Categorias', url: '/categorias', order: 3, isActive: true },
    { id: '4', label: 'Ofertas', url: '/ofertas', order: 4, isActive: true },
    { id: '5', label: 'Prazo de Entrega', url: '/prazo-entrega', order: 5, isActive: true },
    { id: '6', label: 'Sobre a loja', url: '/sobre', order: 6, isActive: true },
    { id: '7', label: 'Contato', url: '/contato', order: 7, isActive: true },
  ],
  footer: {
    aboutText: 'A Braga Store apresenta uma curadoria de produtos selecionados, conectando você às melhores opções de compra com segurança e conveniência.',
    legalNotice: 'Aviso: As compras são concluídas diretamente no ambiente oficial do vendedor externo parceiro. Preços, condições e estoques estão sujeitos a alterações pelo parceiro.',
    showSocialLinks: true,
  },
};

export const DEFAULT_INSTITUTIONAL_PAGES: InstitutionalPage[] = [
  {
    id: 'sobre',
    slug: 'sobre',
    title: 'Sobre a Braga Store',
    content: `## Bem-vindo à Braga Store\n\nA Braga Store nasceu com o compromisso de trazer uma curadoria refinada de produtos, facilitando sua pesquisa e direcionando para as melhores ofertas disponíveis na internet.\n\n### Nosso Compromisso\n\n- Transparência com nossos clientes e visitantes\n- Direcionamento para lojas oficiais e confiáveis\n- Atualização constante de produtos e categorias`,
    isPublished: true,
    seoTitle: 'Sobre a Loja — Braga Store',
    seoDescription: 'Conheça a história e o compromisso da Braga Store com a curadoria de produtos.',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'termos',
    slug: 'termos',
    title: 'Termos de Uso',
    content: `## Termos de Uso da Braga Store\n\nAo acessar a Braga Store, você concorda em cumprir estes termos de serviço, todas as leis e regulamentos aplicáveis.\n\n### 1. Modelo de Operação\nA Braga Store atua como uma vitrine e catálogo de produtos, direcionando os usuários para sites parceiros e fornecedores oficiais onde a compra é concluída.\n\n### 2. Preços e Estoques\nOs valores e a disponibilidade dos produtos são definidos pelos parceiros e podem sofrer alterações sem prévio aviso.\n\n### 3. Responsabilidade\nNão realizamos cobranças diretas de produtos nesta plataforma. As transações financeiras ocorrem sob a responsabilidade dos ambientes externos parceiros.`,
    isPublished: true,
    seoTitle: 'Termos de Uso — Braga Store',
    seoDescription: 'Confira os termos e condições de uso da Braga Store.',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'privacidade',
    slug: 'privacidade',
    title: 'Política de Privacidade',
    content: `## Política de Privacidade (LGPD)\n\nA sua privacidade é fundamental para a Braga Store. Esta política descreve como tratamos informações neste site em conformidade com a LGPD (Lei Geral de Proteção de Dados).\n\n### 1. Coleta de Informações\nColetamos apenas dados fornecidos voluntariamente através do nosso formulário de contato (nome, e-mail e mensagem).\n\n### 2. Uso dos Dados\nOs dados de contato são utilizados estritamente para responder às dúvidas e solicitações enviadas.\n\n### 3. Seus Direitos\nVocê pode solicitar a qualquer momento a confirmação, correção ou exclusão dos seus dados de contato através dos nossos canais de atendimento.`,
    isPublished: true,
    seoTitle: 'Política de Privacidade — Braga Store',
    seoDescription: 'Saiba como a Braga Store protege seus dados e cumpre a LGPD.',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cookies',
    slug: 'cookies',
    title: 'Política de Cookies',
    content: `## Política de Cookies\n\nUtilizamos cookies essenciais para garantir o funcionamento técnico adequado do site e aprimorar a experiência de navegação do usuário.\n\nVocê pode gerenciar ou desativar os cookies nas configurações do seu navegador a qualquer momento.`,
    isPublished: true,
    seoTitle: 'Política de Cookies — Braga Store',
    seoDescription: 'Informações sobre a utilização de cookies na Braga Store.',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'links-externos',
    slug: 'links-externos',
    title: 'Informações sobre Links Externos e Compras',
    content: `## Transparência sobre Links Externos\n\nAo clicar no botão de compra ou ver produto, você será redirecionado para a página oficial do produto no site parceiro.\n\n- O checkout e o pagamento são processados integralmente na plataforma do vendedor parceiro.\n- Recomendamos sempre conferir os dados da oferta e o prazo de entrega no site de destino antes de finalizar a compra.`,
    isPublished: true,
    seoTitle: 'Links Externos e Compras — Braga Store',
    seoDescription: 'Entenda como funcionam os links e a conclusão de pedidos nos parceiros.',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'trocas-devolucoes',
    slug: 'trocas-devolucoes',
    title: 'Trocas, Devoluções e Reembolsos',
    content: `## Trocas e Devoluções\n\nComo a Braga Store funciona como catálogo e direcionador de compras, os processos de troca, cancelamento, devolução e reembolso devem ser solicitados diretamente junto à loja ou fornecedor onde o pedido foi concluído e faturado.\n\nConsulte os termos específicos da loja parceira informada na nota fiscal da sua compra.`,
    isPublished: true,
    seoTitle: 'Trocas e Devoluções — Braga Store',
    seoDescription: 'Orientações sobre trocas e devoluções em compras realizadas via links externos.',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'faq',
    slug: 'faq',
    title: 'Perguntas Frequentes (FAQ)',
    content: `## Perguntas Frequentes\n\n**1. Como realizo uma compra?**\nBasta escolher o produto desejado e clicar no botão "Comprar no site oficial". Você será direcionado com segurança para o vendedor.\n\n**2. A Braga Store entrega os produtos?**\nA entrega é realizada diretamente pelo parceiro logístico do fornecedor onde a compra foi finalizada.\n\n**3. É seguro comprar pelos links da Braga Store?**\nSim, selecionamos exclusivamente fornecedores reconhecidos e ambientes protegidos com certificado SSL.`,
    isPublished: true,
    seoTitle: 'FAQ — Dúvidas Frequentes — Braga Store',
    seoDescription: 'Respostas para as dúvidas mais comuns sobre o funcionamento da Braga Store.',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prazo-entrega',
    slug: 'prazo-entrega',
    title: 'Prazo de Entrega',
    content: `## Prazo Médio de Entrega: 10 a 15 Dias\n\nNa **Braga Store**, buscamos oferecer a melhor experiência desde a escolha do produto até a chegada na sua casa.\n\n### Como Funciona o Prazo\nO nosso prazo médio de entrega estimado é de **10 a 15 dias**. Por se tratar de um prazo médio estimado, podem ocorrer imprevistos logísticos, variações operacionais de transporte ou situações excepcionais de tráfego que alterem levemente a previsão.\n\n### Teve Algum Problema com sua Entrega?\nSe o seu pedido atrasar ou acontecer algum imprevisto, estamos aqui para ajudar. Acesse o menu da nossa loja, vá até a opção ‘Contato’, localizada no final do menu, e fale conosco para que possamos verificar a situação e ajudar a encontrar uma solução.`,
    isPublished: true,
    seoTitle: 'Prazo de Entrega — Braga Store',
    seoDescription: 'Consulte as informações sobre o prazo médio de entrega de 10 a 15 dias e atendimento ao cliente da Braga Store.',
    updatedAt: new Date().toISOString(),
  },
];

// --- SETTINGS SERVICE ---
export async function getStoreSettings(): Promise<StoreSettings> {
  const path = 'settings/general';
  try {
    const docSnap = await getDoc(doc(db, 'settings', 'general'));
    if (docSnap.exists()) {
      return { ...DEFAULT_STORE_SETTINGS, ...docSnap.data() } as StoreSettings;
    }
    // Return default settings
    return DEFAULT_STORE_SETTINGS;
  } catch (error) {
    console.warn('Could not read settings from Firestore, using defaults:', error);
    return DEFAULT_STORE_SETTINGS;
  }
}

export async function saveStoreSettings(settings: StoreSettings): Promise<void> {
  const path = 'settings/general';
  try {
    await setDoc(doc(db, 'settings', 'general'), {
      ...settings,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// --- INITIAL BOOTSTRAP SEEDER ---
export async function bootstrapStoreIfNeeded(userEmail?: string): Promise<void> {
  try {
    const settingsSnap = await getDoc(doc(db, 'settings', 'general'));
    if (!settingsSnap.exists()) {
      await setDoc(doc(db, 'settings', 'general'), {
        ...DEFAULT_STORE_SETTINGS,
        updatedAt: new Date().toISOString(),
      });
    }

    // Seed institutional pages if not present
    for (const page of DEFAULT_INSTITUTIONAL_PAGES) {
      const pageSnap = await getDoc(doc(db, 'pages', page.id));
      if (!pageSnap.exists()) {
        await setDoc(doc(db, 'pages', page.id), page);
      }
    }

    // Ensure bootstrap admin email is recorded
    if (auth.currentUser && (auth.currentUser.email === INITIAL_ADMIN_EMAIL || userEmail === INITIAL_ADMIN_EMAIL)) {
      const adminRef = doc(db, 'admins', auth.currentUser.uid);
      const adminSnap = await getDoc(adminRef);
      if (!adminSnap.exists()) {
        await setDoc(adminRef, {
          uid: auth.currentUser.uid,
          email: auth.currentUser.email,
          role: 'superadmin',
          createdAt: new Date().toISOString(),
        });
      }
    }
  } catch (error) {
    console.warn('Bootstrap verification note:', error);
  }
}

// --- PRODUCTS SERVICE ---
export async function getProducts(includeDrafts: boolean = false): Promise<Product[]> {
  const path = 'products';
  try {
    const coll = collection(db, 'products');
    const q = includeDrafts ? query(coll) : query(coll, where('status', '==', 'published'));
    const snapshot = await getDocs(q);
    const list: Product[] = [];
    snapshot.forEach(docSnap => {
      list.push(docSnap.data() as Product);
    });
    return list;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  const path = `products/${id}`;
  try {
    const snap = await getDoc(doc(db, 'products', id));
    if (!snap.exists()) return null;
    return snap.data() as Product;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function saveProduct(product: Product): Promise<void> {
  const path = `products/${product.id}`;
  try {
    await setDoc(doc(db, 'products', product.id), {
      ...product,
      updatedAt: new Date().toISOString(),
    });
    await logAuditAction('Salvar Produto', 'product', product.id, `Produto "${product.name}" salvo`);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteProduct(id: string): Promise<void> {
  const path = `products/${id}`;
  try {
    await deleteDoc(doc(db, 'products', id));
    await logAuditAction('Excluir Produto', 'product', id, `Produto ${id} excluído`);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// --- CATEGORIES SERVICE ---
export async function getCategories(includeDrafts: boolean = false): Promise<Category[]> {
  const path = 'categories';
  try {
    const coll = collection(db, 'categories');
    const q = includeDrafts ? query(coll) : query(coll, where('isPublished', '==', true));
    const snapshot = await getDocs(q);
    const list: Category[] = [];
    snapshot.forEach(docSnap => {
      list.push(docSnap.data() as Category);
    });
    return list.sort((a, b) => a.order - b.order);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function saveCategory(category: Category): Promise<void> {
  const path = `categories/${category.id}`;
  try {
    await setDoc(doc(db, 'categories', category.id), {
      ...category,
      updatedAt: new Date().toISOString(),
    });
    await logAuditAction('Salvar Categoria', 'category', category.id, `Categoria "${category.name}" salva`);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteCategory(id: string): Promise<void> {
  const path = `categories/${id}`;
  try {
    await deleteDoc(doc(db, 'categories', id));
    await logAuditAction('Excluir Categoria', 'category', id, `Categoria ${id} excluída`);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// --- BANNERS SERVICE ---
export async function getBanners(includeInactive: boolean = false): Promise<Banner[]> {
  const path = 'banners';
  try {
    const coll = collection(db, 'banners');
    const q = includeInactive ? query(coll) : query(coll, where('isActive', '==', true));
    const snapshot = await getDocs(q);
    const list: Banner[] = [];
    snapshot.forEach(docSnap => {
      list.push(docSnap.data() as Banner);
    });
    return list.sort((a, b) => a.order - b.order);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function saveBanner(banner: Banner): Promise<void> {
  const path = `banners/${banner.id}`;
  try {
    await setDoc(doc(db, 'banners', banner.id), banner);
    await logAuditAction('Salvar Banner', 'banner', banner.id, `Banner "${banner.title}" salvo`);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteBanner(id: string): Promise<void> {
  const path = `banners/${id}`;
  try {
    await deleteDoc(doc(db, 'banners', id));
    await logAuditAction('Excluir Banner', 'banner', id, `Banner ${id} excluído`);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// --- INSTITUTIONAL PAGES SERVICE ---
export async function getPages(includeUnpublished: boolean = false): Promise<InstitutionalPage[]> {
  const path = 'pages';
  try {
    const coll = collection(db, 'pages');
    const q = includeUnpublished ? query(coll) : query(coll, where('isPublished', '==', true));
    const snapshot = await getDocs(q);
    const list: InstitutionalPage[] = [];
    snapshot.forEach(docSnap => {
      list.push(docSnap.data() as InstitutionalPage);
    });
    return list;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function savePage(page: InstitutionalPage): Promise<void> {
  const path = `pages/${page.id}`;
  try {
    await setDoc(doc(db, 'pages', page.id), {
      ...page,
      updatedAt: new Date().toISOString(),
    });
    await logAuditAction('Salvar Página', 'page', page.id, `Página "${page.title}" salva`);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deletePage(id: string): Promise<void> {
  const path = `pages/${id}`;
  try {
    await deleteDoc(doc(db, 'pages', id));
    await logAuditAction('Excluir Página', 'page', id, `Página ${id} excluída`);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// --- CONTACT MESSAGES SERVICE ---
export async function sendContactMessage(message: Omit<ContactMessage, 'id' | 'read' | 'createdAt'>): Promise<string> {
  const id = 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
  const path = `contact_messages/${id}`;
  const fullMessage: ContactMessage = {
    ...message,
    id,
    read: false,
    createdAt: new Date().toISOString(),
  };

  try {
    await setDoc(doc(db, 'contact_messages', id), fullMessage);
    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function getContactMessages(): Promise<ContactMessage[]> {
  const path = 'contact_messages';
  try {
    const coll = collection(db, 'contact_messages');
    const snapshot = await getDocs(coll);
    const list: ContactMessage[] = [];
    snapshot.forEach(docSnap => {
      list.push(docSnap.data() as ContactMessage);
    });
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function markContactMessageRead(id: string, read: boolean = true): Promise<void> {
  const path = `contact_messages/${id}`;
  try {
    const snap = await getDoc(doc(db, 'contact_messages', id));
    if (snap.exists()) {
      await setDoc(doc(db, 'contact_messages', id), { ...snap.data(), read });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteContactMessage(id: string): Promise<void> {
  const path = `contact_messages/${id}`;
  try {
    await deleteDoc(doc(db, 'contact_messages', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// --- ADMIN USERS & AUDIT LOGS ---
export async function getAdminUsers(): Promise<AdminUser[]> {
  const path = 'admins';
  try {
    const coll = collection(db, 'admins');
    const snapshot = await getDocs(coll);
    const list: AdminUser[] = [];
    snapshot.forEach(docSnap => {
      list.push(docSnap.data() as AdminUser);
    });
    return list;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function addAdminUser(email: string, uid?: string): Promise<void> {
  const docId = uid || 'admin_' + email.replace(/[^a-zA-Z0-9]/g, '_');
  const path = `admins/${docId}`;
  try {
    await setDoc(doc(db, 'admins', docId), {
      uid: docId,
      email,
      role: 'admin',
      createdAt: new Date().toISOString(),
    });
    await logAuditAction('Adicionar Administrador', 'admin', docId, `Email ${email} adicionado como admin`);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function removeAdminUser(docId: string): Promise<void> {
  const path = `admins/${docId}`;
  try {
    await deleteDoc(doc(db, 'admins', docId));
    await logAuditAction('Remover Administrador', 'admin', docId, `Administrador ${docId} removido`);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function getAuditLogs(): Promise<AuditLog[]> {
  const path = 'audit_logs';
  try {
    const coll = collection(db, 'audit_logs');
    const snapshot = await getDocs(coll);
    const list: AuditLog[] = [];
    snapshot.forEach(docSnap => {
      list.push(docSnap.data() as AuditLog);
    });
    return list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 100);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function logAuditAction(action: string, targetType: string, targetId: string, details?: string): Promise<void> {
  const id = 'log_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);
  const path = `audit_logs/${id}`;
  try {
    await setDoc(doc(db, 'audit_logs', id), {
      id,
      action: details ? `${action}: ${details}` : action,
      targetType,
      targetId,
      userEmail: auth.currentUser?.email || 'sistema',
      timestamp: new Date().toISOString(),
    });
  } catch (e) {
    console.warn('Audit log write note:', e);
  }
}

// --- ORDERS & DELIVERY LOGISTICS SERVICE ---
export async function getOrders(): Promise<Order[]> {
  const path = 'orders';
  try {
    const coll = collection(db, 'orders');
    const snapshot = await getDocs(coll);
    const list: Order[] = [];
    snapshot.forEach(docSnap => {
      list.push(docSnap.data() as Order);
    });
    return list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function getOrderById(id: string): Promise<Order | null> {
  const path = `orders/${id}`;
  try {
    const snap = await getDoc(doc(db, 'orders', id));
    if (!snap.exists()) return null;
    return snap.data() as Order;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function saveOrder(order: Order): Promise<void> {
  const path = `orders/${order.id}`;
  try {
    await setDoc(doc(db, 'orders', order.id), {
      ...order,
      updatedAt: new Date().toISOString(),
    });
    await logAuditAction('Salvar Pedido', 'order', order.id, `Pedido ${order.orderCode} atualizado`);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function markOrderDelivered(id: string): Promise<void> {
  const path = `orders/${id}`;
  try {
    const snap = await getDoc(doc(db, 'orders', id));
    if (!snap.exists()) throw new Error('Pedido não encontrado.');
    const now = new Date().toISOString();
    await setDoc(doc(db, 'orders', id), {
      ...snap.data(),
      status: 'delivered',
      deliveredAt: now,
      updatedAt: now,
    });
    await logAuditAction('Marcar Entregue', 'order', id, `Pedido ${id} marcado como entregue`);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function attachOrderDeliveryProof(id: string, proofPhotoBase64: string): Promise<void> {
  const path = `orders/${id}`;
  try {
    const snap = await getDoc(doc(db, 'orders', id));
    if (!snap.exists()) throw new Error('Pedido não encontrado.');
    const now = new Date().toISOString();
    await setDoc(doc(db, 'orders', id), {
      ...snap.data(),
      deliveryProofPhoto: proofPhotoBase64,
      deliveryProofUploadedAt: now,
      updatedAt: now,
    });
    await logAuditAction('Anexar Comprovante', 'order', id, `Comprovante fotográfico anexado ao pedido ${id}`);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteOrder(id: string): Promise<void> {
  const path = `orders/${id}`;
  try {
    await deleteDoc(doc(db, 'orders', id));
    await logAuditAction('Excluir Pedido', 'order', id, `Pedido ${id} removido`);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// --- REVIEWS & RATINGS SERVICE ---
export async function getReviews(productId?: string, includeUnapproved: boolean = false): Promise<Review[]> {
  const path = 'reviews';
  try {
    const coll = collection(db, 'reviews');
    const snapshot = await getDocs(coll);
    let list: Review[] = [];
    snapshot.forEach(docSnap => {
      list.push(docSnap.data() as Review);
    });

    if (productId) {
      list = list.filter(r => r.productId === productId);
    }

    if (!includeUnapproved) {
      list = list.filter(r => r.status === 'approved');
    }

    return list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function submitReview(review: Omit<Review, 'id' | 'status' | 'createdAt'>): Promise<string> {
  const id = 'rev_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);
  const path = `reviews/${id}`;
  const fullReview: Review = {
    ...review,
    id,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  try {
    await setDoc(doc(db, 'reviews', id), fullReview);
    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateReviewStatus(id: string, status: 'approved' | 'hidden' | 'pending'): Promise<void> {
  const path = `reviews/${id}`;
  try {
    const snap = await getDoc(doc(db, 'reviews', id));
    if (!snap.exists()) throw new Error('Avaliação não encontrada.');
    const updatedReview = {
      ...snap.data(),
      status,
    };
    await setDoc(doc(db, 'reviews', id), updatedReview);

    // If review has orderId and is approved, update order reviewStatus
    const orderId = snap.data().orderId;
    if (orderId && status === 'approved') {
      const orderRef = doc(db, 'orders', orderId);
      const orderSnap = await getDoc(orderRef);
      if (orderSnap.exists()) {
        await setDoc(orderRef, { ...orderSnap.data(), reviewStatus: 'reviewed' });
      }
    }

    await logAuditAction('Moderar Avaliação', 'review', id, `Avaliação ${id} alterada para ${status}`);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteReview(id: string): Promise<void> {
  const path = `reviews/${id}`;
  try {
    await deleteDoc(doc(db, 'reviews', id));
    await logAuditAction('Excluir Avaliação', 'review', id, `Avaliação ${id} removida`);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

