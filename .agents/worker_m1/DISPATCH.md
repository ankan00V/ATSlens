## 2026-08-08T17:55:18Z

Implement Milestone 1 - Backend Security Hardening & PDF Validation (Requirement R1).

Detailed Instructions:
1. Update /Users/ankanghosh/Desktop/projects/ATSlens/requirements.txt:
   - Add `slowapi>=0.1.9`
2. Update /Users/ankanghosh/Desktop/projects/ATSlens/app.py:
   - Configure slowapi rate limiter:
     `from slowapi import Limiter, _rate_limit_exceeded_handler`
     `from slowapi.util import get_remote_address`
     `from slowapi.errors import RateLimitExceeded`
     `limiter = Limiter(key_func=get_remote_address)`
     `app.state.limiter = limiter`
     `app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)`
   - Decorate `/api/evaluate` with `@limiter.limit("10/minute")` (or appropriate rate limit) passing Request parameter.
   - Configure strict CORS headers and origin restrictions:
     `from fastapi.middleware.cors import CORSMiddleware`
     `app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173", "http://127.0.0.1:3000"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])`
   - Implement strict magic bytes file validation:
     Read the first 5 bytes of `resume.file` (or `content = await resume.read()`). Verify `content.startswith(b"%PDF-")`.
     If header does not start with `b"%PDF-"`, raise `HTTPException(status_code=400, detail="Invalid PDF file. Magic bytes validation failed: file content must start with %PDF- header.")`.
   - Enforce 10MB payload size limit:
     Check `len(content) > 10 * 1024 * 1024`.
     If exceeded, raise `HTTPException(status_code=413, detail="Payload Too Large: File size exceeds the 10MB limit.")`.
3. Verify changes:
   - Check python file syntax (`python3 -m py_compile app.py`).
   - Write handoff report to /Users/ankanghosh/Desktop/projects/ATSlens/.agents/worker_m1/handoff.md detailing all changes, verification output, and send a completion message to parent.
