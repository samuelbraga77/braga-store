import React, { useState } from 'react';
import { Download, Upload, Database, CheckCircle2, AlertCircle, FileJson } from 'lucide-react';
import { useStore } from '../../../context/StoreContext';
import { saveProduct, saveCategory, saveBanner, saveStoreSettings } from '../../../services/storeService';

export const BackupTab: React.FC = () => {
  const { products, categories, banners, settings, refreshData, showToast } = useStore();
  const [importing, setImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleExport = () => {
    const backupData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      storeName: settings.storeName,
      settings,
      products,
      categories,
      banners,
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `backup_bragastore_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    showToast('Backup exportado com sucesso em formato JSON!', 'success');
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        setImporting(true);
        setImportStatus('Validando arquivo JSON...');
        const content = event.target?.result as string;
        const data = JSON.parse(content);

        if (!data || typeof data !== 'object') {
          throw new Error('Arquivo JSON inválido.');
        }

        setImportStatus('Restaurando configurações...');
        if (data.settings) {
          await saveStoreSettings(data.settings);
        }

        setImportStatus('Restaurando categorias...');
        if (Array.isArray(data.categories)) {
          for (const cat of data.categories) {
            await saveCategory(cat);
          }
        }

        setImportStatus('Restaurando produtos...');
        if (Array.isArray(data.products)) {
          for (const prod of data.products) {
            await saveProduct(prod);
          }
        }

        setImportStatus('Restaurando banners...');
        if (Array.isArray(data.banners)) {
          for (const banner of data.banners) {
            await saveBanner(banner);
          }
        }

        await refreshData();
        setImportStatus(null);
        showToast('Backup restaurado e persistido no banco com sucesso!', 'success');
      } catch (err: any) {
        console.error(err);
        setImportStatus(null);
        showToast('Falha na restauração do backup: ' + err.message, 'error');
      } finally {
        setImporting(false);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Backup e Exportação de Dados</h2>
        <p className="text-xs text-slate-500">
          Exporte uma cópia completa de segurança de todos os produtos, configurações e categorias em JSON, ou importe dados salvos anteriormente.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Export Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold mb-4">
              <Download className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Exportar Backup Completo</h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-6">
              Gera um arquivo JSON contendo {products.length} produtos, {categories.length} categorias, banners e todas as configurações da loja.
            </p>
          </div>
          <button
            onClick={handleExport}
            className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Baixar Arquivo JSON</span>
          </button>
        </div>

        {/* Import Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold mb-4">
              <Upload className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Restaurar Backup</h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-6">
              Faça o upload de um arquivo de backup JSON previamente gerado para restaurar produtos, categorias e configurações diretamente no Firestore.
            </p>
          </div>

          <div>
            {importStatus && (
              <p className="text-xs text-blue-600 font-semibold mb-2 animate-pulse">{importStatus}</p>
            )}
            <label className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer">
              <FileJson className="w-4 h-4" />
              <span>{importing ? 'Restaurando...' : 'Selecionar Arquivo JSON'}</span>
              <input
                type="file"
                accept=".json,application/json"
                disabled={importing}
                className="hidden"
                onChange={handleImportFile}
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
