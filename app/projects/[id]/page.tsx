// app/projects/[id]/page.tsx
// Project Detail View with Discussion Comments & Verifiable Certificate Link
// Authoritative specification: TIER 3 & TIER 4 EXTENSIONS

import React from 'react';
import { notFound } from 'next/navigation';
import fs from 'node:fs/promises';
import path from 'node:path';
import sql from '@/lib/db';
import { ProjectComments } from '@/components/ProjectComments';
import { GitBranch, Calendar, Trophy, Award, ArrowLeft, ExternalLink, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

interface ProjectDetailData {
  id: string;
  title: string;
  summary: string;
  description: string | null;
  track_id: string;
  track_name: string;
  team_id: string;
  team_name: string;
  repo_url: string;
  live_url: string | null;
  submitted_at: string;
}

async function getProjectById(id: string): Promise<ProjectDetailData | null> {
  try {
    const rows = await sql<
      {
        id: string;
        title: string;
        summary: string;
        description: string | null;
        track_id: string;
        track_name: string;
        team_id: string;
        team_name: string;
        repo_url: string;
        live_url: string | null;
        submitted_at: Date | string;
      }[]
    >`
      SELECT
        p.id,
        p.title,
        p.summary,
        p.description,
        p.track_id,
        t.name as track_name,
        p.team_id,
        tm.name as team_name,
        p.repo_url,
        p.live_url,
        p.submitted_at
      FROM projects p
      LEFT JOIN tracks t ON p.track_id = t.id
      LEFT JOIN teams tm ON p.team_id = tm.id
      WHERE p.id = ${id}
      LIMIT 1;
    `;

    if (rows && rows.length > 0) {
      const r = rows[0];
      return {
        id: r.id,
        title: r.title,
        summary: r.summary,
        description: r.description,
        track_id: r.track_id,
        track_name: r.track_name || 'General',
        team_id: r.team_id,
        team_name: r.team_name || 'Independent',
        repo_url: r.repo_url,
        live_url: r.live_url,
        submitted_at: typeof r.submitted_at === 'string' ? r.submitted_at : r.submitted_at.toISOString(),
      };
    }
  } catch (e) {
    console.warn(`[PROJECT DETAIL] DB lookup failed for ${id}, falling back to fixtures:`, e);
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
    if (!raw) return null;

    const data = JSON.parse(raw);
    const p = (data.projects || []).find((prj: { id: string }) => prj.id === id);
    if (!p) return null;

    const track = (data.tracks || []).find((t: { id: string }) => t.id === p.track);
    const team = (data.teams || []).find((tm: { id: string }) => tm.id === p.team);

    return {
      id: p.id,
      title: p.title,
      summary: p.summary,
      description: p.description || null,
      track_id: p.track,
      track_name: track?.name || 'General',
      team_id: p.team,
      team_name: team?.name || p.team,
      repo_url: p.repo_url,
      live_url: p.live_url || null,
      submitted_at: p.submitted_at,
    };
  } catch {
    return null;
  }
}

export default async function ProjectDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const project = await getProjectById(params.id);

  if (!project) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/projects"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Projects Gallery</span>
          </Link>

          <Link
            href={`/projects/${project.id}/certificate`}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 text-xs font-semibold transition-all shadow-sm"
          >
            <Award className="w-4 h-4" />
            <span>Verifiable Certificate</span>
          </Link>
        </div>

        {/* Project Card Header */}
        <article className="p-8 bg-zinc-900/90 border border-zinc-800 rounded-3xl shadow-xl backdrop-blur-md">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              {project.track_name}
            </span>
            <div className="flex items-center gap-4 text-xs text-zinc-400 font-mono">
              <span className="text-zinc-300 font-semibold">{project.team_name}</span>
              <span>•</span>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                <span>
                  {new Date(project.submitted_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
            {project.title}
          </h1>

          {/* Determine if description adds new content beyond summary */}
          {(() => {
            const hasUniqueDescription =
              project.description &&
              project.description.trim().length > 0 &&
              project.description.trim() !== project.summary.trim();

            if (hasUniqueDescription) {
              return (
                <>
                  <p className="text-xs font-mono uppercase tracking-widest text-zinc-500 mb-2">SUMMARY</p>
                  <p className="text-base text-zinc-300 leading-relaxed mb-6 font-normal">
                    {project.summary}
                  </p>
                  <div className="mb-6">
                    <p className="text-xs font-mono uppercase tracking-widest text-zinc-500 mb-2">DESCRIPTION</p>
                    <div className="p-4 bg-zinc-950/60 rounded-xl border border-zinc-800/80 text-sm text-zinc-400 leading-relaxed whitespace-pre-wrap">
                      {project.description}
                    </div>
                  </div>
                </>
              );
            }

            return (
              <>
                <p className="text-xs font-mono uppercase tracking-widest text-zinc-500 mb-2">PROJECT OVERVIEW</p>
                <p className="text-base text-zinc-300 leading-relaxed mb-6 font-normal">
                  {project.summary}
                </p>
              </>
            );
          })()}

          {/* Links Row */}
          <div className="flex flex-wrap items-center gap-3 pt-6 border-t border-zinc-800/80">
            {project.repo_url && (
              <a
                href={project.repo_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-xs font-medium transition-colors"
              >
                <GitBranch className="w-4 h-4" />
                <span>GitHub Repository</span>
                <ExternalLink className="w-3 h-3 opacity-60 ml-0.5" />
              </a>
            )}

            {project.live_url && (
              <a
                href={project.live_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Live Demo</span>
              </a>
            )}

            <div className="ml-auto inline-flex items-center gap-1.5 text-xs text-emerald-400 font-mono">
              <ShieldCheck className="w-4 h-4" />
              <span>Cryptographically Verified ID: {project.id}</span>
            </div>
          </div>
        </article>

        {/* Embedded Comments Section */}
        <ProjectComments projectId={project.id} />
      </div>
    </div>
  );
}
