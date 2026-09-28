import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-zinc-950 text-zinc-100">
      <div className="max-w-xl w-full p-8 border border-zinc-800 rounded-xl bg-zinc-900/50 backdrop-blur text-center space-y-6">
        <div className="inline-flex items-center px-3 py-1 text-xs font-mono font-medium rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          Phase 1: Step 1 Scaffolding Complete
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-100">
          Dogfood 2026 Portal
        </h1>
        <p className="text-sm text-zinc-400">
          Self-hostable, air-gapped hackathon submission and statistical judging platform.
        </p>
        <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/projects"
            className="px-4 py-2 text-sm font-medium rounded-lg bg-zinc-100 text-zinc-950 hover:bg-zinc-200 transition"
          >
            Public Gallery (/projects)
          </Link>
          <Link
            href="/organizer/dashboard"
            className="px-4 py-2 text-sm font-medium rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 transition"
          >
            Organizer Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
