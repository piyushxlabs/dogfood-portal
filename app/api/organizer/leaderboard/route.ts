// app/api/organizer/leaderboard/route.ts
// Role-isolated API returning current calibrated leaderboard standings
// Authoritative specification: ARCHITECTURE.md §4 & AGENT_MASTER_PLAN.md Step 10C

import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { getNormalizedLeaderboard } from '@/lib/normalization';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  // Gate 1: Role Guard (Strictly organizer or admin per FIG. 02 Matrix)
  const guard = await requireRole(request, ['organizer', 'admin']);
  if (!guard.authorized) {
    return guard.response;
  }

  // Gate 2: Compute dynamically calibrated leaderboard
  const leaderboard = await getNormalizedLeaderboard();

  return NextResponse.json({
    leaderboard,
    count: leaderboard.length,
    updated_at: new Date().toISOString(),
  });
}
