import { useState } from "react";
import api from "../api/api";
import ScoreBar from "../components/ScoreBar";
import SkillBadge from "../components/SkillBadge";

export default function Match() {
  const [resumeId, setResumeId] = useState("");
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recommendResumeId, setRecommendResumeId] = useState("");
  const [recommendations, setRecommendations] = useState([]);
  const [recommendLoading, setRecommendLoading] = useState(false);
  const [recommendError, setRecommendError] = useState("");
  const [compareLeft, setCompareLeft] = useState("");
  const [compareRight, setCompareRight] = useState("");
  const [similarity, setSimilarity] = useState(null);
  const [compareLoading, setCompareLoading] = useState(false);
  const [compareError, setCompareError] = useState("");

  const handleLookup = async () => {
    if (!resumeId) return;
    setLoading(true);
    try {
      const response = await api.get(`/match/${resumeId}`);
      setMatches(response.data.matches || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRecommend = async () => {
    if (!recommendResumeId) return;
    setRecommendLoading(true);
    setRecommendError("");
    try {
      const response = await api.post("/recommendations", { resumeId: recommendResumeId, limit: 5 });
      setRecommendations(response.data.recommendations || []);
    } catch (err) {
      console.error(err);
      setRecommendations([]);
      setRecommendError("Unable to load recommendations");
    } finally {
      setRecommendLoading(false);
    }
  };

  const handleCompare = async () => {
    if (!compareLeft || !compareRight) return;
    setCompareLoading(true);
    setCompareError("");
    try {
      const response = await api.post("/resume/compare", {
        resumeAId: compareLeft,
        resumeBId: compareRight,
      });
      setSimilarity(response.data.similarity);
    } catch (err) {
      console.error(err);
      setSimilarity(null);
      setCompareError("Comparison failed");
    } finally {
      setCompareLoading(false);
    }
  };

  const topScore = matches[0]?.score ? Math.round(matches[0].score * 100) : 88;

  return (
    <section className="section-shell">
      <div className="mb-8 grid grid-cols-1 items-center gap-8 md:grid-cols-12">
        <div className="md:col-span-8">
          <div className="mb-4 flex flex-wrap items-center gap-4">
            <span className="rounded-full bg-[#0052ff] px-3 py-1 text-xs font-extrabold text-white">
              MATCH RANK #1
            </span>
            <span className="text-sm font-bold uppercase text-muted">Analysis Report</span>
          </div>
          <h3 className="font-headline text-4xl font-extrabold tracking-tight">
            Resume Match Analysis
          </h3>
          <p className="mt-2 text-lg text-muted">
            Comparing candidate signals against role requirements and curator recommendations.
          </p>
        </div>
        <div className="flex justify-start md:col-span-4 md:justify-end">
          <div className="score-ring text-4xl" style={{ "--score": topScore, "--ring-size": "12rem" }}>
            <span>{topScore}%</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="surface-card p-8 md:col-span-2">
          <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="eyebrow">Match Lookup</p>
              <h3 className="font-headline mt-2 text-xl font-extrabold">Resume to role fit</h3>
            </div>
            <div className="flex w-full flex-col gap-3 sm:flex-row lg:max-w-lg">
              <input className="control" placeholder="Enter resume ID" value={resumeId} onChange={(event) => setResumeId(event.target.value)} />
              <button className="primary-button shrink-0" onClick={handleLookup} disabled={loading} type="button">
                {loading ? "Fetching..." : "Load Matches"}
              </button>
            </div>
          </div>

          <div className="grid gap-4">
            {matches.length === 0 && !loading ? (
              <div className="rounded-xl bg-[#f2f3ff] p-6 text-sm text-muted">
                Enter a resume ID to load ranked job matches.
              </div>
            ) : (
              matches.map((match) => (
                <article key={match.job_id} className="rounded-xl bg-[#f2f3ff] p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h4 className="font-headline text-lg font-extrabold">Job #{match.job_id}</h4>
                    <span className="rounded-full bg-[#003ec7] px-3 py-1 text-sm font-extrabold text-white">
                      {(match.score * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {match.matched_skills?.map((skill) => <SkillBadge key={`matched-${skill}`} label={skill} />)}
                    {match.missing_skills?.map((skill) => <SkillBadge key={`missing-${skill}`} label={`${skill} (missing)`} />)}
                  </div>
                  <div className="mt-5 grid gap-3 md:grid-cols-2">
                    {Object.entries(match.breakdown || {}).map(([key, value]) => (
                      <ScoreBar key={key} label={key} value={value} />
                    ))}
                  </div>
                </article>
              ))
            )}
          </div>
        </div>

        <div className="surface-card p-8">
          <h3 className="font-headline mb-6 flex items-center gap-2 text-xl font-extrabold">
            <span className="material-symbols-outlined text-[#952200]">lightbulb</span>
            AI Guidance
          </h3>
          <div className="space-y-6">
            <div>
              <p className="mb-3 text-xs font-extrabold uppercase text-muted">Missing Keywords</p>
              <div className="flex flex-wrap gap-2">
                {["Motion Design", "B2B SaaS", "Portfolio"].map((keyword) => (
                  <SkillBadge key={keyword} label={`${keyword} (missing)`} />
                ))}
              </div>
            </div>
            <div className="rounded-xl border-l-4 border-[#003ec7] bg-white p-4 shadow-sm">
              <p className="mb-1 text-sm font-extrabold">Recommendation</p>
              <p className="text-xs leading-6 text-muted">
                Ask for portfolio examples and role-specific project outcomes before final shortlist.
              </p>
            </div>
            <button className="secondary-button w-full" type="button">
              <span className="material-symbols-outlined">mail</span>
              Request Portfolio
            </button>
          </div>
        </div>

        <div className="surface-card p-8 md:col-span-3">
          <div className="mb-8 flex items-center justify-between gap-4">
            <div>
              <h3 className="font-headline text-xl font-extrabold">The Curator's Logic</h3>
              <p className="text-sm text-muted">How the match score is calculated</p>
            </div>
            <button className="text-sm font-extrabold text-primary" type="button">View Raw Data</button>
          </div>
          <div className="grid gap-6 md:grid-cols-4">
            {[
              ["Experience Alignment", 95, "Senior role history maps strongly to JD requirements."],
              ["Skill Density", 82, "Technical competencies overlap with the requested role profile."],
              ["Semantic Fit", 90, "Resume language aligns with role outcomes and responsibilities."],
              ["Education Level", 100, "Education signal exceeds the role baseline."],
            ].map(([label, value, copy]) => (
              <div key={label}>
                <ScoreBar label={label} value={Number(value) / 100} />
                <p className="mt-2 text-[11px] leading-5 text-muted">{copy}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="surface-card p-8 md:col-span-2">
          <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="eyebrow">Recommendations</p>
              <h3 className="font-headline mt-2 text-xl font-extrabold">Next best roles</h3>
            </div>
            <div className="flex w-full flex-col gap-3 sm:flex-row md:max-w-lg">
              <input className="control" placeholder="Resume ID for recommendations" value={recommendResumeId} onChange={(event) => setRecommendResumeId(event.target.value)} />
              <button className="primary-button shrink-0" onClick={handleRecommend} disabled={recommendLoading} type="button">
                {recommendLoading ? "Loading..." : "Recommend"}
              </button>
            </div>
          </div>
          {recommendError && <p className="mb-3 text-sm text-[#952200]">{recommendError}</p>}
          <div className="grid gap-4 md:grid-cols-2">
            {recommendations.length === 0 && !recommendLoading ? (
              <p className="text-sm text-muted">No recommendations yet</p>
            ) : (
              recommendations.map((rec) => {
                const job = rec.job || {};
                return (
                  <article key={`rec-${rec.job_id}`} className="rounded-xl bg-[#f2f3ff] p-5">
                    <div className="flex items-start justify-between gap-3">
                      <h4 className="font-headline text-lg font-extrabold">{job.title || `Job ${rec.job_id}`}</h4>
                      <span className="font-extrabold text-primary">{(rec.score * 100).toFixed(0)}%</span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-muted">{job.description || "No description"}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {(job.skills || []).map((skill) => <SkillBadge key={`rec-${rec.job_id}-${skill}`} label={skill} />)}
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </div>

        <div className="surface-card signature-gradient p-8 text-white">
          <h3 className="font-headline text-2xl font-extrabold">Ready for the next phase?</h3>
          <p className="mt-3 text-sm leading-6 text-[#dfe3ff]">
            Compare two resume profiles to understand overlap before shortlisting.
          </p>
          <div className="mt-6 grid gap-3">
            <input className="control bg-white/95" placeholder="Resume A ID" value={compareLeft} onChange={(event) => setCompareLeft(event.target.value)} />
            <input className="control bg-white/95" placeholder="Resume B ID" value={compareRight} onChange={(event) => setCompareRight(event.target.value)} />
            <button className="secondary-button bg-white text-primary" onClick={handleCompare} disabled={compareLoading} type="button">
              {compareLoading ? "Comparing..." : "Compare Resumes"}
            </button>
          </div>
          {compareError && <p className="mt-3 text-sm text-white">{compareError}</p>}
          {similarity !== null && (
            <div className="mt-5 rounded-xl bg-white/15 p-4">
              <p className="text-sm font-bold text-[#dfe3ff]">Similarity score</p>
              <p className="font-headline mt-1 text-4xl font-extrabold">{(similarity * 100).toFixed(1)}%</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
