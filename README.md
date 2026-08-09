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
- `frontend/src/components/Hero.tsx`: Main upload interface with high-end animations.
- `frontend/src/components/SubScoresBreakdown.tsx`: Visualizes granular scores and missing skills.
- `frontend/src/lib/api.ts`: Centralized API interaction logic.

## Installation and Setup

### Prerequisites
- Node.js 18+
- Python 3.11+
- Nvidia NIM API Key (or alternative LLM provider API key)

### Backend Setup
1. Clone the repository.
2. Create a virtual environment and install dependencies:
   ```bash
   python -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   ```
3. Copy `.env.example` to `.env` and add your API keys:
   ```bash
   cp .env.example .env
   ```
4. Run the FastAPI development server:
   ```bash
   python -m uvicorn app:app --reload --host 0.0.0.1 --port 8000
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

## License

This project is licensed under the MIT License.
