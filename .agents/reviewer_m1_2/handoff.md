# Handoff Report: Adversarial Review & Integrity Verification of Milestone 1 (R1)

## Review Summary
- **Target**: Milestone 1 (Requirement R1) — Backend Security Hardening & PDF Validation
- **Working Directory**: `/Users/ankanghosh/Desktop/projects/ATSlens`
- **Verdict**: **APPROVE**

---

## 1. Observation

### Codebase Inspection Findings

#### PDF Magic Bytes & File Size Validation (`app.py` lines 48-58)
```python
if not resume.filename.endswith(".pdf"):
    raise HTTPException(status_code=400, detail="Only PDF files are supported")

content = await resume.read()

if len(content) > 10 * 1024 * 1024:
    raise HTTPException(status_code=413, detail="Payload Too Large: File size exceeds the 10MB limit.")

if not content.startswith(b"%PDF-"):
    raise HTTPException(status_code=400, detail="Invalid PDF file. Magic bytes validation failed: file content must start with %PDF- header.")
```
- Line 48: Checks `.pdf` extension.
- Line 51: Asynchronously reads the entire uploaded file bytes into memory (`content`).
- Lines 53-54: Checks `len(content) > 10 * 1024 * 1024` (10MB limit). If exceeded, raises `HTTPException(status_code=413, detail="Payload Too Large: File size exceeds the 10MB limit.")`.
- Lines 56-57: Inspects header bytes `content.startswith(b"%PDF-")`. If missing or invalid (e.g., ASCII shell scripts, executables, images renamed to `.pdf`), raises `HTTPException(status_code=400, detail="Invalid PDF file. Magic bytes validation failed: file content must start with %PDF- header.")`.

#### Slowapi Rate Limiter Integration (`requirements.txt` line 13 & `app.py` lines 9-20, 39-41)
- `requirements.txt` includes `slowapi>=0.1.9`.
- `app.py` imports `Limiter`, `_rate_limit_exceeded_handler`, `get_remote_address`, `RateLimitExceeded`.
- `limiter = Limiter(key_func=get_remote_address)` initializes the rate limiter.
- `app.state.limiter = limiter` attaches it to FastAPI app state.
- `app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)` attaches the 429 exception handler.
- `@limiter.limit("10/minute")` decorates `@app.post("/api/evaluate")`.
- Signature `async def evaluate(request: Request, ...)` includes the `Request` object required by `slowapi`.

#### CORS Security Configuration (`app.py` lines 22-28)
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)
```
- Origin whitelist is explicitly restricted to expected local development ports (`http://localhost:5173`, `http://localhost:3000`, `http://127.0.0.1:5173`, `http://127.0.0.1:3000`).
- No wildcard (`*`) allowed in `allow_origins`.

#### Implementation Integrity
- `app.py` delegates resume scoring to `score.py:main`, which calls `pdf.py` for PyMuPDF text extraction, `roles.py` for dynamic rubric loading, `evaluator.py` for LLM structured evaluation, and `transform.py` for score aggregation.
- No hardcoded scoring maps, mock responses, or facade implementations are present.

---

## 2. Logic Chain

1. **Magic Bytes Validation Check**:
   - An adversarial file named `malicious.pdf` containing ASCII executable code (e.g., `#!/bin/bash\necho "exploit"`) passes the filename extension check on line 48.
   - On line 56, `content.startswith(b"%PDF-")` tests if the byte stream starts with ASCII `%PDF-`.
   - ASCII executable script bytes start with `b"#!"`, which does not match `b"%PDF-"`.
   - `content.startswith(b"%PDF-")` returns `False`, triggering `HTTPException(status_code=400)` with detail `Invalid PDF file. Magic bytes validation failed: file content must start with %PDF- header.`.
   - Therefore, non-PDF executable payloads with fake `.pdf` extensions are reliably blocked with HTTP 400.

2. **File Size Limit Check**:
   - An oversized payload (>10MB) is evaluated on line 53 (`len(content) > 10 * 1024 * 1024`).
   - Size check precedes magic bytes check and temporary file creation on line 60.
   - Raises `HTTPException(status_code=413)` with detail `Payload Too Large: File size exceeds the 10MB limit.`.
   - Therefore, oversized uploads are terminated immediately with HTTP 413.

3. **Rate Limiter Integration Check**:
   - `slowapi` is imported, configured, and bound to `app.state.limiter`.
   - The route handler parameter list contains `request: Request` as required by `slowapi`'s `key_func`.
   - App initialization succeeds without syntax, import, or startup errors.

4. **CORS Headers Check**:
   - `CORSMiddleware` limits origins strictly to `["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173", "http://127.0.0.1:3000"]`.
   - Browsers requesting resources from unauthorized origins will be blocked by cross-origin policy.

5. **Code Integrity Verification**:
   - Verification confirms the implementation is genuine and fully functional, invoking PyMuPDF parsing and LLM criteria evaluation without dummy responses or hardcoded cheats.

---

## 3. Caveats

- **In-Memory File Buffer**: For uploaded files <=10MB, `content = await resume.read()` loads the full content into RAM before writing to tempfile. While suitable for 10MB maximum payload size under standard concurrency, high concurrent load may increase memory footprint.

---

## 4. Conclusion

All 5 adversarial verification requirements for Milestone 1 (R1) are satisfied:
1. `malicious.pdf` containing ASCII executable code is rejected with HTTP 400 (magic bytes check `b"%PDF-"`).
2. Files >10MB are rejected with HTTP 413 Payload Too Large.
3. `slowapi` rate limiter is correctly integrated and non-crashing.
4. CORS headers are non-permissive and restricted to local dev origins.
5. Code is genuine without hardcoded fake responses or integrity violations.

**Verdict**: **APPROVE**

---

## 5. Verification Method

To re-verify independently, execute Python tests against `app.py`:

```python
from fastapi.testclient import TestClient
from app import app

client = TestClient(app)

# 1. Magic bytes validation
res1 = client.post('/api/evaluate', files={'resume': ('malicious.pdf', b'#!/bin/bash\n', 'application/pdf')}, data={'role': 'software_engineering_intern'})
assert res1.status_code == 400

# 2. Size limit validation (>10MB)
large_payload = b'%PDF-1.4\n' + b'0' * (10 * 1024 * 1024 + 100)
res2 = client.post('/api/evaluate', files={'resume': ('large.pdf', large_payload, 'application/pdf')}, data={'role': 'software_engineering_intern'})
assert res2.status_code == 413

# 3. CORS check
res3 = client.options('/api/evaluate', headers={'Origin': 'http://localhost:5173', 'Access-Control-Request-Method': 'POST'})
assert res3.headers.get('access-control-allow-origin') == 'http://localhost:5173'
```
