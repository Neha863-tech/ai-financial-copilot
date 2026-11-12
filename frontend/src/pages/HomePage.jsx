import React, { useState, useEffect, useTransition } from 'react';
import { SmartSearchHero } from '../components/home/SmartSearchHero';
import { FiltersBar } from '../components/home/FiltersBar';
import { ProductCard } from '../components/home/ProductCard';
import { searchProducts } from '../services/api';
import { useAgent } from '../context/AgentContext';
import { Sparkles, RefreshCw, ShieldAlert } from 'lucide-react';
export const HomePage = () => {
    const [filters, setFilters] = useState({
        query: '',
        category: 'All Categories',
        maxBudget: 60000,
        onlyVerified: false,
        minVerificationScore: 0,
        sortBy: 'suitability',
    });
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [isFromBackend, setIsFromBackend] = useState(false);
    const [queryInterpretation, setQueryInterpretation] = useState(null);
    const { triggerAgentRun } = useAgent();
    const fetchResults = async (currentFilters) => {
        setIsLoading(true);
        try {
            const res = await searchProducts({
                query: currentFilters.query,
                category: currentFilters.category,
                maxBudget: currentFilters.maxBudget,
                onlyVerified: currentFilters.onlyVerified,
            });
            let items = [...res.products];
            // Client-side sorting
            if (currentFilters.sortBy === 'suitability') {
                items.sort((a, b) => b.suitabilityScore - a.suitabilityScore);
            }
            else if (currentFilters.sortBy === 'verification') {
                items.sort((a, b) => b.verificationScore - a.verificationScore);
            }
            else if (currentFilters.sortBy === 'price-asc') {
                items.sort((a, b) => a.price - b.price);
            }
            else if (currentFilters.sortBy === 'price-desc') {
                items.sort((a, b) => b.price - a.price);
            }
            setProducts(items);
            setIsFromBackend(res.isFromBackend);
            setQueryInterpretation(res.queryInterpretation || null);
        }
        catch (err) {
            console.error('Error fetching search results:', err);
        }
        finally {
            setIsLoading(false);
        }
    };
    useEffect(() => {
        fetchResults(filters);
    }, [filters.category, filters.maxBudget, filters.onlyVerified, filters.sortBy]);
    const handleSearchSubmit = (newQuery) => {
        const updated = { ...filters, query: newQuery };
        setFilters(updated);
        fetchResults(updated);
        // Also trigger agent simulation run in the background for demo engagement
        triggerAgentRun(newQuery);
    };
    const handleFilterChange = (newFilters) => {
        setFilters((prev) => ({ ...prev, ...newFilters }));
    };
    const handleResetFilters = () => {
        const resetState = {
            query: '',
            category: 'All Categories',
            maxBudget: null,
            onlyVerified: false,
            minVerificationScore: 0,
            sortBy: 'suitability',
        };
        setFilters(resetState);
        fetchResults(resetState);
    };
    return (<div className="space-y-8 pb-12">
      {/* Hero with Natural Language Search */}
      <SmartSearchHero onSearch={handleSearchSubmit} isLoading={isLoading}/>

      {/* Query interpretation info if active */}
      {queryInterpretation && (<div className="bg-violet-950/40 border border-violet-800/60 rounded-xl px-4 py-2.5 flex items-center justify-between text-xs text-violet-300">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-violet-400 flex-shrink-0"/>
            <span>
              <strong>AI Query Parser:</strong> {queryInterpretation}
            </span>
          </div>
          <span className="font-mono text-[10px] bg-navy-950 border border-violet-700/60 px-2 py-0.5 rounded text-violet-300">
            {isFromBackend ? 'FastAPI Parser' : 'Demo Parser'}
          </span>
        </div>)}

      {/* Filter and Control Bar */}
      <FiltersBar filters={filters} onFilterChange={handleFilterChange} resultsCount={products.length}/>

      {/* Results Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-100 tracking-tight flex items-center gap-2">
            <span>Verified Product Recommendations</span>
            <span className="text-xs font-normal text-slate-400">
              (Cross-examined by 5 Specialized Agents)
            </span>
          </h2>

          <button onClick={() => fetchResults(filters)} className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-violet-400 transition-colors">
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`}/>
            <span>Refresh Audit</span>
          </button>
        </div>

        {/* Product Grid */}
        {isLoading ? (<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (<div key={n} className="bg-navy-900/60 rounded-2xl border border-navy-800 p-5 space-y-4 animate-pulse">
                <div className="h-44 bg-navy-800/60 rounded-xl"/>
                <div className="h-4 bg-navy-800/60 rounded w-3/4"/>
                <div className="h-3 bg-navy-800/60 rounded w-1/2"/>
                <div className="h-16 bg-navy-950 rounded-xl"/>
                <div className="h-10 bg-navy-800/60 rounded-xl"/>
              </div>))}
          </div>) : products.length > 0 ? (<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {products.map((product) => (<ProductCard key={product.id} product={product}/>))}
          </div>) : (
        /* Empty State */
        <div className="bg-navy-900/60 rounded-2xl border border-dashed border-navy-800 p-12 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-navy-950 text-slate-400 mx-auto flex items-center justify-center border border-navy-800">
              <ShieldAlert className="w-6 h-6 text-slate-400"/>
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h3 className="font-semibold text-slate-200 text-base">
                No matching verified products found
              </h3>
              <p className="text-xs text-slate-400">
                Your filters (Budget ₹{filters.maxBudget?.toLocaleString('en-IN') || 'None'} / Category "{filters.category}") yielded no verified listings. Try adjusting or clearing your criteria.
              </p>
            </div>
            <button onClick={handleResetFilters} className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold rounded-xl shadow-glow transition-colors">
              Reset All Filters
            </button>
          </div>)}
      </div>
    </div>);
};
