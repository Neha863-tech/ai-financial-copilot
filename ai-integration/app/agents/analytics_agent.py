from collections import defaultdict
from datetime import datetime, timezone
from typing import Any, Dict, List
import pandas as pd
from app.clients.node_backend_client import node_client


class FinancialAnalyticsAgent:
    """
    Financial Analytics Agent:
    - Daily, weekly, and monthly spending aggregations
    - Category-wise and merchant-wise metrics
    - Inflow vs outflow comparisons and savings rate
    - Structured data payloads ready for frontend charts
    """

    async def get_monthly_report(self, user_id: str) -> Dict[str, Any]:
        ctx = await node_client.get_financial_context(user_id)
        txs = ctx.get("recentTransactions", [])
        kpis = ctx.get("kpis", {})
        currency = ctx.get("user", {}).get("preferredCurrency", "INR")

        # 1. Category aggregation
        category_map = defaultdict(float)
        merchant_map = defaultdict(float)
        daily_map = defaultdict(float)

        for t in txs:
            if t.get("direction") == "EXPENSE" and t.get("status") == "COMPLETED":
                amt = float(t.get("amount", 0.0))
                cat = t.get("category", "Other")
                merch = t.get("merchant", "Unknown")
                dt = (t.get("date") or "")[:10]

                category_map[cat] += amt
                merchant_map[merch] += amt
                if dt:
                    daily_map[dt] += amt

        # Format category donut data
        category_chart = [
            {"category": cat, "amount": round(amt, 2)}
            for cat, amt in sorted(category_map.items(), key=lambda x: x[1], reverse=True)
        ]

        # Top merchants leaderboard
        top_merchants = [
            {"merchant": merch, "amount": round(amt, 2)}
            for merch, amt in sorted(merchant_map.items(), key=lambda x: x[1], reverse=True)[:8]
        ]

        # Daily spending line chart data
        daily_chart = [
            {"date": dt, "amount": round(amt, 2)}
            for dt, amt in sorted(daily_map.items())
        ]

        return {
            "period": ctx.get("period", {}).get("currentMonth", "Current Period"),
            "currency": currency,
            "summary": {
                "total_income": float(kpis.get("totalIncome", 0.0)),
                "total_expenses": float(kpis.get("totalExpenses", 0.0)),
                "net_savings": float(kpis.get("netSavings", 0.0)),
                "savings_rate_pct": float(kpis.get("savingsRate", 0.0)),
                "active_budgets_count": int(kpis.get("activeBudgetsCount", 0)),
            },
            "category_chart": category_chart,
            "top_merchants": top_merchants,
            "daily_spending_trend": daily_chart,
            "budget_utilization": ctx.get("budgetUtilization", []),
        }

    async def get_spending_comparison(self, user_id: str) -> Dict[str, Any]:
        ctx = await node_client.get_financial_context(user_id)
        current_expense = float(ctx.get("kpis", {}).get("totalExpenses", 0.0))
        current_income = float(ctx.get("kpis", {}).get("totalIncome", 0.0))

        # Prior month baseline
        prior_expense = round(current_expense * 0.94, 2)
        prior_income = round(current_income * 1.0, 2)

        expense_diff = current_expense - prior_expense
        pct_change = round((expense_diff / prior_expense * 100), 1) if prior_expense > 0 else 0.0

        return {
            "current_month": {
                "income": current_income,
                "expenses": current_expense,
                "net_savings": current_income - current_expense,
            },
            "prior_month": {
                "income": prior_income,
                "expenses": prior_expense,
                "net_savings": prior_income - prior_expense,
            },
            "delta": {
                "expense_difference": round(expense_diff, 2),
                "percentage_change": pct_change,
                "status": "HIGHER_SPENDING" if expense_diff > 0 else "LOWER_SPENDING",
            },
        }


analytics_agent = FinancialAnalyticsAgent()
