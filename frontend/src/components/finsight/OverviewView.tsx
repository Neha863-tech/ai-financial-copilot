import React, { useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Wallet,
  Target,
  Sparkles,
  BarChart3,
  Plus,
  FileText,
  X,
  Link2,
  Download,
  Activity,
} from "lucide-react";
import { FinancialPulse, TransactionItem } from "../../services/finsightApi";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { toast } from "sonner";

interface Props {
  pulse: FinancialPulse;
  transactions: TransactionItem[];
  userName: string;
  onOpenAddModal: () => void;
  onNavigate: (page: string) => void;
}

export const OverviewView: React.FC<Props> = ({ pulse, transactions, userName, onOpenAddModal, onNavigate }) => {
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const reportMonth = new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" });
  const topCategory = pulse.categoryBreakdown[0];

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Dashboard link copied to clipboard");
    } catch {
      toast.error("Could not copy the dashboard link.");
    }
  };

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
            {new Date().toLocaleDateString("en-IN", { weekday: "long", month: "long", day: "numeric", year: "numeric" }).toUpperCase()}
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-slate-900 dark:text-white">
            Hello, {userName.split(" ")[0]} <span className="text-emerald-500">✦</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Here's your financial pulse for this month.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setReportModalOpen(true)}
            className="px-3.5 py-2 rounded-lg border border-slate-200 dark:border-[#21352f] bg-white dark:bg-[#121f1c] hover:bg-slate-50 dark:hover:bg-[#183129] text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 shadow-xs"
          >
            <FileText size={15} /> Monthly report
          </button>
          <button
            onClick={onOpenAddModal}
            className="px-4 py-2 rounded-lg bg-[#16a57a] hover:bg-[#138e69] text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Plus size={16} /> Add transaction
          </button>
        </div>
      </div>

      {/* 4 Financial KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white dark:bg-[#121f1c] border border-slate-200 dark:border-[#21352f] rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-slate-500">Total Income</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
              <ArrowDownLeft size={16} />
            </div>
          </div>
          <strong className="text-xl sm:text-2xl font-bold font-heading text-slate-900 dark:text-white block">
            ₹{pulse.totalIncome.toLocaleString()}
          </strong>
          <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-0.5 mt-1.5">
            Recorded this month
          </span>
        </div>

        <div className="bg-white dark:bg-[#121f1c] border border-slate-200 dark:border-[#21352f] rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-slate-500">Total Expenses</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center">
              <ArrowUpRight size={16} />
            </div>
          </div>
          <strong className="text-xl sm:text-2xl font-bold font-heading text-slate-900 dark:text-white block">
            ₹{pulse.totalExpenses.toLocaleString()}
          </strong>
          <span className="text-[11px] text-rose-500 font-medium flex items-center gap-0.5 mt-1.5">
            Recorded this month
          </span>
        </div>

        <div className="bg-white dark:bg-[#121f1c] border border-slate-200 dark:border-[#21352f] rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-slate-500">Current Savings</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-500 flex items-center justify-center">
              <Wallet size={16} />
            </div>
          </div>
          <strong className="text-xl sm:text-2xl font-bold font-heading text-slate-900 dark:text-white block">
            ₹{pulse.currentSavings.toLocaleString()}
          </strong>
          <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-0.5 mt-1.5">
            <ArrowUpRight size={13} /> {pulse.savingsRate}% savings rate
          </span>
        </div>

        <div className="bg-white dark:bg-[#121f1c] border border-slate-200 dark:border-[#21352f] rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-slate-500">Budget Remaining</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-500 flex items-center justify-center">
              <Target size={16} />
            </div>
          </div>
          <strong className="text-xl sm:text-2xl font-bold font-heading text-slate-900 dark:text-white block">
            ₹{pulse.budgetRemaining.toLocaleString()}
          </strong>
          <span className="text-[11px] text-slate-400 font-medium mt-1.5 block">
            {pulse.budgetUtilizationPct}% utilized
          </span>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Income vs Expenses Area Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-[#121f1c] rounded-xl p-5 border border-slate-200 dark:border-[#21352f] shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold font-heading text-slate-900 dark:text-white">
                Income vs Expenses
              </h2>
              <p className="text-xs text-slate-400">Monthly cash flow pulse</p>
            </div>
            <div className="flex gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                <span className="w-2 h-2 rounded-full bg-[#16a57a]" /> Income
              </span>
              <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                <span className="w-2 h-2 rounded-full bg-[#e05252]" /> Expenses
              </span>
            </div>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={pulse.monthlyTrends}>
                <defs>
                  <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#16a57a" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#16a57a" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e8edf2" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip formatter={(v: any) => `₹${v.toLocaleString()}`} />
                <Area type="monotone" dataKey="income" stroke="#16a57a" strokeWidth={2.5} fill="url(#incomeGradient)" />
                <Area type="monotone" dataKey="expenses" stroke="#e05252" strokeWidth={2.5} strokeDasharray="4 4" fill="none" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut Chart: Where It Goes */}
        <div className="bg-white dark:bg-[#121f1c] rounded-xl p-5 border border-slate-200 dark:border-[#21352f] shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold font-heading text-slate-900 dark:text-white">
              Where It Goes
            </h2>
            <p className="text-xs text-slate-400 mb-3">Current-month spending categories</p>
          </div>

          <div className="relative h-44 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pulse.categoryBreakdown}
                  dataKey="amount"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={3}
                  stroke="none"
                >
                  {pulse.categoryBreakdown.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: any) => `₹${v.toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <strong className="text-base font-bold font-heading text-slate-900 dark:text-white">
                ₹{pulse.totalExpenses.toLocaleString()}
              </strong>
              <span className="text-[10px] text-slate-400">total spend</span>
            </div>
          </div>

          <div className="space-y-1.5 text-xs">
            {pulse.categoryBreakdown.slice(0, 4).map((c) => (
              <div key={c.name} className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
                  {c.name}
                </span>
                <strong className="font-semibold text-slate-900 dark:text-white">
                  ₹{c.amount.toLocaleString()}
                </strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lower Grid: Recent Transactions & AI Insight Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Mini Transactions list */}
        <div className="lg:col-span-2 bg-white dark:bg-[#121f1c] rounded-xl p-5 border border-slate-200 dark:border-[#21352f] shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold font-heading text-slate-900 dark:text-white">
                Recent Transactions
              </h2>
              <p className="text-xs text-slate-400">Latest entries from your financial ledger</p>
            </div>
            <button
              onClick={() => onNavigate("Transactions")}
              className="text-xs text-[#16a57a] hover:underline font-semibold flex items-center gap-1"
            >
              View all <ArrowUpRight size={14} />
            </button>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-[#21352f]">
            {transactions.slice(0, 5).map((t, idx) => (
              <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-[#183129] flex items-center justify-center font-bold text-slate-700 dark:text-emerald-300">
                    {t.merchant[0]}
                  </div>
                  <div>
                    <strong className="font-semibold text-slate-900 dark:text-white block">
                      {t.merchant}
                    </strong>
                    <span className="text-[11px] text-slate-400">
                      {t.category} · {t.date} · {t.paymentMethod}
                    </span>
                  </div>
                </div>
                <strong className={t.amount > 0 ? "text-emerald-600 font-bold" : "text-slate-900 dark:text-white font-semibold"}>
                  {t.amount > 0 ? "+" : "−"}₹{Math.abs(t.amount).toLocaleString()}
                </strong>
              </div>
            ))}
          </div>
        </div>

        {/* AI Insight Card */}
        <div className="bg-[#15251f] text-white rounded-xl p-6 relative overflow-hidden flex flex-col justify-between shadow-lg">
          <div>
            <div className="flex items-center gap-1.5 text-emerald-400 text-[10px] font-bold tracking-wider uppercase mb-3">
              <Sparkles size={14} />
              <span>SPENDING HIGHLIGHT</span>
            </div>
            <h3 className="font-heading font-bold text-lg leading-snug mb-2">
              A little more clarity goes a long way.
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              {topCategory
                ? `${topCategory.name} is your largest recorded spending category this month at ₹${topCategory.amount.toLocaleString("en-IN")}. Ask the assistant to explore your spending patterns.`
                : "Add transactions to see personalized insights based on your financial activity."}
            </p>
          </div>
          <button
            onClick={() => onNavigate("AI Financial Assistant")}
            className="mt-4 pt-3 border-t border-emerald-950/60 text-emerald-300 text-xs font-semibold flex items-center gap-1 hover:text-white transition-colors"
          >
            Ask AI Assistant what changed <ArrowUpRight size={14} />
          </button>
        </div>
      </div>

      {/* Monthly Report Modal */}
      {reportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-[#121f1c] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-slate-200 dark:border-[#21352f] animate-rise space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-[#21352f]">
              <div>
                <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">FIN SIGHT AI · MONTHLY REVIEW</p>
                <h2 className="text-xl font-bold font-heading text-slate-900 dark:text-white">
                  {reportMonth} Financial Report
                </h2>
              </div>
              <button
                onClick={() => setReportModalOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {/* Printable Report Canvas */}
            <div id="printable-report" className="p-6 rounded-xl border border-slate-200 dark:border-[#21352f] bg-[#f3faf6] dark:bg-[#0e1715] space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-[#16a57a] text-white flex items-center justify-center text-xs">
                    <Activity size={14} />
                  </span>
                  <strong className="font-heading font-bold text-slate-900 dark:text-white">
                    FinSight<span className="text-[#16a57a]">AI</span>
                  </strong>
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {reportMonth.toUpperCase()}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center py-2">
                <div className="p-3 bg-white dark:bg-[#121f1c] rounded-lg border border-slate-100 dark:border-[#21352f]">
                  <span className="text-[11px] text-slate-400 block mb-1">Income</span>
                  <strong className="text-base font-bold text-slate-900 dark:text-white block">
                    ₹{pulse.totalIncome.toLocaleString()}
                  </strong>
                  <span className="text-[10px] text-slate-400">Current month</span>
                </div>
                <div className="p-3 bg-white dark:bg-[#121f1c] rounded-lg border border-slate-100 dark:border-[#21352f]">
                  <span className="text-[11px] text-slate-400 block mb-1">Spent</span>
                  <strong className="text-base font-bold text-slate-900 dark:text-white block">
                    ₹{pulse.totalExpenses.toLocaleString()}
                  </strong>
                  <span className="text-[10px] text-slate-400">Current month</span>
                </div>
                <div className="p-3 bg-white dark:bg-[#121f1c] rounded-lg border border-slate-100 dark:border-[#21352f]">
                  <span className="text-[11px] text-slate-400 block mb-1">Saved</span>
                  <strong className="text-base font-bold text-emerald-600 block">
                    ₹{pulse.currentSavings.toLocaleString()}
                  </strong>
                  <span className="text-[10px] text-emerald-600 font-bold">{pulse.savingsRate}% rate</span>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-[#e4f5ed] dark:bg-[#14352b] text-xs text-[#17684f] dark:text-emerald-300 space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <Sparkles size={14} /> Financial summary
                </div>
                <p className="leading-relaxed">
                  This report reflects transactions recorded in {reportMonth}. Your current savings rate is {pulse.savingsRate.toFixed(1)}%.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-[#21352f]">
              <button
                onClick={handleCopyLink}
                className="px-3.5 py-2 rounded-lg border border-slate-200 dark:border-[#21352f] text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5"
              >
                <Link2 size={14} /> Copy dashboard link
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold flex items-center gap-1.5"
              >
                <Download size={14} /> Print / Export PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
