'use client';

// components/ProjectComments.tsx
// Embedded Project Discussion & Moderation Client with XSS-safe Rendering
// Authoritative specification: TIER 3 (T3 - PUBLIC COMMUNITY & ANTI-ABUSE TIER)

import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, CheckCircle2, AlertCircle, User, Clock } from 'lucide-react';

interface CommentItem {
  id: number;
  project_id: string;
  author_name: string;
  author_email_masked?: string;
  comment_text: string;
  created_at: string;
}

export function ProjectComments({ projectId }: { projectId: string }) {
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [authorName, setAuthorName] = useState('');
  const [authorEmail, setAuthorEmail] = useState('');
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}/comments`);
      if (res.ok) {
        const data = await res.json();
        setComments(data.comments || []);
      }
    } catch (e) {
      console.error('Failed to load comments:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [projectId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!authorName.trim() || !authorEmail.trim() || !commentText.trim()) {
      setFeedback({ type: 'error', message: 'Please fill in all required fields.' });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author_name: authorName.trim(),
          author_email: authorEmail.trim(),
          comment_text: commentText.trim(),
        }),
      });

      const data = await res.json();
      if (res.status === 201) {
        setFeedback({ type: 'success', message: 'Comment submitted successfully!' });
        setCommentText('');
        fetchComments();
      } else {
        setFeedback({ type: 'error', message: data.error || 'Failed to submit comment.' });
      }
    } catch {
      setFeedback({ type: 'error', message: 'Network error posting comment.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="w-full mt-12 pt-8 border-t border-zinc-800">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-indigo-400" />
          <h2 className="text-xl font-bold text-zinc-100">Community Discussion</h2>
          <span className="text-xs font-mono bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded-full ml-1">
            {comments.length}
          </span>
        </div>
      </div>

      {/* Submission Form */}
      <form onSubmit={handleSubmit} className="mb-10 p-6 bg-zinc-900/80 border border-zinc-800 rounded-2xl">
        <h3 className="text-sm font-semibold text-zinc-200 mb-4">Leave Feedback or Ask a Question</h3>

        {feedback && (
          <div
            className={`mb-4 p-3 rounded-xl text-xs flex items-center gap-2 ${
              feedback.type === 'success'
                ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/60'
                : 'bg-rose-950/60 text-rose-300 border border-rose-800/60'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="comment-author-name" className="block text-xs font-medium text-zinc-400 mb-1">
              Your Name *
            </label>
            <input
              id="comment-author-name"
              type="text"
              required
              placeholder="e.g. Alex Rivera"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 focus:border-indigo-500 rounded-xl text-sm text-zinc-100 placeholder:text-zinc-600 outline-none transition-all"
            />
          </div>

          <div>
            <label htmlFor="comment-author-email" className="block text-xs font-medium text-zinc-400 mb-1">
              Your Email (Masked publicly) *
            </label>
            <input
              id="comment-author-email"
              type="email"
              required
              placeholder="alex@example.com"
              value={authorEmail}
              onChange={(e) => setVoterEmailSafe(e.target.value, setAuthorEmail)}
              className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 focus:border-indigo-500 rounded-xl text-sm text-zinc-100 placeholder:text-zinc-600 outline-none transition-all"
            />
          </div>
        </div>

        <div className="mb-4">
          <label htmlFor="comment-body" className="block text-xs font-medium text-zinc-400 mb-1">
            Comment * (HTML sanitized automatically)
          </label>
          <textarea
            id="comment-body"
            rows={3}
            required
            placeholder="Share feedback, ask technical questions, or compliment the team..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 focus:border-indigo-500 rounded-xl text-sm text-zinc-100 placeholder:text-zinc-600 outline-none transition-all resize-y"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{submitting ? 'Posting...' : 'Post Comment'}</span>
          </button>
        </div>
      </form>

      {/* Comments List */}
      {loading ? (
        <div className="text-center py-8 text-zinc-500 text-sm">Loading discussion...</div>
      ) : comments.length === 0 ? (
        <div className="text-center py-10 bg-zinc-900/40 border border-zinc-800/60 rounded-2xl">
          <MessageSquare className="w-8 h-8 text-zinc-600 mx-auto mb-2 opacity-50" />
          <p className="text-sm text-zinc-400">No comments yet.</p>
          <p className="text-xs text-zinc-500 mt-1">Be the first to share your thoughts on this submission!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="p-5 bg-zinc-900/60 border border-zinc-800/80 rounded-2xl hover:border-zinc-700/80 transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-sm font-semibold text-zinc-200">{comment.author_name}</span>
                  {comment.author_email_masked && (
                    <span className="text-xs font-mono text-zinc-500">
                      ({comment.author_email_masked})
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 text-xs text-zinc-500">
                  <Clock className="w-3 h-3" />
                  <span>
                    {new Date(comment.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
              <p className="text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed pl-9">
                {comment.comment_text}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function setVoterEmailSafe(value: string, setter: (val: string) => void) {
  setter(value);
}
