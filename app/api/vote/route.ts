// app/api/vote/route.ts
// Community voting submission handler with email validation & deduplication
// Authoritative specification: TIER 3 (T3 - PUBLIC COMMUNITY & ANTI-ABUSE TIER)

import { NextResponse, type NextRequest } from 'next/server';
import sql from '@/lib/db';

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export async function POST(request: NextRequest) {
  try {
    let body: { project_id?: string; voter_email?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    const { project_id, voter_email } = body;

    // 1. Validate required fields
    if (!project_id || typeof project_id !== 'string') {
      return NextResponse.json({ error: 'project_id is required' }, { status: 400 });
    }

    if (!voter_email || typeof voter_email !== 'string') {
      return NextResponse.json({ error: 'voter_email is required' }, { status: 400 });
    }

    const trimmedEmail = voter_email.trim().toLowerCase();

    // 2. Validate email syntax
    if (!EMAIL_REGEX.test(trimmedEmail)) {
      return NextResponse.json({ error: 'Invalid email syntax' }, { status: 400 });
    }

    // 3. Verify project exists
    const projectRows = await sql<{ id: string }[]>`
      SELECT id FROM projects WHERE id = ${project_id.trim()} LIMIT 1;
    `;

    if (projectRows.length === 0) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // 4. Extract voter IP
    const forwarded = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const voterIp = forwarded ? forwarded.split(',')[0].trim() : (realIp || '127.0.0.1');

    // 5. Atomic insert with unique constraint protection
    try {
      await sql`
        INSERT INTO community_votes (project_id, voter_email, voter_ip)
        VALUES (${project_id.trim()}, ${trimmedEmail}, ${voterIp});
      `;
    } catch (insertError: unknown) {
      const err = insertError as { code?: string; message?: string };
      // PostgreSQL unique_violation code is '23505'
      if (err.code === '23505') {
        return NextResponse.json(
          { error: 'Vote already cast for this project with this email address' },
          { status: 409 }
        );
      }
      throw insertError;
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Vote recorded successfully',
        project_id: project_id.trim(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[API /api/vote] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
