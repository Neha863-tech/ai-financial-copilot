from fastapi import APIRouter, Depends
from app.dependencies import get_current_user_id
from app.models.requests import CategorizeRequest
from app.models.responses import APIResponse
from app.agents.expense_agent import expense_agent

router = APIRouter(prefix="/api/v1/expenses", tags=["Expense Intelligence"])


@router.post("/categorize", response_model=APIResponse)
async def categorize_expense(
    payload: CategorizeRequest, user_id: str = Depends(get_current_user_id)
):
    """
    Categorizes transactions using rules-first deterministic matching with Groq semantic fallback.
    """
    result = await expense_agent.categorize_transaction(
        merchant=payload.merchant,
        description=payload.description,
        amount=payload.amount,
    )
    return APIResponse(success=True, message="Transaction categorized", data=result)


@router.post("/anomalies", response_model=APIResponse)
async def detect_expense_anomalies(user_id: str = Depends(get_current_user_id)):
    """
    Detects unusual or outlier transactions using statistical Z-score analysis.
    """
    anomalies = await expense_agent.detect_anomalies(user_id)
    return APIResponse(
        success=True,
        message=f"Detected {len(anomalies)} unusual transactions",
        data={"anomalies": anomalies},
    )


@router.post("/recurring", response_model=APIResponse)
async def detect_recurring_expenses(user_id: str = Depends(get_current_user_id)):
    """
    Identifies recurring subscriptions and periodic charges from transaction history.
    """
    recurring = await expense_agent.detect_recurring_expenses(user_id)
    return APIResponse(
        success=True,
        message=f"Identified {len(recurring)} recurring expense patterns",
        data={"recurring_expenses": recurring},
    )
