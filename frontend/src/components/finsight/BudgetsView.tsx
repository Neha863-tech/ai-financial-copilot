import React, { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Plus, X } from "lucide-react";
import { BudgetItem, CategoryItem, FinSightAPI } from "../../services/finsightApi";
import { toast } from "sonner";

function getCurrentMonthDates() {
  const now = new Date();
  const first = new Date(now.getFullYear(), now.getMonth(), 1);
  const next = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return {
    start: `${first.getFullYear()}-${String(first.getMonth() + 1).padStart(2, "0")}-01`,
    end: `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, "0")}-01`,
  };
}

export const BudgetsView: React.FC = () => {
  const [budgets, setBudgets] = useState<BudgetItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [categoryId, setCategoryId] = useState("");
  const [amount, setAmount] = useState("");
  const [saving, setSaving] = useState(false);
  const period = useMemo(getCurrentMonthDates, []);

  const loadBudgets = async () => {
    setLoading(true);
    try {
      const [budgetList, categoryList] = await Promise.all([
        FinSightAPI.getBudgets(),
        FinSightAPI.getCategories(),
      ]);
      setBudgets(budgetList);
      setCategories(categoryList);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not load budgets.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadBudgets(); }, []);

  const currentBudgets = budgets.filter((budget) => {
    const start = new Date(budget.periodStart).toISOString().slice(0, 10);
    return start === period.start;
  });
  const totalLimit = currentBudgets.reduce((sum, budget) => sum + budget.amount, 0);
  const totalSpent = currentBudgets.reduce((sum, budget) => sum + budget.spent, 0);
  const utilization = totalLimit > 0 ? (totalSpent / totalLimit) * 100 : 0;

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) {
      toast.error("Enter a budget amount greater than zero.");
      return;
    }

    setSaving(true);
    try {
      await FinSightAPI.createBudget({
        categoryId: categoryId || null,
        amount: value,
        currency: "INR",
        periodStart: period.start,
        periodEnd: period.end,
      });
      setAmount("");
      setCategoryId("");
      setFormOpen(false);
      await loadBudgets();
      toast.success("Budget saved.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save budget.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">GUARDRAILS & DISCIPLINE</p>
          <h1 className="text-2xl font-bold font-heading text-slate-900 dark:text-white">Budget Management</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">Budgets and spending are loaded from your account.</p>
        </div>
        <button
          onClick={() => setFormOpen(true)}
          className="px-3.5 py-2 rounded-lg bg-[#16a57a] hover:bg-[#138e69] text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm"
        >
          <Plus size={15} /> Add budget
        </button>
      </div>

      <div className="p-6 bg-white dark:bg-[#121f1c] rounded-xl border border-slate-200 dark:border-[#21352f] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold font-heading text-slate-900 dark:text-white">
              {new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" })} budgets
            </h2>
            <p className="text-xs text-slate-400">
              ₹{Math.max(0, totalLimit - totalSpent).toLocaleString("en-IN")} remaining out of ₹{totalLimit.toLocaleString("en-IN")}
            </p>
          </div>
          <strong className="text-2xl font-bold font-heading text-emerald-600">{utilization.toFixed(0)}% used</strong>
        </div>
        <div className="w-full bg-slate-100 dark:bg-[#183129] h-2.5 rounded-full overflow-hidden">
          <div className="bg-[#16a57a] h-full rounded-full" style={{ width: `${Math.min(100, utilization)}%` }} />
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-slate-400">Loading budgets…</p>
      ) : currentBudgets.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500 dark:border-[#21352f]">
          No budgets for this month yet. Add one to start tracking limits.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentBudgets.map((budget) => {
            const overBudget = budget.status === "EXCEEDED";
            return (
              <div key={budget.id} className="p-5 bg-white dark:bg-[#121f1c] rounded-xl border border-slate-200 dark:border-[#21352f] shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading font-semibold text-sm text-slate-900 dark:text-white">{budget.name}</h3>
                  {overBudget
                    ? <AlertTriangle size={16} className="text-rose-500" />
                    : <CheckCircle2 size={16} className="text-[#16a57a]" />}
                </div>
                <div className="w-full bg-slate-100 dark:bg-[#183129] h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${overBudget ? "bg-rose-500" : "bg-[#16a57a]"}`}
                    style={{ width: `${Math.min(100, budget.utilization)}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Spent ₹{budget.spent.toLocaleString("en-IN")}</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Limit ₹{budget.amount.toLocaleString("en-IN")}</span>
                </div>
                <p className="text-[11px] text-slate-400">{budget.status.replace("_", " ")}</p>
              </div>
            );
          })}
        </div>
      )}

      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <form onSubmit={handleCreate} className="w-full max-w-md space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-[#21352f] dark:bg-[#121f1c]">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-slate-900 dark:text-white">Add monthly budget</h2>
              <button type="button" onClick={() => setFormOpen(false)} aria-label="Close budget form">
                <X size={18} />
              </button>
            </div>
            <label className="block text-xs text-slate-500">
              Category
              <select value={categoryId} onChange={(event) => setCategoryId(event.target.value)} className="mt-1 w-full rounded-lg border p-2 dark:bg-[#0e1715] dark:border-[#21352f]">
                <option value="">Overall budget</option>
                {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
              </select>
            </label>
            <label className="block text-xs text-slate-500">
              Monthly limit (INR)
              <input type="number" min="0.01" step="0.01" required value={amount} onChange={(event) => setAmount(event.target.value)} className="mt-1 w-full rounded-lg border p-2 dark:bg-[#0e1715] dark:border-[#21352f]" />
            </label>
            <p className="text-xs text-slate-400">Period: {period.start} through {period.end}</p>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setFormOpen(false)} className="rounded-lg border px-3 py-2 text-xs">Cancel</button>
              <button type="submit" disabled={saving} className="rounded-lg bg-[#16a57a] px-4 py-2 text-xs font-semibold text-white disabled:opacity-50">
                {saving ? "Saving…" : "Save budget"}
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
};
