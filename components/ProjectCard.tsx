// components/ProjectCard.tsx
// Bento-grid project card with hover lift animation and track badge
// Authoritative specification: SYSTEM_SCOPE_AND_BEHAVIOR.md §3

import React from 'react';
import { ExternalLink, GitBranch, Calendar } from 'lucide-react';

export interface ProjectCardData {
  id: string;
  title: string;
  summary: string;
  track_name: string;
  track_id: string;
  team_name: string;
  repo_url: string;
  submitted_at: string;
  video_url?: string | null;
}

const TRACK_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  trk_01: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
  trk_02: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
  trk_03: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' },
  trk_04: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20' },
  trk_05: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
  trk_06: { bg: 'bg-teal-500/10', text: 'text-teal-400', border: 'border-teal-500/20' },
  trk_07: { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/20' },
  trk_08: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20' },
};

export function ProjectCard({ project }: { project: ProjectCardData }) {
  const trackStyle = TRACK_COLORS[project.track_id] || {
    bg: 'bg-zinc-800',
    text: 'text-zinc-300',
    border: 'border-zinc-700',
  };

  const formattedDate = project.submitted_at
    ? new Date(project.submitted_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Submitted';

  return (
    <article
      data-project-id={project.id}
      className="group relative flex flex-col justify-between p-6 bg-zinc-900 border border-zinc-800 rounded-xl transition-all duration-200 ease-out hover:border-zinc-700 hover:-translate-y-1 hover:shadow-xl hover:shadow-zinc-950/60"
    >
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${trackStyle.bg} ${trackStyle.text} ${trackStyle.border}`}
          >
            {project.track_name}
          </span>
          <span className="text-xs font-mono text-zinc-500">{project.team_name}</span>
        </div>

        <h3 className="text-lg font-bold tracking-tight text-zinc-100 group-hover:text-white transition-colors mb-2">
          {project.title}
        </h3>

        <p className="text-sm text-zinc-400 line-clamp-3 leading-relaxed mb-4">
          {project.summary}
        </p>
      </div>

      <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-500">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-zinc-500" />
          <span>{formattedDate}</span>
        </div>

        {project.repo_url && (
          <a
            href={project.repo_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-zinc-400 hover:text-zinc-100 transition-colors"
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>Repository</span>
            <ExternalLink className="w-3 h-3 ml-0.5 opacity-60" />
          </a>
        )}
      </div>
    </article>
  );
}
