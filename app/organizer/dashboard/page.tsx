// app/organizer/dashboard/page.tsx
// Organizer Mission Control Dashboard (React Server Component)
// Authoritative specification: ARCHITECTURE.md §2 & AGENT_MASTER_PLAN.md Step 10C

import React from 'react';
import Link from 'next/link';
import sql from '@/lib/db';
import fs from 'node:fs/promises';
import path from 'node:path';
import {
  getNormalizedLeaderboard,
  getVarianceSummary,
  type LeaderboardRow,
  type VarianceSummary,
} from '@/lib/normalization';
import { CalibrationSummaryCard } from '@/components/CalibrationSummaryCard';
import { CircularRing } from '@/components/CircularRing';
import { JudgeStatusMatrix, type JudgeStatusItem } from '@/components/JudgeStatusMatrix';
import { NormalizedLeaderboard } from '@/components/NormalizedLeaderboard';
import { Trophy, ShieldCheck, Activity, ExternalLink, BarChart3 } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface TrackProgressData {
  id: string;
  name: string;
  reviewed: number;
  totalRequired: number;
  strokeColor: string;
}

const TRACK_COLORS = [
  '#3b82f6', // blue
  '#10b981', // emerald
  '#a855f7', // purple
  '#f43f5e', // rose
  '#f59e0b', // amber
  '#14b8a6', // teal
  '#6366f1', // indigo
  '#f97316', // orange
];

async function getDashboardOperationalData(): Promise<{
  tracksProgress: TrackProgressData[];
  judgesStatus: JudgeStatusItem[];
}> {
  // Load data via DB or fallback to fixtures.json
  try {
    const rawTracks = await sql<{ id: string; name: string }[]>`
      SELECT id, name FROM tracks ORDER BY id ASC;
    `;
    const rawProjects = await sql<{ id: string; track_id: string }[]>`
      SELECT id, track_id FROM projects;
    `;
    const rawScores = await sql<{ judge_id: string; project_id: string }[]>`
      SELECT judge_id, project_id FROM scores;
    `;
    const rawJudges = await sql<{ id: string; name: string }[]>`
      SELECT id, name FROM users WHERE role = 'judge' ORDER BY id ASC;
    `;
    const rawJudgeTracks = await sql<{ judge_id: string; track_id: string }[]>`
      SELECT judge_id, track_id FROM judge_tracks;
    `;

    if (rawTracks.length > 0 && rawJudges.length > 0) {
      // 1. Calculate Track Progress
      const projectTrackMap = new Map(rawProjects.map((p) => [p.id, p.track_id]));
      const tracksProgress: TrackProgressData[] = rawTracks.map((t, idx) => {
        const projectsInTrack = rawProjects.filter((p) => p.track_id === t.id);
        const totalRequired = projectsInTrack.length * 3;
        const reviewed = rawScores.filter(
          (s) => projectTrackMap.get(s.project_id) === t.id
        ).length;

        return {
          id: t.id,
          name: t.name,
          reviewed,
          totalRequired: Math.max(totalRequired, reviewed),
          strokeColor: TRACK_COLORS[idx % TRACK_COLORS.length],
        };
      });

      // 2. Calculate Judge Status
      const trackNameMap = new Map(rawTracks.map((t) => [t.id, t.name]));
      const judgeTrackMap = new Map<string, string[]>();
      for (const jt of rawJudgeTracks) {
        const list = judgeTrackMap.get(jt.judge_id) || [];
        const tName = trackNameMap.get(jt.track_id);
        if (tName) list.push(tName);
        judgeTrackMap.set(jt.judge_id, list);
      }

      const judgesStatus: JudgeStatusItem[] = rawJudges.map((j) => {
        const submitted = rawScores.filter((s) => s.judge_id === j.id).length;
        const totalAssigned = Math.max(submitted, 4); // Target batched assignment
        let status: 'COMPLETE' | 'PENDING' | 'NOT_STARTED' = 'NOT_STARTED';
        if (submitted >= totalAssigned) {
          status = 'COMPLETE';
        } else if (submitted > 0) {
          status = 'PENDING';
        }

        return {
          id: j.id,
          name: j.name,
          tracks: judgeTrackMap.get(j.id) || ['General'],
          completedReviews: submitted,
          totalAssigned,
          status,
        };
      });

      return { tracksProgress, judgesStatus };
    }
  } catch (err) {
    console.warn('[DASHBOARD] Database operational query failed, using fixtures fallback:', err);
  }

  // Fallback via fixtures.json
  try {
    const filePath = path.join(process.cwd(), 'fixtures.json');
    const content = await fs.readFile(filePath, 'utf-8');
    const data = JSON.parse(content);

    const projectTrackMap = new Map<string, string>(
      (data.projects || []).map((p: { id: string; track: string }) => [p.id, p.track])
    );

    const tracksProgress: TrackProgressData[] = (data.tracks || []).map(
      (t: { id: string; name: string }, idx: number) => {
        const projectsInTrack = (data.projects || []).filter(
          (p: { track: string }) => p.track === t.id
        );
        const totalRequired = projectsInTrack.length * 3;
        const reviewed = (data.scores || []).filter(
          (s: { project: string }) => projectTrackMap.get(s.project) === t.id
        ).length;

        return {
          id: t.id,
          name: t.name,
          reviewed,
          totalRequired: Math.max(totalRequired, reviewed),
          strokeColor: TRACK_COLORS[idx % TRACK_COLORS.length],
        };
      }
    );

    const trackNameMap = new Map<string, string>(
      (data.tracks || []).map((t: { id: string; name: string }) => [t.id, t.name])
    );

    const judgesStatus: JudgeStatusItem[] = (data.judges || []).map(
      (j: { id: string; name: string; tracks: string[] }) => {
        const submitted = (data.scores || []).filter(
          (s: { judge: string }) => s.judge === j.id
        ).length;
        const totalAssigned = Math.max(submitted, 4);
        let status: 'COMPLETE' | 'PENDING' | 'NOT_STARTED' = 'NOT_STARTED';
        if (submitted >= totalAssigned) {
          status = 'COMPLETE';
        } else if (submitted > 0) {
          status = 'PENDING';
        }

        return {
          id: j.id,
          name: j.name,
          tracks: (j.tracks || []).map((tid: string) => trackNameMap.get(tid) || tid),
          completedReviews: submitted,
          totalAssigned,
          status,
        };
      }
    );

    return { tracksProgress, judgesStatus };
  } catch {
    return { tracksProgress: [], judgesStatus: [] };
  }
}

export default async function OrganizerDashboardPage() {
  const [leaderboard, variance, operational] = await Promise.all([
    getNormalizedLeaderboard(),
    getVarianceSummary(),
    getDashboardOperationalData(),
  ]);

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-zinc-800 selection:text-zinc-100">
      {/* Top Navigation Bar */}
      <header className="border-b border-zinc-800 bg-zinc-900/60 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-zinc-700 to-zinc-900 border border-zinc-700/80 flex items-center justify-center shadow-inner">
              <Activity className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <span className="font-bold text-sm text-zinc-100 tracking-tight block">
                Mission Control Dashboard
              </span>
              <span className="text-[11px] text-zinc-500 font-mono block">
                Organizer Executive Command • Unit DF-01
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/projects"
              className="text-xs text-zinc-400 hover:text-zinc-200 transition px-3 py-1.5 rounded-xl border border-zinc-800 hover:border-zinc-700 flex items-center gap-1.5"
            >
              <span>Public Gallery</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              Air-Gapped Active
            </span>
          </div>
        </div>
      </header>

      {/* Main Command Workspace */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {/* Section 1: Statistical Calibration Summary Card */}
        <section aria-labelledby="calibration-section-heading">
          <CalibrationSummaryCard
            sigmaRaw={variance.sigma_raw}
            sigmaNorm={variance.sigma_norm}
            varianceReduction={variance.variance_reduction_percent}
          />
        </section>

        {/* Section 2: Circular Progress Rings (8 Tracks) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
            <div>
              <h3 className="text-base font-bold text-zinc-100 tracking-tight">
                Track Review Density & Progress (8 Tracks)
              </h3>
              <p className="text-xs text-zinc-500">
                Minimum 3 disjoint reviews per project constraint monitoring
              </p>
            </div>
            <span className="text-xs font-mono text-zinc-400">
              {operational.tracksProgress.length} Tracks Monitored
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {operational.tracksProgress.map((tp) => (
              <CircularRing
                key={tp.id}
                trackId={tp.id}
                trackName={tp.name}
                reviewedCount={tp.reviewed}
                totalRequired={tp.totalRequired}
                strokeColor={tp.strokeColor}
              />
            ))}
          </div>
        </section>

        {/* Section 3: 30-Judge Status Matrix */}
        <section>
          <JudgeStatusMatrix judges={operational.judgesStatus} />
        </section>

        {/* Section 4: Calibrated Standings Leaderboard */}
        <section>
          <NormalizedLeaderboard initialLeaderboard={leaderboard} />
        </section>
      </div>

      {/* Footer */}
      <footer className="mt-20 border-t border-zinc-900 py-8 text-center text-xs text-zinc-600 font-mono">
        Dogfood 2026 • Organizer Command Center • 100% Offline Standalone Architecture
      </footer>
    </main>
  );
}
