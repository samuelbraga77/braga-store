import React, { useState, useEffect } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, ShieldCheck, Truck, Clock } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const HeroBanner: React.FC = () => {
  const { banners, settings, navigate, products } = useStore();
  const activeBanners = banners.filter((b) => b.isActive).sort((a, b) => a.order - b.order);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (activeBanners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [activeBanners.length]);

  // If banners are registered and active:
  if (activeBanners.length > 0) {
    const currentBanner = activeBanners[currentIndex];
    return (
      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div className="relative min-h-[420px] md:min-h-[500px] flex items-center">
          {/* Background image if provided */}
          {currentBanner.imageUrl && (
            <div className="absolute inset-0 z-0">
              <picture>
                {currentBanner.mobileImageUrl && (
                  <source media="(max-width: 640px)" srcSet={currentBanner.mobileImageUrl} />
                )}
                <img
                  src={currentBanner.imageUrl}
                  alt={currentBanner.title}
                  className="w-full h-full object-cover opacity-40 mix-blend-luminosity"
                />
              </picture>
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent"></div>
            </div>
          )}

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
            <div className="max-w-2xl">
              <span className="text-xs uppercase tracking-widest text-blue-400 font-semibold mb-3 block">
                {settings.storeName}
              </span>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-4 leading-tight">
                {currentBanner.title}
              </h1>
              {currentBanner.subtitle && (
                <p className="text-base sm:text-lg text-slate-300 mb-8 leading-relaxed">
                  {currentBanner.subtitle}
                </p>
              )}
              {currentBanner.buttonUrl && (
                <div>
                  <button
                    onClick={() => {
                      if (currentBanner.buttonUrl.startsWith('http')) {
                        window.open(currentBanner.buttonUrl, '_blank', 'noopener,noreferrer');
                      } else {
                        navigate(currentBanner.buttonUrl);
                      }
                    }}
                    className="inline-flex items-center gap-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-sm transition-all shadow-lg hover:shadow-blue-500/25 cursor-pointer"
                  >
                    <span>{currentBanner.buttonText || 'Ver Coleção'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Carousel Arrows */}
          {activeBanners.length > 1 && (
            <div className="absolute bottom-6 right-6 z-20 flex items-center gap-2">
              <button
                onClick={() =>
                  setCurrentIndex((prev) => (prev === 0 ? activeBanners.length - 1 : prev - 1))
                }
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Banner anterior"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setCurrentIndex((prev) => (prev + 1) % activeBanners.length)}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Próximo banner"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </section>
    );
  }

  // Elegant neutral default showcase if no banners are registered yet
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 to-slate-950 text-white py-16 md:py-24 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7">
            <span className="text-xs uppercase tracking-widest text-blue-400 font-semibold mb-3 block">
              Catálogo Oficial
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-5 leading-tight text-balance">
              {settings.storeName}: Curadoria selecionada para suas melhores escolhas.
            </h1>
            <p className="text-slate-300 text-base sm:text-lg mb-8 leading-relaxed max-w-xl">
              {settings.tagline ||
                'Navegue por produtos selecionados com informações transparentes, especificações completas e links para as melhores ofertas oficiais.'}
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={() => navigate('/produtos')}
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-sm transition-all shadow-md hover:shadow-blue-500/20 cursor-pointer"
              >
                <span>Explorar Catálogo</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigate('/sobre')}
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-xl text-sm transition-all border border-slate-700 cursor-pointer"
              >
                <span>Conhecer a Loja</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-6 sm:p-8 backdrop-blur-sm shadow-xl">
              <h2 className="text-lg font-bold text-white mb-4">Diferenciais da {settings.storeName}</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0 text-blue-400">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">Lojas e Parceiros Oficiais</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Conexão segura com plataformas consolidadas no comércio eletrônico.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0 text-blue-400">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">Transparência em Informações</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Especificações técnicas reais, descrições detalhadas e fotos nítidas.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0 text-blue-400">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">Atualização Contínua</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Novos itens e categorias adicionados regularmente pelo nosso time.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
