export default function SkillBadge({ label }) {
  return (
    <span className="rounded-full border border-slate-100/60 bg-slate-900/70 px-3 py-1 text-xs uppercase tracking-[0.3em] text-slate-200">
      {label}
    </span>
  );
}
