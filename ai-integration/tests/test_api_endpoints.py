import pytest
from fastapi.testclient import TestClient


def test_health_endpoint(client: TestClient):
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "environment" in data


def test_copilot_chat_endpoint(client: TestClient):
    payload = {"message": "Can I afford to purchase a laptop worth ₹60,000?"}
    headers = {"x-user-id": "demo-user-1"}
    response = client.post("/api/v1/copilot/chat", json=payload, headers=headers)

    assert response.status_code == 200
    res = response.json()
    assert res["success"] is True
    assert "answer" in res["data"]
    assert "key_figures" in res["data"]
    assert "recommendations" in res["data"]


def test_copilot_financial_summary_endpoint(client: TestClient):
    headers = {"x-user-id": "demo-user-1"}
    response = client.post("/api/v1/copilot/financial-summary", headers=headers)

    assert response.status_code == 200
    res = response.json()
    assert res["success"] is True
    assert "monthly_summary" in res["data"]


def test_expense_categorize_endpoint(client: TestClient):
    payload = {"merchant": "Swiggy", "description": "Dinner meal", "amount": 450.0}
    response = client.post("/api/v1/expenses/categorize", json=payload)

    assert response.status_code == 200
    res = response.json()
    assert res["data"]["category"] == "Food & Dining"


def test_budget_recommend_endpoint(client: TestClient):
    payload = {"target_monthly_savings": 5000.0}
    headers = {"x-user-id": "demo-user-1"}
    response = client.post("/api/v1/budgets/recommend", json=payload, headers=headers)

    assert response.status_code == 200
    res = response.json()
    assert res["data"]["target_savings_requested"] == 5000.0


def test_forecast_month_end_endpoint(client: TestClient):
    headers = {"x-user-id": "demo-user-1"}
    response = client.post("/api/v1/forecast/month-end", headers=headers)

    assert response.status_code == 200
    res = response.json()
    assert "projected_month_end_expenses" in res["data"]


def test_shopping_affordability_endpoint(client: TestClient):
    payload = {"product_name": "Office Desk", "price": 12000.0}
    headers = {"x-user-id": "demo-user-1"}
    response = client.post("/api/v1/shopping/affordability", json=payload, headers=headers)

    assert response.status_code == 200
    res = response.json()
    assert res["data"]["product_name"] == "Office Desk"


def test_automation_prepare_endpoint(client: TestClient):
    headers = {"x-user-id": "demo-user-1"}
    response = client.post("/api/v1/automation/prepare", headers=headers)

    assert response.status_code == 200
    res = response.json()
    assert "prepared_actions" in res["data"]
