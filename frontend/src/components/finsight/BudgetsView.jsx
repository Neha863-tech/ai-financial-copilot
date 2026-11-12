import React from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
export const BudgetsView = ({ pulse }) => {
    const budgetCategories = [
        { name: "Rent & home", allocated: 15000, spent: 15000 },
        { name: "Food & dining", allocated: 12000, spent: 9200 },
        { name: "Shopping", allocated: 5500, spent: 6800, over: true },
        { name: "Transport", allocated: 5000, spent: 4200 },
        { name: "Utilities", allocated: 3500, spent: 3179 },
        { name: "Education", allocated: 4000, spent: 3500 },
        { name: "Entertainment", allocated: 2000, spent: 649 },
    ];
    return (<section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">GUARDRAILS & DISCIPLINE</p>
          <h1 className="text-2xl font-bold font-heading text-slate-900 dark:text-white">
            Budget Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            A flexible budget that adapts to real life and prevents unexpected month-end deficits.
          </p>
        </div>
        <button onClick={() => toast.info("Category limit adjustments ready")} className="px-3.5 py-2 rounded-lg bg-[#16a57a] hover:bg-[#138e69] text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm">
          <Plus size={15}/> Edit budget
        </button>
      </div>

      {/* Main Budget Strip */}
      <div className="p-6 bg-white dark:bg-[#121f1c] rounded-xl border border-slate-200 dark:border-[#21352f] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold font-heading text-slate-900 dark:text-white">
              September Budget Health
            </h2>
            <p className="text-xs text-slate-400">
              ₹{pulse.budgetRemaining.toLocaleString()} remaining out of ₹{pulse.budgetLimit.toLocaleString()} monthly limit
            </p>
          </div>
          <strong className="text-2xl font-bold font-heading text-emerald-600">
            {pulse.budgetUtilizationPct}% Used
          </strong>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 dark:bg-[#183129] h-2.5 rounded-full overflow-hidden">
          <div className="bg-[#16a57a] h-full rounded-full transition-all duration-500" style={{ width: `${pulse.budgetUtilizationPct}%` }}/>
        </div>
      </div>

      {/* Category Breakdowns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {budgetCategories.map((cat, idx) => {
            const pct = Math.min(100, Math.round((cat.spent / cat.allocated) * 100));
            const isOver = cat.spent > cat.allocated;
            return (<div key={idx} className="p-5 bg-white dark:bg-[#121f1c] rounded-xl border border-slate-200 dark:border-[#21352f] shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-heading font-semibold text-xs text-slate-900 dark:text-white">
                  {cat.name}
                </h3>
                <span className={`text-[10px] font-bold ${isOver ? "text-rose-500 font-extrabold" : "text-slate-500"}`}>
                  {pct}% used
                </span>
              </div>

              <div className="w-full bg-slate-100 dark:bg-[#183129] h-2 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${isOver ? "bg-rose-500" : "bg-[#16a57a]"}`} style={{ width: `${pct}%` }}/>
              </div>

              <div className="flex justify-between text-xs pt-1">
                <span className="text-slate-400">
                  Spent: ₹{cat.spent.toLocaleString()}
                </span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Limit: ₹{cat.allocated.toLocaleString()}
                </span>
              </div>
            </div>);
        })}
      </div>
    </section>);
};
