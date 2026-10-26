import React from 'react';
import { 
  Sparkles, 
  Zap, 
  TrendingUp, 
  Clock, 
  ArrowRight, 
  MessageCircle,
  ShieldCheck,
  Truck,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { Product, Category, StoreSettings, ViewRoute } from '../../types';
import { HeroBanner } from './HeroBanner';
import { CategoryGrid } from './CategoryGrid';
import { ProductCard } from '../catalog/ProductCard';

interface HomeViewProps {
  products: Product[];
  categories: Category[];
  settings: StoreSettings;
  onNavigate: (route: ViewRoute) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  products,
  categories,
  settings,
  onNavigate
}) => {
  const activeProducts = products.filter(p => p.status === 'active');
  const featuredProducts = activeProducts.filter(p => p.isFeatured).slice(0, 4);
  const promoProducts = activeProducts.filter(p => p.promoPrice && p.promoPrice < p.price).slice(0, 4);
  const popularProducts = activeProducts.filter(p => p.isPopular).slice(0, 4);
  const newProducts = activeProducts.filter(p => p.isNew).slice(0, 4);

  return (
    <div className="space-y-12 pb-16">
      
      {/* 1. Hero Banner */}
      <HeroBanner settings={settings} onNavigate={onNavigate} />

      {/* 2. Trust Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-10 relative z-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white rounded-2xl p-4 sm:p-6 shadow-xl shadow-slate-900/5 border border-slate-200/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900">Compra Segura</h4>
              <p className="text-[11px] text-slate-500">Criptografia de ponta</p>
            </div>
          </div>

          <a
            href="https://app.kaiross.com.br/rastreio"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 group hover:opacity-90 transition-opacity"
            title="Rastreie sua encomenda no Kaiross"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">Envio para Todo Brasil</h4>
              <p className="text-[11px] text-slate-500">Rastreie pelo Kaiross</p>
            </div>
          </a>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900">Ofertas Verificadas</h4>
              <p className="text-[11px] text-slate-500">Curadoria com melhor preço</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900">Suporte no WhatsApp</h4>
              <p className="text-[11px] text-slate-500">Tire dúvidas em tempo real</p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Category Grid */}
      <CategoryGrid categories={categories} products={products} onNavigate={onNavigate} />

      {/* 4. Destaques da Semana */}
      {featuredProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 uppercase tracking-widest mb-1">
                <Sparkles className="w-4 h-4" />
                <span>Seleção Especial</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Destaques da Semana
              </h2>
            </div>
            <button
              onClick={() => onNavigate({ type: 'catalog' })}
              className="text-xs sm:text-sm font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
            >
              <span>Ver todos</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((p, idx) => (
              <ProductCard
                key={p.id}
                product={p}
                onNavigate={onNavigate}
                priority={idx < 2}
              />
            ))}
          </div>
        </section>
      )}

      {/* 5. Super Ofertas com Desconto */}
      {promoProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-10 border border-slate-800">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-extrabold uppercase tracking-wider mb-2">
                  <Zap className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
                  Preços Promocionais Por Tempo Limitado
                </div>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                  Super Ofertas com Desconto
                </h2>
              </div>
              <button
                onClick={() => onNavigate({ type: 'catalog', query: 'desconto' })}
                className="self-start md:self-auto px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors"
              >
                Ver Todas as Promoções
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {promoProducts.map(p => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onNavigate={onNavigate}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 6. Mais Populares */}
      {popularProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 uppercase tracking-widest mb-1">
                <TrendingUp className="w-4 h-4" />
                <span>Mais Desejados</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Produtos Populares
              </h2>
            </div>
            <button
              onClick={() => onNavigate({ type: 'catalog' })}
              className="text-xs sm:text-sm font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
            >
              <span>Ver catálogo completo</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularProducts.map(p => (
              <ProductCard
                key={p.id}
                product={p}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        </section>
      )}

      {/* 7. Novidades Recentes */}
      {newProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 uppercase tracking-widest mb-1">
                <Clock className="w-4 h-4" />
                <span>Recém-Chegados</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Novidades no Catálogo
              </h2>
            </div>
            <button
              onClick={() => onNavigate({ type: 'catalog' })}
              className="text-xs sm:text-sm font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
            >
              <span>Explorar</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {newProducts.map(p => (
              <ProductCard
                key={p.id}
                product={p}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        </section>
      )}

      {/* 8. WhatsApp Direct Inquiry Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-emerald-600 text-white p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-emerald-900/10">
          <div className="space-y-2 text-center md:text-left">
            <span className="text-xs font-black uppercase tracking-widest text-emerald-200">Atendimento Personalizado</span>
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight">
              Precisa de ajuda ou quer tirar dúvidas sobre um produto?
            </h3>
            <p className="text-xs sm:text-sm text-emerald-100 max-w-xl">
              Nossa equipe está disponível no WhatsApp para ajudar você a escolher o produto ideal com suporte rápido.
            </p>
          </div>

          <a
            href={`https://wa.me/${settings.whatsapp.replace(/\D/g, '')}?text=Olá,%20gostaria%20de%20tirar%20uma%20dúvida%20sobre%20os%20produtos%20da%20Braga%20Store`}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 px-8 py-4 rounded-2xl bg-white text-emerald-800 hover:bg-emerald-50 font-black text-xs sm:text-sm transition-all shadow-lg flex items-center gap-2"
          >
            <MessageCircle className="w-5 h-5 text-emerald-600" />
            <span>Falar com Atendente no WhatsApp</span>
          </a>
        </div>
      </section>

    </div>
  );
};
