import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  ExternalLink, 
  MessageCircle, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  Star, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Share2,
  Check,
  Zap,
  Tag,
  ChevronRight
} from 'lucide-react';
import { Product, StoreSettings, ViewRoute } from '../../types';
import { formatCurrencyBRL, calculateDiscount, calculateInstallments } from '../../utils/formatters';
import { OptimizedImage } from '../common/OptimizedImage';
import { ProductCard } from './ProductCard';

interface ProductDetailProps {
  product: Product;
  allProducts: Product[];
  settings: StoreSettings;
  onNavigate: (route: ViewRoute) => void;
}

export const ProductDetail: React.FC<ProductDetailProps> = ({
  product,
  allProducts,
  settings,
  onNavigate
}) => {
  const [selectedImage, setSelectedImage] = useState<string>(product.mainImage || (product.images && product.images[0]) || '');
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'shipping'>('desc');
  const [copiedLink, setCopiedLink] = useState(false);

  // Sync selected image if product changes
  useEffect(() => {
    setSelectedImage(product.mainImage || (product.images && product.images[0]) || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // SEO updates
    document.title = `${product.title} — Braga Store`;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', product.description.slice(0, 160));
    }
  }, [product]);

  const discount = calculateDiscount(product.price, product.promoPrice);
  const activePrice = product.promoPrice || product.price;
  const installments = calculateInstallments(activePrice);

  const imagesList = product.images && product.images.length > 0
    ? Array.from(new Set([product.mainImage, ...product.images])).filter(Boolean)
    : [product.mainImage];

  // Related products from same category
  const relatedProducts = allProducts
    .filter(p => p.id !== product.id && p.status === 'active' && p.category.toLowerCase() === product.category.toLowerCase())
    .slice(0, 4);

  const handleExternalBuy = () => {
    if (product.buyUrl) {
      window.open(product.buyUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleWhatsAppInquiry = () => {
    const rawNumber = settings.whatsapp ? settings.whatsapp.replace(/\D/g, '') : '5511987654321';
    const message = encodeURIComponent(`Olá! Tenho interesse no produto: "${product.title}" (${window.location.href}). Poderia me passar mais detalhes?`);
    window.open(`https://wa.me/${rawNumber}?text=${message}`, '_blank', 'noopener,noreferrer');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.title,
          text: product.description.slice(0, 100),
          url: window.location.href,
        });
      } catch {
        // fallback
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  return (
    <div className="bg-slate-50 py-8 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-slate-500 mb-6 overflow-x-auto no-scrollbar">
          <button 
            onClick={() => onNavigate({ type: 'home' })}
            className="hover:text-indigo-600 transition-colors shrink-0"
          >
            Início
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <button 
            onClick={() => onNavigate({ type: 'catalog' })}
            className="hover:text-indigo-600 transition-colors shrink-0"
          >
            Produtos
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <button 
            onClick={() => onNavigate({ type: 'catalog', category: product.category })}
            className="hover:text-indigo-600 transition-colors shrink-0 capitalize"
          >
            {product.category}
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="text-slate-800 font-semibold truncate shrink-0 max-w-[200px] sm:max-w-xs">
            {product.title}
          </span>
        </nav>

        {/* Back Button */}
        <button
          onClick={() => onNavigate({ type: 'catalog' })}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-indigo-600 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para o catálogo</span>
        </button>

        {/* Main Product Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 bg-white rounded-3xl p-6 sm:p-8 lg:p-10 border border-slate-200/80 shadow-xs mb-12">
          
          {/* Gallery Column */}
          <div className="lg:col-span-6 space-y-4">
            <div className="relative rounded-2xl overflow-hidden bg-slate-100 aspect-square border border-slate-200">
              <OptimizedImage
                src={selectedImage}
                alt={product.title}
                aspectRatio="square"
                priority={true}
                className="w-full h-full object-cover"
              />

              {discount > 0 && (
                <div className="absolute top-4 left-4 px-3 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-extrabold uppercase shadow-md flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 fill-white" />
                  {discount}% DE DESCONTO
                </div>
              )}
            </div>

            {/* Thumbnail Carousel/List */}
            {imagesList.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar">
                {imagesList.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImage(img)}
                    className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                      selectedImage === img
                        ? 'border-indigo-600 ring-2 ring-indigo-100'
                        : 'border-slate-200 hover:border-slate-300 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.title} miniatura ${idx + 1}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info & Action Column */}
          <div className="lg:col-span-6 flex flex-col justify-between">
            <div>
              {/* Category & Status */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                <span className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-wider">
                  <Tag className="w-3 h-3" />
                  {product.category}
                </span>

                <div className="flex items-center gap-2">
                  {product.stockStatus === 'in_stock' && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Pronta Entrega
                    </span>
                  )}
                  {product.stockStatus === 'low_stock' && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      Poucas Unidades
                    </span>
                  )}
                  {product.stockStatus === 'out_of_stock' && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg">
                      <XCircle className="w-3.5 h-3.5 text-rose-600" />
                      Temporariamente Indisponível
                    </span>
                  )}
                </div>
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight mb-4">
                {product.title}
              </h1>

              {/* Verified Rating */}
              <div className="flex items-center gap-2 pb-4 mb-6 border-b border-slate-100 text-xs">
                <div className="flex items-center text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <span className="font-bold text-slate-800">5.0</span>
                <span className="text-slate-400">|</span>
                <span className="text-slate-500 font-medium">Avaliações verificadas de clientes</span>
              </div>

              {/* Price Block */}
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 mb-6">
                {product.promoPrice && product.promoPrice < product.price && (
                  <div className="flex items-center gap-3 text-xs mb-1">
                    <span className="text-slate-400 line-through">
                      De {formatCurrencyBRL(product.price)}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-700 font-extrabold">
                      Economize {formatCurrencyBRL(product.price - product.promoPrice)}
                    </span>
                  </div>
                )}

                <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                  {formatCurrencyBRL(activePrice)}
                </div>

                <p className="text-xs text-slate-600 mt-1">
                  Ou em até <span className="font-bold text-slate-900">{installments.count}x</span> de <span className="font-bold text-indigo-600">{formatCurrencyBRL(installments.value)}</span> no cartão
                </p>

                <p className="text-[11px] text-emerald-700 font-semibold mt-2 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  Desconto especial aplicado para pagamento à vista ou parcelado
                </p>
              </div>

              {/* CTAs */}
              <div className="space-y-3 mb-6">
                <button
                  type="button"
                  onClick={handleExternalBuy}
                  disabled={product.stockStatus === 'out_of_stock'}
                  className={`w-full py-4 px-6 rounded-2xl font-black text-base transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer ${
                    product.stockStatus === 'out_of_stock'
                      ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/30 hover:scale-[1.01]'
                  }`}
                >
                  <span>COMPRAR AGORA NO SITE OFICIAL</span>
                  <ExternalLink className="w-5 h-5" />
                </button>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={handleWhatsAppInquiry}
                    className="py-3 px-4 rounded-xl border border-emerald-500/30 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-600" />
                    <span>Dúvidas no WhatsApp</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleShare}
                    className="py-3 px-4 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Share2 className="w-4 h-4 text-slate-500" />
                    <span>{copiedLink ? 'Link Copiado!' : 'Compartilhar'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Trust Assurances */}
            <div className="grid grid-cols-3 gap-3 pt-6 border-t border-slate-100 text-[11px] text-slate-500 text-center">
              <div className="flex flex-col items-center">
                <ShieldCheck className="w-5 h-5 text-indigo-600 mb-1" />
                <span className="font-semibold text-slate-800">Original & Seguro</span>
                <span>Garantia de 7 dias</span>
              </div>
              <div className="flex flex-col items-center">
                <Truck className="w-5 h-5 text-indigo-600 mb-1" />
                <span className="font-semibold text-slate-800">Envio Confiável</span>
                <span>Código rastreável</span>
              </div>
              <div className="flex flex-col items-center">
                <RotateCcw className="w-5 h-5 text-indigo-600 mb-1" />
                <span className="font-semibold text-slate-800">Troca Fácil</span>
                <span>Atendimento humanizado</span>
              </div>
            </div>

          </div>

        </div>

        {/* Detailed Tabs: Description, Specs, Shipping */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 lg:p-10 border border-slate-200/80 shadow-xs mb-16">
          <div className="flex items-center gap-4 border-b border-slate-200 pb-4 mb-6 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab('desc')}
              className={`pb-2 text-sm font-bold transition-all relative shrink-0 ${
                activeTab === 'desc'
                  ? 'text-indigo-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-indigo-600'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Descrição Completa
            </button>
            <button
              onClick={() => setActiveTab('specs')}
              className={`pb-2 text-sm font-bold transition-all relative shrink-0 ${
                activeTab === 'specs'
                  ? 'text-indigo-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-indigo-600'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Especificações & Destaques
            </button>
            <button
              onClick={() => setActiveTab('shipping')}
              className={`pb-2 text-sm font-bold transition-all relative shrink-0 ${
                activeTab === 'shipping'
                  ? 'text-indigo-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-indigo-600'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Entrega & Garantia
            </button>
          </div>

          <div className="text-sm text-slate-700 leading-relaxed max-w-4xl">
            {activeTab === 'desc' && (
              <div className="space-y-4 whitespace-pre-line">
                <p>{product.description}</p>
                <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
                  <span className="font-bold text-slate-800 block mb-1">Nota sobre compra segura:</span>
                  Ao clicar em comprar, você será direcionado para a página de checkout oficial da Braga Store ou parceiro autorizado para concluir seu pedido com segurança criptografada.
                </div>
              </div>
            )}

            {activeTab === 'specs' && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-xs text-slate-400 block">Categoria</span>
                    <span className="font-semibold text-slate-800">{product.category}</span>
                  </div>
                  {product.subcategory && (
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-xs text-slate-400 block">Subcategoria</span>
                      <span className="font-semibold text-slate-800">{product.subcategory}</span>
                    </div>
                  )}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-xs text-slate-400 block">Disponibilidade</span>
                    <span className="font-semibold text-slate-800">
                      {product.stockStatus === 'in_stock' ? 'Em Estoque para Envio Imediato' : 'Consulte disponibilidade'}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-xs text-slate-400 block">Código / SKU</span>
                    <span className="font-mono text-xs text-slate-800">{product.id}</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'shipping' && (
              <div className="space-y-4">
                <p>
                  <strong>Envio Rastreado:</strong> Todos os pedidos são despachados com seguro e código de rastreamento para que você acompanhe cada etapa da entrega até a sua porta.
                </p>
                <p>
                  <strong>Garantia Incondicional de 7 Dias:</strong> Se por qualquer razão você não ficar 100% satisfeito com o produto, garantimos a devolução do seu valor conforme o Código de Defesa do Consumidor.
                </p>
                <p>
                  <strong>Suporte Humanizado:</strong> Qualquer dúvida ou assistência técnica pós-venda pode ser solicitada diretamente ao nosso time pelo WhatsApp ou e-mail de suporte.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Related Products Grid */}
        {relatedProducts.length > 0 && (
          <div className="mb-16">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-6">
              Produtos Relacionados
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map(p => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onNavigate={onNavigate}
                />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
