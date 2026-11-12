from fastapi import APIRouter, Depends
from app.dependencies import get_current_user_id
from app.models.requests import ChatRequest
from app.models.responses import APIResponse
from app.agents.orchestrator import orchestrator
from app.tools.financial_tools import financial_tools

router = APIRouter(prefix="/api/v1/copilot", tags=["AI Copilot"])


@router.post("/chat", response_model=APIResponse)
async def chat_with_copilot(
    payload: ChatRequest, user_id: str = Depends(get_current_user_id)
):
    """
    Conversational financial assistant with deterministic tool calling and Groq reasoning.
    """
    result = await orchestrator.handle_user_query(
        user_id=user_id,
        query=payload.message,
        conversation_history=payload.history,
    )
    return APIResponse(
        success=True,
        message="Copilot response generated",
        data=result,
    )


@router.post("/financial-summary", response_model=APIResponse)
async def get_financial_summary(user_id: str = Depends(get_current_user_id)):
    """
    Returns an executive financial health summary based on verified PostgreSQL data.
    """
    summary = await financial_tools.get_monthly_summary(user_id)
    savings_rate = await financial_tools.calculate_savings_rate(user_id)
    budgets = await financial_tools.get_budget_status(user_id)
    bills = await financial_tools.get_upcoming_bills(user_id)

    data = {
        "monthly_summary": summary,
        "savings_rate_evaluation": savings_rate,
        "budgets_overview": budgets,
        "upcoming_bills_overview": bills,
    }

    return APIResponse(
        success=True,
        message="Executive financial summary retrieved",
        data=data,
    )
