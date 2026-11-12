import React from 'react';
import { SlidersHorizontal, ShieldCheck, ArrowUpDown } from 'lucide-react';
import { CATEGORIES } from '../../data/demoProducts';
export const FiltersBar = ({ filters, onFilterChange, resultsCount, }) => {
    const budgetPresets = [
        { label: 'All Budgets', value: null },
        { label: '< ₹45,000', value: 45000 },
        { label: '< ₹55,000', value: 55000 },
        { label: '< ₹60,000 (Target)', value: 60000 },
        { label: '< ₹75,000', value: 75000 },
    ];
    return (<div className="bg-navy-900/80 backdrop-blur-md rounded-2xl border border-navy-800 p-4 shadow-card space-y-3.5 text-slate-200">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 custom-scrollbar">
          {CATEGORIES.map((cat) => (<button key={cat} onClick={() => onFilterChange({ category: cat })} className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${filters.category === cat
                ? 'bg-violet-600 text-white shadow-glow'
                : 'bg-navy-950 text-slate-300 hover:bg-navy-800 hover:text-white border border-navy-800'}`}>
              {cat}
            </button>))}
        </div>

        {/* Right side: Results counter & sorting */}
        <div className="flex items-center gap-3 justify-between lg:justify-end flex-wrap">
          <span className="text-xs text-slate-400 font-medium">
            Found <span className="font-bold text-slate-100">{resultsCount}</span> verified candidates
          </span>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5"/>
              Sort:
            </span>
            <select value={filters.sortBy} onChange={(e) => onFilterChange({
            sortBy: e.target.value,
        })} className="text-xs font-medium text-slate-200 bg-navy-950 border border-navy-800 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-violet-500">
              <option value="suitability">AI Suitability (High to Low)</option>
              <option value="verification">Verification Score (High to Low)</option>
              <option value="price-asc">Price (Lowest first)</option>
              <option value="price-desc">Price (Highest first)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="pt-2 border-t border-navy-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Budget presets */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-slate-400 font-medium flex items-center gap-1">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400"/>
            Budget Cap:
          </span>
          {budgetPresets.map((preset) => {
            const isSelected = filters.maxBudget === preset.value;
            return (<button key={preset.label} onClick={() => onFilterChange({ maxBudget: preset.value })} className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-all ${isSelected
                    ? 'bg-violet-950 text-violet-300 border border-violet-600 shadow-glow font-bold'
                    : 'bg-navy-950 text-slate-300 hover:bg-navy-800 border border-navy-800'}`}>
                {preset.label}
              </button>);
        })}
        </div>

        {/* Verified Only Toggle */}
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input type="checkbox" checked={filters.onlyVerified} onChange={(e) => onFilterChange({ onlyVerified: e.target.checked })} className="w-4 h-4 text-violet-600 rounded border-navy-700 bg-navy-950 focus:ring-violet-500"/>
            <span className="flex items-center gap-1 text-slate-300 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400"/>
              Only Verified Sellers & OEMs
            </span>
          </label>
        </div>
      </div>
    </div>);
};
