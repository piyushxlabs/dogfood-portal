// app/api/v1/leaderboard/route.ts
// REST API v1 Leaderboard endpoint (Organizer-Authenticated)
// Authoritative specification: TIER 4 (T4 - PLATFORM APIS & EXTENSIONS) & ARCHITECTURE.md §4

import { NextResponse, type NextRequest } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { getNormalizedLeaderboard, getVarianceSummary } from '@/lib/normalization';

export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser(request);

    // 1. Role enforcement: Only organizer or admin
    if (!user.isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized: Session required' }, { status: 401 });
    }

    if (user.role !== 'organizer' && user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Organizer access required' }, { status: 403 });
    }

    // 2. Fetch live normalized leaderboard and variance metrics
    const [leaderboard, variance] = await Promise.all([
      getNormalizedLeaderboard(),
      getVarianceSummary(),
    ]);

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      calibration_summary: variance,
      total_projects: leaderboard.length,
      leaderboard,
    });
  } catch (error) {
    console.error('[API /api/v1/leaderboard] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
