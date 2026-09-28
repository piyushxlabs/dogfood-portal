// app/error.tsx
'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home, ShieldAlert } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[GLOBAL_ERROR] Caught unhandled application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-4 selection:bg-zinc-800">
      <div className="max-w-md w-full bg-zinc-900/90 border border-zinc-800 rounded-3xl p-8 backdrop-blur-md shadow-2xl text-center space-y-6">
        {/* Error icon */}
        <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shadow-inner">
          <AlertTriangle className="w-8 h-8" />
        </div>

        {/* Message */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-semibold uppercase tracking-wider bg-zinc-800/80 text-zinc-400 border border-zinc-700/60">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            <span>Air-Gapped Exception Handler</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-zinc-100">
            Something went wrong
          </h1>
          <p className="text-xs text-zinc-400 leading-relaxed max-w-sm mx-auto">
            An unexpected runtime condition occurred. The Dogfood portal boundary intercepted the error to preserve evaluation state.
          </p>
          {error.digest && (
            <p className="text-[10px] font-mono text-zinc-600 bg-zinc-950/60 px-2.5 py-1 rounded-lg border border-zinc-800/80 inline-block">
              Digest: {error.digest}
            </p>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="flex-1 px-4 py-2.5 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
          <Link
            href="/projects"
            className="flex-1 px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition border border-zinc-700/60 flex items-center justify-center gap-2"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Return to Gallery</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
