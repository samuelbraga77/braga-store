import React, { useState, useEffect } from 'react';
import {
  ExternalLink,
  Share2,
  ChevronRight,
  ShieldCheck,
  CheckCircle,
  Truck,
  ArrowLeft,
  AlertCircle,
  Tag,
  Star,
  MessageSquare,
  Camera,
  CheckCircle2,
  Upload,
  X,
  Eye,
  Clock,
  User,
  RefreshCw,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { ProductCard } from '../../components/public/ProductCard';
import { Review } from '../../types';
import { getReviews, submitReview } from '../../services/storeService';

interface ProductDetailPageProps {
  slugOrId: string;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ slugOrId }) => {
  const { products, categories, navigate, showToast } = useStore();

  const product = products.find(
    (p) => (p.slug === slugOrId || p.id === slugOrId) && p.status === 'published'
  );

  const category = categories.find((c) => c.id === product?.categoryId);
  const [selectedImage, setSelectedImage] = useState<string>('');

  // Reviews State (Product-specific)
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [viewPhotoUrl, setViewPhotoUrl] = useState<string | null>(null);

  // Review Form State
  const [reviewForm, setReviewForm] = useState({
    authorName: '',
    rating: 5,
    comment: '',
    orderId: '',
  });
  const [previewReviewPhoto, setPreviewReviewPhoto] = useState<string | null>(null);

  const loadProductReviews = async (productId: string) => {
    setLoadingReviews(true);
    try {
      const data = await getReviews(productId, false);
      setReviews(data || []);
    } catch (err) {
      console.error('Erro ao carregar avaliações do produto:', err);
    } finally {
      setLoadingReviews(false);
    }
  };

  useEffect(() => {
    if (product) {
      setSelectedImage(product.mainImage || (product.gallery && product.gallery[0]) || '');
      document.title = product.seoTitle || `${product.name} — ${category?.name || 'Braga Store'}`;
      loadProductReviews(product.id);
    }
  }, [product, category]);

  if (!product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-16 text-center">
        <AlertCircle className="w-12 h-12 text-slate-400 mb-4" />
        <h2 className="text-xl font-bold text-slate-900 mb-2">Produto não encontrado</h2>
        <p className="text-sm text-slate-500 mb-6 max-w-md">
          O produto que você procura pode ter sido despublicado ou o link está incorreto.
        </p>
        <button
          onClick={() => navigate('/produtos')}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar ao catálogo</span>
        </button>
      </div>
    );
  }

  const allImages = [
    ...(product.mainImage ? [product.mainImage] : []),
    ...(product.gallery || []),
  ].filter(Boolean);

  const formatBRL = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(val);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast('Link do produto copiado com sucesso!', 'info');
    }
  };

  // Review photo selection with compression
  const handleReviewPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Por favor selecione um arquivo de imagem.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 1000;
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', 0.8);
          setPreviewReviewPhoto(compressed);
        }
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewForm.authorName.trim() || !reviewForm.comment.trim()) {
      showToast('Preencha seu nome e comentário.', 'error');
      return;
    }

    setIsSubmittingReview(true);
    try {
      await submitReview({
        productId: product.id,
        authorName: reviewForm.authorName.trim(),
        rating: reviewForm.rating,
        comment: reviewForm.comment.trim(),
        photoUrl: previewReviewPhoto || undefined,
        orderId: reviewForm.orderId.trim() || undefined,
        isVerifiedPurchase: !!reviewForm.orderId.trim(),
      });

      showToast(
        'Obrigado! Sua avaliação foi enviada com sucesso e será publicada após a aprovação da nossa equipe.',
        'success'
      );
      setIsReviewModalOpen(false);
      setReviewForm({
        authorName: '',
        rating: 5,
        comment: '',
        orderId: '',
      });
      setPreviewReviewPhoto(null);
    } catch (err) {
      console.error(err);
      showToast('Erro ao enviar avaliação. Tente novamente.', 'error');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Review calculations
  const totalReviews = reviews.length;
  const averageRating =
    totalReviews > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
      : '5.0';

  const ratingCounts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach((r) => {
    const star = Math.min(5, Math.max(1, Math.round(r.rating)));
    ratingCounts[star] = (ratingCounts[star] || 0) + 1;
  });

  const formatReviewDate = (isoString?: string) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }).format(d);
    } catch {
      return '';
    }
  };

  const relatedProducts = products
    .filter(
      (p) =>
        p.id !== product.id &&
        p.status === 'published' &&
        (p.categoryId === product.categoryId || category?.id === p.categoryId)
    )
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-slate-50/50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs text-slate-500 mb-8 overflow-x-auto whitespace-nowrap">
          <button onClick={() => navigate('/')} className="hover:text-slate-900 cursor-pointer">
            Início
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <button onClick={() => navigate('/produtos')} className="hover:text-slate-900 cursor-pointer">
            Produtos
          </button>
          {category && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <button
                onClick={() => navigate(`/categoria/${category.slug}`)}
                className="hover:text-slate-900 cursor-pointer"
              >
                {category.name}
              </button>
            </>
          )}
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-900 font-semibold truncate max-w-xs">{product.name}</span>
        </nav>

        {/* Product Hero Section */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-sm mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Gallery Column (lg:col-span-7) */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              {/* Main Image Stage */}
              <div className="relative aspect-square w-full bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 flex items-center justify-center p-6">
                {selectedImage ? (
                  <img
                    src={selectedImage}
                    alt={product.imageAlt || product.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain mix-blend-multiply"
                  />
                ) : (
                  <div className="text-slate-300 text-center">
                    <span className="text-5xl mb-2 block">🏷️</span>
                    <span className="text-xs text-slate-400">Sem imagem disponível</span>
                  </div>
                )}

                {product.isOffer && (
                  <div className="absolute top-4 left-4 bg-rose-600 text-white text-xs font-bold px-3 py-1 rounded-md uppercase tracking-wider shadow-sm">
                    Oferta Confirmada
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {allImages.length > 1 && (
                <div className="flex items-center gap-3 overflow-x-auto pb-2">
                  {allImages.map((imgUrl, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(imgUrl)}
                      className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 bg-slate-50 shrink-0 p-1 transition-all cursor-pointer ${
                        selectedImage === imgUrl
                          ? 'border-blue-600 shadow-sm scale-105'
                          : 'border-slate-200 hover:border-slate-300 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={imgUrl}
                        alt={`Miniatura ${idx + 1}`}
                        className="w-full h-full object-contain mix-blend-multiply"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Details & Purchase Module (lg:col-span-5) */}
            <div className="lg:col-span-5 flex flex-col justify-between">
              <div>
                {/* Brand / Category kicker */}
                <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                  <span className="uppercase tracking-widest font-semibold text-blue-600">
                    {product.brand || category?.name || 'Catálogo'}
                  </span>
                  {product.sku && <span className="font-mono">SKU: {product.sku}</span>}
                </div>

                {/* Title */}
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mb-3 leading-tight">
                  {product.name}
                </h1>

                {/* Rating summary under title */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center text-amber-400">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-4 h-4 ${
                          s <= Math.round(Number(averageRating))
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-slate-800">
                    {totalReviews > 0 ? averageRating : '5.0'}
                  </span>
                  <span className="text-slate-300">·</span>
                  <a
                    href="#avaliacoes"
                    className="text-xs text-blue-600 hover:underline cursor-pointer"
                  >
                    {totalReviews > 0
                      ? `${totalReviews} ${totalReviews === 1 ? 'avaliação' : 'avaliações'}`
                      : 'Avaliações de clientes'}
                  </a>
                </div>

                {/* Short Description */}
                {product.shortDescription && (
                  <p className="text-sm text-slate-600 leading-relaxed mb-6">
                    {product.shortDescription}
                  </p>
                )}

                {/* Price Box */}
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 mb-6">
                  {product.previousPrice && product.previousPrice > product.currentPrice && (
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-slate-400 line-through font-mono tabular-nums">
                        De: {formatBRL(product.previousPrice)}
                      </span>
                      <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                        Economia de{' '}
                        {formatBRL(product.previousPrice - product.currentPrice)}
                      </span>
                    </div>
                  )}
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-mono tabular-nums">
                      {formatBRL(product.currentPrice)}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-2">
                    * Preço verificado e sujeito a alterações na loja parceira oficial.
                  </p>
                </div>

                {/* Primary Buy CTA */}
                {product.externalUrl ? (
                  <div className="space-y-3 mb-6">
                    <a
                      href={product.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold text-base rounded-xl transition-all shadow-lg hover:shadow-blue-500/25 cursor-pointer text-center"
                    >
                      <span>{product.buttonText || 'Comprar no site oficial'}</span>
                      <ExternalLink className="w-5 h-5" />
                    </a>
                    <p className="text-[11px] text-slate-400 text-center">
                      Você será redirecionado para o ambiente seguro da loja parceira.
                    </p>
                  </div>
                ) : (
                  <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs mb-6">
                    Link de compra em atualização.
                  </div>
                )}
              </div>

              {/* Trust Badges & Share */}
              <div className="pt-6 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Transação segura no fornecedor parceiro</span>
                  </div>
                  <button
                    onClick={handleShare}
                    className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                    title="Compartilhar produto"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Specifications & Detailed Description */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
          {/* Full Description (col-span-8) */}
          <div className="lg:col-span-8 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 mb-4 pb-3 border-b border-slate-100">
              Descrição do Produto
            </h2>
            <div className="prose prose-slate max-w-none text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {product.fullDescription || product.shortDescription || 'Sem descrição detalhada adicional.'}
            </div>
          </div>

          {/* Specifications Table (col-span-4) */}
          <div className="lg:col-span-4 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm h-fit">
            <h2 className="text-lg font-bold text-slate-900 mb-4 pb-3 border-b border-slate-100">
              Ficha Técnica
            </h2>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Marca:</span>
                <span className="font-semibold text-slate-800">{product.brand || 'Não informada'}</span>
              </div>
              {product.sku && (
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Código / SKU:</span>
                  <span className="font-mono text-slate-800">{product.sku}</span>
                </div>
              )}
              {category && (
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Categoria:</span>
                  <span className="font-semibold text-slate-800">{category.name}</span>
                </div>
              )}
              {product.specifications &&
                product.specifications.map((spec, i) => (
                  <div key={i} className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">{spec.name}:</span>
                    <span className="font-semibold text-slate-800 text-right">{spec.value}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* SECTION 6: PRODUCT REVIEWS & RATINGS */}
        <div id="avaliacoes" className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-sm mb-16">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-8 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                  Opiniões Reais
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Avaliações do Produto
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Veja o que os clientes que receberam este item têm a dizer.
              </p>
            </div>

            <button
              onClick={() => setIsReviewModalOpen(true)}
              className="px-5 py-3 bg-slate-900 hover:bg-blue-600 text-white rounded-2xl text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center gap-2"
            >
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span>Avaliar este produto</span>
            </button>
          </div>

          {/* Rating Summary Bar */}
          <div className="py-8 border-b border-slate-100 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            {/* Score Block */}
            <div className="md:col-span-4 flex flex-col items-center justify-center p-6 bg-slate-50 rounded-2xl border border-slate-100 text-center">
              <span className="text-5xl font-black text-slate-900 font-mono tracking-tight mb-2">
                {totalReviews > 0 ? averageRating : '5.0'}
              </span>
              <div className="flex items-center gap-1 text-amber-400 mb-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-5 h-5 ${
                      s <= Math.round(Number(averageRating))
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-200'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-slate-500 font-medium">
                {totalReviews > 0
                  ? `Baseado em ${totalReviews} ${totalReviews === 1 ? 'avaliação aprovada' : 'avaliações aprovadas'}`
                  : 'Nenhuma avaliação publicada ainda'}
              </span>
            </div>

            {/* Star Distribution Bars */}
            <div className="md:col-span-8 space-y-2 text-xs">
              {[5, 4, 3, 2, 1].map((stars) => {
                const count = ratingCounts[stars] || 0;
                const pct = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : stars === 5 ? 100 : 0;
                return (
                  <div key={stars} className="flex items-center gap-3">
                    <span className="w-14 text-slate-600 font-semibold flex items-center gap-1 shrink-0">
                      <span>{stars}</span>
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    </span>
                    <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-amber-400 rounded-full transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                    <span className="w-10 text-right text-slate-400 font-mono text-[11px] shrink-0">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Reviews List */}
          <div className="pt-8">
            {loadingReviews ? (
              <div className="text-center py-10">
                <RefreshCw className="w-6 h-6 animate-spin text-blue-600 mx-auto mb-2" />
                <span className="text-xs text-slate-400">Carregando avaliações...</span>
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-12 max-w-md mx-auto space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center mx-auto">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Seja o primeiro a avaliar!</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Comprou este produto através da nossa recomendação? Compartilhe sua experiência com outros visitantes da Braga Store.
                </p>
                <button
                  onClick={() => setIsReviewModalOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer shadow-xs"
                >
                  <Star className="w-3.5 h-3.5 fill-white" />
                  <span>Escrever Primeira Avaliação</span>
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-6 rounded-2xl bg-slate-50/70 border border-slate-100 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-600/10 text-blue-700 flex items-center justify-center font-bold text-sm shrink-0">
                          {rev.authorName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-900">
                              {rev.authorName}
                            </span>
                            {rev.isVerifiedPurchase && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Compra Verificada
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-400 block">
                            {formatReviewDate(rev.createdAt)}
                          </span>
                        </div>
                      </div>

                      {/* Stars */}
                      <div className="flex items-center gap-0.5 text-amber-400">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-4 h-4 ${
                              s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Comment */}
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                      {rev.comment}
                    </p>

                    {/* Customer Photo */}
                    {rev.photoUrl && (
                      <div className="pt-2">
                        <div
                          onClick={() => setViewPhotoUrl(rev.photoUrl!)}
                          className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-200 bg-white cursor-pointer group shadow-xs"
                          title="Clique para ampliar a foto do produto recebido"
                        >
                          <img
                            src={rev.photoUrl}
                            alt="Foto do produto enviado pelo cliente"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                            <Eye className="w-4 h-4" />
                          </div>
                        </div>
                        <span className="text-[10px] text-slate-400 block mt-1">
                          Foto enviada pelo cliente
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Related Products (Only if real ones exist) */}
        {relatedProducts.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-6">
              Produtos Relacionados
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {relatedProducts.map((rel) => (
                <ProductCard key={rel.id} product={rel} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* MODAL: Enviar Avaliação */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center font-bold">
                  <Star className="w-5 h-5 fill-amber-400" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900">
                    Avaliar {product.name}
                  </h3>
                  <span className="text-xs text-slate-500">
                    Sua opinião sincera ajuda outros compradores
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsReviewModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-4">
              {/* Star Rating Interactive Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Sua Nota Geral *
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                      className="p-1 cursor-pointer transition-transform hover:scale-110 focus:outline-none"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          star <= reviewForm.rating
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-200'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-slate-700 ml-2">
                    {reviewForm.rating === 5
                      ? 'Excelente ⭐⭐⭐⭐⭐'
                      : reviewForm.rating === 4
                      ? 'Muito Bom ⭐⭐⭐⭐'
                      : reviewForm.rating === 3
                      ? 'Bom ⭐⭐⭐'
                      : reviewForm.rating === 2
                      ? 'Regular ⭐⭐'
                      : 'Ruim ⭐'}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Seu Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Maria Fernanda"
                  value={reviewForm.authorName}
                  onChange={(e) =>
                    setReviewForm({ ...reviewForm, authorName: e.target.value })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Código do Pedido (Opcional - garante selo de Compra Verificada)
                </label>
                <input
                  type="text"
                  placeholder="Ex: #BRG-10291"
                  value={reviewForm.orderId}
                  onChange={(e) =>
                    setReviewForm({ ...reviewForm, orderId: e.target.value })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Comentário / Detalhes da Experiência *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Conte o que achou do acabamento, qualidade, tempo de entrega e atendimento..."
                  value={reviewForm.comment}
                  onChange={(e) =>
                    setReviewForm({ ...reviewForm, comment: e.target.value })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white resize-none"
                ></textarea>
              </div>

              {/* Photo Upload */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Foto do Produto Recebido (Opcional)
                </label>
                <div className="relative border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-4 text-center transition-colors bg-slate-50/50">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleReviewPhotoChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex items-center justify-center gap-2 text-xs text-slate-600">
                    <Camera className="w-4 h-4 text-blue-600" />
                    <span>Clique para anexar uma foto do produto</span>
                  </div>
                </div>

                {previewReviewPhoto && (
                  <div className="mt-3 flex items-center gap-3 p-2 bg-slate-100 rounded-xl">
                    <img
                      src={previewReviewPhoto}
                      alt="Prévia da foto"
                      className="w-12 h-12 object-cover rounded-lg border border-slate-200"
                    />
                    <div className="flex-1 text-[11px] text-slate-600">
                      Foto anexada pronta para envio
                    </div>
                    <button
                      type="button"
                      onClick={() => setPreviewReviewPhoto(null)}
                      className="text-xs text-rose-600 font-semibold cursor-pointer px-2 py-1"
                    >
                      Remover
                    </button>
                  </div>
                )}
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl text-[11px] text-blue-900 leading-relaxed">
                <span className="font-bold block mb-0.5">Moderação de Avaliações:</span>
                Para garantir a integridade da comunidade, sua avaliação será revisada pela equipe e publicada em breve na página do produto.
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(false)}
                  disabled={isSubmittingReview}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-300 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-2 shadow-sm"
                >
                  {isSubmittingReview ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Star className="w-4 h-4 fill-white" />
                  )}
                  <span>Enviar Avaliação</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lightbox Modal for Customer Photo */}
      {viewPhotoUrl && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col items-center">
            <div className="w-full flex items-center justify-between pb-3 border-b border-slate-800 mb-4 text-white">
              <span className="text-xs font-semibold">Foto enviada pelo cliente</span>
              <button
                onClick={() => setViewPhotoUrl(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="max-h-[75vh] overflow-auto flex items-center justify-center w-full">
              <img
                src={viewPhotoUrl}
                alt="Foto do cliente em alta resolução"
                className="max-h-[70vh] max-w-full object-contain rounded-xl shadow-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
