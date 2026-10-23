import React from 'react';
import { 
  Smartphone, 
  Home, 
  Watch, 
  Sparkles, 
  Wrench, 
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import { Category, Product, ViewRoute } from '../../types';

interface CategoryGridProps {
  categories: Category[];
  products: Product[];
  onNavigate: (route: ViewRoute) => void;
}

export const CategoryGrid: React.FC<CategoryGridProps> = ({ categories, products, onNavigate }) => {
  const getCategoryIcon = (iconName?: string) => {
    switch (iconName?.toLowerCase()) {
      case 'smartphone': return <Smartphone className="w-6 h-6 text-indigo-600" />;
      case 'home': return <Home className="w-6 h-6 text-amber-600" />;
      case 'watch': return <Watch className="w-6 h-6 text-rose-600" />;
      case 'wrench': return <Wrench className="w-6 h-6 text-emerald-600" />;
      default: return <Sparkles className="w-6 h-6 text-blue-600" />;
    }
  };

  const getProductCount = (categorySlug: string) => {
    return products.filter(p => p.status === 'active' && p.category.toLowerCase() === categorySlug.toLowerCase()).length;
  };

  return (
    <section className="py-12 bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Navegue por Departamentos</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
              Categorias em Destaque
            </h2>
          </div>
          <button
            onClick={() => onNavigate({ type: 'catalog' })}
            className="text-xs sm:text-sm font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
          >
            <span>Ver Todas</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((cat) => {
            const count = getProductCount(cat.slug);
            return (
              <div
                key={cat.id}
                onClick={() => onNavigate({ type: 'catalog', category: cat.slug })}
                className="group p-5 rounded-2xl bg-slate-50 hover:bg-white border border-slate-200/80 hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-white group-hover:bg-indigo-50 border border-slate-200/60 flex items-center justify-center mb-4 transition-colors">
                    {getCategoryIcon(cat.icon)}
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors line-clamp-1">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                    {cat.description || 'Confira os lançamentos e ofertas selecionadas.'}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-200/50 flex items-center justify-between text-xs font-semibold text-slate-500 group-hover:text-indigo-600">
                  <span>{count} {count === 1 ? 'item' : 'itens'}</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
