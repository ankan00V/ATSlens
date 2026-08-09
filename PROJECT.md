# Project: ATSlens - Full-Stack ATS Resume Analyzer & PDF Report Generator

## Architecture
- **Backend**: FastAPI / Python backend with security middleware (rate limiting, payload validation), advanced ATS analysis scoring (sub-scores: Experience, Skills, Education, Impact, tech stack matching), and PDF Export (`/api/export-pdf`).
- **Frontend**: Vite + React SPA (`frontend/src/`) featuring `Hero.tsx`, demo resume presets, sub-score visualizers (progress bars), missing tech stack badges, and PDF summary download button.
- **Testing**: `pytest` + `httpx` for backend integration & security tests; `playwright` for frontend E2E & component tests.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Security Hardening | Security middleware, input validation, rate limiting | M1 | Completed |
| 2 | Advanced ATS Analysis & PDF Export Backend | Backend scoring engines (sub-scores & missing tech stack) and `POST /api/export-pdf` report generator | M2 | Completed |
| 3 | Demo Resume Presets | Selectable presets ("Google Senior Frontend Engineer", "Meta Backend Engineer", "AI Research Intern") pre-filling resume & job description in UI | M3 | User Request |
| 4 | Sub-Score Progress Bars & Badges | Render `Experience`, `Skills`, `Education`, `Impact` progress bars and missing tech stack badges in UI | M3 | User Request |
| 5 | PDF Summary Download Button | Download button in UI triggering `POST /api/export-pdf` and opening/downloading PDF summary | M3 | User Request |
| 6 | Pytest Integration Test Suite | `pytest` + `httpx` test suite for backend security, sub-scores, and PDF export endpoints | M4 | User Request |
| 7 | Playwright E2E Test Suite | `playwright` test suite for preset selection, score display, and PDF export trigger | M4 | User Request |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | M1: Security Hardening | Backend security middleware & validation | none | DONE |
| 2 | M2: Advanced ATS Analysis & PDF Export Backend | Backend analysis engines & PDF export endpoint | M1 | DONE |
| 3 | M3: Frontend UI Presets & MAANG Enhancements | Selectable presets, sub-scores, badges, PDF export button | M2 | IN_PROGRESS |
| 4 | M4: Pytest & Playwright Automated Test Suites | `pytest` integration tests and `playwright` E2E test suite | M3 | PLANNED |

## Interface Contracts
### Frontend ↔ Backend API
- `POST /api/analyze`: Accepts `{ resume_text: string, job_description: string }`. Returns `{ overall_score: number, sub_scores: { experience: number, skills: number, education: number, impact: number }, missing_tech_stack: string[], detailed_feedback: string[] }`.
- `POST /api/export-pdf`: Accepts `{ resume_text: string, job_description: string, analysis_result: object }`. Returns binary PDF file (`application/pdf`).

## Code Layout
- `backend/` — FastAPI application, API routes, security middleware, ATS scoring logic, PDF export logic.
- `frontend/` — React frontend application, `Hero.tsx`, components, UI styling.
- `tests/` or `backend/tests/`, `frontend/e2e/` — Test suites (`pytest` and `playwright`).
