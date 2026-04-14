import pdfplumber
import fitz  # PyMuPDF
import docx
import re


def extract_text_from_pdf(file_path: str) -> str:
    text = []

    try:
        with pdfplumber.open(file_path) as pdf:
            for page in pdf.pages:
                chunk = page.extract_text()
                if chunk:
                    text.append(chunk)
    except Exception:
        pass

    if not "".join(text).strip():
        doc = fitz.open(file_path)
        for page in doc:
            chunk = page.get_text()
            if chunk:
                text.append(chunk)

    return "\n".join(text).strip()


def extract_text_from_docx(file_path: str) -> str:
    document = docx.Document(file_path)
    return "\n".join([para.text for para in document.paragraphs if para.text]).strip()


def clean_text(text: str) -> str:
    normalized = re.sub(r"\n+", "\n", text)
    normalized = re.sub(r"\s+", " ", normalized)
    return normalized.strip()


def extract_text(file_path: str, file_type: str) -> str:
    if file_type == "pdf":
        return extract_text_from_pdf(file_path)
    if file_type == "docx":
        return extract_text_from_docx(file_path)
    return ""


def extract_experience(text: str) -> int:
    patterns = [
        r"(\d+)\+?\s*years",
        r"(\d+)\s*yrs",
        r"(\d+)\s*year",
    ]
    for pattern in patterns:
        match = re.search(pattern, text.lower())
        if match:
            return int(match.group(1))
    return 0


def extract_max_experience(text: str) -> int:
    matches = re.findall(r"(\d+)\+?\s*years", text.lower())
    return max((int(m) for m in matches), default=0)


DEGREES = {
    "bachelor": ["bachelor", "b.tech", "bsc", "be"],
    "master": ["master", "m.tech", "msc", "me"],
    "phd": ["phd", "doctorate"],
}


DOMAIN_KEYWORDS = {
    "web_dev": ["react", "node", "javascript"],
    "data_science": ["machine learning", "pandas", "numpy"],
    "devops": ["docker", "kubernetes", "aws"],
}


def extract_education(text: str) -> str:
    normalized = text.lower()
    for level, keywords in DEGREES.items():
        for word in keywords:
            if word in normalized:
                return level
    return "unknown"


def classify_domain(skills: list[str]) -> str:
    skill_set = set(skill.lower() for skill in skills or [])
    domain_scores = {domain: 0 for domain in DOMAIN_KEYWORDS}
    for domain, keywords in DOMAIN_KEYWORDS.items():
        domain_scores[domain] = len(skill_set & set(keywords))
    return max(domain_scores, key=domain_scores.get)
