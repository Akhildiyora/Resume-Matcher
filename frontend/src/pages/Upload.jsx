import { useState } from "react";
import api from "../api/api";

export default function Upload() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("No resume selected");

  const handleUpload = async () => {
    if (!file) {
      setStatus("Please pick a PDF or DOCX file first.");
      return;
    }

    const formData = new FormData();
    formData.append("resume", file);
    formData.append("text", ""); // placeholder for future extraction

    try {
      setStatus("Uploading...");
      const { data } = await api.post("/resume/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setStatus(`Upload complete: ${data.message}`);
    } catch (err) {
      setStatus("Upload failed, please try again.");
      console.error(err);
    }
  };

  return (
    <section className="rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 p-6 shadow-2xl shadow-indigo-900/40">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.4em] text-slate-400">
            Resume Upload
          </p>
          <h2 className="text-2xl font-semibold text-white">Step 1</h2>
        </div>
        <span className="text-sm text-slate-400">{status}</span>
      </div>

      <div className="mt-6 flex flex-col gap-3">
        <label className="relative flex flex-col gap-2 rounded-2xl border border-dashed border-slate-700 bg-slate-900/70 p-6 text-left hover:border-slate-500">
          <span className="text-sm font-medium text-slate-300">
            Drag & drop or click to select a resume (PDF/DOCX)
          </span>
          <input
            type="file"
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            accept=".pdf,.docx"
          />
          <span className="text-xs text-slate-500">
            {file?.name ?? "No file selected"}
          </span>
        </label>
        <button
          onClick={handleUpload}
          className="rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400 px-6 py-2 text-sm font-semibold uppercase tracking-widest text-slate-950 shadow-lg shadow-cyan-500/40 transition hover:scale-[1.01]"
        >
          Upload Resume
        </button>
      </div>
    </section>
  );
}
