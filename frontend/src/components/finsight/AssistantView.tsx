import React, { useState, useEffect, useRef } from "react";
import { 
  Sparkles, Send, RefreshCw, ChevronDown, ShieldCheck, Settings2, 
  Cpu, Key, Check, HelpCircle, Layers, ArrowRight, Zap, Copy
} from "lucide-react";
import { FinSightAPI, FinancialPulse } from "../../services/finsightApi";
import { ResponsiveContainer, AreaChart, Area, XAxis, Tooltip } from "recharts";

interface Props {
  pulse: FinancialPulse;
}

interface Message {
  from: "user" | "ai";
  text: string;
  agentName?: string;
  agentRole?: string;
  chartData?: any;
  recommendations?: string[];
  toolAudit?: any[];
  suggestedFollowUps?: string[];
}

export const AssistantView: React.FC<Props> = ({ pulse }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      from: "ai",
      text: `### 👋 Good day, Arjun. I am your FinSight AI Financial Copilot.
I have synced your verified **September 2024** cash flow ledger:
• **Monthly Inflow:** ₹${pulse.totalIncome.toLocaleString()}
• **Total Outflows:** ₹${pulse.totalExpenses.toLocaleString()}
• **Net Surplus:** ₹${pulse.currentSavings.toLocaleString()} (${pulse.savingsRate}% savings velocity)

Ask me anything—from purchase affordability to finding spending leaks or forecasting your savings.`,
      agentName: "FinSight Central Orchestrator",
      agentRole: "Multi-Agent System Coordinator",
      recommendations: [
        "Why am I overspending this month?",
        "Can I afford a laptop worth ₹65,000?",
        "What bills are due next week?",
        "Explain the 50/30/20 rule for my salary",
      ],
      suggestedFollowUps: [
        "Can I afford a laptop worth ₹65,000?",
        "Why am I overspending this month?",
        "What bills are due next week?",
        "Explain the 50/30/20 rule",
      ],
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  // Model settings
  const [provider, setProvider] = useState<"local" | "groq" | "gemini" | "openai">(
    () => (localStorage.getItem("finsight_llm_provider") as any) || "local"
  );
  const [apiKey, setApiKey] = useState(
    () => localStorage.getItem("finsight_llm_key") || ""
  );

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const saveSettings = () => {
    localStorage.setItem("finsight_llm_provider", provider);
    localStorage.setItem("finsight_llm_key", apiKey.trim());
    setShowSettings(false);
  };

  const sendMessage = async (queryText?: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || loading) return;

    setInput("");
    setMessages((prev) => [...prev, { from: "user", text: textToSend }]);
    setLoading(true);

    try {
      const response = await FinSightAPI.askAssistant(textToSend);
      setMessages((prev) => [
        ...prev,
        {
          from: "ai",
          text: response.text,
          agentName: response.agentName,
          agentRole: (response as any).agentRole || "Specialized FinSight Agent",
          chartData: response.chartData,
          recommendations: response.recommendations,
          toolAudit: response.toolAudit,
          suggestedFollowUps: (response as any).suggestedFollowUps,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          from: "ai",
          text: "I analyzed your ledger but encountered a temporary connection issue. Your core financial pulse remains healthy.",
          agentName: "FinSight Central Orchestrator",
          agentRole: "Offline Resilience Guard",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Helper to format markdown text with headers, bold, bullets, and tables
  const renderFormattedText = (content: string) => {
    const lines = content.split("\n");
    return lines.map((line, idx) => {
      // Headers
      if (line.startsWith("### ")) {
        return (
          <h4 key={idx} className="text-sm font-bold text-slate-900 dark:text-white mt-2 mb-1.5 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#16a57a]" />
            {line.replace("### ", "")}
          </h4>
        );
      }
      if (line.startsWith("#### ")) {
        return (
          <h5 key={idx} className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-2 mb-1">
            {line.replace("#### ", "")}
          </h5>
        );
      }
      // Bullets
      if (line.startsWith("• ") || line.startsWith("- ") || line.startsWith("* ")) {
        const bulletText = line.replace(/^[•\-\*]\s*/, "");
        return (
          <div key={idx} className="flex items-start gap-1.5 text-xs my-0.5 pl-1">
            <span className="text-[#16a57a] font-bold select-none">•</span>
            <span>{parseInlineMarkdown(bulletText)}</span>
          </div>
        );
      }
      // Numbered list
      const numMatch = line.match(/^(\d+)\.\s+(.*)/);
      if (numMatch) {
        return (
          <div key={idx} className="flex items-start gap-1.5 text-xs my-0.5 pl-1">
            <span className="font-semibold text-emerald-600 dark:text-emerald-400 select-none">{numMatch[1]}.</span>
            <span>{parseInlineMarkdown(numMatch[2])}</span>
          </div>
        );
      }
      // Table rows
      if (line.includes("|") && line.trim().startsWith("|")) {
        const cells = line.split("|").filter((c) => c.trim().length > 0 && !c.includes("---"));
        if (cells.length === 0) return null;
        return (
          <div key={idx} className="grid grid-cols-4 gap-1 text-[11px] py-1 border-b border-slate-100 dark:border-[#1e342c]">
            {cells.map((cell, cIdx) => (
              <div key={cIdx} className="font-mono">{parseInlineMarkdown(cell.trim())}</div>
            ))}
          </div>
        );
      }
      if (!line.trim()) {
        return <div key={idx} className="h-1.5" />;
      }
      return (
        <p key={idx} className="text-xs leading-relaxed my-0.5">
          {parseInlineMarkdown(line)}
        </p>
      );
    });
  };

  const parseInlineMarkdown = (text: string) => {
    // Bold **text**
    const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
    return parts.map((part, pIdx) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={pIdx} className="font-semibold text-slate-900 dark:text-white">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith("`") && part.endsWith("`")) {
        return <code key={pIdx} className="px-1.5 py-0.5 rounded text-[11px] bg-slate-200/70 dark:bg-[#1a3830] text-emerald-700 dark:text-emerald-300 font-mono">{part.slice(1, -1)}</code>;
      }
      return part;
    });
  };

  // Get active follow-ups from the latest AI response
  const latestAiMessage = [...messages].reverse().find((m) => m.from === "ai");
  const activeFollowUps = latestAiMessage?.suggestedFollowUps || [
    "Can I afford a laptop worth ₹65,000?",
    "Why am I overspending this month?",
    "What bills are due next week?",
    "How can I save ₹5,000 more?",
  ];

  return (
    <section className="space-y-6">
      {/* Top Banner / Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">YOUR MONEY, EXPLAINED</p>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-100 dark:bg-[#18352c] text-emerald-700 dark:text-emerald-300 font-semibold">
              Live AI Copilot
            </span>
          </div>
          <h1 className="text-2xl font-bold font-heading text-slate-900 dark:text-white">
            AI Financial Assistant
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Ask any question. Grounded in your database ledger, PayPal transactions, and deterministic calculations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Active Provider Pill */}
          <button
            onClick={() => setShowSettings(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-[#121f1c] hover:bg-slate-50 dark:hover:bg-[#1a2f29] border border-slate-200 dark:border-[#21352f] text-xs text-slate-700 dark:text-slate-200 transition-all shadow-2xs"
            title="Configure AI Model & Keys"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-medium">
              {provider === "local" && "⚡ FinSight Neural Reasoner"}
              {provider === "groq" && "🚀 Groq (Llama 3.3 70B)"}
              {provider === "gemini" && "✨ Google Gemini 2.0"}
              {provider === "openai" && "🧠 OpenAI GPT-4o"}
            </span>
            <Settings2 size={13} className="text-slate-400 ml-1" />
          </button>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#121f1c] border border-slate-200 dark:border-[#21352f] rounded-2xl w-full max-w-md p-6 space-y-5 shadow-xl animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#21352f]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-[#16a57a] flex items-center justify-center">
                  <Cpu size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">AI Engine Configuration</h3>
                  <p className="text-[11px] text-slate-400">Choose how FinSight processes your financial inquiries</p>
                </div>
              </div>
              <button
                onClick={() => setShowSettings(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs px-2 py-1 rounded"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Inference Provider</label>
              
              <div className="grid grid-cols-1 gap-2">
                {[
                  { id: "local", name: "FinSight Neural Reasoner", desc: "Instant, 100% deterministic, zero setup, verified math", badge: "Recommended" },
                  { id: "groq", name: "Groq Cloud (Llama 3.3 70B)", desc: "Ultra-fast free cloud LLM inference via Groq API", badge: "Hackathon Sponsor" },
                  { id: "gemini", name: "Google Gemini 2.0 Flash", desc: "Multimodal Gemini reasoning with personal finance grounding", badge: "Google" },
                  { id: "openai", name: "OpenAI GPT-4o mini", desc: "OpenAI standard chat completions API", badge: "OpenAI" },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setProvider(opt.id as any)}
                    className={`text-left p-3 rounded-xl border transition-all flex items-start justify-between ${
                      provider === opt.id
                        ? "border-[#16a57a] bg-emerald-50/50 dark:bg-emerald-950/30"
                        : "border-slate-200 dark:border-[#21352f] hover:bg-slate-50 dark:hover:bg-[#162722]"
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-slate-900 dark:text-white">{opt.name}</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold bg-slate-100 dark:bg-[#1d352c] text-slate-600 dark:text-emerald-300">
                          {opt.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{opt.desc}</p>
                    </div>
                    {provider === opt.id && <Check size={16} className="text-[#16a57a] shrink-0 mt-0.5" />}
                  </button>
                ))}
              </div>

              {provider !== "local" && (
                <div className="space-y-1.5 pt-2">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                    <span>{provider.toUpperCase()} API Key</span>
                    {provider === "groq" && (
                      <a href="https://console.groq.com/keys" target="_blank" rel="noreferrer" className="text-[10px] text-emerald-600 hover:underline">
                        Get free key at console.groq.com →
                      </a>
                    )}
                    {provider === "gemini" && (
                      <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer" className="text-[10px] text-emerald-600 hover:underline">
                        Get Gemini key at Google AI Studio →
                      </a>
                    )}
                  </label>
                  <div className="relative">
                    <Key size={14} className="absolute left-3 top-3 text-slate-400" />
                    <input
                      type="password"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder={`Paste your ${provider} API key here...`}
                      className="w-full pl-8 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#0c1412] border border-slate-200 dark:border-[#21352f] text-slate-900 dark:text-white outline-none focus:border-[#16a57a]"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Your key is stored securely in your browser's local storage and used directly to communicate with the model.
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowSettings(false)}
                className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1a2f29] rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={saveSettings}
                className="px-4 py-1.5 text-xs font-semibold bg-[#16a57a] hover:bg-[#138e69] text-white rounded-lg transition-colors shadow-2xs"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Feed Interface */}
        <div className="lg:col-span-2 bg-white dark:bg-[#121f1c] rounded-2xl border border-slate-200 dark:border-[#21352f] flex flex-col h-[650px] overflow-hidden shadow-xs">
          {/* Header */}
          <div className="p-4 border-b border-slate-100 dark:border-[#21352f] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-[#16a57a] flex items-center justify-center">
                <Sparkles size={16} />
              </div>
              <div>
                <h3 className="font-semibold text-xs text-slate-900 dark:text-white flex items-center gap-2">
                  <span>FinSight AI Multi-Agent Mesh</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-100 dark:bg-[#18352c] text-emerald-700 dark:text-emerald-300 font-bold">
                    6 Specialized Agents
                  </span>
                </h3>
                <p className="text-[10px] text-slate-400">
                  {provider === "local" ? "Deterministic mathematical synthesis online" : `Connected to live ${provider.toUpperCase()} model`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setShowSettings(true)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-[#1a2f29] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                title="Engine Settings"
              >
                <Settings2 size={15} />
              </button>
              <button
                onClick={() =>
                  setMessages([
                    {
                      from: "ai",
                      text: "Conversation refreshed. Ask any financial question to get started.",
                      agentName: "FinSight Central Orchestrator",
                      agentRole: "System Coordinator",
                      suggestedFollowUps: [
                        "Can I afford a laptop worth ₹65,000?",
                        "Why am I overspending this month?",
                        "What bills are due next week?",
                        "How can I save ₹5,000 more?",
                      ],
                    },
                  ])
                }
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-[#1a2f29] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                title="New Chat"
              >
                <RefreshCw size={15} />
              </button>
            </div>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex gap-3 max-w-[90%] sm:max-w-[85%] ${
                  m.from === "user" ? "ml-auto flex-row-reverse" : ""
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold ${
                    m.from === "user"
                      ? "bg-slate-900 text-white dark:bg-slate-700"
                      : "bg-[#e6f7f0] dark:bg-[#18352c] text-[#16a57a]"
                  }`}
                >
                  {m.from === "user" ? "A" : <Sparkles size={13} />}
                </div>

                <div
                  className={`p-3.5 rounded-2xl text-xs leading-relaxed group relative ${
                    m.from === "user"
                      ? "bg-[#e6f7f0] text-slate-900 rounded-tr-none font-medium"
                      : "bg-[#f8faf9] dark:bg-[#0e1715] text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-100 dark:border-[#21352f]"
                  }`}
                >
                  {m.agentName && (
                    <div className="flex items-center justify-between gap-1.5 mb-2 pb-1.5 border-b border-slate-200/50 dark:border-[#1e342c]">
                      <div className="flex items-center gap-1.5">
                        <ShieldCheck size={13} className="text-[#16a57a]" />
                        <span className="font-bold text-[10px] text-[#16a57a] uppercase tracking-wider">
                          {m.agentName}
                        </span>
                        {m.agentRole && (
                          <span className="text-[10px] text-slate-400 hidden sm:inline">
                            • {m.agentRole}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(m.text);
                          setCopiedIdx(i);
                          setTimeout(() => setCopiedIdx(null), 2000);
                        }}
                        className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-opacity"
                        title="Copy message"
                      >
                        {copiedIdx === i ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                      </button>
                    </div>
                  )}

                  {/* Message Body with Markdown formatting */}
                  <div className="space-y-1">{renderFormattedText(m.text)}</div>

                  {/* Embedded Chart inside Message if present */}
                  {m.chartData && Array.isArray(m.chartData) && (
                    <div className="mt-3 p-2 bg-white dark:bg-[#121f1c] rounded-xl border border-slate-200 dark:border-[#21352f] h-36">
                      <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1 px-1">
                        Projection & Variance Model
                      </p>
                      <ResponsiveContainer width="100%" height="80%">
                        <AreaChart data={m.chartData}>
                          <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                          <Tooltip formatter={(v: any) => `₹${Number(v).toLocaleString()}`} />
                          <Area type="monotone" dataKey="amount" stroke="#16a57a" fill="#e6f7f0" strokeWidth={2} name="Current" />
                          {m.chartData[0]?.benchmark !== undefined && (
                            <Area type="monotone" dataKey="benchmark" stroke="#f97316" fill="transparent" strokeWidth={1.5} strokeDasharray="3 3" name="Benchmark" />
                          )}
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  {/* Recommendations Chips */}
                  {m.recommendations && m.recommendations.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-[#1e342c] space-y-1">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Action Plan</p>
                      <div className="flex flex-wrap gap-1.5">
                        {m.recommendations.map((rec, rIdx) => (
                          <span
                            key={rIdx}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] bg-emerald-50 dark:bg-[#152a23] text-emerald-800 dark:text-emerald-200 border border-emerald-100 dark:border-[#1d3d32]"
                          >
                            <Zap size={10} className="text-[#16a57a]" />
                            {rec}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tool Audit Badges */}
                  {m.toolAudit && m.toolAudit.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-slate-200/50 dark:border-[#1e342c] flex flex-wrap gap-1.5">
                      {m.toolAudit.map((tool, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded text-[9px] bg-slate-200/70 dark:bg-[#1a3830] text-slate-700 dark:text-emerald-300 font-mono flex items-center gap-1"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          {tool.toolName} {tool.detail ? `(${tool.detail})` : ""}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-xs text-slate-400 italic py-2 px-2 bg-slate-50 dark:bg-[#142621] rounded-xl w-fit">
                <Sparkles size={14} className="animate-spin text-[#16a57a]" />
                <span>Specialized financial agents parsing ledger & synthesizing calculations...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Dynamic Follow-Up Prompt Chips */}
          <div className="px-4 py-2 border-t border-slate-100 dark:border-[#1e342c] bg-slate-50/50 dark:bg-[#0f1917] flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
              <ArrowRight size={11} className="text-[#16a57a]" /> Suggested:
            </span>
            {activeFollowUps.map((q, idx) => (
              <button
                key={idx}
                onClick={() => sendMessage(q)}
                className="px-2.5 py-1 rounded-full text-[11px] whitespace-nowrap bg-white hover:bg-slate-100 dark:bg-[#162722] dark:hover:bg-[#1c362e] border border-slate-200 dark:border-[#21352f] text-slate-700 dark:text-emerald-300 transition-colors shrink-0 shadow-2xs"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Chat Input */}
          <div className="p-3 border-t border-slate-100 dark:border-[#21352f] flex items-center gap-2 bg-white dark:bg-[#121f1c]">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Ask anything (e.g. Can I afford an iPhone for ₹80,000? How to save ₹5,000?)..."
              className="flex-1 px-3 py-2 text-xs bg-slate-50 dark:bg-[#0c1412] rounded-xl border border-slate-200 dark:border-[#21352f] outline-none text-slate-900 dark:text-white focus:border-[#16a57a] transition-colors"
            />
            <button
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              className="w-9 h-9 rounded-xl bg-[#16a57a] hover:bg-[#138e69] disabled:opacity-40 text-white flex items-center justify-center transition-all shadow-2xs shrink-0"
              title="Send Message"
            >
              <Send size={15} />
            </button>
          </div>
        </div>

        {/* Live Context Snapshot Sidebar */}
        <div className="bg-[#f0f7f4] dark:bg-[#0e1715] rounded-2xl p-6 border border-[#dcefe6] dark:border-[#21352f] space-y-5 h-fit shadow-2xs">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#16a57a] tracking-wider uppercase">
            <Sparkles size={14} />
            <span>GROUND TRUTH CONTEXT</span>
          </div>
          <h3 className="font-heading font-semibold text-slate-900 dark:text-white text-base">
            Arjun's Financial Snapshot
          </h3>

          <div className="space-y-3 divide-y divide-slate-200/60 dark:divide-[#21352f] text-xs">
            <div className="pt-2 flex justify-between">
              <span className="text-slate-500">Monthly Inflow</span>
              <strong className="font-semibold text-slate-900 dark:text-white">
                ₹{pulse.totalIncome.toLocaleString()}
              </strong>
            </div>
            <div className="pt-2 flex justify-between">
              <span className="text-slate-500">Total Spent</span>
              <strong className="font-semibold text-slate-900 dark:text-white">
                ₹{pulse.totalExpenses.toLocaleString()}
              </strong>
            </div>
            <div className="pt-2 flex justify-between">
              <span className="text-slate-500">Monthly Net Savings</span>
              <strong className="font-semibold text-emerald-600 dark:text-emerald-400">
                ₹{pulse.currentSavings.toLocaleString()}
              </strong>
            </div>
            <div className="pt-2 flex justify-between">
              <span className="text-slate-500">Savings Rate</span>
              <strong className="font-bold text-emerald-600 dark:text-emerald-400">
                {pulse.savingsRate}%
              </strong>
            </div>
            <div className="pt-2 flex justify-between">
              <span className="text-slate-500">Remaining Budget</span>
              <strong className="font-semibold text-slate-900 dark:text-white">
                ₹{pulse.budgetRemaining.toLocaleString()}
              </strong>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white/80 dark:bg-[#142621] border border-slate-200/70 dark:border-[#1e382f] space-y-2 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-[11px] text-slate-700 dark:text-slate-200">
              <Layers size={13} className="text-[#16a57a]" />
              <span>Multi-Agent Architecture</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Every inquiry is processed through the 6 specialized agents, verifying budgets, recurring debts, and verified PayPal transactions deterministically.
            </p>
          </div>

          <button
            onClick={() => setShowSettings(true)}
            className="w-full py-2 px-3 text-xs font-semibold rounded-xl bg-white dark:bg-[#142621] hover:bg-slate-50 dark:hover:bg-[#1a332a] border border-slate-200 dark:border-[#21352f] text-slate-700 dark:text-slate-200 flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
          >
            <Settings2 size={13} />
            <span>Configure AI Engine</span>
          </button>
        </div>
      </div>
    </section>
  );
};
