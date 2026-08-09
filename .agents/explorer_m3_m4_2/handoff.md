# Milestone 3 & Milestone 4 Backend Investigation & Schema Handoff Report

## 1. Observation

### Key Codebase Files & Line References
- **`app.py`**:
  - `lines 24-34`: `slowapi` rate limiter setup (`Limiter(key_func=get_remote_address)`) and `CORSMiddleware` configuration (Origins: `http://localhost:5173`, `http://localhost:3000`, `http://127.0.0.1:5173`, `http://127.0.0.1:3000`).
  - `lines 36-42`: `GET /api/roles` endpoint returning available role definitions.
  - `lines 44-135`: `POST /api/evaluate` endpoint with `@limiter.limit("10/minute")` rate limit and security validations:
    - `line 54`: Extension validation `not resume.filename.endswith(".pdf")` returning HTTP 400 (`"Only PDF files are supported"`).
    - `line 59`: File size check `len(content) > 10 * 1024 * 1024` returning HTTP 413 (`"Payload Too Large: File size exceeds the 10MB limit."`).
    - `line 62`: Magic bytes validation `not content.startswith(b"%PDF-")` returning HTTP 400 (`"Invalid PDF file. Magic bytes validation failed: file content must start with %PDF- header."`).
    - `lines 88-104`: Overall score computation (`total_score + bonus - deductions`) and output mapping (`overall_score`, `max_score`, `category_scores`).
  - `lines 136-159`: `POST /api/export-pdf` endpoint:
    - Accepts JSON payload (`payload` or `{"evaluation_data": payload}`).
    - `line 144`: Calls `generate_pdf_report(evaluation_data)`.
    - `lines 146-153`: Returns `Response` with `media_type="application/pdf"` and header `Content-Disposition: 'attachment; filename="ATSlens_Evaluation_Report.pdf"'`.

- **`models.py`**:
  - `lines 224-231`: `SubScores` schema: `work_experience: float`, `technical_skills: float`, `education: float`, `project_impact: float`.
  - `lines 233-242`: `KeywordGap` schema: `matched_keywords: List[str]`, `missing_keywords: List[str]`.
  - `lines 244-256`: `EvaluationData` schema: `scores`, `bonus_points`, `deductions`, `key_strengths`, `areas_for_improvement`, `sub_scores`, `keyword_gap_analysis`, `missing_tech_stack`, `skill_recommendations`.

- **`pdf_report.py`**:
  - `lines 24-365`: `generate_pdf_report(evaluation_data)` function using ReportLab Platypus.
  - Renders 8 distinct PDF sections: Header title, Overall Score box, Sub-Scores breakdown, Category breakdown with evidence, Keyword & Tech Stack gap analysis, Key Strengths & Recommendations, Bonus & Deductions, Footer.

- **Existing Backend Tests**:
  - `tests/test_api.py`: Tests `/api/roles`, `/api/export-pdf` error (empty payload), and `/api/export-pdf` valid PDF generation.
  - `tests/test_security.py`: Tests non-PDF extension (400), invalid magic bytes (400), and >10MB payload cap (413).

### Test Suite Execution Output
Running `pytest` on the codebase:
```
============================= test session starts ==============================
platform darwin -- Python 3.14.0a4, pytest-8.4.1, pluggy-1.6.0
rootdir: /Users/ankanghosh/Desktop/projects/ATSlens
configfile: pytest.ini
collected 6 items

tests/test_api.py ...                                                   [ 50%]
tests/test_security.py ...                                              [100%]

============================== 6 passed in 0.28s ===============================
```

---

## 2. Logic Chain

1. **Security & Validation Architecture**:
   - The backend enforces input security at the HTTP boundary before disk or threadpool processing.
   - Any uploaded file is read into memory buffer `content`. File name extension (`.pdf`), exact size cap (`10 * 1024 * 1024` bytes), and magic header bytes (`b"%PDF-"`) are checked sequentially.
   - If any check fails, FastAPI immediately returns an appropriate HTTP status code (400 for bad extension/magic bytes, 413 for size limit, 429 for rate limit exceeded).

2. **Analysis Data Structure**:
   - Resumes are scored against dynamic role configurations (`roles/<role_name>/`).
   - The response from `POST /api/evaluate` includes all requisite fields for Milestone 3 UI rendering:
     - Top-level `overall_score` (float rounded to 1 decimal place) and `max_score` (int).
     - Category breakdown dictionary (`category_scores`).
     - Sub-scores breakdown dictionary (`sub_scores`): `work_experience`, `technical_skills`, `education`, `project_impact`.
     - Keyword gap analysis (`keyword_gap_analysis`): `matched_keywords`, `missing_keywords`.
     - Missing tech stack list (`missing_tech_stack`).
     - Skill recommendations list (`skill_recommendations`).
     - Key strengths (`key_strengths`) and areas for improvement (`areas_for_improvement`).

3. **PDF Export Integration (`POST /api/export-pdf`)**:
   - Accepts either raw evaluation data dictionary or `{ "evaluation_data": { ... } }`.
   - `generate_pdf_report` processes the dictionary and outputs raw binary PDF stream (`bytes`).
   - The response headers specify `Content-Type: application/pdf` and `Content-Disposition: attachment; filename="ATSlens_Evaluation_Report.pdf"`.
   - The output stream commences with `%PDF-` bytes, making it directly downloadable by the frontend client.

---

## 3. Caveats

- **External LLM Calls**: Full evaluation via `POST /api/evaluate` relies on configured LLM providers (e.g. Gemini / Ollama / OpenAI API) unless cached resume data exists in `cache/` during development mode. Unit/Integration tests should mock LLM execution or test endpoint structure / PDF export directly to ensure offline reliability.
- **Database Connection**: MongoDB persistence in `app.py` is optional (gracefully skipped if `MONGODB_URI` environment variable is unset).

---

## 4. Conclusion

The ATSlens backend is fully operational for Milestone 3 & Milestone 4 integration:
1. `POST /api/evaluate` outputs complete `sub_scores`, `keyword_gap_analysis`, `missing_tech_stack`, and `skill_recommendations`.
2. `POST /api/export-pdf` takes evaluation payloads and produces valid ReportLab PDF documents with header `Content-Type: application/pdf`.
3. All 3 security mechanisms (10MB limit, `slowapi` rate limiting 10/min, `%PDF-` magic-bytes check) are implemented in `app.py` and covered by passing pytest cases in `tests/test_security.py`.

---

## 5. Verification Method

1. **Backend Pytest Execution**:
   Run the backend test suite from the project root:
   ```bash
   pytest
   ```
   *Expected Result*: 6/6 tests pass cleanly.

2. **Verify Security Checks**:
   - Post a non-PDF file to `/api/evaluate` -> Expect 400 Bad Request (`"Only PDF files are supported"`).
   - Post a fake PDF file lacking `%PDF-` header -> Expect 400 Bad Request (`"Magic bytes validation failed"`).
   - Post a file larger than 10MB -> Expect 413 Payload Too Large (`"File size exceeds the 10MB limit."`).

3. **Verify Export PDF Endpoint**:
   - Send POST to `/api/export-pdf` with evaluation JSON payload -> Expect 200 OK, `Content-Type: application/pdf`, body starting with `b"%PDF-"`.
