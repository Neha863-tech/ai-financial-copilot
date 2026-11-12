from typing import Any, Dict, List
from app.clients.node_backend_client import node_client


class FinancialAutomationAgent:
    """
    AI Financial Automation Agent:
    - Prepares automated alerts, bill reminders, and monthly digest items
    - STRICT GUARDRAILS: All consequential actions require explicit user confirmation
    - Never transfers funds, initiates charges, or cancels contracts independently
    """

    async def prepare_automation_actions(self, user_id: str) -> Dict[str, Any]:
        ctx = await node_client.get_financial_context(user_id)
        budgets = ctx.get("budgetUtilization", [])
        bills = ctx.get("recurringPayments", [])
        kpis = ctx.get("kpis", {})

        prepared_actions = []

        # 1. Check budget warnings (>= 80% utilization)
        for b in budgets:
            pct = float(b.get("utilizationPct") or 0.0)
            if pct >= 80.0:
                spent_val = float(b.get('spent') or 0.0)
                limit_val = float(b.get('limit') or 0.0)
                rem_val = float(b.get('remaining') or 0.0)
                prepared_actions.append({
                    "action_type": "BUDGET_THRESHOLD_ALERT",
                    "priority": "HIGH" if pct >= 100.0 else "MEDIUM",
                    "title": f"Budget Alert: {b.get('category')} at {pct}%",
                    "description": f"You have spent ₹{spent_val:,.2f} of your ₹{limit_val:,.2f} limit. ₹{rem_val:,.2f} remaining.",
                    "requires_confirmation": False,
                    "target_entity": b.get("id"),
                })

        # 2. Check upcoming bills
        for bill in bills:
            amt_val = float(bill.get('amount') or 0.0)
            prepared_actions.append({
                "action_type": "BILL_REMINDER",
                "priority": "MEDIUM",
                "title": f"Bill Due Soon: {bill.get('name')}",
                "description": f"Scheduled payment of ₹{amt_val:,.2f} due on {bill.get('nextDueDate', 'upcoming date')[:10]}.",
                "requires_confirmation": False,
                "target_entity": bill.get("id"),
            })

        # 3. Monthly savings milestone check
        savings_rate = float(kpis.get("savingsRate", 0.0))
        if savings_rate >= 20.0:
            prepared_actions.append({
                "action_type": "SAVINGS_MILESTONE_DIGEST",
                "priority": "LOW",
                "title": "Savings Discipline Milestone Achieved",
                "description": f"Your current savings rate is {savings_rate}%, achieving the financial wellness target.",
                "requires_confirmation": False,
                "target_entity": "SAVINGS_RATE",
            })

        return {
            "user_id": user_id,
            "actions_count": len(prepared_actions),
            "prepared_actions": prepared_actions,
            "guardrail_status": "ENFORCED (No automated monetary transfers or contract cancellations allowed without explicit user authorization)",
        }


automation_agent = FinancialAutomationAgent()
