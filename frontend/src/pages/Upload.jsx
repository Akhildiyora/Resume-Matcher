import { useEffect, useState } from "react";
import FileUpload from "../components/FileUpload";
import SkillBadge from "../components/SkillBadge";
import socket from "../services/socket";

export default function Upload() {
  const [data, setData] = useState(null);
  const [liveUpdate, setLiveUpdate] = useState(null);

  useEffect(() => {
    const handleUpdate = (payload) => {
      setLiveUpdate(payload);
    };

    socket.on("score-update", handleUpdate);
    return () => {
      socket.off("score-update", handleUpdate);
    };
  }, []);

  const liveProgressLabel = liveUpdate
    ? typeof liveUpdate.progress === "number"
      ? `${liveUpdate.progress}%`
      : liveUpdate.progress ?? "pending"
    : null;

  return (
    <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-950 to-slate-900 p-6 shadow-2xl shadow-indigo-900/30">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.4em] text-slate-400">Resume</p>
          <h2 className="text-2xl font-semibold text-white">Upload & Analyze</h2>
        </div>
        {data && (
          <div className="rounded-2xl bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.4em] text-white">
            Experience: {data.experience} yrs • {data.education} • {data.domain}
          </div>
        )}
      </header>
      <div className="space-y-8 md:flex md:gap-8 md:space-y-0">
        <div className="md:w-2/3">
          <FileUpload onUpload={(payload) => setData(payload)} />
        </div>
        {data && (
          <div className="md:w-1/3 rounded-2xl border border-white/10 bg-slate-900/70 p-4 text-sm text-slate-300 shadow-lg">
            <h3 className="text-white">Resume Insights</h3>
            <p className="mt-2 text-xs text-slate-400">Detected information</p>
            <div className="mt-4 space-y-2">
              <div>
                <p className="text-[11px] uppercase tracking-[0.4em] text-slate-500">Experience</p>
                <p>{data.experience} years</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.4em] text-slate-500">Education</p>
                <p className="capitalize">{data.education}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.4em] text-slate-500">Domain</p>
                <p className="capitalize">{data.domain}</p>
              </div>
            </div>
          </div>
        )}
      </div>
      {data && data.skills?.length > 0 && (
        <div className="mt-8 flex flex-wrap gap-2">
          {data.skills.map((skill) => (
            <SkillBadge key={skill} label={skill} />
          ))}
        </div>
      )}
      {liveUpdate && (
        <div className="mt-4 rounded-2xl border border-emerald-500/40 bg-emerald-500/5 px-4 py-2 text-sm text-emerald-200">
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-300">Live update</p>
          <p className="text-sm font-semibold">
            {liveUpdate.stage?.replace(/\./g, " ") || "processing"} — {liveProgressLabel}
          </p>
        </div>
      )}
    </section>
  );
}
