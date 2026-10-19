import React, { useState } from 'react';
import {
  Search,
  Menu as MenuIcon,
  X,
  ChevronDown,
  ShoppingBag,
  User,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';

export const Header: React.FC = () => {
  const { settings, categories, products, currentPath, navigate } = useStore();
  const { user, isAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoriesDropdownOpen, setCategoriesDropdownOpen] = useState(false);

  const offersCount = products.filter((p) => p.isOffer && p.status === 'published').length;
  const publishedCategories = categories.filter((c) => c.isPublished);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/produtos?q=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      {/* Top Announcement Bar (Configurable) */}
      {settings.announcementBar?.enabled && settings.announcementBar?.text && (
        <div className="bg-slate-900 text-slate-100 text-xs py-2 px-4 text-center font-medium tracking-wide flex items-center justify-center gap-2">
          <span>{settings.announcementBar.text}</span>
          {settings.announcementBar.link && (
            <button
              onClick={() => navigate(settings.announcementBar.link!)}
              className="underline text-blue-300 hover:text-white transition-colors cursor-pointer"
            >
              Saiba mais
            </button>
          )}
        </div>
      )}

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4 lg:gap-8">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2.5 text-left group cursor-pointer"
            >
              {settings.logoUrl ? (
                <img
                  src="/logo-samuka.png"
                  alt={settings.storeName}
                  className="h-10 w-auto object-contain max-w-[160px]"
                />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xl tracking-tight shadow-sm">
                  {settings.storeName.charAt(0) || 'B'}
                </div>
              )}
              <div>
                <span className="text-xl font-bold tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors block">
                  {settings.storeName}
                </span>
                <span className="text-[11px] text-slate-600 font-medium tracking-wider uppercase block">
                  Loja Oficial
                </span>
              </div>
            </button>
          </div>

          {/* Desktop Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex flex-1 max-w-md relative items-center"
          >
            <input
              type="text"
              placeholder="Buscar produtos, marcas ou categorias..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-full pl-10 pr-4 py-2.5 focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-slate-500"
            />
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 pointer-events-none" />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 text-xs text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </form>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-700">
            <button
              onClick={() => navigate('/')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap cursor-pointer ${
                currentPath === '/' ? 'text-blue-600 font-semibold' : ''
              }`}
            >
              Início
            </button>

            <button
              onClick={() => navigate('/produtos')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap cursor-pointer ${
                currentPath === '/produtos' ? 'text-blue-600 font-semibold' : ''
              }`}
            >
              Todos os produtos
            </button>

            {/* Categories Dropdown */}
            {publishedCategories.length > 0 && (
              <div className="relative group">
                <button
                  onClick={() => setCategoriesDropdownOpen(!categoriesDropdownOpen)}
                  onMouseEnter={() => setCategoriesDropdownOpen(true)}
                  className="flex items-center gap-1 hover:text-slate-900 transition-colors whitespace-nowrap cursor-pointer"
                >
                  <span>Categorias</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600" />
                </button>

                {categoriesDropdownOpen && (
                  <div
                    onMouseLeave={() => setCategoriesDropdownOpen(false)}
                    className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150"
                  >
                    <button
                      onClick={() => {
                        navigate('/categorias');
                        setCategoriesDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-semibold text-blue-600 hover:bg-slate-50 border-b border-slate-100 cursor-pointer"
                    >
                      Ver todas as categorias →
                    </button>
                    {publishedCategories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => {
                          navigate(`/categoria/${cat.slug}`);
                          setCategoriesDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer"
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Offers (Only when real offers exist) */}
            {offersCount > 0 && (
              <button
                onClick={() => navigate('/ofertas')}
                className={`flex items-center gap-1.5 hover:text-rose-600 transition-colors whitespace-nowrap cursor-pointer ${
                  currentPath === '/ofertas' ? 'text-rose-600 font-semibold' : 'text-slate-700'
                }`}
              >
                <span>Ofertas</span>
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              </button>
            )}

            <button
              onClick={() => navigate('/prazo-entrega')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap cursor-pointer ${
                currentPath === '/prazo-entrega' ? 'text-blue-600 font-semibold' : ''
              }`}
            >
              Prazo de Entrega
            </button>

            <button
              onClick={() => navigate('/sobre')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap cursor-pointer ${
                currentPath === '/sobre' ? 'text-blue-600 font-semibold' : ''
              }`}
            >
              Sobre a loja
            </button>

            <button
              onClick={() => navigate('/contato')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap cursor-pointer ${
                currentPath === '/contato' ? 'text-blue-600 font-semibold' : ''
              }`}
            >
              Contato
            </button>
          </nav>

          {/* Action Zone: Admin Access or Login */}
          <div className="flex items-center gap-3">
            {isAdmin ? (
              <button
                onClick={() => navigate('/admin')}
                className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-blue-600 transition-colors cursor-pointer shadow-sm"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="hidden sm:inline">Painel Admin</span>
              </button>
            ) : user ? (
              <button
                onClick={() => navigate('/admin')}
                className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                <User className="w-4 h-4 text-slate-600" />
                <span className="hidden sm:inline">Minha Conta</span>
              </button>
            ) : (
              <button
                onClick={() => navigate('/admin')}
                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                title="Acesso Administrativo"
              >
                <User className="w-5 h-5" />
              </button>
            )}

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              aria-label="Abrir menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden pb-3">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <input
              type="text"
              placeholder="Buscar produtos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:border-blue-600 focus:bg-white"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
          </form>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-[125px] bg-white border-b border-slate-200 shadow-2xl p-6 z-50 max-h-[calc(100vh-130px)] overflow-y-auto animate-in slide-in-from-top-2">
          <div className="flex flex-col gap-4 text-base font-medium text-slate-800">
            <button
              onClick={() => {
                navigate('/');
                setMobileMenuOpen(false);
              }}
              className="text-left py-2 border-b border-slate-100 hover:text-blue-600 transition-colors"
            >
              Início
            </button>

            <button
              onClick={() => {
                navigate('/produtos');
                setMobileMenuOpen(false);
              }}
              className="text-left py-2 border-b border-slate-100 hover:text-blue-600 transition-colors"
            >
              Todos os produtos
            </button>

            {publishedCategories.length > 0 && (
              <div className="py-2 border-b border-slate-100">
                <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold block mb-2">
                  Categorias
                </span>
                <div className="flex flex-col gap-2 pl-3">
                  {publishedCategories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        navigate(`/categoria/${cat.slug}`);
                        setMobileMenuOpen(false);
                      }}
                      className="text-left text-sm text-slate-600 hover:text-blue-600 py-1"
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {offersCount > 0 && (
              <button
                onClick={() => {
                  navigate('/ofertas');
                  setMobileMenuOpen(false);
                }}
                className="text-left py-2 border-b border-slate-100 text-rose-600 flex items-center justify-between"
              >
                <span>Ofertas</span>
                <span className="text-xs bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full font-semibold">
                  {offersCount}
                </span>
              </button>
            )}

            <button
              onClick={() => {
                navigate('/prazo-entrega');
                setMobileMenuOpen(false);
              }}
              className="text-left py-2 border-b border-slate-100 hover:text-blue-600 transition-colors"
            >
              Prazo de Entrega
            </button>

            <button
              onClick={() => {
                navigate('/sobre');
                setMobileMenuOpen(false);
              }}
              className="text-left py-2 border-b border-slate-100 hover:text-blue-600 transition-colors"
            >
              Sobre a loja
            </button>

            <button
              onClick={() => {
                navigate('/contato');
                setMobileMenuOpen(false);
              }}
              className="text-left py-2 border-b border-slate-100 hover:text-blue-600 transition-colors"
            >
              Contato
            </button>

            <div className="pt-2">
              <button
                onClick={() => {
                  navigate('/admin');
                  setMobileMenuOpen(false);
                }}
                className="w-full py-3 px-4 bg-slate-900 text-white rounded-xl text-center text-sm font-semibold flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Painel Administrativo</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
