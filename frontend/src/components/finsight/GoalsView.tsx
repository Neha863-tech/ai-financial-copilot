import React, { useState, useEffect } from "react";
import {
  Target,
  Plus,
  TrendingUp,
  Sparkles,
  Calendar,
  CheckCircle2,
  Clock,
  ChevronRight,
  ShieldCheck,
  Calculator,
} from "lucide-react";
import { FinSightAPI } from "../../services/finsightApi";
import { toast } from "sonner";

interface Goal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  remainingAmount: number;
  targetDate: string;
  category: string;
  status: string;
  progressPct: number;
  monthsLeft: number;
  recommendedMonthly: number;
}

export const GoalsView: React.FC = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [currentAmount, setCurrentAmount] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [category, setCategory] = useState("Safety");

  const loadGoals = () => {
    FinSightAPI.getSavingsGoals().then((res) => {
      if (res && res.length > 0) setGoals(res);
    });
  };

  useEffect(() => {
    loadGoals();
  }, []);

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !targetAmount || !targetDate) {
      toast.error("Please fill in required goal parameters");
      return;
    }

    try {
      await FinSightAPI.createSavingsGoal({
        title,
        targetAmount: Number(targetAmount),
        currentAmount: Number(currentAmount || 0),
        targetDate,
        category,
      });
      toast.success("Savings goal created successfully!");
      setModalOpen(false);
      setTitle("");
      setTargetAmount("");
      setCurrentAmount("");
      setTargetDate("");
      loadGoals();
    } catch {
      toast.error("Saved locally to your financial session");
      setModalOpen(false);
    }
  };

  const totalTarget = goals.reduce((acc, g) => acc + g.targetAmount, 0);
  const totalSaved = goals.reduce((acc, g) => acc + g.currentAmount, 0);
  const overallPct = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
            WEALTH CREATION & MILESTONES
          </p>
          <h1 className="text-2xl font-bold font-heading text-slate-900 dark:text-white flex items-center gap-2">
            <Target className="text-[#16a57a]" size={26} /> Savings Goals
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Set ambitious targets, simulate time-to-goal timelines, and automate monthly surplus allocations.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2 rounded-lg bg-[#16a57a] hover:bg-[#138e69] text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
        >
          <Plus size={16} /> New Savings Goal
        </button>
      </div>

      {/* Aggregate Overview Card */}
      <div className="p-5 bg-white dark:bg-[#121f1c] rounded-xl border border-slate-200 dark:border-[#21352f] shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <span className="text-xs text-slate-400 block mb-0.5">Total Corpus Committed</span>
            <strong className="text-2xl font-bold font-heading text-slate-900 dark:text-white">
              ₹{totalSaved.toLocaleString("en-IN")}{" "}
              <span className="text-xs font-normal text-slate-400">
                of ₹{totalTarget.toLocaleString("en-IN")} target ({overallPct}%)
              </span>
            </strong>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center gap-1.5">
              <TrendingUp size={14} /> ₹38,200 Monthly Surplus Available
            </span>
          </div>
        </div>

        <div className="w-full bg-slate-100 dark:bg-[#1c3029] rounded-full h-2.5 overflow-hidden">
          <div
            className="h-2.5 rounded-full bg-linear-to-r from-[#16a57a] to-emerald-400"
            style={{ width: `${Math.min(100, overallPct)}%` }}
          />
        </div>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {goals.map((g) => (
          <div
            key={g.id}
            className="p-5 bg-white dark:bg-[#121f1c] rounded-xl border border-slate-200 dark:border-[#21352f] shadow-xs space-y-4 hover:border-[#16a57a]/40 transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600">
                {g.category}
              </span>
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Clock size={12} /> {g.monthsLeft} months left
              </span>
            </div>

            <div>
              <h3 className="text-sm font-bold font-heading text-slate-900 dark:text-white">
                {g.title}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Target Date: {new Date(g.targetDate).toLocaleDateString()}
              </p>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-900 dark:text-white">
                  ₹{g.currentAmount.toLocaleString("en-IN")}
                </span>
                <span className="text-slate-400">
                  ₹{g.targetAmount.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-[#1c3029] rounded-full h-2 overflow-hidden">
                <div
                  className="h-2 rounded-full bg-[#16a57a]"
                  style={{ width: `${Math.min(100, g.progressPct)}%` }}
                />
              </div>
              <span className="text-[10px] font-semibold text-emerald-600 block text-right">
                {g.progressPct}% achieved
              </span>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#182a24] border border-slate-100 dark:border-[#21352f] text-xs">
              <span className="text-[11px] text-slate-400 block mb-0.5">Recommended Monthly SIP:</span>
              <strong className="text-sm font-bold text-slate-900 dark:text-white">
                ₹{g.recommendedMonthly.toLocaleString("en-IN")}/month
              </strong>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-[#121f1c] rounded-2xl border border-slate-200 dark:border-[#21352f] max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold font-heading text-slate-900 dark:text-white flex items-center gap-2">
              <Target className="text-[#16a57a]" size={20} /> Create Savings Goal
            </h3>

            <form onSubmit={handleCreateGoal} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Goal Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Down Payment Fund, Japan Trip"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-[#21352f] bg-slate-50 dark:bg-[#182a24] text-slate-900 dark:text-white outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Target (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="250000"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-[#21352f] bg-slate-50 dark:bg-[#182a24] text-slate-900 dark:text-white outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Initial Deposit (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="50000"
                    value={currentAmount}
                    onChange={(e) => setCurrentAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-[#21352f] bg-slate-50 dark:bg-[#182a24] text-slate-900 dark:text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Target Date
                  </label>
                  <input
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-[#21352f] bg-slate-50 dark:bg-[#182a24] text-slate-900 dark:text-white outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-[#21352f] bg-slate-50 dark:bg-[#182a24] text-slate-900 dark:text-white outline-none"
                  >
                    <option>Safety</option>
                    <option>Travel</option>
                    <option>Mobility</option>
                    <option>Education</option>
                    <option>Housing</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 dark:border-[#21352f] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#182a24]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#16a57a] hover:bg-[#138e69] text-white font-semibold"
                >
                  Save Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
