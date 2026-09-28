// components/TrackFilterPills.tsx
// Category filter pills component for Public Gallery
// Authoritative specification: AGENT_MASTER_PLAN.md Step 10A

'use client';

import React from 'react';

export interface TrackItem {
  id: string;
  name: string;
}

interface TrackFilterPillsProps {
  tracks: TrackItem[];
  selectedTrackId: string | null;
  onSelectTrack: (trackId: string | null) => void;
  projectCounts?: Record<string, number>;
  totalCount: number;
}

export function TrackFilterPills({
  tracks,
  selectedTrackId,
  onSelectTrack,
  projectCounts = {},
  totalCount,
}: TrackFilterPillsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 pt-1" role="tablist" aria-label="Filter by track">
      <button
        id="track-pill-all"
        type="button"
        role="tab"
        aria-selected={selectedTrackId === null}
        onClick={() => onSelectTrack(null)}
        className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
          selectedTrackId === null
            ? 'bg-zinc-100 text-zinc-950 shadow-sm font-semibold'
            : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
        }`}
      >
        All Tracks ({totalCount})
      </button>

      {tracks.map((track) => {
        const isSelected = selectedTrackId === track.id;
        const count = projectCounts[track.id] ?? 0;
        return (
          <button
            key={track.id}
            id={`track-pill-${track.id}`}
            type="button"
            role="tab"
            aria-selected={isSelected}
            onClick={() => onSelectTrack(isSelected ? null : track.id)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
              isSelected
                ? 'bg-zinc-100 text-zinc-950 shadow-sm font-semibold'
                : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
            }`}
          >
            <span>{track.name}</span>
            <span
              className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                isSelected ? 'bg-zinc-300 text-zinc-900 font-bold' : 'bg-zinc-800 text-zinc-400'
              }`}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
