from fastapi import FastAPI
from .database import init_db
from .routers import jobs, applications
from .config import UPLOAD_DIR
import os
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="HR Portal API")
app.include_router(jobs.router)
app.include_router(applications.router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    init_db()
