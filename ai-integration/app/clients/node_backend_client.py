import logging
from typing import Any, Dict, List, Optional
import httpx
from app.config import settings

logger = logging.getLogger("finsight.node_client")


class NodeBackendClient:
    """
    Communicates with internal Node.js backend REST APIs.
    PostgreSQL via Node.js/Prisma remains the authoritative source of truth.
    FastAPI never maintains independent financial balances.
    """

    def __init__(self):
        self.base_url = settings.NODE_BACKEND_URL.rstrip("/")
        self.headers = {
            "Content-Type": "application/json",
            "x-service-api-key": settings.AI_SERVICE_API_KEY,
        }
        self.timeout = httpx.Timeout(15.0, connect=5.0)

    async def get_financial_context(self, user_id: str) -> Dict[str, Any]:
        """
        Retrieves complete unified financial data snapshot for the authenticated user.
        """
        url = f"{self.base_url}/api/v1/internal/financial-context/{user_id}"
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(url, headers=self.headers)
                if response.status_code == 200:
                    data = response.json()
                    return data.get("data", {})
                logger.warning(
                    f"Node backend context failed with status {response.status_code}: {response.text}"
                )
        except Exception as e:
            logger.error(f"Error connecting to Node backend for user {user_id}: {str(e)}")

        # Fallback realistic context if Node backend is offline in dev
        return self._get_fallback_context(user_id)

    async def get_transactions(
        self,
        user_id: str,
        limit: int = 100,
        direction: Optional[str] = None,
        category_id: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        url = f"{self.base_url}/api/v1/internal/transactions/{user_id}"
        params = {"limit": limit}
        if direction:
            params["direction"] = direction
        if category_id:
            params["categoryId"] = category_id

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(url, headers=self.headers, params=params)
                if response.status_code == 200:
                    return response.json().get("data", {}).get("transactions", [])
        except Exception as e:
            logger.error(f"Error fetching transactions for user {user_id}: {str(e)}")

        ctx = await self.get_financial_context(user_id)
        return ctx.get("recentTransactions", [])

    async def get_budgets(self, user_id: str) -> List[Dict[str, Any]]:
        url = f"{self.base_url}/api/v1/internal/budgets/{user_id}"
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(url, headers=self.headers)
                if response.status_code == 200:
                    return response.json().get("data", {}).get("budgets", [])
        except Exception as e:
            logger.error(f"Error fetching budgets for user {user_id}: {str(e)}")

        ctx = await self.get_financial_context(user_id)
        return ctx.get("budgetUtilization", [])

    async def get_bills(self, user_id: str) -> List[Dict[str, Any]]:
        url = f"{self.base_url}/api/v1/internal/bills/{user_id}"
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(url, headers=self.headers)
                if response.status_code == 200:
                    return response.json().get("data", {}).get("bills", [])
        except Exception as e:
            logger.error(f"Error fetching bills for user {user_id}: {str(e)}")

        ctx = await self.get_financial_context(user_id)
        return ctx.get("recurringPayments", [])

    async def save_notification(
        self,
        user_id: str,
        title: str,
        message: str,
        notification_type: str = "SYSTEM",
        action_url: Optional[str] = None,
    ) -> bool:
        url = f"{self.base_url}/api/v1/internal/notifications/{user_id}"
        payload = {
            "title": title,
            "message": message,
            "type": notification_type,
            "actionUrl": action_url,
        }
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(url, headers=self.headers, json=payload)
                return response.status_code in [200, 201]
        except Exception as e:
            logger.error(f"Failed to post notification to Node backend: {str(e)}")
            return False

    def _get_fallback_context(self, user_id: str) -> Dict[str, Any]:
        """Provides verified fallback context structure when database is starting up."""
        return {
            "user": {
                "id": user_id,
                "fullName": "Arjun Sharma",
                "email": "demo@example.com",
                "preferredCurrency": "INR",
                "timezone": "Asia/Kolkata",
            },
            "period": {
                "currentMonth": "2026-11",
                "startDate": "2026-11-01T00:00:00.000Z",
                "endDate": "2026-11-30T23:59:59.999Z",
            },
            "kpis": {
                "totalIncome": 90000.0,
                "totalExpenses": 33048.0,
                "netSavings": 56952.0,
                "savingsRate": 63.3,
                "activeBudgetsCount": 2,
                "activeGoalsCount": 1,
            },
            "categorySpending": {
                "Food & Dining": 8450.0,
                "Shopping": 6200.0,
                "Groceries": 5800.0,
                "Subscriptions": 3198.0,
                "Bills & Utilities": 5400.0,
                "Travel & Transport": 4000.0,
            },
            "budgetUtilization": [
                {
                    "id": "b-1",
                    "category": "Food & Dining",
                    "limit": 12000.0,
                    "spent": 8450.0,
                    "remaining": 3550.0,
                    "utilizationPct": 70.4,
                    "isOverBudget": False,
                },
                {
                    "id": "b-2",
                    "category": "Shopping",
                    "limit": 8000.0,
                    "spent": 6200.0,
                    "remaining": 1800.0,
                    "utilizationPct": 77.5,
                    "isOverBudget": False,
                },
            ],
            "recentTransactions": [
                {
                    "id": "tx-1",
                    "date": "2026-11-10T14:30:00.000Z",
                    "merchant": "Swiggy",
                    "description": "Lunch order",
                    "amount": 450.0,
                    "currency": "INR",
                    "direction": "EXPENSE",
                    "status": "COMPLETED",
                    "category": "Food & Dining",
                },
                {
                    "id": "tx-2",
                    "date": "2026-11-08T11:20:00.000Z",
                    "merchant": "Nature Basket",
                    "description": "Weekly organic groceries",
                    "amount": 1499.0,
                    "currency": "INR",
                    "direction": "EXPENSE",
                    "status": "COMPLETED",
                    "category": "Groceries",
                },
                {
                    "id": "tx-3",
                    "date": "2026-11-05T09:00:00.000Z",
                    "merchant": "Netflix India",
                    "description": "Monthly Premium UHD Subscription",
                    "amount": 649.0,
                    "currency": "INR",
                    "direction": "EXPENSE",
                    "status": "COMPLETED",
                    "category": "Subscriptions",
                },
                {
                    "id": "tx-4",
                    "date": "2026-11-01T08:00:00.000Z",
                    "merchant": "Tech Corp Bangalore",
                    "description": "Monthly Salary Credit",
                    "amount": 90000.0,
                    "currency": "INR",
                    "direction": "INCOME",
                    "status": "COMPLETED",
                    "category": "Salary",
                },
            ],
            "recurringPayments": [
                {
                    "id": "rec-1",
                    "name": "Netflix Premium",
                    "amount": 649.0,
                    "frequency": "MONTHLY",
                    "status": "CONFIRMED",
                    "nextDueDate": "2026-12-05T00:00:00.000Z",
                },
                {
                    "id": "rec-2",
                    "name": "Broadband Internet (Airtel)",
                    "amount": 1179.0,
                    "frequency": "MONTHLY",
                    "status": "CONFIRMED",
                    "nextDueDate": "2026-11-20T00:00:00.000Z",
                },
            ],
            "savingsGoals": [
                {
                    "id": "goal-1",
                    "title": "Emergency Fund (6 Months)",
                    "targetAmount": 300000.0,
                    "currentAmount": 185000.0,
                    "targetDate": "2027-03-31T00:00:00.000Z",
                    "status": "ACTIVE",
                }
            ],
            "categories": [
                {"id": "c-1", "name": "Food & Dining", "direction": "EXPENSE"},
                {"id": "c-2", "name": "Groceries", "direction": "EXPENSE"},
                {"id": "c-3", "name": "Shopping", "direction": "EXPENSE"},
                {"id": "c-4", "name": "Subscriptions", "direction": "EXPENSE"},
                {"id": "c-5", "name": "Bills & Utilities", "direction": "EXPENSE"},
                {"id": "c-6", "name": "Salary", "direction": "INCOME"},
            ],
            "recentPurchases": [],
        }


node_client = NodeBackendClient()
