// components/RankDeltaBadge.tsx
// Visual rank movement badge displaying rank shifts post-calibration
// Authoritative specification: JUDGING.md §3.2 & AGENT_MASTER_PLAN.md Step 10C

import React from 'react';

interface RankDeltaBadgeProps {
  delta: number;
  className?: string;
  id?: string;
}

export function RankDeltaBadge({ delta, className = '', id }: RankDeltaBadgeProps) {
  if (delta > 0) {
    return (
      <span
        id={id}
        className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm ${className}`}
        title={`Climbed ${delta} rank positions post-calibration`}
      >
        <span>▲</span>
        <span>+{delta}</span>
      </span>
    );
  }

  if (delta < 0) {
    return (
      <span
        id={id}
        className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 shadow-sm ${className}`}
        title={`Adjusted ${Math.abs(delta)} rank positions lower`}
      >
        <span>▼</span>
        <span>{delta}</span>
      </span>
    );
  }

  return (
    <span
      id={id}
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-mono font-medium bg-zinc-800/80 text-zinc-500 border border-zinc-700/50 ${className}`}
      title="Rank unchanged post-calibration"
    >
      <span>—</span>
    </span>
  );
}
