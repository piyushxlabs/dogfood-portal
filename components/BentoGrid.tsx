// components/BentoGrid.tsx
// Responsive Bento Grid layout component for the Public Gallery
// Authoritative specification: AGENT_MASTER_PLAN.md Step 10A

import React from 'react';

interface BentoGridProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export function BentoGrid({
  children,
  className = '',
  id = 'projects-bento-grid',
}: BentoGridProps) {
  return (
    <div
      id={id}
      className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 ${className}`}
    >
      {children}
    </div>
  );
}
