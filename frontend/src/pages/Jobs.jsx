import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import JobCard from "../components/JobCard";
import SkillBadge from "../components/SkillBadge";
import ScoreBar from "../components/ScoreBar";
import api from "../api/api";

const fetchJobs = async () => {
  const response = await api.get("/jobs");
  return response.data.jobs || [];
};

export default function Jobs() {
  const [skillFilter, setSkillFilter] = useState("");
  const [domainFilter, setDomainFilter] = useState("");
  const [experience, setExperience] = useState(3);
  const [sortOption, setSortOption] = useState("match");

  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ["jobs"],
    queryFn: fetchJobs,
  });

  const filteredJobs = useMemo(() => {
    return jobs
      .filter((job) => {
        const skills = job.skills || [];
        const domainMatches = domainFilter ? job.domain === domainFilter : true;
        const skillMatches = skillFilter
          ? skills.some((skill) =>
              skill.toLowerCase().includes(skillFilter.toLowerCase())
            )
          : true;
        const experienceMatch = job.experience
          ? Number(job.experience) <= experience
          : true;
        return domainMatches && skillMatches && experienceMatch;
      })
      .sort((a, b) => {
        if (sortOption === "newest") {
          return new Date(b.created_at) - new Date(a.created_at);
        }
        return (b.score || 0) - (a.score || 0);
      });
  }, [jobs, domainFilter, skillFilter, experience, sortOption]);

  const domains = useMemo(
    () => Array.from(new Set(jobs.map((job) => job.domain).filter(Boolean))),
    [jobs]
  );

  const skillDistribution = useMemo(() => {
    const counts = {};
    filteredJobs.forEach((job) =>
      (job.skills || []).forEach((skill) => {
        counts[skill] = (counts[skill] || 0) + 1;
      })
    );
    return Object.keys(counts).map((skill) => ({
      skill,
      count: counts[skill],
    }));
  }, [filteredJobs]);

  const [selectedJob, setSelectedJob] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [candidateLoading, setCandidateLoading] = useState(false);
  const [candidateError, setCandidateError] = useState("");

  const handleMatch = async (job) => {
    setSelectedJob(job);
    setCandidateLoading(true);
    setCandidateError("");
    try {
      const response = await api.get(`/jobs/${job.id}/candidates`);
      setCandidates(response.data.candidates || []);
    } catch (err) {
      console.error(err);
      setCandidateError("Unable to load candidates");
    } finally {
      setCandidateLoading(false);
    }
  };

  return (
    <section className="rounded-3xl border border-white/10 bg-slate-900/50 p-6 shadow-lg shadow-slate-950/30">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.4em] text-slate-400">Jobs</p>
          <h2 className="text-2xl font-semibold text-white">Job Dashboard</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <input
            placeholder="Filter by skill"
            className="rounded-2xl border bg-slate-800 px-4 py-2 text-sm text-white outline-none"
            value={skillFilter}
            onChange={(event) => setSkillFilter(event.target.value)}
          />
          <select
            className="rounded-2xl border bg-slate-800 px-4 py-2 text-sm text-white outline-none"
            value={domainFilter}
            onChange={(event) => setDomainFilter(event.target.value)}
          >
            <option value="">All domains</option>
            {domains.map((domain) => (
              <option key={domain} value={domain}>
                {domain}
              </option>
            ))}
          </select>
          <div className="flex items-center gap-2">
            <label className="text-xs uppercase tracking-[0.4em] text-slate-400">
              Experience ≤ {experience} yrs
            </label>
            <input
              type="range"
              min="0"
              max="10"
              value={experience}
              onChange={(event) => setExperience(Number(event.target.value))}
            />
          </div>
          <select
            className="rounded-2xl border bg-slate-800 px-4 py-2 text-sm text-white outline-none"
            value={sortOption}
            onChange={(event) => setSortOption(event.target.value)}
          >
            <option value="match">Highest match</option>
            <option value="newest">Newest</option>
          </select>
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-[2fr,1fr]">
        <div className="space-y-4">
          {isLoading ? (
            <p className="text-sm text-slate-400">Loading jobs...</p>
          ) : filteredJobs.length === 0 ? (
            <p className="text-sm text-slate-400">No jobs found</p>
          ) : (
            filteredJobs.map((job) => (
              <JobCard key={job.id} job={job} onMatchClick={handleMatch} />
            ))
          )}
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 shadow-lg">
          <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Skill Distribution</p>
          <div className="mt-2" style={{ minWidth: 0, minHeight: 192 }}>
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} aspect={2}>
              <BarChart data={skillDistribution}>
                <XAxis dataKey="skill" stroke="#94a3b8" />
                <Tooltip />
                <Bar dataKey="count" fill="#34d399" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {filteredJobs.slice(0, 3).map((job) => (
              <SkillBadge key={`inline-${job.id}`} label={job.domain || "general"} />
            ))}
          </div>
        </div>
      </div>
      {selectedJob && (
        <section className="mt-10 rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-lg shadow-slate-950/30">
          <header className="mb-4 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Recruiter View</p>
              <h3 className="text-2xl font-semibold text-white">
                Candidates for {selectedJob.title}
              </h3>
            </div>
            {candidateLoading && (
              <span className="text-sm text-slate-400">Loading candidates...</span>
            )}
          </header>
          {candidateError && <p className="text-sm text-red-400">{candidateError}</p>}
          <div className="space-y-4">
            {candidateLoading ? (
              <p className="text-sm text-slate-400">Fetching candidate insights...</p>
            ) : candidates.length === 0 ? (
              <p className="text-sm text-slate-400">No candidates found yet.</p>
            ) : (
              candidates.map((candidate) => (
                <article
                  key={`candidate-${candidate.resumeId}`}
                  className="rounded-2xl border border-white/5 bg-slate-950/60 p-4 shadow-lg"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-400">Resume #{candidate.resumeId}</p>
                    <span className="text-sm text-emerald-400">
                      {(candidate.score * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="mt-2 text-sm text-slate-400">
                    Experience: {candidate.resume?.experience ?? "N/A"} yrs &middot; Education:{" "}
                    {candidate.resume?.education || "N/A"} &middot; Domain:{" "}
                    {candidate.resume?.domain || "general"}
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {Object.entries(candidate.breakdown || {}).map(([key, value]) => (
                      <ScoreBar key={key} label={key} value={value} />
                    ))}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {candidate.matchedSkills?.map((skill) => (
                      <SkillBadge
                        key={`matched-${candidate.resumeId}-${skill}`}
                        label={skill}
                      />
                    ))}
                    {candidate.missingSkills?.map((skill) => (
                      <SkillBadge
                        key={`missing-${candidate.resumeId}-${skill}`}
                        label={`${skill} (missing)`}
                      />
                    ))}
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      )}
    </section>
  );
}
