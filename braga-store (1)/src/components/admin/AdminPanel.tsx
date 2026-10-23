import React, { useState } from 'react';
import { 
  Lock, 
  LogOut, 
  Plus, 
  Trash2, 
  Edit, 
  ExternalLink, 
  Link as LinkIcon, 
  Layers, 
  Image as ImageIcon, 
  Settings as SettingsIcon, 
  FileText, 
  Check, 
  AlertCircle, 
  Search, 
  Upload, 
  Eye, 
  Sparkles, 
  ArrowLeft,
  RefreshCw,
  Sliders,
  HelpCircle,
  ShieldCheck,
  CloudUpload,
  Terminal,
  Zap,
  Tag,
  FolderOpen,
  UploadCloud,
  CheckCircle2,
  FileUp,
  ImagePlus,
  Globe
} from 'lucide-react';
import { User } from 'firebase/auth';
import { Product, Category, StoreSettings, InstitutionalContent, ViewRoute } from '../../types';
import { formatCurrencyBRL, slugify } from '../../utils/formatters';
import { compressImageFile } from '../../utils/imageCompressor';
import { 
  loginWithGoogle, 
  logout, 
  checkIsAdmin, 
  saveProductToFirestore, 
  deleteProductFromFirestore,
  saveCategoryToFirestore,
  deleteCategoryFromFirestore,
  saveStoreSettingsToFirestore,
  saveInstitutionalToFirestore
} from '../../lib/firebase';
import { ExtractedProductResult } from '../../server/productExtractor';

interface AdminPanelProps {
  currentUser: User | null;
  products: Product[];
  categories: Category[];
  settings: StoreSettings;
  institutional: InstitutionalContent;
  onRefreshData: () => Promise<void>;
  onNavigate: (route: ViewRoute) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  currentUser,
  products,
  categories,
  settings,
  institutional,
  onRefreshData,
  onNavigate
}) => {
  const isAdmin = checkIsAdmin(currentUser);

  const [activeTab, setActiveTab] = useState<'products' | 'import' | 'new_product' | 'categories' | 'banners' | 'institutional' | 'hosting'>('products');
  const [searchFilter, setSearchFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Edit / Delete Modal State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  // New / Edit Product Form State
  const [productForm, setProductForm] = useState<Partial<Product>>({
    title: '',
    slug: '',
    category: categories[0]?.slug || 'eletronicos',
    subcategory: '',
    price: 0,
    promoPrice: undefined,
    mainImage: '',
    images: [],
    buyUrl: '',
    description: '',
    status: 'active',
    isFeatured: false,
    isNew: true,
    isPopular: false,
    stockStatus: 'in_stock'
  });
  const [newImageUrl, setNewImageUrl] = useState('');
  const [mainImageTab, setMainImageTab] = useState<'file' | 'url'>('file');
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [isDraggingMain, setIsDraggingMain] = useState(false);

  // Import By Link State
  const [importUrl, setImportUrl] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedProductResult | null>(null);

  // Category Form State
  const [categoryForm, setCategoryForm] = useState<Partial<Category>>({
    name: '',
    slug: '',
    description: '',
    icon: 'Sparkles',
    order: (categories.length || 0) + 1
  });
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);

  // Settings State
  const [settingsForm, setSettingsForm] = useState<StoreSettings>({ ...settings });
  const [institutionalForm, setInstitutionalForm] = useState<InstitutionalContent>({ ...institutional });

  const notify = (type: 'success' | 'error', text: string) => {
    setStatusMessage({ type, text });
    setTimeout(() => setStatusMessage(null), 5000);
  };

  // Login handler
  const handleLogin = async () => {
    try {
      await loginWithGoogle();
      notify('success', 'Autenticado com sucesso!');
    } catch (err) {
      notify('error', 'Falha no login com Google. Tente novamente.');
    }
  };

  // Logout handler
  const handleLogout = async () => {
    try {
      await logout();
      notify('success', 'Sessão encerrada.');
    } catch (err) {
      notify('error', 'Erro ao sair.');
    }
  };

  // Toggle Product active status
  const handleToggleProductStatus = async (product: Product) => {
    const nextStatus = product.status === 'active' ? 'inactive' : 'active';
    try {
      await saveProductToFirestore({
        ...product,
        status: nextStatus
      });
      await onRefreshData();
      notify('success', `Produto "${product.title}" marcado como ${nextStatus === 'active' ? 'Ativo' : 'Inativo'}.`);
    } catch (err) {
      notify('error', 'Não foi possível alterar o status do produto.');
    }
  };

  // Delete product
  const confirmDeleteProduct = async () => {
    if (!productToDelete) return;
    setIsSaving(true);
    try {
      await deleteProductFromFirestore(productToDelete.id);
      await onRefreshData();
      notify('success', `Produto "${productToDelete.title}" excluído com sucesso.`);
      setProductToDelete(null);
    } catch (err) {
      notify('error', 'Erro ao excluir produto do banco.');
    } finally {
      setIsSaving(false);
    }
  };

  // Save product (new or edited)
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.title || !productForm.price || !productForm.buyUrl || !productForm.mainImage) {
      notify('error', 'Preencha todos os campos obrigatórios (Título, Preço, Link de Compra e Imagem Principal).');
      return;
    }

    setIsSaving(true);
    try {
      const id = editingProduct ? editingProduct.id : `prod-${Date.now()}`;
      const slug = productForm.slug ? slugify(productForm.slug) : slugify(productForm.title);
      
      const productToSave: Product = {
        id,
        title: productForm.title.trim(),
        slug,
        description: productForm.description || '',
        category: productForm.category || 'eletronicos',
        subcategory: productForm.subcategory || '',
        price: Number(productForm.price),
        promoPrice: productForm.promoPrice ? Number(productForm.promoPrice) : undefined,
        mainImage: productForm.mainImage.trim(),
        images: productForm.images && productForm.images.length > 0 ? productForm.images : [productForm.mainImage.trim()],
        buyUrl: productForm.buyUrl.trim(),
        status: productForm.status || 'active',
        isFeatured: Boolean(productForm.isFeatured),
        isNew: Boolean(productForm.isNew),
        isPopular: Boolean(productForm.isPopular),
        stockStatus: productForm.stockStatus || 'in_stock',
        createdAt: editingProduct ? editingProduct.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await saveProductToFirestore(productToSave);
      await onRefreshData();
      notify('success', `Produto salvo com sucesso no Firestore!`);
      
      setEditingProduct(null);
      setProductForm({
        title: '',
        slug: '',
        category: categories[0]?.slug || 'eletronicos',
        price: 0,
        mainImage: '',
        images: [],
        buyUrl: '',
        description: '',
        status: 'active',
        stockStatus: 'in_stock'
      });
      setActiveTab('products');
    } catch (err) {
      notify('error', 'Falha ao salvar produto no Firestore.');
    } finally {
      setIsSaving(false);
    }
  };

  // Start editing a product
  const startEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setProductForm({ ...prod });
    setActiveTab('new_product');
  };

  // Process local file for Main Cover Image
  const handleMainImageFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      notify('error', 'Por favor, selecione um arquivo de imagem válido (JPG, PNG, WebP).');
      return;
    }

    setIsProcessingImage(true);
    try {
      const result = await compressImageFile(file, 900, 0.82);
      const currentImages = productForm.images || [];
      const updatedImages = currentImages.includes(result.dataUrl) 
        ? currentImages 
        : [result.dataUrl, ...currentImages];

      setProductForm({
        ...productForm,
        mainImage: result.dataUrl,
        images: updatedImages
      });
      notify('success', `Foto principal carregada dos arquivos e otimizada (${result.compressedSizeKB} KB)!`);
    } catch (err) {
      notify('error', 'Falha ao processar o arquivo da imagem.');
    } finally {
      setIsProcessingImage(false);
    }
  };

  // Process multiple local files for Gallery
  const handleGalleryFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (fileArray.length === 0) {
      notify('error', 'Nenhum arquivo de imagem válido selecionado.');
      return;
    }

    setIsProcessingImage(true);
    try {
      const newUrls: string[] = [];
      for (const file of fileArray) {
        const result = await compressImageFile(file, 900, 0.82);
        newUrls.push(result.dataUrl);
      }

      const existingImages = productForm.images || [];
      const mergedImages = Array.from(new Set([...existingImages, ...newUrls]));
      const newMain = productForm.mainImage || newUrls[0] || '';

      setProductForm({
        ...productForm,
        mainImage: newMain,
        images: mergedImages
      });
      notify('success', `${fileArray.length} foto(s) carregada(s) dos seus arquivos com sucesso!`);
    } catch (err) {
      notify('error', 'Erro ao carregar arquivos da galeria.');
    } finally {
      setIsProcessingImage(false);
    }
  };

  // Set any gallery image as main cover
  const handleSetAsCover = (imgUrl: string) => {
    setProductForm({
      ...productForm,
      mainImage: imgUrl
    });
    notify('success', 'Imagem definida como capa principal do produto!');
  };

  // Add gallery image from URL
  const handleAddGalleryImage = () => {
    if (!newImageUrl.trim()) return;
    const currentList = productForm.images || [];
    if (!currentList.includes(newImageUrl.trim())) {
      setProductForm({
        ...productForm,
        images: [...currentList, newImageUrl.trim()]
      });
    }
    setNewImageUrl('');
  };

  // Remove gallery image
  const handleRemoveGalleryImage = (urlToRemove: string) => {
    const remaining = (productForm.images || []).filter(img => img !== urlToRemove);
    let newMain = productForm.mainImage;
    if (productForm.mainImage === urlToRemove) {
      newMain = remaining.length > 0 ? remaining[0] : '';
    }
    setProductForm({
      ...productForm,
      mainImage: newMain,
      images: remaining
    });
  };

  // Extract from link
  const handleExtractFromLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importUrl.trim()) return;

    setIsExtracting(true);
    setExtractedData(null);

    try {
      const response = await fetch('/api/extract-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: importUrl.trim() })
      });

      const data: ExtractedProductResult = await response.json();
      setExtractedData(data);

      if (data.success) {
        // Pre-fill form for review
        setProductForm({
          title: data.title || '',
          slug: slugify(data.title || ''),
          description: data.description || '',
          price: data.price || 0,
          promoPrice: data.promoPrice,
          mainImage: data.mainImage || (data.images && data.images[0]) || '',
          images: data.images || [],
          buyUrl: data.buyUrl || importUrl.trim(),
          category: categories[0]?.slug || 'eletronicos',
          status: 'active',
          stockStatus: 'in_stock',
          isNew: true
        });
        notify('success', 'Informações extraídas! Revise e ajuste os dados antes de salvar.');
      } else {
        notify('error', data.message || 'Não foi possível extrair os dados automaticamente.');
      }
    } catch (err) {
      notify('error', 'Erro de conexão com o extrator de produtos.');
    } finally {
      setIsExtracting(false);
    }
  };

  // Save Categories
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryForm.name) return;

    const slug = categoryForm.slug ? slugify(categoryForm.slug) : slugify(categoryForm.name);
    const id = editingCategoryId || slug;

    const catToSave: Category = {
      id,
      name: categoryForm.name.trim(),
      slug,
      description: categoryForm.description || '',
      icon: categoryForm.icon || 'Sparkles',
      order: Number(categoryForm.order) || 1
    };

    try {
      await saveCategoryToFirestore(catToSave);
      await onRefreshData();
      notify('success', 'Categoria salva com sucesso!');
      setCategoryForm({ name: '', slug: '', description: '', icon: 'Sparkles', order: categories.length + 1 });
      setEditingCategoryId(null);
    } catch (err) {
      notify('error', 'Erro ao salvar categoria no banco.');
    }
  };

  // Delete category
  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Deseja realmente remover esta categoria?')) return;
    try {
      await deleteCategoryFromFirestore(id);
      await onRefreshData();
      notify('success', 'Categoria excluída.');
    } catch (err) {
      notify('error', 'Erro ao excluir categoria.');
    }
  };

  // Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await saveStoreSettingsToFirestore(settingsForm);
      await onRefreshData();
      notify('success', 'Configurações e Banners salvos com sucesso no Firestore!');
    } catch (err) {
      notify('error', 'Erro ao salvar configurações.');
    } finally {
      setIsSaving(false);
    }
  };

  // Save Institutional
  const handleSaveInstitutional = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await saveInstitutionalToFirestore(institutionalForm);
      await onRefreshData();
      notify('success', 'Páginas institucionais e políticas salvas com sucesso!');
    } catch (err) {
      notify('error', 'Erro ao salvar páginas institucionais.');
    } finally {
      setIsSaving(false);
    }
  };

  // Auth gate check
  if (!currentUser || !isAdmin) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-2xl border border-slate-800 text-center">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8" />
          </div>

          <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
            Acesso Restrito
          </h1>
          <p className="text-xs text-slate-500 leading-relaxed mb-6">
            Painel administrativo da <strong className="text-slate-800">Braga Store 2.0</strong>. Apenas administradores autorizados possuem permissão de gerenciamento de catálogo e configurações.
          </p>

          {currentUser && !isAdmin ? (
            <div className="p-4 mb-6 rounded-2xl bg-rose-50 border border-rose-200 text-left">
              <p className="text-xs font-bold text-rose-800 mb-1">Acesso Não Autorizado</p>
              <p className="text-[11px] text-rose-700">
                Você está conectado como <span className="font-semibold">{currentUser.email}</span>, porém esta conta não possui permissão de administrador.
              </p>
              <button
                onClick={handleLogout}
                className="mt-3 text-xs font-bold text-rose-700 underline hover:text-rose-900"
              >
                Conectar com outra conta
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogin}
              className="w-full py-3.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 transition-all cursor-pointer"
            >
              <span>Entrar com Conta Google de Administrador</span>
            </button>
          )}

          <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-center">
            <button
              onClick={() => onNavigate({ type: 'home' })}
              className="text-xs font-semibold text-slate-500 hover:text-indigo-600 flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Voltar para a Loja Pública</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Filter products for admin table
  const adminFilteredProducts = products.filter(p => {
    if (categoryFilter !== 'all' && p.category !== categoryFilter) return false;
    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase().trim();
      return p.title.toLowerCase().includes(q) || p.id.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-100">
      
      {/* Admin Top Bar */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center font-black text-white text-lg">
                B
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-black text-white text-base tracking-tight font-sans">
                    Braga<span className="text-indigo-400">Store</span> Admin
                  </h1>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    v2.0 Firestore
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Conectado: <span className="text-slate-300 font-medium">{currentUser.email}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => onNavigate({ type: 'home' })}
                className="text-xs font-semibold px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1.5 transition-colors"
              >
                <Eye className="w-3.5 h-3.5 text-indigo-400" />
                <span className="hidden sm:inline">Ver Loja Pública</span>
              </button>

              <button
                onClick={handleLogout}
                className="text-xs font-semibold px-3 py-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1.5 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sair</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tab navigation bar */}
        <div className="bg-slate-950/70 border-t border-slate-800/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-2 text-xs font-medium">
              <button
                onClick={() => setActiveTab('products')}
                className={`shrink-0 px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  activeTab === 'products'
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Produtos ({products.length})</span>
              </button>

              <button
                onClick={() => {
                  setExtractedData(null);
                  setActiveTab('import');
                }}
                className={`shrink-0 px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  activeTab === 'import'
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <LinkIcon className="w-3.5 h-3.5 text-amber-400" />
                <span>Importar por Link</span>
              </button>

              <button
                onClick={() => {
                  setEditingProduct(null);
                  setProductForm({
                    title: '',
                    slug: '',
                    category: categories[0]?.slug || 'eletronicos',
                    price: 0,
                    mainImage: '',
                    images: [],
                    buyUrl: '',
                    description: '',
                    status: 'active',
                    stockStatus: 'in_stock'
                  });
                  setActiveTab('new_product');
                }}
                className={`shrink-0 px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  activeTab === 'new_product'
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{editingProduct ? 'Editar Produto' : 'Novo Produto'}</span>
              </button>

              <button
                onClick={() => setActiveTab('categories')}
                className={`shrink-0 px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  activeTab === 'categories'
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Tag className="w-3.5 h-3.5" />
                <span>Categorias ({categories.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('banners')}
                className={`shrink-0 px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  activeTab === 'banners'
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Banners & Início</span>
              </button>

              <button
                onClick={() => setActiveTab('institutional')}
                className={`shrink-0 px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  activeTab === 'institutional'
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Institucional & Contato</span>
              </button>

              <button
                onClick={() => setActiveTab('hosting')}
                className={`shrink-0 px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  activeTab === 'hosting'
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <CloudUpload className="w-3.5 h-3.5 text-emerald-400" />
                <span>Publicação Firebase</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Status Toast / Alert */}
        {statusMessage && (
          <div className={`p-4 rounded-2xl mb-6 flex items-center gap-3 shadow-md ${
            statusMessage.type === 'success' 
              ? 'bg-emerald-500 text-white' 
              : 'bg-rose-600 text-white'
          }`}>
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-xs font-bold">{statusMessage.text}</p>
          </div>
        )}

        {/* ================= TAB 1: PRODUCTS TABLE ================= */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-2xl border border-slate-200">
              <div className="flex items-center gap-3">
                <div className="relative flex-1 sm:w-72">
                  <input
                    type="text"
                    placeholder="Pesquisar por título ou ID..."
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    className="w-full text-xs pl-8 pr-3 py-2 bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:border-indigo-600 outline-hidden"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                </div>

                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="text-xs px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-slate-700 outline-hidden"
                >
                  <option value="all">Todas as Categorias</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.slug}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setEditingProduct(null);
                    setProductForm({
                      title: '',
                      slug: '',
                      category: categories[0]?.slug || 'eletronicos',
                      price: 0,
                      mainImage: '',
                      images: [],
                      buyUrl: '',
                      description: '',
                      status: 'active',
                      stockStatus: 'in_stock'
                    });
                    setActiveTab('new_product');
                  }}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Cadastrar Produto</span>
                </button>

                <button
                  onClick={() => setActiveTab('import')}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                  <span>Importar por Link</span>
                </button>
              </div>
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
                    <tr>
                      <th className="py-3 px-4">Produto</th>
                      <th className="py-3 px-4">Categoria</th>
                      <th className="py-3 px-4">Preço (BRL)</th>
                      <th className="py-3 px-4">Estoque</th>
                      <th className="py-3 px-4">Situação</th>
                      <th className="py-3 px-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {adminFilteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-400">
                          Nenhum produto cadastrado com os filtros aplicados.
                        </td>
                      </tr>
                    ) : (
                      adminFilteredProducts.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={p.mainImage}
                                alt={p.title}
                                className="w-12 h-12 rounded-lg object-cover bg-slate-100 shrink-0 border border-slate-200"
                              />
                              <div className="min-w-0 max-w-xs sm:max-w-md">
                                <p className="font-bold text-slate-900 truncate">{p.title}</p>
                                <p className="text-[11px] text-slate-400 truncate">Slug: {p.slug}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 font-medium capitalize">
                            {p.category}
                          </td>
                          <td className="py-3 px-4 font-bold text-slate-900">
                            {p.promoPrice ? (
                              <div>
                                <span className="text-slate-400 line-through mr-1.5 text-[11px]">
                                  {formatCurrencyBRL(p.price)}
                                </span>
                                <span className="text-rose-600">
                                  {formatCurrencyBRL(p.promoPrice)}
                                </span>
                              </div>
                            ) : (
                              formatCurrencyBRL(p.price)
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              p.stockStatus === 'in_stock' ? 'bg-emerald-50 text-emerald-700' :
                              p.stockStatus === 'low_stock' ? 'bg-amber-50 text-amber-700' :
                              'bg-rose-50 text-rose-700'
                            }`}>
                              {p.stockStatus === 'in_stock' ? 'Em Estoque' :
                               p.stockStatus === 'low_stock' ? 'Estoque Baixo' : 'Esgotado'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <button
                              type="button"
                              onClick={() => handleToggleProductStatus(p)}
                              className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-colors cursor-pointer ${
                                p.status === 'active'
                                  ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                  : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                              }`}
                            >
                              {p.status === 'active' ? 'Ativo na Loja' : 'Desativado'}
                            </button>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <a
                                href={p.buyUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
                                title="Abrir link de compra"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </a>
                              <button
                                type="button"
                                onClick={() => startEditProduct(p)}
                                className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors cursor-pointer"
                                title="Editar produto"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setProductToDelete(p)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                                title="Excluir produto"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: IMPORT BY LINK ================= */}
        {activeTab === 'import' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs">
              <div className="flex items-center gap-3 pb-4 mb-6 border-b border-slate-100">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <LinkIcon className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900 tracking-tight">
                    Importar Produto por Link
                  </h2>
                  <p className="text-xs text-slate-500">
                    Cole o link do produto para extrair automaticamente título, descrição, fotos e preços.
                  </p>
                </div>
              </div>

              <form onSubmit={handleExtractFromLink} className="space-y-4 mb-6">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Endereço da Página do Produto (URL)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      required
                      placeholder="https://exemplo.com/produto-especifico"
                      value={importUrl}
                      onChange={(e) => setImportUrl(e.target.value)}
                      className="flex-1 text-xs p-3 rounded-xl border border-slate-200 focus:border-indigo-600 outline-hidden bg-slate-50 focus:bg-white"
                    />
                    <button
                      type="submit"
                      disabled={isExtracting}
                      className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs cursor-pointer transition-colors disabled:opacity-50"
                    >
                      {isExtracting ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Extraindo...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>Extrair Dados</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 space-y-1">
                  <p className="font-semibold text-slate-700">Regras de extração:</p>
                  <p>• A ferramenta lê metadados OpenGraph e Schema.org da página sem inventar informações.</p>
                  <p>• Você poderá revisar e editar todos os campos antes de confirmar o salvamento.</p>
                  <p>• Caso o site possua proteções antibot ou captcha, você pode preencher os campos restantes manualmente.</p>
                </div>
              </form>

              {/* Extraction Feedback & Quick Review Action */}
              {extractedData && (
                <div className={`p-4 rounded-2xl border mb-6 ${
                  extractedData.success 
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
                    : 'bg-amber-50 border-amber-200 text-amber-900'
                }`}>
                  <p className="font-bold text-xs">{extractedData.message}</p>
                  {extractedData.warnings && extractedData.warnings.length > 0 && (
                    <ul className="mt-2 space-y-1 text-[11px] list-disc list-inside opacity-90">
                      {extractedData.warnings.map((w, idx) => (
                        <li key={idx}>{w}</li>
                      ))}
                    </ul>
                  )}
                  {extractedData.success && (
                    <button
                      type="button"
                      onClick={() => setActiveTab('new_product')}
                      className="mt-3 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
                    >
                      <Check className="w-4 h-4" />
                      <span>Revisar e Salvar Produto no Formulário</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= TAB 3: CREATE / EDIT PRODUCT FORM ================= */}
        {activeTab === 'new_product' && (
          <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSaveProduct} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-lg font-black text-slate-900 tracking-tight">
                    {editingProduct ? 'Editar Produto' : 'Cadastrar Novo Produto'}
                  </h2>
                  <p className="text-xs text-slate-500">
                    Preencha as informações do produto para exibição na vitrine da Braga Store.
                  </p>
                </div>
                {editingProduct && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingProduct(null);
                      setActiveTab('products');
                    }}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-800"
                  >
                    Cancelar Edição
                  </button>
                )}
              </div>

              {/* Title & Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 block mb-1">Título do Produto *</label>
                  <input
                    type="text"
                    required
                    value={productForm.title || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setProductForm({
                        ...productForm,
                        title: val,
                        slug: slugify(val)
                      });
                    }}
                    placeholder="Ex: Smartwatch Braga Ultra Series 9"
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:border-indigo-600 outline-hidden bg-slate-50 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Slug URL (amigável) *</label>
                  <input
                    type="text"
                    required
                    value={productForm.slug || ''}
                    onChange={(e) => setProductForm({ ...productForm, slug: slugify(e.target.value) })}
                    placeholder="smartwatch-braga-ultra"
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:border-indigo-600 outline-hidden bg-slate-50 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Categoria Principal *</label>
                  <select
                    value={productForm.category || ''}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:border-indigo-600 outline-hidden bg-slate-50 focus:bg-white"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.slug}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Pricing */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Preço Normal (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={productForm.price || ''}
                    onChange={(e) => setProductForm({ ...productForm, price: parseFloat(e.target.value) || 0 })}
                    placeholder="299.90"
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:border-indigo-600 outline-hidden bg-slate-50 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Preço Promocional (R$) (Opcional)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={productForm.promoPrice || ''}
                    onChange={(e) => setProductForm({ ...productForm, promoPrice: e.target.value ? parseFloat(e.target.value) : undefined })}
                    placeholder="199.90"
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:border-indigo-600 outline-hidden bg-slate-50 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Situação de Estoque *</label>
                  <select
                    value={productForm.stockStatus || 'in_stock'}
                    onChange={(e) => setProductForm({ ...productForm, stockStatus: e.target.value as any })}
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:border-indigo-600 outline-hidden bg-slate-50 focus:bg-white"
                  >
                    <option value="in_stock">Em Estoque</option>
                    <option value="low_stock">Últimas Unidades</option>
                    <option value="out_of_stock">Esgotado</option>
                  </select>
                </div>
              </div>

              {/* Buy URL */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Link Externo de Compra *</label>
                <input
                  type="url"
                  required
                  value={productForm.buyUrl || ''}
                  onChange={(e) => setProductForm({ ...productForm, buyUrl: e.target.value })}
                  placeholder="https://pay.hotmart.com/... ou https://mercadolivre.com.br/..."
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:border-indigo-600 outline-hidden bg-slate-50 focus:bg-white"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  O cliente será direcionado para este link ao clicar em "Comprar".
                </p>
              </div>

              {/* Main Image & Multi-Image Gallery */}
              <div className="space-y-6 pt-2 border-t border-slate-100">
                {/* 1. Imagem Principal */}
                <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <ImageIcon className="w-4 h-4 text-indigo-600" />
                        <span>Foto Principal do Produto (Capa) *</span>
                      </label>
                      <p className="text-[11px] text-slate-500">
                        Esta é a imagem exibida nos cards da loja e no topo da página de detalhes.
                      </p>
                    </div>

                    {/* Method Selector Tabs */}
                    <div className="flex items-center bg-slate-200/80 p-0.5 rounded-xl text-[11px] font-bold">
                      <button
                        type="button"
                        onClick={() => setMainImageTab('file')}
                        className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                          mainImageTab === 'file'
                            ? 'bg-white text-indigo-700 shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <FolderOpen className="w-3.5 h-3.5" />
                        <span>Do Computador / Celular</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setMainImageTab('url')}
                        className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                          mainImageTab === 'url'
                            ? 'bg-white text-indigo-700 shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <LinkIcon className="w-3.5 h-3.5" />
                        <span>Link / URL</span>
                      </button>
                    </div>
                  </div>

                  {/* Tab 1: Local File Upload */}
                  {mainImageTab === 'file' && (
                    <div>
                      {productForm.mainImage ? (
                        <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-xl border border-slate-200">
                          <img
                            src={productForm.mainImage}
                            alt="Capa selecionada"
                            className="w-28 h-28 object-cover rounded-xl border border-slate-200 bg-slate-100 shrink-0"
                          />
                          <div className="flex-1 min-w-0 space-y-2 text-center sm:text-left">
                            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 text-[11px] font-bold">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Foto Principal Carregada</span>
                            </div>
                            <p className="text-xs text-slate-500">
                              Pronta para publicação. A imagem foi otimizada automaticamente para alta velocidade.
                            </p>
                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                              <label
                                htmlFor="main-image-replace"
                                className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                              >
                                <FolderOpen className="w-3.5 h-3.5" />
                                <span>Trocar Foto dos Arquivos</span>
                              </label>
                              <input
                                id="main-image-replace"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  if (e.target.files && e.target.files[0]) {
                                    handleMainImageFile(e.target.files[0]);
                                  }
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => setProductForm({ ...productForm, mainImage: '' })}
                                className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-rose-50 hover:border-rose-200 text-rose-600 text-xs font-bold transition-colors cursor-pointer"
                              >
                                Remover
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div
                          onDragOver={(e) => {
                            e.preventDefault();
                            setIsDraggingMain(true);
                          }}
                          onDragLeave={() => setIsDraggingMain(false)}
                          onDrop={(e) => {
                            e.preventDefault();
                            setIsDraggingMain(false);
                            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                              handleMainImageFile(e.dataTransfer.files[0]);
                            }
                          }}
                          className={`relative border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center transition-all bg-white cursor-pointer ${
                            isDraggingMain
                              ? 'border-indigo-600 bg-indigo-50/50 scale-[1.01]'
                              : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50/60'
                          }`}
                        >
                          <input
                            id="main-image-input"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                handleMainImageFile(e.target.files[0]);
                              }
                            }}
                          />
                          <label htmlFor="main-image-input" className="cursor-pointer block space-y-2">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-2 shadow-2xs">
                              {isProcessingImage ? (
                                <RefreshCw className="w-6 h-6 animate-spin" />
                              ) : (
                                <UploadCloud className="w-6 h-6" />
                              )}
                            </div>
                            <p className="text-xs sm:text-sm font-bold text-slate-800">
                              {isProcessingImage 
                                ? 'Processando e otimizando imagem...' 
                                : 'Clique para selecionar a foto salva nos seus arquivos'}
                            </p>
                            <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                              Selecione qualquer foto da sua galeria ou arquivos do computador. O sistema comprime automaticamente para WebP sem perder qualidade visual.
                            </p>
                            <span className="inline-flex items-center gap-1.5 px-4 py-2 mt-2 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-xs hover:bg-indigo-700 transition-colors">
                              <FolderOpen className="w-3.5 h-3.5" />
                              <span>Escolher Foto do Arquivo</span>
                            </span>
                          </label>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Tab 2: External URL Input */}
                  {mainImageTab === 'url' && (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="url"
                          value={productForm.mainImage || ''}
                          onChange={(e) => setProductForm({ ...productForm, mainImage: e.target.value })}
                          placeholder="https://images.unsplash.com/... ou link direto da imagem"
                          className="flex-1 text-xs p-3 rounded-xl border border-slate-200 focus:border-indigo-600 outline-hidden bg-white"
                        />
                      </div>
                      {productForm.mainImage && (
                        <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200">
                          <img
                            src={productForm.mainImage}
                            alt="Prévia do link"
                            className="w-16 h-16 object-cover rounded-lg border border-slate-200"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                          <p className="text-xs text-slate-600 truncate flex-1">
                            {productForm.mainImage}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* 2. Fotos Adicionais da Galeria */}
                <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <ImagePlus className="w-4 h-4 text-indigo-600" />
                        <span>Fotos Adicionais da Galeria (Opcional)</span>
                      </label>
                      <p className="text-[11px] text-slate-500">
                        Adicione mais fotos para os clientes visualizarem outros ângulos e detalhes.
                      </p>
                    </div>

                    {/* Upload multiple files button */}
                    <div className="flex items-center gap-2">
                      <label
                        htmlFor="gallery-multi-upload"
                        className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                      >
                        <FolderOpen className="w-3.5 h-3.5" />
                        <span>Adicionar Fotos do Arquivo</span>
                      </label>
                      <input
                        id="gallery-multi-upload"
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files.length > 0) {
                            handleGalleryFiles(e.target.files);
                          }
                        }}
                      />
                    </div>
                  </div>

                  {/* Or add via URL */}
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      placeholder="Ou cole o link/URL de outra foto..."
                      className="flex-1 text-xs p-2.5 rounded-xl border border-slate-200 focus:border-indigo-600 outline-hidden bg-white"
                    />
                    <button
                      type="button"
                      onClick={handleAddGalleryImage}
                      className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition-colors cursor-pointer"
                    >
                      Adicionar por Link
                    </button>
                  </div>

                  {/* Thumbnails preview & Cover selector */}
                  {productForm.images && productForm.images.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        Fotos Cadastradas ({productForm.images.length}):
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                        {productForm.images.map((img, idx) => {
                          const isCover = productForm.mainImage === img;
                          return (
                            <div
                              key={idx}
                              className={`relative group rounded-xl overflow-hidden border-2 bg-white transition-all ${
                                isCover
                                  ? 'border-indigo-600 ring-2 ring-indigo-100 shadow-sm'
                                  : 'border-slate-200 hover:border-slate-300'
                              }`}
                            >
                              <div className="aspect-square w-full">
                                <img
                                  src={img}
                                  alt={`Miniatura ${idx + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              </div>

                              {/* Capa Badge */}
                              {isCover && (
                                <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded-md bg-indigo-600 text-white text-[9px] font-extrabold uppercase shadow-xs">
                                  Capa
                                </span>
                              )}

                              {/* Action Overlay */}
                              <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-1">
                                {!isCover && (
                                  <button
                                    type="button"
                                    onClick={() => handleSetAsCover(img)}
                                    className="px-2 py-1 rounded-md bg-white text-indigo-700 text-[10px] font-bold shadow-xs hover:bg-indigo-50 transition-colors w-full text-center"
                                  >
                                    Definir Capa
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => handleRemoveGalleryImage(img)}
                                  className="p-1 rounded-md bg-rose-600 text-white hover:bg-rose-700 transition-colors"
                                  title="Remover foto"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Descrição Detalhada do Produto</label>
                <textarea
                  rows={5}
                  value={productForm.description || ''}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  placeholder="Informações completas, diferenciais, especificações técnicas, modo de uso..."
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:border-indigo-600 outline-hidden bg-slate-50 focus:bg-white"
                />
              </div>

              {/* Toggles */}
              <div className="flex flex-wrap gap-6 pt-2 border-t border-slate-100">
                <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={productForm.status === 'active'}
                    onChange={(e) => setProductForm({ ...productForm, status: e.target.checked ? 'active' : 'inactive' })}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Ativo e Visível na Loja</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(productForm.isFeatured)}
                    onChange={(e) => setProductForm({ ...productForm, isFeatured: e.target.checked })}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Destacar na Página Inicial</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(productForm.isNew)}
                    onChange={(e) => setProductForm({ ...productForm, isNew: e.target.checked })}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Marcar como "Novo"</span>
                </label>
              </div>

              {/* Submit Button */}
              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('products')}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-7 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-indigo-600/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  <span>{isSaving ? 'Salvando no Firestore...' : 'Salvar Produto'}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ================= TAB 4: CATEGORIES ================= */}
        {activeTab === 'categories' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
              <h2 className="text-base font-black text-slate-900 tracking-tight mb-4">
                {editingCategoryId ? 'Editar Categoria' : 'Nova Categoria'}
              </h2>
              <form onSubmit={handleSaveCategory} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Nome da Categoria *</label>
                  <input
                    type="text"
                    required
                    value={categoryForm.name || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCategoryForm({
                        ...categoryForm,
                        name: val,
                        slug: slugify(val)
                      });
                    }}
                    placeholder="Ex: Eletrônicos & Smart"
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:border-indigo-600 outline-hidden bg-slate-50 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Slug URL *</label>
                  <input
                    type="text"
                    required
                    value={categoryForm.slug || ''}
                    onChange={(e) => setCategoryForm({ ...categoryForm, slug: slugify(e.target.value) })}
                    placeholder="eletronicos-smart"
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:border-indigo-600 outline-hidden bg-slate-50 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Descrição Curta</label>
                  <input
                    type="text"
                    value={categoryForm.description || ''}
                    onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                    placeholder="Breve resumo da categoria..."
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:border-indigo-600 outline-hidden bg-slate-50 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Ícone</label>
                  <select
                    value={categoryForm.icon || 'Sparkles'}
                    onChange={(e) => setCategoryForm({ ...categoryForm, icon: e.target.value })}
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:border-indigo-600 outline-hidden bg-slate-50 focus:bg-white"
                  >
                    <option value="Smartphone">Smartphone / Tecnologia</option>
                    <option value="Home">Home / Casa</option>
                    <option value="Watch">Watch / Moda & Acessórios</option>
                    <option value="Sparkles">Sparkles / Beleza & Saúde</option>
                    <option value="Wrench">Wrench / Ferramentas & Auto</option>
                  </select>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  {editingCategoryId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingCategoryId(null);
                        setCategoryForm({ name: '', slug: '', description: '', icon: 'Sparkles', order: categories.length + 1 });
                      }}
                      className="px-3 py-2 text-xs font-bold text-slate-500 hover:text-slate-800"
                    >
                      Cancelar
                    </button>
                  )}
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Salvar Categoria</span>
                  </button>
                </div>
              </form>
            </div>

            <div className="md:col-span-7 space-y-3">
              <h2 className="text-base font-black text-slate-900 tracking-tight mb-4">
                Categorias Cadastradas ({categories.length})
              </h2>
              <div className="space-y-2">
                {categories.map(c => (
                  <div key={c.id} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{c.name}</h4>
                      <p className="text-xs text-slate-400">Slug: /{c.slug} • Ícone: {c.icon}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingCategoryId(c.id);
                          setCategoryForm({ ...c });
                        }}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteCategory(c.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 5: BANNERS & HOME ================= */}
        {activeTab === 'banners' && (
          <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSaveSettings} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
              <div className="pb-4 border-b border-slate-100">
                <h2 className="text-lg font-black text-slate-900 tracking-tight">
                  Editor do Banner Principal e Textos da Home
                </h2>
                <p className="text-xs text-slate-500">
                  Atualize os textos, chamadas e imagem de destaque exibidos na página inicial da loja.
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Badge de Destaque Superior</label>
                <input
                  type="text"
                  value={settingsForm.heroBadge}
                  onChange={(e) => setSettingsForm({ ...settingsForm, heroBadge: e.target.value })}
                  placeholder="Ex: Seleção Braga 2026"
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:border-indigo-600 outline-hidden bg-slate-50 focus:bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Título Principal (Headline)</label>
                <input
                  type="text"
                  value={settingsForm.heroTitle}
                  onChange={(e) => setSettingsForm({ ...settingsForm, heroTitle: e.target.value })}
                  placeholder="Ex: Os Melhores Produtos Selecionados Para o Seu Dia a Dia"
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:border-indigo-600 outline-hidden bg-slate-50 focus:bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Subtítulo Explicativo</label>
                <textarea
                  rows={2}
                  value={settingsForm.heroSubtitle}
                  onChange={(e) => setSettingsForm({ ...settingsForm, heroSubtitle: e.target.value })}
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:border-indigo-600 outline-hidden bg-slate-50 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Texto do Botão Principal (CTA)</label>
                  <input
                    type="text"
                    value={settingsForm.heroCtaText}
                    onChange={(e) => setSettingsForm({ ...settingsForm, heroCtaText: e.target.value })}
                    placeholder="Explorar Catálogo"
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:border-indigo-600 outline-hidden bg-slate-50 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">URL da Imagem do Banner Hero</label>
                  <input
                    type="url"
                    value={settingsForm.heroImageUrl}
                    onChange={(e) => setSettingsForm({ ...settingsForm, heroImageUrl: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:border-indigo-600 outline-hidden bg-slate-50 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Faixa de Anúncio Superior (Topbar)</label>
                <input
                  type="text"
                  value={settingsForm.announcement}
                  onChange={(e) => setSettingsForm({ ...settingsForm, announcement: e.target.value })}
                  placeholder="🔥 OFERTAS DA SEMANA COM ATÉ 45% OFF + PARCELAMENTO EM ATÉ 12X"
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:border-indigo-600 outline-hidden bg-slate-50 focus:bg-white"
                />
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-colors"
                >
                  <Check className="w-4 h-4" />
                  <span>Salvar Banners e Textos</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ================= TAB 6: INSTITUTIONAL & CONTACT ================= */}
        {activeTab === 'institutional' && (
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Store Information Form */}
            <form onSubmit={handleSaveSettings} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
              <div className="pb-4 border-b border-slate-100">
                <h2 className="text-lg font-black text-slate-900 tracking-tight">
                  Informações de Contato e Identidade
                </h2>
                <p className="text-xs text-slate-500">
                  Dados de suporte exibidos no rodapé, cabeçalho e canais de atendimento.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">WhatsApp para Atendimento</label>
                  <input
                    type="text"
                    value={settingsForm.whatsapp}
                    onChange={(e) => setSettingsForm({ ...settingsForm, whatsapp: e.target.value })}
                    placeholder="5511987654321"
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:border-indigo-600 outline-hidden bg-slate-50 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Telefone / Exibição</label>
                  <input
                    type="text"
                    value={settingsForm.phone}
                    onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                    placeholder="(11) 98765-4321"
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:border-indigo-600 outline-hidden bg-slate-50 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">E-mail Oficial</label>
                  <input
                    type="email"
                    value={settingsForm.email}
                    onChange={(e) => setSettingsForm({ ...settingsForm, email: e.target.value })}
                    placeholder="atendimento@bragastore.com.br"
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:border-indigo-600 outline-hidden bg-slate-50 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">CNPJ (Conforme exigência do e-commerce)</label>
                  <input
                    type="text"
                    value={settingsForm.cnpj}
                    onChange={(e) => setSettingsForm({ ...settingsForm, cnpj: e.target.value })}
                    placeholder="00.000.000/0001-00"
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:border-indigo-600 outline-hidden bg-slate-50 focus:bg-white"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 block mb-1">Endereço Comercial / Sede</label>
                  <input
                    type="text"
                    value={settingsForm.address}
                    onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
                    placeholder="São Paulo - SP | Envio Nacional"
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:border-indigo-600 outline-hidden bg-slate-50 focus:bg-white"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-colors"
                >
                  <Check className="w-4 h-4" />
                  <span>Salvar Dados de Contato</span>
                </button>
              </div>
            </form>

            {/* Institutional Policies Form */}
            <form onSubmit={handleSaveInstitutional} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
              <div className="pb-4 border-b border-slate-100">
                <h2 className="text-lg font-black text-slate-900 tracking-tight">
                  Textos das Páginas Institucionais e Políticas
                </h2>
                <p className="text-xs text-slate-500">
                  Edite os termos e políticas da loja. Todas as alterações são salvas diretamente no Cloud Firestore.
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Página "Sobre a Braga Store"</label>
                <textarea
                  rows={4}
                  value={institutionalForm.about}
                  onChange={(e) => setInstitutionalForm({ ...institutionalForm, about: e.target.value })}
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:border-indigo-600 outline-hidden bg-slate-50 focus:bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Política de Privacidade (LGPD)</label>
                <textarea
                  rows={4}
                  value={institutionalForm.privacyPolicy}
                  onChange={(e) => setInstitutionalForm({ ...institutionalForm, privacyPolicy: e.target.value })}
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:border-indigo-600 outline-hidden bg-slate-50 focus:bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Termos e Condições de Uso</label>
                <textarea
                  rows={4}
                  value={institutionalForm.termsOfUse}
                  onChange={(e) => setInstitutionalForm({ ...institutionalForm, termsOfUse: e.target.value })}
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:border-indigo-600 outline-hidden bg-slate-50 focus:bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Política de Entrega e Prazos</label>
                <textarea
                  rows={4}
                  value={institutionalForm.shippingPolicy}
                  onChange={(e) => setInstitutionalForm({ ...institutionalForm, shippingPolicy: e.target.value })}
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:border-indigo-600 outline-hidden bg-slate-50 focus:bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Política de Trocas e Devoluções</label>
                <textarea
                  rows={4}
                  value={institutionalForm.returnPolicy}
                  onChange={(e) => setInstitutionalForm({ ...institutionalForm, returnPolicy: e.target.value })}
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:border-indigo-600 outline-hidden bg-slate-50 focus:bg-white"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-colors"
                >
                  <Check className="w-4 h-4" />
                  <span>Salvar Políticas Institucionais</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ================= TAB 7: FIREBASE HOSTING PUBLICATION GUIDE ================= */}
        {activeTab === 'hosting' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <CloudUpload className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900 tracking-tight">
                    Guia de Publicação no Firebase Hosting
                  </h2>
                  <p className="text-xs text-slate-500">
                    O projeto já possui `firebase.json`, `firestore.rules` e configuração pronta para produção.
                  </p>
                </div>
              </div>

              <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-indigo-600" />
                  Comandos de Publicação Passo a Passo
                </h3>

                <div className="bg-slate-900 text-slate-200 rounded-2xl p-4 font-mono text-[11px] space-y-3">
                  <div>
                    <span className="text-slate-400"># 1. Instalar as dependências (se ainda não instalado)</span>
                    <p className="text-emerald-400">npm install</p>
                  </div>
                  <div>
                    <span className="text-slate-400"># 2. Gerar a compilação de produção (pasta /dist)</span>
                    <p className="text-emerald-400">npm run build</p>
                  </div>
                  <div>
                    <span className="text-slate-400"># 3. Fazer login no Firebase CLI</span>
                    <p className="text-emerald-400">npx firebase-tools login</p>
                  </div>
                  <div>
                    <span className="text-slate-400"># 4. Publicar tanto o Hosting quanto as Regras do Firestore</span>
                    <p className="text-emerald-400">npx firebase-tools deploy</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 space-y-2">
                  <h4 className="font-bold text-indigo-950 text-xs flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-indigo-600" />
                    Serviços do Firebase Habilitados
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-indigo-900">
                    <li><strong>Cloud Firestore:</strong> Armazenamento persistente de produtos, categorias e configurações.</li>
                    <li><strong>Firebase Authentication:</strong> Proteção de login Google para administradores.</li>
                    <li><strong>Firebase Hosting:</strong> Entrega ultra-rápida via CDN global com certificado SSL gratuito e SPA rewrites.</li>
                  </ul>
                </div>

                <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/90 text-amber-950 space-y-3">
                  <div className="flex items-center gap-2">
                    <Globe className="w-5 h-5 text-amber-700" />
                    <h4 className="font-extrabold text-sm text-amber-900">
                      Configuração do Domínio Oficial: bragastore.com.br
                    </h4>
                  </div>
                  <p className="text-xs leading-relaxed text-amber-900/90">
                    Sua loja já está estruturada e com todas as referências canônicas, OpenGraph, sitemap e metadados configurados para <strong>https://bragastore.com.br</strong>.
                  </p>
                  
                  <div className="bg-white/90 rounded-xl p-4 border border-amber-200 space-y-2 text-xs">
                    <p className="font-bold text-slate-900">Passos para ativar no Registro.br / Provedor de DNS:</p>
                    <ol className="list-decimal list-inside space-y-1.5 text-slate-700">
                      <li>Acesse o <strong>Console do Firebase &gt; Hosting</strong> no seu projeto <em>skilful-sunup-s5fd2</em>.</li>
                      <li>Clique no botão <strong>"Adicionar domínio personalizado"</strong> e digite <code className="bg-slate-100 px-1.5 py-0.5 rounded font-bold text-indigo-600">bragastore.com.br</code>.</li>
                      <li>Marque a opção de redirecionar também <code className="bg-slate-100 px-1.5 py-0.5 rounded font-bold">www.bragastore.com.br</code>.</li>
                      <li>No seu provedor de domínio (Registro.br, Cloudflare ou Hostgator), crie as entradas DNS do tipo <strong>A</strong> com os IPs indicados pelo Firebase (ou CNAME para www).</li>
                      <li>O Firebase emitirá e renovará o certificado <strong>SSL HTTPS</strong> gratuitamente de forma automática!</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Delete Confirmation Modal */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-slate-900 mb-2">
              Confirmar Exclusão?
            </h3>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              Tem certeza de que deseja remover o produto <strong>"{productToDelete.title}"</strong>? Esta ação é irreversível no Cloud Firestore.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setProductToDelete(null)}
                className="py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmDeleteProduct}
                disabled={isSaving}
                className="py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
              >
                {isSaving ? 'Excluindo...' : 'Sim, Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
