import React from 'react';
import { ArrowLeft, Home } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const NotFoundPage: React.FC = () => {
  const { navigate } = useStore();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 rounded-3xl bg-slate-100 text-slate-400 flex items-center justify-center mb-6">
        <span className="text-3xl font-extrabold text-slate-800">404</span>
      </div>
      <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
        Página não encontrada
      </h1>
      <p className="text-sm text-slate-500 max-w-md mb-8 leading-relaxed">
        O endereço acessado não existe, foi movido ou está temporariamente indisponível.
      </p>
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <Home className="w-4 h-4" />
          <span>Ir para a Página Inicial</span>
        </button>
        <button
          onClick={() => navigate('/produtos')}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-200 transition-colors cursor-pointer"
        >
          <span>Ver Produtos</span>
        </button>
      </div>
    </div>
  );
};
