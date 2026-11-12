from fastapi import APIRouter, Depends
from app.dependencies import get_current_user_id
from app.models.requests import ShoppingAffordabilityRequest, ShoppingCompareRequest
from app.models.responses import APIResponse
from app.agents.shopping_agent import shopping_agent

router = APIRouter(prefix="/api/v1/shopping", tags=["Shopping & Purchase Intelligence"])


@router.post("/compare", response_model=APIResponse)
async def compare_products(
    payload: ShoppingCompareRequest, user_id: str = Depends(get_current_user_id)
):
    """
    Searches product catalog and provides verified price comparison across merchants.
    """
    results = await shopping_agent.search_and_compare(payload.query)
    return APIResponse(success=True, message="Product comparisons retrieved", data={"products": results})


@router.post("/affordability", response_model=APIResponse)
async def check_purchase_affordability(
    payload: ShoppingAffordabilityRequest, user_id: str = Depends(get_current_user_id)
):
    """
    Simulates how an intended purchase impacts current budget, surplus, and savings goals.
    """
    simulation = await shopping_agent.check_affordability(
        user_id=user_id,
        product_name=payload.product_name,
        price=payload.price,
    )
    return APIResponse(success=True, message="Affordability simulation completed", data=simulation)
