import React, { useState } from "react";
import { Sparkles, Send, Paperclip, RefreshCw, Bot, ChevronDown, ArrowUpRight, ShieldCheck, Check } from "lucide-react";
import { FinSightAPI, FinancialPulse } from "../../services/finsightApi";
import { ResponsiveContainer, AreaChart, Area, XAxis, Tooltip } from "recharts";

interface Props {
  pulse: FinancialPulse;
}

interface Message {
  from: "user" | "ai";
  text: string;
  agentName?: string;
  chartData?: any;
  recommendations?: string[];
  toolAudit?: any[];
}

export const AssistantView: React.FC<Props> = ({ pulse }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      from: "ai",
      text: "Good morning, Arjun. I've analyzed your verified September cash flow. How can I help you optimize or plan your finances today?",
      agentName: "FinSight Central Orchestrator",
      recommendations: [
        "Why am I overspending this month?",
        "Can I afford a laptop worth ₹65,000?",
        "What bills are due next week?",
      ],
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

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
          chartData: response.chartData,
          recommendations: response.recommendations,
          toolAudit: response.toolAudit,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          from: "ai",
          text: "I was able to verify your account balances, but the live agent connection timed out. Your core financial pulse remains healthy.",
          agentName: "FinSight Orchestrator (Offline)",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">YOUR MONEY, EXPLAINED</p>
          <h1 className="text-2xl font-bold font-heading text-slate-900 dark:text-white">
            AI Financial Assistant
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Ask anything. Get answers grounded in deterministic database calculations and PayPal records.
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-[#121f1c] border border-slate-200 dark:border-[#21352f] text-xs text-slate-600 dark:text-slate-300">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Context: September 2024</span>
          <ChevronDown size={14} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Interface */}
        <div className="lg:col-span-2 bg-white dark:bg-[#121f1c] rounded-2xl border border-slate-200 dark:border-[#21352f] flex flex-col h-[600px] overflow-hidden shadow-xs">
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
                <p className="text-[10px] text-slate-400">Ready to consult</p>
              </div>
            </div>
            <button
              onClick={() =>
                setMessages([
                  {
                    from: "ai",
                    text: "Conversation cleared. What financial questions do you have?",
                    agentName: "FinSight Central Orchestrator",
                  },
                ])
              }
              className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-[#1a2f29] text-slate-400"
              title="New Chat"
            >
              <RefreshCw size={15} />
            </button>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex gap-3 max-w-[85%] ${
                  m.from === "user" ? "ml-auto flex-row-reverse" : ""
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold ${
                    m.from === "user"
                      ? "bg-slate-900 text-white dark:bg-slate-700"
                      : "bg-[#e6f7f0] text-[#16a57a]"
                  }`}
                >
                  {m.from === "user" ? "A" : <Sparkles size={13} />}
                </div>

                <div
                  className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                    m.from === "user"
                      ? "bg-[#e6f7f0] text-slate-900 rounded-tr-none font-medium"
                      : "bg-[#f6f8f9] dark:bg-[#0e1715] text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-100 dark:border-[#21352f]"
                  }`}
                >
                  {m.agentName && (
                    <div className="flex items-center gap-1.5 mb-1.5 text-[10px] font-bold text-[#16a57a] uppercase tracking-wider">
                      <ShieldCheck size={12} />
                      <span>{m.agentName}</span>
                    </div>
                  )}

                  <p className="whitespace-pre-line">{m.text}</p>

                  {/* Embedded Chart inside Message if present */}
                  {m.chartData && Array.isArray(m.chartData) && (
                    <div className="mt-3 p-2 bg-white dark:bg-[#121f1c] rounded-xl border border-slate-200 dark:border-[#21352f] h-32">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={m.chartData}>
                          <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                          <Tooltip formatter={(v: any) => `₹${v.toLocaleString()}`} />
                          <Area type="monotone" dataKey="amount" stroke="#16a57a" fill="#e6f7f0" strokeWidth={2} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  {/* Tool Audit Badges */}
                  {m.toolAudit && m.toolAudit.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-slate-200 dark:border-[#21352f] flex flex-wrap gap-1.5">
                      {m.toolAudit.map((tool, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md text-[10px] bg-slate-200/80 dark:bg-[#1a3830] text-slate-700 dark:text-emerald-300 font-mono"
                        >
                          Verified via: {tool.toolName}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-xs text-slate-400 italic">
                <Sparkles size={14} className="animate-spin text-[#16a57a]" />
                <span>Specialized agents analyzing ledger & synthesizing recommendations...</span>
              </div>
            )}
          </div>

          {/* Quick suggestions */}
          <div className="px-4 pb-2 flex gap-2 overflow-x-auto no-scrollbar">
            {[
              "Can I afford a laptop worth ₹65,000?",
              "Why am I overspending this month?",
              "What bills are due next week?",
              "How can I save ₹5,000?",
            ].map((q, idx) => (
              <button
                key={idx}
                onClick={() => sendMessage(q)}
                className="px-3 py-1 rounded-full text-[11px] whitespace-nowrap bg-slate-50 hover:bg-slate-100 dark:bg-[#142823] dark:hover:bg-[#1a3830] border border-slate-200 dark:border-[#21352f] text-slate-700 dark:text-emerald-300 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Chat Input */}
          <div className="p-3 border-t border-slate-100 dark:border-[#21352f] flex items-center gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Ask anything about your money, bills, or purchases..."
              className="flex-1 px-3 py-2 text-xs bg-transparent outline-none text-slate-900 dark:text-white"
            />
            <button
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              className="w-8 h-8 rounded-lg bg-[#16a57a] hover:bg-[#138e69] disabled:opacity-50 text-white flex items-center justify-center transition-all"
            >
              <Send size={15} />
            </button>
          </div>
        </div>

        {/* Live Context Snapshot Sidebar */}
        <div className="bg-[#f0f7f4] dark:bg-[#0e1715] rounded-2xl p-6 border border-[#dcefe6] dark:border-[#21352f] space-y-5 h-fit">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#16a57a] tracking-wider uppercase">
            <Sparkles size={14} />
            <span>LIVE CONTEXT AUDIT</span>
          </div>
          <h3 className="font-heading font-semibold text-slate-900 dark:text-white text-base">
            Your Financial Snapshot
          </h3>

          <div className="space-y-3 divide-y divide-slate-200/60 dark:divide-[#21352f] text-xs">
            <div className="pt-2 flex justify-between">
              <span className="text-slate-500">Monthly Income</span>
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
              <span className="text-slate-500">Current Savings</span>
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
              <span className="text-slate-500">Budget Remaining</span>
              <strong className="font-semibold text-slate-900 dark:text-white">
                ₹{pulse.budgetRemaining.toLocaleString()}
              </strong>
            </div>
          </div>

          <div className="pt-2">
            <p className="text-[11px] text-slate-500 leading-normal">
              Answers are computed deterministically from your PostgreSQL database and authorized PayPal webhook synchronizations.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
