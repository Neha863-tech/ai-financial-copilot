from fastapi import APIRouter, Depends
from app.dependencies import get_current_user_id
from app.models.requests import BudgetRecommendRequest
from app.models.responses import APIResponse
from app.agents.budget_agent import budget_agent

router = APIRouter(prefix="/api/v1/budgets", tags=["Budget Optimization"])


@router.post("/analyze", response_model=APIResponse)
async def analyze_budgets(user_id: str = Depends(get_current_user_id)):
    """
    Analyzes actual spending vs budgets, identifying overspending and warnings.
    """
    analysis = await budget_agent.analyze_budgets(user_id)
    return APIResponse(success=True, message="Budget analysis completed", data=analysis)


@router.post("/recommend", response_model=APIResponse)
async def recommend_budget_plan(
    payload: BudgetRecommendRequest, user_id: str = Depends(get_current_user_id)
):
    """
    Generates a practical savings plan (e.g. save ₹5,000 extra) by optimizing flexible categories.
    """
    plan = await budget_agent.generate_savings_plan(
        user_id, target_monthly_savings=payload.target_monthly_savings or 5000.0
    )
    return APIResponse(success=True, message="Savings optimization plan generated", data=plan)
