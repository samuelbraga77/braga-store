import React from 'react';
import { ArrowLeft, Layers } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { ProductCard } from '../../components/public/ProductCard';

interface CategoryDetailPageProps {
  slug: string;
}

export const CategoryDetailPage: React.FC<CategoryDetailPageProps> = ({ slug }) => {
  const { categories, products, navigate } = useStore();

  const category = categories.find((c) => c.slug === slug || c.id === slug);
  const categoryProducts = products.filter(
    (p) =>
      p.status === 'published' &&
      (p.categoryId === category?.id || p.additionalCategories?.includes(category?.id || ''))
  );

  if (!category) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 text-center">
        <Layers className="w-10 h-10 text-slate-400 mb-3" />
        <h2 className="text-xl font-bold text-slate-900 mb-2">Categoria não encontrada</h2>
        <p className="text-xs text-slate-500 mb-6">Esta categoria não existe ou foi removida.</p>
        <button
          onClick={() => navigate('/categorias')}
          className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold"
        >
          Ver todas as categorias
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
            <button onClick={() => navigate('/')} className="hover:text-slate-900">
              Início
            </button>
            <span>/</span>
            <button onClick={() => navigate('/categorias')} className="hover:text-slate-900">
              Categorias
            </button>
            <span>/</span>
            <span className="text-slate-900 font-medium">{category.name}</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-1">
                {category.name}
              </h1>
              {category.description && (
                <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
                  {category.description}
                </p>
              )}
            </div>
            <button
              onClick={() => navigate('/produtos')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 self-start"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Ver todo o catálogo</span>
            </button>
          </div>
        </div>

        {/* Products in this category */}
        {categoryProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {categoryProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center max-w-md mx-auto shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Nenhum produto nesta categoria ainda
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Os produtos associados a esta categoria aparecerão aqui assim que forem publicados.
            </p>
            <button
              onClick={() => navigate('/produtos')}
              className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800"
            >
              Explorar outros produtos
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
