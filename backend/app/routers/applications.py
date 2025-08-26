from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from sqlmodel import Session, select
from typing import List
import os, json, shutil
from ..database import get_session
from ..models import Application, Job
from ..config import UPLOAD_DIR
from ..ai_utils import read_resume_text, evaluate_candidate

router = APIRouter(prefix="/applications", tags=["applications"])

# ensure upload dir exists
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/apply")
async def apply(
    job_id: int = Form(...),
    applicant_name: str = Form(None),
    applicant_email: str = Form(None),
    answers_json: str = Form(...),  # frontend sends JSON string of list [{question,answer}]
    resume: UploadFile = File(...)
    , session: Session = Depends(get_session)
):
    job = session.get(Job, job_id)
    if not job:
        return {"error": "job not found"}

    # save uploaded file
    filename = f"{int(os.times()[4]*1000)}_{resume.filename}"
    dest = os.path.join(UPLOAD_DIR, filename)
    with open(dest, "wb") as f:
        shutil.copyfileobj(resume.file, f)

    # extract resume text
    resume_text = read_resume_text(dest)

    answers = json.loads(answers_json)

    # run evaluation
    ai_eval = evaluate_candidate(job.requirements, resume_text, answers)

    application = Application(
        job_id=job_id,
        applicant_name=applicant_name,
        applicant_email=applicant_email,
        resume_path=dest,
        answers_json=answers_json,
        ai_evaluation=ai_eval
    )
    session.add(application)
    session.commit(); session.refresh(application)
    return {"success": True, "application_id": application.id, "ai_evaluation": ai_eval}

@router.get("/job/{job_id}", response_model=List[dict])
async def get_applications_for_job(job_id: int, session: Session = Depends(get_session)):
    """Get all applications for a specific job with their AI evaluations"""
    job = session.get(Job, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    applications = session.exec(select(Application).where(Application.job_id == job_id)).all()
    
    result = []
    for app in applications:
        # Parse the AI evaluation to extract score if available
        ai_score = None
        ai_summary = app.ai_evaluation
        
        # Try to extract score from AI evaluation (assuming format like "Score: X/10")
        if app.ai_evaluation:
            import re
            score_match = re.search(r'Score:\s*(\d+(?:\.\d+)?)', app.ai_evaluation, re.IGNORECASE)
            if score_match:
                ai_score = float(score_match.group(1))
        
        result.append({
            "id": app.id,
            "applicant_name": app.applicant_name,
            "applicant_email": app.applicant_email,
            "resume_path": app.resume_path,
            "answers_json": app.answers_json,
            "ai_evaluation": app.ai_evaluation,
            "ai_score": ai_score,
            "created_at": app.created_at.isoformat() if app.created_at else None
        })
    
    # Sort by AI score (highest first) if available, otherwise by creation date
    result.sort(key=lambda x: (x["ai_score"] is None, -x["ai_score"] if x["ai_score"] is not None else 0))
    
    return result
