import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Receipt,
  ShoppingBag,
  BarChart3,
  Target,
  Bot,
  TrendingUp,
  RefreshCw,
  Sparkles,
  Landmark,
  Settings,
  Bell,
  Sun,
  Moon,
  Menu,
  ChevronDown,
  Search,
  Plus,
  Activity,
  CreditCard,
} from "lucide-react";
import { FinSightAPI, FinancialPulse, TransactionItem } from "../../services/finsightApi";
import { OverviewView } from "./OverviewView";
import { TransactionsView } from "./TransactionsView";
import { AnalyticsView } from "./AnalyticsView";
import { AssistantView } from "./AssistantView";
import { ForecastView } from "./ForecastView";
import { BillsView } from "./BillsView";
import { PurchasesView } from "./PurchasesView";
import { BudgetsView } from "./BudgetsView";
import { ConnectedAccountsView } from "./ConnectedAccountsView";
import { AddTransactionModal } from "./AddTransactionModal";
import { PayPalCheckoutModal } from "./PayPalCheckoutModal";
import { Toaster, toast } from "sonner";

export const FinSightShell: React.FC = () => {
  const [currentPage, setCurrentPage] = useState("Overview");
  const [collapsed, setCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [paypalModalOpen, setPaypalModalOpen] = useState(false);

  const [pulse, setPulse] = useState<FinancialPulse>({
    totalIncome: 88000,
    totalExpenses: 49800,
    currentSavings: 38200,
    savingsRate: 43.4,
    budgetRemaining: 14200,
    budgetLimit: 64000,
    budgetUtilizationPct: 72,
    categoryBreakdown: [],
    monthlyTrends: [],
  });

  const [transactions, setTransactions] = useState<TransactionItem[]>([]);

  const loadData = async () => {
    try {
      const [p, t] = await Promise.all([FinSightAPI.getOverview(), FinSightAPI.getTransactions()]);
      setPulse(p);
      setTransactions(t);
    } catch {
      // Graceful fallback already in API client
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const navItems = [
    { label: "Overview", icon: LayoutDashboard },
    { label: "Transactions", icon: Receipt },
    { label: "Purchases & Orders", icon: ShoppingBag },
    { label: "Spending Analysis", icon: BarChart3 },
    { label: "Budgets", icon: Target },
    { label: "AI Financial Assistant", icon: Bot, isNew: true },
    { label: "Financial Forecast", icon: TrendingUp },
    { label: "Bills & Subscriptions", icon: RefreshCw },
    { label: "Connected Accounts", icon: Landmark },
    { label: "Settings", icon: Settings },
  ];

  return (
    <div className={`min-h-screen flex bg-[#f7f9fc] dark:bg-[#0b1311] text-[#101828] dark:text-[#f2f7f5] transition-colors duration-200`}>
      {/* Sidebar */}
      <aside
        className={`${
          collapsed ? "w-18" : "w-64"
        } bg-white dark:bg-[#121f1c] border-r border-slate-200 dark:border-[#21352f] p-5 flex flex-col flex-shrink-0 transition-all duration-300 z-30`}
      >
        {/* Brand */}
        <div className="flex items-center gap-2.5 mb-6">
          <span className="w-8 h-8 rounded-lg bg-[#16a57a] text-white flex items-center justify-center font-bold text-base flex-shrink-0">
            <Activity size={18} />
          </span>
          {!collapsed && (
            <span className="font-heading font-bold text-lg text-slate-900 dark:text-white">
              FinSight<span className="text-[#16a57a]">AI</span>
            </span>
          )}
        </div>

        {/* Workspace Switcher */}
        {!collapsed && (
          <div className="p-2.5 rounded-lg border border-slate-200 dark:border-[#21352f] flex items-center justify-between mb-5 text-xs">
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-full bg-[#d7eee6] text-[#167657] flex items-center justify-center font-bold text-xs">
                AS
              </span>
              <div>
                <strong className="block font-semibold text-slate-900 dark:text-white">Arjun's Workspace</strong>
                <span className="text-[10px] text-slate-400">Personal Account</span>
              </div>
            </div>
            <ChevronDown size={14} className="text-slate-400" />
          </div>
        )}

        {/* Navigation Menu */}
        <nav className="space-y-1 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.label;

            return (
              <button
                key={item.label}
                onClick={() => setCurrentPage(item.label)}
                title={collapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? "bg-[#eaf7f2] dark:bg-[#14352b] text-[#16a57a] font-semibold"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-[#172c26]"
                } ${collapsed ? "justify-center" : ""}`}
              >
                <Icon size={17} />
                {!collapsed && (
                  <span className="flex-1 text-left flex items-center justify-between">
                    <span>{item.label}</span>
                    {item.isNew && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                        NEW
                      </span>
                    )}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer Controls */}
        <div className="pt-4 border-t border-slate-100 dark:border-[#21352f] space-y-2">
          {/* Dark Mode Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-[#172c26] ${
              collapsed ? "justify-center" : "justify-between"
            }`}
          >
            <div className="flex items-center gap-3">
              {darkMode ? <Sun size={16} /> : <Moon size={16} />}
              {!collapsed && <span>{darkMode ? "Light Mode" : "Dark Mode"}</span>}
            </div>
            {!collapsed && (
              <span className={`w-7 h-4 rounded-full p-0.5 transition-colors ${darkMode ? "bg-[#16a57a]" : "bg-slate-200"}`}>
                <span
                  className={`block w-3 h-3 rounded-full bg-white transition-transform ${
                    darkMode ? "translate-x-3" : "translate-x-0"
                  }`}
                />
              </span>
            )}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Topbar */}
        <header className="h-16 border-b border-slate-200 dark:border-[#21352f] bg-white dark:bg-[#121f1c] px-6 flex items-center justify-between gap-4 sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-[#172c26]"
            >
              <Menu size={18} />
            </button>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>Workspace</span>
              <ChevronDown size={13} />
              <strong className="text-slate-900 dark:text-white font-semibold">
                {currentPage}
              </strong>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* PayPal Sandbox Action Button */}
            <button
              onClick={() => setPaypalModalOpen(true)}
              className="px-3.5 py-1.5 rounded-lg bg-[#FFC439] hover:bg-[#F2BA36] text-[#003087] font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all"
            >
              <span className="italic font-extrabold">P</span>
              <span>Test PayPal Sandbox</span>
            </button>

            <button
              onClick={() => setAddModalOpen(true)}
              className="px-3.5 py-1.5 rounded-lg bg-[#16a57a] hover:bg-[#138e69] text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs"
            >
              <Plus size={15} /> Add Entry
            </button>

            <div className="w-8 h-8 rounded-full bg-[#d7eee6] text-[#167657] font-bold text-xs flex items-center justify-center">
              AS
            </div>
          </div>
        </header>

        {/* Dynamic View Container */}
        <div className="p-6 md:p-8 max-w-7xl mx-auto w-full flex-1">
          {currentPage === "Overview" && (
            <OverviewView
              pulse={pulse}
              transactions={transactions}
              onOpenAddModal={() => setAddModalOpen(true)}
              onNavigate={(page) => setCurrentPage(page)}
            />
          )}

          {currentPage === "Transactions" && (
            <TransactionsView
              transactions={transactions}
              onRefresh={loadData}
              onOpenAddModal={() => setAddModalOpen(true)}
            />
          )}

          {currentPage === "Spending Analysis" && <AnalyticsView />}

          {currentPage === "AI Financial Assistant" && <AssistantView pulse={pulse} />}

          {currentPage === "Financial Forecast" && <ForecastView />}

          {currentPage === "Bills & Subscriptions" && <BillsView />}

          {currentPage === "Purchases & Orders" && <PurchasesView />}

          {currentPage === "Budgets" && <BudgetsView pulse={pulse} />}

          {currentPage === "Connected Accounts" && <ConnectedAccountsView />}

          {currentPage === "Settings" && (
            <section className="space-y-4 max-w-lg">
              <h1 className="text-xl font-bold font-heading">Settings & Preferences</h1>
              <div className="p-5 bg-white dark:bg-[#121f1c] rounded-xl border border-slate-200 dark:border-[#21352f] space-y-3 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">User Name</label>
                  <input defaultValue="Arjun Sharma" className="w-full p-2 border rounded-md dark:bg-transparent" />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Preferred Currency</label>
                  <select className="w-full p-2 border rounded-md dark:bg-transparent">
                    <option>INR (₹)</option>
                    <option>USD ($)</option>
                    <option>EUR (€)</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Monthly Income Baseline</label>
                  <input defaultValue="88000" className="w-full p-2 border rounded-md dark:bg-transparent font-semibold" />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Monthly Savings Goal</label>
                  <input defaultValue="35000" className="w-full p-2 border rounded-md dark:bg-transparent font-semibold" />
                </div>
                <button
                  onClick={() => toast.success("Preferences updated")}
                  className="px-4 py-2 bg-[#16a57a] text-white rounded-lg font-semibold"
                >
                  Save settings
                </button>
              </div>
            </section>
          )}
        </div>
      </main>

      {/* Modals */}
      <AddTransactionModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSuccess={loadData}
      />

      <PayPalCheckoutModal
        isOpen={paypalModalOpen}
        onClose={() => setPaypalModalOpen(false)}
        onSuccess={loadData}
      />

      <Toaster position="bottom-right" richColors />
    </div>
  );
};
