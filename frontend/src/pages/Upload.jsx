import { useEffect, useState } from "react";
import FileUpload from "../components/FileUpload";
import SkillBadge from "../components/SkillBadge";
import socket from "../services/socket";

export default function Upload() {
  const [data, setData] = useState(null);
  const [liveUpdate, setLiveUpdate] = useState(null);

  useEffect(() => {
    const handleUpdate = (payload) => setLiveUpdate(payload);
    socket.on("score-update", handleUpdate);
    return () => socket.off("score-update", handleUpdate);
  }, []);

  const liveProgressLabel = liveUpdate
    ? typeof liveUpdate.progress === "number"
      ? `${liveUpdate.progress}%`
      : liveUpdate.progress ?? "pending"
    : null;

  const skills = data?.skills || [];

  return (
    <section className="section-shell">
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 space-y-6 lg:col-span-7">
          <FileUpload onUpload={(payload) => setData(payload)} />

          <div className="surface-card p-6">
            <div className="mb-4 flex items-center justify-between gap-4">
              <h3 className="font-headline flex items-center gap-2 text-lg font-extrabold">
                <span className="material-symbols-outlined text-primary">sync</span>
                Parsing Status
              </h3>
              <span className="font-headline text-sm font-extrabold text-primary">
                {liveProgressLabel || (data ? "100%" : "Idle")}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-[#dae2fd]">
              <div
                className="signature-gradient h-full rounded-full transition-all"
                style={{
                  width: liveUpdate?.progress
                    ? `${Math.min(Number(liveUpdate.progress), 100)}%`
                    : data
                      ? "100%"
                      : "18%",
                }}
              />
            </div>
            <p className="mt-3 text-sm text-muted">
              {liveUpdate
                ? liveUpdate.stage?.replace(/\./g, " ") || "Processing resume"
                : data
                  ? "Resume processed and ready for matching."
                  : "Upload a resume to begin neural parsing."}
            </p>
          </div>

          <div className="surface-card p-8">
            <div className="mb-6 flex items-center justify-between gap-4">
              <h3 className="font-headline flex items-center gap-2 text-lg font-extrabold">
                <span className="material-symbols-outlined text-primary">auto_awesome</span>
                Professional Summary
              </h3>
              <button className="text-xs font-extrabold text-primary" type="button">
                Edit Summary
              </button>
            </div>
            <div className="rounded-xl border-l-4 border-[#003ec7] bg-[#f2f3ff] p-6">
              <p className="text-sm italic leading-7 text-[#131b2e]">
                {data
                  ? `Candidate profile indicates ${data.experience || 0}+ years in ${data.domain || "a general"} domain with ${skills.length} detected skills and ${data.education || "unspecified"} education.`
                  : "Upload a resume to generate a concise recruiter-ready summary with role fit signals and skill highlights."}
              </p>
            </div>
          </div>
        </div>

        <div className="col-span-12 space-y-6 lg:col-span-5">
          <div className="surface-card h-full p-8">
            <div className="mb-8 flex items-center justify-between gap-4">
              <h3 className="font-headline text-lg font-extrabold">Extracted Skills</h3>
              <span className="rounded bg-[#003ec7]/10 px-2 py-1 text-[10px] font-extrabold text-primary">
                {skills.length} FOUND
              </span>
            </div>

            <div className="space-y-8">
              <div>
                <p className="mb-4 text-[10px] font-extrabold uppercase text-muted">
                  Core Competencies
                </p>
                <div className="flex flex-wrap gap-2">
                  {skills.length ? (
                    skills.slice(0, 10).map((skill) => <SkillBadge key={skill} label={skill} />)
                  ) : (
                    ["UX Strategy", "Interface Design", "Design Systems", "Rapid Prototyping"].map((skill) => (
                      <SkillBadge key={skill} label={skill} />
                    ))
                  )}
                </div>
              </div>

              <div>
                <p className="mb-4 text-[10px] font-extrabold uppercase text-muted">
                  Extracted Metadata
                </p>
                <div className="grid gap-3">
                  {[
                    ["Experience", data ? `${data.experience} years` : "Pending"],
                    ["Education", data?.education || "Pending"],
                    ["Domain", data?.domain || "Pending"],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-xl bg-[#f2f3ff] p-4">
                      <p className="text-[10px] font-extrabold uppercase text-muted">{label}</p>
                      <p className="mt-1 font-headline text-lg font-extrabold capitalize">{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-[#c3c5d9]/30 pt-6">
                <div className="mb-6 flex items-center gap-4">
                  <div className="score-ring text-sm" style={{ "--score": data ? 88 : 34, "--ring-size": "4rem" }}>
                    <span>{data ? 88 : 34}</span>
                  </div>
                  <div>
                    <p className="text-sm font-extrabold">Confidence Score</p>
                    <p className="text-[10px] text-muted">High accuracy extraction readiness</p>
                  </div>
                </div>
                <div className="rounded-xl border-l-4 border-[#952200] bg-[#ffdbd2]/50 p-4">
                  <p className="mb-2 flex items-center gap-2 text-xs font-extrabold text-[#952200]">
                    <span className="material-symbols-outlined text-sm">warning</span>
                    Missing Information
                  </p>
                  <p className="text-[11px] leading-5 text-muted">
                    Verify education dates and portfolio links manually when they are absent from the resume.
                  </p>
                </div>
              </div>
            </div>

            <button className="primary-button mt-10 w-full" type="button">
              Verify & Proceed to Matching
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
