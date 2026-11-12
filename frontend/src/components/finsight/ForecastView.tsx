import React, { useEffect, useState } from "react";
import { Sparkles, TrendingUp, RefreshCw } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, Tooltip } from "recharts";
import { FinSightAPI } from "../../services/finsightApi";
import { toast } from "sonner";

interface ForecastData {
  monthlySavingsIncrease: number;
  annualSavingsIncrease: number;
  baselineMonthlySpend: number;
  disclaimer: string;
  projection: Array<{ month: string; current: number; optimized: number }>;
}

const emptyForecast: ForecastData = {
  monthlySavingsIncrease: 0,
  annualSavingsIncrease: 0,
  baselineMonthlySpend: 0,
  disclaimer: "",
  projection: [],
};

export const ForecastView: React.FC = () => {
  const [reduction, setReduction] = useState(20);
  const [data, setData] = useState<ForecastData>(emptyForecast);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    FinSightAPI.simulateForecast(reduction)
      .then((result) => {
        if (active) setData(result);
      })
      .catch((error: unknown) => {
        toast.error(error instanceof Error ? error.message : "Could not calculate the forecast.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [reduction]);

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">PLAN AHEAD</p>
          <h1 className="text-2xl font-bold font-heading text-slate-900 dark:text-white">Financial Future Simulator</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Estimate potential savings from your recorded expense history.
          </p>
        </div>
        <button
          onClick={() => setReduction(20)}
          className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#21352f] text-xs font-medium text-slate-600 dark:text-slate-300 flex items-center gap-1.5"
        >
          <RefreshCw size={14} /> Reset scenario
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-[#121f1c] rounded-xl p-6 border border-slate-200 dark:border-[#21352f] shadow-xs space-y-5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#16a57a] uppercase">
            <Sparkles size={14} /> What-if scenario
          </div>
          <h3 className="font-heading font-semibold text-lg text-slate-900 dark:text-white">
            Reduce recorded spending by
          </h3>

          <div>
            <div className="flex items-baseline gap-2 mb-2">
              <strong className="text-4xl font-bold font-heading text-[#16a57a]">{reduction}%</strong>
              <span className="text-xs text-slate-400">per month</span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              value={reduction}
              onChange={(event) => setReduction(Number(event.target.value))}
              className="w-full accent-[#16a57a] cursor-pointer"
              aria-label="Monthly spending reduction percentage"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>0%</span><span>25%</span><span>50%</span>
            </div>
          </div>

          <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-[#21352f] text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Average monthly expenses</span>
              <strong className="font-bold text-slate-900 dark:text-white">
                ₹{data.baselineMonthlySpend.toLocaleString("en-IN")}
              </strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Potential monthly savings</span>
              <strong className="font-bold text-emerald-600">
                +₹{data.monthlySavingsIncrease.toLocaleString("en-IN")}
              </strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Potential 12-month savings</span>
              <strong className="font-bold text-emerald-600">
                +₹{data.annualSavingsIncrease.toLocaleString("en-IN")}
              </strong>
            </div>
          </div>
          {loading && <p className="text-xs text-slate-400">Recalculating…</p>}
          {data.disclaimer && <p className="text-[11px] leading-relaxed text-slate-400">{data.disclaimer}</p>}
        </div>

        <div className="lg:col-span-2 bg-white dark:bg-[#121f1c] rounded-xl p-6 border border-slate-200 dark:border-[#21352f] shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white">Estimated added savings</h3>
              <p className="text-xs text-slate-400">Cumulative savings from the selected reduction</p>
            </div>
            <span className="flex items-center gap-1.5 text-emerald-600 text-xs font-semibold">
              <TrendingUp size={15} /> 12-month estimate
            </span>
          </div>

          <div className="h-64 w-full mt-4">
            {data.projection.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.projection}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e8edf2" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(value) => `₹${Number(value ?? 0).toLocaleString("en-IN")}`} />
                  <Area type="monotone" dataKey="optimized" name="Scenario" stroke="#16a57a" strokeWidth={2.5} fill="#e6f7f0" />
                  <Area type="monotone" dataKey="current" name="No reduction" stroke="#94a3b8" strokeWidth={2} strokeDasharray="4 4" fill="none" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-slate-400">
                {loading ? "Loading…" : "Add completed expenses to calculate a projection."}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
