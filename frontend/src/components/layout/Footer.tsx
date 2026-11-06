import React from 'react';
import { Shield, Sparkles, ExternalLink, Lock } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto border-t border-navy-800 bg-navy-950/90 py-6 px-8 text-xs text-slate-400">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-violet-400" />
          <span className="font-semibold text-slate-200">TrustCart AI</span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">Evidence-First Multi-Agent Shopping Engine</span>
        </div>

        <div className="flex items-center gap-6 text-slate-400 text-[11.5px]">
          <span className="flex items-center gap-1">
            <Lock className="w-3.5 h-3.5 text-slate-500" />
            Zero credentials stored in frontend
          </span>
          <span>OEM PSREF & Benchmark Verified</span>
          <span>FastAPI LangGraph Architecture</span>
        </div>

        <div className="text-[11px] text-slate-500 font-mono">
          Hackathon Project &copy; 2026 TrustCart AI
        </div>
      </div>
    </footer>
  );
};
