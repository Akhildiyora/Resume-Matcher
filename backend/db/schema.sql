-- Resumes table
CREATE TABLE IF NOT EXISTS resumes (
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
  experience INT,
  education TEXT,
  domain TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Jobs table
CREATE TABLE IF NOT EXISTS jobs (
  id SERIAL PRIMARY KEY,
  title TEXT,
  description TEXT,
  location TEXT,
  salary_range TEXT,
  experience_required TEXT,
  skills JSONB,
  tokens JSONB,
  embedding FLOAT8[],
  experience INT,
  education TEXT,
  domain TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Matches table
CREATE TABLE IF NOT EXISTS matches (
  id SERIAL PRIMARY KEY,
  resume_id INT REFERENCES resumes(id) ON DELETE CASCADE,
  job_id INT REFERENCES jobs(id) ON DELETE CASCADE,
  score FLOAT,
  semantic_score FLOAT,
  skill_score FLOAT,
  matched_skills JSONB,
  missing_skills JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_resumes_id ON resumes(id);
CREATE INDEX IF NOT EXISTS idx_jobs_id ON jobs(id);
CREATE INDEX IF NOT EXISTS idx_jobs_skills ON jobs USING GIN (skills);
CREATE INDEX IF NOT EXISTS idx_resumes_skills ON resumes USING GIN (skills);
CREATE INDEX IF NOT EXISTS idx_matches_resume ON matches(resume_id);
CREATE INDEX IF NOT EXISTS idx_matches_job ON matches(job_id);

CREATE TABLE IF NOT EXISTS user_activity (
  id SERIAL PRIMARY KEY,
  user_id INT,
  resume_id INT,
  job_id INT,
  action TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_activity_user ON user_activity(user_id);
