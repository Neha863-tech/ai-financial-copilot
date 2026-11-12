from fastapi import APIRouter, Depends
from app.dependencies import get_current_user_id
from app.models.responses import APIResponse
from app.agents.bills_agent import bills_agent

router = APIRouter(prefix="/api/v1/bills", tags=["Bills & Subscription Intelligence"])


@router.post("/analyze", response_model=APIResponse)
async def analyze_recurring_bills(user_id: str = Depends(get_current_user_id)):
    """
    Summarizes recurring obligations, subscriptions, and potential optimizations.
    """
    analysis = await bills_agent.analyze_bills(user_id)
    return APIResponse(success=True, message="Bills analysis completed", data=analysis)
