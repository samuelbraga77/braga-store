import React, { useState } from 'react';
import { Plus, Trash2, ArrowUp, ArrowDown, Save, Link as LinkIcon } from 'lucide-react';
import { useStore } from '../../../context/StoreContext';
import { NavItem } from '../../../types';
import { saveStoreSettings } from '../../../services/storeService';

export const NavigationTab: React.FC = () => {
  const { settings, refreshData, showToast } = useStore();
  const [navItems, setNavItems] = useState<NavItem[]>(settings.navigation || []);
  const [newLabel, setNewLabel] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [saving, setSaving] = useState(false);

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabel.trim() || !newUrl.trim()) return;

    const item: NavItem = {
      id: 'nav_' + Date.now(),
      label: newLabel.trim(),
      url: newUrl.trim(),
      order: navItems.length + 1,
      isActive: true,
    };
    setNavItems((prev) => [...prev, item]);
    setNewLabel('');
    setNewUrl('');
  };

  const handleRemove = (id: string) => {
    setNavItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleToggle = (id: string) => {
    setNavItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, isActive: !i.isActive } : i))
    );
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= navItems.length) return;

    const copy = [...navItems];
    const temp = copy[index];
    copy[index] = copy[targetIndex];
    copy[targetIndex] = temp;
    copy.forEach((item, idx) => {
      item.order = idx + 1;
    });
    setNavItems(copy);
  };

  const handleSaveNavigation = async () => {
    setSaving(true);
    try {
      await saveStoreSettings({
        ...settings,
        navigation: navItems,
      });
      await refreshData();
      showToast('Menu de navegação atualizado permanentemente!', 'success');
    } catch (err: any) {
      showToast('Erro ao salvar menu: ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Menu e Navegação Principal</h2>
          <p className="text-xs text-slate-500">
            Personalize os links do cabeçalho da loja, ordem de exibição e visibilidade
          </p>
        </div>
        <button
          onClick={handleSaveNavigation}
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors cursor-pointer disabled:opacity-50 self-start"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Gravando...' : 'Salvar Alterações'}</span>
        </button>
      </div>

      {/* Nav items list */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-2">
        {navItems.map((item, index) => (
          <div
            key={item.id}
            className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 gap-4"
          >
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono font-bold text-slate-400 w-5">
                #{index + 1}
              </span>
              <div>
                <span className="text-xs font-bold text-slate-900 block">{item.label}</span>
                <span className="text-[11px] font-mono text-slate-400">{item.url}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleToggle(item.id)}
                className={`text-[10px] font-semibold px-2.5 py-1 rounded-full cursor-pointer transition-colors ${
                  item.isActive
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {item.isActive ? 'Ativo' : 'Oculto'}
              </button>

              <button
                type="button"
                disabled={index === 0}
                onClick={() => handleMove(index, 'up')}
                className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                title="Mover para cima"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
              <button
                type="button"
                disabled={index === navItems.length - 1}
                onClick={() => handleMove(index, 'down')}
                className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                title="Mover para baixo"
              >
                <ArrowDown className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => handleRemove(item.id)}
                className="p-1.5 text-slate-400 hover:text-rose-600 cursor-pointer"
                title="Remover item"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add New Item Form */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Plus className="w-4 h-4 text-blue-600" />
          <span>Adicionar Novo Item ao Menu</span>
        </h3>
        <form onSubmit={handleAddItem} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
          <div className="sm:col-span-5">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Rótulo do Link *
            </label>
            <input
              type="text"
              required
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder="Ex: Lançamentos"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-600"
            />
          </div>

          <div className="sm:col-span-5">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Destino / URL *
            </label>
            <input
              type="text"
              required
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="/produtos ou https://..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:border-blue-600"
            />
          </div>

          <div className="sm:col-span-2">
            <button
              type="submit"
              className="w-full py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              Adicionar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
