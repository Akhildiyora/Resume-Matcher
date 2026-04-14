import json
import re
from functools import lru_cache
from pathlib import Path

import yake

from app.services.nlp_pipeline import nlp

SKILLS_FILE = Path(__file__).resolve().parent.parent / "data" / "skills.json"
KEYWORD_EXTRACTOR = yake.KeywordExtractor(lan="en", n=2, top=20)

SKILL_ALIASES = {
    "js": "javascript",
    "node": "node.js",
    "ml": "machine learning",
    "tf": "tensorflow",
    "aws": "aws",
}

SKILL_CATEGORIES = {
    "frontend": {"react", "angular", "javascript"},
    "backend": {"node.js", "django", "python"},
    "ml": {"tensorflow", "pytorch", "machine learning"},
    "cloud": {"aws", "azure"},
}


@lru_cache()
def load_skills() -> list[str]:
    with SKILLS_FILE.open(encoding="utf-8") as stream:
        return [skill.strip().lower() for skill in json.load(stream)]


def regex_match_skills(text: str) -> list[str]:
    lowercase = text.lower()
    matches = []

    for skill in load_skills():
        pattern = r"\b" + re.escape(skill.lower()) + r"\b"
        if re.search(pattern, lowercase):
            matches.append(skill)

    return matches


def extract_keywords(text: str) -> list[str]:
    try:
        raw = KEYWORD_EXTRACTOR.extract_keywords(text)
        return [kw[0] for kw in raw]
    except Exception:
        return []


def map_keywords_to_skills(keywords: list[str]) -> list[str]:
    matches = []

    for keyword in keywords:
        lower_keyword = keyword.lower()
        for skill in load_skills():
            if skill in lower_keyword:
                matches.append(skill)

    return matches


def extract_entities(doc) -> list[str]:
    allowed = {"ORG", "PRODUCT"}
    return [ent.text.lower() for ent in doc.ents if ent.label_ in allowed]


def extract_skills(text: str, doc) -> list[str]:
    skills = set()

    skills.update(regex_match_skills(text))
    skills.update(map_keywords_to_skills(extract_keywords(text)))

    token_set = {token.lemma_.lower() for token in doc if token.is_alpha}
    for skill in load_skills():
        normalized = normalize_skill(skill)
        if normalized in token_set:
            skills.add(normalized)

    for entity in extract_entities(doc):
        skills.add(normalize_skill(entity))

    return sorted({normalize_skill(skill) for skill in skills})


def normalize_skill(skill: str) -> str:
    key = skill.lower()
    return SKILL_ALIASES.get(key, key)


def categorize_skills(skills: list[str]) -> dict[str, list[str]]:
    categories = {}
    for category, members in SKILL_CATEGORIES.items():
        matched = [skill for skill in skills if skill in members]
        if matched:
            categories[category] = matched
    return categories


def skill_score(resume_skills: list[str], job_skills: list[str]) -> float:
    if not job_skills:
        return 0.0
    matched = set(resume_skills) & set(job_skills)
    return len(matched) / len(job_skills)

    return sorted(skills)
