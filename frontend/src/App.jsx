import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import Upload from "./pages/Upload";
import Jobs from "./pages/Jobs";
import Match from "./pages/Match";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster position="top-right" />
      <div className="min-h-screen bg-slate-950 text-slate-50">
        <header className="mx-auto max-w-6xl px-6 py-10">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
            Resume Matcher
          </p>
          <h1 className="mt-2 text-4xl font-semibold text-white">
            AI-powered job intelligence
          </h1>
          <p className="mt-2 max-w-2xl text-base text-slate-300">
            Upload resumes, parse skills, and surface curated job-match coaching
            data in one dashboard.
          </p>
        </header>

        <main className="mx-auto flex max-w-6xl flex-col gap-8 px-6 pb-12">
          <Upload />
          <Jobs />
          <Match />
        </main>
      </div>
    </QueryClientProvider>
  );
}

export default App;
