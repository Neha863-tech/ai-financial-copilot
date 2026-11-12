import React, { useState } from 'react';
import { Terminal, ExternalLink } from 'lucide-react';
export const AgentActivityLog = ({ systemState, activeAgentId, onFilterAgent, }) => {
    const [levelFilter, setLevelFilter] = useState('all');
    // Consolidate logs from all agents or filtered agent
    const allLogs = Object.values(systemState.agents)
        .flatMap((a) => a.logs)
        .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
    const filteredLogs = allLogs.filter((log) => {
        if (activeAgentId && log.agentId !== activeAgentId)
            return false;
        if (levelFilter !== 'all' && log.level !== levelFilter)
            return false;
        return true;
    });
    const getLevelBadge = (level) => {
        switch (level) {
            case 'success':
                return (<span className="flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800/80 px-2 py-0.5 rounded">
            SUCCESS
          </span>);
            case 'warn':
                return (<span className="flex items-center gap-1 text-[10px] font-mono font-bold text-amber-300 bg-amber-950/80 border border-amber-800/80 px-2 py-0.5 rounded">
            WARNING
          </span>);
            case 'error':
                return (<span className="flex items-center gap-1 text-[10px] font-mono font-bold text-rose-300 bg-rose-950/80 border border-rose-800/80 px-2 py-0.5 rounded">
            DISCREPANCY
          </span>);
            default:
                return (<span className="flex items-center gap-1 text-[10px] font-mono font-bold text-electric-300 bg-electric-950/80 border border-electric-800/80 px-2 py-0.5 rounded">
            INFO
          </span>);
        }
    };
    return (<div className="bg-navy-950 rounded-3xl border border-navy-800 text-slate-200 overflow-hidden shadow-2xl">
      {/* Terminal Title Bar */}
      <div className="bg-navy-900/90 border-b border-navy-800 px-5 py-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 mr-2">
            <span className="w-3 h-3 rounded-full bg-rose-500/80"/>
            <span className="w-3 h-3 rounded-full bg-amber-500/80"/>
            <span className="w-3 h-3 rounded-full bg-emerald-500/80"/>
          </div>
          <Terminal className="w-4 h-4 text-violet-400"/>
          <span className="font-mono text-xs font-semibold text-slate-200">
            Multi-Agent Audit Trail & Execution Stream
          </span>
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Agent Filter Pills */}
          <div className="flex items-center gap-1 bg-navy-950 p-1 rounded-xl border border-navy-800 text-[11px]">
            <button onClick={() => onFilterAgent(null)} className={`px-2 py-0.5 rounded-lg transition-colors ${activeAgentId === null
            ? 'bg-violet-600 text-white font-medium'
            : 'text-slate-400 hover:text-white'}`}>
              All Agents
            </button>
            {['research', 'comparison', 'verification', 'budget', 'recommendation'].map((type) => (<button key={type} onClick={() => onFilterAgent(type)} className={`px-2 py-0.5 rounded-lg capitalize transition-colors ${activeAgentId === type
                ? 'bg-violet-600 text-white font-medium'
                : 'text-slate-400 hover:text-white'}`}>
                {type}
              </button>))}
          </div>

          {/* Level Filter */}
          <select value={levelFilter} onChange={(e) => setLevelFilter(e.target.value)} className="bg-navy-950 text-slate-300 text-[11px] font-mono border border-navy-800 rounded-lg px-2 py-1 focus:outline-none">
            <option value="all">All Levels</option>
            <option value="info">Info only</option>
            <option value="success">Success only</option>
            <option value="warn">Warnings only</option>
            <option value="error">Discrepancies only</option>
          </select>
        </div>
      </div>

      {/* Log Feed */}
      <div className="p-4 sm:p-5 max-h-[380px] overflow-y-auto font-mono text-xs space-y-3 custom-scrollbar">
        {filteredLogs.length > 0 ? (filteredLogs.map((log) => (<div key={log.id} className="p-3 rounded-xl bg-navy-900/60 border border-navy-800/80 hover:border-navy-700 transition-colors space-y-1.5">
              <div className="flex items-center justify-between gap-2 flex-wrap text-[11px]">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 font-mono">[{log.timestamp}]</span>
                  <span className="text-violet-400 font-bold uppercase tracking-wider text-[10px]">
                    @{log.agentId}
                  </span>
                  {getLevelBadge(log.level)}
                </div>

                {log.sourceUrl && (<a href={log.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[11px] text-electric-400 hover:underline">
                    <span>View Evidence Source</span>
                    <ExternalLink className="w-3 h-3"/>
                  </a>)}
              </div>

              <p className="text-slate-200 text-xs leading-relaxed font-sans">
                {log.message}
              </p>

              {log.evidenceSnippet && (<div className="bg-navy-950/90 rounded-lg p-2 border border-navy-800 text-[11px] text-slate-400 font-mono">
                  <span className="text-violet-400 font-bold mr-1">&gt;</span>
                  {log.evidenceSnippet}
                </div>)}
            </div>))) : (<div className="p-8 text-center text-slate-500 font-sans text-xs">
            No activity logs match the selected filter criteria.
          </div>)}
      </div>
    </div>);
};
