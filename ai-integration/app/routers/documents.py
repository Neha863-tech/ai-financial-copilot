from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from app.dependencies import get_current_user_id
from app.models.requests import DocumentExtractTextRequest
from app.models.responses import APIResponse
from app.agents.document_agent import document_agent
from app.config import settings

router = APIRouter(prefix="/api/v1/documents", tags=["Document & Receipt Intelligence"])


@router.post("/upload", response_model=APIResponse)
async def upload_document(
    file: UploadFile = File(...), user_id: str = Depends(get_current_user_id)
):
    """
    Accepts PDF or image receipt/invoice, extracts fields, and validates against duplicates.
    """
    filename = file.filename or "uploaded_document"
    contents = await file.read()

    # Size check
    max_bytes = settings.UPLOAD_MAX_SIZE_MB * 1024 * 1024
    if len(contents) > max_bytes:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File exceeds maximum allowed size of {settings.UPLOAD_MAX_SIZE_MB}MB",
        )

    # Process based on type
    if filename.lower().endswith(".pdf"):
        extracted = await document_agent.extract_from_pdf(contents, filename)
    else:
        extracted = await document_agent.extract_from_image(contents, filename)

    # Duplicate check
    duplicate_check = await document_agent.check_duplicate_import(
        user_id=user_id,
        merchant=extracted.get("merchant", ""),
        amount=extracted.get("total_amount", 0.0),
        date_str=extracted.get("transaction_date", ""),
    )

    data = {
        "extracted_data": extracted,
        "duplicate_detection": duplicate_check,
    }

    return APIResponse(success=True, message="Document processed successfully", data=data)


@router.post("/extract", response_model=APIResponse)
async def extract_from_text(
    payload: DocumentExtractTextRequest, user_id: str = Depends(get_current_user_id)
):
    """
    Extracts structured fields from raw text of receipt or bank statement export.
    """
    extracted = await document_agent._parse_document_text(payload.text, payload.filename or "text")
    duplicate_check = await document_agent.check_duplicate_import(
        user_id=user_id,
        merchant=extracted.get("merchant", ""),
        amount=extracted.get("total_amount", 0.0),
        date_str=extracted.get("transaction_date", ""),
    )

    return APIResponse(
        success=True,
        message="Text extraction completed",
        data={"extracted_data": extracted, "duplicate_detection": duplicate_check},
    )
