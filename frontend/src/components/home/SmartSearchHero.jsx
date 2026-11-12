import React, { useState } from 'react';
import { Search, Sparkles, ShieldCheck, Cpu } from 'lucide-react';
import { EXAMPLE_SEARCHES } from '../../data/demoProducts';
export const SmartSearchHero = ({ onSearch, isLoading = false, }) => {
    const [inputVal, setInputVal] = useState('');
    const handleSubmit = (e) => {
        e.preventDefault();
        if (inputVal.trim()) {
            onSearch(inputVal.trim());
        }
    };
    const handleSelectExample = (example) => {
        setInputVal(example);
        onSearch(example);
    };
    return (<div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-navy-900 via-navy-900/90 to-navy-950 border border-navy-800 p-8 sm:p-10 shadow-card">
      {/* Decorative ambient background glows */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-violet-600/15 blur-3xl pointer-events-none"/>
      <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-80 h-80 rounded-full bg-electric-500/15 blur-3xl pointer-events-none"/>

      <div className="relative z-10 max-w-3xl mx-auto text-center space-y-4">
        {/* Verification Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-950/80 border border-violet-800/80 text-xs font-semibold text-violet-300 shadow-xs">
          <ShieldCheck className="w-4 h-4 text-violet-400"/>
          <span>Multi-Agent Verifiable Shopping Assistant</span>
          <span className="w-1.5 h-1.5 rounded-full bg-electric-400"/>
          <span className="text-electric-400 font-mono text-[11px]">LangGraph Orchestrated</span>
        </div>

        {/* Headline */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-100 tracking-tight leading-tight">
          Shop smarter.{' '}
          <span className="bg-gradient-to-r from-violet-400 via-indigo-400 to-electric-400 bg-clip-text text-transparent">
            Verify before you buy.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          Ask in plain English. Five specialized AI agents cross-examine specifications, seller registrations, return policies, and price histories against official OEM evidence.
        </p>

        {/* Natural Language Search Input */}
        <form onSubmit={handleSubmit} className="pt-3 max-w-2xl mx-auto">
          <div className="relative flex items-center bg-navy-950/90 rounded-2xl border-2 border-navy-800 shadow-md focus-within:border-violet-500 focus-within:ring-4 focus-within:ring-violet-500/20 transition-all p-1.5">
            <div className="pl-3 text-slate-400">
              <Search className="w-5 h-5 text-slate-400"/>
            </div>
            <input type="text" value={inputVal} onChange={(e) => setInputVal(e.target.value)} placeholder="e.g. Find a laptop under ₹60,000 for machine learning with 16GB RAM" className="w-full px-3 py-2.5 text-sm sm:text-base text-slate-100 placeholder:text-slate-500 focus:outline-none bg-transparent"/>
            <button type="submit" disabled={isLoading} className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-medium text-sm rounded-xl shadow-glow transition-all flex-shrink-0 disabled:opacity-60">
              {isLoading ? (<>
                  <Cpu className="w-4 h-4 animate-spin text-electric-300"/>
                  <span>Auditing...</span>
                </>) : (<>
                  <Sparkles className="w-4 h-4"/>
                  <span>Audit & Find</span>
                </>)}
            </button>
          </div>
        </form>

        {/* Example Search Chips */}
        <div className="pt-2 text-left sm:text-center">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Try Example Prompts:
          </div>
          <div className="flex flex-wrap gap-2 justify-center">
            {EXAMPLE_SEARCHES.map((example, idx) => (<button key={idx} type="button" onClick={() => handleSelectExample(example)} className="text-left text-xs bg-navy-900/80 hover:bg-navy-800 text-slate-300 hover:text-white border border-navy-800 hover:border-violet-500/50 px-3 py-1.5 rounded-lg transition-all shadow-2xs group">
                <span className="font-mono text-violet-400 mr-1.5 group-hover:underline">#</span>
                <span>{example}</span>
              </button>))}
          </div>
        </div>
      </div>
    </div>);
};
