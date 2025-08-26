from fastapi import APIRouter, UploadFile, File, Form, Depends
from sqlmodel import Session
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
