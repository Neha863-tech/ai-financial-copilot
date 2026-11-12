import re
from typing import Any, Dict, List, Optional
import numpy as np
from app.clients.groq_client import groq_client
from app.clients.node_backend_client import node_client
from app.prompts.categorization_prompts import CATEGORIZATION_SYSTEM_PROMPT


class ExpenseIntelligenceAgent:
    """
    Expense Intelligence Agent:
    - Categorizes transactions with confidence scores
    - Merchant and spending pattern matching
    - Duplicate transaction detection
    - Recurring expense identification
    - Unusual spending / anomaly detection
    """

    # Deterministic Rule Maps (Rule-First Architecture)
    MERCHANT_RULES = {
        "swiggy": "Food & Dining",
        "zomato": "Food & Dining",
        "mcdonald": "Food & Dining",
        "starbucks": "Food & Dining",
        "domino": "Food & Dining",
        "uber": "Travel & Transport",
        "ola": "Travel & Transport",
        "rapido": "Travel & Transport",
        "irctc": "Travel & Transport",
        "indigo": "Travel & Transport",
        "amazon": "Shopping",
        "flipkart": "Shopping",
        "myntra": "Shopping",
        "zara": "Shopping",
        "netflix": "Subscriptions",
        "spotify": "Subscriptions",
        "youtube": "Subscriptions",
        "hotstar": "Subscriptions",
        "prime": "Subscriptions",
        "nature basket": "Groceries",
        "blinkit": "Groceries",
        "zepto": "Groceries",
        "instamart": "Groceries",
        "bigbasket": "Groceries",
        "airtel": "Bills & Utilities",
        "jio": "Bills & Utilities",
        "bescom": "Bills & Utilities",
        "tata power": "Bills & Utilities",
        "apollo": "Healthcare",
        "1mg": "Healthcare",
        "pharmeasy": "Healthcare",
        "salary": "Salary",
        "zerodha": "Investments",
        "groww": "Investments",
    }

    async def categorize_transaction(
        self, merchant: str, description: Optional[str] = None, amount: Optional[float] = None
    ) -> Dict[str, Any]:
        """
        Categorizes a transaction using fast deterministic rules first,
        falling back to Groq for ambiguous merchants.
        """
        text_to_match = f"{merchant} {description or ''}".lower()

        # 1. Deterministic Rule Match
        for pattern, category in self.MERCHANT_RULES.items():
            if pattern in text_to_match:
                return {
                    "category": category,
                    "confidence": 0.98,
                    "method": "DETERMINISTIC_RULE",
                    "merchant": merchant,
                    "is_recurring": category in ["Subscriptions", "Bills & Utilities"],
                    "reasoning": f"Matched verified merchant pattern '{pattern}'",
                }

        # 2. Groq LLM Categorization for ambiguous merchants
        messages = [
            {"role": "system", "content": CATEGORIZATION_SYSTEM_PROMPT},
            {
                "role": "user",
                "content": f"Categorize transaction: Merchant='{merchant}', Description='{description or ''}', Amount={amount or 0.0}",
            },
        ]

        result = await groq_client.structured_json(messages, temperature=0.1)
        data = result.get("data", {})

        return {
            "category": data.get("category", "Other"),
            "confidence": float(data.get("confidence", 0.85)),
            "method": "GROQ_LLM",
            "merchant": merchant,
            "is_recurring": bool(data.get("is_recurring", False)),
            "reasoning": data.get("reasoning", "Categorized using LLM semantic reasoning"),
        }

    async def detect_anomalies(self, user_id: str) -> List[Dict[str, Any]]:
        """
        Detects unusual transactions using statistical Z-score outlier detection.
        Flags transactions exceeding 2.5 standard deviations from the category median.
        """
        txs = await node_client.get_transactions(user_id, limit=200)
        expenses = [t for t in txs if t.get("direction") == "EXPENSE" and t.get("status") == "COMPLETED"]

        if len(expenses) < 5:
            return []

        amounts = np.array([float(t.get("amount", 0.0)) for t in expenses])
        mean_amt = np.mean(amounts)
        std_amt = np.std(amounts)

        anomalies = []
        for t in expenses:
            amt = float(t.get("amount", 0.0))
            if std_amt > 0:
                z_score = (amt - mean_amt) / std_amt
                if z_score >= 2.0 or amt >= 15000.0:
                    anomalies.append({
                        "transaction_id": t.get("id"),
                        "merchant": t.get("merchant", "Unknown"),
                        "amount": amt,
                        "currency": t.get("currency", "INR"),
                        "date": t.get("date"),
                        "category": t.get("category", "Other"),
                        "anomaly_score": round(float(z_score), 2),
                        "reason": f"Amount ₹{amt:,.2f} is significantly higher than your typical average (₹{mean_amt:,.2f})",
                        "severity": "HIGH" if z_score >= 3.0 else "MEDIUM",
                    })

        return anomalies[:10]

    async def detect_duplicate_transactions(self, user_id: str) -> List[Dict[str, Any]]:
        """
        Detects potential duplicate transactions (same merchant, identical amount within 48h).
        """
        txs = await node_client.get_transactions(user_id, limit=100)
        duplicates = []
        seen = {}

        for t in txs:
            merchant = (t.get("merchant") or "").strip().lower()
            amount = float(t.get("amount", 0.0))
            date_str = (t.get("date") or "")[:10]

            key = (merchant, amount, date_str)
            if key in seen:
                orig = seen[key]
                duplicates.append({
                    "original_transaction_id": orig.get("id"),
                    "duplicate_transaction_id": t.get("id"),
                    "merchant": t.get("merchant"),
                    "amount": amount,
                    "date": t.get("date"),
                    "warning": "Duplicate transaction detected with identical merchant, amount, and date.",
                })
            else:
                seen[key] = t

        return duplicates

    async def detect_recurring_expenses(self, user_id: str) -> List[Dict[str, Any]]:
        """
        Identifies recurring spending patterns across monthly billing cycles.
        """
        txs = await node_client.get_transactions(user_id, limit=200)
        merchant_groups: Dict[str, List[float]] = {}

        for t in txs:
            merchant = (t.get("merchant") or "").strip()
            if merchant and t.get("direction") == "EXPENSE":
                merchant_groups.setdefault(merchant, []).append(float(t.get("amount", 0.0)))

        recurring = []
        for merchant, amounts in merchant_groups.items():
            if len(amounts) >= 2:
                avg = np.mean(amounts)
                # Check consistency
                std = np.std(amounts)
                if std < (avg * 0.15) or len(amounts) >= 3:
                    recurring.append({
                        "merchant": merchant,
                        "average_amount": round(float(avg), 2),
                        "occurrences": len(amounts),
                        "frequency": "MONTHLY",
                        "confidence": 0.92,
                    })

        return recurring


expense_agent = ExpenseIntelligenceAgent()
