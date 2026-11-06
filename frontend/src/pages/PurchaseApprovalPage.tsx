import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  ArrowRight,
  Store,
  ExternalLink,
  Lock,
  RotateCcw,
  Info,
  Truck,
  Receipt
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { VerificationBadge } from '../components/common/VerificationBadge';
import { DEMO_PRODUCTS } from '../data/demoProducts';

export const PurchaseApprovalPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    selectedProduct,
    selectProductForReview,
    userApprovalConfirmed,
    setUserApprovalConfirmed,
    acknowledgedWarnings,
    toggleWarningAcknowledgment,
  } = useCart();

  // If no product selected, allow selecting one from demo
  if (!selectedProduct) {
    return (
      <div className="bg-navy-900/80 backdrop-blur-md rounded-3xl border border-navy-800 p-12 text-center space-y-6 max-w-xl mx-auto my-12 shadow-card text-slate-100">
        <div className="w-16 h-16 rounded-2xl bg-amber-950/80 border border-amber-800/80 text-amber-400 flex items-center justify-center mx-auto shadow-xs">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-slate-100">
            No Product Selected for Approval
          </h2>
          <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
            Please choose a product from the search catalog or comparison matrix to perform pre-checkout evidence scrutiny.
          </p>
        </div>
        <div className="flex flex-col gap-2 max-w-xs mx-auto">
          <button
            onClick={() => {
              selectProductForReview(DEMO_PRODUCTS[0]);
            }}
            className="px-4 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-xl shadow-glow transition-colors"
          >
            Review Lenovo IdeaPad Slim 3 (Recommended)
          </button>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 border border-navy-800 text-slate-300 hover:text-white text-xs font-medium rounded-xl hover:bg-navy-800 transition-colors"
          >
            Back to Search Catalog
          </button>
        </div>
      </div>
    );
  }

  // Calculate pricing
  const basePrice = selectedProduct.price;
  const shippingFee = selectedProduct.shippingSupported ? (selectedProduct.estimatedShipping || 0) : 0;
  const taxFee = selectedProduct.taxSupported ? (selectedProduct.estimatedTax || 0) : 0;
  const totalAmount = basePrice + (selectedProduct.shippingSupported ? shippingFee : 0);

  // Mandatory warnings to acknowledge
  const warningsToReview = [
    ...selectedProduct.unknowns,
    ...(selectedProduct.cons.slice(0, 2)),
    `Seller Return Policy: ${selectedProduct.seller.returnPolicyDays} days under ${selectedProduct.seller.name} policy`,
  ];

  const allWarningsAcknowledged = warningsToReview.every((w) =>
    acknowledgedWarnings.includes(w)
  );

  const canProceed = allWarningsAcknowledged && userApprovalConfirmed;

  const handleProceedToCheckout = () => {
    if (canProceed) {
      navigate('/checkout');
    }
  };

  return (
    <div className="space-y-8 pb-16 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-navy-900/80 backdrop-blur-md rounded-3xl border border-navy-800 p-6 sm:p-8 shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-950/80 border border-emerald-800/80 text-emerald-400">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">
              Pre-Checkout Evidence Scrutiny
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            TrustCart AI requires explicit buyer approval of verified facts and unverified claims before order initialization.
          </p>
        </div>

        <VerificationBadge
          status={selectedProduct.verificationStatus}
          score={selectedProduct.verificationScore}
          size="lg"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Product Details & Warnings (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Selected Product Card */}
          <div className="bg-navy-900/80 backdrop-blur-md rounded-3xl border border-navy-800 p-6 shadow-card space-y-5 text-slate-100">
            <div className="flex items-start gap-4">
              <img
                src={selectedProduct.imageUrl}
                alt={selectedProduct.title}
                className="w-24 h-24 sm:w-28 sm:h-28 object-cover rounded-2xl bg-navy-950 border border-navy-800 flex-shrink-0"
              />
              <div className="space-y-1.5 min-w-0">
                <span className="text-[11px] font-mono font-bold text-violet-400 uppercase">
                  {selectedProduct.brand} &bull; {selectedProduct.category}
                </span>
                <h3 className="font-bold text-slate-100 text-base leading-snug">
                  {selectedProduct.title}
                </h3>
                <div className="flex items-center gap-2 text-xs text-slate-400 pt-1">
                  <Store className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-medium text-slate-300">{selectedProduct.seller.name}</span>
                </div>
              </div>
            </div>

            {/* Seller Credentials Callout */}
            <div className="bg-navy-950/80 rounded-2xl p-4 border border-navy-800 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-200">Merchant Audit Certificate:</span>
                <span className="font-mono text-[10px] text-emerald-400 font-bold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/80">
                  {selectedProduct.seller.verifiedSeller ? 'OEM Certified Partner' : 'Unverified Reseller'}
                </span>
              </div>
              <p className="text-slate-300 text-[11.5px] leading-relaxed">
                {selectedProduct.seller.sellerEvidence}
              </p>
              <div className="pt-2 border-t border-navy-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span>Warranty: {selectedProduct.seller.warranty}</span>
                <span>Return Window: {selectedProduct.seller.returnPolicyDays} Days</span>
              </div>
            </div>

            {/* Verified Facts List */}
            <div className="space-y-2.5">
              <h4 className="font-bold text-slate-200 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Verified OEM Facts</span>
              </h4>
              <ul className="space-y-2 text-xs text-slate-300">
                {selectedProduct.verifiedFacts.map((fact, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-emerald-950/20 p-2.5 rounded-xl border border-emerald-800/60">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span className="text-emerald-200">{fact}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Warnings & Unknowns Checklist */}
          <div className="bg-navy-900/80 backdrop-blur-md rounded-3xl border border-amber-900/50 p-6 shadow-card space-y-4">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-amber-950/80 border border-amber-800/80 text-amber-400">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
              </span>
              <div>
                <h4 className="font-bold text-slate-100 text-sm">
                  Required Buyer Acknowledgments
                </h4>
                <p className="text-[11px] text-slate-400">
                  Check each item to confirm understanding of known limitations and unverified claims.
                </p>
              </div>
            </div>

            <div className="space-y-2.5">
              {warningsToReview.map((warning, idx) => {
                const isChecked = acknowledgedWarnings.includes(warning);
                return (
                  <label
                    key={idx}
                    className={`flex items-start gap-3 p-3 rounded-2xl border transition-all cursor-pointer ${
                      isChecked
                        ? 'bg-amber-950/30 border-amber-500/80 text-amber-200 shadow-glow'
                        : 'bg-navy-950/80 border-navy-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleWarningAcknowledgment(warning)}
                      className="mt-0.5 w-4 h-4 rounded text-violet-600 border-navy-700 bg-navy-950 focus:ring-violet-500"
                    />
                    <div className="text-xs leading-relaxed">
                      <span className="font-medium">{warning}</span>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Transparent Pricing & Explicit Approval (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Price Breakdown Card */}
          <div className="bg-navy-900/80 backdrop-blur-md rounded-3xl border border-navy-800 p-6 shadow-card space-y-5 text-slate-200">
            <h4 className="font-bold text-slate-100 text-sm flex items-center gap-2">
              <Receipt className="w-4 h-4 text-violet-400" />
              <span>Evidence-Backed Price Breakdown</span>
            </h4>

            <div className="space-y-3 text-xs divide-y divide-navy-800">
              <div className="flex justify-between items-center text-slate-300 pt-1">
                <span>Product Base Price</span>
                <span className="font-mono font-semibold text-slate-100 text-sm">
                  ₹{basePrice.toLocaleString('en-IN')}
                </span>
              </div>

              {/* Shipping Breakdown */}
              <div className="pt-2 space-y-1">
                <div className="flex justify-between items-center text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-slate-400" />
                    <span>Estimated Shipping</span>
                  </span>
                  <span className="font-mono font-semibold text-slate-100">
                    {selectedProduct.shippingSupported ? (
                      shippingFee === 0 ? (
                        <span className="text-emerald-400">FREE</span>
                      ) : (
                        `₹${shippingFee.toLocaleString('en-IN')}`
                      )
                    ) : (
                      <span className="text-amber-400 font-sans text-[11px]">Unconfirmed</span>
                    )}
                  </span>
                </div>
                <p className="text-[10.5px] text-slate-400">
                  {selectedProduct.shippingSupported
                    ? selectedProduct.shippingNote
                    : 'Carrier fee data not supplied by merchant. No hidden charges assumed.'}
                </p>
              </div>

              {/* Tax Breakdown */}
              <div className="pt-2 space-y-1">
                <div className="flex justify-between items-center text-slate-300">
                  <span>Applicable GST (18%)</span>
                  <span className="font-mono font-semibold text-slate-100">
                    {selectedProduct.taxSupported ? (
                      <span className="text-slate-300">Inclusive</span>
                    ) : (
                      <span className="text-amber-400 font-sans text-[11px]">Pending invoice</span>
                    )}
                  </span>
                </div>
                <p className="text-[10.5px] text-slate-400">
                  {selectedProduct.taxSupported
                    ? selectedProduct.taxNote
                    : 'Tax breakdown pending final merchant dispatch validation.'}
                </p>
              </div>

              {/* Total */}
              <div className="pt-3 flex justify-between items-baseline">
                <span className="font-bold text-slate-100 text-sm">Total Due</span>
                <div className="text-right">
                  <div className="text-2xl font-extrabold text-violet-400 font-mono">
                    ₹{totalAmount.toLocaleString('en-IN')}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">INR Currency</div>
                </div>
              </div>
            </div>
          </div>

          {/* Explicit User Approval Box */}
          <div className="bg-gradient-to-b from-navy-900 via-navy-900 to-navy-950 rounded-3xl border-2 border-violet-500/50 p-6 shadow-glow space-y-4">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-violet-400" />
              <h4 className="font-bold text-slate-100 text-sm">
                Explicit User Approval Gate
              </h4>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              In accordance with TrustCart AI evidence principles, automated agents do not initiate payment transactions without explicit, verified user authorization.
            </p>

            <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-navy-950/80 border border-violet-500/40 cursor-pointer shadow-subtle">
              <input
                type="checkbox"
                checked={userApprovalConfirmed}
                onChange={(e) => setUserApprovalConfirmed(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-violet-600 border-navy-700 bg-navy-950 focus:ring-violet-500"
              />
              <span className="text-xs text-slate-200 font-medium leading-relaxed">
                I have inspected the verified facts and acknowledged all seller warnings. I explicitly approve proceeding to secure checkout.
              </span>
            </label>

            {/* Validation Helper */}
            {!canProceed && (
              <div className="text-[11px] text-amber-300 bg-amber-950/60 p-2.5 rounded-xl border border-amber-800/80 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                <span>
                  {!allWarningsAcknowledged
                    ? 'Please acknowledge all warning items on the left.'
                    : 'Please check the explicit approval confirmation above.'}
                </span>
              </div>
            )}

            <button
              onClick={handleProceedToCheckout}
              disabled={!canProceed}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl text-xs font-bold transition-all shadow-md disabled:opacity-40 disabled:cursor-not-allowed bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-glow"
            >
              <span>Proceed to Secure Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
