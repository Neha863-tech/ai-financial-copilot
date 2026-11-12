import React, { useEffect, useState } from "react";
import { RefreshCw, CalendarDays, CheckCircle2, Clock, Bell, Plus, ShieldCheck } from "lucide-react";
import { FinSightAPI } from "../../services/finsightApi";
import { toast } from "sonner";

export const BillsView: React.FC = () => {
  const [bills, setBills] = useState<any[]>([]);

  useEffect(() => {
    FinSightAPI.getBills().then((res) => {
      if (res) setBills(res);
    });
  }, []);

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">RECURRING COMMITMENTS</p>
          <h1 className="text-2xl font-bold font-heading text-slate-900 dark:text-white">
            Bills & Subscriptions
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Never be surprised by a recurring charge or utility deadline again.
          </p>
        </div>
        <button
          onClick={() => toast.info("Add new recurring bill dialog")}
          className="px-3.5 py-2 rounded-lg bg-[#16a57a] hover:bg-[#138e69] text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm"
        >
          <Plus size={15} /> Add reminder
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {bills.map((bill, idx) => (
          <div
            key={bill.id || idx}
            className="p-5 bg-white dark:bg-[#121f1c] rounded-xl border border-slate-200 dark:border-[#21352f] shadow-xs flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-[#16a57a] flex items-center justify-center font-bold text-xs">
                  <RefreshCw size={14} />
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-50 dark:bg-amber-950/40 text-amber-600">
                  {bill.status}
                </span>
              </div>
              <h3 className="font-heading font-bold text-sm text-slate-900 dark:text-white">
                {bill.name}
              </h3>
              <span className="text-[11px] text-slate-400 block mt-0.5">
                Frequency: {bill.frequency || "Monthly"}
              </span>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-[#21352f] flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 block">Due date</span>
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  {new Date(bill.dueDate).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                </span>
              </div>
              <strong className="text-base font-bold font-heading text-slate-900 dark:text-white">
                ₹{Number(bill.amount).toLocaleString()}
              </strong>
            </div>
          </div>
        ))}
      </div>

      {/* Bryntum Scheduler / Calendar Integration Panel */}
      <div className="p-6 bg-[#f8fafc] dark:bg-[#0e1715] rounded-xl border border-slate-200 dark:border-[#21352f] flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center flex-shrink-0">
          <CalendarDays size={20} />
        </div>
        <div>
          <h4 className="font-heading font-semibold text-xs text-slate-900 dark:text-white">
            Bryntum Financial Timeline & Reminders
          </h4>
          <p className="text-xs text-slate-500">
            Synchronized with your calendar to send 3-day WhatsApp/Email advance alerts before debits occur.
          </p>
        </div>
      </div>
    </section>
  );
};
