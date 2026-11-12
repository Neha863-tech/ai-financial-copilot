import pytest
from app.agents.expense_agent import expense_agent
from app.agents.budget_agent import budget_agent
from app.agents.forecasting_agent import forecasting_agent
from app.agents.document_agent import document_agent
from app.agents.shopping_agent import shopping_agent
from app.agents.bills_agent import bills_agent
from app.agents.automation_agent import automation_agent


@pytest.mark.asyncio
async def test_expense_categorization_deterministic():
    # Test deterministic rule
    res_swiggy = await expense_agent.categorize_transaction("Swiggy India", "Lunch bowl", 350.0)
    assert res_swiggy["category"] == "Food & Dining"
    assert res_swiggy["confidence"] >= 0.9

    res_netflix = await expense_agent.categorize_transaction("Netflix Entertainment", "Monthly UHD", 649.0)
    assert res_netflix["category"] == "Subscriptions"
    assert res_netflix["is_recurring"] is True


@pytest.mark.asyncio
async def test_budget_savings_plan():
    plan = await budget_agent.generate_savings_plan("demo-user-1", target_monthly_savings=5000.0)

    assert plan["target_savings_requested"] == 5000.0
    assert plan["reduction_achievable"] > 0
    assert len(plan["category_reallocations"]) > 0
    assert "assumptions" in plan


@pytest.mark.asyncio
async def test_forecasting_agent_month_end():
    forecast = await forecasting_agent.forecast_month_end("demo-user-1")

    assert forecast["forecast_type"] == "MONTH_END_PROJECTION"
    assert "confidence_range" in forecast
    assert forecast["projected_month_end_expenses"] > 0
    assert "disclaimer" in forecast


@pytest.mark.asyncio
async def test_document_duplicate_check():
    dup_check = await document_agent.check_duplicate_import(
        user_id="demo-user-1",
        merchant="Swiggy",
        amount=450.0,
        date_str="2026-11-10",
    )
    # Checks duplicate verification mechanism
    assert "is_duplicate" in dup_check


@pytest.mark.asyncio
async def test_shopping_affordability():
    sim = await shopping_agent.check_affordability(
        user_id="demo-user-1",
        product_name="Sony Headphones",
        price=26990.0,
    )
    assert sim["product_name"] == "Sony Headphones"
    assert sim["verdict"] in ["BUY_NOW_APPROVED", "BUY_FROM_SURPLUS", "DELAY_AND_SAVE"]
    assert "monthly_sip_recommendation" in sim


@pytest.mark.asyncio
async def test_bills_intelligence():
    bills_data = await bills_agent.analyze_bills("demo-user-1")
    assert "monthly_recurring_commitment" in bills_data
    assert "annualized_cost" in bills_data
    assert bills_data["annualized_cost"] == round(bills_data["monthly_recurring_commitment"] * 12, 2)


@pytest.mark.asyncio
async def test_automation_actions_preparation():
    auto = await automation_agent.prepare_automation_actions("demo-user-1")
    assert "prepared_actions" in auto
    assert "guardrail_status" in auto
    assert "ENFORCED" in auto["guardrail_status"]
