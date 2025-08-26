from pydantic import BaseModel
from typing import List, Optional

class JobCreate(BaseModel):
    title: str
    description: str
    requirements: str

class ApplicationCreate(BaseModel):
    job_id: int
    applicant_name: Optional[str]
    applicant_email: Optional[str]
    answers: List[dict]  # [{question, answer}, ...]
