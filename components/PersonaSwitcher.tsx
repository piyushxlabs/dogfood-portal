// components/PersonaSwitcher.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { User, ChevronDown, Check, Shield, Trophy, Users, Eye } from 'lucide-react';

interface Persona {
  id: string;
  name: string;
  role: string;
  token: string | null;
  badgeColor: string;
  description: string;
}

const PERSONAS: Persona[] = [
  {
    id: 'visitor',
    name: 'Public Visitor',
    role: 'visitor',
    token: null,
    badgeColor: 'text-zinc-400 bg-zinc-800 border-zinc-700',
    description: 'Unauthenticated public access',
  },
  {
    id: 'judge_a',
    name: 'Judge A (jdg_01)',
    role: 'judge',
    token: 'jdg_a_91bc',
    badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    description: 'Evaluator ballot access',
  },
  {
    id: 'judge_b',
    name: 'Judge B (jdg_02)',
    role: 'judge',
    token: 'jdg_b_44de',
    badgeColor: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
    description: 'Peer judge isolation probe',
  },
  {
    id: 'organizer',
    name: 'Organizer Executive',
    role: 'organizer',
    token: 'org_7f2a',
    badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    description: 'Mission Control & CSV Export',
  },
  {
    id: 'participant',
    name: 'Participant (tm_01)',
    role: 'participant',
    token: 'prt_2e88',
    badgeColor: 'text-sky-400 bg-sky-500/10 border-sky-500/30',
    description: 'Team submission persona',
  },
];

export function PersonaSwitcher() {
  const [currentPersona, setCurrentPersona] = useState<Persona>(PERSONAS[0]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Read session cookie on client mount
    const match = document.cookie.match(/(?:^|;\s*)session=([^;]+)/);
    const activeToken = match ? match[1].trim() : null;

    if (activeToken) {
      const found = PERSONAS.find((p) => p.token === activeToken);
      if (found) {
        setCurrentPersona(found);
        return;
      }
    }
    setCurrentPersona(PERSONAS[0]);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const switchPersona = (persona: Persona) => {
    if (persona.token) {
      document.cookie = `session=${persona.token}; path=/; max-age=86400; SameSite=Lax`;
    } else {
      // Clear cookie for Visitor
      document.cookie = 'session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
    setCurrentPersona(persona);
    setIsOpen(false);
    window.location.reload();
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-zinc-900/90 border border-zinc-800 hover:border-zinc-700 text-zinc-200 transition shadow-sm"
        aria-label="Switch Test Persona"
      >
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-zinc-500 text-[11px] font-mono">Persona:</span>
        <span className="font-semibold text-zinc-100">{currentPersona.name}</span>
        <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl z-50 p-2 space-y-1 backdrop-blur-xl">
          <div className="px-3 py-2 border-b border-zinc-800/80 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block font-semibold">
              Select Test Persona (FIG. 02 Matrix)
            </span>
          </div>

          {PERSONAS.map((p) => {
            const isSelected = p.id === currentPersona.id;
            return (
              <button
                key={p.id}
                onClick={() => switchPersona(p)}
                className={`w-full text-left px-3 py-2 rounded-xl transition flex items-center justify-between text-xs ${
                  isSelected ? 'bg-zinc-800/90 text-white' : 'hover:bg-zinc-800/50 text-zinc-300'
                }`}
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-zinc-100">{p.name}</span>
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded border font-mono ${p.badgeColor}`}
                    >
                      {p.role}
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-500 block">{p.description}</span>
                </div>
                {isSelected && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
              </button>
            );
          })}

          <div className="pt-2 border-t border-zinc-800/80 px-2 flex items-center justify-between text-[11px] text-zinc-500">
            <span>Air-gapped Session Mock</span>
            <span className="font-mono text-[10px]">Unit DF-01</span>
          </div>
        </div>
      )}
    </div>
  );
}
