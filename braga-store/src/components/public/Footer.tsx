import React from 'react';
import {
  Mail,
  Phone,
  MessageCircle,
  Instagram,
  Facebook,
  ShieldCheck,
  ExternalLink,
  Lock,
  Truck,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const Footer: React.FC = () => {
  const { settings, categories, navigate } = useStore();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-950 text-slate-400 text-sm border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Column 1: Brand & Presentation */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              {settings.logoUrl ? (
                <img
                  src={settings.logoUrl}
                  alt={settings.storeName}
                  className="h-8 w-auto object-contain"
                />
              ) : (
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-lg">
                  {settings.storeName.charAt(0) || 'B'}
                </div>
              )}
              <span className="text-xl font-bold tracking-tight text-white">
                {settings.storeName}
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              {settings.footer?.aboutText ||
                'Curadoria especializada de produtos para proporcionar uma experiência de compra segura e direcionada às lojas oficiais.'}
            </p>

            {/* Social Links */}
            {settings.footer?.showSocialLinks && (
              <div className="flex items-center gap-3">
                {settings.contact?.instagram && (
                  <a
                    href={
                      settings.contact.instagram.startsWith('http')
                        ? settings.contact.instagram
                        : `https://instagram.com/${settings.contact.instagram.replace('@', '')}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-blue-600 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
                    aria-label="Instagram"
                  >
                    <Instagram className="w-4 h-4" />
                  </a>
                )}
                {settings.contact?.facebook && (
                  <a
                    href={
                      settings.contact.facebook.startsWith('http')
                        ? settings.contact.facebook
                        : `https://facebook.com/${settings.contact.facebook}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-blue-600 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
                    aria-label="Facebook"
                  >
                    <Facebook className="w-4 h-4" />
                  </a>
                )}
                {settings.contact?.whatsapp && (
                  <a
                    href={`https://wa.me/${settings.contact.whatsapp.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-emerald-600 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
                    aria-label="WhatsApp"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Column 2: Navigation */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Navegação
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button
                  onClick={() => navigate('/')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Página Inicial
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/produtos')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Catálogo Completo
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/categorias')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Todas as Categorias
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/ofertas')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Ofertas Selecionadas
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/sobre')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Sobre a Loja
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/contato')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Fale Conosco
                </button>
              </li>
              <li>
                <a
                  href={settings.trackingUrl || 'https://app.kaiross.com.br/rastreio'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors cursor-pointer inline-flex items-center gap-1.5 text-blue-400 hover:text-blue-300 font-medium"
                >
                  <Truck className="w-3.5 h-3.5" />
                  <span>Rastrear Pedido</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Customer Service & Contact */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Atendimento
            </h4>
            <ul className="space-y-3 text-xs">
              {settings.contact?.email && (
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-slate-500 shrink-0" />
                  <a
                    href={`mailto:${settings.contact.email}`}
                    className="hover:text-white transition-colors truncate"
                  >
                    {settings.contact.email}
                  </a>
                </li>
              )}
              {settings.contact?.phone && (
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-slate-500 shrink-0" />
                  <a
                    href={`tel:${settings.contact.phone.replace(/\D/g, '')}`}
                    className="hover:text-white transition-colors"
                  >
                    {settings.contact.phone}
                  </a>
                </li>
              )}
              {settings.contact?.whatsapp && (
                <li className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                  <a
                    href={`https://wa.me/${settings.contact.whatsapp.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors"
                  >
                    WhatsApp Atendimento
                  </a>
                </li>
              )}
              {settings.contact?.businessHours && (
                <li className="text-[11px] text-slate-500 pt-1">
                  Horário: {settings.contact.businessHours}
                </li>
              )}
              <li className="pt-2">
                <a
                  href={settings.trackingUrl || 'https://app.kaiross.com.br/rastreio'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-blue-600 text-white font-semibold text-xs transition-all border border-slate-800 hover:border-blue-500 shadow-sm group w-full justify-between"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-400 group-hover:bg-white/20 group-hover:text-white flex items-center justify-center transition-colors">
                      <Truck className="w-3.5 h-3.5" />
                    </div>
                    <span>Rastrear Pedido</span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-colors" />
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Legal & Policies */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Informações Legais
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button
                  onClick={() => navigate('/pagina/termos')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Termos de Uso
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/pagina/privacidade')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Política de Privacidade (LGPD)
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/pagina/cookies')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Política de Cookies
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/pagina/links-externos')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Links Externos e Compras
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/pagina/trocas-devolucoes')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Trocas e Devoluções
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/prazo-entrega')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Prazo de Entrega
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/pagina/faq')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Dúvidas Frequentes (FAQ)
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Legal Disclaimer Box */}
        <div className="mt-12 pt-8 border-t border-slate-900 text-[11px] text-slate-500 leading-relaxed">
          <p className="mb-2">
            {settings.footer?.legalNotice ||
              'Aviso de Transparência: A Braga Store atua na curadoria e divulgação de produtos. As compras, faturamento e logística são de responsabilidade dos fornecedores externos indicados nos links.'}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-900/60">
            <div className="flex flex-col sm:flex-row items-center gap-1.5 sm:gap-3 text-center sm:text-left">
              <p>© {currentYear} {settings.storeName}. Todos os direitos reservados.</p>
              <span className="hidden sm:inline text-slate-700">·</span>
              <p className="text-slate-400 font-mono tracking-tight">CNPJ: {settings.cnpj || '66.417.299/0001-92'}</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/admin')}
                className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer text-xs"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Área Restrita (Admin)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
