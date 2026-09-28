// app/judge/page.tsx
// Judge Portal Dashboard Hub
// Authoritative specification: ARCHITECTURE.md §2 & AGENT_MASTER_PLAN.md Step 10B

import React from 'react';
import Link from 'next/link';
import sql from '@/lib/db';
import fs from 'node:fs/promises';
import path from 'node:path';
import { getServerSessionUser } from '@/lib/auth';
import { notFound } from 'next/navigation';
import { AuthPromptCard } from '@/components/AuthPromptCard';
import {
  Trophy,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  ExternalLink,
  Sparkles,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

interface JudgeProjectItem {
  id: string;
  title: string;
  summary: string;
  track_name: string;
  team_name: string;
  has_score: boolean;
  total_weighted_score?: number;
}

async function getJudgeDashboardData(currentJudgeId: string): Promise<JudgeProjectItem[]> {
  try {
    const projects = await sql<
      {
        id: string;
        title: string;
        summary: string;
        track_name: string;
        team_name: string;
        score_id: number | null;
        total_weighted_score: number | null;
      }[]
    >`
      SELECT
        p.id,
        p.title,
        p.summary,
        t.name as track_name,
        tm.name as team_name,
        s.id as score_id,
        s.total_weighted_score
      FROM projects p
      JOIN tracks t ON p.track_id = t.id
      JOIN teams tm ON p.team_id = tm.id
      LEFT JOIN scores s ON p.id = s.project_id AND s.judge_id = ${currentJudgeId}
      ORDER BY p.id ASC;
    `;

    if (projects.length > 0) {
      return projects.map((p) => ({
        id: p.id,
        title: p.title,
        summary: p.summary,
        track_name: p.track_name,
        team_name: p.team_name,
        has_score: p.score_id !== null,
        total_weighted_score: p.total_weighted_score != null ? Number(p.total_weighted_score) : undefined,
      }));
    }
  } catch (err) {
    console.warn('[JUDGE_HUB] Database query bypassed; using fallback fixtures:', err);
  }

  // Fallback to fixtures.json
  try {
    const filePath = path.join(process.cwd(), 'fixtures.json');
    const content = await fs.readFile(filePath, 'utf-8');
    const data = JSON.parse(content);
    const trackMap = new Map((data.tracks || []).map((t: { id: string; name: string }) => [t.id, t.name]));
    const teamMap = new Map((data.teams || []).map((tm: { id: string; name: string }) => [tm.id, tm.name]));
    const scoredProjectIds = new Set(
      (data.scores || [])
        .filter((s: { judge: string }) => s.judge === currentJudgeId)
        .map((s: { project: string }) => s.project)
    );

    return (data.projects || []).map((p: { id: string; title: string; summary: string; track: string; team: string }) => ({
      id: p.id,
      title: p.title,
      summary: p.summary,
      track_name: trackMap.get(p.track) || 'General',
      team_name: teamMap.get(p.team) || p.team,
      has_score: scoredProjectIds.has(p.id),
    }));
  } catch {
    return [];
  }
}

export default async function JudgeHubPage() {
  const user = await getServerSessionUser();

  // If user is not authenticated or role is not judge/organizer/admin, render clean AuthPromptCard
  if (
    !user.isAuthenticated ||
    (user.role !== 'judge' && user.role !== 'organizer' && user.role !== 'admin')
  ) {
    return (
      <main className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-4">
        <AuthPromptCard
          requiredRole="judge"
          title="Judge Session Required"
          description="Access to the Judge Speed Console and ballot review queue requires authenticated judge credentials."
          currentRole={user.role}
        />
      </main>
    );
  }

  // CRITICAL-01: Never silently attribute ballot data to a default judge ID.
  if (!user.userId) {
    notFound();
  }
  const judgeId = user.userId!;  // Non-null: guarded above
  const projects = await getJudgeDashboardData(judgeId);
  const completedCount = projects.filter((p) => p.has_score).length;
  const pendingCount = projects.length - completedCount;

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-zinc-800 selection:text-zinc-100">
      {/* Top Header — sits below global nav at top-14 */}
      <header className="border-b border-zinc-800 bg-zinc-900/60 backdrop-blur sticky top-14 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-zinc-700 to-zinc-900 border border-zinc-700/80 flex items-center justify-center shadow-inner">
              <Trophy className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <span className="font-bold text-sm text-zinc-100 tracking-tight block">Judge Portal Hub</span>
              <span className="text-[11px] text-zinc-500 font-mono block">Logged in as {judgeId}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/projects"
              className="text-xs text-zinc-400 hover:text-zinc-200 transition px-3 py-1.5 rounded-lg border border-zinc-800 hover:border-zinc-700 flex items-center gap-1.5"
            >
              <span>Public Gallery</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Hero & Metrics */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-zinc-800/80">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-zinc-900 border border-zinc-800 text-zinc-400 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
              <span>Speed Review Console</span>
            </div>
            <h1 className="text-3xl font-extrabold text-zinc-100 tracking-tight">Assigned Ballot Queue</h1>
            <p className="text-sm text-zinc-400 mt-1">
              Evaluate assigned submissions across Functionality (40%), Quality (35%), and Innovation (25%).
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3">
            <div className="px-4 py-3 rounded-2xl bg-zinc-900/80 border border-zinc-800 text-center">
              <span className="text-xs text-zinc-500 uppercase font-semibold block">Total</span>
              <span className="text-xl font-bold font-mono text-zinc-100">{projects.length}</span>
            </div>

            <div className="px-4 py-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center">
              <span className="text-xs text-emerald-400 uppercase font-semibold block">Evaluated</span>
              <span className="text-xl font-bold font-mono text-emerald-400">{completedCount}</span>
            </div>

            <div className="px-4 py-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center">
              <span className="text-xs text-amber-400 uppercase font-semibold block">Pending</span>
              <span className="text-xl font-bold font-mono text-amber-400">{pendingCount}</span>
            </div>
          </div>
        </div>

        {/* Project Queue Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((project) => (
            <div
              key={project.id}
              className="p-5 bg-zinc-900/70 border border-zinc-800 rounded-2xl flex flex-col justify-between space-y-4 hover:border-zinc-700 transition"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700/60 font-medium">
                    {project.track_name}
                  </span>
                  {project.has_score ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Reviewed {project.total_weighted_score != null ? `(${Number(project.total_weighted_score).toFixed(2)})` : ''}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-400">
                      <Clock className="w-3.5 h-3.5" />
                      Pending
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-zinc-100 tracking-tight">{project.title}</h3>
                <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">{project.summary}</p>
              </div>

              <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between">
                <span className="text-xs font-mono text-zinc-500">{project.team_name}</span>
                <Link
                  href={`/judge/review/${project.id}`}
                  className="px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-bold transition flex items-center gap-1 shadow-sm"
                >
                  <span>{project.has_score ? 'Edit Score' : 'Review Project'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
