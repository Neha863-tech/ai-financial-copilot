import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Search,
  Scale,
  Cpu,
  ShieldCheck,
  CreditCard,
  History,
  Sparkles,
  Server,
  Layers,
  ChevronRight,
  Shield,
  Zap
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAgent } from '../../context/AgentContext';
import { checkBackendHealth } from '../../services/api';

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const { comparisonList, selectedProduct } = useCart();
  const { agentState } = useAgent();
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  useEffect(() => {
    let isMounted = true;
    checkBackendHealth().then((res) => {
      if (isMounted) {
        setBackendStatus(res.alive ? 'online' : 'offline');
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const navItems = [
    {
      to: '/',
      label: 'Home & Search',
      description: 'Smart natural search',
      icon: Search,
      exact: true,
    },
    {
      to: '/comparison',
      label: 'Product Comparison',
      description: 'Facts vs unknowns matrix',
      icon: Scale,
      badge: comparisonList.length > 0 ? `${comparisonList.length}` : undefined,
    },
    {
      to: '/agent-activity',
      label: 'AI Agent Activity',
      description: '3D multi-agent network',
      icon: Cpu,
      pulse: agentState.status === 'running',
    },
    {
      to: '/approval',
      label: 'Purchase Approval',
      description: 'Evidence scrutiny & checks',
      icon: ShieldCheck,
      badge: selectedProduct ? 'Ready' : undefined,
    },
    {
      to: '/checkout',
      label: 'Razorpay Checkout',
      description: 'Test mode UPI & Cards',
      icon: CreditCard,
      sublabel: 'Test Mode',
    },
    {
      to: '/orders',
      label: 'Order History',
      description: 'Audit trails & receipts',
      icon: History,
    },
  ];

  return (
    <aside className="w-64 bg-navy-900 border-r border-navy-800 flex flex-col h-screen sticky top-0 select-none z-30 transition-all duration-300">
      {/* Brand Header */}
      <div className="p-5 border-b border-navy-800/80">
        <NavLink to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-electric-500 p-0.5 shadow-glow flex items-center justify-center transition-transform group-hover:scale-105">
            <div className="w-full h-full bg-navy-950 rounded-[10px] flex items-center justify-center">
              <Shield className="w-5 h-5 text-electric-400 group-hover:text-white transition-colors" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg tracking-tight text-white font-sans">
                TrustCart
              </span>
              <span className="bg-gradient-to-r from-violet-400 to-electric-400 bg-clip-text text-transparent font-extrabold text-sm">
                AI
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium tracking-wide">
              Evidence-First Shopping
            </p>
          </div>
        </NavLink>

        {/* Hackathon Demo Tag */}
        <div className="mt-3.5 flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-navy-850 border border-navy-700/60 text-[11px]">
          <span className="flex items-center gap-1.5 text-violet-300 font-medium">
            <Zap className="w-3.5 h-3.5 text-violet-400 animate-pulse" />
            Hackathon Demo
          </span>
          <span className="text-[10px] bg-violet-500/20 text-violet-300 px-1.5 py-0.5 rounded font-mono font-semibold">
            v1.0
          </span>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto custom-scrollbar">
        <div className="px-3 pb-2 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
          Agentic Workspace
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.exact
            ? location.pathname === item.to
            : location.pathname.startsWith(item.to);

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`group flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-violet-600/20 to-electric-600/10 text-white border border-violet-500/30 shadow-subtle'
                  : 'text-slate-300 hover:text-white hover:bg-navy-800/60 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                    isActive
                      ? 'bg-gradient-to-br from-violet-500 to-electric-600 text-white shadow-xs'
                      : 'bg-navy-800 text-slate-400 group-hover:text-slate-200 group-hover:bg-navy-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate">{item.label}</span>
                    {item.sublabel && (
                      <span className="text-[9px] bg-electric-950 text-electric-300 border border-electric-700/50 px-1 rounded font-mono">
                        {item.sublabel}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 truncate font-normal">
                    {item.description}
                  </div>
                </div>
              </div>

              {/* Status Indicator / Badges */}
              <div className="flex items-center gap-1.5">
                {item.pulse && (
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-electric-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-electric-500"></span>
                  </span>
                )}
                {item.badge && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-violet-600 text-white font-mono shadow-xs">
                    {item.badge}
                  </span>
                )}
                <ChevronRight
                  className={`w-3.5 h-3.5 transition-transform ${
                    isActive
                      ? 'text-violet-400 translate-x-0.5'
                      : 'text-slate-600 opacity-0 group-hover:opacity-100'
                  }`}
                />
              </div>
            </NavLink>
          );
        })}
      </nav>

      {/* Backend & Environment Status Card */}
      <div className="p-3.5 m-3 rounded-xl bg-navy-850/90 border border-navy-700/70 text-xs">
        <div className="flex items-center justify-between text-slate-300 mb-2">
          <span className="flex items-center gap-1.5 font-medium text-[11px]">
            <Server className="w-3.5 h-3.5 text-slate-400" />
            FastAPI Engine
          </span>
          <span
            className={`flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded font-semibold ${
              backendStatus === 'online'
                ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60'
                : 'bg-amber-950/60 text-amber-300 border border-amber-800/50'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                backendStatus === 'online' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            />
            {backendStatus === 'online' ? 'Port 8000' : 'Demo Fallback'}
          </span>
        </div>

        <div className="text-[10.5px] text-slate-400 leading-relaxed font-sans">
          {backendStatus === 'online'
            ? 'Connected to FastAPI backend services.'
            : 'Using verified synthetic demo dataset. Ready for backend integration.'}
        </div>
      </div>
    </aside>
  );
};
