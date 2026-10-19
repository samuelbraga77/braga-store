import React, { useState } from 'react';
import {
  LayoutDashboard,
  Package,
  Link2,
  Layers,
  Image as ImageIcon,
  Menu as MenuIcon,
  Palette,
  Globe,
  FileText,
  Phone,
  MessageSquare,
  Users,
  History,
  Database,
  LogOut,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
  X,
  Lock,
  Truck,
  Star,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import { INITIAL_ADMIN_EMAIL } from '../../services/storeService';

// Tabs
import { OverviewTab } from './tabs/OverviewTab';
import { ProductsTab } from './tabs/ProductsTab';
import { ImportLinkTab } from './tabs/ImportLinkTab';
import { CategoriesTab } from './tabs/CategoriesTab';
import { BannersTab } from './tabs/BannersTab';
import { NavigationTab } from './tabs/NavigationTab';
import { AppearanceTab } from './tabs/AppearanceTab';
import { SeoTab } from './tabs/SeoTab';
import { PagesTab } from './tabs/PagesTab';
import { ContactTab } from './tabs/ContactTab';
import { MessagesTab } from './tabs/MessagesTab';
import { UsersTab } from './tabs/UsersTab';
import { AuditLogTab } from './tabs/AuditLogTab';
import { BackupTab } from './tabs/BackupTab';
import { LogisticsTab } from './tabs/LogisticsTab';
import { ReviewsTab } from './tabs/ReviewsTab';

export const AdminLayout: React.FC = () => {
  const { user, isAdmin, loading, signInWithGoogle, logout, error, clearError } = useAuth();
  const { settings, navigate } = useStore();
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // 1. Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-4">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-xs text-slate-400 font-medium">Verificando credenciais administrativas...</p>
      </div>
    );
  }

  // 2. Unauthenticated State -> Google Sign-in Screen
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-8 text-center shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8" />
          </div>

          <h1 className="text-2xl font-bold text-white mb-2">Painel Administrativo</h1>
          <p className="text-xs text-slate-400 leading-relaxed mb-6">
            Acesso restrito para gerenciamento da <strong>{settings.storeName}</strong>. Faça login com sua conta Google autorizada.
          </p>

          {error && (
            <div className="p-3 mb-6 bg-rose-950/80 border border-rose-800/80 text-rose-300 text-xs rounded-xl text-left">
              {error}
            </div>
          )}

          <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50 text-left text-xs text-slate-300 mb-6 space-y-1">
            <span className="font-semibold text-white block">Administrador Autorizado:</span>
            <p className="font-mono text-blue-400">{INITIAL_ADMIN_EMAIL}</p>
          </div>

          <button
            onClick={signInWithGoogle}
            className="w-full py-3.5 px-4 bg-white hover:bg-slate-100 text-slate-900 font-bold rounded-xl text-xs flex items-center justify-center gap-3 transition-colors cursor-pointer shadow-md"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Entrar com o Google</span>
          </button>

          <button
            onClick={() => navigate('/')}
            className="mt-4 text-xs text-slate-500 hover:text-slate-300 transition-colors block mx-auto cursor-pointer"
          >
            ← Voltar para a Loja Virtual
          </button>
        </div>
      </div>
    );
  }

  // 3. User logged in, but unauthorized!
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-8 text-center shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-6">
            <ShieldCheck className="w-8 h-8" />
          </div>

          <h2 className="text-xl font-bold text-white mb-2">Acesso Não Autorizado</h2>
          <p className="text-xs text-slate-400 leading-relaxed mb-4">
            A conta Google <strong className="text-white">{user.email}</strong> está autenticada, porém não possui privilégios de administrador da <strong>{settings.storeName}</strong>.
          </p>

          <div className="p-4 bg-slate-800 rounded-2xl border border-slate-700 text-left text-xs text-slate-300 mb-6 space-y-1">
            <span className="font-semibold text-white block">Administrador Autorizado:</span>
            <p className="font-mono text-blue-400">{INITIAL_ADMIN_EMAIL}</p>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={logout}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-xs transition-colors cursor-pointer"
            >
              Entrar com Outra Conta
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
            >
              Voltar à Loja Pública
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 4. Authorized Admin Dashboard!
  const menuItems = [
    { id: 'overview', label: 'Visão Geral', icon: LayoutDashboard },
    { id: 'logistica', label: 'Logística e Entregas', icon: Truck },
    { id: 'produtos', label: 'Produtos', icon: Package },
    { id: 'avaliacoes', label: 'Avaliações', icon: Star },
    { id: 'cadastrar-link', label: 'Cadastrar por Link', icon: Link2 },
    { id: 'categorias', label: 'Categorias', icon: Layers },
    { id: 'banners', label: 'Banners', icon: ImageIcon },
    { id: 'navegacao', label: 'Menu e Navegação', icon: MenuIcon },
    { id: 'aparencia', label: 'Aparência & Identidade', icon: Palette },
    { id: 'seo', label: 'SEO Técnico', icon: Globe },
    { id: 'paginas', label: 'Páginas Institucionais', icon: FileText },
    { id: 'contato', label: 'Contato & Redes', icon: Phone },
    { id: 'mensagens', label: 'Mensagens Recebidas', icon: MessageSquare },
    { id: 'usuarios', label: 'Usuários & Permissões', icon: Users },
    { id: 'historico', label: 'Histórico de Alterações', icon: History },
    { id: 'backup', label: 'Backup & Exportação', icon: Database },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col lg:flex-row text-slate-800">
      {/* Sidebar for Desktop */}
      <aside className="hidden lg:flex w-72 bg-slate-950 text-slate-300 flex-col shrink-0 border-r border-slate-800 select-none">
        {/* Brand header */}
        <div className="p-6 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg">
              {settings.storeName.charAt(0) || 'B'}
            </div>
            <div>
              <span className="font-bold text-white text-sm block tracking-tight">
                {settings.storeName}
              </span>
              <span className="text-[11px] text-blue-400 font-semibold uppercase tracking-wider block">
                Administração
              </span>
            </div>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Admin profile & logout */}
        <div className="p-4 border-t border-slate-800/80 space-y-3">
          <div className="flex items-center gap-2.5 px-2 text-xs">
            <div className="w-7 h-7 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center text-xs font-bold shrink-0">
              {user.email?.charAt(0).toUpperCase()}
            </div>
            <div className="truncate">
              <span className="font-semibold text-white block truncate text-[11px]">
                {user.email}
              </span>
              <span className="text-[10px] text-emerald-400 font-medium">Administrador Ativo</span>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => navigate('/')}
              className="flex-1 py-2 px-3 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Ver Loja</span>
            </button>
            <button
              onClick={logout}
              className="py-2 px-3 bg-slate-900 hover:bg-rose-950 hover:text-rose-300 text-slate-400 rounded-xl text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              title="Sair do painel"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <div className="lg:hidden bg-slate-950 text-white p-4 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
            {settings.storeName.charAt(0) || 'B'}
          </div>
          <span className="font-bold text-sm">{settings.storeName} Admin</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/')}
            className="text-xs text-slate-400 hover:text-white px-2 py-1"
          >
            Ver Loja
          </button>
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="p-2 text-slate-400 hover:text-white"
          >
            {mobileSidebarOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex">
          <div className="w-72 bg-slate-950 text-white h-full flex flex-col p-4">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <span className="font-bold text-sm">Menu do Painel</span>
              <button onClick={() => setMobileSidebarOpen(false)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold ${
                      isActive ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-900'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 truncate max-w-[150px]">
                {user.email}
              </span>
              <button
                onClick={logout}
                className="text-xs text-rose-400 font-semibold flex items-center gap-1"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sair</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Stage */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-8 lg:p-10 max-w-7xl">
        {activeTab === 'overview' && <OverviewTab setActiveTab={setActiveTab} />}
        {activeTab === 'logistica' && <LogisticsTab />}
        {activeTab === 'produtos' && <ProductsTab />}
        {activeTab === 'avaliacoes' && <ReviewsTab />}
        {activeTab === 'cadastrar-link' && <ImportLinkTab />}
        {activeTab === 'categorias' && <CategoriesTab />}
        {activeTab === 'banners' && <BannersTab />}
        {activeTab === 'navegacao' && <NavigationTab />}
        {activeTab === 'aparencia' && <AppearanceTab />}
        {activeTab === 'seo' && <SeoTab />}
        {activeTab === 'paginas' && <PagesTab />}
        {activeTab === 'contato' && <ContactTab />}
        {activeTab === 'mensagens' && <MessagesTab />}
        {activeTab === 'usuarios' && <UsersTab />}
        {activeTab === 'historico' && <AuditLogTab />}
        {activeTab === 'backup' && <BackupTab />}
      </main>
    </div>
  );
};
