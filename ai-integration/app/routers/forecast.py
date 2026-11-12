from fastapi import APIRouter, Depends
from app.dependencies import get_current_user_id
from app.models.responses import APIResponse
from app.agents.forecasting_agent import forecasting_agent

router = APIRouter(prefix="/api/v1/forecast", tags=["Financial Forecasting"])


@router.post("/month-end", response_model=APIResponse)
async def forecast_month_end(user_id: str = Depends(get_current_user_id)):
    """
    Projects month-end spending, net savings, and uncertainty bounds using ML and daily velocity.
    """
    forecast = await forecasting_agent.forecast_month_end(user_id)
    return APIResponse(success=True, message="Month-end forecast generated", data=forecast)


@router.post("/cash-flow", response_model=APIResponse)
async def forecast_cash_flow(user_id: str = Depends(get_current_user_id)):
    """
    Estimates upcoming cash-flow cushion and detects short-term financial pressure.
    """
    cash_flow = await forecasting_agent.forecast_cash_flow(user_id)
    return APIResponse(success=True, message="Cash flow projection completed", data=cash_flow)
