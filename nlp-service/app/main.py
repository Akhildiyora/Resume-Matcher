from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="Resume Matcher NLP Service")


class TextRequest(BaseModel):
    text: str


@app.get("/")
def root():
    return {"message": "NLP Service Running"}


@app.post("/process")
def process_text(data: TextRequest):
    cleaned = data.text.lower().strip()
    # Placeholder for real NLP pipeline: extraction, embeddings, scoring.
    return {
        "cleaned_text": cleaned,
        "skills": [],
        "embedding": [],
    }
