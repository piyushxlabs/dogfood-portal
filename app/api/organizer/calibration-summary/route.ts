// app/api/organizer/calibration-summary/route.ts
// Role-isolated API returning statistical variance reduction metrics
// Authoritative specification: JUDGING.md §3 & AGENT_MASTER_PLAN.md Step 10C

import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { getVarianceSummary } from '@/lib/normalization';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  // Gate 1: Role Guard (Strictly organizer or admin per FIG. 02 Matrix)
  const guard = await requireRole(request, ['organizer', 'admin']);
  if (!guard.authorized) {
    return guard.response;
  }

  // Gate 2: Compute dynamic variance reduction summary
  const summary = await getVarianceSummary();

  return NextResponse.json({
    variance: summary,
    updated_at: new Date().toISOString(),
  });
}
