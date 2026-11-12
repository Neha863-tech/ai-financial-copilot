import React, { useState } from 'react';
import { X, ShieldCheck } from 'lucide-react';
import { API_BASE_URL } from '../../services/api';
export const DemoBanner = () => {
    const [dismissed, setDismissed] = useState(false);
    if (dismissed)
        return null;
    return (<div className="bg-gradient-to-r from-navy-900 via-navy-850 to-indigo-950 text-white text-xs px-4 py-2 border-b border-violet-900/40 shadow-xs flex items-center justify-between transition-all">
      <div className="flex items-center gap-2.5 flex-wrap">
        <span className="flex items-center gap-1.5 font-semibold text-violet-300 bg-violet-950/80 border border-violet-700/60 px-2 py-0.5 rounded-full text-[11px]">
          <ShieldCheck className="w-3.5 h-3.5 text-violet-400"/>
          HACKATHON EVIDENCE DEMO
        </span>
        <span className="text-slate-300">
          Showing verified synthetic benchmarks & audit trails. No real transactions or payment credentials stored.
        </span>
        <span className="hidden md:inline-flex items-center gap-1 text-slate-400 font-mono text-[11px]">
          Target Backend: <code className="text-electric-400 bg-navy-950 px-1.5 py-0.5 rounded border border-navy-700">{API_BASE_URL}</code>
        </span>
      </div>

      <button onClick={() => setDismissed(true)} className="text-slate-400 hover:text-slate-200 p-1 rounded-md transition-colors" aria-label="Dismiss banner">
        <X className="w-3.5 h-3.5"/>
      </button>
    </div>);
};
