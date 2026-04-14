import { useState } from "react";
import { toast } from "react-hot-toast";
import api from "../api/api";

export default function FileUpload({ onUpload }) {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("Awaiting file");

  const handleUpload = async () => {
    if (!file) {
      toast.error("Pick a resume before uploading");
      return;
    }

    const formData = new FormData();
    formData.append("resume", file);

    setStatus("Uploading...");
    try {
      const response = await api.post("/resume/upload-resume", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setStatus("Resume processed");
      toast.success("Resume processed successfully");
      onUpload(response.data);
    } catch (err) {
      setStatus("Upload failed");
      toast.error("Upload failed, try again");
      console.error(err);
    }
  };

  return (
    <div className="border-2 border-dashed border-slate-400 rounded-xl p-6 text-center">
      <p className="text-sm text-slate-500">Drag & drop or select a file</p>
      <input
        type="file"
        className="mt-4 block mx-auto"
        onChange={(event) => setFile(event.target.files?.[0] ?? null)}
      />
      <button
        className="mt-4 rounded-lg bg-indigo-500 px-6 py-2 text-white shadow-lg shadow-indigo-500/40"
        onClick={handleUpload}
        disabled={!file}
      >
        {status === "Uploading..." ? "Processing..." : "Upload Resume"}
      </button>
      <p className="mt-2 text-xs uppercase tracking-[0.3em] text-slate-400">
        {status}
      </p>
    </div>
  );
}
