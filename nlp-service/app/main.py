from fastapi import FastAPI, UploadFile, File, HTTPException
from pathlib import Path
import shutil
import uuid

from app.services.parser import extract_text, extract_max_experience, extract_education, classify_domain
from app.services.nlp_pipeline import full_preprocess, nlp
from app.services.skill_extractor import extract_skills, categorize_skills
from app.services.embedding_model import get_embedding, normalize
from app.services.matching import rank_jobs
from app.services.faiss_service import FaissService

app = FastAPI(title="Resume Matcher NLP Service")

UPLOAD_DIR = Path("temp")
UPLOAD_DIR.mkdir(exist_ok=True)

faiss_index = FaissService(dim=384)
faiss_index.load()


@app.get("/")
def root():
    return {"message": "NLP Service Running"}


@app.post("/parse-resume")
async def parse_resume(file: UploadFile = File(...)):
    suffix = Path(file.filename).suffix.lower().lstrip(".")
    if suffix not in {"pdf", "docx"}:
        raise HTTPException(status_code=400, detail="Unsupported file type")

    destination = UPLOAD_DIR / f"{uuid.uuid4().hex}-{file.filename}"
    try:
        with destination.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        raw_text = extract_text(str(destination), suffix)
        if not raw_text:
            raise HTTPException(status_code=422, detail="Unable to extract text from resume")

        processed = full_preprocess(raw_text)
        doc = nlp(processed["cleaned_text"])
        skills = extract_skills(processed["cleaned_text"], doc)
        categories = categorize_skills(skills)
        embedding = normalize(get_embedding(processed["processed_text"]))
        experience = extract_max_experience(processed["cleaned_text"])
        education = extract_education(processed["cleaned_text"])
        domain = classify_domain(skills)
        return {
            "filename": file.filename,
            "raw_text": raw_text,
            "cleaned_text": processed["cleaned_text"],
            "processed_text": processed["processed_text"],
            "tokens": processed["tokens"],
            "token_count": processed["token_count"],
            "skills": skills,
            "skill_categories": categories,
            "embedding": embedding.tolist(),
            "experience": experience,
            "education": education,
            "domain": domain,
        }
    finally:
        if destination.exists():
            destination.unlink()


@app.post("/match")
def match_jobs(data: dict):
    resume = data.get("resume")
    jobs = data.get("jobs", [])
    ranked = rank_jobs(resume, jobs)
    return {"matches": ranked}


@app.post("/process-text")
def process_text(data: dict):
    text = data.get("text", "")
    processed = full_preprocess(text)
    doc = nlp(processed["cleaned_text"])
    skills = extract_skills(processed["cleaned_text"], doc)
    categories = categorize_skills(skills)
    embedding = normalize(get_embedding(processed["processed_text"]))
    experience = extract_max_experience(processed["cleaned_text"])
    education = extract_education(processed["cleaned_text"])
    domain = classify_domain(skills)
    return {
        "processed_text": processed["processed_text"],
        "cleaned_text": processed["cleaned_text"],
        "tokens": processed["tokens"],
        "skills": skills,
        "skill_categories": categories,
        "embedding": embedding.tolist(),
        "experience": experience,
        "education": education,
        "domain": domain,
    }


@app.post("/index-jobs")
def index_jobs(data: dict):
    embeddings = data.get("embeddings", [])
    ids = data.get("ids", [])
    faiss_index.add(embeddings, ids)
    return {"message": "Indexed successfully"}


@app.post("/save-index")
def save_index():
    faiss_index.save()
    return {"message": "Index saved"}


@app.post("/load-index")
def load_index():
    faiss_index.load()
    return {"message": "Index loaded"}


@app.post("/search")
def search_jobs(data: dict):
    embedding = data.get("embedding")
    try:
        k = int(data.get("k", 5))
    except (TypeError, ValueError):
        k = 5
    k = max(1, min(k, 50))
    results = faiss_index.search(embedding, k=k)
    return {"results": results}
