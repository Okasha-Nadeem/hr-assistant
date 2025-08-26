from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from datetime import datetime

class Job(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    description: str
    requirements: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Application(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    job_id: int = Field(foreign_key="job.id")
    applicant_name: Optional[str] = None
    applicant_email: Optional[str] = None
    resume_path: Optional[str] = None
    answers_json: Optional[str] = None  # store answers as JSON string
    ai_evaluation: Optional[str] = None # raw LLM response (score + summary)
    created_at: datetime = Field(default_factory=datetime.utcnow)
