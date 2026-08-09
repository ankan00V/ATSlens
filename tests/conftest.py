import os
import sys
import pytest
from fastapi.testclient import TestClient
from httpx import AsyncClient, ASGITransport

# Safe patch for os.getcwd in sandboxed environments
try:
    os.getcwd()
except Exception:
    os.getcwd = lambda: os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

from app import app

@pytest.fixture
def client():
    """Synchronous FastAPI TestClient fixture."""
    return TestClient(app)

@pytest.fixture
async def async_client():
    """Asynchronous httpx AsyncClient fixture for FastAPI app testing."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as ac:
        yield ac

@pytest.fixture
def sample_pdf_content() -> bytes:
    """Mock sample valid PDF header bytes generator (%PDF-1.4)."""
    return (
        b"%PDF-1.4\n"
        b"1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n"
        b"2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n"
        b"3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >>\nendobj\n"
        b"4 0 obj\n<< /Length 50 >>\nstream\nBT /F1 12 Tf 72 712 Td (John Doe Sample Resume) Tj ET\nendstream\nendobj\n"
        b"xref\n0 5\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000214 00000 n \n"
        b"trailer\n<< /Size 5 /Root 1 0 R >>\nstartxref\n320\n%%EOF"
    )

@pytest.fixture
def non_pdf_file_content() -> bytes:
    """Mock non-PDF file content with Windows executable magic bytes (MZ...)."""
    return b"MZ\x90\x00\x03\x00\x00\x00\x04\x00\x00\x00\xff\xff\x00\x00 This is an executable file, not a PDF."
