import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import Upload from "./pages/Upload";
import Jobs from "./pages/Jobs";
import Match from "./pages/Match";
import heroImage from "./assets/hero.png";

const queryClient = new QueryClient();

const tabs = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: "dashboard",
    eyebrow: "Curation Overview",
    title: "Welcome back, Alexander.",
    description: "Your AI curator has identified 12 new high-intent matches since your last visit.",
  },
  {
    id: "jobs",
    label: "Jobs",
    icon: "work",
    eyebrow: "Curated Talent Pipeline",
    title: "Active Job Postings",
    description: "Filter roles, inspect skill demand, and open candidate match intelligence.",
  },
  {
    id: "upload",
    label: "Resumes",
    icon: "description",
    eyebrow: "Curation Engine",
    title: "Resume Intelligence",
    description: "Upload a resume and extract professional milestones, competencies, and hidden match potential.",
  },
  {
    id: "match",
    label: "Analytics",
    icon: "analytics",
    eyebrow: "Match Analysis",
    title: "The Intelligent Match",
    description: "Compare resumes to roles, generate recommendations, and review scoring logic.",
  },
];

function DashboardOverview({ setActiveTab }) {
  const bars = [40, 65, 90, 55, 75, 30, 20];
  const days = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
  const matches = [
    ["Elena Rodriguez", "Senior Frontend Developer", "Staff UI Architect", 98, "React"],
    ["Jordan Whitmore", "Principal Product Designer", "Design Director", 94, "Strategy"],
    ["Amara Okafor", "Data Scientist", "ML Engineer", 91, "Python"],
  ];

  return (
    <section className="grid grid-cols-12 gap-6">
      <div className="surface-card col-span-12 p-8 lg:col-span-8">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <h3 className="font-headline text-xl font-extrabold">Match Activity</h3>
            <p className="mt-1 text-sm text-muted">Daily resume-to-job synchronizations</p>
          </div>
          <div className="flex gap-2">
            <span className="pill-active">Week</span>
            <span className="pill-muted">Month</span>
          </div>
        </div>
        <div className="flex min-h-[300px] items-end justify-between gap-3 px-2 pb-2">
          {bars.map((height, index) => (
            <div key={days[index]} className="group flex h-72 w-full flex-col items-center justify-end gap-3">
              <div
                className={`w-full rounded-t-xl transition-all group-hover:bg-[#0052ff] ${
                  index === 2 ? "signature-gradient relative" : "bg-[#e2e7ff]"
                }`}
                style={{ height: `${height}%` }}
              >
                {index === 2 && (
                  <span className="glass-chip absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap">
                    Peak: 142
                  </span>
                )}
              </div>
              <span className={`text-[10px] font-extrabold ${index === 2 ? "text-primary" : "text-muted"}`}>
                {days[index]}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="col-span-12 grid gap-6 lg:col-span-4">
        <div className="surface-card flex items-center gap-6 p-6">
          <div className="score-ring" style={{ "--score": 82, "--ring-size": "5rem" }}>
            <span>82%</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-muted">Avg. Match Score</p>
            <h4 className="font-headline text-2xl font-extrabold">+14%</h4>
            <p className="text-[10px] font-extrabold uppercase text-primary">Above Benchmark</p>
          </div>
        </div>
        <div className="surface-card signature-gradient relative overflow-hidden p-6 text-white">
          <div className="relative z-10 flex h-full min-h-32 flex-col justify-between">
            <p className="text-sm font-semibold text-[#b7c4ff]">Active Jobs Managed</p>
            <div className="flex items-end justify-between">
              <h4 className="font-headline text-5xl font-extrabold">48</h4>
              <span className="material-symbols-outlined text-5xl text-white/55">bolt</span>
            </div>
          </div>
        </div>
      </div>

      <div className="surface-card col-span-12 p-8">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <h3 className="font-headline text-2xl font-extrabold">Top Match Recommendations</h3>
            <p className="mt-1 text-sm text-muted">AI-calculated synergy based on skill density and role alignment.</p>
          </div>
          <button className="text-sm font-extrabold text-primary" onClick={() => setActiveTab("match")} type="button">
            View analysis
          </button>
        </div>
        <div className="space-y-4">
          {matches.map(([name, role, target, score, skill]) => (
            <button
              key={name}
              className="match-row group w-full"
              onClick={() => setActiveTab("match")}
              type="button"
            >
              <img src={heroImage} alt="" className="h-14 w-14 rounded-full object-cover" />
              <div className="min-w-0 flex-1 text-left">
                <h4 className="truncate text-lg font-extrabold">{name}</h4>
                <p className="truncate text-sm text-muted">{role} | 8 yrs exp.</p>
              </div>
              <div className="hidden text-left md:block">
                <p className="text-[10px] font-extrabold uppercase text-muted">Target Role</p>
                <p className="text-sm font-bold">{target}</p>
              </div>
              <span className="hidden rounded-lg bg-[#d5e3fc] px-3 py-1 text-xs font-extrabold text-[#3a485b] xl:inline-flex">
                {skill}
              </span>
              <div className="w-28 text-right">
                <span className="font-headline text-2xl font-black text-primary">{score}%</span>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-[#e2e7ff]">
                  <div className="signature-gradient h-full rounded-full" style={{ width: `${score}%` }} />
                </div>
              </div>
              <span className="material-symbols-outlined rounded-lg bg-primary p-2 text-white opacity-0 transition-opacity group-hover:opacity-100">
                chevron_right
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const active = tabs.find((tab) => tab.id === activeTab) ?? tabs[0];

  const renderActivePage = () => {
    if (activeTab === "dashboard") return <DashboardOverview setActiveTab={setActiveTab} />;
    if (activeTab === "jobs") return <Jobs />;
    if (activeTab === "upload") return <Upload />;
    return <Match />;
  };

  return (
    <QueryClientProvider client={queryClient}>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#131b2e",
            color: "#ffffff",
            borderRadius: "12px",
            boxShadow: "0 18px 40px rgba(0, 62, 199, 0.18)",
          },
        }}
      />
      <div className="min-h-screen bg-surface text-on-surface">
        <aside className="app-sidebar">
          <div className="px-2">
            <h1 className="font-headline text-xl font-extrabold tracking-tight">The Intelligent Match</h1>
            <p className="mt-1 text-xs font-semibold text-muted">Digital Curator AI</p>
          </div>

          <nav className="mt-10 flex-1 space-y-1" aria-label="Primary">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`side-link ${activeTab === tab.id ? "side-link-active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
                type="button"
              >
                <span className="material-symbols-outlined">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>

          <div className="mt-auto space-y-2">
            <button className="primary-button w-full justify-center" onClick={() => setActiveTab("upload")} type="button">
              <span className="material-symbols-outlined text-lg">add</span>
              New Search
            </button>
            <button className="side-link" type="button">
              <span className="material-symbols-outlined">settings</span>
              <span>Settings</span>
            </button>
            <button className="side-link" type="button">
              <span className="material-symbols-outlined">help</span>
              <span>Support</span>
            </button>
          </div>
        </aside>

        <header className="topbar">
          <div className="search-shell">
            <span className="material-symbols-outlined text-muted">search</span>
            <input placeholder="Search matches, jobs, or candidates..." type="text" />
          </div>
          <div className="flex items-center gap-5">
            <button className="top-icon" type="button">
              <span className="material-symbols-outlined">notifications</span>
              <span className="alert-dot" />
            </button>
            <button className="top-icon" type="button">
              <span className="material-symbols-outlined">chat_bubble</span>
            </button>
            <div className="hidden h-8 w-px bg-[#c3c5d9]/50 sm:block" />
            <div className="hidden text-right sm:block">
              <p className="text-xs font-extrabold">Alexander Vance</p>
              <p className="text-[10px] font-bold uppercase text-muted">Lead Recruiter</p>
            </div>
            <img src={heroImage} alt="User avatar" className="h-10 w-10 rounded-full object-cover ring-2 ring-primary/10" />
          </div>
        </header>

        <main className="app-main">
          <section className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <span className="mb-2 block text-xs font-extrabold uppercase text-primary">{active.eyebrow}</span>
              <h2 className="font-headline text-4xl font-extrabold tracking-tight">{active.title}</h2>
              <p className="mt-2 max-w-3xl text-lg text-muted">{active.description}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button className="secondary-button" onClick={() => setActiveTab("upload")} type="button">
                <span className="material-symbols-outlined">publish</span>
                Upload Resume
              </button>
              <button className="primary-button" onClick={() => setActiveTab("jobs")} type="button">
                <span className="material-symbols-outlined">post_add</span>
                View Jobs
              </button>
            </div>
          </section>

          <div className="mb-6 flex gap-2 overflow-x-auto lg:hidden">
            {tabs.map((tab) => (
              <button
                key={`mobile-${tab.id}`}
                className={`mobile-tab ${activeTab === tab.id ? "mobile-tab-active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
                type="button"
              >
                <span className="material-symbols-outlined text-base">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {renderActivePage()}
        </main>
      </div>
    </QueryClientProvider>
  );
}

export default App;
