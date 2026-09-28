// components/GalleryClient.tsx
// Interactive Client Component: instant search, track category filter pills, bento grid layout
// Authoritative specification: SYSTEM_SCOPE_AND_BEHAVIOR.md §3 & AGENT_MASTER_PLAN.md Step 10A

'use client';

import React, { useState, useMemo } from 'react';
import { Layers } from 'lucide-react';
import { SearchBar } from './SearchBar';
import { TrackFilterPills, type TrackItem } from './TrackFilterPills';
import { BentoGrid } from './BentoGrid';
import { ProjectCard, type ProjectCardData } from './ProjectCard';

export type TrackData = TrackItem;

interface GalleryClientProps {
  initialProjects: ProjectCardData[];
  tracks: TrackData[];
}

export function GalleryClient({ initialProjects, tracks }: GalleryClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);

  // Compute counts per track
  const projectCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of initialProjects) {
      counts[p.track_id] = (counts[p.track_id] || 0) + 1;
    }
    return counts;
  }, [initialProjects]);

  // Client-side instant filtering
  const filteredProjects = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return initialProjects.filter((p) => {
      const matchesTrack = !selectedTrackId || p.track_id === selectedTrackId;
      const matchesQuery =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.summary.toLowerCase().includes(q) ||
        p.team_name.toLowerCase().includes(q);
      return matchesTrack && matchesQuery;
    });
  }, [initialProjects, searchQuery, selectedTrackId]);

  return (
    <div className="space-y-8">
      {/* Controls Container: Search & Track Filter Pills */}
      <div className="space-y-4">
        <SearchBar
          id="gallery-search-input"
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search projects by title, summary, or team..."
        />

        <TrackFilterPills
          tracks={tracks}
          selectedTrackId={selectedTrackId}
          onSelectTrack={setSelectedTrackId}
          projectCounts={projectCounts}
          totalCount={initialProjects.length}
        />
      </div>

      {/* Results Header Counter */}
      <div className="flex items-center justify-between text-xs text-zinc-400 border-b border-zinc-800/60 pb-3">
        <span>
          Showing <strong className="text-zinc-200">{filteredProjects.length}</strong> of{' '}
          {initialProjects.length} projects
        </span>
        {(searchQuery || selectedTrackId) && (
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedTrackId(null);
            }}
            className="text-zinc-400 hover:text-zinc-200 underline transition"
          >
            Reset filters
          </button>
        )}
      </div>

      {/* Bento Grid Gallery */}
      {filteredProjects.length > 0 ? (
        <BentoGrid id="projects-bento-grid">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </BentoGrid>
      ) : (
        <div className="p-12 text-center rounded-2xl bg-zinc-900/50 border border-zinc-800 space-y-3">
          <Layers className="w-8 h-8 text-zinc-600 mx-auto" />
          <h3 className="text-base font-medium text-zinc-300">No projects found</h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            No projects matched your search criteria. Try a different query or reset category filters.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedTrackId(null);
            }}
            className="px-4 py-2 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg transition"
          >
            Clear Search & Filters
          </button>
        </div>
      )}
    </div>
  );
}
