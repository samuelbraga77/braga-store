import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Menu, 
  X, 
  ShoppingBag, 
  Lock, 
  ChevronRight,
  Sparkles,
  Smartphone,
  Home,
  Watch,
  Wrench,
  HelpCircle,
  ExternalLink,
  PackageSearch
} from 'lucide-react';
import { Category, Product, StoreSettings, ViewRoute } from '../../types';
import { formatCurrencyBRL } from '../../utils/formatters';

interface HeaderProps {
  settings: StoreSettings;
  categories: Category[];
  products: Product[];
  currentRoute: ViewRoute;
  onNavigate: (route: ViewRoute) => void;
  isAdminLoggedIn?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  categories,
  products,
  currentRoute,
  onNavigate,
  isAdminLoggedIn
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  // Filter products for search autocomplete
  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      const q = searchQuery.toLowerCase().trim();
      const filtered = products
        .filter(p => p.status === 'active' && (
          p.title.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          (p.subcategory && p.subcategory.toLowerCase().includes(q))
        ))
        .slice(0, 5);
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  }, [searchQuery, products]);

  // Click outside to close search dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onNavigate({ type: 'catalog', query: searchQuery.trim() });
      setSearchOpen(false);
      setMobileMenuOpen(false);
    }
  };

  const getCategoryIcon = (iconName?: string) => {
    switch (iconName?.toLowerCase()) {
      case 'smartphone': return <Smartphone className="w-4 h-4" />;
      case 'home': return <Home className="w-4 h-4" />;
      case 'watch': return <Watch className="w-4 h-4" />;
      case 'wrench': return <Wrench className="w-4 h-4" />;
      default: return <Sparkles className="w-4 h-4" />;
    }
  };

  const isCurrentCategory = (slug: string) => {
    return currentRoute.type === 'catalog' && currentRoute.category === slug;
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 transition-all shadow-xs">
      {/* Top Announcement Bar */}
      {settings.announcement && (
        <div className="bg-slate-900 text-white text-xs py-1.5 px-4 text-center font-medium tracking-wide flex items-center justify-center gap-2">
          <span>{settings.announcement}</span>
        </div>
      )}

      {/* Main Header Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          
          {/* Mobile Menu Button */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 -ml-2 rounded-lg text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-hidden"
              aria-label="Abrir menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Logo */}
          <div className="flex items-center cursor-pointer shrink-0" onClick={() => onNavigate({ type: 'home' })}>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-800 flex items-center justify-center text-white font-extrabold text-xl shadow-md shadow-indigo-500/20">
                B
              </div>
              <div className="flex flex-col">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 font-sans">
                  Braga<span className="text-indigo-600">Store</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 -mt-1 hidden sm:block">
                  Variedades & Ofertas
                </span>
              </div>
            </div>
          </div>

          {/* Desktop Search Bar */}
          <div className="hidden md:flex flex-1 max-w-lg mx-4 relative" ref={searchRef}>
            <form onSubmit={handleSearchSubmit} className="w-full relative">
              <input
                type="text"
                placeholder="Buscar produtos, eletrônicos, utilidades..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSearchOpen(true);
                }}
                onFocus={() => setSearchOpen(true)}
                className="w-full bg-slate-100/80 hover:bg-slate-100 focus:bg-white text-sm text-slate-900 pl-11 pr-10 py-2.5 rounded-full border border-slate-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all outline-hidden"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </form>

            {/* Autocomplete Dropdown */}
            {searchOpen && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50">
                <div className="p-2 border-b border-slate-100 bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Sugestões Rápidas
                </div>
                <div className="divide-y divide-slate-100">
                  {suggestions.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        onNavigate({ type: 'product', slug: item.slug });
                        setSearchOpen(false);
                        setSearchQuery('');
                      }}
                      className="flex items-center gap-3 p-3 hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      <img
                        src={item.mainImage}
                        alt={item.title}
                        className="w-12 h-12 object-cover rounded-lg bg-slate-100 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">{item.title}</p>
                        <p className="text-xs font-semibold text-indigo-600">
                          {formatCurrencyBRL(item.promoPrice || item.price)}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </div>
                  ))}
                </div>
                <button
                  onClick={handleSearchSubmit}
                  className="w-full p-2.5 text-center text-xs font-semibold text-indigo-600 hover:bg-indigo-50 border-t border-slate-100 transition-colors"
                >
                  Ver todos os resultados para "{searchQuery}"
                </button>
              </div>
            )}
          </div>

          {/* Action Links */}
          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href="https://app.kaiross.com.br/rastreio"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold px-3 py-2 rounded-lg text-slate-700 hover:text-indigo-600 hover:bg-slate-100 transition-colors hidden lg:flex items-center gap-1.5"
              title="Rastreie sua encomenda no Kaiross"
            >
              <PackageSearch className="w-4 h-4 text-indigo-600" />
              <span>Rastrear Pedido</span>
            </a>

            <button
              onClick={() => onNavigate({ type: 'catalog' })}
              className={`text-sm font-semibold px-3 py-2 rounded-lg transition-colors hidden sm:flex items-center gap-1.5 ${
                currentRoute.type === 'catalog' && !currentRoute.category && !currentRoute.query
                  ? 'text-indigo-600 bg-indigo-50'
                  : 'text-slate-700 hover:text-indigo-600 hover:bg-slate-100'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Ver Catálogo</span>
            </button>

            <button
              onClick={() => onNavigate({ type: 'admin' })}
              className={`text-xs font-semibold px-3 py-2 rounded-lg border transition-all flex items-center gap-1.5 ${
                currentRoute.type === 'admin'
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-100'
              }`}
              title="Acessar Painel Administrativo da Loja"
            >
              <Lock className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden sm:inline">Painel Admin</span>
              {isAdminLoggedIn && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse ml-0.5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search Input */}
        <div className="md:hidden pb-3">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Buscar produtos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-100 text-sm text-slate-900 pl-10 pr-8 py-2 rounded-xl border border-slate-200 focus:bg-white focus:border-indigo-600 outline-hidden"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </form>
        </div>
      </div>

      {/* Category Navigation Bar (Desktop & Mobile Scrollable) */}
      <div className="border-t border-slate-100 bg-slate-50/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-2 text-xs font-medium text-slate-600">
            <button
              onClick={() => onNavigate({ type: 'home' })}
              className={`shrink-0 px-3 py-1.5 rounded-full transition-all ${
                currentRoute.type === 'home'
                  ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                  : 'hover:bg-slate-200/70 text-slate-700'
              }`}
            >
              Início
            </button>
            <button
              onClick={() => onNavigate({ type: 'catalog' })}
              className={`shrink-0 px-3 py-1.5 rounded-full transition-all ${
                currentRoute.type === 'catalog' && !currentRoute.category
                  ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                  : 'hover:bg-slate-200/70 text-slate-700'
              }`}
            >
              Todos os Produtos
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => onNavigate({ type: 'catalog', category: cat.slug })}
                className={`shrink-0 px-3 py-1.5 rounded-full transition-all flex items-center gap-1.5 ${
                  isCurrentCategory(cat.slug)
                    ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                    : 'hover:bg-slate-200/70 text-slate-700'
                }`}
              >
                {getCategoryIcon(cat.icon)}
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setMobileMenuOpen(false)} />
          <div className="fixed top-0 bottom-0 left-0 w-5/6 max-w-sm bg-white p-6 shadow-2xl flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">
                    B
                  </div>
                  <span className="font-extrabold text-slate-900 text-lg">Braga Store</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="py-4">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Navegação</p>
                <nav className="space-y-1">
                  <button
                    onClick={() => { onNavigate({ type: 'home' }); setMobileMenuOpen(false); }}
                    className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    Página Inicial
                  </button>
                  <button
                    onClick={() => { onNavigate({ type: 'catalog' }); setMobileMenuOpen(false); }}
                    className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    Ver Todo o Catálogo
                  </button>
                  <a
                    href="https://app.kaiross.com.br/rastreio"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full text-left px-3 py-2 rounded-lg text-sm font-bold text-indigo-700 bg-indigo-50/80 hover:bg-indigo-100 flex items-center justify-between transition-colors mt-1"
                  >
                    <span className="flex items-center gap-2">
                      <PackageSearch className="w-4 h-4 text-indigo-600" />
                      <span>Rastrear Meu Pedido (Kaiross)</span>
                    </span>
                    <ExternalLink className="w-3.5 h-3.5 text-indigo-400" />
                  </a>
                </nav>

                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-6 mb-2">Categorias</p>
                <div className="space-y-1">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        onNavigate({ type: 'catalog', category: cat.slug });
                        setMobileMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 flex items-center justify-between"
                    >
                      <span className="flex items-center gap-2">
                        {getCategoryIcon(cat.icon)}
                        {cat.name}
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    </button>
                  ))}
                </div>

                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-6 mb-2">Institucional</p>
                <div className="space-y-1 text-sm text-slate-600 font-medium">
                  <button
                    onClick={() => { onNavigate({ type: 'institutional', page: 'sobre' }); setMobileMenuOpen(false); }}
                    className="w-full text-left px-3 py-1.5 hover:text-indigo-600"
                  >
                    Sobre a Braga Store
                  </button>
                  <button
                    onClick={() => { onNavigate({ type: 'institutional', page: 'contato' }); setMobileMenuOpen(false); }}
                    className="w-full text-left px-3 py-1.5 hover:text-indigo-600"
                  >
                    Fale Conosco
                  </button>
                  <button
                    onClick={() => { onNavigate({ type: 'institutional', page: 'entrega' }); setMobileMenuOpen(false); }}
                    className="w-full text-left px-3 py-1.5 hover:text-indigo-600"
                  >
                    Política de Entrega
                  </button>
                  <button
                    onClick={() => { onNavigate({ type: 'institutional', page: 'trocas' }); setMobileMenuOpen(false); }}
                    className="w-full text-left px-3 py-1.5 hover:text-indigo-600"
                  >
                    Trocas e Devoluções
                  </button>
                </div>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="pt-6 border-t border-slate-100">
              <button
                onClick={() => { onNavigate({ type: 'admin' }); setMobileMenuOpen(false); }}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-900 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-sm"
              >
                <Lock className="w-3.5 h-3.5 text-indigo-400" />
                Painel Administrativo
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
