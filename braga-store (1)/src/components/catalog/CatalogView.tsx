import React, { useState, useMemo, useEffect } from 'react';
import { 
  Filter, 
  ArrowUpDown, 
  Search, 
  X, 
  SlidersHorizontal,
  ChevronRight,
  PackageOpen,
  Check
} from 'lucide-react';
import { Product, Category, ViewRoute } from '../../types';
import { ProductCard } from './ProductCard';

interface CatalogViewProps {
  products: Product[];
  categories: Category[];
  initialCategory?: string;
  initialQuery?: string;
  onNavigate: (route: ViewRoute) => void;
}

export const CatalogView: React.FC<CatalogViewProps> = ({
  products,
  categories,
  initialCategory,
  initialQuery,
  onNavigate
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'all');
  const [searchQuery, setSearchQuery] = useState<string>(initialQuery || '');
  const [sortBy, setSortBy] = useState<'featured' | 'price_asc' | 'price_desc' | 'newest'>('featured');
  const [priceMax, setPriceMax] = useState<number>(1000);
  const [onlyInStock, setOnlyInStock] = useState<boolean>(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState<boolean>(false);

  // Sync with prop changes
  useEffect(() => {
    if (initialCategory) setSelectedCategory(initialCategory);
    if (initialQuery !== undefined) setSearchQuery(initialQuery);
  }, [initialCategory, initialQuery]);

  // Max price among products
  const highestPriceInCatalog = useMemo(() => {
    return Math.max(...products.map(p => p.promoPrice || p.price), 500);
  }, [products]);

  // Filter & sort logic
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      // Status filter (only show active in public catalog)
      if (p.status !== 'active') return false;

      // Category filter
      if (selectedCategory !== 'all') {
        const catMatch = p.category.toLowerCase() === selectedCategory.toLowerCase();
        if (!catMatch) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = p.title.toLowerCase().includes(q);
        const matchesDesc = p.description.toLowerCase().includes(q);
        const matchesCat = p.category.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesCat) return false;
      }

      // Max price
      const effectivePrice = p.promoPrice || p.price;
      if (effectivePrice > priceMax) return false;

      // Stock filter
      if (onlyInStock && p.stockStatus === 'out_of_stock') return false;

      return true;
    }).sort((a, b) => {
      const priceA = a.promoPrice || a.price;
      const priceB = b.promoPrice || b.price;

      if (sortBy === 'price_asc') return priceA - priceB;
      if (sortBy === 'price_desc') return priceB - priceA;
      if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      // default: featured first
      if (a.isFeatured && !b.isFeatured) return -1;
      if (!a.isFeatured && b.isFeatured) return 1;
      return 0;
    });
  }, [products, selectedCategory, searchQuery, sortBy, priceMax, onlyInStock]);

  const clearAllFilters = () => {
    setSelectedCategory('all');
    setSearchQuery('');
    setSortBy('featured');
    setPriceMax(highestPriceInCatalog);
    setOnlyInStock(false);
  };

  const hasActiveFilters = selectedCategory !== 'all' || searchQuery || sortBy !== 'featured' || onlyInStock || priceMax < highestPriceInCatalog;

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-slate-500 mb-6">
          <button 
            onClick={() => onNavigate({ type: 'home' })}
            className="hover:text-indigo-600 transition-colors"
          >
            Início
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-800 font-semibold">
            {selectedCategory === 'all' ? 'Todos os Produtos' : `Categoria: ${selectedCategory}`}
          </span>
        </nav>

        {/* Catalog Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 mb-8 border-b border-slate-200">
          <div>
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Catálogo Oficial</span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
              {selectedCategory === 'all' 
                ? 'Todos os Produtos' 
                : categories.find(c => c.slug === selectedCategory)?.name || selectedCategory}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Exibindo <span className="font-bold text-slate-800">{filteredProducts.length}</span> produtos disponíveis
            </p>
          </div>

          {/* Quick Toolbar */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              className="md:hidden flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 shadow-2xs"
            >
              <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
              <span>Filtros {hasActiveFilters && '(Ativos)'}</span>
            </button>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-2xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="text-xs font-semibold text-slate-700 bg-transparent outline-hidden cursor-pointer"
              >
                <option value="featured">Destaques e Relevância</option>
                <option value="price_asc">Menor Preço</option>
                <option value="price_desc">Maior Preço</option>
                <option value="newest">Mais Recentes</option>
              </select>
            </div>
          </div>
        </div>

        {/* Layout: Sidebar Filters + Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Desktop Sidebar Filters */}
          <aside className="hidden md:block md:col-span-3 space-y-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs sticky top-24">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <Filter className="w-4 h-4 text-indigo-600" />
                <span>Filtros</span>
              </div>
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="text-[11px] font-semibold text-rose-600 hover:text-rose-800 transition-colors"
                >
                  Limpar todos
                </button>
              )}
            </div>

            {/* Search within catalog */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-2">Busca</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Nome do produto..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-xs bg-slate-50 rounded-xl pl-8 pr-7 py-2.5 border border-slate-200 focus:bg-white focus:border-indigo-600 outline-hidden"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Categories */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-2">Departamentos</label>
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => setSelectedCategory('all')}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center justify-between ${
                    selectedCategory === 'all'
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>Todos os Departamentos</span>
                  {selectedCategory === 'all' && <Check className="w-3.5 h-3.5" />}
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.slug)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center justify-between ${
                      selectedCategory === cat.slug
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>{cat.name}</span>
                    {selectedCategory === cat.slug && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-700">Preço Máximo</label>
                <span className="text-xs font-black text-indigo-600">
                  Até R$ {priceMax.toFixed(0)}
                </span>
              </div>
              <input
                type="range"
                min="50"
                max={highestPriceInCatalog}
                step="20"
                value={priceMax}
                onChange={(e) => setPriceMax(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
            </div>

            {/* In Stock toggle */}
            <div className="pt-2 border-t border-slate-100">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={onlyInStock}
                  onChange={(e) => setOnlyInStock(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                />
                <span>Apenas produtos em estoque</span>
              </label>
            </div>
          </aside>

          {/* Products Grid */}
          <main className="col-span-1 md:col-span-9">
            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
                <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
                  <PackageOpen className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  Nenhum produto encontrado
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mb-6">
                  Tente ajustar os filtros, buscar por outro termo ou navegar por outra categoria.
                </p>
                <button
                  onClick={clearAllFilters}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-colors shadow-xs"
                >
                  Limpar Filtros e Ver Todos
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((p, idx) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    onNavigate={onNavigate}
                    priority={idx < 3}
                  />
                ))}
              </div>
            )}
          </main>

        </div>

      </div>
    </div>
  );
};
