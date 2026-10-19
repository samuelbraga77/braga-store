import React, { useEffect } from 'react';
import { ArrowLeft, Clock } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { DEFAULT_INSTITUTIONAL_PAGES } from '../../services/storeService';

interface InstitutionalPageViewProps {
  slug: string;
}

export const InstitutionalPageView: React.FC<InstitutionalPageViewProps> = ({ slug }) => {
  const { pages, navigate } = useStore();

  const page =
    pages.find((p) => p.slug === slug && p.isPublished) ||
    DEFAULT_INSTITUTIONAL_PAGES.find((p) => p.slug === slug);

  useEffect(() => {
    if (page) {
      document.title = page.seoTitle || page.title;
    }
  }, [page]);

  if (!page) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 text-center">
        <h2 className="text-xl font-bold text-slate-900 mb-2">Página não encontrada</h2>
        <p className="text-xs text-slate-500 mb-6">O conteúdo solicitado não está disponível.</p>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold"
        >
          Voltar ao Início
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 mb-4 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar à loja</span>
          </button>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 mb-3">
            {page.title}
          </h1>
          {page.updatedAt && (
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Clock className="w-3.5 h-3.5" />
              <span>Atualizado em {new Date(page.updatedAt).toLocaleDateString('pt-BR')}</span>
            </div>
          )}
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 shadow-sm text-slate-700 leading-relaxed text-sm whitespace-pre-line space-y-4">
          {page.content}
        </div>
      </div>
    </div>
  );
};
