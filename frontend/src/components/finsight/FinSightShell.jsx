import React, { useState, useEffect } from "react";
import { LayoutDashboard, Receipt, ShoppingBag, FileText, BarChart3, Target, RefreshCw, Calendar, Bot, TrendingUp, Crosshair, Landmark, Sparkles, UploadCloud, Bell, Shield, Sun, Moon, Menu, ChevronDown, Plus, Activity, LogIn, LogOut, } from "lucide-react";
import { FinSightAPI } from "../../services/finsightApi";
import { useAuth } from "../../context/AuthContext";
import { AuthModal } from "../auth/AuthModal";
import { OverviewView } from "./OverviewView";
import { TransactionsView } from "./TransactionsView";
import { PurchasesView } from "./PurchasesView";
import { FinancialReportsView } from "./FinancialReportsView";
import { AnalyticsView } from "./AnalyticsView";
import { BudgetsView } from "./BudgetsView";
import { BillsView } from "./BillsView";
import { FinancialCalendarView } from "./FinancialCalendarView";
import { AssistantView } from "./AssistantView";
import { ForecastView } from "./ForecastView";
import { GoalsView } from "./GoalsView";
import { ConnectedAccountsView } from "./ConnectedAccountsView";
import { ShoppingIntelligenceView } from "./ShoppingIntelligenceView";
import { ImportTransactionsView } from "./ImportTransactionsView";
import { NotificationsView } from "./NotificationsView";
import { ProfileView } from "./ProfileView";
import { AddTransactionModal } from "./AddTransactionModal";
import { PayPalCheckoutModal } from "./PayPalCheckoutModal";
import { Toaster } from "sonner";
export const FinSightShell = () => {
    const { user, isAuthenticated, openAuthModal, logout } = useAuth();
    const [currentPage, setCurrentPage] = useState("Overview");
    const [collapsed, setCollapsed] = useState(false);
    const [darkMode, setDarkMode] = useState(() => {
        try {
            const saved = localStorage.getItem("finsight_theme");
            if (saved !== null) return saved === "dark";
            return false;
        } catch {
            return false;
        }
    });
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [paypalModalOpen, setPaypalModalOpen] = useState(false);
    const [pulse, setPulse] = useState({
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
    const [transactions, setTransactions] = useState([]);
    const loadData = async () => {
        try {
            const [p, t] = await Promise.all([FinSightAPI.getOverview(), FinSightAPI.getTransactions()]);
            setPulse(p);
            setTransactions(t);
        }
        catch {
            // Graceful fallback
        }
    };
    useEffect(() => {
        loadData();
    }, [isAuthenticated]);
    useEffect(() => {
        // Throttled heartbeat to maintain accurate lastSeenAt and verify session
        FinSightAPI.sendHeartbeat();
        const interval = setInterval(() => {
            FinSightAPI.sendHeartbeat();
        }, 60000);
        return () => clearInterval(interval);
    }, [isAuthenticated]);
    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add("dark");
            try { localStorage.setItem("finsight_theme", "dark"); } catch {}
        }
        else {
            document.documentElement.classList.remove("dark");
            try { localStorage.setItem("finsight_theme", "light"); } catch {}
        }
    }, [darkMode]);
    // Complete 16-section navigation per Section 10 of prompt
    const navItems = [
        { label: "Overview", icon: LayoutDashboard },
        { label: "Transactions", icon: Receipt },
        { label: "Purchases & Orders", icon: ShoppingBag },
        { label: "Financial Reports", icon: FileText, isNew: true },
        { label: "Spending Analytics", icon: BarChart3 },
        { label: "Budgets", icon: Target },
        { label: "Bills & Subscriptions", icon: RefreshCw },
        { label: "Financial Calendar", icon: Calendar, isNew: true },
        { label: "AI Financial Assistant", icon: Bot, isNew: true },
        { label: "Financial Forecast", icon: TrendingUp },
        { label: "Savings Goals", icon: Crosshair, isNew: true },
        { label: "Connected Accounts", icon: Landmark },
        { label: "Shopping Intelligence", icon: Sparkles, isNew: true },
        { label: "Import Transactions", icon: UploadCloud, isNew: true },
        { label: "Notifications", icon: Bell, isNew: true },
        { label: "Profile & Security", icon: Shield, isNew: true },
    ];
    const userInitials = user?.fullName
        ? user.fullName
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)
        : "AS";
    return (<div className={`min-h-screen flex bg-[#f7f9fc] dark:bg-[#0b1311] text-[#101828] dark:text-[#f2f7f5] transition-colors duration-200`}>
      {/* Sidebar */}
      <aside className={`${collapsed ? "w-18" : "w-64"} bg-white dark:bg-[#121f1c] border-r border-slate-200 dark:border-[#21352f] p-4 flex flex-col flex-shrink-0 transition-all duration-300 z-30`}>
        {/* Brand */}
        <div className="flex items-center gap-2.5 mb-5 px-1">
          <span className="w-8 h-8 rounded-lg bg-[#16a57a] text-white flex items-center justify-center font-bold text-base flex-shrink-0 shadow-xs">
            <Activity size={18}/>
          </span>
          {!collapsed && (<span className="font-heading font-bold text-lg text-slate-900 dark:text-white">
              FinSight<span className="text-[#16a57a]">AI</span>
            </span>)}
        </div>

        {/* Workspace Profile Badge */}
        {!collapsed && (<div onClick={!isAuthenticated ? openAuthModal : undefined} className={`p-2.5 rounded-lg border border-slate-200 dark:border-[#21352f] flex items-center justify-between mb-4 text-xs ${!isAuthenticated ? "cursor-pointer hover:bg-slate-50 dark:hover:bg-[#152a23]" : ""}`}>
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-full bg-[#d7eee6] dark:bg-[#18392f] text-[#167657] dark:text-emerald-300 flex items-center justify-center font-bold text-xs">
                {userInitials}
              </span>
              <div>
                <strong className="block font-semibold text-slate-900 dark:text-white truncate max-w-[120px]">
                  {user?.fullName ? `${user.fullName}` : "Arjun Sharma"}
                </strong>
                <span className="text-[10px] text-slate-400 truncate max-w-[120px] block">
                  {user?.email || "Personal Account"}
                </span>
              </div>
            </div>
            <ChevronDown size={14} className="text-slate-400"/>
          </div>)}

        {/* Navigation Menu */}
        <nav className="space-y-0.5 flex-1 overflow-y-auto pr-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.label;
            return (<button key={item.label} onClick={() => setCurrentPage(item.label)} title={collapsed ? item.label : undefined} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${isActive
                    ? "bg-[#eaf7f2] dark:bg-[#14352b] text-[#16a57a] font-semibold"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-[#172c26]"} ${collapsed ? "justify-center" : ""}`}>
                <Icon size={16}/>
                {!collapsed && (<span className="flex-1 text-left flex items-center justify-between">
                    <span className="truncate">{item.label}</span>
                    {item.isNew && (<span className="text-[8px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                        NEW
                      </span>)}
                  </span>)}
              </button>);
        })}
        </nav>

        {/* Sidebar Footer Controls */}
        <div className="pt-3 border-t border-slate-100 dark:border-[#21352f] space-y-2">
          {/* Dark Mode Toggle */}
          <button onClick={() => setDarkMode(!darkMode)} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-[#172c26] ${collapsed ? "justify-center" : "justify-between"}`}>
            <div className="flex items-center gap-3">
              {darkMode ? <Sun size={15}/> : <Moon size={15}/>}
              {!collapsed && <span>{darkMode ? "Light Mode" : "Dark Mode"}</span>}
            </div>
            {!collapsed && (<span className={`w-7 h-4 rounded-full p-0.5 transition-colors ${darkMode ? "bg-[#16a57a]" : "bg-slate-200"}`}>
                <span className={`block w-3 h-3 rounded-full bg-white transition-transform ${darkMode ? "translate-x-3" : "translate-x-0"}`}/>
              </span>)}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Topbar */}
        <header className="h-16 border-b border-slate-200 dark:border-[#21352f] bg-white dark:bg-[#121f1c] px-6 flex items-center justify-between gap-4 sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <button onClick={() => setCollapsed(!collapsed)} className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-[#172c26]">
              <Menu size={18}/>
            </button>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>Workspace</span>
              <ChevronDown size={13}/>
              <strong className="text-slate-900 dark:text-white font-semibold">
                {currentPage}
              </strong>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Theme Toggle Pill */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg border border-slate-200 dark:border-[#21352f] hover:bg-slate-50 dark:hover:bg-[#172c26] text-slate-600 dark:text-slate-300 transition-all flex items-center justify-center cursor-pointer"
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              aria-label="Toggle theme"
            >
              {darkMode ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} className="text-slate-600" />}
            </button>

            {/* Quick Notifications Pill */}
            <button onClick={() => setCurrentPage("Notifications")} className="p-2 rounded-lg border border-slate-200 dark:border-[#21352f] hover:bg-slate-50 dark:hover:bg-[#172c26] text-slate-600 dark:text-slate-300 relative transition-all" title="Notifications">
              <Bell size={16}/>
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#16a57a]"/>
            </button>

            {/* PayPal Sandbox Action Button */}
            <button onClick={() => setPaypalModalOpen(true)} className="px-3.5 py-1.5 rounded-lg bg-[#FFC439] hover:bg-[#F2BA36] text-[#003087] font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all">
              <span className="italic font-extrabold">P</span>
              <span>Test PayPal Sandbox</span>
            </button>

            <button onClick={() => setAddModalOpen(true)} className="px-3.5 py-1.5 rounded-lg bg-[#16a57a] hover:bg-[#138e69] text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs">
              <Plus size={15}/> Add Entry
            </button>

            {/* User Session Profile / Sign In */}
            {isAuthenticated ? (<div className="flex items-center gap-2">
                <button onClick={() => setCurrentPage("Profile & Security")} className="w-8 h-8 rounded-full bg-[#d7eee6] dark:bg-[#18392f] text-[#167657] dark:text-emerald-300 font-bold text-xs flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-[#16a57a]/50 transition-all" title={`${user?.email || "Signed in"} - Click to view Profile & Security`}>
                  {userInitials}
                </button>
                <button onClick={logout} className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-[#1a2f29] transition-colors" title="Sign Out">
                  <LogOut size={16}/>
                </button>
              </div>) : (<button onClick={openAuthModal} className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#21352f] hover:bg-slate-50 dark:hover:bg-[#172c26] text-xs font-semibold flex items-center gap-1.5 transition-colors text-slate-700 dark:text-slate-200">
                <LogIn size={14} className="text-[#16a57a]"/>
                <span>Sign In</span>
              </button>)}
          </div>
        </header>

        {/* Dynamic View Container */}
        <div className="p-6 md:p-8 max-w-7xl mx-auto w-full flex-1">
          {currentPage === "Overview" && (<OverviewView pulse={pulse} transactions={transactions} onOpenAddModal={() => setAddModalOpen(true)} onNavigate={(page) => setCurrentPage(page)}/>)}

          {currentPage === "Transactions" && (<TransactionsView transactions={transactions} onRefresh={loadData} onOpenAddModal={() => setAddModalOpen(true)}/>)}

          {currentPage === "Purchases & Orders" && <PurchasesView />}

          {currentPage === "Financial Reports" && <FinancialReportsView />}

          {currentPage === "Spending Analytics" && <AnalyticsView />}

          {currentPage === "Budgets" && <BudgetsView pulse={pulse}/>}

          {currentPage === "Bills & Subscriptions" && <BillsView />}

          {currentPage === "Financial Calendar" && <FinancialCalendarView />}

          {currentPage === "AI Financial Assistant" && <AssistantView pulse={pulse}/>}

          {currentPage === "Financial Forecast" && <ForecastView />}

          {currentPage === "Savings Goals" && <GoalsView />}

          {currentPage === "Connected Accounts" && <ConnectedAccountsView />}

          {currentPage === "Shopping Intelligence" && <ShoppingIntelligenceView />}

          {currentPage === "Import Transactions" && <ImportTransactionsView />}

          {currentPage === "Notifications" && <NotificationsView />}

          {(currentPage === "Profile & Security" || currentPage === "Settings") && <ProfileView />}
        </div>
      </main>

      {/* Modals */}
      <AddTransactionModal isOpen={addModalOpen} onClose={() => setAddModalOpen(false)} onSuccess={loadData}/>

      <PayPalCheckoutModal isOpen={paypalModalOpen} onClose={() => setPaypalModalOpen(false)} onSuccess={loadData}/>

      <AuthModal />

      <Toaster position="bottom-right" richColors/>
    </div>);
};
