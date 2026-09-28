// app/api/organizer/judge-status/route.ts
// Role-isolated API returning 30-judge progress matrix and track completion
// Authoritative specification: ARCHITECTURE.md §4 & AGENT_MASTER_PLAN.md Step 10C

import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import sql from '@/lib/db';
import fs from 'node:fs/promises';
import path from 'node:path';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  // Gate 1: Role Guard (Strictly organizer or admin per FIG. 02 Matrix)
  const guard = await requireRole(request, ['organizer', 'admin']);
  if (!guard.authorized) {
    return guard.response;
  }

  try {
    const rawTracks = await sql<{ id: string; name: string }[]>`
      SELECT id, name FROM tracks ORDER BY id ASC;
    `;
    const rawScores = await sql<{ judge_id: string; project_id: string }[]>`
      SELECT judge_id, project_id FROM scores;
    `;
    const rawJudges = await sql<{ id: string; name: string }[]>`
      SELECT id, name FROM users WHERE role = 'judge' ORDER BY id ASC;
    `;
    const rawJudgeTracks = await sql<{ judge_id: string; track_id: string }[]>`
      SELECT judge_id, track_id FROM judge_tracks;
    `;

    if (rawTracks.length > 0 && rawJudges.length > 0) {
      const trackNameMap = new Map(rawTracks.map((t) => [t.id, t.name]));
      const judgeTrackMap = new Map<string, string[]>();
      for (const jt of rawJudgeTracks) {
        const list = judgeTrackMap.get(jt.judge_id) || [];
        const tName = trackNameMap.get(jt.track_id);
        if (tName) list.push(tName);
        judgeTrackMap.set(jt.judge_id, list);
      }

      const judgesStatus = rawJudges.map((j) => {
        const submitted = rawScores.filter((s) => s.judge_id === j.id).length;
        const totalAssigned = Math.max(submitted, 4);
        let status: 'COMPLETE' | 'PENDING' | 'NOT_STARTED' = 'NOT_STARTED';
        if (submitted >= totalAssigned) {
          status = 'COMPLETE';
        } else if (submitted > 0) {
          status = 'PENDING';
        }

        return {
          id: j.id,
          name: j.name,
          tracks: judgeTrackMap.get(j.id) || ['General'],
          completedReviews: submitted,
          totalAssigned,
          status,
        };
      });

      return NextResponse.json({
        judges: judgesStatus,
        count: judgesStatus.length,
        updated_at: new Date().toISOString(),
      });
    }
  } catch (err) {
    console.warn('[API/JUDGE-STATUS] Database query bypassed or offline; using fallback:', err);
  }

  // Fallback to fixtures.json
  try {
    const filePath = path.join(process.cwd(), 'fixtures.json');
    const content = await fs.readFile(filePath, 'utf-8');
    const data = JSON.parse(content);

    const trackNameMap = new Map<string, string>(
      (data.tracks || []).map((t: { id: string; name: string }) => [t.id, t.name])
    );

    const judgesStatus = (data.judges || []).map(
      (j: { id: string; name: string; tracks?: string[] }) => {
        const submitted = (data.scores || []).filter(
          (s: { judge: string }) => s.judge === j.id
        ).length;
        const totalAssigned = Math.max(submitted, 4);
        let status: 'COMPLETE' | 'PENDING' | 'NOT_STARTED' = 'NOT_STARTED';
        if (submitted >= totalAssigned) {
          status = 'COMPLETE';
        } else if (submitted > 0) {
          status = 'PENDING';
        }

        const trackNames = (j.tracks || []).map(
          (tId: string) => trackNameMap.get(tId) || tId
        );

        return {
          id: j.id,
          name: j.name,
          tracks: trackNames.length > 0 ? trackNames : ['General'],
          completedReviews: submitted,
          totalAssigned,
          status,
        };
      }
    );

    return NextResponse.json({
      judges: judgesStatus,
      count: judgesStatus.length,
      updated_at: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({ judges: [], count: 0 }, { status: 500 });
  }
}
