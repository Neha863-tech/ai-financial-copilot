import React, { useEffect, useState } from "react";
import { BarChart3, } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, } from "recharts";
import { FinSightAPI } from "../../services/finsightApi";
const COLORS = ["#16a57a", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4"];
export const AnalyticsView = () => {
    const [rangeMonths, setRangeMonths] = useState(6);
    const [reportsData, setReportsData] = useState(null);
    useEffect(() => {
        FinSightAPI.getHistoricalReports().then((res) => {
            if (res)
                setReportsData(res);
        });
    }, []);
    const monthlyData = (reportsData?.monthlyTrends || [
        { month: "Apr", income: 82000, expenses: 52400, savings: 29600 },
        { month: "May", income: 82000, expenses: 49800, savings: 32200 },
        { month: "Jun", income: 85000, expenses: 55700, savings: 29300 },
        { month: "Jul", income: 85000, expenses: 48200, savings: 36800 },
        { month: "Aug", income: 85000, expenses: 51100, savings: 33900 },
        { month: "Sep", income: 88000, expenses: 49800, savings: 38200 },
    ]).slice(-rangeMonths);
    const categoryBreakdown = reportsData?.categoryBreakdown || [
        { name: "Rent & Housing", amount: 15000 },
        { name: "Shopping", amount: 9800 },
        { name: "Food & Dining", amount: 8450 },
        { name: "Transport & Fuel", amount: 5823 },
        { name: "Utilities", amount: 5358 },
        { name: "Subscriptions", amount: 2148 },
    ];
    const dailyTrend = reportsData?.dailyTrends || [
        { date: "09/01", amount: 1499 },
        { date: "09/03", amount: 649 },
        { date: "09/05", amount: 480 },
        { date: "09/06", amount: 1850 },
        { date: "09/07", amount: 2100 },
        { date: "09/08", amount: 1240 },
        { date: "09/09", amount: 2499 },
    ];
    const budgetVsActual = reportsData?.budgetUtilization || [
        { category: "Rent & Housing", limit: 15000, spent: 15000, percentUsed: 100 },
        { category: "Shopping", limit: 8000, spent: 9800, percentUsed: 122.5 },
        { category: "Food & Dining", limit: 6000, spent: 8450, percentUsed: 140.8 },
        { category: "Transport", limit: 7000, spent: 5823, percentUsed: 83.2 },
        { category: "Utilities", limit: 4000, spent: 3179, percentUsed: 79.5 },
    ];
    const savingsGrowth = [
        { period: "Apr", savings: 29600, totalCorpus: 112000 },
        { period: "May", savings: 32200, totalCorpus: 144200 },
        { period: "Jun", savings: 29300, totalCorpus: 173500 },
        { period: "Jul", savings: 36800, totalCorpus: 210300 },
        { period: "Aug", savings: 33900, totalCorpus: 244200 },
        { period: "Sep", savings: 38200, totalCorpus: 282400 },
    ];
    const paymentMethods = reportsData?.paymentMethods || [
        { method: "PayPal", amount: 19497 },
        { method: "Credit Card", amount: 14500 },
        { method: "UPI", amount: 11203 },
        { method: "Bank Transfer", amount: 4600 },
    ];
    const topMerchants = reportsData?.topMerchants || [
        { merchant: "Amazon India", amount: 5998 },
        { merchant: "Swiggy Gourmet", amount: 3750 },
        { merchant: "Shell Fuel Station", amount: 2950 },
        { merchant: "Cult.fit Bangalore", amount: 1499 },
        { merchant: "Nature's Basket", amount: 1850 },
    ];
    const combinedHistoricalForecast = [
        { label: "Jul", actual: 48200, projected: null },
        { label: "Aug", actual: 51100, projected: null },
        { label: "Sep", actual: 49800, projected: 49800 },
        { label: "Oct (F)", actual: null, projected: 50200 },
        { label: "Nov (F)", actual: null, projected: 50400 },
        { label: "Dec (F)", actual: null, projected: 50600 },
    ];
    return (<div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
            COMPREHENSIVE VISUALIZATIONS & METRICS
          </p>
          <h1 className="text-2xl font-bold font-heading text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="text-[#16a57a]" size={26}/> Spending Analytics & Charts
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Interactive multi-chart analytics comparing actuals, categories, merchants, payment channels, and forecast curves.
          </p>
        </div>

        {/* 3m / 6m / 12m Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Timespan:</span>
          <div className="inline-flex rounded-lg p-0.5 bg-slate-100 dark:bg-[#1c3029]">
            {[3, 6, 12].map((m) => (<button key={m} onClick={() => setRangeMonths(m)} className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${rangeMonths === m
                ? "bg-white dark:bg-[#121f1c] text-[#16a57a] shadow-xs"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"}`}>
                {m} Months
              </button>))}
          </div>
        </div>
      </div>

      {/* Grid of 8 Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* CHART 1: Monthly Income vs Expenses (Grouped Bar Chart) */}
        <div className="p-5 bg-white dark:bg-[#121f1c] rounded-xl border border-slate-200 dark:border-[#21352f] shadow-xs">
          <h3 className="text-sm font-bold font-heading text-slate-900 dark:text-white mb-1">
            Chart 1: Monthly Income vs. Expenses
          </h3>
          <p className="text-xs text-slate-400 mb-4">Grouped bar comparison of total monthly inflows vs outflows</p>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
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

        {/* CHART 2: Expense Breakdown by Category (Donut Chart) */}
        <div className="p-5 bg-white dark:bg-[#121f1c] rounded-xl border border-slate-200 dark:border-[#21352f] shadow-xs">
          <h3 className="text-sm font-bold font-heading text-slate-900 dark:text-white mb-1">
            Chart 2: Expense Breakdown by Category
          </h3>
          <p className="text-xs text-slate-400 mb-4">Donut visualization of category spending shares</p>
          <div className="h-60 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryBreakdown} dataKey="amount" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={3}>
                  {categoryBreakdown.map((_, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]}/>))}
                </Pie>
                <Tooltip formatter={(v) => `₹${Number(v).toLocaleString("en-IN")}`}/>
                <Legend wrapperStyle={{ fontSize: 11 }}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 3: Daily / Weekly Spending Trend (Line Chart) */}
        <div className="p-5 bg-white dark:bg-[#121f1c] rounded-xl border border-slate-200 dark:border-[#21352f] shadow-xs">
          <h3 className="text-sm font-bold font-heading text-slate-900 dark:text-white mb-1">
            Chart 3: Spending Velocity Trend
          </h3>
          <p className="text-xs text-slate-400 mb-4">Daily spend movements tracked from actual transaction records</p>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0"/>
                <XAxis dataKey="date" tick={{ fontSize: 11 }}/>
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${v}`}/>
                <Tooltip formatter={(v) => `₹${Number(v).toLocaleString("en-IN")}`}/>
                <Line type="monotone" dataKey="amount" name="Daily Spend" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }}/>
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 4: Budget vs Actual Spending (Horizontal Bar Comparison) */}
        <div className="p-5 bg-white dark:bg-[#121f1c] rounded-xl border border-slate-200 dark:border-[#21352f] shadow-xs">
          <h3 className="text-sm font-bold font-heading text-slate-900 dark:text-white mb-1">
            Chart 4: Budget Limit vs. Actual Spending
          </h3>
          <p className="text-xs text-slate-400 mb-4">Highlights categories exceeding target limits</p>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={budgetVsActual}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0"/>
                <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${v / 1000}k`}/>
                <YAxis dataKey="category" type="category" tick={{ fontSize: 10 }} width={90}/>
                <Tooltip formatter={(v) => `₹${Number(v).toLocaleString("en-IN")}`}/>
                <Legend wrapperStyle={{ fontSize: 11 }}/>
                <Bar dataKey="limit" name="Budget Limit" fill="#94a3b8" radius={[0, 4, 4, 0]}/>
                <Bar dataKey="spent" name="Actual Spent" fill="#f59e0b" radius={[0, 4, 4, 0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 5: Savings Growth (Area Chart) */}
        <div className="p-5 bg-white dark:bg-[#121f1c] rounded-xl border border-slate-200 dark:border-[#21352f] shadow-xs">
          <h3 className="text-sm font-bold font-heading text-slate-900 dark:text-white mb-1">
            Chart 5: Cumulative Savings Growth
          </h3>
          <p className="text-xs text-slate-400 mb-4">Total accumulated liquid reserves over time</p>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={savingsGrowth}>
                <defs>
                  <linearGradient id="savingsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16a57a" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#16a57a" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0"/>
                <XAxis dataKey="period" tick={{ fontSize: 11 }}/>
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${v / 1000}k`}/>
                <Tooltip formatter={(v) => `₹${Number(v).toLocaleString("en-IN")}`}/>
                <Area type="monotone" dataKey="totalCorpus" name="Total Corpus" stroke="#16a57a" fillOpacity={1} fill="url(#savingsGrad)"/>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 6: Payment Method Analysis (Pie Chart) */}
        <div className="p-5 bg-white dark:bg-[#121f1c] rounded-xl border border-slate-200 dark:border-[#21352f] shadow-xs">
          <h3 className="text-sm font-bold font-heading text-slate-900 dark:text-white mb-1">
            Chart 6: Payment Method Share
          </h3>
          <p className="text-xs text-slate-400 mb-4">Comparison of PayPal, Card, UPI, and Bank Transfers</p>
          <div className="h-60 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={paymentMethods} dataKey="amount" nameKey="method" cx="50%" cy="50%" outerRadius={80}>
                  {paymentMethods.map((_, index) => (<Cell key={`pm-cell-${index}`} fill={COLORS[index % COLORS.length]}/>))}
                </Pie>
                <Tooltip formatter={(v) => `₹${Number(v).toLocaleString("en-IN")}`}/>
                <Legend wrapperStyle={{ fontSize: 11 }}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 7: Merchant-wise Spending (Horizontal Bar Chart) */}
        <div className="p-5 bg-white dark:bg-[#121f1c] rounded-xl border border-slate-200 dark:border-[#21352f] shadow-xs">
          <h3 className="text-sm font-bold font-heading text-slate-900 dark:text-white mb-1">
            Chart 7: Top Merchants by Spending
          </h3>
          <p className="text-xs text-slate-400 mb-4">Highest volume counterparties in your records</p>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={topMerchants}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0"/>
                <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${v}`}/>
                <YAxis dataKey="merchant" type="category" tick={{ fontSize: 10 }} width={90}/>
                <Tooltip formatter={(v) => `₹${Number(v).toLocaleString("en-IN")}`}/>
                <Bar dataKey="amount" name="Spent Amount" fill="#8b5cf6" radius={[0, 4, 4, 0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 8: Historical vs Current vs Forecast (Combined Line Chart) */}
        <div className="p-5 bg-white dark:bg-[#121f1c] rounded-xl border border-slate-200 dark:border-[#21352f] shadow-xs">
          <h3 className="text-sm font-bold font-heading text-slate-900 dark:text-white mb-1">
            Chart 8: Historical vs. Current vs. Forecast
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            Solid line represents actual historicals; dashed line represents future projections
          </p>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={combinedHistoricalForecast}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0"/>
                <XAxis dataKey="label" tick={{ fontSize: 11 }}/>
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${v / 1000}k`}/>
                <Tooltip formatter={(v) => `₹${Number(v).toLocaleString("en-IN")}`}/>
                <Legend wrapperStyle={{ fontSize: 11 }}/>
                <Line type="monotone" dataKey="actual" name="Actual Historical" stroke="#16a57a" strokeWidth={2.5} dot={{ r: 4 }}/>
                <Line type="monotone" dataKey="projected" name="Projected Forecast" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3 }}/>
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>);
};
