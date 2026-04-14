const sampleJobs = [
  {
    id: "job-frontend",
    title: "Frontend Engineer",
    company: "PulseGrid",
    score: 92,
    skills: ["React", "Tailwind CSS", "TypeScript"],
  },
  {
    id: "job-data",
    title: "AI Data Engineer",
    company: "SignalOpt",
    score: 86,
    skills: ["Python", "PostgreSQL", "FAISS"],
  },
  {
    id: "job-product",
    title: "Product Manager",
    company: "Northwind Labs",
    score: 78,
    skills: ["Roadmapping", "Communication", "Analytics"],
  },
];

export default function Jobs() {
  return (
    <section className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-lg shadow-slate-900/50">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.4em] text-slate-400">
            Job Listings
          </p>
          <h2 className="text-2xl font-semibold text-white">Phase 3</h2>
        </div>
        <span className="rounded-full bg-slate-800 px-4 py-1 text-xs uppercase tracking-[0.3em] text-slate-300">
          {sampleJobs.length} curated matches
        </span>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {sampleJobs.map((job) => (
          <article
            key={job.id}
            className="flex flex-col rounded-2xl border border-transparent bg-gradient-to-b from-slate-900 to-slate-950 px-5 py-4 shadow-inner shadow-slate-950/40 transition hover:-translate-y-1 hover:border-slate-600/50"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-white">{job.title}</h3>
                <p className="text-sm text-slate-400">{job.company}</p>
              </div>
              <span className="text-sm font-semibold text-emerald-400">
                {job.score}%
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {job.skills.map((skill) => (
                <span
                  key={`${job.id}-${skill}`}
                  className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300"
                >
                  {skill}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
