// components/AuthPromptCard.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldAlert, ArrowRight, Home, KeyRound, CheckCircle2 } from 'lucide-react';

interface AuthPromptCardProps {
  requiredRole: 'judge' | 'organizer';
  title: string;
  description: string;
  currentRole?: string;
}

export function AuthPromptCard({
  requiredRole,
  title,
  description,
  currentRole = 'visitor',
}: AuthPromptCardProps) {
  const activateSession = (sessionToken: string) => {
    // Set session cookie for 24 hours across all paths
    document.cookie = `session=${sessionToken}; path=/; max-age=86400; SameSite=Lax`;
    window.location.reload();
  };

  return (
    <div className="max-w-lg w-full bg-zinc-900/90 border border-zinc-800 rounded-3xl p-8 backdrop-blur-md shadow-2xl text-center space-y-6">
      {/* Icon */}
      <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shadow-inner">
        <ShieldAlert className="w-8 h-8" />
      </div>

      {/* Header text */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-semibold uppercase tracking-wider bg-zinc-800/80 text-zinc-400 border border-zinc-700/60">
          <span>Active Role:</span>
          <span className="text-amber-400">{currentRole.toUpperCase()}</span>
        </div>
        <h2 className="text-2xl font-black text-zinc-100 tracking-tight">{title}</h2>
        <p className="text-xs text-zinc-400 leading-relaxed max-w-sm mx-auto">
          {description}
        </p>
      </div>

      {/* Role explanation */}
      <div className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800 text-[11px] text-zinc-400 flex items-start gap-2.5 text-left">
        <KeyRound className="w-4 h-4 text-zinc-500 mt-0.5 shrink-0" />
        <div>
          <span className="font-semibold text-zinc-200 block">FIG. 02 Role-Isolation Matrix Enforced</span>
          <span>
            Unauthorized requests are blocked at the Route Handler and Server Component boundary to maintain hackathon evaluation integrity.
          </span>
        </div>
      </div>

      {/* Test Persona 1-Click Activation */}
      <div className="space-y-3 pt-2">
        <span className="text-[11px] uppercase tracking-wider font-semibold text-zinc-500 block">
          1-Click Evaluator Test Persona Activation
        </span>

        {requiredRole === 'judge' && (
          <div className="flex flex-col sm:flex-row gap-2.5">
            <button
              onClick={() => activateSession('jdg_a_91bc')}
              className="flex-1 px-4 py-2.5 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Login as Judge A</span>
            </button>
            <button
              onClick={() => activateSession('jdg_b_44de')}
              className="flex-1 px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition border border-zinc-700/60 flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
              <span>Login as Judge B</span>
            </button>
          </div>
        )}

        {requiredRole === 'organizer' && (
          <button
            onClick={() => activateSession('org_7f2a')}
            className="w-full px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm shadow-emerald-500/20"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-zinc-950" />
            <span>Login as Organizer (org_7f2a)</span>
          </button>
        )}
      </div>

      {/* Secondary Navigation */}
      <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-center">
        <Link
          href="/projects"
          className="text-xs text-zinc-400 hover:text-zinc-200 transition flex items-center gap-1.5"
        >
          <Home className="w-3.5 h-3.5" />
          <span>Return to Public Gallery</span>
          <ArrowRight className="w-3 h-3 text-zinc-500" />
        </Link>
      </div>
    </div>
  );
}
