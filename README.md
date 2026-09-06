# ATSlens AI

<p align="center"><strong>Enterprise-grade AI-powered resume evaluation and skill gap analysis system.</strong></p>

<p align="center">
  <img alt="Python" src="https://img.shields.io/badge/python-3.11%2B-blue.svg">
  <img alt="FastAPI" src="https://img.shields.io/badge/FastAPI-005571?style=flat&logo=fastapi">
  <img alt="React" src="https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB">
  <img alt="Vite" src="https://img.shields.io/badge/Vite-B73BFE?style=flat&logo=vite&logoColor=FFD62E">
</p>

---

## Overview

ATSlens AI is a modern, high-performance Applicant Tracking System (ATS) that leverages state-of-the-art Large Language Models (Llama 3.1 8B via Nvidia NIM) to evaluate candidate resumes against specific job roles. 

Built with a sleek, MAANG-style frontend using React, Framer Motion, and Tailwind CSS, and a robust FastAPI backend, ATSlens ensures that resume evaluations are fast, fair, explainable, and visually stunning.

## Key Features

- **High-Fidelity PDF Extraction**: Utilizes `PyMuPDF` to accurately extract text from diverse resume formats.
- **AI-Powered Evaluation Engine**: Evaluates candidates against specific job descriptions (e.g., Senior Frontend Engineer, AI Research Intern) with deep, multi-category scoring (Experience, Skills, Education, Impact).
- **Keyword & Skill Gap Analysis**: Automatically detects missing technologies and skills based on the target role.
- **Enterprise-Grade Security**: Includes built-in rate-limiting (`slowapi`), strict PDF magic-bytes validation, payload size restrictions, and CORS protection.
- **Beautiful MAANG-style UI**: Asymmetric, motion-rich frontend with magnetic buttons, liquid glass effects, and dynamic 3D elements.
- **Evaluation PDF Export**: Generate and download comprehensive, beautifully formatted PDF reports of candidate evaluations.

## Architecture

### Backend (Python/FastAPI)
- `app.py`: FastAPI entry point with CORS, rate-limiting, and core endpoints.
- `pdf.py`: PDF text extraction and AI interaction logic.
- `models.py`: Pydantic models for structured AI output validation.
- `score.py`: Handles final score aggregation and JSON construction.
- `pdf_report.py`: Generates the PDF export of the evaluation.

### Frontend (React/Vite)
- `frontend/src/components/Hero.tsx`: Upload interface; calls `/api/roles` and `/api/evaluate`.
- `frontend/src/components/SubScoresBreakdown.tsx`: Visualizes granular scores and missing skills.
- `frontend/src/utils/pdfExport.ts`: Calls `/api/export-pdf`.

## Installation and Setup

### Prerequisites
- Node.js 18+
- Python 3.11+
- NVIDIA NIM API key (or a key for another provider in `providers.json`)

### Backend Setup
1. Clone the repository.
2. Create a virtual environment and install dependencies:
   ```bash
   python -m venv .venv
   source .venv/bin/activate
   pip install -r requirements-dev.txt
   ```
   `requirements.txt` holds only what the deployed app needs; `requirements-dev.txt`
   pulls that in plus the test and formatting tools.
3. Copy `.env.example` to `.env` and add your API keys:
   ```bash
   cp .env.example .env
   ```
4. Run the FastAPI development server:
   ```bash
   python -m uvicorn app:app --reload --host 127.0.0.1 --port 8000
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```

## Deployment

The whole app — static frontend and FastAPI backend — runs as a single Vercel
project at https://atslens.vercel.app. [vercel.json](vercel.json) builds
`frontend/package.json` as a static site and `app.py` as a Python function, then
routes `/api/*` to the function and everything else to the frontend.

The frontend calls the API on its own origin: `VITE_API_URL` is unset, so
`API_URL` falls back to `''` and requests go to `/api/*` on the same host. To run
the backend somewhere else instead, set `VITE_API_URL` to its base URL as a
build-time variable in Vercel and drop the `app.py` entry from `vercel.json` —
CORS is already open in [app.py](app.py).

### Required environment variables

Set these in the Vercel project (Settings -> Environment Variables), not in
`.env` — `.env` is gitignored and never reaches the deployment.

| Variable | Required | Purpose |
| --- | --- | --- |
| `NVIDIA_API_KEY` | yes | Auth for the default `mistralai/mistral-nemotron` model on NVIDIA NIM. Without it every evaluation fails with "requires env var 'NVIDIA_API_KEY', but it is unset". |
| `DEFAULT_MODEL` | no | Overrides `default_model` in `providers.json`. Must name a model that file defines — e.g. `openai/gpt-oss-20b` or `nvidia/nemotron-3-super-120b-a12b`, both measured far slower (see Model selection). |
| `MONGODB_URI` | no | Persists evaluations. Omit and the app runs fine, skipping the write. |
| `DEVELOPMENT_MODE` | no | Forces dev mode on or off. Defaults off when `VERCEL` or `RENDER` is set, on locally. |

### Model selection

Measured on one synthetic backend resume, full pipeline (7 parallel section
extractions plus the evaluator call):

| model | total | score | notes |
| --- | --- | --- | --- |
| `mistralai/mistral-nemotron` | **25-27s** | 87/100 | default; repeatable to within 2s |
| `openai/gpt-oss-20b` | 115s (30-388s) | 89/100 | reasoning model; once exhausted its token budget and returned invalid JSON |
| `nvidia/nemotron-3-super-120b-a12b` | 388s | 86/100 | fastest on a single call, slowest end to end |

Two lessons worth keeping. Single-call latency does not predict pipeline time —
`nemotron-3-super-120b` answered one call in 2.5s and still took 388s over a
whole evaluation. And reasoning models are a poor fit here: they spend most of
their token budget on hidden reasoning, which is both slow and, when the budget
runs out mid-object, a source of invalid JSON. Setting `reasoning_effort: low`
on `gpt-oss-20b` did not help — it ran 1.8x slower and returned 153 bogus
missing keywords with an inflated 97/100.

### Models go end-of-life

`providers.json` names specific models, and providers retire them. Both models
this project originally used (`meta/llama-3.1-8b-instruct` and
`meta/llama-3.3-70b-instruct`) reached end of life on 2026-08-26 and now return
HTTP 410, which surfaces only as "Failed to evaluate the resume. Could not
extract core content" because `_call_llm_for_section` in `pdf.py` catches every
exception and returns `None`. If evaluations start failing with that message
while `/api/roles` still works, check the model first:

```bash
curl -s https://integrate.api.nvidia.com/v1/models \
  -H "Authorization: Bearer $NVIDIA_API_KEY" | python3 -m json.tool | grep '"id"'
```

### Notes for the serverless function

- Vercel caps a function at 250 MB unzipped. Keep `requirements.txt` minimal —
  an oversized set previously made pip silently skip `jsonschema`, which crashed
  every cold start with `ModuleNotFoundError`.
- The filesystem is read-only outside `/tmp`. `DEVELOPMENT_MODE` gates every disk
  write (the `cache/` JSON cache and the per-role CSV export), which is why it
  must stay off in deployment.
- Environment variables only apply to new builds, so redeploy after changing one.

## License

This project is licensed under the MIT License.
