import React, { useEffect, useState } from "react";
import { BarChart3, TrendingUp } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, Tooltip, AreaChart, Area } from "recharts";
import { FinSightAPI, SpendingPatterns } from "../../services/finsightApi";
import { toast } from "sonner";

const emptyData: SpendingPatterns = { categoryBreakdown: [], monthlyTrends: [] };

export const AnalyticsView: React.FC = () => {
  const [data, setData] = useState<SpendingPatterns>(emptyData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    FinSightAPI.getSpendingPatterns()
      .then((result) => {
        if (active) setData(result);
      })
      .catch((error: unknown) => {
        toast.error(error instanceof Error ? error.message : "Could not load spending analysis.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, []);

  const totalSpending = data.categoryBreakdown.reduce((sum, item) => sum + item.amount, 0);

  return (
    <section className="space-y-6">
      <div>
        <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">PATTERNS & SIGNALS</p>
        <h1 className="text-2xl font-bold font-heading text-slate-900 dark:text-white">Spending Analysis</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Analysis is calculated from your completed transactions for the current month.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3.5">
        <div className="p-4 bg-white dark:bg-[#121f1c] rounded-xl border border-slate-200 dark:border-[#21352f] shadow-xs">
          <span className="text-xs text-slate-400 block mb-1">Recorded expenses</span>
          <strong className="text-xl font-bold font-heading text-slate-900 dark:text-white block">
            ₹{totalSpending.toLocaleString("en-IN")}
          </strong>
          <span className="text-[11px] text-slate-500">{data.categoryBreakdown.length} spending categories</span>
        </div>
        <div className="p-4 bg-white dark:bg-[#121f1c] rounded-xl border border-slate-200 dark:border-[#21352f] shadow-xs">
          <span className="text-xs text-slate-400 block mb-1">Largest category</span>
          <strong className="text-xl font-bold font-heading text-[#16a57a] block">
            {data.categoryBreakdown[0]?.name || "No data"}
          </strong>
          <span className="text-[11px] text-slate-500">
            {data.categoryBreakdown[0]
              ? `₹${data.categoryBreakdown[0].amount.toLocaleString("en-IN")}`
              : "Record an expense to get started"}
          </span>
        </div>
        <div className="p-4 bg-white dark:bg-[#121f1c] rounded-xl border border-slate-200 dark:border-[#21352f] shadow-xs">
          <span className="text-xs text-slate-400 block mb-1">Monthly data points</span>
          <strong className="text-xl font-bold font-heading text-blue-500 block">
            {data.monthlyTrends.length}
          </strong>
          <span className="text-[11px] text-slate-500">Based on completed ledger entries</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="p-5 bg-white dark:bg-[#121f1c] rounded-xl border border-slate-200 dark:border-[#21352f] shadow-xs">
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 size={16} className="text-[#16a57a]" />
            <h2 className="text-base font-bold font-heading text-slate-900 dark:text-white">Spending by category</h2>
          </div>
          <p className="text-xs text-slate-400 mb-4">Current-month expenses from your ledger</p>
          <div className="h-64 w-full">
            {data.categoryBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.categoryBreakdown} layout="vertical" margin={{ left: 16 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e8edf2" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(value) => `₹${Number(value ?? 0).toLocaleString("en-IN")}`} />
                  <Bar dataKey="amount" name="Expenses" fill="#16a57a" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-slate-400">
                {loading ? "Loading…" : "No expenses recorded this month."}
              </div>
            )}
          </div>
          {data.categoryBreakdown.length > 0 && (
            <div className="mt-2 space-y-1">
              {data.categoryBreakdown.map((category) => (
                <div key={category.name} className="flex justify-between text-xs text-slate-500">
                  <span>{category.name}</span>
                  <span>₹{category.amount.toLocaleString("en-IN")}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-5 bg-white dark:bg-[#121f1c] rounded-xl border border-slate-200 dark:border-[#21352f] shadow-xs">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={16} className="text-[#16a57a]" />
            <h2 className="text-base font-bold font-heading text-slate-900 dark:text-white">Monthly cash flow</h2>
          </div>
          <p className="text-xs text-slate-400 mb-4">Income and expenses over the last six months</p>
          <div className="h-64 w-full">
            {data.monthlyTrends.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.monthlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e8edf2" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(value) => `₹${Number(value ?? 0).toLocaleString("en-IN")}`} />
                  <Area type="monotone" dataKey="income" name="Income" stroke="#16a57a" fill="#16a57a" fillOpacity={0.12} />
                  <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#e05252" fill="#e05252" fillOpacity={0.08} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-slate-400">
                {loading ? "Loading…" : "No transaction history yet."}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
