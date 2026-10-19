import React, { useState, useEffect } from 'react';
import { ShieldCheck, UserPlus, Trash2, Shield, User, AlertCircle } from 'lucide-react';
import { AdminUser } from '../../../types';
import { getAdminUsers, addAdminUser, removeAdminUser, INITIAL_ADMIN_EMAIL } from '../../../services/storeService';
import { useAuth } from '../../../context/AuthContext';
import { useStore } from '../../../context/StoreContext';

export const UsersTab: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useStore();

  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  const loadAdmins = async () => {
    try {
      setLoading(true);
      const list = await getAdminUsers();
      setAdmins(list);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdmins();
  }, []);

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim() || !newEmail.includes('@')) {
      showToast('Informe um e-mail do Google válido.', 'error');
      return;
    }

    setAdding(true);
    try {
      await addAdminUser(newEmail.trim().toLowerCase());
      await loadAdmins();
      setNewEmail('');
      showToast(`Administrador ${newEmail} adicionado com sucesso!`, 'success');
    } catch (err: any) {
      showToast('Erro ao adicionar admin: ' + err.message, 'error');
    } finally {
      setAdding(false);
    }
  };

  const handleRemove = async (docId: string, email: string) => {
    if (email === INITIAL_ADMIN_EMAIL) {
      showToast('O administrador principal bootstrap não pode ser removido.', 'error');
      return;
    }

    try {
      await removeAdminUser(docId);
      await loadAdmins();
      showToast(`Acesso de ${email} revogado.`, 'info');
    } catch (err: any) {
      showToast('Erro ao remover admin: ' + err.message, 'error');
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Usuários e Permissões Administrativas</h2>
        <p className="text-xs text-slate-500">
          Apenas as contas Google autorizadas nesta lista possuem acesso ao painel de gerenciamento
        </p>
      </div>

      {/* Security Info Card */}
      <div className="bg-slate-900 text-slate-200 rounded-2xl p-5 border border-slate-800 text-xs flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-white block">
            Segurança em Nível de Banco de Dados (Firestore Rules)
          </span>
          <p className="text-slate-400 leading-relaxed">
            As regras de segurança exigem autenticação do Google e verificam a presença da conta na coleção protegida de administradores. Visitantes comuns não conseguem alterar ou apagar dados.
          </p>
        </div>
      </div>

      {/* Add Admin Form */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
          <UserPlus className="w-4 h-4 text-blue-600" />
          <span>Autorizar Nova Conta Google</span>
        </h3>
        <form onSubmit={handleAddAdmin} className="flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            required
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="usuario@gmail.com"
            className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-600 focus:bg-white"
          />
          <button
            type="submit"
            disabled={adding}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold cursor-pointer disabled:opacity-50 shrink-0"
          >
            {adding ? 'Gravando...' : 'Autorizar E-mail'}
          </button>
        </form>
      </div>

      {/* Admin List */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 mb-4">Administradores Cadastrados</h3>
        <div className="space-y-3">
          {/* Main Bootstrap Admin Badge */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-blue-50/70 border border-blue-100">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                ★
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 block font-mono">
                  {INITIAL_ADMIN_EMAIL}
                </span>
                <span className="text-[11px] text-blue-700 font-semibold">
                  Administrador Principal (Bootstrap)
                </span>
              </div>
            </div>
            <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2.5 py-0.5 rounded-full">
              Superadmin
            </span>
          </div>

          {/* Other registered admins */}
          {admins
            .filter((a) => a.email !== INITIAL_ADMIN_EMAIL)
            .map((admin) => (
              <div
                key={admin.uid}
                className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block font-mono">
                      {admin.email}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Adicionado em {new Date(admin.createdAt || 0).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[10px] bg-slate-200 text-slate-700 font-bold px-2 py-0.5 rounded-full">
                    Admin
                  </span>
                  <button
                    onClick={() => handleRemove(admin.uid, admin.email)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 cursor-pointer"
                    title="Revogar acesso"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};
