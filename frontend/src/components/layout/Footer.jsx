import React from 'react';
import { Shield, Lock } from 'lucide-react';
export const Footer = () => {
    return (<footer className="mt-auto border-t border-navy-800 bg-navy-950/90 py-6 px-8 text-xs text-slate-400">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-violet-400"/>
          <span className="font-semibold text-slate-200">FinSight AI</span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">Personal Financial Intelligence Platform</span>
        </div>

        <div className="flex items-center gap-6 text-slate-400 text-[11.5px]">
          <span className="flex items-center gap-1">
            <Lock className="w-3.5 h-3.5 text-slate-500"/>
            Zero credentials stored in frontend
          </span>
          <span>PayPal Sandbox Checkout Verified</span>
          <span>FastAPI Multi-Agent Copilot</span>
        </div>

        <div className="text-[11px] text-slate-500 font-mono">
          PayPal AI Hackathon 2026 &copy; FinSight AI Copilot
        </div>
      </div>
    </footer>);
};
