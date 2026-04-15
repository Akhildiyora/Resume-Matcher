import { useState } from "react";
import { toast } from "react-hot-toast";
import api from "../api/api";

export default function FileUpload({ onUpload }) {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("Awaiting file");
  const [isDragging, setIsDragging] = useState(false);

  const selectFile = (nextFile) => {
    setFile(nextFile);
    setStatus(nextFile ? "Ready to upload" : "Awaiting file");
  };

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
    <div className="surface-card relative overflow-hidden p-8">
      <div className="pointer-events-none absolute inset-0 bg-[#003ec7]/5 opacity-0 transition-opacity" />
      <label
        className={`group flex min-h-[22rem] flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition ${
          isDragging
            ? "border-[#003ec7] bg-[#dde1ff]"
            : "border-[#c3c5d9]/60 bg-white hover:border-[#003ec7]/40 hover:bg-[#faf8ff]"
        }`}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          selectFile(event.dataTransfer.files?.[0] ?? null);
        }}
      >
        <span className="grid h-16 w-16 place-items-center rounded-full bg-[#f2f3ff] text-[#003ec7] transition-transform group-hover:scale-110">
          <span className="material-symbols-outlined text-4xl">cloud_upload</span>
        </span>
        <span className="font-headline mt-6 text-2xl font-extrabold text-[#131b2e]">
          Drop resume here
        </span>
        <span className="mt-2 max-w-md text-sm leading-6 text-[#434656]">
          Support for PDF, DOCX, and TXT files up to 10MB. Neural parsing extracts
          skills, education, domain, and experience in seconds.
        </span>
        <input
          type="file"
          className="sr-only"
          accept=".pdf,.doc,.docx,.txt"
          onChange={(event) => selectFile(event.target.files?.[0] ?? null)}
        />
        <span className="mt-6 rounded-xl bg-[#dae2fd] px-6 py-2.5 text-sm font-extrabold text-[#131b2e] transition-all group-hover:bg-[#003ec7] group-hover:text-white">
          {file ? file.name : "Browse Files"}
        </span>
      </label>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-bold text-[#434656]">{status}</p>
        <button
          className="primary-button"
          onClick={handleUpload}
          disabled={!file || status === "Uploading..."}
          type="button"
        >
          {status === "Uploading..." ? "Processing..." : "Upload Resume"}
        </button>
      </div>
    </div>
  );
}
