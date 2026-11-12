import React, { useEffect, useState } from "react";
import { ShoppingBag } from "lucide-react";
import { FinSightAPI, TransactionItem } from "../../services/finsightApi";
import { toast } from "sonner";

export const PurchasesView: React.FC = () => {
  const [purchases, setPurchases] = useState<TransactionItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    FinSightAPI.getPurchases()
      .then((result) => {
        if (active) setPurchases(result);
      })
      .catch((error: unknown) => {
        toast.error(error instanceof Error ? error.message : "Could not load PayPal purchases.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, []);

  return (
    <section className="space-y-6">
      <div>
        <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">PAYPAL CHECKOUT</p>
        <h1 className="text-2xl font-bold font-heading text-slate-900 dark:text-white">Purchases & Orders</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Captured PayPal payments recorded in your transaction ledger.
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-slate-400">Loading PayPal payments…</p>
      ) : purchases.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500 dark:border-[#21352f]">
          No PayPal checkout payments have been recorded.
        </div>
      ) : (
        <div className="space-y-3">
          {purchases.map((purchase) => (
            <article key={purchase.id} className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-5 dark:border-[#21352f] dark:bg-[#121f1c] sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/40">
                  <ShoppingBag size={17} />
                </span>
                <div>
                  <h2 className="text-sm font-semibold text-slate-900 dark:text-white">{purchase.merchant}</h2>
                  <p className="text-xs text-slate-500">
                    {purchase.category} · {purchase.date}
                    {purchase.referenceId ? ` · Ref ${purchase.referenceId}` : ""}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between gap-4 sm:justify-end">
                <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold uppercase text-slate-600 dark:bg-[#1a2f29] dark:text-slate-300">
                  {purchase.status.toLowerCase()}
                </span>
                <strong className="text-sm font-bold text-slate-900 dark:text-white">
                  {new Intl.NumberFormat("en-IN", { style: "currency", currency: purchase.currency }).format(Math.abs(purchase.amount))}
                </strong>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};
