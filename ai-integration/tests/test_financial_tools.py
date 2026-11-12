import pytest
from app.tools.financial_tools import financial_tools


@pytest.mark.asyncio
async def test_get_monthly_summary():
    summary = await financial_tools.get_monthly_summary("demo-user-1")

    assert "total_income" in summary
    assert "total_expenses" in summary
    assert "net_savings" in summary
    assert "savings_rate_pct" in summary
    assert summary["total_income"] >= 0
    assert summary["currency"] in ["INR", "USD"]


@pytest.mark.asyncio
async def test_compare_monthly_spending():
    comp = await financial_tools.compare_monthly_spending("demo-user-1")

    assert "current_month_expenses" in comp
    assert "previous_month_expenses" in comp
    assert "percentage_change" in comp
    assert comp["trend"] in ["INCREASED", "DECREASED"]


@pytest.mark.asyncio
async def test_get_category_breakdown():
    breakdown = await financial_tools.get_category_breakdown("demo-user-1")

    assert "categories" in breakdown
    assert isinstance(breakdown["categories"], list)
    assert breakdown["total_expenses"] >= 0


@pytest.mark.asyncio
async def test_simulate_purchase_affordability():
    sim_laptop = await financial_tools.simulate_purchase_affordability("demo-user-1", "Laptop", 60000.0)

    assert sim_laptop["item_name"] == "Laptop"
    assert sim_laptop["item_price"] == 60000.0
    assert sim_laptop["verdict"] in ["SAFE_TO_BUY_NOW", "DELAY_AND_SAVE"]
    assert sim_laptop["months_to_save_from_surplus"] >= 1


@pytest.mark.asyncio
async def test_forecast_month_end_balance():
    forecast = await financial_tools.forecast_month_end_balance("demo-user-1")

    assert "projected_month_end_expenses" in forecast
    assert "projected_month_end_surplus" in forecast
    assert "uncertainty_range" in forecast
    assert len(forecast["uncertainty_range"]) == 2
    assert forecast["uncertainty_range"][0] <= forecast["uncertainty_range"][1]
