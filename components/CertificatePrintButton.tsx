'use client';

// components/CertificatePrintButton.tsx
// Client button invoking native window.print() for air-gapped certificate generation

import React from 'react';
import { Printer } from 'lucide-react';

export function CertificatePrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition-all shadow-md active:scale-95"
    >
      <Printer className="w-3.5 h-3.5" />
      <span>Print / Save as PDF</span>
    </button>
  );
}
