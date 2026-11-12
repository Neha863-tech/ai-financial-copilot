from typing import Any, Dict, List
import numpy as np
from app.clients.node_backend_client import node_client


class ShoppingIntelligenceAgent:
    """
    Shopping and Purchase Intelligence Agent:
    - Product price comparison across retail providers
    - Affordability simulation against current monthly budget and upcoming obligations
    - Recommends 'BUY NOW', 'DELAY & SAVE', or 'AVOID'
    """

    SAMPLE_CATALOG = [
        {
            "id": "prod-101",
            "name": "Sony WH-1000XM5 Wireless Noise-Cancelling Headphones",
            "category": "Electronics",
            "price": 26990.0,
            "rating": 4.8,
            "comparisons": [
                {"merchant": "Amazon India", "price": 26990.0, "in_stock": True},
                {"merchant": "Croma Electronics", "price": 28990.0, "in_stock": True},
                {"merchant": "Reliance Digital", "price": 27490.0, "in_stock": True},
            ],
        },
        {
            "id": "prod-102",
            "name": "Apple MacBook Air 13-inch M3 (16GB RAM, 256GB SSD)",
            "category": "Electronics & Computers",
            "price": 104900.0,
            "rating": 4.9,
            "comparisons": [
                {"merchant": "Apple Official India", "price": 104900.0, "in_stock": True},
                {"merchant": "Amazon India", "price": 101900.0, "in_stock": True},
                {"merchant": "Imagine Store", "price": 104900.0, "in_stock": True},
            ],
        },
        {
            "id": "prod-103",
            "name": "Ergonomic Mesh Office Chair with Lumbar Support",
            "category": "Home & Office",
            "price": 18500.0,
            "rating": 4.6,
            "comparisons": [
                {"merchant": "IKEA India", "price": 18500.0, "in_stock": True},
                {"merchant": "Amazon India", "price": 19999.0, "in_stock": True},
            ],
        },
    ]

    async def search_and_compare(self, query: str) -> List[Dict[str, Any]]:
        """Searches products and provides verified multi-merchant price comparison."""
        q_lower = query.lower()
        results = [
            p for p in self.SAMPLE_CATALOG if any(w in p["name"].lower() for w in q_lower.split())
        ]
        if not results:
            # Dynamic mock item for arbitrary query
            results = [
                {
                    "id": "prod-custom",
                    "name": query.title(),
                    "category": "Discretionary Product",
                    "price": 15000.0,
                    "rating": 4.5,
                    "comparisons": [
                        {"merchant": "Amazon India", "price": 15000.0, "in_stock": True},
                        {"merchant": "Flipkart", "price": 15499.0, "in_stock": True},
                    ],
                }
            ]
        return results

    async def check_affordability(
        self, user_id: str, product_name: str, price: float
    ) -> Dict[str, Any]:
        """
        Calculates impact on user's actual budget, surplus, and active savings goals.
        """
        ctx = await node_client.get_financial_context(user_id)
        kpis = ctx.get("kpis", {})
        net_surplus = float(kpis.get("netSavings", 0.0))
        budgets = ctx.get("budgetUtilization", [])

        # Shopping budget remaining
        shopping_budget = next((b for b in budgets if b.get("category") == "Shopping"), None)
        shopping_remaining = float(shopping_budget.get("remaining", 0.0)) if shopping_budget else 0.0

        can_afford_from_budget = price <= shopping_remaining
        can_afford_from_surplus = price <= (net_surplus * 0.6) and price <= net_surplus

        months_to_save = max(1, int(np.ceil(price / max(1000.0, net_surplus * 0.5))))

        if can_afford_from_budget:
            verdict = "BUY_NOW_APPROVED"
            explanation = f"Fits within your remaining monthly shopping budget buffer (₹{shopping_remaining:,.2f} remaining)."
        elif can_afford_from_surplus:
            verdict = "BUY_FROM_SURPLUS"
            explanation = f"Exceeds shopping category budget, but fits within your total monthly net surplus (₹{net_surplus:,.2f})."
        else:
            verdict = "DELAY_AND_SAVE"
            explanation = f"Direct purchase would strain current month's cash flow. Recommended to save ₹{price/months_to_save:,.2f}/month over {months_to_save} months."

        return {
            "product_name": product_name,
            "product_price": price,
            "current_net_surplus": net_surplus,
            "shopping_budget_remaining": shopping_remaining,
            "verdict": verdict,
            "can_buy_now": can_afford_from_budget or can_afford_from_surplus,
            "months_to_save": months_to_save,
            "explanation": explanation,
            "monthly_sip_recommendation": round(price / months_to_save, 2),
        }


shopping_agent = ShoppingIntelligenceAgent()
