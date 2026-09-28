// app/api/export.csv/route.ts
// High-throughput streaming CSV export Route Handler for Dogfood 2026
// Authoritative specification: ARCHITECTURE.md §7 & AGENT_MASTER_PLAN.md Step 9

import { NextRequest, NextResponse } from 'next/server';
import { requireRole, logAuditViolation } from '@/lib/auth';
import { getNormalizedLeaderboard, type LeaderboardRow } from '@/lib/normalization';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * Escapes a CSV field in compliance with RFC 4180 and sanitizes against formula injection.
 * - Null/undefined → empty string
 * - Numbers → raw string representation (numeric types cannot invoke spreadsheet formula engines)
 * - Strings starting with =, +, -, or @ → prepended with ' to neutralize injection
 * - Values containing commas, quotes, or newlines → wrapped in double-quotes per RFC 4180
 */
function escapeCsvField(val: string | number | null | undefined): string {
  if (val === null || val === undefined) return '';
  if (typeof val === 'number') return String(val);
  let str = String(val);

  // Formula injection prevention: sanitize text fields starting with formula trigger characters
  if (/^[=+\-@]/.test(str)) {
    str = `'${str}`;
  }

  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Formats a LeaderboardRow into a comma-delimited CSV line.
 */
function formatCsvRow(row: LeaderboardRow): string {
  const fields = [
    escapeCsvField(row.rank),
    escapeCsvField(row.project_id),
    escapeCsvField(row.project_title),
    escapeCsvField(row.track_name),
    escapeCsvField(row.team_name),
    escapeCsvField(row.reviews_count),
    escapeCsvField(row.raw_average_score.toFixed(2)),
    escapeCsvField(row.normalized_score.toFixed(2)),
    escapeCsvField(row.rank_delta),   // Explicit: numeric deltas (-6, +4, 0) are safe numbers
  ];
  return fields.join(',');
}

/**
 * GET /api/export.csv
 * Strict Role Isolation:
 * - Unauthenticated -> 401 Unauthorized
 * - Participant / Judge -> 403 Forbidden
 * - Organizer / Admin -> 200 OK with streamed CSV
 */
export async function GET(request: NextRequest): Promise<NextResponse | Response> {
  // Gate 1: Role Isolation Gate (Strictly organizer or admin per FIG. 02 Matrix)
  const guard = await requireRole(request, ['organizer', 'admin']);
  if (!guard.authorized) {
    return guard.response;
  }

  // Gate 2: Fetch calibrated leaderboard
  const rows = await getNormalizedLeaderboard();

  // Gate 3: Asynchronously log audit event for CSV export
  await logAuditViolation(
    guard.user.userId,
    'ORGANIZER_CSV_EXPORT',
    '/api/export.csv',
    200,
    {
      http_method: 'GET',
      path: '/api/export.csv',
      actor_role: guard.user.role,
      timestamp_utc: new Date().toISOString(),
    }
  );

  // Gate 4: Construct chunked streaming response
  const CSV_HEADER =
    'rank,project_id,project_title,track_name,team_name,reviews_count,raw_average_score,normalized_score,rank_delta';

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      // First line must strictly contain commas matching run.py assertion
      controller.enqueue(encoder.encode(CSV_HEADER + '\n'));
      for (const row of rows) {
        controller.enqueue(encoder.encode(formatCsvRow(row) + '\n'));
      }
      controller.close();
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="dogfood_results_export.csv"',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
