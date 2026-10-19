import React, { useState } from 'react';
import { Palette, Save, Upload, Sparkles, Image as ImageIcon } from 'lucide-react';
import { useStore } from '../../../context/StoreContext';
import { saveStoreSettings } from '../../../services/storeService';

export const AppearanceTab: React.FC = () => {
  const { settings, refreshData, showToast } = useStore();

  const [storeName, setStoreName] = useState(settings.storeName || 'Braga Store');
  const [tagline, setTagline] = useState(settings.tagline || '');
  const [logoUrl, setLogoUrl] = useState(settings.logoUrl || '');
  const [primaryColor, setPrimaryColor] = useState(settings.primaryColor || '#0F172A');
  const [accentColor, setAccentColor] = useState(settings.accentColor || '#2563EB');
  const [announcementEnabled, setAnnouncementEnabled] = useState(
    settings.announcementBar?.enabled || false
  );
  const [announcementText, setAnnouncementText] = useState(
    settings.announcementBar?.text || ''
  );
  const [announcementLink, setAnnouncementLink] = useState(
    settings.announcementBar?.link || ''
  );
  const [footerAbout, setFooterAbout] = useState(settings.footer?.aboutText || '');
  const [footerLegal, setFooterLegal] = useState(settings.footer?.legalNotice || '');
  const [trackingUrl, setTrackingUrl] = useState(settings.trackingUrl || 'https://app.kaiross.com.br/rastreio');

  const [saving, setSaving] = useState(false);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      showToast('O logo deve ter até 1MB.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setLogoUrl(event.target?.result as string);
      showToast('Logo carregado! Clique em Salvar para persistir.', 'success');
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await saveStoreSettings({
        ...settings,
        storeName: storeName.trim(),
        tagline: tagline.trim(),
        logoUrl: logoUrl.trim(),
        primaryColor,
        accentColor,
        trackingUrl: trackingUrl.trim(),
        announcementBar: {
          enabled: announcementEnabled,
          text: announcementText.trim(),
          link: announcementLink.trim(),
        },
        footer: {
          ...settings.footer,
          aboutText: footerAbout.trim(),
          legalNotice: footerLegal.trim(),
        },
      });
      await refreshData();
      showToast('Identidade visual e configurações salvas com sucesso!', 'success');
    } catch (err: any) {
      showToast('Erro ao salvar aparência: ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Aparência e Identidade Visual</h2>
          <p className="text-xs text-slate-500">
            Personalize o nome da loja, logotipo, barra de avisos e cores principais
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
        {/* Brand identity */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
            Identidade da Marca
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nome da Loja *
              </label>
              <input
                type="text"
                required
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="Braga Store"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-blue-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Slogan / Subtítulo
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="Curadoria de produtos e ofertas selecionadas"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-600 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Logotipo da Loja (URL ou Arquivo)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="https://... ou faça upload"
                className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-600 focus:bg-white"
              />
              <label className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoUpload}
                />
              </label>
            </div>
            {logoUrl && (
              <div className="mt-2 p-2 bg-slate-50 border border-slate-200 rounded-lg inline-block">
                <img src={logoUrl} alt="Prévia do logo" className="h-8 w-auto object-contain" />
              </div>
            )}
          </div>
        </div>

        {/* Colors */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
            Paleta de Cores
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Cor Principal (Cabeçalho & Rodapé)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-10 h-10 rounded-lg border border-slate-200 cursor-pointer p-0.5"
                />
                <input
                  type="text"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Cor de Destaque (Botões de Ação)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="w-10 h-10 rounded-lg border border-slate-200 cursor-pointer p-0.5"
                />
                <input
                  type="text"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Announcement Bar */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">Barra Superior de Aviso</h3>
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={announcementEnabled}
                onChange={(e) => setAnnouncementEnabled(e.target.checked)}
                className="rounded text-blue-600"
              />
              <span>Ativar barra</span>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Texto do Aviso
              </label>
              <input
                type="text"
                value={announcementText}
                onChange={(e) => setAnnouncementText(e.target.value)}
                placeholder="Ex: Conheça nossa seleção de novidades da semana!"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Link do Aviso (Opcional)
              </label>
              <input
                type="text"
                value={announcementLink}
                onChange={(e) => setAnnouncementLink(e.target.value)}
                placeholder="/produtos ou link externo"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>
        </div>

        {/* Footer Content */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
            Textos do Rodapé
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Apresentação da Loja no Rodapé
            </label>
            <textarea
              rows={2}
              value={footerAbout}
              onChange={(e) => setFooterAbout(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-600"
            ></textarea>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Link de Rastreio de Pedidos (Exibido no Rodapé)
            </label>
            <input
              type="url"
              value={trackingUrl}
              onChange={(e) => setTrackingUrl(e.target.value)}
              placeholder="https://app.kaiross.com.br/rastreio"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:border-blue-600"
            />
            <span className="text-[11px] text-slate-400 mt-1 block">
              URL do serviço de rastreio de encomendas exibido nos links de navegação e atendimento do rodapé.
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Aviso Legal e Transparência
            </label>
            <textarea
              rows={2}
              value={footerLegal}
              onChange={(e) => setFooterLegal(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-600"
            ></textarea>
          </div>
        </div>
      </form>
    </div>
  );
};
