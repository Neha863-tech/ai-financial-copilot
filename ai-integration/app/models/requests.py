from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    message: str = Field(..., description="User financial question in natural language")
    conversation_id: Optional[str] = Field(None, description="Optional conversation ID for context continuity")
    history: Optional[List[Dict[str, str]]] = Field(None, description="Recent conversation turns")


class CategorizeRequest(BaseModel):
    merchant: str = Field(..., description="Merchant name or counterparty")
    description: Optional[str] = Field(None, description="Transaction memo or line item description")
    amount: Optional[float] = Field(None, description="Transaction amount")
    currency: Optional[str] = Field("INR", description="Currency code")


class BudgetRecommendRequest(BaseModel):
    target_monthly_savings: Optional[float] = Field(5000.0, description="Desired additional monthly savings in currency units")


class ShoppingAffordabilityRequest(BaseModel):
    product_name: str = Field(..., description="Name of intended purchase")
    price: float = Field(..., gt=0, description="Purchase price")
    category: Optional[str] = Field(None, description="Item category")


class ShoppingCompareRequest(BaseModel):
    query: str = Field(..., description="Search query or product name")


class DocumentExtractTextRequest(BaseModel):
    text: str = Field(..., description="Raw text of invoice, receipt, or bank statement")
    filename: Optional[str] = Field("document.txt", description="Source filename")
