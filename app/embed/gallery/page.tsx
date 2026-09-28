// app/embed/gallery/page.tsx
// Standalone Responsive Embeddable Widget for Sponsor & Partner Portals
// Authoritative specification: TIER 4 (T4 - PLATFORM APIS & EXTENSIONS)

import React from 'react';
import fs from 'node:fs/promises';
import path from 'node:path';
import sql from '@/lib/db';
import { ExternalLink, GitBranch, Trophy } from 'lucide-react';

interface EmbedProject {
  id: string;
  title: string;
  summary: string;
  track_name: string;
  team_name: string;
  repo_url: string;
  live_url: string | null;
}

interface EmbedDbRow {
  id: string;
  title: string;
  summary: string;
  track_name: string;
  team_name: string;
  repo_url: string;
  live_url: string | null;
}

interface FixtureProject {
  id: string;
  title: string;
  summary: string;
  track: string;
  team: string;
  repo_url: string;
  live_url?: string | null;
  is_draft?: boolean;
}

async function getEmbedProjects(trackFilter?: string, limitCount = 12): Promise<EmbedProject[]> {
  try {
    let query = sql`
      SELECT
        p.id,
        p.title,
        p.summary,
        t.name as track_name,
        tm.name as team_name,
        p.repo_url,
        p.live_url
      FROM projects p
      LEFT JOIN tracks t ON p.track_id = t.id
      LEFT JOIN teams tm ON p.team_id = tm.id
      WHERE p.is_draft = FALSE
    `;

    if (trackFilter) {
      query = sql`${query} AND (t.id = ${trackFilter} OR LOWER(t.name) = LOWER(${trackFilter}))`;
    }

    query = sql`${query} ORDER BY p.id ASC LIMIT ${limitCount};`;

    const rows = (await query) as unknown as EmbedDbRow[];
    if (rows && rows.length > 0) {
      return rows.map((r: EmbedDbRow) => ({
        id: r.id,
        title: r.title,
        summary: r.summary,
        track_name: r.track_name || 'General',
        team_name: r.team_name || 'Independent',
        repo_url: r.repo_url,
        live_url: r.live_url,
      }));
    }
  } catch (e) {
    console.warn('[EMBED] DB read failed, using fixtures fallback:', e);
  }

  // Fallback to fixtures.json
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
        // try next
      }
    }
    if (!raw) return [];

    const data = JSON.parse(raw);
    const trackMap = new Map<string, string>();
    (data.tracks || []).forEach((t: { id: string; name: string }) => trackMap.set(t.id, t.name));

    const teamMap = new Map<string, string>();
    (data.teams || []).forEach((tm: { id: string; name: string }) => teamMap.set(tm.id, tm.name));

    let prjs: FixtureProject[] = (data.projects || []).filter((p: FixtureProject) => !p.is_draft);
    if (trackFilter) {
      prjs = prjs.filter((p: FixtureProject) => p.track === trackFilter);
    }

    return prjs.slice(0, limitCount).map((p: FixtureProject) => ({
      id: p.id,
      title: p.title,
      summary: p.summary,
      track_name: trackMap.get(p.track) || 'General',
      team_name: teamMap.get(p.team) || p.team,
      repo_url: p.repo_url,
      live_url: p.live_url || null,
    }));
  } catch {
    return [];
  }
}

export default async function EmbedGalleryPage({
  searchParams,
}: {
  searchParams: Promise<{ track?: string; limit?: string }>;
}) {
  const params = await searchParams;
  const limit = Math.min(Math.max(1, parseInt(params.limit || '12', 10) || 12), 40);
  const projects = await getEmbedProjects(params.track, limit);

  return (
    <div className="bg-zinc-950 text-zinc-100 p-4 font-sans min-h-screen">
      {/* Mini Widget Header */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
            <Trophy className="w-3.5 h-3.5" />
          </div>
          <div>
            <h1 className="text-xs font-bold text-zinc-100">Sample Hack 2026 Showcase</h1>
            <p className="text-[10px] text-zinc-500 font-mono">Dogfood 2026 Portal Embed Widget</p>
          </div>
        </div>

        <a
          href="/projects"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[11px] font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
        >
          <span>Full Gallery</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {projects.map((project) => (
          <div
            key={project.id}
            className="p-3.5 bg-zinc-900/90 border border-zinc-800/80 rounded-xl hover:border-zinc-700 transition-all flex flex-col justify-between text-left"
          >
            <div>
              <div className="flex items-center justify-between gap-1 mb-1.5">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300">
                  {project.track_name}
                </span>
                <span className="text-[10px] font-mono text-zinc-500 truncate max-w-[100px]">
                  {project.team_name}
                </span>
              </div>

              <h2 className="text-xs font-bold text-zinc-100 mb-1 line-clamp-1 hover:text-indigo-400 transition-colors">
                <a href={`/projects/${project.id}`} target="_blank" rel="noopener noreferrer">
                  {project.title}
                </a>
              </h2>

              <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed mb-3">
                {project.summary}
              </p>
            </div>

            <div className="pt-2 border-t border-zinc-800/60 flex items-center justify-between text-[10px] text-zinc-500">
              <a
                href={`/projects/${project.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-400 hover:underline"
              >
                Inspect Project →
              </a>

              {project.repo_url && (
                <a
                  href={project.repo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-zinc-400 hover:text-zinc-200"
                >
                  <GitBranch className="w-3 h-3" />
                  <span>Code</span>
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
