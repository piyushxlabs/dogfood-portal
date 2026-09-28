// components/RubricSlider.tsx
// Interactive rubric slider for evaluating project criteria
// Authoritative specification: JUDGING.md §2 & AGENT_MASTER_PLAN.md Step 10B

'use client';

import React from 'react';

interface RubricSliderProps {
  criterionKey: string;
  title: string;
  weight: number; // e.g. 0.40 for 40%
  value: number;  // 1 to 5, step 0.5
  onChange: (value: number) => void;
  description: string;
}

export function RubricSlider({
  criterionKey,
  title,
  weight,
  value,
  onChange,
  description,
}: RubricSliderProps) {
  const percentage = Math.round(weight * 100);

  const getScoreLabel = (score: number) => {
    if (score >= 4.5) return 'Exceptional';
    if (score >= 4.0) return 'Strong';
    if (score >= 3.0) return 'Adequate / Solid';
    if (score >= 2.0) return 'Needs Work';
    return 'Incomplete';
  };

  return (
    <div
      id={`rubric-container-${criterionKey}`}
      className="p-5 bg-zinc-900/80 border border-zinc-800 rounded-2xl space-y-3.5 transition-all hover:border-zinc-700"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <label
            htmlFor={`slider-${criterionKey}`}
            className="text-sm font-semibold text-zinc-100 tracking-tight"
          >
            {title}
          </label>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-zinc-800 text-zinc-400 border border-zinc-700/60">
            {percentage}% Weight
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span
            id={`score-label-${criterionKey}`}
            className="text-xs text-zinc-500 font-medium"
          >
            {getScoreLabel(value)}
          </span>
          <span
            id={`score-badge-${criterionKey}`}
            className="px-2.5 py-1 rounded-lg text-sm font-bold font-mono bg-zinc-800 text-zinc-100 border border-zinc-700 shadow-inner"
          >
            {value.toFixed(1)}
          </span>
        </div>
      </div>

      <p className="text-xs text-zinc-400 leading-relaxed">{description}</p>

      {/* Slider Control */}
      <div className="space-y-2 pt-1">
        <input
          id={`slider-${criterionKey}`}
          type="range"
          min="1"
          max="5"
          step="0.5"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-500 transition"
        />

        {/* Step Ticks & Presets */}
        <div className="flex justify-between text-[10px] font-mono text-zinc-500 px-0.5">
          {[1, 2, 3, 4, 5].map((step) => (
            <button
              key={step}
              type="button"
              onClick={() => onChange(step)}
              className={`hover:text-zinc-200 transition ${
                value === step ? 'text-zinc-100 font-bold' : ''
              }`}
            >
              {step}.0
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
