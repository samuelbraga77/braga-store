import React from 'react';
import { ArrowRight, Layers, ArrowLeft } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const CategoriesPage: React.FC = () => {
  const { categories, products, navigate } = useStore();
  const publishedCategories = categories.filter((c) => c.isPublished).sort((a, b) => a.order - b.order);
  const publishedProducts = products.filter((p) => p.status === 'published');

  return (
    <div className="min-h-screen bg-slate-50/50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
            <button onClick={() => navigate('/')} className="hover:text-slate-900 cursor-pointer">
              Início
            </button>
            <span>/</span>
            <span className="text-slate-900 font-medium">Categorias</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Categorias de Produtos
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Navegue pelos departamentos organizados da Braga Store
          </p>
        </div>

        {publishedCategories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {publishedCategories.map((cat) => {
              const count = publishedProducts.filter((p) => p.categoryId === cat.id).length;
              return (
                <div
                  key={cat.id}
                  onClick={() => navigate(`/categoria/${cat.slug}`)}
                  className="group bg-white border border-slate-200 rounded-2xl p-6 hover:border-blue-500 hover:shadow-lg transition-all flex flex-col justify-between cursor-pointer"
                >
                  <div>
                    {cat.imageUrl ? (
                      <img
                        src={cat.imageUrl}
                        alt={cat.name}
                        className="w-full h-40 object-cover rounded-xl mb-4 group-hover:scale-102 transition-transform"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xl mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        {cat.name.charAt(0)}
                      </div>
                    )}
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors mb-2">
                      {cat.name}
                    </h3>
                    {cat.description && (
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
                        {cat.description}
                      </p>
                    )}
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-600 group-hover:text-blue-600">
                    <span>
                      {count} {count === 1 ? 'produto' : 'produtos'}
                    </span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center max-w-md mx-auto shadow-sm">
            <Layers className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Nenhuma categoria cadastrada
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              As categorias serão exibidas aqui assim que forem configuradas no painel.
            </p>
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Voltar ao Início
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
