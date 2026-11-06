import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { MultiAgentSystemState, AgentType, AgentLogEntry } from '../types/agent';
import { INITIAL_MULTI_AGENT_STATE } from '../data/demoAgents';
import { runAgentAnalysis, getAgentRunStatus, checkBackendHealth, API_BASE_URL } from '../services/api';

interface AgentContextType {
  agentState: MultiAgentSystemState;
  activeAgentId: AgentType | null;
  setActiveAgentId: (id: AgentType | null) => void;
  isSimulating: boolean;
  triggerAgentRun: (query?: string) => Promise<void>;
  resetAgentRun: () => void;
  addAgentLog: (agentId: AgentType, log: Omit<AgentLogEntry, 'id' | 'timestamp' | 'agentId'>) => void;
  backendError: string | null;
  backendOutputs: any | null;
  groqConfigured: boolean;
  engineLabel: string;
}

const AgentContext = createContext<AgentContextType | undefined>(undefined);

export const AgentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [agentState, setAgentState] = useState<MultiAgentSystemState>(INITIAL_MULTI_AGENT_STATE);
  const [activeAgentId, setActiveAgentId] = useState<AgentType | null>('verification');
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [backendError, setBackendError] = useState<string | null>(null);
  const [backendOutputs, setBackendOutputs] = useState<any | null>(null);
  const [groqConfigured, setGroqConfigured] = useState<boolean>(false);
  const [engineLabel, setEngineLabel] = useState<string>('Deterministic Fallback (Offline NLP)');

  // Check backend engine readiness on mount
  useEffect(() => {
    checkBackendHealth().then((health) => {
      if (health.alive) {
        setGroqConfigured(Boolean(health.groqConfigured));
        setEngineLabel(
          health.groqConfigured
            ? 'Groq AI (llama-3.3-70b-versatile)'
            : 'Deterministic Fallback (Offline NLP)'
        );
      }
    });
  }, []);

  const addAgentLog = useCallback(
    (agentId: AgentType, log: Omit<AgentLogEntry, 'id' | 'timestamp' | 'agentId'>) => {
      const now = new Date();
      const timeStr = `${now.toTimeString().split(' ')[0]}.${String(now.getMilliseconds()).padStart(3, '0')}`;
      const newEntry: AgentLogEntry = {
        id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        timestamp: timeStr,
        agentId,
        ...log,
      };

      setAgentState((prev) => ({
        ...prev,
        agents: {
          ...prev.agents,
          [agentId]: {
            ...prev.agents[agentId],
            logs: [newEntry, ...prev.agents[agentId].logs],
          },
        },
      }));
    },
    []
  );

  const resetAgentRun = useCallback(() => {
    setAgentState(INITIAL_MULTI_AGENT_STATE);
    setIsSimulating(false);
    setBackendError(null);
    setBackendOutputs(null);
  }, []);

  const triggerAgentRun = useCallback(async (customQuery?: string) => {
    const query = customQuery || agentState.currentQuery || 'Find a laptop under ₹60,000 for machine learning with 16GB RAM';
    setIsSimulating(true);
    setBackendError(null);

    try {
      // 1. Try real FastAPI backend first
      const backendRes = await runAgentAnalysis({ query });

      if (backendRes.isFromBackend) {
        const runId = backendRes.runId;
        const resState = (backendRes as any).state || {};
        if (resState.engine) setEngineLabel(resState.engine);
        if (resState.groqConfigured !== undefined) setGroqConfigured(Boolean(resState.groqConfigured));

        setAgentState((prev) => ({
          ...prev,
          runId,
          status: 'running',
          currentQuery: query,
          startTime: new Date().toISOString(),
          isSimulatedDemo: false,
          summary: `[${resState.engine || engineLabel}] LangGraph workflow dispatched. Streaming agent events...`,
        }));

        // Connect live Server-Sent Events (SSE) stream
        let streamDone = false;
        try {
          if (typeof window !== 'undefined' && 'EventSource' in window) {
            const eventSource = new EventSource(`${API_BASE_URL}/api/agent/${runId}/events`);

            eventSource.onmessage = (event) => {
              try {
                if (streamDone) return;
                const run = JSON.parse(event.data);
                if (run.error) {
                  setBackendError(run.error);
                }
                if (run.engine) setEngineLabel(run.engine);
                if (run.groqConfigured !== undefined) setGroqConfigured(Boolean(run.groqConfigured));

                // Determine active running agent for 3D visual camera focus
                let activeId: AgentType | null = null;
                for (const key of ['research', 'comparison', 'verification', 'budget', 'recommendation'] as AgentType[]) {
                  if (run.agents && run.agents[key] && run.agents[key].status === 'running') {
                    activeId = key;
                    break;
                  }
                }
                if (activeId) {
                  setActiveAgentId(activeId);
                }

                setAgentState((prev) => ({
                  ...prev,
                  status: run.status,
                  summary: run.summary || prev.summary,
                  overallConfidence: run.confidence || prev.overallConfidence,
                  isSimulatedDemo: false,
                  agents: {
                    research: {
                      ...prev.agents.research,
                      ...(run.agents?.research || {}),
                    },
                    comparison: {
                      ...prev.agents.comparison,
                      ...(run.agents?.comparison || {}),
                    },
                    verification: {
                      ...prev.agents.verification,
                      ...(run.agents?.verification || {}),
                    },
                    budget: {
                      ...prev.agents.budget,
                      ...(run.agents?.budget || {}),
                    },
                    recommendation: {
                      ...prev.agents.recommendation,
                      ...(run.agents?.recommendation || {}),
                    },
                  },
                }));

                if (run.status === 'completed' || run.status === 'failed') {
                  streamDone = true;
                  eventSource.close();
                  setIsSimulating(false);
                  if (run.recommendations) {
                    setBackendOutputs(run);
                  }
                }
              } catch (parseErr) {
                console.error('Error parsing SSE event:', parseErr);
              }
            };

            eventSource.onerror = async () => {
              if (streamDone) return;
              eventSource.close();
              await pollBackendFallback(runId);
            };

            return;
          }
        } catch (sseErr) {
          console.warn('SSE stream failed, falling back to REST polling:', sseErr);
        }

        // Direct Polling Fallback
        await pollBackendFallback(runId);
        return;
      } else {
        const errorMsg = 'FastAPI backend is offline on port 8000. Start backend with "uvicorn app.main:app --port 8000 --reload" to run real LangGraph multi-agent execution.';
        setBackendError(errorMsg);
        setAgentState((prev) => ({
          ...prev,
          status: 'failed',
          currentQuery: query,
          summary: errorMsg,
          isSimulatedDemo: false,
        }));
        setIsSimulating(false);
        return;
      }
    } catch (err: any) {
      const errorMsg = err.message || 'FastAPI backend connection error on port 8000. Start backend to view live LangGraph execution.';
      console.warn('FastAPI backend error:', err);
      setBackendError(errorMsg);
      setAgentState((prev) => {
        const updatedAgents = { ...prev.agents };
        for (const k of ['research', 'comparison', 'verification', 'budget', 'recommendation'] as AgentType[]) {
          if (updatedAgents[k]?.status === 'running') {
            updatedAgents[k] = { ...updatedAgents[k], status: 'failed', currentTask: 'Backend connection error.' };
          }
        }
        return {
          ...prev,
          status: 'failed',
          currentQuery: query,
          summary: errorMsg,
          isSimulatedDemo: false,
          agents: updatedAgents,
        };
      });
      setIsSimulating(false);
      return;
    }
  }, [agentState.currentQuery, engineLabel]);

  const pollBackendFallback = async (runId: string) => {
    let isDone = false;
    let pollCount = 0;
    const maxPolls = 60; // 24 seconds max

    while (!isDone && pollCount < maxPolls) {
      await new Promise((r) => setTimeout(r, 400));
      pollCount++;

      const pollRes = await getAgentRunStatus(runId);
      if (pollRes.isFromBackend && pollRes.run) {
        const run = pollRes.run as any;
        if (run.engine) setEngineLabel(run.engine);
        if (run.groqConfigured !== undefined) setGroqConfigured(Boolean(run.groqConfigured));

        let activeId: AgentType | null = null;
        for (const key of ['research', 'comparison', 'verification', 'budget', 'recommendation'] as AgentType[]) {
          if (run.agents && run.agents[key] && run.agents[key].status === 'running') {
            activeId = key;
            break;
          }
        }
        if (activeId) {
          setActiveAgentId(activeId);
        }

        setAgentState((prev) => ({
          ...prev,
          status: run.status,
          summary: run.summary || prev.summary,
          overallConfidence: run.confidence || prev.overallConfidence,
          isSimulatedDemo: false,
          agents: {
            research: { ...prev.agents.research, ...(run.agents?.research || {}) },
            comparison: { ...prev.agents.comparison, ...(run.agents?.comparison || {}) },
            verification: { ...prev.agents.verification, ...(run.agents?.verification || {}) },
            budget: { ...prev.agents.budget, ...(run.agents?.budget || {}) },
            recommendation: { ...prev.agents.recommendation, ...(run.agents?.recommendation || {}) },
          },
        }));

        if (run.status === 'completed' || run.status === 'failed') {
          isDone = true;
          if (run.recommendations) {
            setBackendOutputs(run);
          }
        }
      }
    }

    if (!isDone) {
      // Ensure no agent node remains stuck in running if polling times out
      setAgentState((prev) => {
        const updatedAgents = { ...prev.agents };
        for (const k of ['research', 'comparison', 'verification', 'budget', 'recommendation'] as AgentType[]) {
          if (updatedAgents[k]?.status === 'running') {
            updatedAgents[k] = { ...updatedAgents[k], status: 'failed', currentTask: 'Execution timed out or disconnected.' };
          }
        }
        return {
          ...prev,
          status: 'failed',
          summary: 'Workflow execution timed out or backend disconnected.',
          agents: updatedAgents,
        };
      });
    }

    setIsSimulating(false);
  };

  return (
    <AgentContext.Provider
      value={{
        agentState,
        activeAgentId,
        setActiveAgentId,
        isSimulating,
        triggerAgentRun,
        resetAgentRun,
        addAgentLog,
        backendError,
        backendOutputs,
        groqConfigured,
        engineLabel,
      }}
    >
      {children}
    </AgentContext.Provider>
  );
};

export function useAgent() {
  const context = useContext(AgentContext);
  if (!context) {
    throw new Error('useAgent must be used within an AgentProvider');
  }
  return context;
}
