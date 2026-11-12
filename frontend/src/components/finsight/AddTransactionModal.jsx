import React, { useState } from "react";
import { X, Check } from "lucide-react";
import { FinSightAPI } from "../../services/finsightApi";
import { toast } from "sonner";
export const AddTransactionModal = ({ isOpen, onClose, onSuccess }) => {
    const [title, setTitle] = useState("");
    const [amount, setAmount] = useState("");
    const [type, setType] = useState("Expense");
    const [category, setCategory] = useState("Food & dining");
    const [date, setDate] = useState("2024-09-16");
    const [method, setMethod] = useState("HDFC Bank");
    const [loading, setLoading] = useState(false);
    if (!isOpen)
        return null;
    const handleSave = async () => {
        const numeric = parseFloat(amount);
        if (!title.trim() || !numeric) {
            toast.error("Please add a title and valid amount");
            return;
        }
        setLoading(true);
        try {
            await FinSightAPI.addTransaction({
                merchant: title,
                amount: numeric,
                type: type.toUpperCase(),
                category,
                paymentMethod: method,
                date,
            });
            toast.success("Transaction added to ledger and budget updated");
            onSuccess();
            onClose();
        }
        catch (err) {
            toast.error(err.message || "Failed to record transaction");
        }
        finally {
            setLoading(false);
        }
    };
    return (<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-[#121f1c] rounded-2xl w-full max-w-md p-6 shadow-2xl border border-slate-200 dark:border-[#21352f] animate-rise space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#21352f]">
          <div>
            <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">NEW ENTRY</p>
            <h3 className="font-heading font-semibold text-slate-900 dark:text-white">
              Add Transaction
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-white">
            <X size={18}/>
          </button>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <label className="block font-medium text-slate-600 dark:text-slate-300 mb-1">
              Transaction Title / Merchant
            </label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Grocery run, Blue Tokai Coffee" className="w-full px-3 py-2 border rounded-lg dark:bg-[#0e1715] dark:border-[#21352f] dark:text-white"/>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-600 dark:text-slate-300 mb-1">
                Amount (₹)
              </label>
              <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="₹ 0" className="w-full px-3 py-2 border rounded-lg dark:bg-[#0e1715] dark:border-[#21352f] dark:text-white font-semibold"/>
            </div>
            <div>
              <label className="block font-medium text-slate-600 dark:text-slate-300 mb-1">
                Type
              </label>
              <select value={type} onChange={(e) => setType(e.target.value)} className="w-full px-3 py-2 border rounded-lg dark:bg-[#0e1715] dark:border-[#21352f] dark:text-white">
                <option>Expense</option>
                <option>Income</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-600 dark:text-slate-300 mb-1">
                Category
              </label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-3 py-2 border rounded-lg dark:bg-[#0e1715] dark:border-[#21352f] dark:text-white">
                <option>Food & dining</option>
                <option>Shopping</option>
                <option>Transport</option>
                <option>Utilities</option>
                <option>Rent & home</option>
                <option>Entertainment</option>
                <option>Education</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-600 dark:text-slate-300 mb-1">
                Date
              </label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full px-3 py-2 border rounded-lg dark:bg-[#0e1715] dark:border-[#21352f] dark:text-white"/>
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-600 dark:text-slate-300 mb-1">
              Payment Method
            </label>
            <select value={method} onChange={(e) => setMethod(e.target.value)} className="w-full px-3 py-2 border rounded-lg dark:bg-[#0e1715] dark:border-[#21352f] dark:text-white">
              <option>HDFC Bank</option>
              <option>PayPal</option>
              <option>UPI</option>
              <option>ICICI Card</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-[#21352f]">
          <button onClick={onClose} className="px-3.5 py-2 rounded-lg border border-slate-200 dark:border-[#21352f] text-xs font-semibold text-slate-600 dark:text-slate-300">
            Cancel
          </button>
          <button onClick={handleSave} disabled={loading} className="px-4 py-2 rounded-lg bg-[#16a57a] hover:bg-[#138e69] text-white text-xs font-semibold flex items-center gap-1.5">
            <Check size={15}/> Save entry
          </button>
        </div>
      </div>
    </div>);
};
