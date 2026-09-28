// app/api/v1/tracks/route.ts
// REST API v1 Tracks endpoint with project counts
// Authoritative specification: TIER 4 (T4 - PLATFORM APIS & EXTENSIONS)

import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET() {
  try {
    const tracks = await sql<
      {
        id: string;
        name: string;
        description: string | null;
        project_count: string;
      }[]
    >`
      SELECT
        t.id,
        t.name,
        t.description,
        COUNT(p.id)::text as project_count
      FROM tracks t
      LEFT JOIN projects p ON t.id = p.track_id AND p.is_draft = FALSE
      GROUP BY t.id, t.name, t.description
      ORDER BY t.id ASC;
    `;

    return NextResponse.json({
      count: tracks.length,
      tracks: tracks.map((t) => ({
        id: t.id,
        name: t.name,
        description: t.description,
        project_count: parseInt(t.project_count, 10),
      })),
    });
  } catch (error) {
    console.error('[API /api/v1/tracks] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
