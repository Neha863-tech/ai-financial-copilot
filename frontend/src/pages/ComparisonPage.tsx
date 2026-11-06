import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Scale,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ExternalLink,
  ArrowRight,
  Plus,
  Trash2,
  HelpCircle,
  Cpu,
  Layers,
  HardDrive,
  Monitor,
  Battery,
  ShieldAlert
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { VerificationBadge } from '../components/common/VerificationBadge';
import { DEMO_PRODUCTS } from '../data/demoProducts';
import { Product, EvidenceSource } from '../types/product';
import { compareProducts } from '../services/api';

export const ComparisonPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    comparisonList,
    removeFromComparison,
    clearComparison,
    toggleComparison,
    selectProductForReview,
  } = useCart();

  const [backendMatrixVerified, setBackendMatrixVerified] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (comparisonList.length > 0) {
      compareProducts(comparisonList.map((p) => p.id)).then((res) => {
        setBackendMatrixVerified(res.isFromBackend);
      });
    }
  }, [comparisonList]);

  const handleSelectForReview = (product: Product) => {
    selectProductForReview(product);
    navigate('/approval');
  };

  const handleAddDemoCandidate = (product: Product) => {
    toggleComparison(product);
  };

  if (comparisonList.length === 0) {
    return (
      <div className="bg-navy-900/80 backdrop-blur-md rounded-3xl border border-navy-800 p-12 text-center space-y-6 max-w-2xl mx-auto my-8 shadow-card text-slate-100">
        <div className="w-16 h-16 rounded-2xl bg-violet-950/80 border border-violet-800/80 text-violet-400 flex items-center justify-center mx-auto shadow-glow">
          <Scale className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-slate-100">
            No Products in Comparison Matrix
          </h2>
          <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
            Select at least two products from the search catalog to scrutinize specifications, evidence citations, verified facts, and missing data points side-by-side.
          </p>
        </div>

        <div className="pt-2">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Quick Add Comparison Candidates:
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {DEMO_PRODUCTS.slice(0, 3).map((p: Product) => (
              <button
                key={p.id}
                onClick={() => handleAddDemoCandidate(p)}
                className="flex items-center gap-2 bg-navy-950 hover:bg-navy-850 border border-navy-800 hover:border-violet-500/50 px-3 py-2 rounded-xl text-xs text-slate-200 font-medium transition-colors"
              >
                <Plus className="w-3.5 h-3.5 text-violet-400" />
                <span className="truncate max-w-[180px]">{p.title}</span>
                <span className="font-mono text-slate-400">₹{p.price.toLocaleString('en-IN')}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-xl shadow-glow transition-colors"
          >
            <span>Browse Catalog</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-navy-900/80 backdrop-blur-md rounded-2xl border border-navy-800 p-6 shadow-subtle text-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-violet-950/80 border border-violet-800/80 text-violet-400">
              <Scale className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-slate-100 tracking-tight">
              Multi-Product Verification Matrix
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Side-by-side evidence cross-examination: Verified OEM facts are explicitly separated from unknown or missing information.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={clearComparison}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-rose-400 hover:bg-rose-950/40 border border-navy-800 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Matrix</span>
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-violet-950/80 hover:bg-violet-900 text-violet-300 border border-violet-800/80 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Another Product</span>
          </button>
        </div>
      </div>

      {/* Comparison Table Container */}
      <div className="bg-navy-900/80 backdrop-blur-md rounded-3xl border border-navy-800 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-navy-800 bg-navy-950/90">
                <th className="p-4 w-56 min-w-[200px] text-xs font-bold text-slate-400 uppercase tracking-wider align-top bg-navy-950/90 border-r border-navy-800">
                  Feature / Attribute
                </th>
                {comparisonList.map((product: Product) => (
                  <th
                    key={product.id}
                    className="p-5 min-w-[300px] max-w-[360px] align-top border-r border-navy-800 last:border-r-0"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <VerificationBadge
                          status={product.verificationStatus}
                          score={product.verificationScore}
                          size="sm"
                        />
                        <button
                          onClick={() => removeFromComparison(product.id)}
                          className="text-slate-400 hover:text-rose-400 p-1 rounded-md transition-colors"
                          title="Remove from comparison"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="h-32 w-full bg-navy-950 rounded-xl overflow-hidden flex items-center justify-center p-2 border border-navy-800">
                        <img
                          src={product.imageUrl}
                          alt={product.title}
                          className="h-full w-full object-cover rounded-lg opacity-90"
                        />
                      </div>

                      <h4 className="font-bold text-slate-100 text-sm leading-snug line-clamp-2">
                        {product.title}
                      </h4>

                      <div className="flex items-baseline justify-between pt-1">
                        <div>
                          <div className="text-xl font-extrabold text-slate-100 font-mono">
                            ₹{product.price.toLocaleString('en-IN')}
                          </div>
                          {product.originalPrice && (
                            <span className="text-xs text-slate-500 line-through font-mono">
                              ₹{product.originalPrice.toLocaleString('en-IN')}
                            </span>
                          )}
                        </div>

                        <button
                          onClick={() => handleSelectForReview(product)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-xl shadow-glow transition-colors"
                        >
                          <span>Select for Review</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-navy-800 text-xs text-slate-300">
              {/* Suitability Score */}
              <tr className="bg-navy-950/40">
                <td className="p-4 font-bold text-slate-200 bg-navy-950/70 border-r border-navy-800">
                  AI ML Suitability
                </td>
                {comparisonList.map((product: Product) => (
                  <td key={product.id} className="p-4 border-r border-navy-800 last:border-r-0">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <div className="h-2 flex-1 bg-navy-950 rounded-full overflow-hidden border border-navy-800">
                          <div
                            className="h-full bg-gradient-to-r from-violet-500 to-electric-500 rounded-full"
                            style={{ width: `${product.suitabilityScore}%` }}
                          />
                        </div>
                        <span className="font-mono font-bold text-violet-400">
                          {product.suitabilityScore}/100
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        {product.suitabilityReason}
                      </p>
                    </div>
                  </td>
                ))}
              </tr>

              {/* Processor */}
              <tr>
                <td className="p-4 font-semibold text-slate-300 bg-navy-950/70 border-r border-navy-800 flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-slate-400" />
                  <span>Processor (CPU)</span>
                </td>
                {comparisonList.map((product: Product) => (
                  <td key={product.id} className="p-4 font-mono border-r border-navy-800 last:border-r-0 text-slate-200">
                    {product.specs.processor || 'Not Specified'}
                  </td>
                ))}
              </tr>

              {/* RAM */}
              <tr className="bg-navy-950/30">
                <td className="p-4 font-semibold text-slate-300 bg-navy-950/70 border-r border-navy-800 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-slate-400" />
                  <span>Memory (RAM)</span>
                </td>
                {comparisonList.map((product: Product) => (
                  <td key={product.id} className="p-4 border-r border-navy-800 last:border-r-0">
                    <span className="font-semibold font-mono text-violet-300 bg-violet-950/80 px-2 py-0.5 rounded border border-violet-800/80">
                      {product.specs.ram || 'Not Specified'}
                    </span>
                  </td>
                ))}
              </tr>

              {/* GPU */}
              <tr>
                <td className="p-4 font-semibold text-slate-300 bg-navy-950/70 border-r border-navy-800">
                  Graphics (GPU / CUDA)
                </td>
                {comparisonList.map((product: Product) => (
                  <td key={product.id} className="p-4 border-r border-navy-800 last:border-r-0">
                    <span className="font-mono text-slate-200">
                      {product.specs.gpu || 'Integrated'}
                    </span>
                  </td>
                ))}
              </tr>

              {/* Storage */}
              <tr className="bg-navy-950/30">
                <td className="p-4 font-semibold text-slate-300 bg-navy-950/70 border-r border-navy-800 flex items-center gap-1.5">
                  <HardDrive className="w-3.5 h-3.5 text-slate-400" />
                  <span>Storage</span>
                </td>
                {comparisonList.map((product: Product) => (
                  <td key={product.id} className="p-4 font-mono border-r border-navy-800 last:border-r-0 text-slate-200">
                    {product.specs.storage || 'Not Specified'}
                  </td>
                ))}
              </tr>

              {/* Display */}
              <tr>
                <td className="p-4 font-semibold text-slate-300 bg-navy-950/70 border-r border-navy-800 flex items-center gap-1.5">
                  <Monitor className="w-3.5 h-3.5 text-slate-400" />
                  <span>Display</span>
                </td>
                {comparisonList.map((product: Product) => (
                  <td key={product.id} className="p-4 border-r border-navy-800 last:border-r-0 text-slate-200">
                    {product.specs.display || 'Standard'}
                  </td>
                ))}
              </tr>

              {/* Battery & Weight */}
              <tr className="bg-navy-950/30">
                <td className="p-4 font-semibold text-slate-300 bg-navy-950/70 border-r border-navy-800 flex items-center gap-1.5">
                  <Battery className="w-3.5 h-3.5 text-slate-400" />
                  <span>Battery & Weight</span>
                </td>
                {comparisonList.map((product: Product) => (
                  <td key={product.id} className="p-4 border-r border-navy-800 last:border-r-0">
                    <div className="text-slate-200">{product.specs.battery}</div>
                    <div className="text-slate-400 text-[11px] font-mono">{product.specs.weight}</div>
                  </td>
                ))}
              </tr>

              {/* Seller & Warranty Scrutiny */}
              <tr className="bg-navy-950/50">
                <td className="p-4 font-bold text-slate-200 bg-navy-950/70 border-r border-navy-800">
                  Seller & Authorization
                </td>
                {comparisonList.map((product: Product) => (
                  <td key={product.id} className="p-4 border-r border-navy-800 last:border-r-0 space-y-1">
                    <div className="font-semibold text-slate-200">{product.seller.name}</div>
                    <div className="text-[11px] text-slate-400 leading-tight">
                      {product.seller.sellerEvidence}
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <span className="font-mono text-xs text-emerald-400 font-semibold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/80">
                        {product.seller.returnPolicyDays}-Day Return
                      </span>
                      <span className="text-[11px] text-slate-400">{product.seller.warranty}</span>
                    </div>
                  </td>
                ))}
              </tr>

              {/* SECTION: VERIFIED FACTS */}
              <tr className="bg-emerald-950/20">
                <td className="p-4 font-bold text-emerald-300 bg-emerald-950/40 border-r border-navy-800 align-top">
                  <div className="flex items-center gap-1.5 text-emerald-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Verified Facts</span>
                  </div>
                  <div className="text-[10px] font-normal text-emerald-400/80 mt-1">
                    Confirmed via OEM datasheets & tax portals
                  </div>
                </td>
                {comparisonList.map((product: Product) => (
                  <td key={product.id} className="p-4 border-r border-navy-800 last:border-r-0 align-top">
                    <ul className="space-y-1.5">
                      {product.verifiedFacts.map((fact: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-1.5 text-[11.5px] text-emerald-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                          <span>{fact}</span>
                        </li>
                      ))}
                    </ul>
                  </td>
                ))}
              </tr>

              {/* SECTION: UNKNOWN / UNVERIFIED INFO */}
              <tr className="bg-amber-950/20">
                <td className="p-4 font-bold text-amber-300 bg-amber-950/40 border-r border-navy-800 align-top">
                  <div className="flex items-center gap-1.5 text-amber-300">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span>Unknown / Unverified</span>
                  </div>
                  <div className="text-[10px] font-normal text-amber-400/80 mt-1">
                    Missing merchant disclosure or unverified claims
                  </div>
                </td>
                {comparisonList.map((product: Product) => (
                  <td key={product.id} className="p-4 border-r border-navy-800 last:border-r-0 align-top">
                    {product.unknowns.length > 0 ? (
                      <ul className="space-y-1.5">
                        {product.unknowns.map((unk: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-1.5 text-[11.5px] text-amber-300">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                            <span>{unk}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-slate-500 italic text-[11px]">No critical unknown data points flagged.</span>
                    )}
                  </td>
                ))}
              </tr>

              {/* Pros & Cons */}
              <tr>
                <td className="p-4 font-bold text-slate-200 bg-navy-950/70 border-r border-navy-800 align-top">
                  Pros & Trade-offs
                </td>
                {comparisonList.map((product: Product) => (
                  <td key={product.id} className="p-4 border-r border-navy-800 last:border-r-0 align-top space-y-3">
                    <div>
                      <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-1">
                        Advantages:
                      </div>
                      <ul className="space-y-1 text-[11px] text-slate-300">
                        {product.pros.map((pro: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-1">
                            <span className="text-emerald-400 font-bold">&bull;</span>
                            <span>{pro}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-2 border-t border-navy-800">
                      <div className="text-[10px] font-bold text-rose-400 uppercase tracking-wider mb-1">
                        Limitations / Cons:
                      </div>
                      <ul className="space-y-1 text-[11px] text-slate-400">
                        {product.cons.map((con: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-1">
                            <span className="text-rose-400 font-bold">&bull;</span>
                            <span>{con}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </td>
                ))}
              </tr>

              {/* Evidence Sources & Citations */}
              <tr className="bg-navy-950/40">
                <td className="p-4 font-bold text-slate-200 bg-navy-950/70 border-r border-navy-800 align-top">
                  Evidence Citations
                </td>
                {comparisonList.map((product: Product) => (
                  <td key={product.id} className="p-4 border-r border-navy-800 last:border-r-0 align-top">
                    <div className="space-y-2">
                      {product.evidenceSources.map((ev: EvidenceSource) => (
                        <div
                          key={ev.id}
                          className="p-2.5 rounded-xl bg-navy-950/80 border border-navy-800 text-[11px] space-y-0.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-200 truncate">{ev.title}</span>
                            <span
                              className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${
                                ev.verified
                                  ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/80'
                                  : 'bg-amber-950/80 text-amber-300 border border-amber-800/80'
                              }`}
                            >
                              {ev.type}
                            </span>
                          </div>
                          <p className="text-slate-400 text-[10.5px]">{ev.finding}</p>
                          <a
                            href={ev.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-electric-400 hover:text-electric-300 font-mono text-[10px] hover:underline"
                          >
                            <span>Inspect source citation</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        </div>
                      ))}
                    </div>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
