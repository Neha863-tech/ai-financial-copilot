import { FinancialAgentEngine, DEFAULT_FINANCIAL_STATE } from "./financialAgentEngine";

export interface TransactionItem {
  id?: string;
  merchant: string;
  category: string;
  date: string;
  paymentMethod: string;
  amount: number;
  type: "INCOME" | "EXPENSE";
  status?: string;
  referenceId?: string;
  paypalOrderId?: string;
}

export interface FinancialPulse {
  totalIncome: number;
  totalExpenses: number;
  currentSavings: number;
  savingsRate: number;
  budgetRemaining: number;
  budgetLimit: number;
  budgetUtilizationPct: number;
  categoryBreakdown: { name: string; amount: number; color: string }[];
  monthlyTrends: { month: string; income: number; expenses: number; savings: number }[];
}

const STORAGE_KEYS = {
  TRANSACTIONS: "finsight_transactions_v2",
  BILLS: "finsight_bills_v2",
  ORDERS: "finsight_paypal_orders_v2",
};

const INITIAL_TRANSACTIONS: TransactionItem[] = [
  { id: "tx-1", merchant: "Monthly Rent", category: "Rent & home", date: "Sep 01, 2024", paymentMethod: "HDFC Bank", amount: -15000, type: "EXPENSE", status: "COMPLETED" },
  { id: "tx-2", merchant: "Amazon Shopping", category: "Shopping", date: "Sep 09, 2024", paymentMethod: "PayPal", amount: -2499, type: "EXPENSE", status: "COMPLETED", paypalOrderId: "ORD-PP-83921" },
  { id: "tx-3", merchant: "Fresh Basket", category: "Food & dining", date: "Sep 08, 2024", paymentMethod: "ICICI Card", amount: -1840, type: "EXPENSE", status: "COMPLETED" },
  { id: "tx-4", merchant: "Salary credit", category: "Income", date: "Sep 05, 2024", paymentMethod: "HDFC Bank", amount: 88000, type: "INCOME", status: "COMPLETED" },
  { id: "tx-5", merchant: "Netflix Subscription", category: "Entertainment", date: "Sep 03, 2024", paymentMethod: "PayPal", amount: -649, type: "EXPENSE", status: "COMPLETED" },
  { id: "tx-6", merchant: "Electricity Bill", category: "Utilities", date: "Sep 02, 2024", paymentMethod: "UPI", amount: -2180, type: "EXPENSE", status: "COMPLETED" },
  { id: "tx-7", merchant: "Swiggy Gourmet", category: "Food & dining", date: "Sep 08, 2024", paymentMethod: "UPI", amount: -1240, type: "EXPENSE", status: "COMPLETED" },
  { id: "tx-8", merchant: "Shell Fuel Station", category: "Transport", date: "Sep 07, 2024", paymentMethod: "Credit Card", amount: -2100, type: "EXPENSE", status: "COMPLETED" },
  { id: "tx-9", merchant: "Nature's Basket", category: "Food & dining", date: "Sep 06, 2024", paymentMethod: "Debit Card", amount: -1850, type: "EXPENSE", status: "COMPLETED" },
  { id: "tx-10", merchant: "Starbucks Coffee", category: "Food & dining", date: "Sep 05, 2024", paymentMethod: "UPI", amount: -480, type: "EXPENSE", status: "COMPLETED" },
  { id: "tx-11", merchant: "Cult.fit Pass", category: "Entertainment", date: "Sep 01, 2024", paymentMethod: "PayPal", amount: -1499, type: "EXPENSE", status: "COMPLETED", paypalOrderId: "ORD-PP-77102" },
];

const INITIAL_BILLS = [
  { id: "1", name: "Apartment Rent", amount: 15000, dueDate: "2024-10-01", frequency: "MONTHLY", status: "PENDING" },
  { id: "2", name: "Electricity Bill (BESCOM)", amount: 2180, dueDate: "2024-10-02", frequency: "MONTHLY", status: "PENDING" },
  { id: "3", name: "Netflix Subscription", amount: 649, dueDate: "2024-10-03", frequency: "MONTHLY", status: "PENDING" },
  { id: "4", name: "Airtel Xstream Fiber", amount: 999, dueDate: "2024-10-05", frequency: "MONTHLY", status: "PENDING" },
];

export class FinSightAPI {
  // --- Local Persistence Helpers ---
  private static loadStoredTransactions(): TransactionItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      if (data) return JSON.parse(data);
    } catch (e) {
      // Fallback
    }
    return INITIAL_TRANSACTIONS;
  }

  private static saveStoredTransactions(txs: TransactionItem[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(txs));
    } catch (e) {
      console.warn("Failed to persist transactions in localStorage", e);
    }
  }

  // --- API Endpoints ---
  static async getOverview(): Promise<FinancialPulse> {
    const txs = this.loadStoredTransactions();
    let totalIncome = 0;
    let totalExpenses = 0;

    const categoryMap: Record<string, number> = {};

    for (const t of txs) {
      if (t.type === "INCOME") {
        totalIncome += Math.abs(t.amount);
      } else {
        const cost = Math.abs(t.amount);
        totalExpenses += cost;
        const cat = t.category || "Other";
        categoryMap[cat] = (categoryMap[cat] || 0) + cost;
      }
    }

    if (totalIncome === 0) totalIncome = 88000;
    if (totalExpenses === 0) totalExpenses = 49800;

    const currentSavings = totalIncome - totalExpenses;
    const savingsRate = Number(((currentSavings / totalIncome) * 100).toFixed(1));
    const budgetLimit = 64000;
    const budgetRemaining = Math.max(0, budgetLimit - totalExpenses);
    const budgetUtilizationPct = Math.min(100, Math.round((totalExpenses / budgetLimit) * 100));

    const categoryColors: Record<string, string> = {
      "Rent & home": "#1b9a72",
      "Food & dining": "#f3a93b",
      "Shopping": "#e36d69",
      "Transport": "#5b8def",
      "Education": "#9274d8",
      "Utilities": "#55b9bd",
      "Entertainment": "#ec4899",
    };

    const categoryBreakdown = Object.entries(categoryMap).map(([name, amount]) => ({
      name,
      amount,
      color: categoryColors[name] || "#16a57a",
    }));

    if (categoryBreakdown.length === 0) {
      categoryBreakdown.push(
        { name: "Rent & home", amount: 15000, color: "#1b9a72" },
        { name: "Food & dining", amount: 9200, color: "#f3a93b" },
        { name: "Shopping", amount: 6800, color: "#e36d69" },
        { name: "Transport", amount: 4200, color: "#5b8def" },
        { name: "Education", amount: 3500, color: "#9274d8" },
        { name: "Utilities", amount: 3000, color: "#55b9bd" }
      );
    }

    return {
      totalIncome,
      totalExpenses,
      currentSavings,
      savingsRate,
      budgetRemaining,
      budgetLimit,
      budgetUtilizationPct,
      categoryBreakdown,
      monthlyTrends: [
        { month: "Apr", income: 82000, expenses: 52400, savings: 29600 },
        { month: "May", income: 82000, expenses: 49800, savings: 32200 },
        { month: "Jun", income: 85000, expenses: 55700, savings: 29300 },
        { month: "Jul", income: 85000, expenses: 48200, savings: 36800 },
        { month: "Aug", income: 85000, expenses: 51100, savings: 33900 },
        { month: "Sep", income: totalIncome, expenses: totalExpenses, savings: currentSavings },
      ],
    };
  }

  static async getTransactions(search = "", category = "All"): Promise<TransactionItem[]> {
    let list = this.loadStoredTransactions();

    if (category && category !== "All") {
      list = list.filter((t) => t.category.toLowerCase() === category.toLowerCase());
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((t) =>
        t.merchant.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        t.paymentMethod.toLowerCase().includes(q)
      );
    }

    return list;
  }

  static async addTransaction(tx: { merchant: string; amount: number; type: string; category: string; paymentMethod: string; date?: string }) {
    const list = this.loadStoredTransactions();
    const isIncome = tx.type === "INCOME";
    const newTx: TransactionItem = {
      id: "tx-" + Date.now(),
      merchant: tx.merchant,
      category: tx.category,
      date: tx.date || new Date().toLocaleDateString("en-IN", { month: "short", day: "2-digit", year: "numeric" }),
      paymentMethod: tx.paymentMethod,
      amount: isIncome ? Math.abs(tx.amount) : -Math.abs(tx.amount),
      type: isIncome ? "INCOME" : "EXPENSE",
      status: "COMPLETED",
    };

    list.unshift(newTx);
    this.saveStoredTransactions(list);
    return { success: true, transaction: newTx };
  }

  static async getSpendingPatterns() {
    return {
      dailyRhythm: [
        { d: "Mon", v: 3100 },
        { d: "Tue", v: 2800 },
        { d: "Wed", v: 4200 },
        { d: "Thu", v: 3500 },
        { d: "Fri", v: 5100 },
        { d: "Sat", v: 6800 },
        { d: "Sun", v: 5700 },
      ],
      highlights: [
        { label: "Weekend spending", value: "+32%", sub: "higher than weekdays", tone: "coral" },
        { label: "Recurring payments", value: "4 detected", sub: "₹18,828 per month", tone: "amber" },
        { label: "Unusual activity", value: "1 flagged", sub: "Amazon · ₹2,499", tone: "blue" },
        { label: "Smart opportunity", value: "₹2,000", sub: "potential monthly savings", tone: "mint" },
      ],
    };
  }

  static async simulateForecast(reductionPercent: number) {
    const monthly = Math.round((49800 * reductionPercent) / 100);
    return {
      reductionPercent,
      monthlySavingsIncrease: monthly,
      annualSavingsIncrease: monthly * 12,
      projection: [
        { m: "Now", a: 38200, b: 38200 },
        { m: "3 mo", a: 38200 + monthly * 3, b: 38200 + 4000 },
        { m: "6 mo", a: 38200 + monthly * 6, b: 38200 + 8000 },
        { m: "9 mo", a: 38200 + monthly * 9, b: 38200 + 12000 },
        { m: "12 mo", a: 38200 + monthly * 12, b: 38200 + 16000 },
      ],
    };
  }

  static async getBills() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BILLS);
      if (data) return JSON.parse(data);
    } catch {
      // Fallback
    }
    return INITIAL_BILLS;
  }

  static async getPurchases() {
    const txs = this.loadStoredTransactions();
    const paypalTxs = txs.filter((t) => t.paymentMethod === "PayPal" && t.type === "EXPENSE");

    return paypalTxs.map((t, idx) => ({
      id: "p" + (idx + 1),
      orderNumber: t.paypalOrderId || `ORD-PP-${83900 + idx}`,
      merchant: t.merchant,
      totalAmount: Math.abs(t.amount),
      status: "COMPLETED",
      deliveryStatus: "DELIVERED",
      purchaseDate: t.date,
      items: [
        {
          name: t.merchant.includes("Amazon") ? "Sony Wireless Ergonomic Headphones" : `${t.category} purchase`,
          quantity: 1,
          unitPrice: Math.abs(t.amount),
          imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200",
        },
      ],
    }));
  }

  static async askAssistant(query: string) {
    // 1. Check if user configured client-side LLM credentials (Groq / Gemini / OpenAI)
    try {
      const customProvider = localStorage.getItem("finsight_llm_provider") as any;
      const customKey = localStorage.getItem("finsight_llm_key");
      const customModel = localStorage.getItem("finsight_llm_model") || undefined;

      if (customKey && customKey.trim().length > 5) {
        return await FinancialAgentEngine.processQuery(query, DEFAULT_FINANCIAL_STATE, {
          provider: customProvider || "groq",
          apiKey: customKey.trim(),
          model: customModel,
        });
      }
    } catch (e) {
      // Continue to local engine
    }

    // 2. High-precision Built-in Financial Intelligence Engine
    return await FinancialAgentEngine.processQuery(query, DEFAULT_FINANCIAL_STATE);
  }

  static async createPayPalOrder(data: { amount: number; merchantName?: string; description?: string }) {
    const orderId = `ORD-PP-${Math.floor(10000 + Math.random() * 90000)}`;
    return { orderId, status: "CREATED" };
  }

  static async capturePayPalOrder(orderId: string, merchantName = "PayPal Merchant", category = "Shopping") {
    const captureId = `CAP-${Math.floor(10000 + Math.random() * 90000)}`;
    
    // Auto-record PayPal purchase into client transaction ledger
    await this.addTransaction({
      merchant: merchantName,
      amount: 2499,
      type: "EXPENSE",
      category,
      paymentMethod: "PayPal",
    });

    return {
      success: true,
      orderId,
      captureId,
      transaction: {
        id: `tx-pp-${Date.now()}`,
        status: "COMPLETED",
        orderId,
      },
    };
  }
}
