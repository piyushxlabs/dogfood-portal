// app/judge/review/[projectId]/page.tsx
// Judge Split-Screen Speed Console (React Server Component)
// Authoritative specification: JUDGING.md §2 & AGENT_MASTER_PLAN.md Step 10B

import React from 'react';
import { notFound } from 'next/navigation';
import sql from '@/lib/db';
import fs from 'node:fs/promises';
import path from 'node:path';
import {
  JudgeReviewConsole,
  type ProjectDetail,
  type ExistingScore,
} from '@/components/JudgeReviewConsole';
import { Trophy, ShieldCheck } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{
    projectId: string;
  }>;
}

interface FixtureData {
  projects?: {
    id: string;
    title: string;
    summary: string;
    track: string;
    team: string;
    repo_url: string;
    submitted_at: string;
  }[];
  tracks?: { id: string; name: string }[];
  teams?: { id: string; name: string }[];
  scores?: {
    judge: string;
    project: string;
    criteria: { functionality: number; quality: number; innovation: number };
    comment?: string;
  }[];
}

async function loadFallbackData(projectId: string): Promise<{
  project: ProjectDetail | null;
  projectIds: string[];
  initialScore: ExistingScore | null;
}> {
  const candidatePaths = [
    process.env.FIXTURES_PATH,
    path.join(process.cwd(), 'fixtures.json'),
    path.join(process.cwd(), 'docs', 'fixtures.json'),
    '/app/fixtures.json',
  ].filter((p): p is string => Boolean(p));

  for (const p of candidatePaths) {
    try {
      const content = await fs.readFile(p, 'utf-8');
      const data = JSON.parse(content) as FixtureData;
      if (Array.isArray(data.projects)) {
        const trackMap = new Map((data.tracks || []).map((t) => [t.id, t.name]));
        const teamMap = new Map((data.teams || []).map((tm) => [tm.id, tm.name]));
        const projectIds = data.projects.map((pj) => pj.id);

        const targetP = data.projects.find((pj) => pj.id === projectId);
        if (!targetP) {
          return { project: null, projectIds, initialScore: null };
        }

        const project: ProjectDetail = {
          id: targetP.id,
          title: targetP.title,
          summary: targetP.summary,
          track_id: targetP.track,
          track_name: trackMap.get(targetP.track) || 'General',
          team_name: teamMap.get(targetP.team) || targetP.team,
          repo_url: targetP.repo_url,
          submitted_at: targetP.submitted_at,
        };

        // Check if there is an existing score in fixtures for jdg_01 (judge_a)
        const scoreMatch = (data.scores || []).find(
          (s) => s.project === projectId && s.judge === 'jdg_01'
        );

        const initialScore: ExistingScore | null = scoreMatch
          ? {
              functionality: scoreMatch.criteria.functionality,
              quality: scoreMatch.criteria.quality,
              innovation: scoreMatch.criteria.innovation,
              comment: scoreMatch.comment || '',
            }
          : null;

        return { project, projectIds, initialScore };
      }
    } catch {
      // Continue to next path
    }
  }

  return { project: null, projectIds: [], initialScore: null };
}

async function getProjectReviewData(projectId: string): Promise<{
  project: ProjectDetail | null;
  projectIds: string[];
  initialScore: ExistingScore | null;
}> {
  try {
    const dbProjects = await sql<
      {
        id: string;
        title: string;
        summary: string;
        track_id: string;
        track_name: string;
        team_name: string;
        repo_url: string;
        submitted_at: Date | string;
      }[]
    >`
      SELECT
        p.id,
        p.title,
        p.summary,
        p.track_id,
        t.name as track_name,
        tm.name as team_name,
        p.repo_url,
        p.submitted_at
      FROM projects p
      JOIN tracks t ON p.track_id = t.id
      JOIN teams tm ON p.team_id = tm.id
      ORDER BY p.id ASC;
    `;

    if (dbProjects && dbProjects.length > 0) {
      const projectIds = dbProjects.map((p) => p.id);
      const target = dbProjects.find((p) => p.id === projectId);

      if (!target) {
        return { project: null, projectIds, initialScore: null };
      }

      const project: ProjectDetail = {
        ...target,
        submitted_at:
          typeof target.submitted_at === 'string'
            ? target.submitted_at
            : target.submitted_at.toISOString(),
      };

      // Check existing score in database
      const existingScores = await sql<
        {
          raw_criteria: { functionality?: number; quality?: number; innovation?: number };
          comment: string | null;
        }[]
      >`
        SELECT raw_criteria, comment
        FROM scores
        WHERE project_id = ${projectId} AND judge_id = 'jdg_01'
        LIMIT 1;
      `;

      let initialScore: ExistingScore | null = null;
      if (existingScores.length > 0) {
        const s = existingScores[0];
        initialScore = {
          functionality: Number(s.raw_criteria?.functionality) || 3.0,
          quality: Number(s.raw_criteria?.quality) || 3.0,
          innovation: Number(s.raw_criteria?.innovation) || 3.0,
          comment: s.comment || '',
        };
      }

      return { project, projectIds, initialScore };
    }
  } catch (err) {
    console.warn('[JUDGE_REVIEW] Database query failed, using fixture fallback:', err);
  }

  return loadFallbackData(projectId);
}

export default async function JudgeReviewPage({ params }: PageProps) {
  const { projectId } = await params;
  const { project, projectIds, initialScore } = await getProjectReviewData(projectId);

  if (!project) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-zinc-800 selection:text-zinc-100">
      {/* Header Bar */}
      <header className="border-b border-zinc-800 bg-zinc-900/60 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-zinc-700 to-zinc-900 border border-zinc-700/80 flex items-center justify-center shadow-inner">
              <Trophy className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <span className="font-bold text-sm text-zinc-100 tracking-tight block">
                Judge Speed Console
              </span>
              <span className="text-[11px] text-zinc-500 font-mono block">
                Sample Hack 2026 • Unit DF-01
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              Ballot Encryption Active
            </span>
          </div>
        </div>
      </header>

      {/* Main Review Workspace */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <JudgeReviewConsole
          project={project}
          projectIds={projectIds}
          initialScore={initialScore}
        />
      </div>
    </main>
  );
}
