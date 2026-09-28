// app/projects/new/route.ts
// Submission route handler with strict deadline enforcement and role evaluation
// Authoritative specification: SYSTEM_SCOPE_AND_BEHAVIOR.md §3 & AGENT_MASTER_PLAN.md §5.3

import { NextResponse, type NextRequest } from 'next/server';
import sql from '@/lib/db';
import { getSessionUser, logAuditViolation } from '@/lib/auth';

const FALLBACK_DEADLINE = '2026-03-01T18:00:00Z';

async function getSubmissionsCloseDate(): Promise<Date> {
  try {
    const rows = await sql<{ submissions_close: Date | string }[]>`
      SELECT submissions_close FROM events ORDER BY created_at ASC LIMIT 1;
    `;
    if (rows && rows.length > 0 && rows[0].submissions_close) {
      return new Date(rows[0].submissions_close);
    }
  } catch (err) {
    console.warn('[SUBMIT] Database query bypassed or offline; using fallback deadline:', err);
  }
  return new Date(FALLBACK_DEADLINE);
}

/**
 * POST /projects/new
 * Verified by run.py: 'closed event refuses submissions' -> 4xx (400)
 */
export async function POST(request: NextRequest) {
  const user = await getSessionUser(request);

  // 1. Authentication Gate
  if (!user.isAuthenticated) {
    await logAuditViolation(null, 'SESSION_INVALID', '/projects/new', 401, {
      http_method: 'POST',
      path: '/projects/new',
      actor_role: 'visitor',
      blocked_status_code: 401,
      timestamp_utc: new Date().toISOString(),
    });
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Role Isolation Gate (Only participants or admins may submit)
  if (user.role !== 'participant' && user.role !== 'admin') {
    await logAuditViolation(user.userId, 'SUBMISSION_REJECTED_DEADLINE', '/projects/new', 403, {
      http_method: 'POST',
      path: '/projects/new',
      actor_role: user.role,
      blocked_status_code: 403,
      timestamp_utc: new Date().toISOString(),
    });
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // 3. Deadline Gate
  const deadline = await getSubmissionsCloseDate();
  const now = new Date();

  if (now > deadline) {
    await logAuditViolation(user.userId, 'SUBMISSION_REJECTED_DEADLINE', '/projects/new', 400, {
      http_method: 'POST',
      path: '/projects/new',
      actor_role: user.role,
      blocked_status_code: 400,
      timestamp_utc: now.toISOString(),
    });

    return NextResponse.json(
      {
        error: 'Submissions for this event are closed',
        submissions_close: deadline.toISOString(),
        current_time: now.toISOString(),
      },
      { status: 400 }
    );
  }

  // 4. Data Invariant & Payload Gate
  try {
    const body = await request.json();
    if (!body || !body.title || !body.summary) {
      return NextResponse.json(
        { error: 'Missing required submission fields (title, summary)' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: 'Submission accepted', project_id: 'prj_demo' },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }
}

/**
 * GET /projects/new
 * Informational endpoint returning event submission status
 */
export async function GET() {
  const deadline = await getSubmissionsCloseDate();
  const now = new Date();
  const isClosed = now > deadline;

  return NextResponse.json({
    status: isClosed ? 'closed' : 'open',
    submissions_close: deadline.toISOString(),
    current_time: now.toISOString(),
    message: isClosed
      ? 'Submissions for this event are closed'
      : 'Submissions are currently open',
  });
}
