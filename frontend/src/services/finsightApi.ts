const configuredApiUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, "");
export const API_BASE_URL = configuredApiUrl
  ? /\/api(?:\/v1)?$/i.test(configuredApiUrl)
    ? configuredApiUrl
    : `${configuredApiUrl}/api/v1`
  : "http://localhost:5000/api/v1";

interface ApiEnvelope<T> {
  data?: T;
  message?: string;
  errors?: Array<{ message?: string }>;
}

export interface TransactionItem {
  id: string;
  merchant: string;
  category: string;
  date: string;
  paymentMethod: string;
  amount: number;
  currency: string;
  type: "INCOME" | "EXPENSE";
  status: string;
  source: string;
  referenceId?: string | null;
}

export interface CategoryItem {
  id: string;
  name: string;
  direction: "INCOME" | "EXPENSE" | "BOTH";
}

export interface BudgetItem {
  id: string;
  name: string;
  amount: number;
  spent: number;
  remaining: number;
  utilization: number;
  status: string;
  currency: string;
  categoryId: string | null;
  periodStart: string;
  periodEnd: string;
}

export interface RecurringBillItem {
  id: string;
  name: string;
  amount: number;
  currency: string;
  frequency: string;
  status: string;
  dueDate: string | null;
  confidence: string;
}

export interface ReminderItem {
  id: string;
  title: string;
  amount: number | null;
  currency: string | null;
  dueAt: string;
  status: "PENDING" | "COMPLETED" | "DISMISSED";
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

export interface SpendingPatterns {
  categoryBreakdown: FinancialPulse["categoryBreakdown"];
  monthlyTrends: FinancialPulse["monthlyTrends"];
}

interface TransactionRecord {
  id: string;
  merchant?: string | null;
  description?: string | null;
  amount: string | number;
  direction: "INCOME" | "EXPENSE";
  status: string;
  source: string;
  externalId?: string | null;
  transactionDate: string;
  currency: string;
  category?: { name: string } | null;
}

interface DashboardResponse {
  summary: {
    totalIncome: string | number;
    totalExpenses: string | number;
    netCashFlow: string | number;
    savingsRate: string | number | null;
  };
  categoryBreakdown: Array<{
    categoryName: string;
    total: string | number;
  }>;
  budgets: Array<{
    amount: string | number;
    spent: string | number;
  }>;
}

const categoryColors = ["#1b9a72", "#f3a93b", "#e36d69", "#5b8def", "#9274d8", "#55b9bd"];

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;

  if (options.body && !isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const token = localStorage.getItem("finsight_token");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: "include",
  });
  const payload = (await response.json().catch(() => null)) as ApiEnvelope<T> | null;

  if (!response.ok) {
    const message =
      payload?.message ||
      payload?.errors?.find((error) => error.message)?.message ||
      `Request failed (${response.status})`;
    const error = new Error(message) as Error & { status?: number };
    error.status = response.status;
    throw error;
  }

  if (!payload) throw new Error("The API returned an invalid response.");
  return (payload.data === undefined ? payload : payload.data) as T;
}

function toNumber(value: string | number | null | undefined): number {
  const result = Number(value ?? 0);
  return Number.isFinite(result) ? result : 0;
}

function mapTransaction(transaction: TransactionRecord): TransactionItem {
  const date = new Date(transaction.transactionDate);
  const sourceNames: Record<string, string> = {
    MANUAL: "Manual",
    CSV: "CSV import",
    PAYPAL_REPORTING: "PayPal",
    PAYPAL_CHECKOUT: "PayPal",
    DEMO: "Demo",
  };

  return {
    id: transaction.id,
    merchant: transaction.merchant || transaction.description || "Transaction",
    category: transaction.category?.name || "Uncategorized",
    date: Number.isNaN(date.getTime())
      ? transaction.transactionDate
      : date.toLocaleDateString("en-IN", { month: "short", day: "2-digit", year: "numeric" }),
    paymentMethod: sourceNames[transaction.source] || transaction.source,
    amount:
      (transaction.direction === "INCOME" ? 1 : -1) *
      Math.abs(toNumber(transaction.amount)),
    currency: transaction.currency,
    type: transaction.direction,
    status: transaction.status,
    source: transaction.source,
    referenceId: transaction.externalId,
  };
}

function monthLabel(key: string): string {
  const date = new Date(`${key}-01T00:00:00`);
  return date.toLocaleDateString("en-IN", { month: "short" });
}

function getSixMonthRange(): { startDate: string; endDate: string } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return { startDate: start.toISOString(), endDate: end.toISOString() };
}

export class FinSightAPI {
  static async getOverview(): Promise<FinancialPulse> {
    const range = getSixMonthRange();
    const [dashboard, trendsResponse, budgets] = await Promise.all([
      request<DashboardResponse>("/dashboard"),
      request<{ trends: Array<{ month: string; income: string | number; expenses: string | number }> }>(
        `/analytics/trends?${new URLSearchParams({ ...range, currency: "INR" })}`
      ),
      this.getBudgets(),
    ]);

    const totalIncome = toNumber(dashboard.summary.totalIncome);
    const totalExpenses = toNumber(dashboard.summary.totalExpenses);
    const now = new Date();
    const currentBudgets = budgets.filter((budget) => {
      const start = new Date(budget.periodStart);
      return start.getFullYear() === now.getFullYear() && start.getMonth() === now.getMonth();
    });
    const budgetLimit = currentBudgets.reduce((sum, budget) => sum + budget.amount, 0);
    const budgetSpent = currentBudgets.reduce((sum, budget) => sum + budget.spent, 0);

    return {
      totalIncome,
      totalExpenses,
      currentSavings: toNumber(dashboard.summary.netCashFlow),
      savingsRate: toNumber(dashboard.summary.savingsRate),
      budgetRemaining: budgetLimit - budgetSpent,
      budgetLimit,
      budgetUtilizationPct: budgetLimit > 0 ? (budgetSpent / budgetLimit) * 100 : 0,
      categoryBreakdown: dashboard.categoryBreakdown.map((category, index) => ({
        name: category.categoryName,
        amount: toNumber(category.total),
        color: categoryColors[index % categoryColors.length],
      })),
      monthlyTrends: trendsResponse.trends.map((trend) => ({
        month: monthLabel(trend.month),
        income: toNumber(trend.income),
        expenses: toNumber(trend.expenses),
        savings: toNumber(trend.income) - toNumber(trend.expenses),
      })),
    };
  }

  static async getTransactions(filters: {
    search?: string;
    category?: string;
    source?: string;
  } = {}): Promise<TransactionItem[]> {
    const query = new URLSearchParams({ page: "1", limit: "100" });
    if (filters.search) query.set("search", filters.search);
    if (filters.source) query.set("source", filters.source);

    const records = await request<TransactionRecord[]>(`/transactions?${query}`);
    const transactions = records.map(mapTransaction);
    return filters.category && filters.category !== "All"
      ? transactions.filter((transaction) => transaction.category === filters.category)
      : transactions;
  }

  static async addTransaction(transaction: {
    merchant: string;
    amount: number;
    direction: "INCOME" | "EXPENSE";
    categoryId?: string | null;
    transactionDate: string;
    currency?: string;
  }): Promise<TransactionItem> {
    const result = await request<{ transaction: TransactionRecord }>("/transactions", {
      method: "POST",
      body: JSON.stringify(transaction),
    });
    return mapTransaction(result.transaction);
  }

  static async importTransactions(file: File): Promise<{ imported: number; skipped: number }> {
    const formData = new FormData();
    formData.append("file", file);
    return request("/transactions/import/csv", { method: "POST", body: formData });
  }

  static async getCategories(): Promise<CategoryItem[]> {
    const result = await request<{ categories: CategoryItem[] }>("/categories");
    return result.categories;
  }

  static async getBudgets(): Promise<BudgetItem[]> {
    const result = await request<{ budgets: Array<{
      id: string;
      amount: string | number;
      spent: string | number;
      remaining: string | number;
      utilization: number;
      status: string;
      currency: string;
      categoryId: string | null;
      category?: { name: string } | null;
      periodStart: string;
      periodEnd: string;
    }> }>("/budgets");

    return result.budgets.map((budget) => ({
      id: budget.id,
      name: budget.category?.name || "Overall",
      amount: toNumber(budget.amount),
      spent: toNumber(budget.spent),
      remaining: toNumber(budget.remaining),
      utilization: toNumber(budget.utilization),
      status: budget.status,
      currency: budget.currency,
      categoryId: budget.categoryId,
      periodStart: budget.periodStart,
      periodEnd: budget.periodEnd,
    }));
  }

  static async createBudget(payload: {
    categoryId?: string | null;
    amount: number;
    currency: string;
    periodStart: string;
    periodEnd: string;
  }): Promise<void> {
    await request("/budgets", { method: "POST", body: JSON.stringify(payload) });
  }

  static async getSpendingPatterns(): Promise<SpendingPatterns> {
    const pulse = await this.getOverview();
    return {
      categoryBreakdown: pulse.categoryBreakdown,
      monthlyTrends: pulse.monthlyTrends,
    };
  }

  static async simulateForecast(reductionPercentage: number) {
    const { startDate, endDate } = getSixMonthRange();
    const [result, pulse] = await Promise.all([
      request<{ simulation: {
        baselineMonthlySpend: string | number;
        estimatedMonthlySavings: string | number;
        estimatedTotalSavings: string | number;
        months: number;
        disclaimer: string;
      } }>("/simulator/savings", {
        method: "POST",
        body: JSON.stringify({ reductionPercentage, months: 12, startDate, endDate }),
      }),
      this.getOverview(),
    ]);

    const monthlyIncrease = toNumber(result.simulation.estimatedMonthlySavings);
    const points = Array.from({ length: 5 }, (_, index) => {
      const month = index * 3;
      return {
        month: month === 0 ? "Now" : `${month} mo`,
        current: 0,
        optimized: monthlyIncrease * month,
      };
    });

    return {
      monthlySavingsIncrease: monthlyIncrease,
      annualSavingsIncrease: toNumber(result.simulation.estimatedTotalSavings),
      baselineMonthlySpend: toNumber(result.simulation.baselineMonthlySpend),
      currentSavings: pulse.currentSavings,
      projection: points,
      disclaimer: result.simulation.disclaimer,
    };
  }

  static async getBills(): Promise<RecurringBillItem[]> {
    const result = await request<{ recurringPayments: Array<{
      id: string;
      merchant: string;
      expectedAmount: string | number;
      currency: string;
      frequency: string;
      status: string;
      nextDueAt: string | null;
      confidence: string;
    }> }>("/recurring-payments");

    return result.recurringPayments.map((payment) => ({
      id: payment.id,
      name: payment.merchant,
      amount: toNumber(payment.expectedAmount),
      currency: payment.currency,
      frequency: payment.frequency,
      status: payment.status,
      dueDate: payment.nextDueAt,
      confidence: payment.confidence,
    }));
  }

  static async getReminders(): Promise<ReminderItem[]> {
    const result = await request<{ reminders: Array<{
      id: string;
      title: string;
      amount: string | number | null;
      currency: string | null;
      dueAt: string;
      status: ReminderItem["status"];
    }> }>("/reminders?upcoming=true");

    return result.reminders.map((reminder) => ({
      ...reminder,
      amount: reminder.amount == null ? null : toNumber(reminder.amount),
    }));
  }

  static async createReminder(payload: {
    title: string;
    amount?: number;
    currency?: string;
    dueAt: string;
  }): Promise<ReminderItem> {
    const result = await request<{ reminder: Omit<ReminderItem, "amount"> & { amount: string | number | null } }>("/reminders", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return {
      ...result.reminder,
      amount: result.reminder.amount == null ? null : toNumber(result.reminder.amount),
    };
  }

  static async updateReminder(
    id: string,
    payload: { status: ReminderItem["status"] }
  ): Promise<ReminderItem> {
    const result = await request<{ reminder: Omit<ReminderItem, "amount"> & { amount: string | number | null } }>(
      `/reminders/${encodeURIComponent(id)}`,
      { method: "PATCH", body: JSON.stringify(payload) }
    );
    return {
      ...result.reminder,
      amount: result.reminder.amount == null ? null : toNumber(result.reminder.amount),
    };
  }

  static async detectRecurringPayments() {
    return request<{ detected: unknown[] }>("/recurring-payments/detect", { method: "POST" });
  }

  static async getPurchases(): Promise<TransactionItem[]> {
    return this.getTransactions({ source: "PAYPAL_CHECKOUT" });
  }

  static async askAssistant(query: string, conversationId?: string) {
    const result = await request<{
      conversationId: string;
      answer: string;
      evidence?: Array<{ tool: string }>;
    }>("/ai/chat", {
      method: "POST",
      body: JSON.stringify({ message: query, conversationId }),
    });

    return {
      conversationId: result.conversationId,
      text: result.answer,
      agentName: "FinSight AI",
      toolAudit: result.evidence?.map((evidence) => ({ toolName: evidence.tool })) || [],
    };
  }

  static async createPayPalOrder(data: {
    amount: number;
    currency: string;
    merchantName?: string;
    description?: string;
  }) {
    const result = await request<{ paypalOrderId: string; status: string }>("/paypal/orders", {
      method: "POST",
      body: JSON.stringify({
        amount: data.amount,
        currency: data.currency,
        description: [data.merchantName, data.description].filter(Boolean).join(" - "),
      }),
    });
    return { orderId: result.paypalOrderId, status: result.status };
  }

  static async capturePayPalOrder(orderId: string) {
    return request<{ status: string; transaction: TransactionRecord }>(
      `/paypal/orders/${encodeURIComponent(orderId)}/capture`,
      { method: "POST", body: JSON.stringify({}) }
    );
  }

  static async getPayPalStatus() {
    const result = await request<{ status: {
      configured: boolean;
      environment: string;
      currency: string;
      clientId: string | null;
      message?: string;
    } }>("/paypal/status");
    return result.status;
  }
}
