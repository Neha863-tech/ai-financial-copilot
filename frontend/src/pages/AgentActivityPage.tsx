import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Cpu,
  Play,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Layers,
  ArrowRight,
  Zap,
  Info,
  AlertTriangle,
  Server,
  DollarSign,
  Scale,
  Check,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import { useAgent } from '../context/AgentContext';
import { useCart } from '../context/CartContext';
import { Agent3DScene } from '../components/agent/Agent3DScene';
import { AgentStatusCard } from '../components/agent/AgentStatusCard';
import { AgentActivityLog } from '../components/agent/AgentActivityLog';
import { AgentType } from '../types/agent';
import { VerificationBadge } from '../components/common/VerificationBadge';
import { Product } from '../types/product';

export const AgentActivityPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    agentState,
    activeAgentId,
    setActiveAgentId,
    isSimulating,
    triggerAgentRun,
    resetAgentRun,
    backendError,
    backendOutputs,
    groqConfigured,
    engineLabel,
  } = useAgent();
  const { selectProductForReview, toggleComparison, isInComparison } = useCart();

  const [queryInput, setQueryInput] = useState(agentState.currentQuery);

  const handleRunSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (queryInput.trim() && !isSimulating) {
      triggerAgentRun(queryInput.trim());
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Prominent Engine Mode Banner */}
      <div
        className={`p-4 rounded-3xl border backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
          groqConfigured
            ? 'bg-gradient-to-r from-violet-950/60 via-purple-950/40 to-cyan-950/60 border-violet-700/60 shadow-lg shadow-violet-950/40'
            : 'bg-gradient-to-r from-slate-900/90 via-amber-950/30 to-slate-900/90 border-amber-600/40'
        }`}
      >
        <div className="flex items-center gap-3">
          <span
            className={`p-2.5 rounded-2xl flex items-center justify-center ${
              groqConfigured
                ? 'bg-violet-900/60 text-violet-300 border border-violet-700/50'
                : 'bg-amber-950/80 text-amber-400 border border-amber-700/50'
            }`}
          >
            {groqConfigured ? (
              <Zap className="w-5 h-5 text-electric-400" />
            ) : (
              <Cpu className="w-5 h-5 text-amber-400" />
            )}
          </span>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`text-xs font-mono font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full ${
                  groqConfigured
                    ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                }`}
              >
                {groqConfigured ? '⚡ Groq AI Engine Active' : '⚙️ Offline Fallback Engine'}
              </span>
              <span className="text-xs text-slate-300 font-medium font-mono">
                {groqConfigured ? 'llama-3.3-70b-versatile via Groq Cloud' : 'Deterministic Rule-Based NLP & Semantic Regex'}
              </span>
            </div>
            <p className="text-[12px] text-slate-400 mt-0.5">
              {groqConfigured
                ? 'High-performance cloud LLM active for query intent parsing, semantic comparison, and multi-agent synthesis.'
                : 'Zero-cost offline mode active (GROQ_API_KEY unconfigured in backend/.env). All agent parsing is deterministic, authentic, and free.'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 text-xs">
          <span
            className={`px-3 py-1 rounded-xl font-mono font-medium ${
              groqConfigured
                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                : 'bg-slate-800 text-slate-300 border border-slate-700'
            }`}
          >
            {groqConfigured ? 'CLOUD LLM ENABLED' : 'NO-COST / OFFLINE SAFE'}
          </span>
        </div>
      </div>

      {/* Control Header & Live Orchestrator Bar */}
      <div className="bg-navy-900/80 backdrop-blur-md rounded-3xl border border-navy-800 p-6 sm:p-8 shadow-card space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-violet-950/80 border border-violet-800/80 text-violet-400">
                <Cpu className="w-5 h-5" />
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">
                Multi-Agent Cognitive Network
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-400">
              Interactive Three.js visualization driven by real backend LangGraph agent execution events.
            </p>
          </div>

          {/* Status & Overall Confidence */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="bg-navy-950/80 border border-navy-800 px-3.5 py-1.5 rounded-2xl flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium">Overall Confidence:</span>
              <span className="text-sm font-extrabold text-violet-400 font-mono">
                {agentState.overallConfidence}%
              </span>
            </div>

            <div className="bg-navy-950 border border-navy-800 text-white px-3.5 py-1.5 rounded-2xl flex items-center gap-2 text-xs font-mono">
              <span
                className={`w-2 h-2 rounded-full ${
                  isSimulating
                    ? 'bg-electric-400 animate-ping'
                    : agentState.isSimulatedDemo
                    ? 'bg-amber-400'
                    : 'bg-emerald-400'
                }`}
              />
              <span className="text-slate-200">
                {isSimulating
                  ? 'LANGGRAPH EXECUTING'
                  : agentState.isSimulatedDemo
                  ? 'OFFLINE DEMO HARNESS'
                  : 'BACKEND SYNCHRONIZED'}
              </span>
            </div>
          </div>
        </div>

        {/* Live Query Trigger Form */}
        <form onSubmit={handleRunSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              placeholder="Enter search constraint or product to verify..."
              className="w-full px-4 py-3 rounded-2xl border border-navy-800 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 text-sm text-slate-100 placeholder:text-slate-500 bg-navy-950/80 transition-colors"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={isSimulating}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-xs rounded-2xl shadow-glow transition-all disabled:opacity-50"
            >
              {isSimulating ? (
                <>
                  <Clock className="w-4 h-4 animate-spin text-electric-300" />
                  <span>Streaming Agent Events...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>Trigger Multi-Agent Run</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={resetAgentRun}
              disabled={isSimulating}
              className="p-3 rounded-2xl border border-navy-800 text-slate-400 hover:text-white hover:bg-navy-800/80 transition-colors"
              title="Reset Agent State"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* Backend Error Alert if any */}
        {backendError && (
          <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-800/80 flex items-start gap-3 text-xs text-rose-300">
            <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold text-rose-200">Backend Communication Notice:</span>
              <p className="text-rose-300/90">{backendError}</p>
            </div>
          </div>
        )}

        {/* Multi-Agent Summary Banner */}
        {agentState.summary && (
          <div className="p-4 rounded-2xl bg-violet-950/40 border border-violet-800/60 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-violet-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="text-xs font-bold text-violet-300 uppercase tracking-wider">
                Consensus Summary
              </span>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                {agentState.summary}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Three.js 3D Visualizer Canvas (Preserved with dynamic backend event animations) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-2">
          <h3 className="font-bold text-slate-100 text-base flex items-center gap-2">
            <span>3D Neural Nexus</span>
            <span className="text-xs font-normal text-slate-400">
              (Preserved Three.js R3F Scene connected to real backend agent states)
            </span>
          </h3>
          <span className="text-xs font-mono text-electric-400 font-medium">
            Active Focus: {activeAgentId?.toUpperCase() || 'ALL NODES'}
          </span>
        </div>

        <Agent3DScene
          systemState={agentState}
          activeAgentId={activeAgentId}
          onSelectAgent={(id) => setActiveAgentId(id)}
        />
      </div>

      {/* 5 Agent Status Cards Grid */}
      <div className="space-y-3">
        <h3 className="font-bold text-slate-100 text-base px-2">
          Agent Status & Metrics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {(Object.keys(agentState.agents) as AgentType[]).map((agentKey) => (
            <AgentStatusCard
              key={agentKey}
              agent={agentState.agents[agentKey]}
              isActive={activeAgentId === agentKey}
              onSelect={() => setActiveAgentId(agentKey)}
            />
          ))}
        </div>
      </div>

      {/* Real Backend Agent Outputs Panel */}
      {backendOutputs && backendOutputs.recommendations && (
        <div className="bg-navy-900/80 backdrop-blur-md rounded-3xl border border-navy-800 p-6 shadow-card space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Server className="w-5 h-5 text-violet-400" />
              <h3 className="font-bold text-slate-100 text-base">
                Real LangGraph Backend Outputs & Evaluated Recommendations
              </h3>
            </div>
            <span className="text-xs font-mono text-emerald-400 font-semibold bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-800/80 self-start sm:self-auto">
              Execution Complete ({backendOutputs.recommendations.length} Products Evaluated)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {backendOutputs.recommendations.slice(0, 4).map((item: any, idx: number) => {
              const inComp = isInComparison(item.id);
              return (
                <div
                  key={item.id}
                  className="p-5 rounded-2xl bg-navy-950/70 border border-navy-800 flex flex-col justify-between space-y-4 hover:border-violet-500/40 transition-colors shadow-sm"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs font-bold text-violet-400 uppercase tracking-wider">
                        Rank #{idx + 1} &bull; {item.brand}
                      </span>
                      <VerificationBadge
                        status={item.verificationStatus || 'VERIFIED'}
                        score={item.verificationScore || 90}
                        size="sm"
                      />
                    </div>

                    <h4 className="font-semibold text-slate-100 text-sm line-clamp-2 leading-snug">
                      {item.title}
                    </h4>

                    {item.suitabilityReason && (
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {item.suitabilityReason}
                      </p>
                    )}

                    {/* Key Technical Specs Badges */}
                    {item.specs && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {item.specs.processor && (
                          <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-navy-900 border border-navy-800 text-slate-300">
                            {item.specs.processor}
                          </span>
                        )}
                        {item.specs.ram && (
                          <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-navy-900 border border-navy-800 text-slate-300">
                            {item.specs.ram}
                          </span>
                        )}
                        {item.specs.storage && (
                          <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-navy-900 border border-navy-800 text-slate-300">
                            {item.specs.storage}
                          </span>
                        )}
                        {item.specs.gpu && (
                          <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-navy-900 border border-navy-800 text-slate-300">
                            {item.specs.gpu}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="space-y-3 pt-3 border-t border-navy-800/80">
                    <div className="flex justify-between items-baseline text-xs">
                      <span className="font-mono font-bold text-slate-100 text-lg">
                        ₹{item.price?.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[11px] text-slate-500 truncate max-w-[180px]">
                        Seller: {item.seller?.name || 'Verified Merchant'}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          selectProductForReview(item);
                          navigate('/approval');
                        }}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-xl transition-all shadow-sm"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Inspect Evidence</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => toggleComparison(item)}
                        className={`flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl border transition-colors ${
                          inComp
                            ? 'bg-electric-500/20 text-electric-300 border-electric-500/50 hover:bg-electric-500/30'
                            : 'bg-navy-900 text-slate-300 border-navy-700 hover:border-slate-500 hover:text-white'
                        }`}
                        title={inComp ? 'Remove from Comparison' : 'Add to Comparison'}
                      >
                        {inComp ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-electric-400" />
                            <span>In Comparison</span>
                          </>
                        ) : (
                          <>
                            <Scale className="w-3.5 h-3.5" />
                            <span>Compare</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Real-time Activity Log Terminal */}
      <div className="space-y-3">
        <h3 className="font-bold text-slate-100 text-base px-2">
          Live Evidence & Verification Logs
        </h3>
        <AgentActivityLog
          systemState={agentState}
          activeAgentId={activeAgentId}
          onFilterAgent={(id) => setActiveAgentId(id)}
        />
      </div>
    </div>
  );
};
