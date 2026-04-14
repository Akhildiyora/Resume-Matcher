from sklearn.metrics.pairwise import cosine_similarity


def semantic_score(resume_vec, job_vec):
    if resume_vec is None or job_vec is None:
        return 0.0
    return float(cosine_similarity([resume_vec], [job_vec])[0][0])


IMPORTANT_SKILLS = {"python", "machine learning"}


def skill_match_score(resume_skills, job_skills):
    if not job_skills:
        return 0.0
    resume_set = set(resume_skills or [])
    job_set = set(job_skills or [])
    matched = resume_set & job_set
    return len(matched) / len(job_set)


def keyword_overlap(resume_tokens, job_tokens):
    job_tokens = job_tokens or []
    if not job_tokens:
        return 0.0
    overlap = set(resume_tokens or []) & set(job_tokens)
    return len(overlap) / (len(job_tokens) + 1)


def skill_analysis(resume_skills, job_skills):
    resume_skills = set(resume_skills or [])
    job_skills = set(job_skills or [])
    matched = list(resume_skills & job_skills)
    missing = list(job_skills - resume_skills)
    return matched, missing


def experience_score(resume_exp, job_required_exp):
    if job_required_exp is None:
        return 1.0
    if resume_exp is None:
        return 0.0
    try:
        resume_val = float(resume_exp)
        job_val = float(job_required_exp)
    except (TypeError, ValueError):
        return 0.0
    if resume_val >= job_val:
        return 1.0
    return resume_val / job_val


def education_score(resume_edu, job_edu):
    if not job_edu:
        return 1.0
    if not resume_edu:
        return 0.0
    if job_edu.lower() in resume_edu.lower():
        return 1.0
    return 0.5


def domain_bonus(resume_domain, job_domain):
    return 0.1 if resume_domain and job_domain and resume_domain == job_domain else 0.0


def final_score(resume, job):
    sem = semantic_score(resume.get("embedding"), job.get("embedding"))
    skill = skill_match_score(resume.get("skills"), job.get("skills"))
    exp = experience_score(resume.get("experience"), job.get("experience"))
    domain = domain_bonus(resume.get("domain"), job.get("domain"))
    score = (
        0.55 * sem
        + 0.25 * skill
        + 0.1 * exp
        + 0.1 * domain
    )
    skill_matched, skill_missing = skill_analysis(resume.get("skills", []), job.get("skills", []))
    return {
        "job_id": job.get("id"),
        "score": round(score, 4),
        "breakdown": {
            "semantic": round(sem, 4),
            "skills": round(skill, 4),
            "experience": round(exp, 4),
            "domain": round(domain, 4),
        },
        "matched_skills": skill_matched,
        "missing_skills": skill_missing,
    }


def rank_jobs(resume, jobs, threshold=0.6):
    scored = []
    for job in jobs:
        result = final_score(resume, job)
        if result["score"] >= threshold:
            scored.append(result)
    return sorted(scored, key=lambda x: x["score"], reverse=True)
