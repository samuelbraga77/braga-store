import React, { useState } from 'react';
import { Plus, Edit2, Trash2, FileText, Save, X, ExternalLink } from 'lucide-react';
import { useStore } from '../../../context/StoreContext';
import { InstitutionalPage } from '../../../types';
import { savePage, deletePage, DEFAULT_INSTITUTIONAL_PAGES } from '../../../services/storeService';

export const PagesTab: React.FC = () => {
  const { pages, refreshData, showToast } = useStore();

  const allPages = pages.length > 0 ? pages : DEFAULT_INSTITUTIONAL_PAGES;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<InstitutionalPage | null>(null);

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [isPublished, setIsPublished] = useState(true);

  const [saving, setSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const openCreateModal = () => {
    setEditingPage(null);
    setTitle('');
    setSlug('');
    setContent('');
    setSeoTitle('');
    setSeoDescription('');
    setIsPublished(true);
    setIsModalOpen(true);
  };

  const openEditModal = (p: InstitutionalPage) => {
    setEditingPage(p);
    setTitle(p.title);
    setSlug(p.slug);
    setContent(p.content);
    setSeoTitle(p.seoTitle || '');
    setSeoDescription(p.seoDescription || '');
    setIsPublished(p.isPublished);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      showToast('Título e conteúdo são obrigatórios.', 'error');
      return;
    }

    setSaving(true);
    try {
      const pageData: InstitutionalPage = {
        id: editingPage?.id || slug.trim() || 'page_' + Date.now(),
        title: title.trim(),
        slug: slug.trim() || generateSlug(title),
        content: content.trim(),
        seoTitle: seoTitle.trim() || `${title.trim()} — Braga Store`,
        seoDescription: seoDescription.trim(),
        isPublished,
        updatedAt: new Date().toISOString(),
      };

      await savePage(pageData);
      await refreshData();
      setIsModalOpen(false);
      showToast('Página institucional salva com sucesso!', 'success');
    } catch (err: any) {
      showToast('Erro ao salvar página: ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deletePage(id);
      await refreshData();
      setDeleteConfirmId(null);
      showToast('Página removida.', 'info');
    } catch (err: any) {
      showToast('Erro ao excluir página: ' + err.message, 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Páginas Institucionais</h2>
          <p className="text-xs text-slate-500">
            Edite termos de uso, privacidade, cookies, FAQ e páginas informativas da loja
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-sm self-start"
        >
          <Plus className="w-4 h-4" />
          <span>Criar Nova Página</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {allPages.map((page) => (
          <div
            key={page.id}
            className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                  <h3 className="font-bold text-slate-900 text-sm line-clamp-1">{page.title}</h3>
                </div>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                    page.isPublished
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {page.isPublished ? 'Publicada' : 'Rascunho'}
                </span>
              </div>
              <span className="text-[11px] font-mono text-slate-400 block mb-3">
                /pagina/{page.slug}
              </span>
              <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed mb-4">
                {page.content.replace(/[#*`_]/g, '')}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <a
                href={`/pagina/${page.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-500 hover:text-blue-600 flex items-center gap-1 font-medium"
              >
                <span>Visualizar</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => openEditModal(page)}
                  className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer"
                  title="Editar página"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeleteConfirmId(page.id)}
                  className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                  title="Excluir página"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl animate-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900 mb-2">Excluir Página</h3>
            <p className="text-xs text-slate-500 mb-6">
              Tem certeza que deseja excluir esta página institucional?
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl animate-in zoom-in-95 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900">
                {editingPage ? 'Editar Página' : 'Criar Nova Página'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Título da Página *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      if (!editingPage) setSlug(generateSlug(e.target.value));
                    }}
                    placeholder="Ex: Política de Entregas"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Slug (URL amigável) *
                  </label>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="politica-de-entregas"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:border-blue-600 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Conteúdo da Página *
                </label>
                <textarea
                  rows={10}
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Escreva os parágrafos, tópicos e informações detalhadas..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs leading-relaxed focus:outline-none focus:border-blue-600 focus:bg-white"
                ></textarea>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Título SEO (Opcional)
                  </label>
                  <input
                    type="text"
                    value={seoTitle}
                    onChange={(e) => setSeoTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isPublished}
                      onChange={(e) => setIsPublished(e.target.checked)}
                      className="rounded text-blue-600"
                    />
                    <span>Publicar Página no Site</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {saving ? 'Gravando...' : 'Salvar Página'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
