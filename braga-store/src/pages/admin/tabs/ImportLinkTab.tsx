import React, { useState } from 'react';
import {
  Link2,
  Search,
  CheckCircle2,
  AlertCircle,
  Save,
  ExternalLink,
  Sparkles,
  ArrowRight,
  Info,
} from 'lucide-react';
import { useStore } from '../../../context/StoreContext';
import { Product } from '../../../types';
import { saveProduct } from '../../../services/storeService';

export const ImportLinkTab: React.FC = () => {
  const { categories, refreshData, showToast, navigate } = useStore();

  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Editable Form fields populated from extraction
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [currentPrice, setCurrentPrice] = useState<string>('');
  const [previousPrice, setPreviousPrice] = useState<string>('');
  const [shortDescription, setShortDescription] = useState('');
  const [fullDescription, setFullDescription] = useState('');
  const [mainImage, setMainImage] = useState('');
  const [brand, setBrand] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [buttonText, setButtonText] = useState('Comprar no site oficial');
  const [status, setStatus] = useState<'published' | 'draft'>('published');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isOffer, setIsOffer] = useState(false);

  const [saving, setSaving] = useState(false);

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleExtract = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setExtractedData(null);

    if (!url.trim()) {
      setErrorMsg('Por favor, insira uma URL de produto válida.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/extract-metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Não foi possível extrair dados desta página.');
      }

      setExtractedData(data.data);
      setName(data.data.name || '');
      setSlug(generateSlug(data.data.name || 'novo-produto'));
      setCurrentPrice(data.data.currentPrice ? data.data.currentPrice.toString() : '');
      setShortDescription(data.data.description ? data.data.description.slice(0, 300) : '');
      setFullDescription(data.data.description || '');
      setMainImage(data.data.mainImage || '');
      setBrand(data.data.brand || '');
      setCategoryId(categories[0]?.id || '');
      showToast('Dados extraídos! Revise os campos antes de confirmar o cadastro.', 'info');
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Erro ao analisar URL.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      showToast('O nome do produto é obrigatório.', 'error');
      return;
    }

    const priceNum = parseFloat(currentPrice.replace(',', '.'));
    if (isNaN(priceNum) || priceNum <= 0) {
      showToast('Preço do produto deve ser maior que zero.', 'error');
      return;
    }

    setSaving(true);
    try {
      const parsedPrev = previousPrice ? parseFloat(previousPrice.replace(',', '.')) : undefined;

      const product: Product = {
        id: 'prod_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        name: name.trim(),
        slug: slug.trim() || generateSlug(name),
        externalUrl: url.trim(),
        currentPrice: priceNum,
        previousPrice: parsedPrev && parsedPrev > 0 ? parsedPrev : undefined,
        shortDescription: shortDescription.trim(),
        fullDescription: fullDescription.trim(),
        mainImage: mainImage.trim(),
        brand: brand.trim(),
        categoryId: categoryId || (categories[0]?.id || ''),
        buttonText: buttonText.trim(),
        isFeatured,
        isOffer,
        status,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await saveProduct(product);
      await refreshData();
      showToast('Produto cadastrado permanentemente com sucesso!', 'success');

      // Reset form
      setUrl('');
      setExtractedData(null);
    } catch (err: any) {
      showToast('Erro ao salvar produto: ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900">Cadastrar Produto por Link</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Informe a URL externa de um produto parceiro. O servidor realizará a análise de metadados com proteção SSRF e preencherá os campos encontrados.
        </p>
      </div>

      {/* Input URL Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
        <form onSubmit={handleExtract} className="space-y-4">
          <label className="block text-xs font-semibold text-slate-700">
            Endereço (URL) da Página do Produto *
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="url"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://exemplo.com.br/produto/tenis-esportivo"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:border-blue-600 focus:bg-white"
              />
              <Link2 className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-slate-900 hover:bg-blue-600 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 shrink-0 shadow-sm"
            >
              <Search className="w-4 h-4" />
              <span>{loading ? 'Analisando página...' : 'Analisar Link'}</span>
            </button>
          </div>

          <div className="flex items-start gap-2 text-[11px] text-slate-400">
            <Info className="w-4 h-4 shrink-0 text-slate-400 mt-0.5" />
            <span>
              Segurança: A extração utiliza verificação de DNS e bloqueia conexões privadas ou locais. Apenas dados públicos autorizados pelas tags da página são lidos.
            </span>
          </div>

          {errorMsg && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}
        </form>
      </div>

      {/* Extracted Form for Review & Confirmation */}
      {extractedData && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
            <div className="flex items-center gap-2 text-emerald-700 text-xs font-bold uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4" />
              <span>Dados Detectados — Revise antes de salvar</span>
            </div>
          </div>

          <form onSubmit={handleSaveProduct} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nome do Produto *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setSlug(generateSlug(e.target.value));
                  }}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Slug (URL amigável) *
                </label>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:border-blue-600 focus:bg-white"
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
                  placeholder="Ex: 149.90"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:border-blue-600 focus:bg-white"
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
                  placeholder="Ex: 199.90"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:border-blue-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Categoria *
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-600 cursor-pointer"
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  URL da Imagem
                </label>
                <input
                  type="text"
                  value={mainImage}
                  onChange={(e) => setMainImage(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Marca</label>
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="Marca identificada"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-600 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Descrição Curta
              </label>
              <input
                type="text"
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-600 focus:bg-white"
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
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-600 focus:bg-white"
              ></textarea>
            </div>

            {/* Flags */}
            <div className="flex flex-wrap items-center gap-6 text-xs pt-2">
              <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="rounded text-blue-600"
                />
                <span>Produto em Destaque</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={isOffer}
                  onChange={(e) => setIsOffer(e.target.checked)}
                  className="rounded text-rose-600"
                />
                <span>Marcar como Oferta</span>
              </label>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Gravando no banco...' : 'Confirmar e Publicar Produto'}</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
