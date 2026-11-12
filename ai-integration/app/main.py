import logging
import time
import uuid
from datetime import datetime, timezone
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.config import settings
from app.models.responses import APIResponse, HealthResponse
from app.clients.groq_client import groq_client
from app.clients.node_backend_client import node_client
from app.routers import (
    copilot,
    expenses,
    analytics,
    budgets,
    forecast,
    documents,
    shopping,
    bills,
    automation,
)

# Configure logging
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO),
    format="[%(asctime)s] [%(levelname)s] [%(name)s]: %(message)s",
)
logger = logging.getLogger("finsight.main")

app = FastAPI(
    title="FinSight AI Integration Microservice",
    description="Dedicated Python FastAPI AI microservice for FinSight AI personal finance copilot.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Request ID & Latency Tracking Middleware
@app.middleware("http")
async def request_context_middleware(request: Request, call_next):
    request_id = request.headers.get("x-request-id") or str(uuid.uuid4())
    start_time = time.time()

    response = await call_next(request)

    latency_ms = round((time.time() - start_time) * 1000, 2)
    response.headers["x-request-id"] = request_id
    response.headers["x-response-time"] = f"{latency_ms}ms"

    logger.info(
        f"{request.method} {request.url.path} -> {response.status_code} ({latency_ms}ms) [reqId={request_id}]"
    )
    return response


# Global Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception in {request.method} {request.url.path}: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "message": "Internal AI microservice error",
            "errors": [str(exc)],
        },
    )


# Health Check Endpoint
@app.get("/health", response_model=HealthResponse, tags=["Health"])
async def health_check():
    """
    Service health check: verifies connectivity to Groq AI and Node.js backend.
    """
    # Check Node backend
    node_connected = False
    try:
        ctx = await node_client.get_financial_context("demo-user-1")
        node_connected = bool(ctx and ctx.get("user"))
    except Exception:
        node_connected = False

    return HealthResponse(
        status="ok",
        service="FinSight AI Integration Microservice",
        version="1.0.0",
        environment=settings.AI_SERVICE_ENV,
        groq_configured=groq_client.is_configured,
        node_backend_connected=node_connected,
        timestamp=datetime.now(timezone.utc).isoformat(),
    )


@app.get("/", tags=["Root"])
async def root():
    return {
        "service": "FinSight AI Integration Microservice",
        "status": "operational",
        "documentation": "/docs",
        "version": "1.0.0",
    }


# Mount Versioned API Routers
app.include_router(copilot.router)
app.include_router(expenses.router)
app.include_router(analytics.router)
app.include_router(budgets.router)
app.include_router(forecast.router)
app.include_router(documents.router)
app.include_router(shopping.router)
app.include_router(bills.router)
app.include_router(automation.router)
