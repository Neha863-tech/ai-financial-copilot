import React, { useEffect, useState } from "react";
import { TrendingUp, RefreshCw, Activity, Target, Sparkles, ShieldCheck, ArrowUpRight } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, Tooltip } from "recharts";
import { FinSightAPI } from "../../services/finsightApi";

export const AnalyticsView: React.FC = () => {
  const [data, setData] = useState<any>({
    dailyRhythm: [
      { d: "Mon", v: 3100 },
      { d: "Tue", v: 2800 },
      { d: "Wed", v: 4200 },
      { d: "Thu", v: 3500 },
      { d: "Fri", v: 5100 },
      { d: "Sat", v: 6800 },
      { d: "Sun", v: 5700 },
    ],
    highlights: [
      { label: "Weekend spending", value: "+32%", sub: "higher than weekdays" },
      { label: "Recurring payments", value: "3 detected", sub: "₹2,750 per month" },
      { label: "Unusual activity", value: "1 flagged", sub: "Amazon · ₹2,499" },
      { label: "Smart opportunity", value: "₹2,000", sub: "potential monthly savings" },
    ],
  });

  useEffect(() => {
    FinSightAPI.getSpendingPatterns().then((res) => {
      if (res && res.dailyRhythm) setData(res);
    });
  }, []);

  return (
    <section className="space-y-6">
      <div>
        <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">PATTERNS & SIGNALS</p>
        <h1 className="text-2xl font-bold font-heading text-slate-900 dark:text-white">
          Spending Analysis
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          See the habits behind your numbers with deterministic daily rhythms.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 bg-white dark:bg-[#121f1c] rounded-xl border border-slate-200 dark:border-[#21352f] shadow-xs">
          <span className="text-xs text-slate-400 block mb-1">Weekend spending</span>
          <strong className="text-xl font-bold font-heading text-rose-500 block mb-1">+32%</strong>
          <span className="text-[11px] text-slate-500">higher than weekdays</span>
        </div>

        <div className="p-4 bg-white dark:bg-[#121f1c] rounded-xl border border-slate-200 dark:border-[#21352f] shadow-xs">
          <span className="text-xs text-slate-400 block mb-1">Recurring payments</span>
          <strong className="text-xl font-bold font-heading text-amber-500 block mb-1">3 detected</strong>
          <span className="text-[11px] text-slate-500">₹2,750 per month</span>
        </div>

        <div className="p-4 bg-white dark:bg-[#121f1c] rounded-xl border border-slate-200 dark:border-[#21352f] shadow-xs">
          <span className="text-xs text-slate-400 block mb-1">Unusual activity</span>
          <strong className="text-xl font-bold font-heading text-blue-500 block mb-1">1 flagged</strong>
          <span className="text-[11px] text-slate-500">Amazon · ₹2,499</span>
        </div>

        <div className="p-4 bg-white dark:bg-[#121f1c] rounded-xl border border-slate-200 dark:border-[#21352f] shadow-xs">
          <span className="text-xs text-slate-400 block mb-1">Smart opportunity</span>
          <strong className="text-xl font-bold font-heading text-emerald-600 block mb-1">₹2,000</strong>
          <span className="text-[11px] text-slate-500">potential monthly savings</span>
        </div>
      </div>

      {/* Bar Chart: Daily rhythm */}
      <div className="p-5 bg-white dark:bg-[#121f1c] rounded-xl border border-slate-200 dark:border-[#21352f] shadow-xs">
        <h2 className="text-base font-bold font-heading text-slate-900 dark:text-white mb-1">
          Daily Spending Rhythm
        </h2>
        <p className="text-xs text-slate-400 mb-4">Your spending by day of the week</p>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.dailyRhythm}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e8edf2" />
              <XAxis dataKey="d" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v: any) => `₹${v.toLocaleString()}`} />
              <Bar dataKey="v" fill="#16a57a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Observation Notes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 bg-white dark:bg-[#121f1c] rounded-xl border border-slate-200 dark:border-[#21352f] shadow-xs space-y-2">
          <span className="flex items-center gap-1.5 text-xs font-bold text-[#16a57a] uppercase">
            <Sparkles size={14} /> AI Observation
          </span>
          <h3 className="font-heading font-bold text-sm text-slate-900 dark:text-white">
            Your weekends are your biggest opportunity.
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            You spend an average of ₹6,250 every weekend, mostly across dining and shopping. Planning one no-spend day could save around ₹1,200 monthly.
          </p>
        </div>

        <div className="p-5 bg-white dark:bg-[#121f1c] rounded-xl border border-slate-200 dark:border-[#21352f] shadow-xs space-y-2">
          <span className="flex items-center gap-1.5 text-xs font-bold text-amber-500 uppercase">
            <ShieldCheck size={14} /> Health Check
          </span>
          <h3 className="font-heading font-bold text-sm text-slate-900 dark:text-white">
            One transaction needs a look.
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            We found a new Amazon charge (₹2,499 via PayPal) that is 2× your usual shopping category average.
          </p>
        </div>
      </div>
    </section>
  );
};
