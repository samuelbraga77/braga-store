import React, { useState } from 'react';
import { 
  Building2, 
  Mail, 
  MessageCircle, 
  FileText, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  ChevronRight,
  Send,
  CheckCircle2
} from 'lucide-react';
import { InstitutionalContent, StoreSettings, ViewRoute } from '../../types';

interface InstitutionalViewProps {
  page: 'sobre' | 'contato' | 'privacidade' | 'termos' | 'entrega' | 'trocas';
  content: InstitutionalContent;
  settings: StoreSettings;
  onNavigate: (route: ViewRoute) => void;
}

export const InstitutionalView: React.FC<InstitutionalViewProps> = ({
  page,
  content,
  settings,
  onNavigate
}) => {
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [sentSuccess, setSentSuccess] = useState(false);

  const pagesConfig = {
    sobre: {
      title: 'Sobre a Braga Store',
      subtitle: 'Conheça nossa história, compromisso com a qualidade e valores',
      icon: <Building2 className="w-6 h-6 text-indigo-600" />,
      text: content.about
    },
    contato: {
      title: 'Fale Conosco',
      subtitle: 'Canais oficiais de atendimento, dúvidas sobre pedidos e suporte',
      icon: <Mail className="w-6 h-6 text-indigo-600" />,
      text: content.contact
    },
    privacidade: {
      title: 'Política de Privacidade',
      subtitle: 'Segurança das suas informações e total conformidade com a LGPD',
      icon: <ShieldCheck className="w-6 h-6 text-indigo-600" />,
      text: content.privacyPolicy
    },
    termos: {
      title: 'Termos e Condições de Uso',
      subtitle: 'Regras e diretrizes de navegação e compras na Braga Store',
      icon: <FileText className="w-6 h-6 text-indigo-600" />,
      text: content.termsOfUse
    },
    entrega: {
      title: 'Política e Prazos de Entrega',
      subtitle: 'Como funcionam os envios, transportadoras parceiras e rastreamento',
      icon: <Truck className="w-6 h-6 text-indigo-600" />,
      text: content.shippingPolicy
    },
    trocas: {
      title: 'Trocas e Devoluções',
      subtitle: 'Garantia de 7 dias e suporte rápido para qualquer ocorrência',
      icon: <RotateCcw className="w-6 h-6 text-indigo-600" />,
      text: content.returnPolicy
    }
  };

  const current = pagesConfig[page];

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactEmail || !contactMessage) return;
    
    // In production, opens prefilled mailto or WhatsApp
    const rawNumber = settings.whatsapp ? settings.whatsapp.replace(/\D/g, '') : '5511987654321';
    const encoded = encodeURIComponent(`Olá, sou ${contactName} (${contactEmail}). Mensagem: ${contactMessage}`);
    window.open(`https://wa.me/${rawNumber}?text=${encoded}`, '_blank');
    
    setSentSuccess(true);
    setContactName('');
    setContactEmail('');
    setContactMessage('');
  };

  return (
    <div className="bg-slate-50 min-h-screen py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-slate-500 mb-6">
          <button 
            onClick={() => onNavigate({ type: 'home' })}
            className="hover:text-indigo-600 transition-colors"
          >
            Início
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-800 font-semibold">{current.title}</span>
        </nav>

        {/* Page Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-xs mb-8">
          
          {/* Header */}
          <div className="flex items-center gap-4 pb-6 mb-8 border-b border-slate-100">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
              {current.icon}
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {current.title}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                {current.subtitle}
              </p>
            </div>
          </div>

          {/* Text Content */}
          <div className="prose prose-slate max-w-none text-sm text-slate-700 leading-relaxed whitespace-pre-line space-y-4">
            {current.text}
          </div>

          {/* Special Section for Contact Page */}
          {page === 'contato' && (
            <div className="mt-10 pt-10 border-t border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 mb-4">
                Envie uma mensagem direta
              </h3>

              {sentSuccess ? (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <h4 className="font-bold text-sm">Mensagem enviada com sucesso!</h4>
                    <p className="text-xs">Nossa equipe retornará no menor tempo possível.</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Seu Nome</label>
                      <input
                        type="text"
                        required
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        placeholder="Ex: João da Silva"
                        className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:border-indigo-600 outline-hidden bg-slate-50 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Seu E-mail</label>
                      <input
                        type="email"
                        required
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        placeholder="joao@exemplo.com"
                        className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:border-indigo-600 outline-hidden bg-slate-50 focus:bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Como podemos te ajudar?</label>
                    <textarea
                      rows={4}
                      required
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      placeholder="Descreva sua dúvida, pergunta sobre produto ou pedido..."
                      className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:border-indigo-600 outline-hidden bg-slate-50 focus:bg-white"
                    />
                  </div>

                  <button
                    type="submit"
                    className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs cursor-pointer transition-colors"
                  >
                    <Send className="w-4 h-4" />
                    <span>Enviar Mensagem</span>
                  </button>
                </form>
              )}
            </div>
          )}

        </div>

        {/* Quick Nav to other institutional pages */}
        <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-slate-500">
          {(['sobre', 'contato', 'privacidade', 'termos', 'entrega', 'trocas'] as const).map(p => (
            <button
              key={p}
              onClick={() => onNavigate({ type: 'institutional', page: p })}
              className={`px-3 py-1.5 rounded-lg border transition-colors ${
                page === p 
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-bold'
                  : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-600'
              }`}
            >
              {pagesConfig[p].title}
            </button>
          ))}
        </div>

      </div>
    </div>
  );
};
