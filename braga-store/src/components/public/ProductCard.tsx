import React from 'react';
import { ExternalLink, Tag } from 'lucide-react';
import { Product } from '../../types';
import { useStore } from '../../context/StoreContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { navigate, categories } = useStore();
  const category = categories.find((c) => c.id === product.categoryId);

  const formatBRL = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(val);
  };

  const handleCardClick = () => {
    navigate(`/produto/${product.slug || product.id}`);
  };

  const handleBuyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.externalUrl) {
      window.open(product.externalUrl, '_blank', 'noopener,noreferrer');
    } else {
      handleCardClick();
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className="group flex flex-col bg-white border border-slate-200 rounded-xl overflow-hidden hover:border-slate-300 hover:shadow-lg transition-all duration-200 cursor-pointer"
    >
      {/* Product Image Area */}
      <div className="relative aspect-square w-full bg-slate-50 overflow-hidden flex items-center justify-center p-4">
        {product.mainImage ? (
          <img
            src={product.mainImage}
            alt={product.imageAlt || product.name}
            referrerPolicy="no-referrer"
            loading="lazy"
            className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
            <span className="text-4xl font-light mb-1">🏷️</span>
            <span className="text-xs text-slate-600 font-medium">Sem imagem</span>
          </div>
        )}

        {/* Clean subtle promotion tag (not a colored badge cluster) */}
        {product.isOffer && (
          <div className="absolute top-3 left-3 bg-rose-600 text-white text-[11px] font-bold px-2 py-0.5 rounded tracking-wide uppercase shadow-sm">
            Oferta
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="p-4 flex flex-col flex-1 justify-between">
        <div>
          {/* Category / Brand inline unboxed metadata */}
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1.5 uppercase tracking-wider font-medium">
            <span>{product.brand || category?.name || 'Catálogo'}</span>
          </div>

          {/* Product Name */}
          <h3 className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug mb-2">
            {product.name}
          </h3>
        </div>

        {/* Pricing & CTA */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 mt-auto">
          <div>
            {product.previousPrice && product.previousPrice > product.currentPrice && (
              <span className="text-xs text-slate-500 line-through block font-mono tabular-nums">
                {formatBRL(product.previousPrice)}
              </span>
            )}
            <span className="text-base font-bold text-slate-900 font-mono tabular-nums block">
              {formatBRL(product.currentPrice)}
            </span>
          </div>

          <button
            onClick={handleBuyClick}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-blue-600 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer shrink-0 shadow-sm"
          >
            <span>{product.buttonText || 'Ver oferta'}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
