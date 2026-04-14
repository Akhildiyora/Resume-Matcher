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

Routes live under `/api/resume` and call `nlp-service` via `src/services/nlpService.js`. Uploaded resumes are saved to `uploads/`.

---

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

Upload, Jobs, and Dashboard pages live under `src/pages` and share global state through React Query (`QueryClientProvider` in `App.jsx`).

---

## Python NLP Service (`nlp-service/`)

1. `cd nlp-service`
2. Create a virtual environment: `python -m venv venv`
3. Activate it:
   - macOS/Linux: `source venv/bin/activate`
   - Windows: `venv\\Scripts\\activate`
4. Install dependencies: `pip install -r requirements.txt`
5. Download the spaCy model: `python -m spacy download en_core_web_sm`
6. Run the service: `uvicorn app.main:app --reload --port 8000`

The FastAPI app exposes `/process` for cleaned text, extracted skills, and placeholder embeddings, ready to be expanded with PDF/DOCX parsing and vectorization.

---

## Next steps

- Parse uploaded resumes server-side, store metadata in PostgreSQL, and push embeddings into FAISS.
- Build more frontend data fetching hooks with React Query and richer visualizations.
- Expand the NLP service with extraction, preprocessing, embeddings, and scoring pipelines.
