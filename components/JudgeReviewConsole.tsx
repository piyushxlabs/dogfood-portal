// components/JudgeReviewConsole.tsx
// Split-screen Speed Console Client Component for Judge evaluation
// Authoritative specification: JUDGING.md §2 & AGENT_MASTER_PLAN.md Step 10B

'use client';

import React, { useState, useEffect, useCallback, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft,
  ChevronRight,
  GitBranch,
  ExternalLink,
  Calendar,
  Video,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { RubricSlider } from './RubricSlider';

export interface ProjectDetail {
  id: string;
  title: string;
  summary: string;
  track_id: string;
  track_name: string;
  team_name: string;
  repo_url: string;
  submitted_at: string;
  video_url?: string | null;
}

export interface ExistingScore {
  functionality: number;
  quality: number;
  innovation: number;
  comment: string;
}

interface JudgeReviewConsoleProps {
  project: ProjectDetail;
  projectIds: string[];
  initialScore?: ExistingScore | null;
}

export function JudgeReviewConsole({
  project,
  projectIds,
  initialScore,
}: JudgeReviewConsoleProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Rubric State
  const [funcScore, setFuncScore] = useState<number>(initialScore?.functionality ?? 3.0);
  const [qualScore, setQualScore] = useState<number>(initialScore?.quality ?? 3.0);
  const [innovScore, setInnovScore] = useState<number>(initialScore?.innovation ?? 3.0);
  const [comment, setComment] = useState<string>(initialScore?.comment ?? '');

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Computed Scores
  const totalRaw = Number((funcScore + qualScore + innovScore).toFixed(2));
  const totalWeighted = Number(
    (0.4 * funcScore + 0.35 * qualScore + 0.25 * innovScore).toFixed(2)
  );

  // Project navigation indices
  const currentIndex = projectIds.indexOf(project.id);
  const prevProjectId = currentIndex > 0 ? projectIds[currentIndex - 1] : null;
  const nextProjectId = currentIndex < projectIds.length - 1 ? projectIds[currentIndex + 1] : null;

  const navigateToProject = useCallback(
    (targetId: string | null) => {
      if (!targetId) return;
      startTransition(() => {
        router.push(`/judge/review/${targetId}`);
      });
    },
    [router]
  );

  // Keyboard navigation: Left/Right arrows
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Do not trigger when typing inside textarea or input
      if (['TEXTAREA', 'INPUT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      if (e.key === 'ArrowLeft' && prevProjectId) {
        navigateToProject(prevProjectId);
      } else if (e.key === 'ArrowRight' && nextProjectId) {
        navigateToProject(nextProjectId);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [prevProjectId, nextProjectId, navigateToProject]);

  // Submit Ballot to POST /api/judge/scores
  const handleSubmitBallot = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    setSubmitSuccess(false);

    try {
      const res = await fetch('/api/judge/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: project.id,
          raw_criteria: {
            functionality: funcScore,
            quality: qualScore,
            innovation: innovScore,
          },
          comment: comment.trim(),
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Submission failed' }));
        throw new Error(errorData.error || `HTTP ${res.status}`);
      }

      setSubmitSuccess(true);
      // Auto advance to next project after short delay if available
      if (nextProjectId) {
        setTimeout(() => {
          navigateToProject(nextProjectId);
        }, 1200);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to submit ballot';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formattedDate = project.submitted_at
    ? new Date(project.submitted_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Recent';

  return (
    <div className="space-y-6">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between bg-zinc-900/60 backdrop-blur border border-zinc-800/80 rounded-2xl p-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push('/judge')}
            className="text-xs text-zinc-400 hover:text-zinc-200 transition font-medium flex items-center gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Judge Console Hub</span>
          </button>
          <span className="text-zinc-700">|</span>
          <span className="text-xs font-mono text-zinc-400">
            Project <strong className="text-zinc-200">{currentIndex + 1}</strong> of{' '}
            {projectIds.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="nav-prev-project"
            type="button"
            disabled={!prevProjectId || isPending}
            onClick={() => navigateToProject(prevProjectId)}
            className="px-3 py-1.5 rounded-xl text-xs font-medium bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-zinc-100 hover:border-zinc-700 disabled:opacity-30 disabled:pointer-events-none transition flex items-center gap-1"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Prev [←]</span>
          </button>

          <button
            id="nav-next-project"
            type="button"
            disabled={!nextProjectId || isPending}
            onClick={() => navigateToProject(nextProjectId)}
            className="px-3 py-1.5 rounded-xl text-xs font-medium bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-zinc-100 hover:border-zinc-700 disabled:opacity-30 disabled:pointer-events-none transition flex items-center gap-1"
          >
            <span>Next [→]</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Split-Screen Main Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Project Inspector (7 cols) */}
        <section className="lg:col-span-7 space-y-6 bg-zinc-900/40 border border-zinc-800/80 rounded-3xl p-6 sm:p-8 backdrop-blur-sm">
          {/* Header & Badges */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-zinc-800 text-zinc-300 border border-zinc-700/60">
                {project.track_name}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-mono bg-zinc-900 text-zinc-400 border border-zinc-800">
                Team: {project.team_name}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-mono text-zinc-500 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formattedDate}
              </span>
            </div>

            <h1
              id="project-inspector-title"
              className="text-2xl sm:text-3xl font-extrabold text-zinc-100 tracking-tight"
            >
              {project.title}
            </h1>
          </div>

          {/* Repo Link */}
          {project.repo_url && (
            <div>
              <a
                id="project-inspector-repo"
                href={project.repo_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-300 hover:text-zinc-100 hover:border-zinc-700 transition"
              >
                <GitBranch className="w-3.5 h-3.5 text-zinc-400" />
                <span>{project.repo_url}</span>
                <ExternalLink className="w-3 h-3 text-zinc-500" />
              </a>
            </div>
          )}

          {/* Summary / Description */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Project Summary
            </h3>
            <p className="text-sm text-zinc-300 leading-relaxed bg-zinc-900/60 p-4 rounded-xl border border-zinc-800/60">
              {project.summary}
            </p>
          </div>

          {/* Video / Demo Container */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Demonstration & Artifacts
            </h3>
            <div className="relative aspect-video rounded-2xl bg-zinc-950 border border-zinc-800 overflow-hidden flex flex-col items-center justify-center text-center p-6 space-y-3 shadow-inner">
              <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500">
                <Video className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-300">Live Video Demo Container</p>
                <p className="text-xs text-zinc-500 max-w-sm mt-1">
                  Air-gapped offline environment: Video embeds and repository artifacts pre-bundled locally for evaluator review.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Right Column: Scoring & Ballot Console (5 cols) */}
        <section className="lg:col-span-5 space-y-6">
          <form
            onSubmit={handleSubmitBallot}
            className="bg-zinc-900/70 border border-zinc-800 rounded-3xl p-6 sm:p-7 space-y-6 backdrop-blur shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
              <div>
                <h2 className="text-lg font-bold text-zinc-100 tracking-tight">Evaluation Ballot</h2>
                <p className="text-xs text-zinc-500">Rate 1.0 to 5.0 across weighted criteria</p>
              </div>
              <span className="p-2 rounded-xl bg-zinc-800/80 text-amber-400 border border-zinc-700/60">
                <Sparkles className="w-4 h-4" />
              </span>
            </div>

            {/* Rubric Sliders */}
            <div className="space-y-4">
              <RubricSlider
                criterionKey="functionality"
                title="Functionality"
                weight={0.4}
                value={funcScore}
                onChange={setFuncScore}
                description="Does the project execute reliably, satisfy core requirements, and handle edge cases?"
              />

              <RubricSlider
                criterionKey="quality"
                title="Code Quality & Docs"
                weight={0.35}
                value={qualScore}
                onChange={setQualScore}
                description="Readability, test coverage, strict typing, and clean air-gapped architecture."
              />

              <RubricSlider
                criterionKey="innovation"
                title="Innovation"
                weight={0.25}
                value={innovScore}
                onChange={setInnovScore}
                description="Originality, problem-solving creativity, and exceptional technical craftsmanship."
              />
            </div>

            {/* Live Score Computation Display */}
            <div className="p-4 bg-zinc-950 border border-zinc-800/90 rounded-2xl flex items-center justify-between shadow-inner">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-zinc-500 font-semibold block">
                  Weighted Score (S_ij)
                </span>
                <span className="text-xs font-mono text-zinc-400">
                  Raw Sum: {totalRaw.toFixed(1)} / 15.0
                </span>
              </div>
              <div className="text-right">
                <span
                  id="computed-weighted-score"
                  className="text-3xl font-extrabold font-mono text-zinc-100 block"
                >
                  {totalWeighted.toFixed(2)}
                </span>
                <span className="text-[10px] text-zinc-500 font-mono">1.00 - 5.00 Scale</span>
              </div>
            </div>

            {/* Qualitative Feedback Comment */}
            <div className="space-y-1.5">
              <label
                htmlFor="ballot-comment"
                className="text-xs font-medium text-zinc-400 block"
              >
                Feedback & Review Notes (Optional)
              </label>
              <textarea
                id="ballot-comment"
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add constructive notes for the team..."
                className="w-full p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 transition resize-none"
              />
            </div>

            {/* Success / Error Feedback Notifications */}
            {submitSuccess && (
              <div
                id="ballot-success-message"
                className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-2.5 text-xs text-emerald-400 font-medium"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Ballot submitted successfully! Recorded in database.</span>
              </div>
            )}

            {errorMessage && (
              <div
                id="ballot-error-message"
                className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-2.5 text-xs text-rose-400 font-medium"
              >
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>Error: {errorMessage}</span>
              </div>
            )}

            {/* Submit Action Button */}
            <button
              id="submit-ballot-button"
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-zinc-100 hover:bg-white text-zinc-950 font-bold rounded-xl text-sm transition-all duration-150 shadow-lg hover:shadow-zinc-200/10 active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <span>Recording Ballot...</span>
              ) : (
                <>
                  <span>Submit Ballot</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
