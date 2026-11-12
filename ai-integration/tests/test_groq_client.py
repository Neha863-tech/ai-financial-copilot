import pytest
from app.clients.groq_client import groq_client


@pytest.mark.asyncio
async def test_groq_client_chat_completion():
    messages = [{"role": "user", "content": "How much did I spend this month?"}]
    response = await groq_client.chat_completion(messages)

    assert "content" in response
    assert isinstance(response["content"], str)
    assert len(response["content"]) > 0
    assert "usage" in response
    assert "latency_ms" in response["usage"]


@pytest.mark.asyncio
async def test_groq_client_structured_json():
    messages = [
        {"role": "system", "content": "Extract category: Swiggy order"},
        {"role": "user", "content": "Categorize Swiggy"},
    ]
    response = await groq_client.structured_json(messages)

    assert "data" in response
    assert isinstance(response["data"], dict)
    assert "latency_ms" in response
