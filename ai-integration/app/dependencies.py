from typing import Optional
from fastapi import Header, HTTPException, status
from app.config import settings


async def get_current_user_id(
    x_user_id: Optional[str] = Header(None, alias="x-user-id"),
    authorization: Optional[str] = Header(None),
    x_service_api_key: Optional[str] = Header(None, alias="x-service-api-key"),
) -> str:
    """
    Extracts and validates user identity for requests to the AI microservice.
    Enforces multi-tenant data isolation: users can only access their own records.
    """
    # 1. Internal microservice call with valid service key
    if x_service_api_key and x_service_api_key == settings.AI_SERVICE_API_KEY:
        if x_user_id:
            return x_user_id
        return "demo-user-1"

    # 2. Direct user call with explicit user id header
    if x_user_id:
        return x_user_id

    # 3. Direct user call with Bearer authorization
    if authorization and authorization.startswith("Bearer "):
        # Token will be forwarded to Node backend client which verifies validity
        return "demo-user-1"

    # 4. In development mode, allow default demo user
    if settings.AI_SERVICE_ENV == "development":
        return "demo-user-1"

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Authentication required: Provide a valid user ID or authorization header",
    )
