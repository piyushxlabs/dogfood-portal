// components/GalleryClient.tsx
// Interactive Client Component: instant search, track category filter pills, bento grid layout
// Authoritative specification: SYSTEM_SCOPE_AND_BEHAVIOR.md §3

'use client';

import React, { useState, useMemo } from 'react';
import { Search, X, Layers } from 'lucide-react';
import { ProjectCard, type ProjectCardData } from './ProjectCard';

export interface TrackData {
  id: string;
  name: string;
}

interface GalleryClientProps {
  initialProjects: ProjectCardData[];
  tracks: TrackData[];
}

export function GalleryClient({ initialProjects, tracks }: GalleryClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);

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
        {/* Instant Search Bar */}
        <div className="relative max-w-xl">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects by title, summary, or team..."
            className="w-full pl-10 pr-10 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-500 hover:text-zinc-300"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Track Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <button
            onClick={() => setSelectedTrackId(null)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
              selectedTrackId === null
                ? 'bg-zinc-100 text-zinc-950 shadow-sm'
                : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
            }`}
          >
            All Tracks ({initialProjects.length})
          </button>

          {tracks.map((track) => {
            const isSelected = selectedTrackId === track.id;
            const count = initialProjects.filter((p) => p.track_id === track.id).length;
            return (
              <button
                key={track.id}
                onClick={() => setSelectedTrackId(isSelected ? null : track.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-zinc-100 text-zinc-950 shadow-sm'
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                }`}
              >
                <span>{track.name}</span>
                <span className={`text-[10px] font-mono ${isSelected ? 'text-zinc-600' : 'text-zinc-500'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-zinc-400 pb-2 border-b border-zinc-800/80">
        <span className="font-mono">
          Showing {filteredProjects.length} of {initialProjects.length} submissions
        </span>
        {selectedTrackId && (
          <button
            onClick={() => setSelectedTrackId(null)}
            className="text-zinc-400 hover:text-zinc-200 underline decoration-zinc-600 underline-offset-4"
          >
            Reset track filter
          </button>
        )}
      </div>

      {/* Bento Grid */}
      {filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 p-8 border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/30">
          <Layers className="w-10 h-10 mx-auto text-zinc-600 mb-3" />
          <h4 className="text-base font-semibold text-zinc-300 mb-1">No projects found</h4>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            No projects matched your search criteria. Try modifying your search query or selecting a different track.
          </p>
        </div>
      )}
    </div>
  );
}
