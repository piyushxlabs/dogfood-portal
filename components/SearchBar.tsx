// components/SearchBar.tsx
// Instant search input component for the Public Gallery
// Authoritative specification: AGENT_MASTER_PLAN.md Step 10A

'use client';

import React from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  id?: string;
}

export function SearchBar({
  value,
  onChange,
  placeholder = 'Search projects by title, summary, or team...',
  id = 'gallery-search-input',
}: SearchBarProps) {
  return (
    <div className="relative max-w-xl w-full">
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
        <Search className="w-4 h-4" />
      </div>
      <input
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="w-full pl-10 pr-10 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 transition shadow-inner"
      />
      {value && (
        <button
          id={`${id}-clear`}
          type="button"
          onClick={() => onChange('')}
          aria-label="Clear search"
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-500 hover:text-zinc-300 transition"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
