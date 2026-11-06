import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Sparkles,
  Scale,
  ShieldCheck,
  CheckCircle,
  Clock,
  ArrowRight,
  Cpu,
  User as UserIcon,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAgent } from '../../context/AgentContext';
import { useAuth } from '../../context/AuthContext';
import { checkBackendHealth } from '../../services/api';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { comparisonList, selectedProduct } = useCart();
  const { agentState } = useAgent();
  const { isAuthenticated, user, openAuthModal } = useAuth();
  const [isBackendConnected, setIsBackendConnected] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    let isMounted = true;
    async function check() {
      const health = await checkBackendHealth();
      if (isMounted) setIsBackendConnected(health.alive);
    }
    check();
    const interval = setInterval(check, 8000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/':
        return 'Smart Search & Evidence Catalog';
      case '/comparison':
        return 'Multi-Product Specification Matrix';
      case '/agent-activity':
        return 'Multi-Agent Neural Network Visualization';
      case '/approval':
        return 'Purchase Approval & Evidence Audit';
      case '/checkout':
        return 'Secure Checkout (Razorpay UPI & Cards)';
      case '/orders':
        return 'Verified Order Audit History';
      default:
        return 'TrustCart AI Shopping';
    }
  };

  return (
    <header className="h-16 bg-navy-950/80 backdrop-blur-md border-b border-navy-800/80 sticky top-0 z-20 px-6 flex items-center justify-between shadow-subtle text-slate-100">
      {/* Title & Context */}
      <div>
        <h1 className="text-base font-semibold text-slate-100 tracking-tight flex items-center gap-2">
          <span>{getPageTitle()}</span>
        </h1>
        <p className="text-[11px] text-slate-400 font-normal">
          Evidence-backed recommendations with explicit verification checkpoints
        </p>
      </div>

      {/* Action / Context Shortcuts */}
      <div className="flex items-center gap-3">
        {/* Live Backend Connection Indicator */}
        <div
          className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-medium border transition-all ${
            isBackendConnected
              ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/40 shadow-xs'
              : isBackendConnected === false
              ? 'bg-rose-950/40 text-rose-300 border-rose-500/40'
              : 'bg-navy-900 text-slate-400 border-navy-800'
          }`}
          title={
            isBackendConnected
              ? 'FastAPI Backend Live & Connected on http://localhost:8000'
              : 'FastAPI Backend Offline — Run uvicorn on port 8000'
          }
        >
          <span
            className={`w-2 h-2 rounded-full ${
              isBackendConnected
                ? 'bg-emerald-400 animate-pulse'
                : isBackendConnected === false
                ? 'bg-rose-400'
                : 'bg-slate-400 animate-ping'
            }`}
          />
          <span>{isBackendConnected ? 'Backend Live' : isBackendConnected === false ? 'Backend Offline' : 'Connecting...'}</span>
        </div>

        {/* Agent Run Status Pill */}
        <button
          onClick={() => navigate('/agent-activity')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
            agentState.status === 'running'
              ? 'bg-violet-950/80 text-violet-300 border-violet-700/80 animate-pulse shadow-glow'
              : 'bg-navy-900 text-slate-300 border-navy-800 hover:bg-navy-850 hover:border-violet-500/50'
          }`}
          title="Inspect 3D multi-agent orchestration"
        >
          <Cpu className={`w-3.5 h-3.5 ${agentState.status === 'running' ? 'text-violet-400 animate-spin' : 'text-slate-400'}`} />
          <span className="font-sans font-medium">
            {agentState.status === 'running' ? 'Agents Running...' : '5 Agents Active'}
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        </button>

        {/* Comparison Pill */}
        {comparisonList.length > 0 && (
          <button
            onClick={() => navigate('/comparison')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-violet-950/70 text-violet-300 border border-violet-800/80 hover:bg-violet-900/60 transition-colors"
          >
            <Scale className="w-3.5 h-3.5 text-violet-400" />
            <span>Comparing ({comparisonList.length})</span>
          </button>
        )}

        {/* Selected Product Pill */}
        {selectedProduct && (
          <button
            onClick={() => navigate('/approval')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-emerald-950/70 text-emerald-300 border border-emerald-800/80 hover:bg-emerald-900/60 transition-colors"
            title="Inspect selected product for purchase approval"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="max-w-[140px] truncate font-sans font-semibold text-emerald-200">
              {selectedProduct.brand} {selectedProduct.category}
            </span>
            <span className="font-mono text-emerald-400">₹{selectedProduct.price.toLocaleString('en-IN')}</span>
          </button>
        )}

        {/* Currency badge */}
        <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-md bg-navy-900 border border-navy-800 text-slate-300 text-xs font-mono font-medium">
          <span>INR (₹)</span>
        </div>

        {/* User Account / Auth Button */}
        <button
          onClick={openAuthModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-navy-800 bg-navy-900 text-slate-200 hover:bg-navy-850 hover:border-violet-500/50 transition-colors shadow-2xs"
          title="Account Authentication & Security"
        >
          <UserIcon className="w-3.5 h-3.5 text-violet-400" />
          <span className="font-semibold">{isAuthenticated && user ? user.fullName.split(' ')[0] : 'Sign In'}</span>
          {isAuthenticated && user && (user.isEmailVerified || user.isPhoneVerified) && (
            <span className="w-2 h-2 rounded-full bg-emerald-400" title="Account Verified" />
          )}
        </button>
      </div>
    </header>
  );
};
