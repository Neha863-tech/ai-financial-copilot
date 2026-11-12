import React from "react";
export const ConnectedAccountsView = () => {
    const accounts = [
        {
            name: "PayPal Developer Sandbox",
            type: "Payment Gateway",
            status: "Connected",
            badge: "Active",
            lastSync: "Just now",
            note: "Primary payment processing & webhook synchronization.",
            connected: true,
            iconBg: "bg-[#003087]",
            iconText: "P",
        },
        {
            name: "HDFC Bank (Salary Account)",
            type: "Net Banking",
            status: "Connected",
            badge: "Active",
            lastSync: "Today, 09:00 AM",
            note: "Read-only balance synchronization & salary credit detection.",
            connected: true,
            iconBg: "bg-blue-700",
            iconText: "H",
        },
        {
            name: "ICICI Credit Card",
            type: "Credit Card",
            status: "Connected",
            badge: "Active",
            lastSync: "Yesterday",
            note: "Real-time POS and online transaction feed.",
            connected: true,
            iconBg: "bg-amber-600",
            iconText: "I",
        },
        {
            name: "Amazon India Shopping Account",
            type: "E-Commerce",
            status: "Import Available",
            badge: "CSV / Invoice",
            lastSync: "Sep 09, 2024",
            note: "Order-level item details verified via uploaded statements.",
            connected: false,
            iconBg: "bg-slate-800",
            iconText: "A",
        },
        {
            name: "Flipkart",
            type: "E-Commerce",
            status: "Coming Soon",
            badge: "Planned",
            lastSync: "None",
            note: "API integration awaiting merchant credential grant.",
            connected: false,
            iconBg: "bg-yellow-600",
            iconText: "F",
        },
    ];
    return (<section className="space-y-6">
      <div>
        <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">INTEGRATIONS & PROVIDERS</p>
        <h1 className="text-2xl font-bold font-heading text-slate-900 dark:text-white">
          Connected Accounts
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          One calm, transparent view of your verified payment pipelines and bank connections.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts.map((acc, idx) => (<div key={idx} className="p-5 bg-white dark:bg-[#121f1c] rounded-xl border border-slate-200 dark:border-[#21352f] shadow-xs flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className={`w-8 h-8 rounded-lg ${acc.iconBg} text-white flex items-center justify-center font-bold text-xs`}>
                  {acc.iconText}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${acc.connected
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                : "bg-slate-100 text-slate-600 dark:bg-[#182923] dark:text-slate-400"}`}>
                  {acc.status}
                </span>
              </div>
              <h3 className="font-heading font-semibold text-sm text-slate-900 dark:text-white">
                {acc.name}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                {acc.note}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-[#21352f] flex items-center justify-between text-xs">
              <span className="text-slate-400">Sync: {acc.lastSync}</span>
              <span className="text-slate-500 font-medium">{acc.type}</span>
            </div>
          </div>))}
      </div>
    </section>);
};
