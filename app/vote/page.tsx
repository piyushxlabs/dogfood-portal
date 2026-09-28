// app/vote/page.tsx
// Public Community Voting Gallery (React Server Component)
// Authoritative specification: TIER 3 (T3 - PUBLIC COMMUNITY & ANTI-ABUSE TIER)

import React from 'react';
import fs from 'node:fs/promises';
import path from 'node:path';
import sql from '@/lib/db';
import { VoteGalleryClient } from '@/components/VoteGalleryClient';
import type { ProjectCardData } from '@/components/ProjectCard';
import { HeartHandshake, ShieldCheck } from 'lucide-react';

export const metadata = {
  title: 'Community Voting | Dogfood 2026',
  description: 'Vote for your favorite hackathon submissions with anti-bias randomized ordering.',
};

async function loadFallbackData(): Promise<{ projects: ProjectCardData[]; tracks: { id: string; name: string }[] }> {
  try {
    const fixturePaths = [
      process.env.FIXTURES_PATH,
      path.resolve(process.cwd(), 'fixtures.json'),
      path.resolve(process.cwd(), 'docs', 'fixtures.json'),
      '/app/fixtures.json',
    ].filter((p): p is string => Boolean(p));

    let raw = '';
    for (const p of fixturePaths) {
      try {
        raw = await fs.readFile(p, 'utf8');
        break;
      } catch {
        // try next candidate path
      }
    }
    if (!raw) return { projects: [], tracks: [] };

    const data = JSON.parse(raw);
    const trackMap = new Map<string, string>();
    const tracks = (data.tracks || []).map((t: { id: string; name: string }) => {
      trackMap.set(t.id, t.name);
      return { id: t.id, name: t.name };
    });

    const teamMap = new Map<string, string>();
    (data.teams || []).forEach((tm: { id: string; name: string }) => {
      teamMap.set(tm.id, tm.name);
    });

    const projects: ProjectCardData[] = (data.projects || []).map(
      (p: {
        id: string;
        title: string;
        summary: string;
        track: string;
        team: string;
        repo_url: string;
        submitted_at: string;
      }) => ({
        id: p.id,
        title: p.title,
        summary: p.summary,
        track_id: p.track,
        track_name: trackMap.get(p.track) || 'General',
        team_name: teamMap.get(p.team) || p.team,
        repo_url: p.repo_url,
        submitted_at: p.submitted_at,
      })
    );

    return { projects, tracks };
  } catch (e) {
    console.warn('[VOTE] Could not read fallback fixtures:', e);
    return { projects: [], tracks: [] };
  }
}

async function getVotePageData(): Promise<{ projects: ProjectCardData[]; tracks: { id: string; name: string }[] }> {
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
      LEFT JOIN tracks t ON p.track_id = t.id
      LEFT JOIN teams tm ON p.team_id = tm.id
      WHERE p.is_draft = FALSE
      ORDER BY p.id ASC;
    `;

    const dbTracks = await sql<{ id: string; name: string }[]>`
      SELECT id, name FROM tracks ORDER BY id ASC;
    `;

    if (!dbProjects || dbProjects.length === 0) {
      return loadFallbackData();
    }

    const projects: ProjectCardData[] = dbProjects.map((p) => ({
      id: p.id,
      title: p.title,
      summary: p.summary,
      track_id: p.track_id,
      track_name: p.track_name || 'General',
      team_name: p.team_name || 'Independent',
      repo_url: p.repo_url,
      submitted_at: typeof p.submitted_at === 'string' ? p.submitted_at : p.submitted_at.toISOString(),
    }));

    return { projects, tracks: dbTracks };
  } catch (e) {
    console.warn('[VOTE] DB read failed, using fixtures fallback:', e);
    return loadFallbackData();
  }
}

export default async function VotePage() {
  const { projects, tracks } = await getVotePageData();

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-mono mb-4">
            <HeartHandshake className="w-3.5 h-3.5" />
            <span>Community Choice Award — Tier 3 Extension</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-3">
            Public Community Voting
          </h1>
          <p className="text-zinc-400 text-sm sm:text-base max-w-3xl leading-relaxed">
            Support the most creative projects built during Sample Hack 2026. Every verified voter is granted 1 vote per project. Ordering is randomized for every session to eliminate position bias.
          </p>
        </header>

        {/* Voting Gallery Client with Fisher-Yates and Anti-Bandwagon protections */}
        <VoteGalleryClient initialProjects={projects} tracks={tracks} />
      </div>
    </div>
  );
}
