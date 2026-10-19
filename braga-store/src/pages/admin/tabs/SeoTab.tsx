import React, { useState } from 'react';
import { Globe, Save, ExternalLink, CheckCircle2, FileCode, Shield } from 'lucide-react';
import { useStore } from '../../../context/StoreContext';
import { saveStoreSettings } from '../../../services/storeService';

export const SeoTab: React.FC = () => {
  const { settings, refreshData, showToast } = useStore();

  const [defaultTitle, setDefaultTitle] = useState(
    settings.seo?.defaultTitle || 'Braga Store — Loja Virtual'
  );
  const [defaultDescription, setDefaultDescription] = useState(
    settings.seo?.defaultDescription ||
      'Loja virtual moderna com catálogo completo, produtos selecionados e as melhores ofertas.'
  );
  const [googleSearchConsoleTag, setGoogleSearchConsoleTag] = useState(
    settings.seo?.googleSearchConsoleTag || ''
  );
  const [metaKeywords, setMetaKeywords] = useState(
    settings.seo?.metaKeywords || 'loja virtual, compras, ofertas, braga store'
  );

  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await saveStoreSettings({
        ...settings,
        seo: {
          defaultTitle: defaultTitle.trim(),
          defaultDescription: defaultDescription.trim(),
          googleSearchConsoleTag: googleSearchConsoleTag.trim(),
          metaKeywords: metaKeywords.trim(),
        },
      });
      await refreshData();
      showToast('Configurações de SEO salvas permanentemente!', 'success');
    } catch (err: any) {
      showToast('Erro ao salvar SEO: ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">SEO e Otimização para Buscadores</h2>
          <p className="text-xs text-slate-500">
            Configure títulos, meta descrições, tags de verificação e inspecione o sitemap técnico
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors cursor-pointer disabled:opacity-50 self-start"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Gravando...' : 'Salvar Alterações'}</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
            Metadados Globais
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Título Padrão da Loja (Title Tag) *
            </label>
            <input
              type="text"
              required
              value={defaultTitle}
              onChange={(e) => setDefaultTitle(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-600 focus:bg-white"
            />
            <span className="text-[11px] text-slate-400 mt-1 block">
              Comprimento ideal: entre 40 e 60 caracteres ({defaultTitle.length} caracteres).
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Meta Descrição Padrão *
            </label>
            <textarea
              rows={3}
              required
              value={defaultDescription}
              onChange={(e) => setDefaultDescription(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-600 focus:bg-white"
            ></textarea>
            <span className="text-[11px] text-slate-400 mt-1 block">
              Comprimento ideal: entre 120 e 160 caracteres ({defaultDescription.length} caracteres).
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Palavras-chave (Meta Keywords)
            </label>
            <input
              type="text"
              value={metaKeywords}
              onChange={(e) => setMetaKeywords(e.target.value)}
              placeholder="loja virtual, compras, ofertas, produtos"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Código de Verificação Google Search Console (opcional)
            </label>
            <input
              type="text"
              value={googleSearchConsoleTag}
              onChange={(e) => setGoogleSearchConsoleTag(e.target.value)}
              placeholder="google-site-verification=..."
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:border-blue-600"
            />
            <span className="text-[11px] text-slate-400 mt-1 block">
              Insira o código fornecido pelo Google Search Console para validar a propriedade do domínio.
            </span>
          </div>
        </div>

        {/* Technical SEO Endpoints Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center justify-between">
            <span>Arquivos Técnicos e Rastreamento</span>
            <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
              Configurado e Ativo
            </span>
          </h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex items-center gap-3">
                <FileCode className="w-5 h-5 text-blue-600" />
                <div>
                  <span className="font-mono font-semibold text-xs text-slate-800 block">
                    /sitemap.xml
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Mapa dinâmico contendo as URLs da loja para indexação no Google
                  </span>
                </div>
              </div>
              <a
                href="/sitemap.xml"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-blue-600 hover:underline inline-flex items-center gap-1"
              >
                <span>Visualizar</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-slate-700" />
                <div>
                  <span className="font-mono font-semibold text-xs text-slate-800 block">
                    /robots.txt
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Instruções para rastreadores (protege a rota /admin de ser indexada)
                  </span>
                </div>
              </div>
              <a
                href="/robots.txt"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-blue-600 hover:underline inline-flex items-center gap-1"
              >
                <span>Visualizar</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
