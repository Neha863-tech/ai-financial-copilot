import React, { useState, useEffect } from "react";
import { ShoppingBag, Search, ExternalLink, ShieldCheck, Sparkles, } from "lucide-react";
import { FinSightAPI } from "../../services/finsightApi";
import { toast } from "sonner";
export const ShoppingIntelligenceView = () => {
    const [query, setQuery] = useState("");
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const fetchProducts = async (searchQuery = "") => {
        setLoading(true);
        try {
            const res = await FinSightAPI.searchShoppingProducts(searchQuery);
            setProducts(res);
        }
        catch {
            toast.error("Error retrieving Channel3 products");
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchProducts("");
    }, []);
    const handleSearch = (e) => {
        e.preventDefault();
        fetchProducts(query);
    };
    return (<div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
            PRODUCT ENRICHMENT & CHANNEL3 MCP
          </p>
          <h1 className="text-2xl font-bold font-heading text-slate-900 dark:text-white flex items-center gap-2">
            <ShoppingBag className="text-[#16a57a]" size={26}/> Shopping Intelligence
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Search products, compare multi-merchant prices, and run affordability checks against your real surplus before buying.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 text-emerald-600 text-xs font-semibold flex items-center gap-1.5">
            <ShieldCheck size={14}/> Channel3 Intelligence Active
          </span>
        </div>
      </div>

      {/* Search Input Bar */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"/>
          <input type="text" placeholder="Search products (e.g. Sony WH-1000XM5, MacBook Air, Standing Desk)..." value={query} onChange={(e) => setQuery(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-[#21352f] bg-white dark:bg-[#121f1c] text-xs text-slate-900 dark:text-white outline-none focus:border-[#16a57a]"/>
        </div>
        <button type="submit" className="px-5 py-2.5 rounded-xl bg-[#16a57a] hover:bg-[#138e69] text-white text-xs font-semibold transition-all shadow-xs">
          Search
        </button>
      </form>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {products.map((p) => (<div key={p.id} className="p-5 bg-white dark:bg-[#121f1c] rounded-xl border border-slate-200 dark:border-[#21352f] shadow-xs space-y-4 hover:border-[#16a57a]/40 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex gap-4">
                <img src={p.imageUrl} alt={p.name} className="w-20 h-20 rounded-lg object-cover bg-slate-100 dark:bg-[#1c3029] shrink-0"/>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                    {p.category}
                  </span>
                  <h3 className="text-sm font-bold font-heading text-slate-900 dark:text-white line-clamp-2">
                    {p.name}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-extrabold text-[#16a57a]">
                      ₹{p.price.toLocaleString("en-IN")}
                    </span>
                    <span className="text-[11px] text-slate-400">★ {p.rating}</span>
                  </div>
                </div>
              </div>

              {/* Affordability Verdict */}
              <div className="p-3 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 space-y-1">
                <span className="flex items-center gap-1 text-[11px] font-bold text-[#16a57a]">
                  <Sparkles size={12}/> Affordability Simulation
                </span>
                <p className="text-xs text-slate-700 dark:text-slate-300">
                  {p.affordability?.verdict}
                </p>
              </div>

              {/* Multi-Merchant Comparison */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  Price Comparison Matrix
                </span>
                <div className="space-y-1">
                  {(p.comparisonPrices || []).map((cp, idx) => {
                const isLowest = cp.price === p.bestPrice;
                return (<div key={idx} className={`flex items-center justify-between p-2 rounded-md text-xs ${isLowest
                        ? "bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/30 font-bold text-emerald-700 dark:text-emerald-300"
                        : "bg-slate-50 dark:bg-[#182a24] text-slate-600 dark:text-slate-300"}`}>
                        <span>{cp.merchant}</span>
                        <div className="flex items-center gap-1.5">
                          <span>₹{cp.price.toLocaleString("en-IN")}</span>
                          {isLowest && (<span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-emerald-600 text-white font-extrabold">
                              Best
                            </span>)}
                        </div>
                      </div>);
            })}
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-[#1e342c] flex items-center justify-between text-xs">
              <span className="text-slate-400">Potential Savings: ₹{p.savingsPotential || 0}</span>
              <a href="https://amazon.in" target="_blank" rel="noreferrer" className="text-[#16a57a] hover:underline font-semibold flex items-center gap-1">
                View Merchant <ExternalLink size={12}/>
              </a>
            </div>
          </div>))}
      </div>
    </div>);
};
