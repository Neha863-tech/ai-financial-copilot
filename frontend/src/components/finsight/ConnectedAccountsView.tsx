import React, { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Landmark } from "lucide-react";
import { FinSightAPI } from "../../services/finsightApi";
import { toast } from "sonner";

interface PayPalStatus {
  configured: boolean;
  environment: string;
  currency: string;
  message?: string;
}

export const ConnectedAccountsView: React.FC = () => {
  const [status, setStatus] = useState<PayPalStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    FinSightAPI.getPayPalStatus()
      .then((result) => {
        if (active) setStatus(result);
      })
      .catch((error: unknown) => {
        toast.error(error instanceof Error ? error.message : "Could not check PayPal configuration.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, []);

  return (
    <section className="space-y-6">
      <div>
        <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">INTEGRATIONS & PROVIDERS</p>
        <h1 className="text-2xl font-bold font-heading text-slate-900 dark:text-white">Connected Accounts</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Integration status reported by the backend.
        </p>
      </div>

      <article className="max-w-xl rounded-xl border border-slate-200 bg-white p-5 shadow-xs dark:border-[#21352f] dark:bg-[#121f1c]">
        <div className="flex items-start justify-between gap-4">
          <div className="flex gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#003087] font-bold text-white">P</span>
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">PayPal</h2>
              <p className="mt-1 text-xs text-slate-500">
                Sandbox payment processing; transactions are recorded after a successful capture.
              </p>
            </div>
          </div>
          {loading ? (
            <span className="text-xs text-slate-400">Checking…</span>
          ) : status?.configured ? (
            <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-bold uppercase text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
              <CheckCircle2 size={12} /> Ready
            </span>
          ) : (
            <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2 py-1 text-[10px] font-bold uppercase text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
              <AlertCircle size={12} /> Not configured
            </span>
          )}
        </div>
        {status && (
          <p className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-500 dark:border-[#21352f]">
            Environment: {status.environment} · Currency: {status.currency}
            {status.message ? ` · ${status.message}` : ""}
          </p>
        )}
      </article>

      <div className="flex items-start gap-3 rounded-xl border border-dashed border-slate-300 p-5 text-sm text-slate-500 dark:border-[#21352f]">
        <Landmark size={18} className="mt-0.5 shrink-0 text-slate-400" />
        <p>Bank account synchronization is not configured in this backend. Transactions can be entered manually or imported from a CSV statement.</p>
      </div>
    </section>
  );
};
