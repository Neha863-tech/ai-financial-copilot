import React, { useState, useEffect } from "react";
import { Bell, CheckCircle2, Clock, AlertTriangle, CreditCard, Info, Check, } from "lucide-react";
import { FinSightAPI } from "../../services/finsightApi";
import { toast } from "sonner";
export const NotificationsView = () => {
    const [notifications, setNotifications] = useState([]);
    const [filter, setFilter] = useState("all");
    useEffect(() => {
        FinSightAPI.getNotifications().then((res) => {
            if (res && res.length > 0)
                setNotifications(res);
        });
    }, []);
    const handleMarkAsRead = async (id) => {
        await FinSightAPI.markNotificationRead(id);
        setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
        toast.success("Notification marked as read");
    };
    const filtered = notifications.filter((n) => (filter === "unread" ? !n.isRead : true));
    const getIcon = (type) => {
        switch (type) {
            case "BILL_DUE":
                return <Clock className="text-amber-500" size={18}/>;
            case "BUDGET_WARNING":
                return <AlertTriangle className="text-rose-500" size={18}/>;
            case "PAYPAL_PAYMENT":
                return <CreditCard className="text-blue-500" size={18}/>;
            default:
                return <Info className="text-emerald-500" size={18}/>;
        }
    };
    return (<div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
            SIGNALS & REMINDERS
          </p>
          <h1 className="text-2xl font-bold font-heading text-slate-900 dark:text-white flex items-center gap-2">
            <Bell className="text-[#16a57a]" size={26}/> Notifications & Alerts
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time notifications for upcoming bills, category limit warnings, and PayPal order synchronization.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-lg p-0.5 bg-slate-100 dark:bg-[#1c3029]">
            <button onClick={() => setFilter("all")} className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${filter === "all"
            ? "bg-white dark:bg-[#121f1c] text-[#16a57a] shadow-xs"
            : "text-slate-500 hover:text-slate-900 dark:hover:text-white"}`}>
              All Notifications
            </button>
            <button onClick={() => setFilter("unread")} className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${filter === "unread"
            ? "bg-white dark:bg-[#121f1c] text-[#16a57a] shadow-xs"
            : "text-slate-500 hover:text-slate-900 dark:hover:text-white"}`}>
              Unread Only
            </button>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="p-5 bg-white dark:bg-[#121f1c] rounded-xl border border-slate-200 dark:border-[#21352f] shadow-xs space-y-3">
        {filtered.length === 0 ? (<div className="py-12 text-center text-xs text-slate-400">
            <CheckCircle2 size={32} className="text-[#16a57a] mx-auto mb-2 opacity-60"/>
            You're all caught up! No unread notifications.
          </div>) : (<div className="divide-y divide-slate-100 dark:divide-[#1e342c]">
            {filtered.map((item) => (<div key={item.id} className={`py-3.5 flex items-start justify-between gap-4 transition-all ${!item.isRead ? "bg-emerald-50/20 dark:bg-emerald-950/10 -mx-5 px-5" : ""}`}>
                <div className="flex items-start gap-3.5">
                  <span className="p-2 rounded-lg bg-slate-50 dark:bg-[#182a24] shrink-0 mt-0.5">
                    {getIcon(item.type)}
                  </span>
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      {item.title}
                      {!item.isRead && (<span className="w-2 h-2 rounded-full bg-[#16a57a]"/>)}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      {item.message}
                    </p>
                    <span className="text-[10px] text-slate-400 block pt-1">
                      {new Date(item.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>

                {!item.isRead && (<button onClick={() => handleMarkAsRead(item.id)} className="p-1.5 rounded-lg border border-slate-200 dark:border-[#21352f] hover:bg-slate-100 dark:hover:bg-[#182a24] text-slate-500 text-xs shrink-0" title="Mark as read">
                    <Check size={14}/>
                  </button>)}
              </div>))}
          </div>)}
      </div>
    </div>);
};
