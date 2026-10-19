import React from 'react';
import {
  Package,
  CheckCircle,
  FileText,
  Layers,
  Image as ImageIcon,
  MessageSquare,
  PlusCircle,
  Link2,
  ExternalLink,
  ShieldAlert,
  Truck,
  Star,
} from 'lucide-react';
import { useStore } from '../../../context/StoreContext';
import { useAuth } from '../../../context/AuthContext';

interface OverviewTabProps {
  setActiveTab: (tab: string) => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({ setActiveTab }) => {
  const { products, categories, banners, settings } = useStore();
  const { user } = useAuth();

  const totalProducts = products.length;
  const publishedProducts = products.filter((p) => p.status === 'published').length;
  const draftProducts = products.filter((p) => p.status === 'draft').length;
  const offerProducts = products.filter((p) => p.isOffer).length;
  const totalCategories = categories.length;
  const activeBanners = banners.filter((b) => b.isActive).length;

  return (
    <div className="space-y-8">
      {/* Welcome Bar */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-md">
        <div>
          <span className="text-xs uppercase tracking-widest text-blue-400 font-semibold mb-1 block">
            Painel de Controle
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {settings.storeName} — Administração
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Logado como <strong className="text-white">{user?.email}</strong>. Gerencie produtos, categorias, banners e configurações permanentes.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setActiveTab('logistica')}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-sm"
          >
            <Truck className="w-4 h-4" />
            <span>Logística e Entregas</span>
          </button>
          <button
            onClick={() => setActiveTab('cadastrar-link')}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-sm"
          >
            <Link2 className="w-4 h-4" />
            <span>Cadastrar por Link</span>
          </button>
          <button
            onClick={() => setActiveTab('produtos')}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-xl text-xs font-semibold transition-all cursor-pointer border border-slate-700"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Novo Produto</span>
          </button>
        </div>
      </div>

      {/* Real Real-Time Metrics (No fake sales or invented revenue) */}
      <div>
        <h2 className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-4">
          Indicadores Reais do Catálogo
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium text-slate-500">Total Produtos</span>
              <Package className="w-4 h-4 text-blue-500" />
            </div>
            <span className="text-2xl font-extrabold text-slate-900 font-mono tabular-nums">
              {totalProducts}
            </span>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium text-slate-500">Publicados</span>
              <CheckCircle className="w-4 h-4 text-emerald-500" />
            </div>
            <span className="text-2xl font-extrabold text-slate-900 font-mono tabular-nums">
              {publishedProducts}
            </span>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium text-slate-500">Rascunhos</span>
              <FileText className="w-4 h-4 text-amber-500" />
            </div>
            <span className="text-2xl font-extrabold text-slate-900 font-mono tabular-nums">
              {draftProducts}
            </span>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium text-slate-500">Em Oferta</span>
              <span className="text-xs font-bold text-rose-500">🏷️</span>
            </div>
            <span className="text-2xl font-extrabold text-slate-900 font-mono tabular-nums">
              {offerProducts}
            </span>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium text-slate-500">Categorias</span>
              <Layers className="w-4 h-4 text-purple-500" />
            </div>
            <span className="text-2xl font-extrabold text-slate-900 font-mono tabular-nums">
              {totalCategories}
            </span>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium text-slate-500">Banners Ativos</span>
              <ImageIcon className="w-4 h-4 text-cyan-500" />
            </div>
            <span className="text-2xl font-extrabold text-slate-900 font-mono tabular-nums">
              {activeBanners}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold mb-4">
              <Link2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Cadastrar Produto por Link
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-6">
              Cole a URL externa de um produto parceiro. O sistema extrairá dados disponíveis (título, fotos, preço) para você revisar e salvar.
            </p>
          </div>
          <button
            onClick={() => setActiveTab('cadastrar-link')}
            className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            Usar Extrator de Link
          </button>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold mb-4">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Gerenciar Categorias
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-6">
              Crie novas categorias, reordene como aparecem nos menus e filtros do catálogo da loja.
            </p>
          </div>
          <button
            onClick={() => setActiveTab('categorias')}
            className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            Configurar Categorias
          </button>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center font-bold mb-4">
              <ImageIcon className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Banners Promocionais
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-6">
              Adicione banners em destaque na página inicial com imagens para desktop/celular e botões de chamada.
            </p>
          </div>
          <button
            onClick={() => setActiveTab('banners')}
            className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            Gerenciar Banners
          </button>
        </div>
      </div>
    </div>
  );
};
