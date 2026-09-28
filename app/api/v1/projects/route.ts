// app/api/v1/projects/route.ts
// REST API v1 Projects list with search, track filtering, and pagination
// Authoritative specification: TIER 4 (T4 - PLATFORM APIS & EXTENSIONS)

import { NextResponse, type NextRequest } from 'next/server';
import sql from '@/lib/db';

interface ProjectQueryResult {
  id: string;
  title: string;
  summary: string;
  description: string | null;
  repo_url: string;
  live_url: string | null;
  video_url: string | null;
  submitted_at: Date | string;
  created_at: Date | string;
  track_id: string;
  track_name: string;
  team_id: string;
  team_name: string;
  total_count: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const track = searchParams.get('track');
    const search = searchParams.get('search');
    const limit = Math.min(Math.max(1, parseInt(searchParams.get('limit') || '20', 10) || 20), 100);
    const offset = Math.max(0, parseInt(searchParams.get('offset') || '0', 10) || 0);

    let query = sql`
      SELECT
        p.id,
        p.title,
        p.summary,
        p.description,
        p.repo_url,
        p.live_url,
        p.video_url,
        p.submitted_at,
        p.created_at,
        t.id as track_id,
        t.name as track_name,
        tm.id as team_id,
        tm.name as team_name,
        COUNT(*) OVER()::text as total_count
      FROM projects p
      LEFT JOIN tracks t ON p.track_id = t.id
      LEFT JOIN teams tm ON p.team_id = tm.id
      WHERE p.is_draft = FALSE
    `;

    if (track) {
      query = sql`${query} AND (t.id = ${track} OR LOWER(t.name) = LOWER(${track}))`;
    }

    if (search) {
      const pattern = `%${search.toLowerCase()}%`;
      query = sql`${query} AND (LOWER(p.title) LIKE ${pattern} OR LOWER(p.summary) LIKE ${pattern})`;
    }

    query = sql`${query} ORDER BY p.id ASC LIMIT ${limit} OFFSET ${offset};`;

    const rows = (await query) as unknown as ProjectQueryResult[];
    const total = rows.length > 0 ? parseInt(rows[0].total_count, 10) : 0;

    return NextResponse.json({
      total,
      limit,
      offset,
      count: rows.length,
      projects: rows.map((r: ProjectQueryResult) => ({
        id: r.id,
        title: r.title,
        summary: r.summary,
        description: r.description,
        track: {
          id: r.track_id,
          name: r.track_name,
        },
        team: {
          id: r.team_id,
          name: r.team_name,
        },
        repo_url: r.repo_url,
        live_url: r.live_url,
        video_url: r.video_url,
        submitted_at: typeof r.submitted_at === 'string' ? r.submitted_at : r.submitted_at.toISOString(),
      })),
    });
  } catch (error) {
    console.error('[API /api/v1/projects] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
