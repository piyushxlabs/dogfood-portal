// app/global-error.tsx
// Root Global Error Boundary for Dogfood 2026
// Authoritative specification: SYSTEM_SCOPE_AND_BEHAVIOR.md §2

'use client';

import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-zinc-950 text-zinc-100 min-h-screen flex items-center justify-center p-4 selection:bg-zinc-800">
        <div className="w-full max-w-md p-6 bg-zinc-900 border border-zinc-800 rounded-3xl space-y-5 text-center shadow-2xl">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto shadow-inner">
            <AlertTriangle className="w-6 h-6" />
          </div>

          <div className="space-y-2">
            <h2 className="text-lg font-bold text-zinc-100 tracking-tight">
              Application Error Encountered
            </h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              An unexpected runtime error occurred. Air-gapped fail-safes are active.
            </p>
            {error?.digest && (
              <p className="text-[10px] font-mono text-zinc-500 bg-zinc-950/80 py-1 px-2 rounded-lg inline-block border border-zinc-800">
                Digest: {error.digest}
              </p>
            )}
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => reset()}
              type="button"
              className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 transition flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
            <a
              href="/projects"
              className="px-4 py-2 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-bold transition flex items-center gap-1.5"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Return to Gallery</span>
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
