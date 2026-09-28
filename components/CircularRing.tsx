// components/CircularRing.tsx
// Responsive SVG Circular Progress Ring for Track Evaluation Status
// Authoritative specification: ARCHITECTURE.md §7 & AGENT_MASTER_PLAN.md Step 10C

import React from 'react';

interface CircularRingProps {
  trackId: string;
  trackName: string;
  reviewedCount: number;
  totalRequired: number;
  strokeColor?: string;
}

export function CircularRing({
  trackId,
  trackName,
  reviewedCount,
  totalRequired,
  strokeColor = '#10b981', // emerald-500
}: CircularRingProps) {
  const percentage =
    totalRequired > 0 ? Math.min(100, Math.round((reviewedCount / totalRequired) * 100)) : 100;

  const radius = 34;
  const strokeWidth = 6;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div
      id={`circular-ring-${trackId}`}
      className="p-4 bg-zinc-900/70 border border-zinc-800 rounded-2xl flex flex-col items-center justify-between space-y-3 hover:border-zinc-700 transition"
    >
      <span className="text-xs font-semibold text-zinc-300 tracking-tight text-center truncate max-w-[130px]" title={trackName}>
        {trackName}
      </span>

      {/* SVG Ring Container */}
      <div className="relative w-20 h-20 flex items-center justify-center">
        <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 80 80">
          {/* Background circle */}
          <circle
            cx="40"
            cy="40"
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-zinc-800"
            fill="transparent"
          />
          {/* Progress circle */}
          <circle
            cx="40"
            cy="40"
            r={radius}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-500 ease-out"
          />
        </svg>

        {/* Center Percentage Readout */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-xs font-bold font-mono text-zinc-100">{percentage}%</span>
        </div>
      </div>

      <div className="text-[11px] font-mono text-zinc-500 text-center">
        <strong className="text-zinc-300">{reviewedCount}</strong> / {totalRequired} ballots
      </div>
    </div>
  );
}
