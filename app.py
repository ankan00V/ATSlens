import os
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse, FileResponse
import tempfile
import traceback

from roles import list_available_roles, load_role
from score import main as evaluate_resume

app = FastAPI(title="ATSlens")

@app.get("/api/roles")
def get_roles():
    try:
        roles = list_available_roles()
        return {"roles": roles}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/evaluate")
async def evaluate(
    resume: UploadFile = File(...),
    role: str = Form(...),
    yoe: str = Form(None),
    jd: str = Form(None)
):
    try:
        if not resume.filename.endswith(".pdf"):
            raise HTTPException(status_code=400, detail="Only PDF files are supported")

        # Save uploaded PDF to a temporary file
        fd, temp_path = tempfile.mkstemp(suffix=".pdf")
        with os.fdopen(fd, "wb") as f:
            content = await resume.read()
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

    except Exception as e:
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

# Mount the frontend directory at the root (must be after API routes)
frontend_path = os.path.join("frontend", "dist")
if os.path.exists(frontend_path):
    app.mount("/", StaticFiles(directory=frontend_path, html=True), name="frontend")
else:
    print(f"Warning: Frontend build directory '{frontend_path}' not found. Please run 'npm run build' in the frontend folder.")

