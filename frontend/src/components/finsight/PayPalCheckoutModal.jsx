import React, { useState } from "react";
import { X, CheckCircle2, ShieldCheck, Loader2 } from "lucide-react";
import { FinSightAPI } from "../../services/finsightApi";
import { toast } from "sonner";
export const PayPalCheckoutModal = ({ isOpen, onClose, onSuccess }) => {
    const [merchant, setMerchant] = useState("Bose Official Store");
    const [item, setItem] = useState("Bose QuietComfort 45 Headphones");
    const [amount, setAmount] = useState("18999");
    const [category, setCategory] = useState("Shopping");
    const [loading, setLoading] = useState(false);
    const [completed, setCompleted] = useState(false);
    const [capturedTx, setCapturedTx] = useState(null);
    if (!isOpen)
        return null;
    const handlePayWithPayPal = async () => {
        setLoading(true);
        try {
            const numAmount = parseFloat(amount);
            // 1. Create PayPal Order
            const orderRes = await FinSightAPI.createPayPalOrder({
                amount: numAmount,
                merchantName: merchant,
                description: item,
            });
            // 2. Capture PayPal Order
            const captureRes = await FinSightAPI.capturePayPalOrder(orderRes.orderId, merchant, category);
            setCapturedTx(captureRes.transaction);
            setCompleted(true);
            toast.success(`PayPal payment captured! Order ${orderRes.orderId}`);
            onSuccess();
        }
        catch (err) {
            toast.error(err.message || "PayPal checkout failed");
        }
        finally {
            setLoading(false);
        }
    };
    return (<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-[#121f1c] rounded-2xl w-full max-w-md p-6 shadow-2xl border border-slate-200 dark:border-[#21352f] animate-rise">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-[#21352f]">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-[#003087] text-white flex items-center justify-center font-bold text-sm">
              P
            </span>
            <div>
              <h3 className="font-heading font-semibold text-slate-900 dark:text-white">
                PayPal Sandbox Checkout
              </h3>
              <p className="text-xs text-slate-500">Fast, secure sandbox payment verification</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-white">
            <X size={18}/>
          </button>
        </div>

        {!completed ? (<div className="py-4 space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                Merchant / Store
              </label>
              <input value={merchant} onChange={(e) => setMerchant(e.target.value)} className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-[#0e1715] dark:border-[#21352f] dark:text-white"/>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                Item Description
              </label>
              <input value={item} onChange={(e) => setItem(e.target.value)} className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-[#0e1715] dark:border-[#21352f] dark:text-white"/>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                  Amount (₹)
                </label>
                <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-[#0e1715] dark:border-[#21352f] dark:text-white font-semibold"/>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                  Category
                </label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-[#0e1715] dark:border-[#21352f] dark:text-white">
                  <option>Shopping</option>
                  <option>Food & dining</option>
                  <option>Entertainment</option>
                  <option>Utilities</option>
                  <option>Transport</option>
                </select>
              </div>
            </div>

            <div className="bg-[#f0f7f4] dark:bg-[#14352b] p-3 rounded-lg text-xs text-[#16a57a] dark:text-[#8be0bf] flex items-center gap-2">
              <ShieldCheck size={16}/>
              <span>Payment will automatically sync to Ledger, Budget, and AI Assistant.</span>
            </div>

            <div className="pt-2">
              <button onClick={handlePayWithPayPal} disabled={loading} className="w-full py-3 px-4 rounded-xl font-bold bg-[#FFC439] hover:bg-[#F2BA36] text-[#003087] flex items-center justify-center gap-2 shadow-sm transition-all">
                {loading ? (<Loader2 size={18} className="animate-spin"/>) : (<>
                    <span className="font-extrabold italic text-base">PayPal</span>
                    <span className="text-sm font-semibold">Pay with PayPal</span>
                  </>)}
              </button>
            </div>
          </div>) : (<div className="py-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 size={28}/>
            </div>
            <h4 className="font-heading font-bold text-lg text-slate-900 dark:text-white">
              Payment Confirmed & Verified!
            </h4>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              ₹{Number(amount).toLocaleString()} was captured via PayPal Sandbox for {merchant}. Your financial pulse and AI insights have been updated.
            </p>
            <div className="pt-3">
              <button onClick={() => {
                setCompleted(false);
                onClose();
            }} className="px-6 py-2.5 rounded-lg bg-[#16a57a] hover:bg-[#138e69] text-white font-medium text-xs shadow-sm">
                Done
              </button>
            </div>
          </div>)}
      </div>
    </div>);
};
