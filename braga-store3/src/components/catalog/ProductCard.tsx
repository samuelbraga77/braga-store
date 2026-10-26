import React from 'react';
import { ExternalLink, Eye, CheckCircle2, AlertTriangle, XCircle, Zap } from 'lucide-react';
import { Product, ViewRoute } from '../../types';
import { formatCurrencyBRL, calculateDiscount, calculateInstallments } from '../../utils/formatters';
import { OptimizedImage } from '../common/OptimizedImage';

interface ProductCardProps {
  product: Product;
  onNavigate: (route: ViewRoute) => void;
  priority?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onNavigate, priority = false }) => {
  const discount = calculateDiscount(product.price, product.promoPrice);
  const activePrice = product.promoPrice || product.price;
  const installments = calculateInstallments(activePrice);

  const handleExternalBuy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.buyUrl) {
      window.open(product.buyUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const getStockBadge = () => {
    switch (product.stockStatus) {
      case 'in_stock':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Em Estoque
          </span>
        );
      case 'low_stock':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            Últimas Unidades
          </span>
        );
      case 'out_of_stock':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md">
            <XCircle className="w-3 h-3 text-rose-600" />
            Esgotado
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <article 
      onClick={() => onNavigate({ type: 'product', slug: product.slug })}
      className="group bg-white rounded-2xl border border-slate-200/90 hover:border-indigo-400/80 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer"
    >
      <div>
        {/* Image Container with Badges */}
        <div className="relative overflow-hidden bg-slate-100">
          <OptimizedImage
            src={product.mainImage}
            alt={product.title}
            aspectRatio="square"
            priority={priority}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />

          {/* Top Badges */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start z-10">
            {discount > 0 && (
              <span className="px-2 py-1 rounded-lg bg-rose-600 text-white text-[11px] font-extrabold tracking-wide uppercase shadow-sm flex items-center gap-0.5">
                <Zap className="w-3 h-3 fill-white" />
                {discount}% OFF
              </span>
            )}
            {product.isNew && (
              <span className="px-2 py-0.5 rounded-md bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-wider shadow-xs">
                Novo
              </span>
            )}
            {product.isPopular && !product.isNew && (
              <span className="px-2 py-0.5 rounded-md bg-amber-500 text-white text-[10px] font-bold uppercase tracking-wider shadow-xs">
                Mais Vendido
              </span>
            )}
          </div>

          {/* Quick View Button overlay on desktop */}
          <div className="absolute inset-0 bg-slate-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-4">
            <span className="px-3.5 py-2 rounded-xl bg-white/95 text-slate-900 text-xs font-bold shadow-md flex items-center gap-1.5 backdrop-blur-xs">
              <Eye className="w-3.5 h-3.5 text-indigo-600" />
              Ver Detalhes
            </span>
          </div>
        </div>

        {/* Product Details */}
        <div className="p-4 sm:p-5">
          {/* Category & Stock */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wider truncate">
              {product.category}
            </span>
            {getStockBadge()}
          </div>

          {/* Title */}
          <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-snug line-clamp-2 group-hover:text-indigo-600 transition-colors mb-3">
            {product.title}
          </h3>

          {/* Pricing */}
          <div className="space-y-1 mb-4">
            {product.promoPrice && product.promoPrice < product.price ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 line-through">
                  {formatCurrencyBRL(product.price)}
                </span>
                <span className="text-xs font-bold text-rose-600">
                  Economize {formatCurrencyBRL(product.price - product.promoPrice)}
                </span>
              </div>
            ) : null}

            <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {formatCurrencyBRL(activePrice)}
            </div>

            <p className="text-[11px] text-slate-500">
              ou {installments.count}x de <span className="font-semibold">{formatCurrencyBRL(installments.value)}</span> sem juros
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-4 sm:p-5 pt-0 grid grid-cols-1 sm:grid-cols-2 gap-2">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onNavigate({ type: 'product', slug: product.slug });
          }}
          className="w-full py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Detalhes</span>
        </button>

        <button
          type="button"
          onClick={handleExternalBuy}
          disabled={product.stockStatus === 'out_of_stock'}
          className={`w-full py-2.5 px-3 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer ${
            product.stockStatus === 'out_of_stock'
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white hover:shadow-indigo-600/30'
          }`}
        >
          <span>Comprar</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>
    </article>
  );
};
