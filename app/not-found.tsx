// app/not-found.tsx
import React from 'react';
import Link from 'next/link';
import { Compass, Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-4 selection:bg-zinc-800">
      <div className="max-w-md w-full bg-zinc-900/90 border border-zinc-800 rounded-3xl p-8 backdrop-blur-md shadow-2xl text-center space-y-6">
        {/* 404 Icon */}
        <div className="w-16 h-16 mx-auto rounded-2xl bg-zinc-800/80 border border-zinc-700/60 flex items-center justify-center text-zinc-400 shadow-inner">
          <Compass className="w-8 h-8 text-amber-400" />
        </div>

        {/* Message */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-semibold uppercase tracking-wider bg-zinc-800/80 text-amber-400 border border-zinc-700/60">
            <span>HTTP 404 • Not Found</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-zinc-100">
            Page Not Found
          </h1>
          <p className="text-xs text-zinc-400 leading-relaxed max-w-sm mx-auto">
            The requested hackathon resource or route does not exist in the Dogfood 2026 manifest.
          </p>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <Link
            href="/projects"
            className="w-full px-4 py-2.5 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Return to Public Gallery</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
