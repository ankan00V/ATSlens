import os
from typing import Dict, Any
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Request, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse, FileResponse, Response
import tempfile
import traceback

from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from roles import list_available_roles, load_role
from score import main as evaluate_resume
try:
    from services.pdf_report import generate_pdf_report
except ImportError:
    from pdf_report import generate_pdf_report


app = FastAPI(title="ATSlens")

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

@app.get("/api/roles")
@limiter.limit("30/minute")
async def get_roles(request: Request):
    try:
        roles = list_available_roles()
        return {"roles": roles}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/evaluate")
@limiter.limit("10/minute")
async def evaluate(
    request: Request,
    resume: UploadFile = File(...),
    role: str = Form(...),
    yoe: str = Form(None),
    jd: str = Form(None)
):
    try:
        if not resume.filename.endswith(".pdf"):
            raise HTTPException(status_code=400, detail="Only PDF files are supported")

        content = await resume.read()

        if len(content) > 10 * 1024 * 1024:
            raise HTTPException(status_code=413, detail="Payload Too Large: File size exceeds the 10MB limit.")

        if not content.startswith(b"%PDF-"):
            raise HTTPException(status_code=400, detail="Invalid PDF file. Magic bytes validation failed: file content must start with %PDF- header.")

        # Save uploaded PDF to a temporary file
        fd, temp_path = tempfile.mkstemp(suffix=".pdf")
        with os.fdopen(fd, "wb") as f:
            f.write(content)

        # Load role configuration
        try:
            role_config = load_role(role)
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))

        # Run evaluation
        from starlette.concurrency import run_in_threadpool
        evaluation_result = await run_in_threadpool(evaluate_resume, temp_path, role_config, yoe, jd)

        # Clean up temp file
        os.remove(temp_path)

        if not evaluation_result:
            raise HTTPException(status_code=500, detail="Failed to evaluate the resume. Could not extract core content.")

        result_dict = evaluation_result.model_dump()

        # Compute overall score from category scores + bonus - deductions
        total_score = 0
        max_score = 0
        category_scores = {}
        for key, cat in result_dict.get("scores", {}).items():
            capped = min(cat["score"], cat["max"])
            total_score += capped
            max_score += cat["max"]
            category_scores[key] = {**cat, "score": capped}

        bonus = result_dict.get("bonus_points", {}).get("total", 0)
        deductions = result_dict.get("deductions", {}).get("total", 0)
        total_score = total_score + bonus - deductions

        result_dict["overall_score"] = round(total_score, 1)
        result_dict["max_score"] = max_score
        result_dict["category_scores"] = category_scores

        # Save to database
        db_uri = os.environ.get("MONGODB_URI")
        if db_uri:
            try:
                from pymongo import MongoClient
                client = MongoClient(db_uri)
                db = client["ats"]
                collection = db["evaluations"]
                
                # Insert the result along with some metadata
                db_record = {
                    "filename": resume.filename,
                    "target_role": role,
                    "evaluation": result_dict
                }
                collection.insert_one(db_record)
            except Exception as db_err:
                print("Failed to save to database:", db_err)

        # Remove MongoDB ObjectId before serializing to JSON
        result_dict.pop("_id", None)

        return JSONResponse(content=result_dict)

    except HTTPException:
        raise
    except Exception as e:
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/export-pdf")
@limiter.limit("20/minute")
async def export_pdf(request: Request, payload: Dict[str, Any] = Body(...)):
    try:
        if not payload:
            raise HTTPException(status_code=400, detail="Evaluation data payload is required")

        evaluation_data = payload.get("evaluation_data") if "evaluation_data" in payload and isinstance(payload["evaluation_data"], dict) else payload

        pdf_bytes = generate_pdf_report(evaluation_data)

        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Type": "application/pdf",
                "Content-Disposition": 'attachment; filename="ATSlens_Evaluation_Report.pdf"'
            }
        )
    except HTTPException:
        raise
    except Exception as e:
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

# Mount the frontend directory at the root (must be after API routes)

frontend_path = os.path.join("frontend", "dist")
if os.path.exists(frontend_path):
    app.mount("/", StaticFiles(directory=frontend_path, html=True), name="frontend")
else:
    print(f"Warning: Frontend build directory '{frontend_path}' not found. Please run 'npm run build' in the frontend folder.")

