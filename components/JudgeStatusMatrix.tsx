// components/JudgeStatusMatrix.tsx
// Table showing the progress of 30 judges across assigned tracks
// Authoritative specification: ARCHITECTURE.md §2 & AGENT_MASTER_PLAN.md Step 10C

'use client';

import React, { useState, useMemo } from 'react';
import { Search, CheckCircle2, Clock, AlertCircle, Users } from 'lucide-react';

export interface JudgeStatusItem {
  id: string;
  name: string;
  tracks: string[];
  completedReviews: number;
  totalAssigned: number;
  status: 'COMPLETE' | 'PENDING' | 'NOT_STARTED';
}

interface JudgeStatusMatrixProps {
  judges: JudgeStatusItem[];
}

export function JudgeStatusMatrix({ judges }: JudgeStatusMatrixProps) {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const filteredJudges = useMemo(() => {
    const q = search.toLowerCase().trim();
    return judges.filter((j) => {
      const matchesSearch =
        !q ||
        j.id.toLowerCase().includes(q) ||
        j.name.toLowerCase().includes(q) ||
        j.tracks.some((t) => t.toLowerCase().includes(q));

      const matchesStatus = filterStatus === 'ALL' || j.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [judges, search, filterStatus]);

  const completeCount = judges.filter((j) => j.status === 'COMPLETE').length;
  const pendingCount = judges.filter((j) => j.status === 'PENDING').length;
  const notStartedCount = judges.filter((j) => j.status === 'NOT_STARTED').length;

  return (
    <div
      id="judge-status-matrix"
      className="p-6 bg-zinc-900/60 border border-zinc-800 rounded-3xl space-y-5 backdrop-blur-sm"
    >
      {/* Matrix Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-zinc-400" />
            <h3 className="text-lg font-bold text-zinc-100 tracking-tight">
              Evaluator Status Matrix (30 Judges)
            </h3>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">
            Real-time track-affinity review progress across disjoint panels
          </p>
        </div>

        {/* Quick summary chips */}
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            {completeCount} Complete
          </span>
          <span className="px-2.5 py-1 rounded-full text-xs font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20">
            {pendingCount} Pending
          </span>
          {notStartedCount > 0 && (
            <span className="px-2.5 py-1 rounded-full text-xs font-mono bg-zinc-800 text-zinc-400 border border-zinc-700">
              {notStartedCount} Inactive
            </span>
          )}
        </div>
      </div>

      {/* Filter Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:max-w-xs">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-zinc-500 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search judge by name, ID, track..."
            className="w-full pl-9 pr-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-700 transition"
          />
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto text-xs">
          {['ALL', 'COMPLETE', 'PENDING', 'NOT_STARTED'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setFilterStatus(st)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition ${
                filterStatus === st
                  ? 'bg-zinc-100 text-zinc-950 font-bold'
                  : 'bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto rounded-2xl border border-zinc-800/80 bg-zinc-950/60 max-h-96">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-zinc-900/80 text-zinc-400 text-[11px] uppercase tracking-wider sticky top-0 border-b border-zinc-800">
            <tr>
              <th className="py-3 px-4 font-semibold">Judge</th>
              <th className="py-3 px-4 font-semibold">Assigned Tracks</th>
              <th className="py-3 px-4 font-semibold">Progress</th>
              <th className="py-3 px-4 font-semibold text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60 font-mono">
            {filteredJudges.map((j) => {
              const pct =
                j.totalAssigned > 0
                  ? Math.round((j.completedReviews / j.totalAssigned) * 100)
                  : 0;

              return (
                <tr key={j.id} className="hover:bg-zinc-900/40 transition">
                  <td className="py-2.5 px-4 font-semibold text-zinc-200">
                    <div>{j.name}</div>
                    <div className="text-[10px] text-zinc-500">{j.id}</div>
                  </td>
                  <td className="py-2.5 px-4">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {j.tracks.map((t) => (
                        <span
                          key={t}
                          className="px-2 py-0.5 rounded text-[10px] bg-zinc-900 text-zinc-400 border border-zinc-800"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-2.5 px-4">
                    <div className="space-y-1 max-w-[140px]">
                      <div className="flex justify-between text-[10px] text-zinc-400">
                        <span>{j.completedReviews}/{j.totalAssigned}</span>
                        <span>{pct}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            pct === 100 ? 'bg-emerald-400' : 'bg-amber-400'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-2.5 px-4 text-right">
                    {j.status === 'COMPLETE' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" />
                        COMPLETE
                      </span>
                    )}
                    {j.status === 'PENDING' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        <Clock className="w-3 h-3" />
                        PENDING
                      </span>
                    )}
                    {j.status === 'NOT_STARTED' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-800 text-zinc-400 border border-zinc-700">
                        <AlertCircle className="w-3 h-3" />
                        NOT STARTED
                      </span>
                    )}
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
