import React, { useEffect, useState } from "react";
import { X, Check } from "lucide-react";
import { CategoryItem, FinSightAPI } from "../../services/finsightApi";
import { toast } from "sonner";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AddTransactionModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"EXPENSE" | "INCOME">("EXPENSE");
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    FinSightAPI.getCategories()
      .then(setCategories)
      .catch((error: unknown) => {
        toast.error(error instanceof Error ? error.message : "Could not load categories.");
      });
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = async () => {
    const numeric = parseFloat(amount);
    if (!title.trim() || !Number.isFinite(numeric) || numeric <= 0) {
      toast.error("Please add a title and valid amount");
      return;
    }

    setLoading(true);
    try {
      await FinSightAPI.addTransaction({
        merchant: title,
        amount: numeric,
        direction: type,
        categoryId: categoryId || null,
        transactionDate: date,
      });

      toast.success("Transaction added to ledger and budget updated");
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to record transaction");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-[#121f1c] rounded-2xl w-full max-w-md p-6 shadow-2xl border border-slate-200 dark:border-[#21352f] animate-rise space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#21352f]">
          <div>
            <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">NEW ENTRY</p>
            <h3 className="font-heading font-semibold text-slate-900 dark:text-white">
              Add Transaction
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-white">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <label className="block font-medium text-slate-600 dark:text-slate-300 mb-1">
              Transaction Title / Merchant
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Grocery run, Blue Tokai Coffee"
              className="w-full px-3 py-2 border rounded-lg dark:bg-[#0e1715] dark:border-[#21352f] dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-600 dark:text-slate-300 mb-1">
                Amount (₹)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="₹ 0"
                className="w-full px-3 py-2 border rounded-lg dark:bg-[#0e1715] dark:border-[#21352f] dark:text-white font-semibold"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-600 dark:text-slate-300 mb-1">
                Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as "EXPENSE" | "INCOME")}
                className="w-full px-3 py-2 border rounded-lg dark:bg-[#0e1715] dark:border-[#21352f] dark:text-white"
              >
                <option value="EXPENSE">Expense</option>
                <option value="INCOME">Income</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-600 dark:text-slate-300 mb-1">
                Category
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg dark:bg-[#0e1715] dark:border-[#21352f] dark:text-white"
              >
                <option value="">Auto-categorize</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-600 dark:text-slate-300 mb-1">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg dark:bg-[#0e1715] dark:border-[#21352f] dark:text-white"
              />
            </div>
          </div>

        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-[#21352f]">
          <button
            onClick={onClose}
            className="px-3.5 py-2 rounded-lg border border-slate-200 dark:border-[#21352f] text-xs font-semibold text-slate-600 dark:text-slate-300"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-[#16a57a] hover:bg-[#138e69] text-white text-xs font-semibold flex items-center gap-1.5"
          >
            <Check size={15} /> Save entry
          </button>
        </div>
      </div>
    </div>
  );
};
