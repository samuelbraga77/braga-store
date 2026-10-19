import React, { useState, useEffect } from 'react';
import {
  Star,
  CheckCircle2,
  Clock,
  Eye,
  EyeOff,
  Trash2,
  Filter,
  RefreshCw,
  Search,
  MessageSquare,
  AlertCircle,
  Package,
  ShieldCheck,
  X,
  ExternalLink,
} from 'lucide-react';
import { Review, Product } from '../../../types';
import {
  getReviews,
  updateReviewStatus,
  deleteReview,
  getProducts,
} from '../../../services/storeService';
import { useStore } from '../../../context/StoreContext';

export const ReviewsTab: React.FC = () => {
  const { showToast } = useStore();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'hidden'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewPhotoUrl, setViewPhotoUrl] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [fetchedReviews, fetchedProducts] = await Promise.all([
        getReviews(undefined, true),
        getProducts(true),
      ]);
      setReviews(fetchedReviews || []);
      setProducts(fetchedProducts || []);
    } catch (err) {
      console.error(err);
      showToast('Erro ao carregar avaliações.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateStatus = async (reviewId: string, newStatus: 'approved' | 'hidden' | 'pending') => {
    try {
      await updateReviewStatus(reviewId, newStatus);
      showToast(
        newStatus === 'approved'
          ? 'Avaliação aprovada e publicada na página do produto!'
          : newStatus === 'hidden'
          ? 'Avaliação ocultada do público.'
          : 'Status atualizado.',
        'success'
      );
      await loadData();
    } catch (err) {
      console.error(err);
      showToast('Erro ao alterar status da avaliação.', 'error');
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (!window.confirm('Tem certeza de que deseja excluir permanentemente esta avaliação?')) {
      return;
    }
    try {
      await deleteReview(reviewId);
      showToast('Avaliação excluída com sucesso.', 'info');
      await loadData();
    } catch (err) {
      console.error(err);
      showToast('Erro ao excluir avaliação.', 'error');
    }
  };

  const filteredReviews = reviews.filter((r) => {
    const product = products.find((p) => p.id === r.productId);
    const matchesSearch =
      r.authorName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.comment?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.orderId?.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (statusFilter === 'pending') return r.status === 'pending';
    if (statusFilter === 'approved') return r.status === 'approved';
    if (statusFilter === 'hidden') return r.status === 'hidden';

    return true;
  });

  const totalCount = reviews.length;
  const pendingCount = reviews.filter((r) => r.status === 'pending').length;
  const approvedCount = reviews.filter((r) => r.status === 'approved').length;
  const hiddenCount = reviews.filter((r) => r.status === 'hidden').length;

  const formatDateTime = (isoString?: string) => {
    if (!isoString) return '—';
    try {
      const date = new Date(isoString);
      return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-md border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span className="text-xs uppercase tracking-widest text-blue-400 font-bold">
              Moderação de Feedback
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Avaliações dos Produtos
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Modere as opiniões enviadas pelos clientes, aprove para exibição pública na página do respectivo produto ou oculte comentários indevidos.
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={loading}
          className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-colors cursor-pointer border border-slate-700"
          title="Atualizar lista de avaliações"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div
          onClick={() => setStatusFilter('all')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'all'
              ? 'bg-blue-50/70 border-blue-300 ring-2 ring-blue-500/20'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <span className="text-xs font-semibold text-slate-500 block mb-1">Total Recebidas</span>
          <span className="text-2xl font-extrabold text-slate-900 font-mono">{totalCount}</span>
        </div>

        <div
          onClick={() => setStatusFilter('pending')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'pending'
              ? 'bg-amber-50/70 border-amber-300 ring-2 ring-amber-500/20'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Pendentes</span>
            {pendingCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            )}
          </div>
          <span className="text-2xl font-extrabold text-amber-700 font-mono">{pendingCount}</span>
        </div>

        <div
          onClick={() => setStatusFilter('approved')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'approved'
              ? 'bg-emerald-50/70 border-emerald-300 ring-2 ring-emerald-500/20'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <span className="text-xs font-semibold text-slate-500 block mb-1">Aprovadas (Públicas)</span>
          <span className="text-2xl font-extrabold text-emerald-700 font-mono">{approvedCount}</span>
        </div>

        <div
          onClick={() => setStatusFilter('hidden')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'hidden'
              ? 'bg-slate-100 border-slate-400'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <span className="text-xs font-semibold text-slate-500 block mb-1">Ocultadas</span>
          <span className="text-2xl font-extrabold text-slate-600 font-mono">{hiddenCount}</span>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Buscar por cliente, produto ou texto..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto text-xs">
          <span className="text-slate-400 text-[11px] font-semibold mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Filtrar:
          </span>
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Todas ({totalCount})
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap cursor-pointer ${
              statusFilter === 'pending'
                ? 'bg-amber-600 text-white'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
            }`}
          >
            Pendentes ({pendingCount})
          </button>
          <button
            onClick={() => setStatusFilter('approved')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap cursor-pointer ${
              statusFilter === 'approved'
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
            }`}
          >
            Aprovadas ({approvedCount})
          </button>
          <button
            onClick={() => setStatusFilter('hidden')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap cursor-pointer ${
              statusFilter === 'hidden'
                ? 'bg-slate-800 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Ocultadas ({hiddenCount})
          </button>
        </div>
      </div>

      {/* Reviews List */}
      {loading ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs text-slate-500">Carregando avaliações...</p>
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center max-w-md mx-auto space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <MessageSquare className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Nenhuma avaliação encontrada</h3>
          <p className="text-xs text-slate-500">
            {searchQuery || statusFilter !== 'all'
              ? 'Nenhuma avaliação atende aos filtros de busca.'
              : 'Nenhuma avaliação enviada até o momento. As avaliações aparecerão aqui quando os clientes enviarem suas opiniões.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map((review) => {
            const product = products.find((p) => p.id === review.productId);

            return (
              <div
                key={review.id}
                className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm hover:border-slate-300 transition-all space-y-4"
              >
                {/* Header: Product link, status badge and author info */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    {product?.mainImage ? (
                      <img
                        src={product.mainImage}
                        alt={product.name}
                        className="w-11 h-11 rounded-xl object-cover bg-slate-50 border border-slate-200 shrink-0"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                        <Package className="w-5 h-5" />
                      </div>
                    )}
                    <div>
                      <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wider block">
                        Produto Avaliado
                      </span>
                      <span className="text-sm font-bold text-slate-900 block">
                        {product ? product.name : 'Produto ID: ' + review.productId}
                      </span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center gap-2">
                    {review.status === 'approved' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Aprovada (Visível)
                      </span>
                    )}
                    {review.status === 'pending' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        Pendente de Moderação
                      </span>
                    )}
                    {review.status === 'hidden' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        <EyeOff className="w-3.5 h-3.5 text-slate-500" />
                        Ocultada
                      </span>
                    )}
                  </div>
                </div>

                {/* Body: Rating, Comment, Photo, Customer Info */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  {/* Left Column: Author and Stars */}
                  <div className="md:col-span-4 space-y-2 text-xs">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= review.rating
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-slate-200'
                          }`}
                        />
                      ))}
                      <span className="font-bold text-slate-800 ml-1">
                        {review.rating}.0
                      </span>
                    </div>

                    <div>
                      <span className="font-bold text-slate-900 block text-sm">
                        {review.authorName}
                      </span>
                      {review.isVerifiedPurchase && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 mt-0.5">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" /> Compra Verificada
                        </span>
                      )}
                      {review.orderId && (
                        <span className="text-[10px] text-slate-400 font-mono block">
                          Pedido: {review.orderId}
                        </span>
                      )}
                      <span className="text-[10px] text-slate-400 block mt-1">
                        Data: {formatDateTime(review.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* Middle Column: Review Text & Photo */}
                  <div className="md:col-span-8 space-y-3">
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50/70 p-3.5 rounded-2xl border border-slate-100">
                      “{review.comment}”
                    </p>

                    {review.photoUrl && (
                      <div className="flex items-center gap-3">
                        <div
                          onClick={() => setViewPhotoUrl(review.photoUrl!)}
                          className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-200 cursor-pointer group shadow-xs"
                          title="Clique para ver a foto enviada pelo cliente"
                        >
                          <img
                            src={review.photoUrl}
                            alt="Foto do cliente"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                            <Eye className="w-4 h-4" />
                          </div>
                        </div>
                        <span className="text-[11px] text-slate-500">
                          Foto anexada pelo cliente ao avaliar o produto
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Actions: Moderation Buttons */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-[11px] text-slate-400">
                    ID da Avaliação: <span className="font-mono">{review.id}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {review.status !== 'approved' && (
                      <button
                        onClick={() => handleUpdateStatus(review.id, 'approved')}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Aprovar Avaliação</span>
                      </button>
                    )}

                    {review.status !== 'hidden' && (
                      <button
                        onClick={() => handleUpdateStatus(review.id, 'hidden')}
                        className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <EyeOff className="w-3.5 h-3.5" />
                        <span>Ocultar</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleDelete(review.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                      title="Excluir permanentemente"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Photo Modal */}
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
