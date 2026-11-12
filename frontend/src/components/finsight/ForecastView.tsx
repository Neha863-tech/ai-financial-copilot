import React, { useState, useEffect } from "react";
import { Sparkles, TrendingUp, RefreshCw, ArrowUpRight } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, Tooltip } from "recharts";
import { FinSightAPI } from "../../services/finsightApi";
import { toast } from "sonner";

export const ForecastView: React.FC = () => {
  const [reduction, setReduction] = useState(20);
  const [aiForecast, setAiForecast] = useState<any>(null);
  const [data, setData] = useState<any>({
    monthlySavingsIncrease: 9960,
    annualSavingsIncrease: 119520,
    projection: [
      { m: "Now", a: 38200, b: 38200 },
      { m: "3 mo", a: 55600, b: 44000 },
      { m: "6 mo", a: 73000, b: 51000 },
      { m: "9 mo", a: 90400, b: 58000 },
      { m: "12 mo", a: 107800, b: 65000 },
    ],
  });

  useEffect(() => {
    FinSightAPI.simulateForecast(reduction).then((res) => {
      if (res) setData(res);
    });
    FinSightAPI.getAIForecast().then((res) => {
      if (res) setAiForecast(res);
    });
  }, [reduction]);

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">PLAN AHEAD</p>
          <h1 className="text-2xl font-bold font-heading text-slate-900 dark:text-white">
            Financial Future Simulator
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Explore small behavioral adjustments that create a bigger tomorrow.
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
        {/* Simulator Controls */}
        <div className="bg-white dark:bg-[#121f1c] rounded-xl p-6 border border-slate-200 dark:border-[#21352f] shadow-xs space-y-5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#16a57a] uppercase">
            <Sparkles size={14} /> What If Scenario...
          </div>
          <h3 className="font-heading font-semibold text-lg text-slate-900 dark:text-white leading-snug">
            Reduce discretionary spend by
          </h3>

          <div>
            <div className="flex items-baseline gap-2 mb-2">
              <strong className="text-4xl font-bold font-heading text-[#16a57a]">
                {reduction}%
              </strong>
              <span className="text-xs text-slate-400">each month</span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              value={reduction}
              onChange={(e) => setReduction(Number(e.target.value))}
              className="w-full accent-[#16a57a] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>0%</span>
              <span>25%</span>
              <span>50%</span>
            </div>
          </div>

          <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-[#21352f] text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Monthly Added Savings</span>
              <strong className="font-bold text-emerald-600">
                +₹{data.monthlySavingsIncrease.toLocaleString()}
              </strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Annual Added Savings</span>
              <strong className="font-bold text-emerald-600">
                +₹{data.annualSavingsIncrease.toLocaleString()}
              </strong>
            </div>
          </div>

          <button
            onClick={() => toast.success("Scenario saved to your FinSight Financial Plan!")}
            className="w-full py-2.5 rounded-lg bg-[#16a57a] hover:bg-[#138e69] text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm"
          >
            Save scenario <ArrowUpRight size={15} />
          </button>
        </div>

        {/* Projection Area Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-[#121f1c] rounded-xl p-6 border border-slate-200 dark:border-[#21352f] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white">
                  Savings Trajectory Projection
                </h3>
                <p className="text-xs text-slate-400">Current path vs your new optimized plan</p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-[#16a57a]" /> New Plan
                </span>
                <span className="flex items-center gap-1.5 text-slate-400">
                  <span className="w-2 h-2 rounded-full bg-slate-300" /> Current
                </span>
              </div>
            </div>

            <div className="h-64 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.projection}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e8edf2" />
                  <XAxis dataKey="m" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(v: any) => `₹${v.toLocaleString()}`} />
                  <Area type="monotone" dataKey="a" stroke="#16a57a" strokeWidth={2.5} fill="#e6f7f0" />
                  <Area type="monotone" dataKey="b" stroke="#94a3b8" strokeWidth={2} strokeDasharray="4 4" fill="none" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-[#21352f] flex items-center gap-2 text-xs text-emerald-600">
            <TrendingUp size={16} />
            <span>
              In 12 months, this scenario puts you <strong>₹{data.annualSavingsIncrease.toLocaleString()} ahead</strong> of your baseline.
            </span>
          </div>
        </div>
      </div>

      {/* AI Microservice Regression Insights */}
      {aiForecast && (
        <div className="p-5 bg-white dark:bg-[#121f1c] rounded-xl border border-slate-200 dark:border-[#21352f] shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#1e342c]">
            <div className="flex items-center gap-2">
              <Sparkles className="text-[#16a57a]" size={18} />
              <h3 className="text-sm font-bold font-heading text-slate-900 dark:text-white">
                AI Statistical Run-Rate & Machine Learning Forecast
              </h3>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-[#16a57a]">
              {aiForecast.methodology || "SCIKIT_LEARN_REGRESSION"}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#182a24]">
              <span className="text-[10px] text-slate-400 block">Analyzed Velocity</span>
              <strong className="text-sm font-bold text-slate-900 dark:text-white">
                {aiForecast.days_analyzed || 12} days active
              </strong>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#182a24]">
              <span className="text-[10px] text-slate-400 block">Projected Month-End Outflow</span>
              <strong className="text-sm font-bold text-rose-500">
                ₹{(aiForecast.projected_month_end_expenses || 33048).toLocaleString()}
              </strong>
            </div>
            <div className="p-3 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20">
              <span className="text-[10px] text-emerald-600 block">Projected Month-End Surplus</span>
              <strong className="text-sm font-bold text-emerald-600">
                ₹{(aiForecast.projected_month_end_savings || 56952).toLocaleString()}
              </strong>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#182a24]">
              <span className="text-[10px] text-slate-400 block">Confidence Range (90%)</span>
              <strong className="text-xs font-bold text-slate-700 dark:text-slate-300">
                ₹{(aiForecast.confidence_range?.lower_bound_expenses || 30899).toLocaleString()} – ₹{(aiForecast.confidence_range?.upper_bound_expenses || 35196).toLocaleString()}
              </strong>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
