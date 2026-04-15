import ScoreBar from "./ScoreBar";
import SkillBadge from "./SkillBadge";

export default function JobCard({ job, onMatchClick }) {
  const {
    title,
    description,
    skills = [],
    score = 0,
    breakdown = {},
    domain,
    experience,
  } = job;

  return (
    <article className="group flex flex-col gap-5 rounded-xl bg-white p-6 transition-all hover:scale-[1.01] hover:bg-[#e2e7ff] lg:flex-row lg:items-center lg:justify-between">
      <div className="flex min-w-0 flex-1 items-start gap-5">
        <div className="grid h-16 w-16 shrink-0 place-items-center rounded-xl bg-[#003ec7]/10 text-[#003ec7] transition-colors group-hover:bg-[#003ec7] group-hover:text-white">
          <span className="material-symbols-outlined text-3xl">work</span>
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            {domain && <span className="rounded bg-[#dae2fd] px-2 py-0.5 text-[10px] font-extrabold uppercase text-[#434656]">{domain}</span>}
            {experience !== undefined && <span className="rounded bg-[#ffdbd2] px-2 py-0.5 text-[10px] font-extrabold uppercase text-[#891e00]">{experience}+ yrs</span>}
          </div>
          <h3 className="font-headline mt-2 text-xl font-extrabold leading-tight text-[#131b2e]">{title}</h3>
          <p className="mt-1 line-clamp-2 text-sm leading-6 text-[#434656]">
            {description || "Role details are ready for candidate matching."}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {skills.slice(0, 5).map((skill) => (
              <SkillBadge key={skill} label={skill} />
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[7rem,5rem,auto] lg:items-center">
        <div className="hidden min-w-44 grid-cols-2 gap-2 xl:grid">
          <ScoreBar label="Skills" value={breakdown?.skills ?? 0.4} />
          <ScoreBar label="Domain" value={breakdown?.domain ?? 0.2} />
        </div>
        <div className="score-ring mx-auto text-[0.85rem]" style={{ "--score": Math.round(score * 100), "--ring-size": "4rem" }}>
          <span>{(score * 100).toFixed(0)}%</span>
        </div>
        <button className="primary-button" onClick={() => onMatchClick(job)} type="button">
          Matches
        </button>
      </div>
    </article>
  );
}
