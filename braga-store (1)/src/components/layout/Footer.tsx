import React from 'react';
import { 
  ShieldCheck, 
  Truck, 
  Clock, 
  MessageCircle, 
  Mail, 
  MapPin, 
  Lock, 
  ExternalLink,
  PackageSearch
} from 'lucide-react';
import { StoreSettings, ViewRoute } from '../../types';

interface FooterProps {
  settings: StoreSettings;
  onNavigate: (route: ViewRoute) => void;
}

export const Footer: React.FC<FooterProps> = ({ settings, onNavigate }) => {
  const KAIROSS_TRACKING_URL = 'https://app.kaiross.com.br/rastreio';

  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Trust Badges Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pb-12 mb-10 border-b border-slate-800 text-slate-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 text-indigo-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Compra Segura</h4>
              <p className="text-xs text-slate-400">Ambiente criptografado</p>
            </div>
          </div>

          <a 
            href={KAIROSS_TRACKING_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 group p-2 -m-2 rounded-xl hover:bg-slate-800/60 transition-colors"
            title="Clique para rastrear seu pedido no Kaiross"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-800 group-hover:bg-indigo-600 text-indigo-400 group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
              <PackageSearch className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white group-hover:text-indigo-400 flex items-center gap-1 transition-colors">
                <span>Envio Rastreado</span>
                <ExternalLink className="w-3 h-3 opacity-60 group-hover:opacity-100" />
              </h4>
              <p className="text-xs text-slate-400">Rastreie pelo Kaiross</p>
            </div>
          </a>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 text-indigo-400 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">7 Dias de Garantia</h4>
              <p className="text-xs text-slate-400">Satisfação ou reembolso</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 text-emerald-400 flex items-center justify-center shrink-0">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Suporte Humano</h4>
              <p className="text-xs text-slate-400">Atendimento rápido</p>
            </div>
          </div>
        </div>

        {/* Prominent Order Tracking Banner */}
        <div className="mb-12 p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-slate-800/90 via-indigo-950/60 to-slate-800/90 border border-slate-700/80 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg shadow-black/20">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shrink-0">
              <PackageSearch className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h4 className="text-sm sm:text-base font-bold text-white">
                  Quer rastrear seu pedido?
                </h4>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Kaiross Rastreio
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Acompanhe o status e a localização da sua encomenda em tempo real pelo sistema oficial.
              </p>
            </div>
          </div>

          <a
            href={KAIROSS_TRACKING_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all shadow-md shadow-indigo-600/30 flex items-center gap-2 cursor-pointer"
          >
            <PackageSearch className="w-4 h-4" />
            <span>Rastrear Meu Pedido</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* 4-Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          
          {/* Column 1: Store Intro */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-black text-lg">
                B
              </div>
              <span className="text-xl font-black tracking-tight text-white font-sans">
                Braga<span className="text-indigo-400">Store</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              {settings.slogan || 'Sua loja virtual de confiança com as melhores ofertas e produtos inovadores para o seu dia a dia.'}
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <MapPin className="w-4 h-4 text-slate-500 shrink-0" />
              <span>{settings.address || 'São Paulo - SP | Envio Nacional'}</span>
            </div>
          </div>

          {/* Column 2: Institutional Pages */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Institucional</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button
                  onClick={() => onNavigate({ type: 'institutional', page: 'sobre' })}
                  className="hover:text-indigo-400 transition-colors text-left"
                >
                  Sobre a Braga Store
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate({ type: 'institutional', page: 'contato' })}
                  className="hover:text-indigo-400 transition-colors text-left"
                >
                  Fale Conosco / Atendimento
                </button>
              </li>
              <li>
                <a
                  href={KAIROSS_TRACKING_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-indigo-300 text-indigo-400 font-semibold transition-colors flex items-center gap-1.5"
                >
                  <PackageSearch className="w-3.5 h-3.5" />
                  <span>Rastrear Pedido (Kaiross)</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <button
                  onClick={() => onNavigate({ type: 'catalog' })}
                  className="hover:text-indigo-400 transition-colors text-left"
                >
                  Catálogo Completo
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Policies & Security */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Políticas & Segurança</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button
                  onClick={() => onNavigate({ type: 'institutional', page: 'privacidade' })}
                  className="hover:text-indigo-400 transition-colors text-left"
                >
                  Política de Privacidade (LGPD)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate({ type: 'institutional', page: 'termos' })}
                  className="hover:text-indigo-400 transition-colors text-left"
                >
                  Termos e Condições de Uso
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate({ type: 'institutional', page: 'entrega' })}
                  className="hover:text-indigo-400 transition-colors text-left"
                >
                  Prazos e Política de Entrega
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate({ type: 'institutional', page: 'trocas' })}
                  className="hover:text-indigo-400 transition-colors text-left"
                >
                  Trocas e Devoluções
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact & Order Tracking info */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Atendimento & Rastreio</h4>
            <div className="space-y-3 text-xs text-slate-400">
              {/* Direct Kaiross Link */}
              <a
                href={KAIROSS_TRACKING_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-indigo-400 hover:text-indigo-300 font-semibold transition-colors border border-slate-700/60"
              >
                <PackageSearch className="w-4 h-4 text-indigo-400 shrink-0" />
                <span className="flex-1">Rastreie seu Pedido Aqui</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
              </a>

              {settings.whatsapp && (
                <a
                  href={`https://wa.me/${settings.whatsapp.replace(/\D/g, '')}?text=Olá,%20gostaria%20de%20informações%20sobre%20os%20produtos%20da%20Braga%20Store`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  <MessageCircle className="w-4 h-4 shrink-0" />
                  <span>WhatsApp: {settings.phone || settings.whatsapp}</span>
                </a>
              )}
              {settings.email && (
                <a
                  href={`mailto:${settings.email}`}
                  className="flex items-center gap-2 hover:text-indigo-400 transition-colors"
                >
                  <Mail className="w-4 h-4 text-slate-500 shrink-0" />
                  <span>{settings.email}</span>
                </a>
              )}
              <div className="pt-2 text-[11px] text-slate-500">
                Horário: Seg. a Sex. das 08h às 18h
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar: CNPJ, Copyright & Admin Access */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            <p>© {new Date().getFullYear()} Braga Store. Todos os direitos reservados.</p>
            {settings.cnpj && settings.cnpj !== 'Configurar no Painel Administrativo' ? (
              <p className="text-[11px] text-slate-600 mt-0.5">CNPJ: {settings.cnpj}</p>
            ) : (
              <p className="text-[11px] text-amber-500/80 mt-0.5">
                (CNPJ institucional configurável através do Painel Administrativo)
              </p>
            )}
          </div>

          <div className="flex items-center gap-4">
            <a
              href={KAIROSS_TRACKING_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-indigo-400 flex items-center gap-1 transition-colors text-slate-400"
            >
              <PackageSearch className="w-3 h-3 text-indigo-400" />
              <span>Rastrear Pedido</span>
            </a>
            <span className="text-slate-700">|</span>
            <button
              onClick={() => onNavigate({ type: 'admin' })}
              className="hover:text-slate-300 flex items-center gap-1 transition-colors text-slate-500"
            >
              <Lock className="w-3 h-3 text-slate-400" />
              <span>Área Restrita (Admin)</span>
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
