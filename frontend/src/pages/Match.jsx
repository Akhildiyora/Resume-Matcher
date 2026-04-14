import { useState } from "react";
import api from "../api/api";
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
      const response = await api.post("/recommendations", {
        resumeId: recommendResumeId,
        limit: 5,
      });
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

  return (
    <section className="rounded-3xl border border-white/10 bg-slate-950/60 p-6 shadow-2xl shadow-slate-900/30">
      <header className="mb-4">
        <p className="text-sm uppercase tracking-[0.4em] text-slate-400">Match</p>
        <h2 className="text-2xl font-semibold text-white">Match Results</h2>
      </header>

      <div className="flex flex-wrap gap-2">
        <input
          className="rounded-2xl border bg-slate-900 px-4 py-2 text-sm text-white outline-none"
          placeholder="Enter resume ID"
          value={resumeId}
          onChange={(event) => setResumeId(event.target.value)}
        />
        <button
          className="rounded-2xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow"
          onClick={handleLookup}
          disabled={loading}
        >
          {loading ? "Fetching..." : "Load Matches"}
        </button>
      </div>

      <div className="mt-6 grid gap-4">
        {matches.map((match) => (
          <div
            key={match.job_id}
            className="rounded-2xl border border-white/10 bg-slate-900/70 p-4"
          >
            <div className="flex items-center justify-between">
              <p className="text-white">Job #{match.job_id}</p>
              <span className="text-emerald-400">{(match.score * 100).toFixed(1)}%</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {match.matched_skills?.map((skill) => (
                <SkillBadge key={`matched-${skill}`} label={skill} />
              ))}
              {match.missing_skills?.map((skill) => (
                <SkillBadge key={`missing-${skill}`} label={`${skill} (missing)`} />
              ))}
            </div>
            <div className="mt-3 grid gap-2 text-xs text-slate-400 md:grid-cols-2">
              {Object.entries(match.breakdown || {}).map(([key, value]) => (
                <div key={key} className="capitalize">
                  {key}: {(value * 100).toFixed(0)}%
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <section className="mt-10 rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-2xl shadow-slate-900/40">
        <header className="mb-4">
          <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Recommendations</p>
          <h2 className="text-xl font-semibold text-white">Job Recommendations</h2>
        </header>

        <div className="flex flex-col gap-3 md:flex-row">
          <input
            className="flex-1 rounded-2xl border bg-slate-900 px-4 py-2 text-sm text-white outline-none"
            placeholder="Resume ID for recommendations"
            value={recommendResumeId}
            onChange={(event) => setRecommendResumeId(event.target.value)}
          />
          <button
            className="rounded-2xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow"
            onClick={handleRecommend}
            disabled={recommendLoading}
          >
            {recommendLoading ? "Loading..." : "Recommend Jobs"}
          </button>
        </div>

        {recommendError && <p className="mt-2 text-sm text-red-400">{recommendError}</p>}

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {recommendations.length === 0 && !recommendLoading ? (
            <p className="text-sm text-slate-400">No recommendations yet</p>
          ) : (
            recommendations.map((rec) => {
              const job = rec.job || {};
              return (
                <article
                  key={`rec-${rec.job_id}`}
                  className="rounded-2xl border border-white/5 bg-slate-950/60 p-4"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">
                      {job.title || `Job ${rec.job_id}`}
                    </h3>
                    <span className="text-sm text-emerald-400">
                      {(rec.score * 100).toFixed(0)}%
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-400">
                    {job.description || "No description"}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(job.skills || []).map((skill) => (
                      <SkillBadge key={`rec-${rec.job_id}-${skill}`} label={skill} />
                    ))}
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-400">
                    {Object.entries(rec.breakdown || {}).map(([key, value]) => (
                      <div key={key} className="capitalize">
                        {key}: {(value * 100).toFixed(0)}%
                      </div>
                    ))}
                  </div>
                </article>
              );
            })
          )}
        </div>
      </section>

      <section className="mt-10 rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-2xl shadow-slate-900/40">
        <header className="mb-4">
          <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Insight</p>
          <h2 className="text-xl font-semibold text-white">Resume Comparison</h2>
        </header>

        <div className="flex flex-col gap-3 md:flex-row">
          <input
            className="flex-1 rounded-2xl border bg-slate-900 px-4 py-2 text-sm text-white outline-none"
            placeholder="Resume A ID"
            value={compareLeft}
            onChange={(event) => setCompareLeft(event.target.value)}
          />
          <input
            className="flex-1 rounded-2xl border bg-slate-900 px-4 py-2 text-sm text-white outline-none"
            placeholder="Resume B ID"
            value={compareRight}
            onChange={(event) => setCompareRight(event.target.value)}
          />
          <button
            className="rounded-2xl bg-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow"
            onClick={handleCompare}
            disabled={compareLoading}
          >
            {compareLoading ? "Comparing..." : "Compare"}
          </button>
        </div>

        {compareError && <p className="mt-2 text-sm text-red-400">{compareError}</p>}
        {similarity !== null && (
          <p className="mt-4 text-lg font-semibold text-emerald-400">
            Similarity: {(similarity * 100).toFixed(1)}%
          </p>
        )}
      </section>
    </section>
  );
}
