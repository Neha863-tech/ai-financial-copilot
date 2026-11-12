from fastapi import APIRouter, Depends
from app.dependencies import get_current_user_id
from app.models.responses import APIResponse
from app.agents.automation_agent import automation_agent

router = APIRouter(prefix="/api/v1/automation", tags=["AI Financial Automation"])


@router.post("/prepare", response_model=APIResponse)
async def prepare_automation_actions(user_id: str = Depends(get_current_user_id)):
    """
    Prepares actionable alerts, bill reminders, and milestone notifications.
    Strictly enforces user confirmation guardrails for consequential operations.
    """
    actions = await automation_agent.prepare_automation_actions(user_id)
    return APIResponse(success=True, message="Automation actions prepared", data=actions)
