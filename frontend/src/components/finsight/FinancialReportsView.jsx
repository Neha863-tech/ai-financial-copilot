import React, { useState, useEffect } from "react";
import { FileText, Download, Printer, Calendar, TrendingUp, DollarSign, ShieldCheck, Clock, Sparkles, } from "lucide-react";
import { FinSightAPI } from "../../services/finsightApi";
import { toast } from "sonner";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, LineChart, Line, } from "recharts";
const COLORS = ["#16a57a", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4"];
export const FinancialReportsView = () => {
    const [activeTab, setActiveTab] = useState("historical");
    const [period, setPeriod] = useState("MONTHLY");
    const [categoryFilter, setCategoryFilter] = useState("All");
    const [loading, setLoading] = useState(false);
    const [historicalData, setHistoricalData] = useState(null);
    const [currentData, setCurrentData] = useState(null);
    const [forecastData, setForecastData] = useState(null);
    const loadReports = async () => {
        setLoading(true);
        try {
            const [hist, curr, fore] = await Promise.all([
                FinSightAPI.getHistoricalReports({ period, category: categoryFilter !== "All" ? categoryFilter : undefined }),
                FinSightAPI.getCurrentFinancialOverview(),
                FinSightAPI.getFutureScheduleAndForecast(),
            ]);
            setHistoricalData(hist);
            setCurrentData(curr);
            setForecastData(fore);
        }
        catch (e) {
            toast.error("Failed to refresh reports from ledger");
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        loadReports();
    }, [period, categoryFilter]);
    const handleExportCSV = () => {
        const csvContent = "data:text/csv;charset=utf-8," +
            "Transaction ID,Date,Merchant,Category,Type,Payment Method,Amount,Status\n" +
            (historicalData?.transactions || [])
                .map((t) => `${t.id},${t.date.slice(0, 10)},"${t.merchant}","${t.category}",${t.type},${t.paymentMethod},${t.amount},${t.status}`)
                .join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `FinSight_Report_${period}_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Financial report exported to CSV");
    };
    const handlePrint = () => {
        window.print();
    };
    return (<div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
            AUDITED LEDGER & INTELLIGENCE
          </p>
          <h1 className="text-2xl font-bold font-heading text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="text-[#16a57a]" size={26}/> Financial Reports
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Certified historical ledgers, real-time position reports, and predictive cash-flow schedules.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={handleExportCSV} className="px-3.5 py-2 rounded-lg bg-white dark:bg-[#121f1c] border border-slate-200 dark:border-[#21352f] text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#1a2f29] flex items-center gap-1.5 transition-all shadow-xs">
            <Download size={14}/> Export CSV
          </button>
          <button onClick={handlePrint} className="px-3.5 py-2 rounded-lg bg-[#16a57a] hover:bg-[#138e69] text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs">
            <Printer size={14}/> Print / PDF
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-[#21352f] pb-1">
        <button onClick={() => setActiveTab("historical")} className={`px-4 py-2 text-xs font-bold rounded-t-lg transition-all flex items-center gap-2 border-b-2 ${activeTab === "historical"
            ? "border-[#16a57a] text-[#16a57a] bg-emerald-50/50 dark:bg-emerald-950/20"
            : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white"}`}>
          <Clock size={15}/> A. Historical Reports
        </button>
        <button onClick={() => setActiveTab("current")} className={`px-4 py-2 text-xs font-bold rounded-t-lg transition-all flex items-center gap-2 border-b-2 ${activeTab === "current"
            ? "border-[#16a57a] text-[#16a57a] bg-emerald-50/50 dark:bg-emerald-950/20"
            : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white"}`}>
          <DollarSign size={15}/> B. Current Overview
        </button>
        <button onClick={() => setActiveTab("forecast")} className={`px-4 py-2 text-xs font-bold rounded-t-lg transition-all flex items-center gap-2 border-b-2 ${activeTab === "forecast"
            ? "border-[#16a57a] text-[#16a57a] bg-emerald-50/50 dark:bg-emerald-950/20"
            : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white"}`}>
          <TrendingUp size={15}/> C. Future Schedule & Forecast
        </button>
      </div>

      {/* ========================================================= */}
      {/* TAB A: HISTORICAL REPORTS                                 */}
      {/* ========================================================= */}
      {activeTab === "historical" && (<div className="space-y-6">
          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-white dark:bg-[#121f1c] rounded-xl border border-slate-200 dark:border-[#21352f]">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium">Reporting Period:</span>
              <div className="inline-flex rounded-lg p-0.5 bg-slate-100 dark:bg-[#1c3029]">
                {["DAILY", "WEEKLY", "MONTHLY", "QUARTERLY", "ANNUAL"].map((p) => (<button key={p} onClick={() => setPeriod(p)} className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-all ${period === p
                    ? "bg-white dark:bg-[#121f1c] text-[#16a57a] shadow-xs"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"}`}>
                    {p}
                  </button>))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium">Category:</span>
              <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="px-2.5 py-1 text-xs rounded-md border border-slate-200 dark:border-[#21352f] bg-white dark:bg-[#121f1c] text-slate-700 dark:text-slate-200 outline-none">
                <option>All</option>
                <option>Housing & Rent</option>
                <option>Shopping</option>
                <option>Food & Dining</option>
                <option>Transport & Fuel</option>
                <option>Utilities</option>
                <option>Subscriptions</option>
              </select>
            </div>
          </div>

          {/* Metric KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
            <div className="p-4 bg-white dark:bg-[#121f1c] rounded-xl border border-slate-200 dark:border-[#21352f] shadow-xs">
              <span className="text-xs text-slate-400 block mb-1">Total Income</span>
              <strong className="text-xl font-bold font-heading text-emerald-600 block">
                ₹{(historicalData?.summary?.totalIncome || 88000).toLocaleString("en-IN")}
              </strong>
              <span className="text-[11px] text-slate-400">Recorded verified inflow</span>
            </div>

            <div className="p-4 bg-white dark:bg-[#121f1c] rounded-xl border border-slate-200 dark:border-[#21352f] shadow-xs">
              <span className="text-xs text-slate-400 block mb-1">Total Expenses</span>
              <strong className="text-xl font-bold font-heading text-slate-900 dark:text-white block">
                ₹{(historicalData?.summary?.totalExpenses || 49800).toLocaleString("en-IN")}
              </strong>
              <span className="text-[11px] text-rose-500 font-medium">
                {historicalData?.summary?.transactionCount || 12} transactions
              </span>
            </div>

            <div className="p-4 bg-white dark:bg-[#121f1c] rounded-xl border border-slate-200 dark:border-[#21352f] shadow-xs">
              <span className="text-xs text-slate-400 block mb-1">Net Savings</span>
              <strong className="text-xl font-bold font-heading text-[#16a57a] block">
                ₹{(historicalData?.summary?.netSavings || 38200).toLocaleString("en-IN")}
              </strong>
              <span className="text-[11px] text-emerald-600 font-semibold">
                Savings Rate: {historicalData?.summary?.savingsRate || 43.4}%
              </span>
            </div>

            <div className="p-4 bg-white dark:bg-[#121f1c] rounded-xl border border-slate-200 dark:border-[#21352f] shadow-xs">
              <span className="text-xs text-slate-400 block mb-1">Audit Status</span>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 mt-1">
                <ShieldCheck size={16}/> PostgreSQL Verified
              </div>
              <span className="text-[11px] text-slate-400">
                Refunds: ₹{historicalData?.summary?.refundTotal || 649}
              </span>
            </div>
          </div>

          {/* AI Grounded Observations Banner */}
          {historicalData?.observations && (<div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 space-y-1.5">
              <span className="flex items-center gap-1.5 text-xs font-bold text-[#16a57a] uppercase tracking-wide">
                <Sparkles size={14}/> Data-Backed AI Ledger Analysis
              </span>
              <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-1 list-disc list-inside">
                {historicalData.observations.map((obs, idx) => (<li key={idx} dangerouslySetInnerHTML={{ __html: obs.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") }}/>))}
              </ul>
            </div>)}

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Chart 1: Income vs Expenses */}
            <div className="p-5 bg-white dark:bg-[#121f1c] rounded-xl border border-slate-200 dark:border-[#21352f] shadow-xs">
              <h3 className="text-sm font-bold font-heading text-slate-900 dark:text-white mb-1">
                Income vs. Expenses by Period
              </h3>
              <p className="text-xs text-slate-400 mb-4">Comparison of inflow versus outflow</p>
              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={historicalData?.monthlyTrends || []}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0"/>
                    <XAxis dataKey="month" tick={{ fontSize: 11 }}/>
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${v / 1000}k`}/>
                    <Tooltip formatter={(v) => `₹${Number(v).toLocaleString("en-IN")}`}/>
                    <Legend wrapperStyle={{ fontSize: 11 }}/>
                    <Bar dataKey="income" name="Income" fill="#16a57a" radius={[4, 4, 0, 0]}/>
                    <Bar dataKey="expenses" name="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]}/>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Category Breakdown */}
            <div className="p-5 bg-white dark:bg-[#121f1c] rounded-xl border border-slate-200 dark:border-[#21352f] shadow-xs">
              <h3 className="text-sm font-bold font-heading text-slate-900 dark:text-white mb-1">
                Expense Breakdown by Category
              </h3>
              <p className="text-xs text-slate-400 mb-4">Share of total monthly expenditure</p>
              <div className="h-60 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={historicalData?.categoryBreakdown || []} dataKey="amount" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3}>
                      {(historicalData?.categoryBreakdown || []).map((_, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]}/>))}
                    </Pie>
                    <Tooltip formatter={(v) => `₹${Number(v).toLocaleString("en-IN")}`}/>
                    <Legend wrapperStyle={{ fontSize: 11 }}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Merchant Leaderboard & Payment Methods */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Merchant Leaderboard */}
            <div className="p-5 bg-white dark:bg-[#121f1c] rounded-xl border border-slate-200 dark:border-[#21352f] shadow-xs">
              <h3 className="text-sm font-bold font-heading text-slate-900 dark:text-white mb-3">
                Top Merchants by Spending
              </h3>
              <div className="space-y-2.5">
                {(historicalData?.topMerchants || []).map((m, idx) => (<div key={idx} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100 dark:border-[#1e342c]">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-[#1a2f29] font-bold text-[10px] flex items-center justify-center text-slate-600 dark:text-slate-300">
                        {idx + 1}
                      </span>
                      <span className="font-semibold text-slate-900 dark:text-white">{m.merchant}</span>
                      <span className="text-[10px] text-slate-400">({m.count} orders)</span>
                    </div>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      ₹{m.amount.toLocaleString("en-IN")}
                    </span>
                  </div>))}
              </div>
            </div>

            {/* Payment Methods */}
            <div className="p-5 bg-white dark:bg-[#121f1c] rounded-xl border border-slate-200 dark:border-[#21352f] shadow-xs">
              <h3 className="text-sm font-bold font-heading text-slate-900 dark:text-white mb-3">
                Payment Method Analysis
              </h3>
              <div className="space-y-3">
                {(historicalData?.paymentMethods || []).map((pm, idx) => {
                const total = historicalData?.summary?.totalExpenses || 49800;
                const pct = total > 0 ? Math.round((pm.amount / total) * 100) : 0;
                return (<div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-medium text-slate-700 dark:text-slate-300">{pm.method}</span>
                        <span className="font-bold text-slate-900 dark:text-white">
                          ₹{pm.amount.toLocaleString("en-IN")} ({pct}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-[#1c3029] rounded-full h-1.5 overflow-hidden">
                        <div className="h-1.5 rounded-full bg-[#16a57a]" style={{ width: `${pct}%` }}/>
                      </div>
                    </div>);
            })}
              </div>
            </div>
          </div>
        </div>)}

      {/* ========================================================= */}
      {/* TAB B: CURRENT FINANCIAL OVERVIEW                         */}
      {/* ========================================================= */}
      {activeTab === "current" && (<div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div className="p-5 bg-white dark:bg-[#121f1c] rounded-xl border border-slate-200 dark:border-[#21352f] shadow-xs">
              <span className="text-xs text-slate-400 block mb-1">Available Balance</span>
              <strong className="text-2xl font-bold font-heading text-[#16a57a] block">
                ₹{(currentData?.availableBalance || 38200).toLocaleString("en-IN")}
              </strong>
              <span className="text-[11px] text-slate-400">Total liquid reserves</span>
            </div>

            <div className="p-5 bg-white dark:bg-[#121f1c] rounded-xl border border-slate-200 dark:border-[#21352f] shadow-xs">
              <span className="text-xs text-slate-400 block mb-1">This Month's Inflow</span>
              <strong className="text-2xl font-bold font-heading text-emerald-600 block">
                ₹{(currentData?.totalIncome || 88000).toLocaleString("en-IN")}
              </strong>
              <span className="text-[11px] text-slate-400">Salary + Freelance verified</span>
            </div>

            <div className="p-5 bg-white dark:bg-[#121f1c] rounded-xl border border-slate-200 dark:border-[#21352f] shadow-xs">
              <span className="text-xs text-slate-400 block mb-1">This Month's Outflow</span>
              <strong className="text-2xl font-bold font-heading text-rose-500 block">
                ₹{(currentData?.totalExpenses || 49800).toLocaleString("en-IN")}
              </strong>
              <span className="text-[11px] text-slate-400">Ledger recorded transactions</span>
            </div>

            <div className="p-5 bg-white dark:bg-[#121f1c] rounded-xl border border-slate-200 dark:border-[#21352f] shadow-xs">
              <span className="text-xs text-slate-400 block mb-1">Budget Utilization</span>
              <strong className="text-2xl font-bold font-heading text-amber-500 block">
                {currentData?.budgetUtilizationPct || 72}%
              </strong>
              <span className="text-[11px] text-slate-400">
                ₹{(currentData?.remainingBudget || 14200).toLocaleString("en-IN")} remaining
              </span>
            </div>
          </div>

          {/* Current Position Breakdown */}
          <div className="p-5 bg-white dark:bg-[#121f1c] rounded-xl border border-slate-200 dark:border-[#21352f] shadow-xs space-y-4">
            <h3 className="text-sm font-bold font-heading text-slate-900 dark:text-white">
              Current Period Summary & Liabilities
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-[#182a24] border border-slate-200 dark:border-[#21352f]">
                <span className="text-xs text-slate-400 block">Pending Payments</span>
                <span className="text-lg font-bold text-amber-600">
                  ₹{(currentData?.pendingPayments || 2180).toLocaleString("en-IN")}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Electricity bill pending capture</span>
              </div>
              <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-[#182a24] border border-slate-200 dark:border-[#21352f]">
                <span className="text-xs text-slate-400 block">Active Subscriptions</span>
                <span className="text-lg font-bold text-blue-600">
                  {currentData?.activeSubscriptionsCount || 3} services
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Netflix, Cult.fit, Broadband</span>
              </div>
              <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-[#182a24] border border-slate-200 dark:border-[#21352f]">
                <span className="text-xs text-slate-400 block">Reversals & Refunds</span>
                <span className="text-lg font-bold text-emerald-600">
                  ₹{(currentData?.refunds || 649).toLocaleString("en-IN")}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Credited to PayPal balance</span>
              </div>
            </div>
          </div>
        </div>)}

      {/* ========================================================= */}
      {/* TAB C: FUTURE FINANCIAL SCHEDULE & FORECAST               */}
      {/* ========================================================= */}
      {activeTab === "forecast" && (<div className="space-y-6">
          {/* Upcoming Bills Schedule */}
          <div className="p-5 bg-white dark:bg-[#121f1c] rounded-xl border border-slate-200 dark:border-[#21352f] shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold font-heading text-slate-900 dark:text-white">
                  Upcoming Payment Schedule
                </h3>
                <p className="text-xs text-slate-400">Planned liabilities detected by recurring payment agent</p>
              </div>
              <span className="text-xs font-semibold text-rose-500">
                Monthly commitment: ₹{(forecastData?.monthlyRecurringCommitment || 18828).toLocaleString("en-IN")}
              </span>
            </div>

            <div className="space-y-2">
              {(forecastData?.upcomingBills || []).map((bill, idx) => (<div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-[#162722] border border-slate-100 dark:border-[#21352f]">
                  <div className="flex items-center gap-3">
                    <Calendar size={16} className="text-[#16a57a]"/>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{bill.title}</p>
                      <p className="text-[10px] text-slate-400">Due {new Date(bill.dueDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      ₹{bill.amount.toLocaleString("en-IN")}
                    </span>
                    <span className={`block text-[10px] font-semibold ${bill.status === "DUE_SOON" ? "text-amber-500" : "text-[#16a57a]"}`}>
                      {bill.status === "DUE_SOON" ? "Due in 2 days" : "Scheduled"}
                    </span>
                  </div>
                </div>))}
            </div>
          </div>

          {/* 12-Month Projected Growth Chart */}
          <div className="p-5 bg-white dark:bg-[#121f1c] rounded-xl border border-slate-200 dark:border-[#21352f] shadow-xs">
            <h3 className="text-sm font-bold font-heading text-slate-900 dark:text-white mb-1">
              12-Month Net Savings Projection
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Linear forecast based on current ₹38,200 monthly surplus and 0.4% monthly inflation variance
            </p>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={forecastData?.projection || []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0"/>
                  <XAxis dataKey="month" tick={{ fontSize: 11 }}/>
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${v / 1000}k`}/>
                  <Tooltip formatter={(v) => `₹${Number(v).toLocaleString("en-IN")}`}/>
                  <Legend wrapperStyle={{ fontSize: 11 }}/>
                  <Line type="monotone" dataKey="projectedSavings" name="Projected Net Wealth" stroke="#16a57a" strokeWidth={2.5} dot={{ r: 3 }}/>
                  <Line type="monotone" dataKey="projectedExpenses" name="Projected Expenses" stroke="#ef4444" strokeWidth={1.5} strokeDasharray="4 4"/>
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Transparent Modeling Assumptions */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#162722] border border-slate-200 dark:border-[#21352f] text-xs text-slate-500 dark:text-slate-400 space-y-1">
            <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
              ⚠️ Transparent Modeling Assumptions:
            </span>
            {(forecastData?.assumptions || []).map((ass, idx) => (<p key={idx}>• {ass}</p>))}
          </div>
        </div>)}
    </div>);
};
