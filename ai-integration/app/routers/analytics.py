from fastapi import APIRouter, Depends
from app.dependencies import get_current_user_id
from app.models.responses import APIResponse
from app.agents.analytics_agent import analytics_agent

router = APIRouter(prefix="/api/v1/analytics", tags=["Financial Analytics"])


@router.post("/monthly-report", response_model=APIResponse)
async def get_monthly_report(user_id: str = Depends(get_current_user_id)):
    """
    Generates structured financial aggregations and chart-ready data payloads.
    """
    report = await analytics_agent.get_monthly_report(user_id)
    return APIResponse(success=True, message="Monthly report generated", data=report)


@router.post("/spending-comparison", response_model=APIResponse)
async def get_spending_comparison(user_id: str = Depends(get_current_user_id)):
    """
    Compares current billing cycle spending against prior month records.
    """
    comparison = await analytics_agent.get_spending_comparison(user_id)
    return APIResponse(success=True, message="Spending comparison generated", data=comparison)
