from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class APIResponse(BaseModel):
    success: bool = True
    message: str = "Success"
    data: Optional[Any] = None
    errors: Optional[List[str]] = None


class HealthResponse(BaseModel):
    status: str = "ok"
    service: str = "FinSight AI Integration Microservice"
    version: str = "1.0.0"
    environment: str
    groq_configured: bool
    node_backend_connected: bool
    timestamp: str
