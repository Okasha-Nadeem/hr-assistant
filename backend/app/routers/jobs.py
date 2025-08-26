from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from ..database import get_session
from ..models import Job, Application
from ..schemas import JobCreate
from typing import List

router = APIRouter(prefix="/jobs", tags=["jobs"])

@router.post("/", response_model=dict)
def create_job(payload: JobCreate, session: Session = Depends(get_session)):
    job = Job(title=payload.title, description=payload.description, requirements=payload.requirements)
    session.add(job); session.commit(); session.refresh(job)
    return {"success": True, "job": job}

@router.get("/", response_model=List[Job])
def list_jobs(session: Session = Depends(get_session)):
    jobs = session.exec(select(Job)).all()
    return jobs

@router.get("/{job_id}/questions", response_model=dict)
def job_questions(job_id: int, session: Session = Depends(get_session)):
    job = session.get(Job, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    from ..ai_utils import generate_questions
    qs = generate_questions(job.requirements)
    return {"questions": qs}

@router.delete("/{job_id}", response_model=dict)
def delete_job(job_id: int, session: Session = Depends(get_session)):
    job = session.get(Job, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Delete all applications for this job first
    applications = session.exec(select(Application).where(Application.job_id == job_id)).all()
    for application in applications:
        session.delete(application)
    
    # Delete the job
    session.delete(job)
    session.commit()
    
    return {"success": True, "message": f"Job '{job.title}' and {len(applications)} applications deleted successfully"}
