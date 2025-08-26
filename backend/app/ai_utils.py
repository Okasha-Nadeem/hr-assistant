import os, re
from .config import NVIDIA_API_KEY, UPLOAD_DIR
from langchain_nvidia_ai_endpoints import ChatNVIDIA
from langchain.schema import SystemMessage, HumanMessage
import PyPDF2, docx

# initialize (ensure env var exists)
os.environ["NVIDIA_API_KEY"] = NVIDIA_API_KEY or ""
llm = ChatNVIDIA(model="meta/llama-4-scout-17b-16e-instruct")

def read_pdf(file_path):
    text = ""
    try:
        with open(file_path, "rb") as f:
            reader = PyPDF2.PdfReader(f)
            for page in reader.pages:
                text += page.extract_text() or ""
    except Exception as e:
        text = f"[Error reading PDF: {e}]"
    return text.strip()

def read_docx(file_path):
    text = ""
    try:
        doc = docx.Document(file_path)
        for para in doc.paragraphs:
            text += para.text + "\n"
    except Exception as e:
        text = f"[Error reading DOCX: {e}]"
    return text.strip()

def read_resume_text(file_path):
    if file_path.lower().endswith(".pdf"):
        return read_pdf(file_path)
    elif file_path.lower().endswith(".docx"):
        return read_docx(file_path)
    else:
        return ""

def generate_questions(hr_requirements: str):
    system_prompt = f"""
    You are an HR assistant. You must create exactly 3 interview questions based on the following job requirements.
    Only output the 3 questions in the format:
    Question 1: ...
    Question 2: ...
    Question 3: ...

    Requirements:
    {hr_requirements}
    """
    response = llm.invoke([SystemMessage(content=system_prompt)])
    text = response.content.strip()
    # find question lines
    questions = re.findall(r"Question\s*\d+:\s*.*", text)
    # fallback: split lines if needed
    if not questions:
        lines = text.splitlines()
        questions = [l for l in lines if l.strip().lower().startswith("question")]
    return questions[:3]

def evaluate_candidate(hr_requirements: str, resume_text: str, answers: list):
    qa_text = "\n".join([f"{a.get('question')}\nAnswer: {a.get('answer')}" for a in answers])
    system_prompt = f"""
    You are a **STRICT HR evaluator**. 
    Your task is to decide the candidate’s suitability for the role using their resume and answers.

    SCORING RULES (strict, non-negotiable):
    - If answers are nonsense, random words, or irrelevant → Score = 0.
    - If answers are vague or generic with no real knowledge → Score between 1 and 20.
    - If answers partially match requirements but lack depth → Score between 21 and 50.
    - If answers are mostly correct and resume matches some requirements → Score between 51 and 75.
    - If answers are detailed, correct, and resume strongly matches → Score between 76 and 90.
    - If answers are exceptional AND resume perfectly matches → Score between 91 and 100.

    OUTPUT FORMAT (MUST follow strictly):
    Final Score: [number between 0-100]
    HR Summary: [one single concise sentence about suitability]
    
    Job Requirements:
    {hr_requirements}
    """
    user_prompt = f"""
    Candidate Resume:
    {resume_text}

    Candidate Answers:
    {qa_text}
    """
    response = llm.invoke([
        SystemMessage(content=system_prompt),
        HumanMessage(content=user_prompt)
    ])
    return response.content.strip()
