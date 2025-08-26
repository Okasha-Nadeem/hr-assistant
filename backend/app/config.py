from dotenv import load_dotenv
import os
load_dotenv()

NVIDIA_API_KEY = os.getenv("NVIDIA_API_KEY")
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./hrportal.db")
UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "uploads")
