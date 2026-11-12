import React, { useEffect, useState } from "react";
import { CalendarDays, Check, Plus, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { FinSightAPI, type RecurringBillItem, type ReminderItem } from "../../services/finsightApi";

export const BillsView: React.FC = () => {
  const [bills, setBills] = useState<RecurringBillItem[]>([]);
  const [reminders, setReminders] = useState<ReminderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [detecting, setDetecting] = useState(false);
  const [savingReminder, setSavingReminder] = useState(false);
  const [completingReminder, setCompletingReminder] = useState<string | null>(null);
  const [showReminderForm, setShowReminderForm] = useState(false);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState(() => new Date().toISOString().slice(0, 10));

  const loadBills = async () => {
    try {
      const [nextBills, nextReminders] = await Promise.all([
        FinSightAPI.getBills(),
        FinSightAPI.getReminders(),
      ]);
      setBills(nextBills);
      setReminders(nextReminders);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not load bills and reminders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadBills();
  }, []);

  const detectRecurring = async () => {
    setDetecting(true);
    try {
      const result = await FinSightAPI.detectRecurringPayments();
      await loadBills();
      toast.success(`Found ${result.detected.length} recurring payment(s).`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not detect recurring payments.");
    } finally {
      setDetecting(false);
    }
  };

  const saveReminder = async (event: React.FormEvent) => {
    event.preventDefault();
    setSavingReminder(true);
    try {
      await FinSightAPI.createReminder({
        title: title.trim(),
        ...(amount ? { amount: Number(amount), currency: "INR" } : {}),
        dueAt: new Date(`${dueDate}T12:00:00`).toISOString(),
      });
      setTitle("");
      setAmount("");
      setShowReminderForm(false);
      await loadBills();
      toast.success("Reminder created.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not create reminder.");
    } finally {
      setSavingReminder(false);
    }
  };

  const completeReminder = async (reminder: ReminderItem) => {
    setCompletingReminder(reminder.id);
    try {
      await FinSightAPI.updateReminder(reminder.id, { status: "COMPLETED" });
      await loadBills();
      toast.success("Reminder marked complete.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update reminder.");
    } finally {
      setCompletingReminder(null);
    }
  };

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">RECURRING COMMITMENTS</p>
          <h1 className="text-2xl font-bold font-heading text-slate-900 dark:text-white">
            Bills & Subscriptions
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Track reminders and recurring charges detected from your transactions.
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            onClick={() => setShowReminderForm((visible) => !visible)}
            className="px-3.5 py-2 rounded-lg border border-slate-200 dark:border-[#21352f] text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5"
          >
            <Plus size={15} /> Add reminder
          </button>
          <button
            onClick={detectRecurring}
            disabled={detecting}
            className="px-3.5 py-2 rounded-lg bg-[#16a57a] hover:bg-[#138e69] text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm disabled:opacity-60"
          >
            <RefreshCw size={15} /> {detecting ? "Scanning…" : "Detect recurring"}
          </button>
        </div>
      </div>

      {showReminderForm && (
        <form
          onSubmit={saveReminder}
          className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-[#21352f] dark:bg-[#121f1c] sm:grid-cols-[2fr_1fr_1fr_auto]"
        >
          <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
            Reminder
            <input
              required
              maxLength={255}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-sm dark:border-[#21352f]"
              placeholder="e.g. Electricity bill"
            />
          </label>
          <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
            Amount (optional)
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-sm dark:border-[#21352f]"
              placeholder="INR"
            />
          </label>
          <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
            Due date
            <input
              required
              type="date"
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-sm dark:border-[#21352f]"
            />
          </label>
          <button
            type="submit"
            disabled={savingReminder}
            className="self-end rounded-lg bg-[#16a57a] px-4 py-2 text-xs font-semibold text-white disabled:opacity-60"
          >
            {savingReminder ? "Saving…" : "Save"}
          </button>
        </form>
      )}

      {loading ? (
        <p className="text-sm text-slate-400">Loading bills and reminders…</p>
      ) : (
        <>
          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-slate-800 dark:text-white">Upcoming reminders</h2>
            {reminders.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500 dark:border-[#21352f]">
                No upcoming reminders.
              </div>
            ) : (
              <div className="space-y-2">
                {reminders.map((reminder) => (
                  <div
                    key={reminder.id}
                    className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-[#21352f] dark:bg-[#121f1c]"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{reminder.title}</p>
                      <p className="text-xs text-slate-500">
                        Due {new Date(reminder.dueAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      {reminder.amount !== null && reminder.currency && (
                        <strong className="text-sm text-slate-800 dark:text-slate-200">
                          {new Intl.NumberFormat("en-IN", { style: "currency", currency: reminder.currency }).format(reminder.amount)}
                        </strong>
                      )}
                      <button
                        onClick={() => void completeReminder(reminder)}
                        disabled={completingReminder === reminder.id}
                        aria-label={`Mark ${reminder.title} complete`}
                        className="rounded-lg border border-slate-200 p-2 text-emerald-700 disabled:opacity-50 dark:border-[#21352f] dark:text-emerald-400"
                      >
                        <Check size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-slate-800 dark:text-white">Detected recurring payments</h2>
            {bills.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500 dark:border-[#21352f]">
                No recurring payments found. Scan your recorded transactions to detect patterns.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                {bills.map((bill) => (
                  <div
                    key={bill.id}
                    className="flex flex-col justify-between space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-xs dark:border-[#21352f] dark:bg-[#121f1c]"
                  >
                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-[#16a57a] dark:bg-emerald-950/40">
                          <RefreshCw size={14} />
                        </span>
                        <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-600 dark:bg-amber-950/40">
                          {bill.status}
                        </span>
                      </div>
                      <h3 className="font-heading text-sm font-bold text-slate-900 dark:text-white">{bill.name}</h3>
                      <span className="mt-0.5 block text-[11px] text-slate-400">
                        Frequency: {bill.frequency.toLowerCase()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between border-t border-slate-100 pt-3 dark:border-[#21352f]">
                      <div>
                        <span className="block text-[10px] text-slate-400">Due date</span>
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                          {bill.dueDate
                            ? new Date(bill.dueDate).toLocaleDateString("en-IN", { month: "short", day: "numeric" })
                            : "Not estimated"}
                        </span>
                      </div>
                      <strong className="font-heading text-base font-bold text-slate-900 dark:text-white">
                        {new Intl.NumberFormat("en-IN", { style: "currency", currency: bill.currency }).format(bill.amount)}
                      </strong>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}

      <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-[#f8fafc] p-6 dark:border-[#21352f] dark:bg-[#0e1715]">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950/60">
          <CalendarDays size={20} />
        </div>
        <div>
          <h4 className="font-heading text-xs font-semibold text-slate-900 dark:text-white">
            Recurring payment detection
          </h4>
          <p className="text-xs text-slate-500">
            Recurring payments are inferred from completed transactions; no external calendar or notification service is connected.
          </p>
        </div>
      </div>
    </section>
  );
};
