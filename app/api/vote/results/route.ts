// app/api/vote/results/route.ts
// Community voting results with Anti-Bandwagon Rule
// Authoritative specification: TIER 3 (T3 - PUBLIC COMMUNITY & ANTI-ABUSE TIER)

import { NextResponse, type NextRequest } from 'next/server';
import sql from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser(request);
    const isOrganizerOrAdmin = user.role === 'organizer' || user.role === 'admin';

    // 1. Get total votes count
    const countRows = await sql<{ count: string }[]>`
      SELECT COUNT(*)::text as count FROM community_votes;
    `;
    const totalVotes = Number(countRows[0]?.count || 0);

    // 2. Anti-Bandwagon Rule:
    // If the requester is not an organizer/admin, hide individual project vote tallies
    // to prevent psychological anchoring and bandwagon effects during active voting.
    if (!isOrganizerOrAdmin) {
      return NextResponse.json({
        tallies_hidden: true,
        anti_bandwagon_active: true,
        message: 'Community voting is active. Individual project vote counts are hidden from public view to eliminate bandwagon bias.',
        total_votes_cast: totalVotes,
      });
    }

    // 3. Organizers / Admins receive full aggregated results
    const results = await sql<{ project_id: string; project_title: string; track_name: string; vote_count: string }[]>`
      SELECT
        p.id as project_id,
        p.title as project_title,
        t.name as track_name,
        COUNT(v.id)::text as vote_count
      FROM projects p
      LEFT JOIN tracks t ON p.track_id = t.id
      LEFT JOIN community_votes v ON p.id = v.project_id
      GROUP BY p.id, p.title, t.name
      ORDER BY COUNT(v.id) DESC, p.title ASC;
    `;

    return NextResponse.json({
      tallies_hidden: false,
      anti_bandwagon_active: false,
      total_votes_cast: totalVotes,
      results: results.map((r) => ({
        project_id: r.project_id,
        project_title: r.project_title,
        track_name: r.track_name,
        vote_count: Number(r.vote_count),
      })),
    });
  } catch (error) {
    console.error('[API /api/vote/results] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
