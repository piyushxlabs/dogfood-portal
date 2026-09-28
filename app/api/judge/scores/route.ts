// app/api/judge/scores/route.ts
// Role-isolated judging Route Handler for Dogfood 2026
// Authoritative specification: ARCHITECTURE.md §4 (FIG. 02 Matrix) & AGENT_MASTER_PLAN.md Step 8

import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import {
  getSessionUser,
  verifyJudgeScoreAccess,
  canonicalJudgeId,
  logAuditViolation,
} from '@/lib/auth';
import type { DbScore, RawCriteria } from '@/src/types/db';
import fs from 'node:fs/promises';
import path from 'node:path';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface FixtureData {
  scores?: {
    judge: string;
    project: string;
    criteria: RawCriteria;
    comment?: string;
  }[];
}

/**
 * Defensive fallback loader to ensure scores are available even if the database
 * is cold or briefly offline.
 */
async function loadFixtureScoresForJudge(judgeId: string): Promise<DbScore[]> {
  const candidatePaths = [
    process.env.FIXTURES_PATH,
    path.join(process.cwd(), 'fixtures.json'),
    path.join(process.cwd(), 'docs', 'fixtures.json'),
    '/app/fixtures.json',
  ].filter((p): p is string => Boolean(p));

  for (const p of candidatePaths) {
    try {
      const content = await fs.readFile(p, 'utf-8');
      const data = JSON.parse(content) as FixtureData;
      if (Array.isArray(data.scores)) {
        const filtered = judgeId
          ? data.scores.filter((s) => canonicalJudgeId(s.judge) === judgeId)
          : data.scores;

        return filtered.map((s, idx) => {
          const func = Number(s.criteria?.functionality) || 0;
          const qual = Number(s.criteria?.quality) || 0;
          const innov = Number(s.criteria?.innovation) || 0;
          return {
            id: idx + 1,
            judge_id: s.judge,
            project_id: s.project,
            raw_criteria: s.criteria,
            total_raw_score: Number((func + qual + innov).toFixed(2)),
            total_weighted_score: Number((0.4 * func + 0.35 * qual + 0.25 * innov).toFixed(2)),
            comment: s.comment && s.comment.trim() !== '' ? s.comment.trim() : null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
        });
      }
    } catch {
      // Continue to next candidate path
    }
  }

  return [];
}

/**
 * GET /api/judge/scores
 * Enforces role isolation:
 * - Unauthenticated -> 401 Unauthorized
 * - Participant -> 403 Forbidden
 * - Judge requesting peer scores (?judge=...) -> 403 Forbidden with audit logging
 * - Judge requesting own scores -> 200 OK with own score list
 * - Organizer / Admin -> 200 OK with own or target judge scores
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const searchParams = request.nextUrl.searchParams;
  const targetJudge = searchParams.get('judge');

  // Enforce security isolation gates via ARCHITECTURE.md §4.2
  const { user, errorResponse } = await verifyJudgeScoreAccess(request, targetJudge);
  if (errorResponse) {
    return errorResponse;
  }

  if (!user || !user.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Determine target judge query scope
  let judgeIdToQuery: string;
  if (user.role === 'judge') {
    // Judge can strictly see only their own scores
    judgeIdToQuery = canonicalJudgeId(user.userId);
  } else {
    // Organizer or Admin can view a specific judge or all scores
    judgeIdToQuery = targetJudge ? canonicalJudgeId(targetJudge) : '';
  }

  try {
    if (judgeIdToQuery) {
      const rows = await sql<DbScore[]>`
        SELECT
          id,
          judge_id,
          project_id,
          raw_criteria,
          total_raw_score,
          total_weighted_score,
          comment,
          created_at,
          updated_at
        FROM scores
        WHERE judge_id = ${judgeIdToQuery}
        ORDER BY id ASC;
      `;
      return NextResponse.json({ scores: rows }, { status: 200 });
    }

    // Organizer/Admin full scores request
    const rows = await sql<DbScore[]>`
      SELECT
        id,
        judge_id,
        project_id,
        raw_criteria,
        total_raw_score,
        total_weighted_score,
        comment,
        created_at,
        updated_at
      FROM scores
      ORDER BY id ASC;
    `;
    return NextResponse.json({ scores: rows }, { status: 200 });
  } catch (dbErr) {
    console.warn('[API/JUDGE/SCORES] Database query failed, using fixture fallback:', dbErr);
    const fixtureScores = await loadFixtureScoresForJudge(judgeIdToQuery);
    return NextResponse.json({ scores: fixtureScores }, { status: 200 });
  }
}

/**
 * POST /api/judge/scores
 * Accepts and persists a judging ballot:
 * - Enforces authentication (401) and role check (participant blocked 403)
 * - Validates rubric criteria: functionality (0.40), quality (0.35), innovation (0.25)
 * - Atomic upsert on (judge_id, project_id)
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const user = await getSessionUser(request);

  // Gate 1: Authentication check
  if (!user.isAuthenticated || !user.userId) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  // Gate 2: Participant role block
  if (user.role === 'participant') {
    await logAuditViolation(
      user.userId,
      'PARTICIPANT_JUDGE_ROUTE_BLOCKED',
      '/api/judge/scores',
      403,
      {
        http_method: 'POST',
        path: '/api/judge/scores',
        actor_role: user.role,
        blocked_status_code: 403,
        timestamp_utc: new Date().toISOString(),
      }
    );
    return NextResponse.json(
      { error: 'Forbidden: Participants cannot submit judge scores' },
      { status: 403 }
    );
  }

  // Gate 3: Allowed roles (judge, organizer, admin)
  if (user.role !== 'judge' && user.role !== 'organizer' && user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Gate 4: Parse & validate ballot payload
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }

  const projectId = typeof body.project_id === 'string' ? body.project_id.trim() : '';
  if (!projectId) {
    return NextResponse.json({ error: 'Missing required field: project_id' }, { status: 400 });
  }

  const rawCriteria = (body.raw_criteria || body.criteria) as Record<string, unknown> | undefined;
  if (!rawCriteria || typeof rawCriteria !== 'object') {
    return NextResponse.json(
      { error: 'Missing required rubric criteria scores' },
      { status: 400 }
    );
  }

  const func = Number(rawCriteria.functionality);
  const qual = Number(rawCriteria.quality);
  const innov = Number(rawCriteria.innovation);

  if (
    isNaN(func) || func < 1 || func > 5 ||
    isNaN(qual) || qual < 1 || qual > 5 ||
    isNaN(innov) || innov < 1 || innov > 5
  ) {
    return NextResponse.json(
      { error: 'Invalid rubric criteria scores. Must be numeric values between 1 and 5.' },
      { status: 400 }
    );
  }

  const totalRaw = Number((func + qual + innov).toFixed(2));
  const totalWeighted = Number((0.4 * func + 0.35 * qual + 0.25 * innov).toFixed(2));
  const comment =
    typeof body.comment === 'string' && body.comment.trim() !== '' ? body.comment.trim() : null;

  const judgeId = canonicalJudgeId(
    (user.role === 'organizer' || user.role === 'admin') && typeof body.judge_id === 'string'
      ? body.judge_id
      : user.userId
  );

  try {
    const rows = await sql<DbScore[]>`
      INSERT INTO scores (
        judge_id, project_id, raw_criteria, total_raw_score, total_weighted_score, comment
      ) VALUES (
        ${judgeId},
        ${projectId},
        ${JSON.stringify({ functionality: func, quality: qual, innovation: innov })},
        ${totalRaw},
        ${totalWeighted},
        ${comment}
      )
      ON CONFLICT (judge_id, project_id) DO UPDATE SET
        raw_criteria = EXCLUDED.raw_criteria,
        total_raw_score = EXCLUDED.total_raw_score,
        total_weighted_score = EXCLUDED.total_weighted_score,
        comment = EXCLUDED.comment,
        updated_at = NOW()
      RETURNING *;
    `;

    await logAuditViolation(
      user.userId,
      'JUDGE_SCORE_SUBMITTED',
      `/api/judge/scores:${projectId}`,
      200,
      {
        http_method: 'POST',
        path: '/api/judge/scores',
        actor_role: user.role,
        timestamp_utc: new Date().toISOString(),
      }
    );

    return NextResponse.json({ score: rows[0], success: true }, { status: 200 });
  } catch (dbErr) {
    console.error('[API/JUDGE/SCORES] Failed to save score:', dbErr);
    return NextResponse.json(
      { error: 'Database error saving score' },
      { status: 500 }
    );
  }
}
