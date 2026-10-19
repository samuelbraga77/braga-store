import React, { useState } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Copy,
  Eye,
  Check,
  X,
  ExternalLink,
  Upload,
  Image as ImageIcon,
  Tag,
  Star,
  Layers,
  Save,
  ArrowUpDown,
} from 'lucide-react';
import { useStore } from '../../../context/StoreContext';
import { Product, ProductSpecification } from '../../../types';
import { saveProduct, deleteProduct } from '../../../services/storeService';

export const ProductsTab: React.FC = () => {
  const { products, categories, refreshData, showToast } = useStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft'>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [externalUrl, setExternalUrl] = useState('');
  const [currentPrice, setCurrentPrice] = useState<string>('');
  const [previousPrice, setPreviousPrice] = useState<string>('');
  const [shortDescription, setShortDescription] = useState('');
  const [fullDescription, setFullDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [additionalCategories, setAdditionalCategories] = useState<string[]>([]);
  const [mainImage, setMainImage] = useState('');
  const [gallery, setGallery] = useState<string[]>([]);
  const [newGalleryUrl, setNewGalleryUrl] = useState('');
  const [imageAlt, setImageAlt] = useState('');
  const [brand, setBrand] = useState('');
  const [sku, setSku] = useState('');
  const [keywords, setKeywords] = useState('');
  const [specifications, setSpecifications] = useState<ProductSpecification[]>([]);
  const [newSpecName, setNewSpecName] = useState('');
  const [newSpecValue, setNewSpecValue] = useState('');
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isOffer, setIsOffer] = useState(false);
  const [status, setStatus] = useState<'draft' | 'published'>('published');
  const [buttonText, setButtonText] = useState('Comprar no site oficial');

  // Slug auto-generator
  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingProduct) {
      setSlug(generateSlug(val));
    }
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    setName('');
    setSlug('');
    setExternalUrl('');
    setCurrentPrice('');
    setPreviousPrice('');
    setShortDescription('');
    setFullDescription('');
    setCategoryId(categories[0]?.id || '');
    setAdditionalCategories([]);
    setMainImage('');
    setGallery([]);
    setNewGalleryUrl('');
    setImageAlt('');
    setBrand('');
    setSku('');
    setKeywords('');
    setSpecifications([]);
    setSeoTitle('');
    setSeoDescription('');
    setIsFeatured(false);
    setIsOffer(false);
    setStatus('published');
    setButtonText('Comprar no site oficial');
    setIsModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setSlug(p.slug);
    setExternalUrl(p.externalUrl || '');
    setCurrentPrice(p.currentPrice ? p.currentPrice.toString() : '');
    setPreviousPrice(p.previousPrice ? p.previousPrice.toString() : '');
    setShortDescription(p.shortDescription || '');
    setFullDescription(p.fullDescription || '');
    setCategoryId(p.categoryId || '');
    setAdditionalCategories(p.additionalCategories || []);
    setMainImage(p.mainImage || '');
    setGallery(p.gallery || []);
    setNewGalleryUrl('');
    setImageAlt(p.imageAlt || '');
    setBrand(p.brand || '');
    setSku(p.sku || '');
    setKeywords(p.keywords || '');
    setSpecifications(p.specifications || []);
    setSeoTitle(p.seoTitle || '');
    setSeoDescription(p.seoDescription || '');
    setIsFeatured(p.isFeatured);
    setIsOffer(p.isOffer);
    setStatus(p.status);
    setButtonText(p.buttonText || 'Comprar no site oficial');
    setIsModalOpen(true);
  };

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'main' | 'gallery') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      showToast('A imagem deve ter no máximo 2MB.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (target === 'main') {
        setMainImage(base64);
      } else {
        setGallery((prev) => [...prev, base64]);
      }
      showToast('Imagem carregada com sucesso!', 'success');
    };
    reader.readAsDataURL(file);
  };

  const handleAddGalleryUrl = () => {
    if (newGalleryUrl.trim()) {
      setGallery((prev) => [...prev, newGalleryUrl.trim()]);
      setNewGalleryUrl('');
    }
  };

  const handleRemoveGalleryImage = (index: number) => {
    setGallery((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddSpecification = () => {
    if (newSpecName.trim() && newSpecValue.trim()) {
      setSpecifications((prev) => [
        ...prev,
        { name: newSpecName.trim(), value: newSpecValue.trim() },
      ]);
      setNewSpecName('');
      setNewSpecValue('');
    }
  };

  const handleRemoveSpecification = (index: number) => {
    setSpecifications((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDuplicate = async (p: Product) => {
    try {
      const duplicated: Product = {
        ...p,
        id: 'prod_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        name: `${p.name} (Cópia)`,
        slug: `${p.slug}-copia-${Date.now().toString().slice(-4)}`,
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await saveProduct(duplicated);
      await refreshData();
      showToast('Produto duplicado com sucesso como rascunho.', 'success');
    } catch (err: any) {
      showToast('Erro ao duplicar produto: ' + err.message, 'error');
    }
  };

  const handleTogglePublish = async (p: Product) => {
    try {
      const updated: Product = {
        ...p,
        status: p.status === 'published' ? 'draft' : 'published',
        updatedAt: new Date().toISOString(),
      };
      await saveProduct(updated);
      await refreshData();
      showToast(
        updated.status === 'published' ? 'Produto publicado na loja!' : 'Produto salvo como rascunho.',
        'success'
      );
    } catch (err: any) {
      showToast('Erro ao alterar status: ' + err.message, 'error');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProduct(id);
      await refreshData();
      setDeleteConfirmId(null);
      showToast('Produto excluído com sucesso.', 'info');
    } catch (err: any) {
      showToast('Erro ao excluir produto: ' + err.message, 'error');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      showToast('Nome do produto é obrigatório.', 'error');
      return;
    }
    const parsedPrice = parseFloat(currentPrice.replace(',', '.'));
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      showToast('Preço atual deve ser um número válido maior que zero.', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const parsedPreviousPrice = previousPrice ? parseFloat(previousPrice.replace(',', '.')) : undefined;

      const productData: Product = {
        id: editingProduct?.id || 'prod_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        name: name.trim(),
        slug: slug.trim() || generateSlug(name),
        externalUrl: externalUrl.trim(),
        currentPrice: parsedPrice,
        previousPrice: parsedPreviousPrice && parsedPreviousPrice > 0 ? parsedPreviousPrice : undefined,
        shortDescription: shortDescription.trim(),
        fullDescription: fullDescription.trim(),
        categoryId: categoryId || (categories[0]?.id || ''),
        additionalCategories,
        mainImage: mainImage.trim(),
        gallery,
        imageAlt: imageAlt.trim() || name.trim(),
        brand: brand.trim(),
        sku: sku.trim(),
        keywords: keywords.trim(),
        specifications,
        seoTitle: seoTitle.trim() || `${name.trim()} — Braga Store`,
        seoDescription: seoDescription.trim() || shortDescription.trim(),
        isFeatured,
        isOffer,
        status,
        buttonText: buttonText.trim() || 'Comprar no site oficial',
        createdAt: editingProduct?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await saveProduct(productData);
      await refreshData();
      setIsModalOpen(false);
      showToast('Produto salvo permanentemente com sucesso!', 'success');
    } catch (err: any) {
      console.error(err);
      showToast('Falha ao salvar produto: ' + err.message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      searchTerm === '' ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || p.categoryId === filterCategory;
    const matchesStatus = filterStatus === 'all' || p.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const formatBRL = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(val);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Gerenciar Produtos</h2>
          <p className="text-xs text-slate-500">
            Cadastre, edite, publique ou duplique produtos reais do catálogo
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer shadow-sm self-start"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Novo Produto</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Pesquisar por nome, marca ou SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-blue-600 cursor-pointer"
          >
            <option value="all">Todas as Categorias</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-blue-600 cursor-pointer"
          >
            <option value="all">Todos os Status</option>
            <option value="published">Publicados</option>
            <option value="draft">Rascunhos</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        {filteredProducts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3.5">Produto</th>
                  <th className="px-4 py-3.5">Categoria</th>
                  <th className="px-4 py-3.5">Preço</th>
                  <th className="px-4 py-3.5">Tags</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map((p) => {
                  const cat = categories.find((c) => c.id === p.categoryId);
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-slate-100 shrink-0 overflow-hidden border border-slate-200 flex items-center justify-center p-1">
                            {p.mainImage ? (
                              <img
                                src={p.mainImage}
                                alt={p.name}
                                className="w-full h-full object-contain"
                              />
                            ) : (
                              <ImageIcon className="w-5 h-5 text-slate-400" />
                            )}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-900 block line-clamp-1">
                              {p.name}
                            </span>
                            <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono mt-0.5">
                              <span>/{p.slug}</span>
                              {p.sku && <span>· SKU: {p.sku}</span>}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="text-slate-700 font-medium">
                          {cat?.name || 'Sem categoria'}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="font-mono font-bold text-slate-900 tabular-nums">
                          {formatBRL(p.currentPrice)}
                        </span>
                        {p.previousPrice && (
                          <span className="text-[11px] text-slate-400 line-through block font-mono">
                            {formatBRL(p.previousPrice)}
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          {p.isFeatured && (
                            <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                              Destaque
                            </span>
                          )}
                          {p.isOffer && (
                            <span className="text-[10px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded">
                              Oferta
                            </span>
                          )}
                          {!p.isFeatured && !p.isOffer && (
                            <span className="text-slate-400 text-[11px]">—</span>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <button
                          onClick={() => handleTogglePublish(p)}
                          className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full cursor-pointer transition-colors ${
                            p.status === 'published'
                              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                              : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              p.status === 'published' ? 'bg-emerald-500' : 'bg-amber-500'
                            }`}
                          ></span>
                          <span>{p.status === 'published' ? 'Publicado' : 'Rascunho'}</span>
                        </button>
                      </td>

                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEditModal(p)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="Editar produto"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDuplicate(p)}
                            className="p-1.5 text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors cursor-pointer"
                            title="Duplicar produto"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(p.id)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Excluir produto"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <p className="text-slate-500 text-sm mb-4">
              Nenhum produto encontrado. Cadastre um novo produto ou importe via link.
            </p>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800"
            >
              <Plus className="w-4 h-4" />
              <span>Cadastrar Primeiro Produto</span>
            </button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl animate-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900 mb-2">Confirmar Exclusão</h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-6">
              Tem certeza que deseja excluir este produto? Esta ação removerá os dados permanentemente do banco de dados.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm"
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full my-8 max-h-[90vh] flex flex-col shadow-2xl animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {editingProduct ? 'Editar Produto' : 'Cadastrar Novo Produto'}
                </h3>
                <span className="text-xs text-slate-400">
                  Preencha os dados comerciais e de apresentação
                </span>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                  Informações Principais
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Nome do Produto *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      placeholder="Ex: Tênis Esportivo Confortável Ultra"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-600 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Slug (URL Amigável) *
                    </label>
                    <input
                      type="text"
                      required
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      placeholder="tenis-esportivo-confortavel"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:border-blue-600 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Preço Atual (R$) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={currentPrice}
                      onChange={(e) => setCurrentPrice(e.target.value)}
                      placeholder="199.90"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:border-blue-600 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Preço Anterior (Opcional)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={previousPrice}
                      onChange={(e) => setPreviousPrice(e.target.value)}
                      placeholder="299.90"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:border-blue-600 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Categoria Principal *
                    </label>
                    <select
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-600 cursor-pointer"
                    >
                      <option value="">Selecione uma categoria</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Link Externo de Compra *
                  </label>
                  <input
                    type="url"
                    required
                    value={externalUrl}
                    onChange={(e) => setExternalUrl(e.target.value)}
                    placeholder="https://loja-parceira.com.br/produto-original"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:border-blue-600 focus:bg-white"
                  />
                  <span className="text-[11px] text-slate-400 mt-0.5 block">
                    Ao clicar no botão de compra, o cliente será direcionado para este endereço oficial.
                  </span>
                </div>
              </div>

              {/* Images Section */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                  Imagens do Produto
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      URL da Imagem Principal
                    </label>
                    <input
                      type="text"
                      value={mainImage}
                      onChange={(e) => setMainImage(e.target.value)}
                      placeholder="https://... ou faça upload abaixo"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-600 focus:bg-white"
                    />
                    <div className="mt-2 flex items-center gap-2">
                      <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium cursor-pointer transition-colors">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Fazer Upload do Dispositivo</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleImageFileUpload(e, 'main')}
                        />
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Prévia da Imagem Principal
                    </label>
                    <div className="w-24 h-24 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden p-1">
                      {mainImage ? (
                        <img
                          src={mainImage}
                          alt="Prévia"
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <ImageIcon className="w-8 h-8 text-slate-300" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Additional Gallery */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Galeria de Imagens Adicionais
                  </label>
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="text"
                      value={newGalleryUrl}
                      onChange={(e) => setNewGalleryUrl(e.target.value)}
                      placeholder="URL de imagem adicional"
                      className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-600"
                    />
                    <button
                      type="button"
                      onClick={handleAddGalleryUrl}
                      className="px-3 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold"
                    >
                      Adicionar URL
                    </button>
                    <label className="inline-flex items-center gap-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium cursor-pointer">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageFileUpload(e, 'gallery')}
                      />
                    </label>
                  </div>

                  {gallery.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {gallery.map((img, i) => (
                        <div
                          key={i}
                          className="relative w-16 h-16 rounded-lg border border-slate-200 overflow-hidden bg-slate-50 p-1 group"
                        >
                          <img src={img} alt="" className="w-full h-full object-contain" />
                          <button
                            type="button"
                            onClick={() => handleRemoveGalleryImage(i)}
                            className="absolute top-1 right-1 bg-rose-600 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Descriptions & Specs */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                  Descrições e Ficha Técnica
                </h4>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Descrição Curta (Resumo)
                  </label>
                  <input
                    type="text"
                    value={shortDescription}
                    onChange={(e) => setShortDescription(e.target.value)}
                    placeholder="Destaque de 1 ou 2 frases sobre o produto"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Descrição Completa
                  </label>
                  <textarea
                    rows={4}
                    value={fullDescription}
                    onChange={(e) => setFullDescription(e.target.value)}
                    placeholder="Descrição detalhada com parágrafos, benefícios e materiais..."
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-600 focus:bg-white"
                  ></textarea>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Marca</label>
                    <input
                      type="text"
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      placeholder="Ex: Nike, Apple, Samsung"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">SKU</label>
                    <input
                      type="text"
                      value={sku}
                      onChange={(e) => setSku(e.target.value)}
                      placeholder="BRG-1049"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Texto do Botão
                    </label>
                    <input
                      type="text"
                      value={buttonText}
                      onChange={(e) => setButtonText(e.target.value)}
                      placeholder="Comprar no site oficial"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-600"
                    />
                  </div>
                </div>

                {/* Specifications Key-Value */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Especificações (Chave e Valor)
                  </label>
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="Nome (ex: Material)"
                      value={newSpecName}
                      onChange={(e) => setNewSpecName(e.target.value)}
                      className="w-1/3 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Valor (ex: Couro Legítimo)"
                      value={newSpecValue}
                      onChange={(e) => setNewSpecValue(e.target.value)}
                      className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    />
                    <button
                      type="button"
                      onClick={handleAddSpecification}
                      className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold"
                    >
                      Adicionar
                    </button>
                  </div>

                  {specifications.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      {specifications.map((s, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between text-xs bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100"
                        >
                          <span>
                            <strong>{s.name}:</strong> {s.value}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveSpecification(idx)}
                            className="text-rose-500 hover:text-rose-700"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Status and Visibility */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                  Visibilidade e Destaques
                </h4>

                <div className="flex flex-wrap items-center gap-6 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                    <input
                      type="checkbox"
                      checked={isFeatured}
                      onChange={(e) => setIsFeatured(e.target.checked)}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>Produto em Destaque na Página Inicial</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                    <input
                      type="checkbox"
                      checked={isOffer}
                      onChange={(e) => setIsOffer(e.target.checked)}
                      className="rounded text-rose-600 focus:ring-rose-500"
                    />
                    <span>Marcar como Oferta Especial</span>
                  </label>

                  <div className="flex items-center gap-2 ml-auto">
                    <span className="text-slate-500">Status:</span>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as any)}
                      className="px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-lg font-semibold text-xs text-slate-800"
                    >
                      <option value="published">Publicado</option>
                      <option value="draft">Rascunho</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Modal Footer Controls */}
              <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Salvando...' : 'Salvar Produto'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
