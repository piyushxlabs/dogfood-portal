import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { PersonaSwitcher } from "@/components/PersonaSwitcher";
import { Trophy, Compass, Send, Scale, LayoutDashboard } from "lucide-react";

export const metadata: Metadata = {
  title: "Dogfood 2026 Hackathon Portal",
  description: "Autonomous, air-gapped submission and judging platform for Hackathon Raptors",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-zinc-950 text-zinc-100 antialiased selection:bg-zinc-800 selection:text-zinc-100 min-h-screen">
        {/* Global Navigation Header Bar */}
        <header className="sticky top-0 z-50 w-full border-b border-zinc-800/80 bg-zinc-950/85 backdrop-blur-md px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link
              href="/projects"
              className="flex items-center gap-2.5 font-bold text-sm text-zinc-100 hover:text-white transition group"
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-zinc-700 to-zinc-900 border border-zinc-700/80 flex items-center justify-center shadow-inner group-hover:border-zinc-600 transition">
                <Trophy className="w-4 h-4 text-amber-400" />
              </div>
              <span className="tracking-tight">Dogfood 2026</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-zinc-900 text-zinc-400 font-mono border border-zinc-800">
                Unit DF-01
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-1 text-xs font-medium text-zinc-400">
              <Link
                href="/projects"
                className="px-3 py-1.5 rounded-lg hover:text-zinc-100 hover:bg-zinc-900/60 transition flex items-center gap-1.5"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Gallery</span>
              </Link>
              <Link
                href="/projects/new"
                className="px-3 py-1.5 rounded-lg hover:text-zinc-100 hover:bg-zinc-900/60 transition flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit</span>
              </Link>
              <Link
                href="/judge"
                className="px-3 py-1.5 rounded-lg hover:text-zinc-100 hover:bg-zinc-900/60 transition flex items-center gap-1.5"
              >
                <Scale className="w-3.5 h-3.5" />
                <span>Judge Console</span>
              </Link>
              <Link
                href="/organizer/dashboard"
                className="px-3 py-1.5 rounded-lg hover:text-zinc-100 hover:bg-zinc-900/60 transition flex items-center gap-1.5"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Mission Control</span>
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <PersonaSwitcher />
          </div>
        </header>

        {children}
      </body>
    </html>
  );
}
