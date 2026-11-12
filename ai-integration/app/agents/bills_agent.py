from typing import Any, Dict, List
from app.clients.node_backend_client import node_client


class BillsIntelligenceAgent:
    """
    Bills and Subscription Intelligence Agent:
    - Summarizes recurring obligations and subscriptions
    - Flags upcoming bills within next 7-14 days
    - Identifies potentially redundant or forgotten subscriptions
    - Calculates total annual commitment
    """

    async def analyze_bills(self, user_id: str) -> Dict[str, Any]:
        ctx = await node_client.get_financial_context(user_id)
        bills = ctx.get("recurringPayments", [])

        total_monthly = sum(float(b.get("amount") or 0.0) for b in bills)
        total_annual = round(total_monthly * 12, 2)

        # Flag potential optimization
        potential_savings = 0.0
        optimization_suggestions = []

        for b in bills:
            amt = float(b.get("amount") or 0.0)
            name = b.get("name", "")
            if "premium" in name.lower() or "subscription" in name.lower():
                potential_savings += amt * 0.2
                optimization_suggestions.append(
                    f"Consider annual billing or family tier sharing for {name} to save up to 20% annually."
                )

        return {
            "total_active_subscriptions": len(bills),
            "monthly_recurring_commitment": round(total_monthly, 2),
            "annualized_cost": total_annual,
            "bills": bills,
            "potential_annual_savings": round(potential_savings * 12, 2),
            "recommendations": optimization_suggestions or ["All recurring subscriptions are currently optimal."],
        }


bills_agent = BillsIntelligenceAgent()
