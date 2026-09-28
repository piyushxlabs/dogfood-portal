'use client';

// components/VoteGalleryClient.tsx
// Interactive Community Voting Gallery with Fisher-Yates Shuffle & Anti-Bias Voting Modal
// Authoritative specification: TIER 3 (T3 - PUBLIC COMMUNITY & ANTI-ABUSE TIER)

import React, { useState, useEffect } from 'react';
import { ThumbsUp, ShieldCheck, CheckCircle2, AlertCircle, Sparkles, Filter, X } from 'lucide-react';
import type { ProjectCardData } from '@/components/ProjectCard';

interface TrackFilter {
  id: string;
  name: string;
}

/**
 * Pure Fisher-Yates (Knuth) Shuffle algorithm
 * Guarantees uniform random distribution O(n) to eliminate position/primacy bias
 */
function fisherYatesShuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function VoteGalleryClient({
  initialProjects,
  tracks,
}: {
  initialProjects: ProjectCardData[];
  tracks: TrackFilter[];
}) {
  const [projects, setProjects] = useState<ProjectCardData[]>(initialProjects);
  const [selectedTrack, setSelectedTrack] = useState<string>('all');
  const [activeProjectForVote, setActiveProjectForVote] = useState<ProjectCardData | null>(null);
  const [voterEmail, setVoterEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'warning';
    message: string;
  } | null>(null);
  const [votedProjectIds, setVotedProjectIds] = useState<Set<string>>(new Set());

  // Apply Fisher-Yates shuffle on client-side mount
  useEffect(() => {
    setProjects(fisherYatesShuffle(initialProjects));
  }, [initialProjects]);

  const filteredProjects = selectedTrack === 'all'
    ? projects
    : projects.filter((p) => p.track_id === selectedTrack);

  const handleOpenVoteModal = (project: ProjectCardData) => {
    setActiveProjectForVote(project);
    setVoterEmail('');
    setNotification(null);
  };

  const handleCloseModal = () => {
    setActiveProjectForVote(null);
    setVoterEmail('');
  };

  const handleSubmitVote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProjectForVote) return;

    const emailTrimmed = voterEmail.trim().toLowerCase();
    if (!emailTrimmed) {
      setNotification({ type: 'error', message: 'Please enter a valid email address.' });
      return;
    }

    setIsSubmitting(true);
    setNotification(null);

    try {
      const res = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: activeProjectForVote.id,
          voter_email: emailTrimmed,
        }),
      });

      const data = await res.json();

      if (res.status === 201) {
        setNotification({
          type: 'success',
          message: `Vote successfully recorded for "${activeProjectForVote.title}"!`,
        });
        setVotedProjectIds((prev) => new Set(prev).add(activeProjectForVote.id));
        setTimeout(() => {
          handleCloseModal();
        }, 1600);
      } else if (res.status === 409) {
        setNotification({
          type: 'warning',
          message: 'You have already voted for this project with this email address.',
        });
      } else {
        setNotification({
          type: 'error',
          message: data.error || 'Failed to submit vote. Please try again.',
        });
      }
    } catch {
      setNotification({
        type: 'error',
        message: 'Network error communicating with the voting gateway.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      {/* Anti-Bandwagon Fairness Banner */}
      <div className="mb-8 p-4 bg-zinc-900/80 border border-emerald-500/20 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
              Anti-Bandwagon & Position-Bias Protected
              <span className="text-[10px] font-mono uppercase bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                Active
              </span>
            </h4>
            <p className="text-xs text-zinc-400 mt-0.5">
              Projects are randomized via client-side Fisher-Yates shuffle. Live vote counts are concealed until the voting window closes.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{filteredProjects.length} Projects Available</span>
        </div>
      </div>

      {/* Track Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
        <div className="flex items-center gap-1.5 text-xs text-zinc-400 px-2 py-1">
          <Filter className="w-3.5 h-3.5" />
          <span>Tracks:</span>
        </div>
        <button
          onClick={() => setSelectedTrack('all')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
            selectedTrack === 'all'
              ? 'bg-zinc-100 text-zinc-950 shadow-md font-semibold'
              : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
          }`}
        >
          All Tracks ({projects.length})
        </button>
        {tracks.map((t) => {
          const count = projects.filter((p) => p.track_id === t.id).length;
          return (
            <button
              key={t.id}
              onClick={() => setSelectedTrack(t.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                selectedTrack === t.id
                  ? 'bg-zinc-100 text-zinc-950 shadow-md font-semibold'
                  : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
              }`}
            >
              {t.name} ({count})
            </button>
          );
        })}
      </div>

      {/* Randomized Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => {
          const hasVoted = votedProjectIds.has(project.id);
          return (
            <div
              key={project.id}
              id={`vote-card-${project.id}`}
              className="flex flex-col justify-between p-6 bg-zinc-900/90 border border-zinc-800 hover:border-zinc-700 rounded-2xl transition-all duration-200 hover:shadow-xl hover:shadow-zinc-950/70"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700/60">
                    {project.track_name}
                  </span>
                  <span className="text-xs font-mono text-zinc-500 truncate max-w-[120px]">
                    {project.team_name}
                  </span>
                </div>

                <h3 className="text-base font-bold text-zinc-100 mb-2 line-clamp-1">
                  {project.title}
                </h3>

                <p className="text-xs text-zinc-400 line-clamp-3 leading-relaxed mb-4">
                  {project.summary}
                </p>
              </div>

              <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-between">
                <a
                  href={`/projects/${project.id}`}
                  className="text-xs text-zinc-400 hover:text-zinc-100 underline underline-offset-4 transition-colors"
                >
                  View Details & Discussion
                </a>

                <button
                  id={`upvote-btn-${project.id}`}
                  onClick={() => handleOpenVoteModal(project)}
                  disabled={hasVoted}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    hasVoted
                      ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/60 cursor-default'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 active:scale-95'
                  }`}
                >
                  {hasVoted ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Voted</span>
                    </>
                  ) : (
                    <>
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>Upvote</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Upvote Modal */}
      {activeProjectForVote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl relative">
            <button
              onClick={handleCloseModal}
              className="absolute top-5 right-5 text-zinc-400 hover:text-zinc-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-2xl border border-indigo-500/20">
                <ThumbsUp className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-zinc-100">Cast Community Vote</h3>
                <p className="text-xs text-zinc-400">Project: {activeProjectForVote.title}</p>
              </div>
            </div>

            <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
              Enter your email address to confirm your community vote. Each email is strictly limited to 1 vote per project.
            </p>

            {notification && (
              <div
                className={`mb-4 p-3 rounded-xl text-xs flex items-center gap-2 ${
                  notification.type === 'success'
                    ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/60'
                    : notification.type === 'warning'
                    ? 'bg-amber-950/60 text-amber-300 border border-amber-800/60'
                    : 'bg-rose-950/60 text-rose-300 border border-rose-800/60'
                }`}
              >
                {notification.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                )}
                <span>{notification.message}</span>
              </div>
            )}

            <form onSubmit={handleSubmitVote} className="space-y-4">
              <div>
                <label htmlFor="voter-email-input" className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Voter Email Address
                </label>
                <input
                  id="voter-email-input"
                  type="email"
                  required
                  placeholder="voter@example.com"
                  value={voterEmail}
                  onChange={(e) => setVoterEmail(e.target.value)}
                  className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl text-sm text-zinc-100 placeholder:text-zinc-600 outline-none transition-all"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-zinc-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <span>Submitting...</span>
                  ) : (
                    <>
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>Confirm Vote</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
