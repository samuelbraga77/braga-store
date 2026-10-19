import React from 'react';
import { Tag, ArrowLeft } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { ProductCard } from '../../components/public/ProductCard';

export const OffersPage: React.FC = () => {
  const { products, navigate } = useStore();
  const offerProducts = products.filter((p) => p.isOffer && p.status === 'published');

  return (
    <div className="min-h-screen bg-slate-50/50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
            <button onClick={() => navigate('/')} className="hover:text-slate-900 cursor-pointer">
              Início
            </button>
            <span>/</span>
            <span className="text-slate-900 font-medium">Ofertas</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
                Ofertas Selecionadas
              </h1>
              <p className="text-slate-500 text-sm mt-0.5">
                Produtos oficiais com descontos e condições especiais vigentes
              </p>
            </div>
          </div>
        </div>

        {offerProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {offerProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center max-w-md mx-auto shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-400 flex items-center justify-center mx-auto mb-3">
              <Tag className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Nenhuma oferta ativa no momento
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Apenas produtos cadastrados e explicitamente marcados como oferta com preços reais válidos são exibidos nesta seção.
            </p>
            <button
              onClick={() => navigate('/produtos')}
              className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800"
            >
              Ver todos os produtos
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
