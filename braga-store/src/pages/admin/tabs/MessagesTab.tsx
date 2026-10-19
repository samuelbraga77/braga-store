import React, { useState, useEffect } from 'react';
import { Mail, Check, Trash2, MailOpen, Clock, Phone, User } from 'lucide-react';
import { ContactMessage } from '../../../types';
import {
  getContactMessages,
  markContactMessageRead,
  deleteContactMessage,
} from '../../../services/storeService';
import { useStore } from '../../../context/StoreContext';

export const MessagesTab: React.FC = () => {
  const { showToast } = useStore();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const list = await getContactMessages();
      setMessages(list);
    } catch (err: any) {
      console.error(err);
      showToast('Erro ao carregar mensagens: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, []);

  const handleToggleRead = async (msg: ContactMessage) => {
    try {
      await markContactMessageRead(msg.id, !msg.read);
      setMessages((prev) =>
        prev.map((m) => (m.id === msg.id ? { ...m, read: !m.read } : m))
      );
      if (selectedMessage?.id === msg.id) {
        setSelectedMessage({ ...selectedMessage, read: !msg.read });
      }
    } catch (err: any) {
      showToast('Erro ao atualizar status: ' + err.message, 'error');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteContactMessage(id);
      setMessages((prev) => prev.filter((m) => m.id !== id));
      if (selectedMessage?.id === id) setSelectedMessage(null);
      showToast('Mensagem excluída.', 'info');
    } catch (err: any) {
      showToast('Erro ao excluir: ' + err.message, 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Mensagens Recebidas</h2>
        <p className="text-xs text-slate-500">
          Mensagens enviadas pelos visitantes e clientes através do formulário de contato oficial
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Messages List (col-span-5) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col h-[600px]">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>{messages.length} mensagens recebidas</span>
            <button
              onClick={loadMessages}
              className="text-blue-600 hover:underline cursor-pointer"
            >
              Atualizar
            </button>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {messages.map((m) => (
              <div
                key={m.id}
                onClick={() => setSelectedMessage(m)}
                className={`p-4 transition-colors cursor-pointer flex flex-col gap-1 ${
                  selectedMessage?.id === m.id
                    ? 'bg-blue-50/70 border-l-4 border-blue-600'
                    : m.read
                    ? 'hover:bg-slate-50/70 opacity-75'
                    : 'bg-white hover:bg-slate-50/70 font-semibold'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-slate-900 truncate">{m.name}</span>
                  <span className="text-[10px] text-slate-400 shrink-0">
                    {new Date(m.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <span className="text-xs text-slate-700 line-clamp-1">{m.subject}</span>
                <span className="text-[11px] text-slate-400 line-clamp-1">{m.message}</span>
              </div>
            ))}

            {messages.length === 0 && !loading && (
              <div className="p-12 text-center text-slate-400 text-xs">
                Nenhuma mensagem recebida ainda.
              </div>
            )}
          </div>
        </div>

        {/* Selected Message Reader (col-span-7) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm h-[600px] flex flex-col justify-between">
          {selectedMessage ? (
            <div className="flex flex-col h-full justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 mb-1">
                      {selectedMessage.subject}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5" />
                        {selectedMessage.name}
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1 font-mono text-blue-600">
                        <Mail className="w-3.5 h-3.5" />
                        {selectedMessage.email}
                      </span>
                      {selectedMessage.phone && (
                        <>
                          <span>·</span>
                          <span className="flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5" />
                            {selectedMessage.phone}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleRead(selectedMessage)}
                      className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl cursor-pointer"
                      title={selectedMessage.read ? 'Marcar como não lida' : 'Marcar como lida'}
                    >
                      {selectedMessage.read ? (
                        <Mail className="w-4 h-4" />
                      ) : (
                        <MailOpen className="w-4 h-4 text-emerald-600" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(selectedMessage.id)}
                      className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl cursor-pointer"
                      title="Excluir mensagem"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="text-xs text-slate-400 mb-4 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>
                    Enviada em {new Date(selectedMessage.createdAt).toLocaleString('pt-BR')}
                  </span>
                </div>

                <div className="bg-slate-50 rounded-2xl p-6 text-sm text-slate-800 leading-relaxed whitespace-pre-line border border-slate-100">
                  {selectedMessage.message}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <a
                  href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(
                    selectedMessage.subject
                  )}`}
                  className="px-4 py-2 bg-slate-900 hover:bg-blue-600 text-white rounded-xl text-xs font-semibold inline-flex items-center gap-2 transition-colors"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Responder por E-mail</span>
                </a>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-400">
              <Mail className="w-12 h-12 mb-2 text-slate-300" />
              <p className="text-xs">Selecione uma mensagem na lista ao lado para ler o conteúdo.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
