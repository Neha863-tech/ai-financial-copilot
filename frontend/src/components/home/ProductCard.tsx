import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Scale,
  ArrowRight,
  Star,
  CheckCircle2,
  AlertTriangle,
  Cpu,
  Layers,
  HardDrive,
  ExternalLink,
  Store,
  Info
} from 'lucide-react';
import { Product } from '../../types/product';
import { VerificationBadge } from '../common/VerificationBadge';
import { useCart } from '../../context/CartContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const navigate = useNavigate();
  const { isInComparison, toggleComparison, selectProductForReview } = useCart();
  const inComparison = isInComparison(product.id);

  const handleReviewAndApprove = () => {
    selectProductForReview(product);
    navigate('/approval');
  };

  const handleInspectComparison = () => {
    toggleComparison(product);
  };

  return (
    <div className="group bg-navy-900/70 rounded-2xl border border-navy-800 hover:border-violet-500/50 shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col overflow-hidden relative backdrop-blur-md">
      {/* Demo watermark banner */}
      {product.isDemo && (
        <div className="absolute top-3 left-3 z-10">
          <span className="bg-navy-950/90 text-[10px] text-slate-300 px-2 py-0.5 rounded-md font-mono tracking-wider border border-navy-800 backdrop-blur-xs">
            DEMO LISTING
          </span>
        </div>
      )}

      {/* Comparison check button (top-right) */}
      <div className="absolute top-3 right-3 z-10">
        <button
          onClick={handleInspectComparison}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-md transition-all shadow-xs ${
            inComparison
              ? 'bg-violet-600 text-white border border-violet-500 shadow-glow'
              : 'bg-navy-950/80 hover:bg-navy-900 text-slate-300 border border-navy-800 hover:text-white'
          }`}
          title={inComparison ? 'Remove from comparison' : 'Add to side-by-side comparison'}
        >
          <Scale className="w-3.5 h-3.5" />
          <span>{inComparison ? 'In Matrix' : '+ Compare'}</span>
        </button>
      </div>

      {/* Product Image & Top Bar */}
      <div className="relative h-48 w-full bg-navy-950 overflow-hidden flex items-center justify-center p-4">
        <img
          src={product.imageUrl}
          alt={product.title}
          className="h-full w-full object-cover object-center rounded-xl group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-900 via-transparent to-transparent pointer-events-none" />
      </div>

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        {/* Verification Status & Category */}
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-semibold text-violet-400 uppercase tracking-wider font-mono">
              {product.brand} &bull; {product.category}
            </span>
            <VerificationBadge
              status={product.verificationStatus}
              score={product.verificationScore}
              size="sm"
            />
          </div>

          <h3 className="font-semibold text-slate-100 text-base leading-snug line-clamp-2 group-hover:text-violet-300 transition-colors">
            {product.title}
          </h3>
        </div>

        {/* AI Suitability Pill */}
        <div className="bg-navy-950/70 border border-navy-800 rounded-xl p-3 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-violet-400" />
              ML Suitability Score:
            </span>
            <span className="text-xs font-bold text-violet-400 font-mono">
              {product.suitabilityScore}/100
            </span>
          </div>
          <p className="text-[11.5px] text-slate-300 leading-relaxed line-clamp-2">
            {product.suitabilityReason}
          </p>
        </div>

        {/* Core Specs Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 pt-1">
          {product.specs.processor && (
            <div className="flex items-center gap-1.5 bg-navy-950/60 p-2 rounded-lg border border-navy-800/80 truncate">
              <Cpu className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <span className="truncate" title={product.specs.processor}>
                {product.specs.processor}
              </span>
            </div>
          )}
          {product.specs.ram && (
            <div className="flex items-center gap-1.5 bg-navy-950/60 p-2 rounded-lg border border-navy-800/80 truncate">
              <Layers className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <span className="truncate font-semibold text-slate-200" title={product.specs.ram}>
                {product.specs.ram}
              </span>
            </div>
          )}
          {product.specs.storage && (
            <div className="flex items-center gap-1.5 bg-navy-950/60 p-2 rounded-lg border border-navy-800/80 truncate">
              <HardDrive className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <span className="truncate" title={product.specs.storage}>
                {product.specs.storage}
              </span>
            </div>
          )}
          {product.specs.gpu && (
            <div className="flex items-center gap-1.5 bg-navy-950/60 p-2 rounded-lg border border-navy-800/80 truncate">
              <span className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 text-[10px] font-bold">GPU</span>
              <span className="truncate" title={product.specs.gpu}>
                {product.specs.gpu}
              </span>
            </div>
          )}
        </div>

        {/* Seller Scrutiny Snippet */}
        <div className="pt-2 border-t border-navy-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5 truncate max-w-[200px]">
            <Store className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span className="truncate font-medium text-slate-300">{product.seller.name}</span>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span className="font-semibold text-slate-200">{product.seller.rating}</span>
            <span className="text-[10px] text-slate-500">({product.seller.reviewCount})</span>
          </div>
        </div>

        {/* Pricing & Call to Action */}
        <div className="pt-3 border-t border-navy-800 flex items-center justify-between gap-3">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-extrabold text-slate-100 font-mono">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-xs text-slate-500 line-through font-mono">
                  ₹{product.originalPrice.toLocaleString('en-IN')}
                </span>
              )}
            </div>
            <div className="text-[10.5px] text-emerald-400 font-medium">
              {product.shippingSupported && product.estimatedShipping === 0
                ? 'Free delivery supported'
                : product.shippingNote || 'Shipping calculated at checkout'}
            </div>
          </div>

          <button
            onClick={handleReviewAndApprove}
            className="flex items-center gap-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-glow flex-shrink-0"
          >
            <span>Review & Approve</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};
