import React, { useEffect, useState } from "react";
import { ShoppingBag, ExternalLink, ShieldCheck, CheckCircle2, Sparkles, Plus } from "lucide-react";
import { FinSightAPI } from "../../services/finsightApi";

export const PurchasesView: React.FC = () => {
  const [purchases, setPurchases] = useState<any[]>([]);

  useEffect(() => {
    FinSightAPI.getPurchases().then((res) => {
      if (res) setPurchases(res);
    });
  }, []);

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">SHOPPING INTELLIGENCE</p>
          <h1 className="text-2xl font-bold font-heading text-slate-900 dark:text-white">
            Purchases & Orders
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Dedicated item-level shopping records linked to PayPal payment authorizations.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {purchases.map((p, idx) => (
          <div
            key={p.id || idx}
            className="p-5 bg-white dark:bg-[#121f1c] rounded-xl border border-slate-200 dark:border-[#21352f] shadow-xs space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-[#21352f] text-xs">
              <div className="flex items-center gap-3">
                <span className="font-bold text-slate-900 dark:text-white">
                  Order #{p.orderNumber}
                </span>
                <span className="text-slate-400">Merchant: {p.merchant}</span>
                <span className="text-slate-400">Date: {new Date(p.purchaseDate).toLocaleDateString("en-IN")}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                  {p.status}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-600">
                  PayPal Verified
                </span>
              </div>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-[#21352f]">
              {p.items?.map((item: any, iIdx: number) => (
                <div key={iIdx} className="py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.imageUrl || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100"}
                      alt={item.name}
                      className="w-12 h-12 object-cover rounded-lg border border-slate-200 dark:border-[#21352f]"
                    />
                    <div>
                      <h4 className="font-semibold text-xs text-slate-900 dark:text-white">
                        {item.name}
                      </h4>
                      <span className="text-[11px] text-slate-400">
                        Qty: {item.quantity} · Unit: ₹{Number(item.unitPrice).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <strong className="text-sm font-bold text-slate-900 dark:text-white font-heading">
                    ₹{(Number(item.unitPrice) * item.quantity).toLocaleString()}
                  </strong>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Channel3 MCP Recommendations Panel */}
      <div className="p-6 bg-[#f3faf6] dark:bg-[#0e1715] rounded-xl border border-[#dcebe4] dark:border-[#21352f] space-y-3">
        <div className="flex items-center gap-1.5 text-xs font-bold text-[#16a57a] uppercase">
          <Sparkles size={14} />
          <span>Channel3 Product Discovery & Price Benchmarks</span>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          When you search or plan a purchase, Channel3 MCP cross-examines verified OEM specifications, historical price curves, and merchant warranties to ensure you never overpay.
        </p>
      </div>
    </section>
  );
};
