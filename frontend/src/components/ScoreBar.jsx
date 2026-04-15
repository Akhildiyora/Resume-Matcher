export default function ScoreBar({ label, value }) {
  const percent = Math.max(0, Math.min(Number(value || 0) * 100, 100));

  return (
    <div className="rounded-xl bg-[#f2f3ff] p-3 text-xs">
      <div className="flex items-center justify-between gap-3 text-[#434656]">
        <span className="font-bold capitalize">{label}</span>
        <span className="font-extrabold text-[#131b2e]">{Math.round(percent)}%</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#dae2fd]">
        <div
          className="signature-gradient h-full rounded-full shadow-[0_0_18px_rgba(0,62,199,0.22)]"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
