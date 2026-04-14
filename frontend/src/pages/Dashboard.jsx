const matchDetails = [
  {
    title: "Semantic match",
    value: "0.92",
    description: "BERT embeddings + cosine similarity",
  },
  {
    title: "Skill overlap",
    value: "0.78",
    description: "Shared keywords from extracted skills",
  },
  {
    title: "Experience fit",
    value: "0.64",
    description: "Years + titles normalized from resume",
  },
];

export default function Dashboard() {
  return (
    <section className="rounded-3xl border border-white/10 bg-slate-900/40 p-6 shadow-2xl shadow-indigo-900/40">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.4em] text-slate-400">
            Match Dashboard
          </p>
          <h2 className="text-2xl font-semibold text-white">Phase 5</h2>
        </div>
        <span className="rounded-full bg-emerald-500/20 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-300">
          Overall Score
        </span>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {matchDetails.map((detail) => (
          <article
            key={detail.title}
            className="flex flex-col rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900/80 to-slate-950 px-5 py-4"
          >
            <div className="text-sm uppercase tracking-[0.3em] text-slate-500">
              {detail.title}
            </div>
            <p className="mt-2 text-3xl font-semibold text-white">
              {detail.value}
            </p>
            <p className="mt-1 text-sm text-slate-400">{detail.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
