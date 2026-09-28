// components/NormalizedLeaderboard.tsx
// Auto-refreshing calibrated leaderboard table with RankDeltaBadge & CSV export
// Authoritative specification: JUDGING.md §3 & AGENT_MASTER_PLAN.md Step 10C

'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Download, RefreshCw, Trophy, Search, Sparkles } from 'lucide-react';
import { RankDeltaBadge } from './RankDeltaBadge';
import type { LeaderboardRow } from '@/lib/normalization';

interface NormalizedLeaderboardProps {
  initialLeaderboard: LeaderboardRow[];
}

export function NormalizedLeaderboard({ initialLeaderboard }: NormalizedLeaderboardProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardRow[]>(initialLeaderboard);
  const [search, setSearch] = useState('');
  const [selectedTrack, setSelectedTrack] = useState('ALL');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<string>('Just now');

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      handleRefresh();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Re-fetch calibrated leaderboard from real organizer API
      const res = await fetch('/api/organizer/leaderboard');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.leaderboard) && data.leaderboard.length > 0) {
          setLeaderboard(data.leaderboard);
        }
        setLastRefreshed(new Date().toLocaleTimeString());
      } else {
        // Fallback if accessed in demo mode without organizer cookie
        const fallbackRes = await fetch('/api/projects');
        if (fallbackRes.ok) {
          setLastRefreshed(new Date().toLocaleTimeString());
        }
      }
    } catch (err) {
      console.warn('[LEADERBOARD] Auto-refresh fetch failed:', err);
    } finally {
      setTimeout(() => setIsRefreshing(false), 400);
    }
  };

  const tracks = useMemo(() => {
    const set = new Set(initialLeaderboard.map((r) => r.track_name));
    return ['ALL', ...Array.from(set)];
  }, [initialLeaderboard]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return leaderboard.filter((r) => {
      const matchesSearch =
        !q ||
        r.project_title.toLowerCase().includes(q) ||
        r.project_id.toLowerCase().includes(q) ||
        r.team_name.toLowerCase().includes(q);

      const matchesTrack = selectedTrack === 'ALL' || r.track_name === selectedTrack;
      return matchesSearch && matchesTrack;
    });
  }, [leaderboard, search, selectedTrack]);

  return (
    <div
      id="normalized-leaderboard"
      className="p-6 bg-zinc-900/60 border border-zinc-800 rounded-3xl space-y-5 backdrop-blur-sm shadow-xl"
    >
      {/* Leaderboard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-bold text-zinc-100 tracking-tight">
              Calibrated Final Standings
            </h3>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">
            Z-score adjusted rankings with rank delta tracking • Auto-refreshes every 30s
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            id="refresh-leaderboard-button"
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-xs font-mono text-zinc-400 hover:text-zinc-200 transition flex items-center gap-1.5"
            title="Refresh leaderboard"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
            <span>{lastRefreshed}</span>
          </button>

          <a
            id="export-csv-button"
            href="/api/export.csv"
            download="dogfood_results_export.csv"
            className="px-4 py-2 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-bold transition flex items-center gap-2 shadow-lg hover:shadow-zinc-200/10 active:scale-[0.99]"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </a>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:max-w-xs">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-zinc-500 pointer-events-none" />
          <input
            id="leaderboard-search-input"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search project, team, ID..."
            className="w-full pl-9 pr-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-700 transition"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            id="leaderboard-track-select"
            value={selectedTrack}
            onChange={(e) => setSelectedTrack(e.target.value)}
            className="px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-300 focus:outline-none focus:border-zinc-700"
          >
            {tracks.map((t) => (
              <option key={t} value={t}>
                {t === 'ALL' ? 'All Category Tracks' : t}
              </option>
            ))}
          </select>

          <span className="text-xs font-mono text-zinc-500 whitespace-nowrap">
            {filtered.length} Projects
          </span>
        </div>
      </div>

      {/* Standings Table */}
      <div className="overflow-x-auto rounded-2xl border border-zinc-800/80 bg-zinc-950/60 max-h-[500px]">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-zinc-900/80 text-zinc-400 text-[11px] uppercase tracking-wider sticky top-0 border-b border-zinc-800">
            <tr>
              <th className="py-3 px-4 font-semibold">Rank</th>
              <th className="py-3 px-4 font-semibold">Project</th>
              <th className="py-3 px-4 font-semibold">Track</th>
              <th className="py-3 px-4 font-semibold">Team</th>
              <th className="py-3 px-4 font-semibold text-center">Reviews</th>
              <th className="py-3 px-4 font-semibold text-right">Raw Avg</th>
              <th className="py-3 px-4 font-semibold text-right">Calibrated (1-5)</th>
              <th className="py-3 px-4 font-semibold text-center">Shift (Δ)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60 font-mono">
            {filtered.map((row) => {
              const isTop3 = row.rank <= 3;
              const rankColor =
                row.rank === 1
                  ? 'text-amber-400'
                  : row.rank === 2
                  ? 'text-zinc-300'
                  : row.rank === 3
                  ? 'text-amber-600'
                  : 'text-zinc-500';

              return (
                <tr key={row.project_id} className="hover:bg-zinc-900/40 transition">
                  <td className="py-3 px-4 font-bold">
                    <span className={`inline-flex items-center gap-1.5 ${rankColor}`}>
                      {isTop3 && <span>★</span>}
                      <span>#{row.rank}</span>
                    </span>
                  </td>
                  <td className="py-3 px-4 font-sans font-bold text-zinc-100">
                    <div>{row.project_title}</div>
                    <div className="text-[10px] font-mono text-zinc-500 font-normal">
                      {row.project_id}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-zinc-900 text-zinc-300 border border-zinc-800 font-sans">
                      {row.track_name}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-zinc-400 font-sans">{row.team_name}</td>
                  <td className="py-3 px-4 text-center text-zinc-400">{row.reviews_count}</td>
                  <td className="py-3 px-4 text-right text-zinc-400">{row.raw_average_score.toFixed(2)}</td>
                  <td className="py-3 px-4 text-right">
                    <span className="px-2 py-0.5 rounded-lg bg-zinc-900 text-emerald-400 font-bold border border-emerald-500/20 shadow-inner">
                      {row.normalized_score.toFixed(2)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <RankDeltaBadge delta={row.rank_delta} id={`delta-${row.project_id}`} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
