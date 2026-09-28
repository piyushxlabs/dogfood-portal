// app/api/v1/export/bulk/route.ts
// Bulk platform JSON archive export endpoint (Organizer-Authenticated)
// Authoritative specification: TIER 4 (T4 - PLATFORM APIS & EXTENSIONS)

import { NextResponse, type NextRequest } from 'next/server';
import sql from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import { getNormalizedLeaderboard, getVarianceSummary } from '@/lib/normalization';
import type {
  DbEvent,
  DbTrack,
  DbTeam,
  DbTeamMember,
  DbProject,
  DbRubricCriteria,
  DbScore,
} from '@/src/types/db';

async function handleBulkExport(request: NextRequest) {
  try {
    const user = await getSessionUser(request);

    // 1. Role enforcement: Only organizer or admin
    if (!user.isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized: Session required' }, { status: 401 });
    }

    if (user.role !== 'organizer' && user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Organizer access required' }, { status: 403 });
    }

    // 2. Query all database entities in parallel with strict types
    const [events, tracks, teams, teamMembers, projects, rubricCriteria, scores, leaderboard, variance] =
      await Promise.all([
        sql<DbEvent[]>`SELECT * FROM events;`,
        sql<DbTrack[]>`SELECT * FROM tracks ORDER BY id ASC;`,
        sql<DbTeam[]>`SELECT * FROM teams ORDER BY id ASC;`,
        sql<DbTeamMember[]>`SELECT * FROM team_members ORDER BY team_id ASC;`,
        sql<DbProject[]>`SELECT * FROM projects ORDER BY id ASC;`,
        sql<DbRubricCriteria[]>`SELECT * FROM rubric_criteria ORDER BY id ASC;`,
        sql<DbScore[]>`SELECT id, judge_id, project_id, raw_criteria, total_raw_score, total_weighted_score, comment, created_at, updated_at FROM scores ORDER BY id ASC;`,
        getNormalizedLeaderboard(),
        getVarianceSummary(),
      ]);

    // 3. Assemble members into teams
    const teamMembersMap = new Map<string, string[]>();
    for (const m of teamMembers) {
      const list = teamMembersMap.get(m.team_id) || [];
      list.push(m.user_email);
      teamMembersMap.set(m.team_id, list);
    }

    const formattedTeams = teams.map((t: DbTeam) => ({
      id: t.id,
      name: t.name,
      invite_code: t.invite_code,
      members: teamMembersMap.get(t.id) || [],
      created_at: t.created_at,
    }));

    const archive = {
      format_version: 'DOGFOOD-2026-ARCHIVE-V1',
      exported_at: new Date().toISOString(),
      event: events[0] || null,
      tracks,
      teams: formattedTeams,
      projects: projects.map((p: DbProject) => ({
        ...p,
        submitted_at: typeof p.submitted_at === 'string' ? p.submitted_at : new Date(p.submitted_at).toISOString(),
      })),
      rubric_criteria: rubricCriteria.map((c: DbRubricCriteria) => ({
        ...c,
        weight: Number(c.weight),
        max_score: Number(c.max_score),
      })),
      scores: scores.map((s: DbScore) => ({
        ...s,
        total_raw_score: Number(s.total_raw_score),
        total_weighted_score: Number(s.total_weighted_score),
      })),
      calibration: {
        variance_summary: variance,
        final_leaderboard: leaderboard,
      },
    };

    return NextResponse.json(archive);
  } catch (error) {
    console.error('[API /api/v1/export/bulk] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  return handleBulkExport(request);
}

export async function GET(request: NextRequest) {
  return handleBulkExport(request);
}
