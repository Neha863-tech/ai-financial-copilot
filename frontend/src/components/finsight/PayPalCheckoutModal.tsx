import React, { useEffect, useState } from "react";
import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
import { CheckCircle2, Loader2, ShieldCheck, X } from "lucide-react";
import { FinSightAPI } from "../../services/finsightApi";
import { toast } from "sonner";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface PayPalStatus {
  configured: boolean;
  environment: string;
  currency: string;
  clientId: string | null;
  message?: string;
}

export const PayPalCheckoutModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const [merchant, setMerchant] = useState("");
  const [item, setItem] = useState("");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState<PayPalStatus | null>(null);
  const [loadingConfig, setLoadingConfig] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [completedOrderId, setCompletedOrderId] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    setCompleted(false);
    setCompletedOrderId("");
    setLoadingConfig(true);
    FinSightAPI.getPayPalStatus()
      .then(setStatus)
      .catch((error: unknown) => {
        toast.error(error instanceof Error ? error.message : "Could not check PayPal configuration.");
        setStatus(null);
      })
      .finally(() => setLoadingConfig(false));
  }, [isOpen]);

  if (!isOpen) return null;

  const currency = status?.currency || "USD";
  const currencyLabel = new Intl.NumberFormat("en", { style: "currency", currency }).format(0).replace(/[\d.,\s]/g, "");

  const createOrder = async () => {
    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      throw new Error("Enter an amount greater than zero.");
    }
    if (!merchant.trim() || !item.trim()) {
      throw new Error("Enter both a merchant and an item description.");
    }

    const order = await FinSightAPI.createPayPalOrder({
      amount: numericAmount,
      currency,
      merchantName: merchant.trim(),
      description: item.trim(),
    });
    return order.orderId;
  };

  const captureOrder = async (orderId: string) => {
    try {
      const capture = await FinSightAPI.capturePayPalOrder(orderId);
      if (capture.status !== "COMPLETED") {
        throw new Error(`PayPal order was not completed (status: ${capture.status}).`);
      }

      setCompletedOrderId(orderId);
      setCompleted(true);
      toast.success("PayPal payment captured and saved to your transaction ledger.");
      onSuccess();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not capture the PayPal order.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-[#121f1c] rounded-2xl w-full max-w-md p-6 shadow-2xl border border-slate-200 dark:border-[#21352f]">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-[#21352f]">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-[#003087] text-white flex items-center justify-center font-bold text-sm">P</span>
            <div>
              <h3 className="font-heading font-semibold text-slate-900 dark:text-white">PayPal Checkout</h3>
              <p className="text-xs text-slate-500">Approval and capture are handled by PayPal.</p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close PayPal checkout" className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-white">
            <X size={18} />
          </button>
        </div>

        {loadingConfig ? (
          <div className="flex items-center justify-center gap-2 py-10 text-sm text-slate-500">
            <Loader2 size={16} className="animate-spin" /> Checking PayPal…
          </div>
        ) : completed ? (
          <div className="py-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 size={28} />
            </div>
            <h4 className="font-heading font-bold text-lg text-slate-900 dark:text-white">Payment captured</h4>
            <p className="text-xs text-slate-500">
              PayPal order {completedOrderId} was captured. The backend recorded the transaction.
            </p>
            <button onClick={onClose} className="px-6 py-2.5 rounded-lg bg-[#16a57a] text-white font-medium text-xs">
              Done
            </button>
          </div>
        ) : !status?.configured || !status.clientId ? (
          <div className="py-6 space-y-3">
            <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">PayPal is not configured.</p>
            <p className="text-xs text-slate-500">
              Configure the PayPal sandbox credentials in the backend environment before starting checkout.
              {status?.message ? ` ${status.message}` : ""}
            </p>
          </div>
        ) : (
          <div className="py-4 space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1" htmlFor="paypal-merchant">
                Merchant / Store
              </label>
              <input id="paypal-merchant" value={merchant} onChange={(event) => setMerchant(event.target.value)} className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-[#0e1715] dark:border-[#21352f] dark:text-white" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1" htmlFor="paypal-item">
                Item description
              </label>
              <input id="paypal-item" value={item} onChange={(event) => setItem(event.target.value)} className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-[#0e1715] dark:border-[#21352f] dark:text-white" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1" htmlFor="paypal-amount">
                Amount ({currencyLabel})
              </label>
              <input id="paypal-amount" type="number" min="0.01" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-[#0e1715] dark:border-[#21352f] dark:text-white font-semibold" />
            </div>

            <div className="bg-[#f0f7f4] dark:bg-[#14352b] p-3 rounded-lg text-xs text-[#16a57a] dark:text-[#8be0bf] flex items-center gap-2">
              <ShieldCheck size={16} />
              <span>{status.environment} checkout in {currency}. Successful captures are saved in your ledger.</span>
            </div>

            <PayPalScriptProvider options={{ clientId: status.clientId, currency, intent: "capture" }}>
              <PayPalButtons
                style={{ layout: "vertical" }}
                createOrder={createOrder}
                onApprove={(data) => captureOrder(data.orderID)}
                onError={(error) => toast.error(error instanceof Error ? error.message : "PayPal checkout failed.")}
              />
            </PayPalScriptProvider>
          </div>
        )}
      </div>
    </div>
  );
};
