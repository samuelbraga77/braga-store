import React, { useState, useEffect } from 'react';
import { History, Clock, User, ShieldAlert, RefreshCw } from 'lucide-react';
import { AuditLog } from '../../../types';
import { getAuditLogs } from '../../../services/storeService';
import { useStore } from '../../../context/StoreContext';

export const AuditLogTab: React.FC = () => {
  const { showToast } = useStore();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const list = await getAuditLogs();
      setLogs(list);
    } catch (err: any) {
      console.error(err);
      showToast('Erro ao carregar histórico: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Histórico de Alterações</h2>
          <p className="text-xs text-slate-500">
            Registro cronológico das ações administrativas realizadas no painel
          </p>
        </div>
        <button
          onClick={loadLogs}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer self-start"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Atualizar Logs</span>
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        {logs.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {logs.map((log) => (
              <div key={log.id} className="p-4 hover:bg-slate-50/70 transition-colors flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-900 block">
                    {log.action}
                  </span>
                  <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3 text-slate-400" />
                      {log.userEmail}
                    </span>
                    <span>·</span>
                    <span>Alvo: {log.targetType} #{log.targetId}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-[11px] text-slate-400 shrink-0">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{new Date(log.timestamp).toLocaleString('pt-BR')}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center text-slate-400 text-xs">
            {loading ? 'Carregando histórico...' : 'Nenhuma alteração registrada ainda.'}
          </div>
        )}
      </div>
    </div>
  );
};
