import React, { useState, useEffect } from 'react';
import {
  Truck,
  CheckCircle2,
  Clock,
  Camera,
  Upload,
  AlertTriangle,
  Eye,
  RefreshCw,
  Search,
  Filter,
  FileCheck,
  Star,
  User,
  Package,
  Calendar,
  X,
  PlusCircle,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Trash2,
} from 'lucide-react';
import { Order, Product } from '../../../types';
import {
  getOrders,
  saveOrder,
  markOrderDelivered,
  attachOrderDeliveryProof,
  deleteOrder,
  getProducts,
} from '../../../services/storeService';
import { useStore } from '../../../context/StoreContext';

export const LogisticsTab: React.FC = () => {
  const { showToast } = useStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [catalogProducts, setCatalogProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'delivered' | 'pending' | 'no-proof' | 'no-review'>('all');

  // Selected Order for Details View / Modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Mark as Delivered Confirmation Modal
  const [deliveryConfirmModal, setDeliveryConfirmModal] = useState<Order | null>(null);
  const [isUpdatingDelivery, setIsUpdatingDelivery] = useState(false);

  // Delivery Proof Modal
  const [proofModalOrder, setProofModalOrder] = useState<Order | null>(null);
  const [previewProofImage, setPreviewProofImage] = useState<string | null>(null);
  const [isSavingProof, setIsSavingProof] = useState(false);
  const [replaceConfirm, setReplaceConfirm] = useState(false);

  // Fullscreen Photo Modal
  const [viewPhotoUrl, setViewPhotoUrl] = useState<string | null>(null);

  // New Order Registration Modal (for linking real incoming customer orders)
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);
  const [newOrderForm, setNewOrderForm] = useState({
    orderCode: '',
    productId: '',
    customerName: '',
    customerEmail: '',
    customerCity: '',
    amount: '',
    status: 'shipped' as 'pending' | 'shipped' | 'delivered',
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [fetchedOrders, fetchedProducts] = await Promise.all([
        getOrders(),
        getProducts(true),
      ]);
      setOrders(fetchedOrders || []);
      setCatalogProducts(fetchedProducts || []);
    } catch (err) {
      console.error('Erro ao carregar dados de logística:', err);
      showToast('Erro ao carregar pedidos.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter & Search Logic
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.productName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.id?.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (statusFilter === 'delivered') return order.status === 'delivered';
    if (statusFilter === 'pending') return order.status !== 'delivered';
    if (statusFilter === 'no-proof') return order.status === 'delivered' && !order.deliveryProofPhoto;
    if (statusFilter === 'no-review') return order.status === 'delivered' && (!order.reviewStatus || order.reviewStatus === 'unreviewed');

    return true;
  });

  // Metrics
  const totalOrders = orders.length;
  const deliveredCount = orders.filter((o) => o.status === 'delivered').length;
  const pendingCount = orders.filter((o) => o.status !== 'delivered').length;
  const deliveredNoProofCount = orders.filter((o) => o.status === 'delivered' && !o.deliveryProofPhoto).length;
  const deliveredNoReviewCount = orders.filter(
    (o) => o.status === 'delivered' && (!o.reviewStatus || o.reviewStatus === 'unreviewed')
  ).length;

  // Handler: Confirm Mark as Delivered
  const handleConfirmMarkDelivered = async () => {
    if (!deliveryConfirmModal) return;
    setIsUpdatingDelivery(true);
    try {
      await markOrderDelivered(deliveryConfirmModal.id);
      showToast(`Pedido ${deliveryConfirmModal.orderCode} marcado como Entregue!`, 'success');
      setDeliveryConfirmModal(null);
      await loadData();
      if (selectedOrder && selectedOrder.id === deliveryConfirmModal.id) {
        setSelectedOrder((prev) =>
          prev
            ? {
                ...prev,
                status: 'delivered',
                deliveredAt: new Date().toISOString(),
              }
            : null
        );
      }
    } catch (err) {
      console.error(err);
      showToast('Erro ao atualizar status do pedido.', 'error');
    } finally {
      setIsUpdatingDelivery(false);
    }
  };

  // Handler: Image File Pick for Proof
  const handleProofFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Por favor selecione um arquivo de imagem válido.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        // Compress image to reasonably sized WebP / JPEG for Firestore storage
        const canvas = document.createElement('canvas');
        const maxDim = 1200;
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
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.82);
          setPreviewProofImage(compressedBase64);
        }
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Handler: Save Proof
  const handleSaveProof = async () => {
    if (!proofModalOrder || !previewProofImage) return;
    setIsSavingProof(true);
    try {
      await attachOrderDeliveryProof(proofModalOrder.id, previewProofImage);
      showToast('Comprovante de entrega anexado com sucesso!', 'success');
      setProofModalOrder(null);
      setPreviewProofImage(null);
      setReplaceConfirm(false);
      await loadData();
      if (selectedOrder && selectedOrder.id === proofModalOrder.id) {
        setSelectedOrder((prev) =>
          prev
            ? {
                ...prev,
                deliveryProofPhoto: previewProofImage,
                deliveryProofUploadedAt: new Date().toISOString(),
              }
            : null
        );
      }
    } catch (err) {
      console.error(err);
      showToast('Erro ao salvar comprovante.', 'error');
    } finally {
      setIsSavingProof(false);
    }
  };

  // Handler: Create Real Store Order
  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrderForm.orderCode.trim() || !newOrderForm.customerName.trim()) {
      showToast('Preencha os campos obrigatórios (Código e Cliente).', 'error');
      return;
    }

    const selectedProduct = catalogProducts.find((p) => p.id === newOrderForm.productId);

    const now = new Date().toISOString();
    const orderId = 'ord_' + Date.now();
    const orderData: Order = {
      id: orderId,
      orderCode: newOrderForm.orderCode.trim().toUpperCase(),
      productId: newOrderForm.productId || '',
      productName: selectedProduct?.name || 'Produto Não Especificado',
      productImage: selectedProduct?.mainImage || '',
      customerName: newOrderForm.customerName.trim(),
      customerEmail: newOrderForm.customerEmail.trim(),
      customerCity: newOrderForm.customerCity.trim(),
      amount: parseFloat(newOrderForm.amount) || selectedProduct?.currentPrice || 0,
      status: newOrderForm.status,
      deliveredAt: newOrderForm.status === 'delivered' ? now : undefined,
      reviewStatus: 'unreviewed',
      createdAt: now,
      updatedAt: now,
    };

    try {
      await saveOrder(orderData);
      showToast('Pedido registrado com sucesso!', 'success');
      setIsNewOrderModalOpen(false);
      setNewOrderForm({
        orderCode: '',
        productId: '',
        customerName: '',
        customerEmail: '',
        customerCity: '',
        amount: '',
        status: 'shipped',
      });
      await loadData();
    } catch (err) {
      console.error(err);
      showToast('Erro ao registrar pedido.', 'error');
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!window.confirm('Tem certeza de que deseja remover este pedido do controle de logística?')) {
      return;
    }
    try {
      await deleteOrder(orderId);
      showToast('Pedido removido.', 'info');
      if (selectedOrder?.id === orderId) setSelectedOrder(null);
      await loadData();
    } catch (err) {
      console.error(err);
      showToast('Erro ao remover pedido.', 'error');
    }
  };

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

  const formatBRL = (val?: number) => {
    if (val === undefined || isNaN(val)) return '—';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(val);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-md border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
            <span className="text-xs uppercase tracking-widest text-blue-400 font-bold">
              Painel de Logística
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Logística e Entregas
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Acompanhe cada pedido em andamento, registre o status de entrega com data/hora automáticas e anexe comprovantes fotográficos de forma segura.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsNewOrderModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Registrar Pedido</span>
          </button>
          <button
            onClick={loadData}
            disabled={loading}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-colors cursor-pointer border border-slate-700"
            title="Atualizar dados"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Real Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div
          onClick={() => setStatusFilter('all')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'all'
              ? 'bg-blue-50/70 border-blue-300 ring-2 ring-blue-500/20'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Total de Pedidos</span>
            <Package className="w-4 h-4 text-blue-600" />
          </div>
          <span className="text-2xl font-extrabold text-slate-900 font-mono">{totalOrders}</span>
        </div>

        <div
          onClick={() => setStatusFilter('delivered')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'delivered'
              ? 'bg-emerald-50/70 border-emerald-300 ring-2 ring-emerald-500/20'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Entregues</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-2xl font-extrabold text-emerald-700 font-mono">{deliveredCount}</span>
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
            <span className="text-xs font-semibold">Em Transporte</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <span className="text-2xl font-extrabold text-amber-700 font-mono">{pendingCount}</span>
        </div>

        <div
          onClick={() => setStatusFilter('no-proof')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'no-proof'
              ? 'bg-rose-50/70 border-rose-300 ring-2 ring-rose-500/20'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Sem Comprovante</span>
            <Camera className="w-4 h-4 text-rose-500" />
          </div>
          <span className="text-2xl font-extrabold text-rose-700 font-mono">
            {deliveredNoProofCount}
          </span>
        </div>

        <div
          onClick={() => setStatusFilter('no-review')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'no-review'
              ? 'bg-indigo-50/70 border-indigo-300 ring-2 ring-indigo-500/20'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Sem Avaliação</span>
            <Star className="w-4 h-4 text-indigo-500" />
          </div>
          <span className="text-2xl font-extrabold text-indigo-700 font-mono">
            {deliveredNoReviewCount}
          </span>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Buscar por código, cliente ou produto..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2 text-xs text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 text-xs">
          <span className="text-slate-400 text-[11px] font-semibold mr-1 flex items-center gap-1 shrink-0">
            <Filter className="w-3.5 h-3.5" />
            Filtrar:
          </span>
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap cursor-pointer transition-colors ${
              statusFilter === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Todos ({totalOrders})
          </button>
          <button
            onClick={() => setStatusFilter('delivered')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap cursor-pointer transition-colors ${
              statusFilter === 'delivered'
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
            }`}
          >
            Entregues ({deliveredCount})
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap cursor-pointer transition-colors ${
              statusFilter === 'pending'
                ? 'bg-amber-600 text-white'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
            }`}
          >
            Em Transporte ({pendingCount})
          </button>
          <button
            onClick={() => setStatusFilter('no-proof')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap cursor-pointer transition-colors ${
              statusFilter === 'no-proof'
                ? 'bg-rose-600 text-white'
                : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
            }`}
          >
            Falta Comprovante ({deliveredNoProofCount})
          </button>
          <button
            onClick={() => setStatusFilter('no-review')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap cursor-pointer transition-colors ${
              statusFilter === 'no-review'
                ? 'bg-indigo-600 text-white'
                : 'bg-indigo-50 text-indigo-800 hover:bg-indigo-100'
            }`}
          >
            Falta Avaliação ({deliveredNoReviewCount})
          </button>
        </div>
      </div>

      {/* Orders List / Table */}
      {loading ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs text-slate-500">Carregando pedidos e logística...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center max-w-lg mx-auto space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Truck className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Nenhum pedido encontrado</h3>
            <p className="text-xs text-slate-500 mt-1">
              {searchQuery || statusFilter !== 'all'
                ? 'Nenhum pedido atende aos filtros atuais selecionados.'
                : 'Não há pedidos registrados na loja no momento.'}
            </p>
          </div>
          <button
            onClick={() => setIsNewOrderModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-xl hover:bg-blue-600 transition-colors cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Registrar Novo Pedido</span>
          </button>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-4">Código / Data</th>
                  <th className="py-3.5 px-4">Produto</th>
                  <th className="py-3.5 px-4">Cliente (Seguro)</th>
                  <th className="py-3.5 px-4">Status da Entrega</th>
                  <th className="py-3.5 px-4">Comprovante</th>
                  <th className="py-3.5 px-4">Avaliação</th>
                  <th className="py-3.5 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map((order) => {
                  const isDelivered = order.status === 'delivered';
                  const hasProof = !!order.deliveryProofPhoto;
                  const hasReview = order.reviewStatus === 'reviewed';

                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-slate-50/60 transition-colors group"
                    >
                      {/* Code and Date */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="font-mono font-bold text-slate-900 block text-xs">
                          {order.orderCode}
                        </span>
                        <span className="text-[11px] text-slate-400 block mt-0.5">
                          {formatDateTime(order.createdAt)}
                        </span>
                      </td>

                      {/* Product */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3 min-w-[200px]">
                          {order.productImage ? (
                            <img
                              src={order.productImage}
                              alt={order.productName}
                              className="w-10 h-10 rounded-lg object-cover bg-slate-100 border border-slate-200 shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                              <Package className="w-5 h-5" />
                            </div>
                          )}
                          <div className="truncate">
                            <span className="font-medium text-slate-800 block truncate max-w-xs text-xs">
                              {order.productName}
                            </span>
                            <span className="text-[11px] text-slate-500 font-mono">
                              {formatBRL(order.amount)}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Customer Info (Secured) */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="font-semibold text-slate-800 block">
                          {order.customerName}
                        </span>
                        <span className="text-[11px] text-slate-500 block">
                          {order.customerEmail ? order.customerEmail : 'E-mail não informado'}
                        </span>
                        {order.customerCity && (
                          <span className="text-[10px] text-slate-400 block">
                            📍 {order.customerCity}
                          </span>
                        )}
                      </td>

                      {/* Status and Delivery Date */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        {isDelivered ? (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              Entregue
                            </span>
                            <div className="text-[10px] text-slate-500 flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-400" />
                              <span>{formatDateTime(order.deliveredAt)}</span>
                            </div>
                            <span className="text-[9px] text-slate-400 block italic">
                              Atualização interna da loja
                            </span>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                              <Clock className="w-3.5 h-3.5 text-amber-600" />
                              {order.status === 'shipped' ? 'Em Transporte' : 'Pendente'}
                            </span>
                            <span className="text-[10px] text-slate-400 block">
                              Aguardando entrega
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Proof Photo */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        {hasProof ? (
                          <div className="flex items-center gap-2">
                            <div
                              onClick={() => setViewPhotoUrl(order.deliveryProofPhoto!)}
                              className="relative w-10 h-10 rounded-lg overflow-hidden border border-slate-300 cursor-pointer group/thumb shadow-xs"
                              title="Clique para ver o comprovante em tamanho real"
                            >
                              <img
                                src={order.deliveryProofPhoto}
                                alt="Comprovante de Entrega"
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center transition-opacity text-white">
                                <Eye className="w-3.5 h-3.5" />
                              </div>
                            </div>
                            <div className="text-[10px]">
                              <span className="text-emerald-700 font-semibold block flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Anexado
                              </span>
                              <span className="text-slate-400 block">
                                {formatDateTime(order.deliveryProofUploadedAt)}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                            <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
                            Pendente
                          </span>
                        )}
                      </td>

                      {/* Review Status */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        {hasReview ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                            Avaliado
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                            <Clock className="w-3.5 h-3.5" />
                            Aguardando
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          {/* Botão Marcar como Entregue */}
                          {!isDelivered ? (
                            <button
                              onClick={() => setDeliveryConfirmModal(order)}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                              title="Marcar como entregue"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Marcar como entregue</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setProofModalOrder(order);
                                setPreviewProofImage(order.deliveryProofPhoto || null);
                                setReplaceConfirm(false);
                              }}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-700 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200"
                            >
                              <Camera className="w-3.5 h-3.5" />
                              <span>{hasProof ? 'Alterar Foto' : 'Adicionar Comprovante'}</span>
                            </button>
                          )}

                          {/* Quick details */}
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Ver detalhes completos do pedido"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleDeleteOrder(order.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Excluir pedido"
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
        </div>
      )}

      {/* MODAL 1: Confirm "Marcar como Entregue" */}
      {deliveryConfirmModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <h3 className="text-xl font-extrabold text-slate-900 mb-2">
              Confirmar Entrega do Pedido?
            </h3>

            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Você está prestes a definir o status interno deste pedido como <strong>“Entregue”</strong>.
            </p>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-1.5 mb-6">
              <div className="flex justify-between">
                <span className="text-slate-500">Pedido:</span>
                <span className="font-mono font-bold text-slate-800">{deliveryConfirmModal.orderCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Cliente:</span>
                <span className="font-semibold text-slate-800">{deliveryConfirmModal.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Produto:</span>
                <span className="font-medium text-slate-800 truncate max-w-[200px]">{deliveryConfirmModal.productName}</span>
              </div>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-800 leading-relaxed mb-6">
              <span className="font-bold block mb-0.5">Nota importante:</span>
              O status “Entregue” representa uma <strong>atualização interna da loja</strong> registrada com data e horário automáticos de forma permanente no banco de dados.
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setDeliveryConfirmModal(null)}
                disabled={isUpdatingDelivery}
                className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmMarkDelivered}
                disabled={isUpdatingDelivery}
                className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-sm"
              >
                {isUpdatingDelivery ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                <span>Confirmar Entrega</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Adicionar / Substituir Comprovante de Entrega */}
      {proofModalOrder && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900">
                    Comprovante de Entrega
                  </h3>
                  <span className="text-xs text-slate-500 font-mono">
                    Pedido {proofModalOrder.orderCode}
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  setProofModalOrder(null);
                  setPreviewProofImage(null);
                  setReplaceConfirm(false);
                }}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Existing Proof Warning if Replacing */}
            {proofModalOrder.deliveryProofPhoto && !replaceConfirm && (
              <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-800">
                    <p className="font-bold mb-1">Este pedido já possui um comprovante anexado!</p>
                    <p className="mb-3 text-[11px] leading-relaxed text-amber-700">
                      Enviado em: {formatDateTime(proofModalOrder.deliveryProofUploadedAt)}. Para anexar um novo comprovante e sobrescrever a foto anterior, confirme abaixo.
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setViewPhotoUrl(proofModalOrder.deliveryProofPhoto!)}
                        className="px-3 py-1 bg-white border border-amber-300 text-amber-900 font-semibold rounded-lg text-[11px] cursor-pointer"
                      >
                        Visualizar Comprovante Atual
                      </button>
                      <button
                        onClick={() => setReplaceConfirm(true)}
                        className="px-3 py-1 bg-amber-600 text-white font-semibold rounded-lg text-[11px] cursor-pointer hover:bg-amber-500"
                      >
                        Substituir Imagem
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Upload Area (Shown if no existing photo or replacement confirmed) */}
            {(!proofModalOrder.deliveryProofPhoto || replaceConfirm) && (
              <div className="space-y-4 mb-6">
                <label className="block text-xs font-bold text-slate-700">
                  Selecionar Foto do Dispositivo:
                </label>
                <div className="relative border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-6 text-center transition-colors bg-slate-50/50">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProofFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center">
                    <Upload className="w-8 h-8 text-blue-600 mb-2" />
                    <span className="text-xs font-semibold text-slate-800">
                      Clique ou arraste a foto do comprovante
                    </span>
                    <span className="text-[11px] text-slate-400 mt-1">
                      Aceita JPG, PNG ou WebP (recibo assinado, pacote entregue ou declaração)
                    </span>
                  </div>
                </div>

                {/* Preview Selected Photo */}
                {previewProofImage && (
                  <div className="space-y-2 pt-2">
                    <span className="text-xs font-bold text-slate-700 block">
                      Pré-visualização da imagem antes de salvar:
                    </span>
                    <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 max-h-64 flex items-center justify-center p-2">
                      <img
                        src={previewProofImage}
                        alt="Pré-visualização do comprovante"
                        className="max-h-60 max-w-full object-contain rounded-lg shadow-xs"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Confidentiality Notice */}
            <div className="p-3 bg-slate-900 text-white rounded-2xl text-[11px] flex items-start gap-2.5 mb-6">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <p className="text-slate-300 leading-relaxed">
                <strong>Proteção e Privacidade:</strong> O comprovante fotográfico é armazenado de forma persistente e protegido, acessível <strong>exclusivamente</strong> às pessoas autorizadas na administração. Não é divulgado publicamente.
              </p>
            </div>

            {/* Footer buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setProofModalOrder(null);
                  setPreviewProofImage(null);
                  setReplaceConfirm(false);
                }}
                disabled={isSavingProof}
                className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Fechar
              </button>
              {(!proofModalOrder.deliveryProofPhoto || replaceConfirm) && (
                <button
                  onClick={handleSaveProof}
                  disabled={isSavingProof || !previewProofImage}
                  className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-300 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-sm"
                >
                  {isSavingProof ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <FileCheck className="w-4 h-4" />
                  )}
                  <span>Confirmar e Salvar Comprovante</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Visualização em tamanho real do comprovante fotográfico */}
      {viewPhotoUrl && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-3xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col items-center">
            <div className="w-full flex items-center justify-between pb-3 border-b border-slate-800 mb-4 text-white">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-semibold">Visualização Segura do Comprovante</span>
              </div>
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
                alt="Comprovante de entrega em alta resolução"
                className="max-h-[70vh] max-w-full object-contain rounded-xl shadow-lg"
              />
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: Detalhes Completos do Pedido */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <div>
                <span className="text-xs text-blue-600 font-bold uppercase tracking-wider block">
                  Detalhes da Logística
                </span>
                <h3 className="text-xl font-extrabold text-slate-900">
                  Pedido #{selectedOrder.orderCode}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {/* Product Info */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Produto Comprado
                </span>
                <div className="flex items-center gap-3">
                  {selectedOrder.productImage ? (
                    <img
                      src={selectedOrder.productImage}
                      alt={selectedOrder.productName}
                      className="w-14 h-14 rounded-xl object-cover bg-white border border-slate-200 shrink-0"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                      <Package className="w-6 h-6" />
                    </div>
                  )}
                  <div>
                    <span className="font-bold text-slate-900 block text-xs">
                      {selectedOrder.productName}
                    </span>
                    <span className="font-mono text-xs text-blue-600 font-bold block mt-0.5">
                      {formatBRL(selectedOrder.amount)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Customer Info */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Identificação do Cliente
                </span>
                <div className="space-y-1 text-xs">
                  <p className="font-semibold text-slate-900">{selectedOrder.customerName}</p>
                  <p className="text-slate-600">{selectedOrder.customerEmail || '—'}</p>
                  <p className="text-slate-500 text-[11px]">
                    {selectedOrder.customerCity ? `📍 ${selectedOrder.customerCity}` : 'Cidade não informada'}
                  </p>
                </div>
              </div>
            </div>

            {/* Delivery Status and Timestamps */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 mb-6 text-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Status da Entrega e Prazos
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-500 block mb-1">Status Atual:</span>
                  {selectedOrder.status === 'delivered' ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Entregue
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                      <Clock className="w-4 h-4 text-amber-600" />
                      {selectedOrder.status === 'shipped' ? 'Em Transporte' : 'Pendente'}
                    </span>
                  )}
                </div>

                <div>
                  <span className="text-slate-500 block mb-1">Data / Hora de Entrega:</span>
                  <span className="font-semibold text-slate-800 block">
                    {selectedOrder.deliveredAt ? formatDateTime(selectedOrder.deliveredAt) : 'Ainda não entregue'}
                  </span>
                  {selectedOrder.deliveredAt && (
                    <span className="text-[10px] text-slate-400 italic">
                      Registrado internamente pela equipe
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Proof Section */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 mb-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Comprovante Fotográfico de Entrega
                </span>
                {selectedOrder.deliveryProofPhoto && (
                  <button
                    onClick={() => {
                      setProofModalOrder(selectedOrder);
                      setPreviewProofImage(selectedOrder.deliveryProofPhoto || null);
                      setReplaceConfirm(false);
                    }}
                    className="text-xs text-blue-600 hover:text-blue-700 font-semibold cursor-pointer"
                  >
                    Substituir Foto
                  </button>
                )}
              </div>

              {selectedOrder.deliveryProofPhoto ? (
                <div className="flex items-center gap-4">
                  <div
                    onClick={() => setViewPhotoUrl(selectedOrder.deliveryProofPhoto!)}
                    className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-300 cursor-pointer shadow-sm group"
                  >
                    <img
                      src={selectedOrder.deliveryProofPhoto}
                      alt="Comprovante de Entrega"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                      <Eye className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="text-xs space-y-1">
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Comprovante Anexado
                    </span>
                    <p className="text-slate-500 text-[11px]">
                      Enviado em: {formatDateTime(selectedOrder.deliveryProofUploadedAt)}
                    </p>
                    <button
                      onClick={() => setViewPhotoUrl(selectedOrder.deliveryProofPhoto!)}
                      className="text-blue-600 hover:underline text-[11px] font-semibold cursor-pointer"
                    >
                      Ampliar foto do comprovante →
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 bg-white rounded-xl border border-slate-200">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <AlertCircle className="w-4 h-4 text-slate-400" />
                    <span>Nenhum comprovante anexado a este pedido.</span>
                  </div>
                  <button
                    onClick={() => {
                      setProofModalOrder(selectedOrder);
                      setPreviewProofImage(null);
                      setReplaceConfirm(false);
                    }}
                    className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-500 transition-colors cursor-pointer"
                  >
                    + Adicionar comprovante de entrega
                  </button>
                </div>
              )}
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              {selectedOrder.status !== 'delivered' ? (
                <button
                  onClick={() => {
                    setDeliveryConfirmModal(selectedOrder);
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer inline-flex items-center gap-2 shadow-sm"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Marcar como entregue</span>
                </button>
              ) : (
                <div className="text-xs text-emerald-700 font-medium flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Pedido registrado como entregue.</span>
                </div>
              )}

              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: Registrar Novo Pedido Real */}
      {isNewOrderModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900">
                    Registrar Pedido de Cliente
                  </h3>
                  <span className="text-xs text-slate-500">
                    Vincule um pedido ao catálogo para controle logístico
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsNewOrderModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Código de Identificação do Pedido *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: #BRG-10291"
                  value={newOrderForm.orderCode}
                  onChange={(e) =>
                    setNewOrderForm({ ...newOrderForm, orderCode: e.target.value })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Produto Comprado do Catálogo
                </label>
                <select
                  value={newOrderForm.productId}
                  onChange={(e) => {
                    const sel = catalogProducts.find((p) => p.id === e.target.value);
                    setNewOrderForm({
                      ...newOrderForm,
                      productId: e.target.value,
                      amount: sel ? sel.currentPrice.toString() : newOrderForm.amount,
                    });
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                >
                  <option value="">Selecione um produto do catálogo...</option>
                  {catalogProducts.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — {formatBRL(p.currentPrice)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nome do Cliente *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Carlos Eduardo Silva"
                    value={newOrderForm.customerName}
                    onChange={(e) =>
                      setNewOrderForm({ ...newOrderForm, customerName: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    E-mail do Cliente
                  </label>
                  <input
                    type="email"
                    placeholder="cliente@email.com"
                    value={newOrderForm.customerEmail}
                    onChange={(e) =>
                      setNewOrderForm({ ...newOrderForm, customerEmail: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Cidade / UF
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: São Paulo, SP"
                    value={newOrderForm.customerCity}
                    onChange={(e) =>
                      setNewOrderForm({ ...newOrderForm, customerCity: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Valor Total (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={newOrderForm.amount}
                    onChange={(e) =>
                      setNewOrderForm({ ...newOrderForm, amount: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Status Inicial
                </label>
                <select
                  value={newOrderForm.status}
                  onChange={(e) =>
                    setNewOrderForm({
                      ...newOrderForm,
                      status: e.target.value as 'pending' | 'shipped' | 'delivered',
                    })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                >
                  <option value="shipped">Em Transporte</option>
                  <option value="pending">Pendente de Envio</option>
                  <option value="delivered">Já Entregue</option>
                </select>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsNewOrderModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-sm"
                >
                  Salvar Pedido
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
