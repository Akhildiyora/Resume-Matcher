import ScoreBar from "./ScoreBar";
import SkillBadge from "./SkillBadge";

export default function JobCard({ job, onMatchClick }) {
  const { title, description, skills = [], score = 0, breakdown = {} } = job;

  return (
    <article className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-2xl shadow-slate-950/40">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-semibold text-white">{title}</h3>
          <p className="text-sm text-slate-400">{description}</p>
        </div>
        <span className="text-lg font-bold text-emerald-400">{(score * 100).toFixed(0)}%</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {skills.map((skill) => (
          <SkillBadge key={skill} label={skill} />
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <ScoreBar label="Semantic" value={breakdown?.semantic ?? 0.5} />
        <ScoreBar label="Skills" value={breakdown?.skills ?? 0.4} />
        <ScoreBar label="Experience" value={breakdown?.experience ?? 0.3} />
        <ScoreBar label="Domain" value={breakdown?.domain ?? 0.2} />
      </div>

      <button
        className="mt-4 rounded-2xl bg-slate-800 px-5 py-2 text-xs uppercase tracking-[0.4em] text-slate-100"
        onClick={() => onMatchClick(job)}
      >
        View Matches
      </button>
    </article>
  );
}
