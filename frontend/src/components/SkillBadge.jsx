const palette = [
  "border-[#003ec7]/15 bg-[#dde1ff] text-[#0038b6]",
  "border-[#515f74]/15 bg-[#d5e3fc] text-[#3a485b]",
  "border-[#952200]/15 bg-[#ffdbd2] text-[#891e00]",
  "border-[#0052ff]/15 bg-[#e2e7ff] text-[#001452]",
];

function pickColor(label) {
  const value = Array.from(label || "").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return palette[value % palette.length];
}

export default function SkillBadge({ label }) {
  const isMissing = String(label).toLowerCase().includes("missing");

  return (
    <span
      className={`inline-flex min-h-7 items-center rounded-full border px-3 py-1 text-xs font-bold ${
        isMissing ? "border-[#c3c5d9] bg-[#dae2fd] text-[#434656]" : pickColor(label)
      }`}
    >
      {label}
    </span>
  );
}
