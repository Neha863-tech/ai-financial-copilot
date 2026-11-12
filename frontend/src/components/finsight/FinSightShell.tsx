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
  Landmark,
  Settings,
  Sun,
  Moon,
  Menu,
  ChevronDown,
  Plus,
  Activity,
  LogIn,
  LogOut,
  User as UserIcon,
} from "lucide-react";
import { FinSightAPI, FinancialPulse, TransactionItem } from "../../services/finsightApi";
import { useAuth } from "../../context/AuthContext";
import { AuthModal } from "../auth/AuthModal";
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

const EMPTY_PULSE: FinancialPulse = {
  totalIncome: 0,
  totalExpenses: 0,
  currentSavings: 0,
  savingsRate: 0,
  budgetRemaining: 0,
  budgetLimit: 0,
  budgetUtilizationPct: 0,
  categoryBreakdown: [],
  monthlyTrends: [],
};

export const FinSightShell: React.FC = () => {
  const { user, isAuthenticated, isLoading: authLoading, openAuthModal, logout, updateProfile } = useAuth();
  const [currentPage, setCurrentPage] = useState("Overview");
  const [collapsed, setCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [paypalModalOpen, setPaypalModalOpen] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);

  useEffect(() => {
    setProfileName(user?.fullName || "");
  }, [user]);

  const saveProfile = async () => {
    setProfileSaving(true);
    try {
      await updateProfile({ fullName: profileName });
      toast.success("Profile updated.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update your profile.");
    } finally {
      setProfileSaving(false);
    }
  };

  const [pulse, setPulse] = useState<FinancialPulse>(EMPTY_PULSE);

  const [transactions, setTransactions] = useState<TransactionItem[]>([]);

  const loadData = async () => {
    if (!isAuthenticated) {
      setPulse(EMPTY_PULSE);
      setTransactions([]);
      return;
    }

    try {
      const [p, t] = await Promise.all([FinSightAPI.getOverview(), FinSightAPI.getTransactions()]);
      setPulse(p);
      setTransactions(t);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not load your financial data.");
    }
  };

  useEffect(() => {
    if (!authLoading) void loadData();
  }, [authLoading, isAuthenticated]);

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

  const userInitials = user?.fullName
    ? user.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "FS";

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
          <div
            onClick={!isAuthenticated ? openAuthModal : undefined}
            className={`p-2.5 rounded-lg border border-slate-200 dark:border-[#21352f] flex items-center justify-between mb-5 text-xs ${
              !isAuthenticated ? "cursor-pointer hover:bg-slate-50 dark:hover:bg-[#152a23]" : ""
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-full bg-[#d7eee6] dark:bg-[#18392f] text-[#167657] dark:text-emerald-300 flex items-center justify-center font-bold text-xs">
                {userInitials}
              </span>
              <div>
                <strong className="block font-semibold text-slate-900 dark:text-white truncate max-w-[120px]">
                  {user?.fullName || "Personal account"}
                </strong>
                <span className="text-[10px] text-slate-400 truncate max-w-[120px] block">
                  {user?.email || "Personal Account"}
                </span>
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
            {isAuthenticated && <button
              onClick={() => setPaypalModalOpen(true)}
              className="px-3.5 py-1.5 rounded-lg bg-[#FFC439] hover:bg-[#F2BA36] text-[#003087] font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all"
            >
              <span className="italic font-extrabold">P</span>
              <span>Test PayPal Sandbox</span>
            </button>}

            {isAuthenticated && <button
              onClick={() => setAddModalOpen(true)}
              className="px-3.5 py-1.5 rounded-lg bg-[#16a57a] hover:bg-[#138e69] text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs"
            >
              <Plus size={15} /> Add Entry
            </button>}

            {/* User Session Profile / Sign In */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-full bg-[#d7eee6] dark:bg-[#18392f] text-[#167657] dark:text-emerald-300 font-bold text-xs flex items-center justify-center cursor-pointer"
                  title={user?.email || "Signed in"}
                >
                  {userInitials}
                </div>
                <button
                  onClick={logout}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-[#1a2f29] transition-colors"
                  title="Sign Out"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <button
                onClick={openAuthModal}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#21352f] hover:bg-slate-50 dark:hover:bg-[#172c26] text-xs font-semibold flex items-center gap-1.5 transition-colors text-slate-700 dark:text-slate-200"
              >
                <LogIn size={14} className="text-[#16a57a]" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </header>

        {/* Dynamic View Container */}
        <div className="p-6 md:p-8 max-w-7xl mx-auto w-full flex-1">
          {authLoading ? (
            <div className="flex min-h-64 items-center justify-center text-sm text-slate-500">
              Loading your account…
            </div>
          ) : !isAuthenticated ? (
            <section className="mx-auto mt-12 max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-[#21352f] dark:bg-[#121f1c]">
              <Activity className="mx-auto mb-4 text-[#16a57a]" size={32} />
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">Your finances, in one place</h1>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Sign in or create an account to load your private ledger, budgets, and AI assistant.
              </p>
              <button
                onClick={openAuthModal}
                className="mt-5 rounded-lg bg-[#16a57a] px-4 py-2 text-sm font-semibold text-white hover:bg-[#138e69]"
              >
                Sign in or create account
              </button>
            </section>
          ) : currentPage === "Overview" ? (
            <OverviewView
              pulse={pulse}
              transactions={transactions}
              userName={user?.fullName || "there"}
              onOpenAddModal={() => setAddModalOpen(true)}
              onNavigate={(page) => setCurrentPage(page)}
            />
          ) : null}

          {isAuthenticated && currentPage === "Transactions" && (
            <TransactionsView
              transactions={transactions}
              onRefresh={loadData}
              onOpenAddModal={() => setAddModalOpen(true)}
            />
          )}

          {isAuthenticated && currentPage === "Spending Analysis" && <AnalyticsView />}

          {isAuthenticated && currentPage === "AI Financial Assistant" && <AssistantView pulse={pulse} />}

          {isAuthenticated && currentPage === "Financial Forecast" && <ForecastView />}

          {isAuthenticated && currentPage === "Bills & Subscriptions" && <BillsView />}

          {isAuthenticated && currentPage === "Purchases & Orders" && <PurchasesView />}

          {isAuthenticated && currentPage === "Budgets" && <BudgetsView />}

          {isAuthenticated && currentPage === "Connected Accounts" && <ConnectedAccountsView />}

          {isAuthenticated && currentPage === "Settings" && (
            <section className="space-y-4 max-w-lg">
              <h1 className="text-xl font-bold font-heading">Settings & Preferences</h1>
              <div className="p-5 bg-white dark:bg-[#121f1c] rounded-xl border border-slate-200 dark:border-[#21352f] space-y-3 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">User Name</label>
                  <input
                    value={profileName}
                    onChange={(event) => setProfileName(event.target.value)}
                    className="w-full p-2 border rounded-md dark:bg-transparent"
                  />
                </div>
                <button
                  onClick={saveProfile}
                  disabled={profileSaving || profileName.trim().length < 2}
                  className="px-4 py-2 bg-[#16a57a] text-white rounded-lg font-semibold"
                >
                  {profileSaving ? "Saving…" : "Save profile"}
                </button>
              </div>
            </section>
          )}
        </div>
      </main>

      {/* Modals */}
      {isAuthenticated && (
        <AddTransactionModal
          isOpen={addModalOpen}
          onClose={() => setAddModalOpen(false)}
          onSuccess={loadData}
        />
      )}

      {isAuthenticated && (
        <PayPalCheckoutModal
          isOpen={paypalModalOpen}
          onClose={() => setPaypalModalOpen(false)}
          onSuccess={loadData}
        />
      )}

      <AuthModal />

      <Toaster position="bottom-right" richColors />
    </div>
  );
};
