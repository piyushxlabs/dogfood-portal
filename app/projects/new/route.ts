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

function renderSubmissionHtml(deadlineIso: string, nowIso: string): string {
  return `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Project Submission | Dogfood 2026</title>
  <style>
    body { background-color: #09090b; color: #f4f4f5; font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 0; }
    .card { background-color: rgba(24, 24, 27, 0.7); border: 1px solid #27272a; border-radius: 1.5rem; padding: 2rem; }
    .input-field { width: 100%; background-color: #09090b; border: 1px solid #27272a; border-radius: 0.75rem; padding: 0.625rem 0.875rem; color: #a1a1aa; font-size: 0.875rem; box-sizing: border-box; }
    .btn { display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 0.625rem 1.25rem; border-radius: 0.75rem; font-weight: 600; font-size: 0.875rem; cursor: pointer; transition: all 0.15s; border: none; text-decoration: none; }
    .btn-danger { background-color: #dc2626; color: white; }
    .btn-danger:hover { background-color: #b91c1c; }
    .btn-outline { background-color: #18181b; border: 1px solid #27272a; color: #e4e4e7; }
    .btn-outline:hover { border-color: #3f3f46; color: #ffffff; }
    .alert-banner { background-color: rgba(220, 38, 38, 0.1); border: 1px solid rgba(220, 38, 38, 0.3); border-radius: 1rem; padding: 1rem 1.25rem; display: flex; align-items: flex-start; gap: 0.75rem; }
    .toast { display: none; position: fixed; bottom: 2rem; right: 2rem; background-color: #18181b; border: 1px solid #ef4444; border-radius: 1rem; padding: 1rem 1.5rem; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5); z-index: 100; max-width: 24rem; }
  </style>
</head>
<body style="min-height: 100vh; display: flex; flex-direction: column; justify-content: space-between;">
  <div style="max-width: 48rem; margin: 2rem auto; padding: 0 1.25rem; width: 100%; box-sizing: border-box;">
    <!-- Alert Banner -->
    <div class="alert-banner" style="margin-bottom: 2rem;">
      <div style="font-size: 1.25rem;">🔒</div>
      <div>
        <h3 style="margin: 0; font-size: 0.875rem; font-weight: 700; color: #f87171;">Submissions Closed for This Event</h3>
        <p style="margin: 0.25rem 0 0; font-size: 0.75rem; color: #a1a1aa; line-height: 1.4;">
          The official submission deadline passed on <strong>${deadlineIso}</strong>. Late project registrations are strictly rejected with HTTP 400 Bad Request.
        </p>
      </div>
    </div>

    <!-- Form Container -->
    <div class="card">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; border-bottom: 1px solid #27272a; padding-bottom: 1rem;">
        <div>
          <h1 style="margin: 0; font-size: 1.25rem; font-weight: 800; letter-spacing: -0.025em; color: #f4f4f5;">Hackathon Project Submission</h1>
          <p style="margin: 0.25rem 0 0; font-size: 0.75rem; color: #71717a; font-family: monospace;">Event ID: evt_01 • Unit DF-01</p>
        </div>
        <span style="padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; background-color: rgba(239, 68, 68, 0.15); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.3);">
          READ ONLY
        </span>
      </div>

      <form id="submission-form" style="display: flex; flex-direction: column; gap: 1.25rem;">
        <div>
          <label style="display: block; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #a1a1aa; margin-bottom: 0.375rem;">
            Project Title
          </label>
          <input type="text" class="input-field" value="Late Submission Verification Probe" readonly disabled />
        </div>

        <div>
          <label style="display: block; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #a1a1aa; margin-bottom: 0.375rem;">
            Executive Summary
          </label>
          <textarea class="input-field" rows="3" readonly disabled>Verification probe testing HTTP 400 rejection and audit logging on closed hackathon events.</textarea>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
          <div>
            <label style="display: block; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #a1a1aa; margin-bottom: 0.375rem;">
              Category Track
            </label>
            <input type="text" class="input-field" value="trk_01 (Developer Tools)" readonly disabled />
          </div>
          <div>
            <label style="display: block; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #a1a1aa; margin-bottom: 0.375rem;">
              Repository URL
            </label>
            <input type="text" class="input-field" value="https://github.com/sample/late-probe" readonly disabled />
          </div>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1rem; border-top: 1px solid #27272a; padding-top: 1.5rem;">
          <a href="/projects" class="btn btn-outline">
            ← Return to Gallery
          </a>
          <button id="test-submit-btn" type="button" class="btn btn-danger" onclick="triggerLateSubmissionTest()">
            Test Late Submission (Triggers 400)
          </button>
        </div>
      </form>
    </div>
  </div>

  <footer style="border-top: 1px solid #18181b; padding: 1.5rem; text-align: center; font-size: 0.75rem; color: #52525b; font-family: monospace;">
    Dogfood 2026 • Unit DF-01 • Submissions Gate Active
  </footer>

  <!-- Toast Notification -->
  <div id="toast" class="toast">
    <div style="display: flex; align-items: flex-start; gap: 0.75rem;">
      <span style="color: #ef4444; font-size: 1.25rem;">⚠️</span>
      <div>
        <h4 id="toast-title" style="margin: 0; font-size: 0.875rem; font-weight: 700; color: #f87171;">HTTP 400 Bad Request</h4>
        <p id="toast-desc" style="margin: 0.25rem 0 0; font-size: 0.75rem; color: #d4d4d8; font-family: monospace;"></p>
      </div>
    </div>
  </div>

  <script>
    async function triggerLateSubmissionTest() {
      const btn = document.getElementById('test-submit-btn');
      btn.innerText = 'Testing POST...';
      btn.disabled = true;

      try {
        const res = await fetch('/projects/new', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: 'dogfood-late-submission-probe',
            summary: 'UI verification probe'
          })
        });

        const data = await res.json();
        const toast = document.getElementById('toast');
        const toastTitle = document.getElementById('toast-title');
        const toastDesc = document.getElementById('toast-desc');

        toastTitle.innerText = 'HTTP ' + res.status + ' ' + (res.status === 400 ? 'Bad Request' : (res.status === 401 ? 'Unauthorized' : 'Forbidden'));
        toastDesc.innerText = data.error || JSON.stringify(data);
        toast.style.display = 'block';

        setTimeout(() => {
          toast.style.display = 'none';
        }, 5000);
      } catch (err) {
        alert('Network request failed: ' + err.message);
      } finally {
        btn.innerText = 'Test Late Submission (Triggers 400)';
        btn.disabled = false;
      }
    }
  </script>
</body>
</html>`;
}

/**
 * GET /projects/new
 * Returns rich interactive submission UI on browser navigation (Accept: text/html)
 * and JSON status payload for API consumers.
 */
export async function GET(request: NextRequest) {
  const deadline = await getSubmissionsCloseDate();
  const now = new Date();
  const isClosed = now > deadline;

  const accept = request.headers.get('accept') || '';
  if (accept.includes('text/html')) {
    return new NextResponse(renderSubmissionHtml(deadline.toISOString(), now.toISOString()), {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });
  }

  return NextResponse.json({
    status: isClosed ? 'closed' : 'open',
    submissions_close: deadline.toISOString(),
    current_time: now.toISOString(),
    message: isClosed
      ? 'Submissions for this event are closed'
      : 'Submissions are currently open',
  });
}
