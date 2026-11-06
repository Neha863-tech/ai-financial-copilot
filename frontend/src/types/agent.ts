export type AgentType = 'research' | 'comparison' | 'verification' | 'budget' | 'recommendation';

export type AgentStatus = 'idle' | 'running' | 'completed' | 'warning' | 'failed';

export interface AgentLogEntry {
  id: string;
  timestamp: string;
  agentId: AgentType;
  level: 'info' | 'success' | 'warn' | 'error';
  message: string;
  evidenceSnippet?: string;
  sourceUrl?: string;
}

export interface AgentMetrics {
  claimsChecked?: number;
  sourcesScraped?: number;
  discrepanciesFound?: number;
  confidenceScore?: number;
  dataPointsAnalyzed?: number;
  itemsScanned?: number;
  sourcesVerified?: number;
  tradeOffsIdentified?: number;
  costOptimizations?: number;
  synthesizedConsensus?: number;
  [key: string]: any;
}

export interface AgentState {
  id: AgentType;
  name: string;
  role: string;
  description: string;
  status: AgentStatus;
  progress: number; // 0 to 100
  color: string;
  glowColor: string;
  position3D: [number, number, number];
  currentTask?: string;
  metrics: AgentMetrics;
  logs: AgentLogEntry[];
}

export interface MultiAgentSystemState {
  runId: string;
  status: 'idle' | 'running' | 'completed' | 'failed';
  currentQuery: string;
  startTime?: string;
  completedTime?: string;
  activeAgentId: AgentType | null;
  agents: Record<AgentType, AgentState>;
  overallConfidence: number;
  summary: string;
  isSimulatedDemo: boolean;
}

export interface AgentRunResponse {
  run_id: string;
  query: string;
  status: 'running' | 'completed' | 'failed';
  created_at: string;
  agents: Record<AgentType, {
    status: AgentStatus;
    progress: number;
    currentTask?: string;
    metrics: AgentMetrics;
    logs: AgentLogEntry[];
  }>;
  summary?: string;
}
