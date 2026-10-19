import React from 'react';
import { ArrowRight, Sparkles, Tag, Layers, CheckCircle2, ShoppingBag } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { HeroBanner } from '../../components/public/HeroBanner';
import { ProductCard } from '../../components/public/ProductCard';

export const HomePage: React.FC = () => {
  const { settings, products, categories, navigate } = useStore();

  const publishedProducts = products.filter((p) => p.status === 'published');
  const featuredProducts = publishedProducts.filter((p) => p.isFeatured);
  const offerProducts = publishedProducts.filter((p) => p.isOffer);
  const publishedCategories = categories.filter((c) => c.isPublished).sort((a, b) => a.order - b.order);

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Hero Banner Component */}
      <HeroBanner />

      {/* Featured Products Section (Only when real products exist) */}
      {featuredProducts.length > 0 && (
        <section className="py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <span className="text-xs uppercase tracking-wider text-blue-600 font-semibold mb-1 block">
                Seleção Especial
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                Produtos em Destaque
              </h2>
            </div>
            <button
              onClick={() => navigate('/produtos')}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors cursor-pointer group"
            >
              <span>Ver todos os produtos</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featuredProducts.slice(0, 8).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Categories Showcase (Only when real categories exist) */}
      {publishedCategories.length > 0 && (
        <section className="py-12 bg-white border-y border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="text-xs uppercase tracking-wider text-blue-600 font-semibold mb-1 block">
                  Organização
                </span>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                  Explorar por Categoria
                </h2>
              </div>
              <button
                onClick={() => navigate('/categorias')}
                className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
              >
                Ver todas →
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {publishedCategories.map((cat) => {
                const count = publishedProducts.filter((p) => p.categoryId === cat.id).length;
                return (
                  <button
                    key={cat.id}
                    onClick={() => navigate(`/categoria/${cat.slug}`)}
                    className="p-4 rounded-xl border border-slate-200 hover:border-blue-500 hover:shadow-md transition-all text-center flex flex-col items-center justify-center bg-slate-50/50 hover:bg-white group cursor-pointer"
                  >
                    {cat.imageUrl ? (
                      <img
                        src={cat.imageUrl}
                        alt={cat.name}
                        className="w-12 h-12 rounded-lg object-cover mb-2"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm mb-2 group-hover:scale-110 transition-transform">
                        {cat.name.charAt(0)}
                      </div>
                    )}
                    <span className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                      {cat.name}
                    </span>
                    <span className="text-xs text-slate-400 mt-0.5">
                      {count} {count === 1 ? 'item' : 'itens'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Offers Section (Only when real offers exist) */}
      {offerProducts.length > 0 && (
        <section className="py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
                <Tag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                  Ofertas em Destaque
                </h2>
                <p className="text-xs text-slate-500">
                  Produtos com preços promocionais confirmados
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/ofertas')}
              className="text-sm font-semibold text-rose-600 hover:text-rose-700 transition-colors cursor-pointer"
            >
              Ver todas as ofertas →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {offerProducts.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* When NO products are registered yet: Elegant Ready State */}
      {publishedProducts.length === 0 && (
        <section className="py-16 max-w-4xl mx-auto px-4 text-center">
          <div className="bg-white border border-slate-200 rounded-2xl p-8 sm:p-12 shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-5">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
              Bem-vindo à {settings.storeName}
            </h2>
            <p className="text-slate-600 text-sm sm:text-base max-w-xl mx-auto mb-8 leading-relaxed">
              Nossa loja virtual está pronta e estruturada. Os primeiros produtos e categorias oficiais estão sendo cadastrados pelo administrador no painel de controle.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={() => navigate('/sobre')}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-semibold transition-colors cursor-pointer"
              >
                Conhecer a Loja
              </button>
              <button
                onClick={() => navigate('/contato')}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-sm font-semibold transition-colors cursor-pointer"
              >
                Fale Conosco
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Institutional Presentation Section */}
      <section className="py-16 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center mb-4">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">
                Curadoria Rigorosa
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Cada item catalogado é avaliado quanto à sua procedência, qualidade e confiabilidade da loja de origem.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center mb-4">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">
                Navegação Estruturada
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Categorias organizadas, filtros por faixa de preço e pesquisa rápida para encontrar o que procura sem esforço.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center mb-4">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">
                Ambiente Seguro
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Redirecionamento seguro para as páginas e checkouts oficiais dos parceiros autorizados.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
