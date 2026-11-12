import React from 'react';
import {
  Cpu,
  Search,
  Scale,
  ShieldCheck,
  DollarSign,
  Sparkles,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock,
  ArrowRight
} from 'lucide-react';
import { AgentState, AgentType } from '../../types/agent';

interface MetricItem {
  label: string;
  value: string | number;
  highlight?: boolean;
}

interface AgentStatusCardProps {
  agent: AgentState;
  isActive: boolean;
  onSelect: () => void;
}

export const AgentStatusCard: React.FC<AgentStatusCardProps> = ({
  agent,
  isActive,
  onSelect,
}) => {
  const getIcon = (id: AgentType) => {
    switch (id) {
      case 'research':
        return Search;
      case 'comparison':
        return Scale;
      case 'verification':
        return ShieldCheck;
      case 'budget':
        return DollarSign;
      case 'recommendation':
        return Sparkles;
      default:
        return Cpu;
    }
  };

  const Icon = getIcon(agent.id);

  const getStatusBadge = () => {
    switch (agent.status) {
      case 'completed':
        return (
          <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/80 border border-emerald-800/80 px-2 py-0.5 rounded-full">
            <CheckCircle className="w-3 h-3 text-emerald-400" />
            Completed
          </span>
        );
      case 'running':
        return (
          <span className="flex items-center gap-1 text-[11px] font-semibold text-electric-300 bg-electric-950/80 border border-electric-700/80 px-2 py-0.5 rounded-full animate-pulse">
            <Clock className="w-3 h-3 text-electric-400 animate-spin" />
            Analyzing ({agent.progress}%)
          </span>
        );
      case 'warning':
        return (
          <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-300 bg-amber-950/80 border border-amber-800/80 px-2 py-0.5 rounded-full">
            <AlertTriangle className="w-3 h-3 text-amber-400" />
            Discrepancy Found
          </span>
        );
      case 'failed':
        return (
          <span className="flex items-center gap-1 text-[11px] font-semibold text-rose-300 bg-rose-950/80 border border-rose-800/80 px-2 py-0.5 rounded-full">
            <XCircle className="w-3 h-3 text-rose-400" />
            Failed
          </span>
        );
      default:
        return (
          <span className="text-[11px] font-medium text-slate-400 bg-navy-950 border border-navy-800 px-2 py-0.5 rounded-full">
            Idle / Queued
          </span>
        );
    }
  };

  // Agent-specific contextual metrics
  const getAgentMetrics = (): MetricItem[] => {
    switch (agent.id) {
      case 'research':
        return [
          { label: 'Items Scanned', value: agent.metrics?.itemsScanned ?? 4 },
          { label: 'Sources Verified', value: agent.metrics?.sourcesVerified ?? 3 },
        ];
      case 'comparison':
        return [
          { label: 'Trade-offs Found', value: agent.metrics?.tradeOffsIdentified ?? 6 },
          { label: 'Suitability Top', value: 'Lenovo 91%' },
        ];
      case 'verification':
        return [
          { label: 'Claims Audited', value: agent.metrics?.claimsChecked ?? 12 },
          {
            label: 'Discrepancies',
            value: agent.metrics?.discrepanciesFound ?? 0,
            highlight: Boolean(agent.metrics?.discrepanciesFound),
          },
        ];
      case 'budget':
        return [
          { label: 'Optimizations', value: agent.metrics?.costOptimizations ?? 2 },
          { label: 'Tax/GST Status', value: 'Compliant' },
        ];
      case 'recommendation':
        return [
          { label: 'Consensus Score', value: `${agent.metrics?.synthesizedConsensus ?? 94}%` },
          { label: 'Top Margin', value: '+8.2%' },
        ];
      default:
        return [
          { label: 'Claims Audited', value: agent.metrics?.claimsChecked ?? 0 },
          { label: 'Discrepancies', value: agent.metrics?.discrepanciesFound ?? 0 },
        ];
    }
  };

  const metrics = getAgentMetrics();

  return (
    <div
      onClick={onSelect}
      className={`cursor-pointer rounded-2xl p-5 border transition-all duration-300 flex flex-col justify-between backdrop-blur-md ${
        isActive
          ? 'bg-navy-900/95 border-violet-500 ring-2 ring-violet-500/30 shadow-glow text-white'
          : 'bg-navy-900/70 hover:bg-navy-900/90 border-navy-800 hover:border-violet-500/40 text-slate-200 shadow-subtle'
      }`}
    >
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-xs"
              style={{ backgroundColor: agent.color }}
            >
              <Icon className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-slate-100 text-sm">{agent.name}</h4>
              <p className="text-[11px] text-slate-400 font-medium">{agent.role}</p>
            </div>
          </div>
          {getStatusBadge()}
        </div>

        {/* Current Task */}
        <div className="bg-navy-950/70 rounded-xl p-2.5 border border-navy-800/80">
          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Current Focus
          </div>
          <p className="text-xs text-slate-200 font-medium truncate mt-0.5">
            {agent.currentTask || 'Awaiting dispatch'}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] font-mono text-slate-400">
            <span>Execution Progress</span>
            <span>{agent.progress}%</span>
          </div>
          <div className="h-1.5 w-full bg-navy-950 rounded-full overflow-hidden border border-navy-800/60">
            <div
              className="h-full rounded-full transition-all duration-300 shadow-xs"
              style={{
                width: `${agent.progress}%`,
                backgroundColor: agent.color,
              }}
            />
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
          {metrics.map((m, idx) => (
            <div key={idx} className="bg-navy-950/60 p-2 rounded-lg border border-navy-800/80">
              <div className="text-[10px] text-slate-400 truncate">{m.label}</div>
              <div
                className={`font-bold font-mono text-sm ${
                  m.highlight ? 'text-amber-400' : 'text-slate-100'
                }`}
              >
                {m.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-3 mt-2 border-t border-navy-800 flex items-center justify-between text-xs text-violet-400 font-medium group">
        <span>Inspect Agent Logs ({agent.logs.length})</span>
        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
      </div>
    </div>
  );
};
