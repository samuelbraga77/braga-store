import React, { useEffect } from 'react';
import { Truck, Clock, ShieldCheck, AlertCircle, ArrowLeft, CheckCircle2, HelpCircle } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const DeliveryTermsPage: React.FC = () => {
  const { settings, navigate } = useStore();

  useEffect(() => {
    document.title = `Prazo de Entrega — ${settings.storeName}`;
  }, [settings.storeName]);

  return (
    <div className="min-h-screen bg-slate-50/50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back navigation */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer mb-4"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar à loja</span>
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
                Prazo de Entrega
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Transparência e compromisso em cada etapa da sua compra na {settings.storeName}
              </p>
            </div>
          </div>
        </div>

        {/* Highlight Card: Prazo Médio 10 a 15 Dias */}
        <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 shadow-sm mb-8 space-y-8">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50/60 border border-blue-100 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                Estimativa Padrão
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                Prazo Médio: 10 a 15 dias
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-xl">
                O prazo médio estimado de entrega para a maioria das regiões do Brasil é de <strong>10 a 15 dias</strong> após a confirmação do pagamento e despacho do pedido pelo parceiro oficial.
              </p>
            </div>

            <div className="shrink-0 flex items-center gap-2 bg-white px-4 py-2.5 rounded-xl border border-blue-200 shadow-xs text-xs font-semibold text-blue-900 font-mono">
              <Clock className="w-4 h-4 text-blue-600" />
              <span>10 – 15 dias corridos</span>
            </div>
          </div>

          {/* Explanation Section */}
          <div className="space-y-4 text-sm text-slate-700 leading-relaxed">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Como Funciona o Cálculo do Prazo</span>
            </h3>
            <p>
              Esse é um prazo médio estimado planejado para garantir que seus produtos cheguem em perfeito estado e com a devida conferência de qualidade.
            </p>
            <p>
              Por se tratar de um prazo estimado, vale destacar que podem ocorrer imprevistos logísticos, períodos de alta demanda (como datas comemorativas), condições climáticas adversas, fiscalizações aduaneiras pontuais ou eventuais atrasos no transporte que fujam da rotina padrão.
            </p>
          </div>

          {/* Steps of delivery */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs mb-3">
                1
              </div>
              <h4 className="text-xs font-bold text-slate-900 mb-1">Processamento</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Confirmação do pagamento e preparação do pedido junto ao fornecedor oficial.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs mb-3">
                2
              </div>
              <h4 className="text-xs font-bold text-slate-900 mb-1">Transporte</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Envio com código de rastreamento para você acompanhar a movimentação do pacote.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs mb-3">
                3
              </div>
              <h4 className="text-xs font-bold text-slate-900 mb-1">Entrega Final</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Chegada com segurança no endereço indicado durante a conclusão da compra.
              </p>
            </div>
          </div>
        </div>

        {/* Section: Orientações em caso de problemas */}
        <div className="bg-slate-950 text-white rounded-3xl p-8 sm:p-10 shadow-lg border border-slate-800">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white mb-2">
                Teve algum problema com sua entrega?
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Se o seu pedido atrasar ou acontecer algum imprevisto, estamos aqui para ajudar. Acesse o menu da nossa loja, vá até a opção ‘Contato’, localizada no final do menu, e fale conosco para que possamos verificar a situação e ajudar a encontrar uma solução.
              </p>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Nossa equipe analisa cada ocorrência com atenção e presteza.</span>
            <button
              onClick={() => navigate('/contato')}
              className="text-blue-400 hover:text-blue-300 font-semibold cursor-pointer underline"
            >
              Ir para Contato →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
