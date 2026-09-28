// app/api/projects/route.ts
// Public API route returning hackathon submissions with track and team metadata
// Authoritative specification: ARCHITECTURE.md §2 & DATA-MODEL.md §3

import { NextResponse } from 'next/server';
import fs from 'node:fs';
import path from 'node:path';
import sql from '@/lib/db';

function loadFallbackProjects() {
  try {
    const candidatePaths = [
      path.resolve(process.cwd(), 'fixtures.json'),
      path.resolve(process.cwd(), 'docs', 'fixtures.json'),
    ];
    let raw = '';
    for (const p of candidatePaths) {
      if (fs.existsSync(p)) {
        raw = fs.readFileSync(p, 'utf8');
        break;
      }
    }
    if (!raw) return [];
    const data = JSON.parse(raw);

    const trackMap = new Map<string, string>();
    (data.tracks || []).forEach((t: { id: string; name: string }) => {
      trackMap.set(t.id, t.name);
    });

    const teamMap = new Map<string, string>();
    (data.teams || []).forEach((tm: { id: string; name: string }) => {
      teamMap.set(tm.id, tm.name);
    });

    return (data.projects || []).map((p: any) => ({
      id: p.id,
      title: p.title,
      summary: p.summary,
      track_id: p.track,
      track_name: trackMap.get(p.track) || 'General',
      team_id: p.team,
      team_name: teamMap.get(p.team) || p.team,
      repo_url: p.repo_url,
      submitted_at: p.submitted_at,
    }));
  } catch (err) {
    console.warn('[API/PROJECTS] Failed to read fallback fixtures:', err);
    return [];
  }
}

export async function GET() {
  try {
    const rows = await sql`
      SELECT
        p.id,
        p.title,
        p.summary,
        p.track_id,
        t.name as track_name,
        p.team_id,
        tm.name as team_name,
        p.repo_url,
        p.submitted_at
      FROM projects p
      JOIN tracks t ON p.track_id = t.id
      JOIN teams tm ON p.team_id = tm.id
      ORDER BY p.submitted_at DESC;
    `;

    if (rows && rows.length > 0) {
      return NextResponse.json({
        projects: rows,
        count: rows.length,
      });
    }
  } catch (err) {
    console.warn('[API/PROJECTS] Database query bypassed or offline; using local fixtures fallback:', err);
  }

  const fallback = loadFallbackProjects();
  return NextResponse.json({
    projects: fallback,
    count: fallback.length,
  });
}
