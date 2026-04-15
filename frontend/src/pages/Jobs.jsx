import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
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
  const [selectedJob, setSelectedJob] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [candidateLoading, setCandidateLoading] = useState(false);
  const [candidateError, setCandidateError] = useState("");

  const { data: jobs = [], isLoading } = useQuery({ queryKey: ["jobs"], queryFn: fetchJobs });

  const filteredJobs = useMemo(() => {
    return jobs
      .filter((job) => {
        const skills = job.skills || [];
        const domainMatches = domainFilter ? job.domain === domainFilter : true;
        const skillMatches = skillFilter
          ? skills.some((skill) => skill.toLowerCase().includes(skillFilter.toLowerCase()))
          : true;
        const experienceMatch = job.experience ? Number(job.experience) <= experience : true;
        return domainMatches && skillMatches && experienceMatch;
      })
      .sort((a, b) => {
        if (sortOption === "newest") return new Date(b.created_at) - new Date(a.created_at);
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
    return Object.keys(counts)
      .map((skill) => ({ skill, count: counts[skill] }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [filteredJobs]);

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

  const avgScore =
    filteredJobs.length > 0
      ? Math.round(
          (filteredJobs.reduce((sum, job) => sum + Number(job.score || 0), 0) / filteredJobs.length) * 100
        )
      : 0;

  return (
    <section className="section-shell">
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
        <div className="surface-card p-6">
          <p className="text-sm font-semibold text-muted">Active Roles</p>
          <h3 className="font-headline mt-1 text-3xl font-extrabold">{filteredJobs.length}</h3>
          <p className="mt-4 w-fit rounded-lg bg-[#dde1ff] px-2 py-1 text-xs font-extrabold text-primary">
            +2 this week
          </p>
        </div>
        <div className="surface-card p-6">
          <p className="text-sm font-semibold text-muted">Total Matches</p>
          <h3 className="font-headline mt-1 text-3xl font-extrabold">{filteredJobs.length * 42}</h3>
          <p className="mt-4 text-xs text-muted">AI-curated candidates</p>
        </div>
        <div className="surface-card p-6">
          <p className="text-sm font-semibold text-muted">Avg. Match Score</p>
          <h3 className="font-headline mt-1 text-3xl font-extrabold">{avgScore}%</h3>
          <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-[#dae2fd]">
            <div className="signature-gradient h-full rounded-full" style={{ width: `${avgScore}%` }} />
          </div>
        </div>
        <div className="surface-card p-6">
          <p className="text-sm font-semibold text-muted">Interviews Pending</p>
          <h3 className="font-headline mt-1 text-3xl font-extrabold text-[#952200]">
            {Math.max(filteredJobs.length * 2, 0)}
          </h3>
          <p className="mt-4 text-xs text-muted">Requiring your review</p>
        </div>
      </div>

      <div className="surface-card mb-8 p-4">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <input className="control" placeholder="Filter by skill" value={skillFilter} onChange={(event) => setSkillFilter(event.target.value)} />
          <select className="control" value={domainFilter} onChange={(event) => setDomainFilter(event.target.value)}>
            <option value="">All domains</option>
            {domains.map((domain) => (
              <option key={domain} value={domain}>{domain}</option>
            ))}
          </select>
          <label className="rounded-xl bg-[#f2f3ff] px-4 py-3 text-sm font-bold text-muted">
            Experience up to {experience} yrs
            <input className="mt-2 w-full accent-[#003ec7]" type="range" min="0" max="10" value={experience} onChange={(event) => setExperience(Number(event.target.value))} />
          </label>
          <select className="control" value={sortOption} onChange={(event) => setSortOption(event.target.value)}>
            <option value="match">Highest match</option>
            <option value="newest">Newest</option>
          </select>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr),22rem]">
        <div className="rounded-xl bg-[#f2f3ff] p-1">
          <div className="space-y-4">
            {isLoading ? (
              <p className="surface-card p-6 text-sm text-muted">Loading jobs...</p>
            ) : filteredJobs.length === 0 ? (
              <p className="surface-card p-6 text-sm text-muted">No jobs found</p>
            ) : (
              filteredJobs.map((job) => <JobCard key={job.id} job={job} onMatchClick={handleMatch} />)
            )}
          </div>
        </div>

        <aside className="space-y-6">
          <div className="surface-card p-6">
            <p className="eyebrow">Skill demand</p>
            <h3 className="font-headline mt-2 text-xl font-extrabold">Demand map</h3>
            <div className="mt-4 h-64 min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={skillDistribution} layout="vertical" margin={{ left: 4 }}>
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="skill" width={92} tick={{ fill: "#434656", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: "rgba(0,62,199,0.08)" }} contentStyle={{ borderRadius: 12, border: "1px solid #c3c5d9" }} />
                  <Bar dataKey="count" fill="#003ec7" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="surface-card p-6">
            <p className="eyebrow">Recruiter View</p>
            <h3 className="font-headline mt-2 text-xl font-extrabold">
              {selectedJob ? selectedJob.title : "Select a role"}
            </h3>
            {candidateLoading && <p className="mt-3 text-sm text-muted">Loading candidates...</p>}
            {candidateError && <p className="mt-3 text-sm text-[#952200]">{candidateError}</p>}
            <div className="mt-4 grid gap-3">
              {!selectedJob ? (
                <p className="text-sm text-muted">Open a job card to inspect ranked candidates.</p>
              ) : candidates.length === 0 && !candidateLoading ? (
                <p className="text-sm text-muted">No candidates found yet.</p>
              ) : (
                candidates.map((candidate) => (
                  <article key={`candidate-${candidate.resumeId}`} className="rounded-xl bg-[#f2f3ff] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-extrabold">Resume #{candidate.resumeId}</p>
                      <span className="font-extrabold text-primary">{(candidate.score * 100).toFixed(0)}%</span>
                    </div>
                    <p className="mt-2 text-xs leading-5 text-muted">
                      Experience: {candidate.resume?.experience ?? "N/A"} yrs | Education: {candidate.resume?.education || "N/A"} | Domain: {candidate.resume?.domain || "general"}
                    </p>
                    <div className="mt-3 grid gap-2">
                      {Object.entries(candidate.breakdown || {}).map(([key, value]) => (
                        <ScoreBar key={key} label={key} value={value} />
                      ))}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {candidate.matchedSkills?.map((skill) => <SkillBadge key={`matched-${candidate.resumeId}-${skill}`} label={skill} />)}
                      {candidate.missingSkills?.map((skill) => <SkillBadge key={`missing-${candidate.resumeId}-${skill}`} label={`${skill} (missing)`} />)}
                    </div>
                  </article>
                ))
              )}
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
