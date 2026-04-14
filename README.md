# Resume Matcher (AI-Based Job Matching Platform)

Monorepo scaffold for the Resume Matcher SaaS (React frontend, Express backend, FastAPI NLP, PostgreSQL + FAISS ready).

## Repository layout

```
resume-matcher/
|
|-- backend/        # Express API + file uploads
|-- frontend/       # React + Tailwind UI
|-- nlp-service/    # FastAPI NLP endpoints (embeddings, parsing, skill extraction)
`-- README.md
```

Each workspace can be developed and deployed independently while sharing the same repo.

---

## Backend (`backend/`)

1. `cd backend`
2. Install dependencies (already done): `npm install`

**Environment variables**

```env
PORT=5000
DB_USER=postgres
DB_PASSWORD=password
DB_NAME=resume_matcher
DB_HOST=localhost
DB_PORT=5432
NLP_API_URL=http://localhost:8000
```

If you prefer Supabase for PostgreSQL hosting, replace `DB_HOST`, `DB_NAME`, `DB_USER`, and `DB_PASSWORD` with the values from your Supabase project (found under Settings → Database → Connection pooling) and ensure SSL is enabled. Alternatively, you can export the Supabase connection string yourself:

```env
DATABASE_URL=postgresql://<user>:<password>@<host>:<port>/<database>?sslmode=require
```

Then update `src/config/db.js` to parse `DATABASE_URL` (e.g., with `new URL(process.env.DATABASE_URL)`), or keep `DB_*` fields and copy values from Supabase into them.

3. Start the API:
   - Development: `npm run dev`
   - Production: `npm start`

Routes live under `/api/resume` and call `nlp-service` via `src/services/nlpService.js`. Uploaded resumes are saved to `uploads/` and `/api/match` proxies to the new FastAPI `/match` endpoint (via `src/services/matchService.js`) to compute hybrid scores/rankings.

---

## Phase 2 — Resume Upload & Parsing

- `POST /api/resume/upload` stores the uploaded PDF/DOCX via `multer`, then streams the file to `http://localhost:8000/parse-resume` using `form-data` so all extraction happens inside the NLP service.
- The FastAPI endpoint saves the incoming upload to a temporary file, extracts raw text via `pdfplumber`/`python-docx`, cleans it (normalize whitespace/newlines), and runs the spaCy pipeline once to return filtered lemma tokens plus preprocessed text alongside the raw/cleaned strings.
- The backend now inserts the parsed payload into the `resumes` table (`raw_text`, `cleaned_text`, `processed_text`, `tokens`, `skills`) so downstream NLP/embeddings can reuse it without reprocessing.

## Phase 4 — Skill Extraction

- FastAPI now enriches the spaCy-preprocessed text with regex rule-matching, YAKE keyword mapping, token overlaps, optional NER (ORG/PRODUCT), and alias normalization (`node`→`node.js`, `js`→`javascript`, `ml`→`machine learning`) so the returned `skills` array captures canonical names of tools, technologies, and products.  
- The `/parse-resume` response returns `skills`, `skill_categories` (frontend/backend/ml/cloud), plus the other text/token fields, and the backend persists `skills JSONB NOT NULL DEFAULT '[]'::jsonb` so downstream systems can reuse that normalized data without reprocessing.  
- We already install `yake` via `pip install -r requirements.txt`; consider calling `skill_score(resume_skills, job_skills)` once job requirements exist for ranking, since the current response now exposes normalized skills ready for scoring.  
- Add a `matches` table (`resume_id INT`, `job_id INT`, `score FLOAT`) so `/api/match` can persist the returned ranked list; the endpoint now proxies to FastAPI `/match` and stores each result before replying.

## Phase 5 — Embeddings

- Two embedding options are provided so you can start with TF-IDF (explainable baseline) and then upgrade to BERT for semantic matching.  
- `app/services/tfidf_model.py` exposes `fit_tfidf(corpus)` and `transform_text(text)` built on `TfidfVectorizer(max_features=5000)`. Fit once on resumes+jobs before transforming new documents.  
- `app/services/embedding_model.py` loads `SentenceTransformer("all-MiniLM-L6-v2")` at startup and exposes `get_embedding(text)`, `get_embeddings(texts)`, and `normalize(vec)` (via NumPy) so you never reload the BERT model per request.  
- The `/parse-resume` endpoint now returns normalized embeddings (`embedding FLOAT[]`) so you can store them in Postgres or ship them into FAISS for fast similarity search; keep the normalized vector in the DB for re-ranking.  
- The `all-MiniLM-L6-v2` model returns 384-dimensional vectors—keep that in mind when creating SQL array columns or FAISS indexes.  
- Reinstall dependencies (`pip install -r requirements.txt`) after updating the service, then call the vectorizers inside the resume/job ingestion pipeline to persist vectors in PostgreSQL/FAISS for similarity scoring.

## Phase 6 — Similarity Matching

- `app/services/matching.py` now exposes semantic, skill-match, keyword-overlap, and hybrid final scores based on cosine similarity + rule-based overlap; use `rank_jobs` to score job candidates (each job needs embeddings + metadata).  
- The final score weights are 0.6 semantic + 0.3 skills + 0.1 keywords, giving you both explainability (per-component breakdown) and a ranked job list that can be stored or returned to the frontend.  
- Testing: TF-IDF should produce a low similarity on “Python developer with ML experience” vs “Machine learning engineer required”, while BERT should be high because of semantic understanding; always normalize embeddings, keep spaCy preprocessing, and batch scoring when comparing many job vectors.  
- Advanced tip: expand the system with multi-vector resumes (skills/experience/full text) and weighted combinations once this base hybrid is stable—good embeddings + hybrid scoring is the core of high-quality matching systems.

## Phase 7 — FAISS Integration

- `app/services/faiss_index.py` manages a FAISS `IndexFlatL2` over 384-dimensional MiniLM vectors, normalizes inputs, tracks job IDs manually, and exposes `add`/`search` helpers so you can build a fast retrieval layer.  
- Workflow: encode resumes/jobs → normalize → add job vectors with their IDs → query the index with normalized resume embeddings → get top-K distances and map back to job IDs, then feed those candidate IDs into the Phase 6 ranking layer for hybrid scoring.  
- Store job embeddings separately (e.g., Postgres `embedding FLOAT[]` or a vector table) so new indexes can be rebuilt without reprocessing raw resumes; FAISS holds only vectors, so maintain your own job metadata mapping.
- Phase 7 now also exposes `/index-jobs` and `/search` REST endpoints. Index jobs (embedding array + job IDs) from Node via `backend/src/services/faissService.js`, query with `resumeEmbedding`, then pass the resulting top-K job IDs through the Phase 6 ranking pipeline for explainable scores.  
- Keep the upstream flow: FAISS for fast retrieval → Phase 6 hybrid scoring for final ranking. Normalize every vector before adding/searching using NumPy/FAISS helpers so cosine metrics align with L2 search.  
- Normalizing vectors and persisting the index are critical. Use `faiss_index.save()` and `load()` (exposed via `/save-index` and `/load-index`) plus `pickle`-backed ID mapping so you can restart the service without rebuilding the index. Don’t rebuild every request, keep saved files, and always combine FAISS filtering with Phase 6 scoring.

## Phase 8 — Backend APIs

- **Resume APIs** (`/api/v1/upload-resume`, `/api/v1/resume/:id`): Versioned endpoints handle upload → Python `/parse-resume`, persist processed text/skills/embedding/tokens, and return the saved `resumeId`.  
- **Job APIs** (`/api/v1/jobs`): `POST` runs NLP (`/process-text`), stores the processed description/skills/tokens/embedding, indexes it in FAISS, and respects Joi validation; `GET` supports pagination/filters (location, experience, salary).  
- **Match API** (`/api/v1/match/:resumeId`): Fetches the resume, calls FAISS `/search`, retrieves candidates, hits FastAPI `/match`, persists scores/matched-missing skills in `matches`, and returns explainable rankings (Phase 10 weights 0.5/0.25/0.15/0.1, ML/Recent boosts, threshold filtering).  
- **Ranking response** now includes `matched_skills`/`missing_skills` and a breakdown object — the frontend can render why each job ranks where it does, with optional threshold/tuning per role (e.g., ML jobs get extra semantic weight).  
- **Skill rank improvements**: Phase 10 now uses a weighted skill score that boosts priority skills (Python, Machine Learning), plus experience/education match components, so the `matches` breakdown is fully explainable per job.  
- **FAISS endpoints** (`/index-jobs`, `/search`, `/save-index`, `/load-index`): Keep the vector index synced while combining fast retrieval with Phase 6 hybrid scoring.  
- **Observability & scaling**: Winston/morgan log every request/error, error middleware centralizes responses, and future waves can add Redis caching (matches + frequent queries) or Bull queues for background parsing so the system scales closer to LinkedIn/ATS architectures.
- **Phase 9 databases**: `backend/db/schema.sql` contains the postgreSQL DDL for resumes/jobs/matches with improved fields (timestamps, processed_text, tokens, JSON metadata, embeddings) so you can create tables with `psql -f backend/db/schema.sql`. This schema keeps raw vs processed text separate, stores normalized skills categories, and provides embedding arrays for FAISS/phase 6 scoring.
  - **Jobs schema** includes `location`, `salary_range`, `experience_required`, plus processed text/skills/embedding to support filtering and analytics.  
  - **Matches schema** now stores semantic & skill scores, matched/missing skill lists, and cascades deletes so you keep explainability dashboards up to date.  
  - Added indexes on IDs, JSONB skills columns, and matches foreign keys for fast matchmaking queries.

### Resumes schema (production-ready)

```sql
CREATE TABLE resumes (
  id SERIAL PRIMARY KEY,
  name TEXT,
  file_path TEXT,
  raw_text TEXT,
  cleaned_text TEXT,
  processed_text TEXT,
  tokens JSONB,
  skills JSONB NOT NULL DEFAULT '[]'::jsonb,
  skill_categories JSONB,
  embedding FLOAT8[],
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
```

Use similar structure for `jobs` and `matches` (see `schema.sql`) to guarantee the database can support analytics, FAISS ingestion, and resume/job matching features.

### Helpful SQL snippets

```
SELECT j.*, m.score
FROM matches m
JOIN jobs j ON j.id = m.job_id
WHERE m.resume_id = $1
ORDER BY m.score DESC
LIMIT 10;

SELECT *
FROM jobs
WHERE skills ? 'python';
```

### Embedding Strategy (Phase 9)

- **Storage split**: POSGRES hosts metadata (resumes, jobs, matches, users, applications) while FAISS stores embeddings for fast similarity; keep embeddings in Postgres only for backup/debugging but rely on FAISS for search.  
- **Sync workflow**: when a job is created, insert into Postgres, then immediately send its embedding to `/index-jobs`; when a resume uploads, save to Postgres and reuse the embedding via FAISS `/search` before hitting Phase 6 ranking.  
- **Sample insert**:

```sql
INSERT INTO resumes (name, processed_text, skills)
VALUES (
  'Akhil',
  'python developer machine learning',
  '["python", "machine learning"]'
);
```
- **Advanced tables**: add `users` (id,email,password,role), `applications` (resume_id,job_id,status), and audit log tables for uploads/matches/API calls so the SaaS can add tenancy, workflow tracking, and compliance.  
- **Final benefits**: separate search+storage+logic across FAISS/Postgres/Node, normalized JSONB skills, rich indexes, and explainable matches—an architecture close to production-grade ATS/LinkedIn systems.
- **Experience + domain extraction (Phase 11)**: regex-based extractors capture years of experience, education level, and area/domain so resumes/jobs store `(experience, education, domain)` metadata. The Phase 11 scoring adds a domain bonus, producing explainable results with matched/missing skills plus the 0.55/0.25/0.1 signature weights for semantic/skills/experience.

- **Advanced ideas:** consider multi-vector representations (skills/experience/full text) and weighted combinations (e.g., 0.5 full + 0.3 skills + 0.2 experience) for richer matching, and explore higher-quality models such as `all-mpnet-base-v2` or `BAAI/bge-base-en` once the base flows are stable.

## Frontend (`frontend/`)

1. `cd frontend`
2. Install dependencies (already done): `npm install`
3. Tailwind is configured via `@tailwindcss/vite` (see `vite.config.js`), with the entry CSS importing the directives:
   ```css
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   ```

4. Environment variables:
   ```
   VITE_API_URL=http://localhost:5000/api
   ```

5. Start the dev server: `npm run dev`

Upload, Jobs, and Match pages live under `src/pages`. The UI now includes toast feedback (`react-hot-toast`), charts for skill distributions (`recharts`), filters, sorting, dashboards, loaders, empty states, and insights panels so recruiters get clear, visual explanations instead of raw JSON.

## Phase 14 — Security & Optimization

- Multer validation enforces PDF/DOCX uploads, 5 MB max, renames files, and stores them under `uploads/resumes`.  
- Express-rate-limit guards `/api` globally (100 requests/15 minutes) with stricter limits for resume uploads (10 per window) and matches (50 per window).  
- Additional hardening ideas: move the upload dir outside the web root, scan uploads with ClamAV, and use strict content-type checking/logging for suspicious activity.

---

## Python NLP Service (`nlp-service/`)

1. `cd nlp-service`
2. Create a virtual environment: `python -m venv venv`
3. Activate it:
   - macOS/Linux: `source venv/bin/activate`
   - Windows: `venv\\Scripts\\activate`
4. Install dependencies: `pip install -r requirements.txt`
5. Download the spaCy model: `python -m spacy download en_core_web_sm`
6. Install multipart support: `pip install python-multipart`
6. Run the service: `uvicorn app.main:app --reload --port 8000`

The FastAPI app exposes `/parse-resume` for PDF/DOCX extraction plus `/` for a health check; it returns raw/cleaned text today and can grow into embeddings/skill metadata later.

---

## Next steps

- Parse uploaded resumes server-side, store metadata in PostgreSQL, and push embeddings into FAISS.
- Build more frontend data fetching hooks with React Query and richer visualizations.
- Expand the NLP service with extraction, preprocessing, embeddings, and scoring pipelines.
