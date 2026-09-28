// lib/auth.ts
// Session extraction, role isolation, and audit logging engine
// Authoritative specification: ARCHITECTURE.md §3-§4 & SYSTEM_SCOPE_AND_BEHAVIOR.md §4

import { NextResponse, type NextRequest } from 'next/server';
import sql from '@/lib/db';
import type { UserRole, AuditAction, AuditLogPayload } from '@/src/types/db';

export interface SessionUser {
  userId: string | null;
  role: UserRole | 'visitor';
  sessionId: string | null;
  isAuthenticated: boolean;
}

/**
 * Extracts session token from Cookie header (session=...) or Authorization header (Bearer ...)
 */
export function extractSessionToken(request: Request | NextRequest): string | null {
  // 1. Check Cookie header
  const cookieHeader = request.headers.get('cookie') || request.headers.get('Cookie');
  if (cookieHeader) {
    const match = cookieHeader.match(/(?:^|;\s*)session=([^;]+)/);
    if (match && match[1]) {
      return decodeURIComponent(match[1].trim());
    }
  }

  // 2. Check Authorization header
  const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
  if (authHeader) {
    const bearerMatch = authHeader.match(/^Bearer\s+(.+)$/i);
    if (bearerMatch && bearerMatch[1]) {
      return bearerMatch[1].trim();
    }
    // Also handle raw session token in authorization header if passed directly
    return authHeader.trim();
  }

  return null;
}

/**
 * Resolves session token against database sessions table
 */
export async function getSessionUser(request: Request | NextRequest): Promise<SessionUser> {
  const token = extractSessionToken(request);

  if (!token) {
    return {
      userId: null,
      role: 'visitor',
      sessionId: null,
      isAuthenticated: false,
    };
  }

  try {
    const rows = await sql<
      { session_id: string; user_id: string; role: string; expires_at: Date }[]
    >`
      SELECT session_id, user_id, role, expires_at
      FROM sessions
      WHERE session_id = ${token}
        AND expires_at > NOW()
      LIMIT 1;
    `;

    if (!rows || rows.length === 0) {
      return {
        userId: null,
        role: 'visitor',
        sessionId: null,
        isAuthenticated: false,
      };
    }

    const row = rows[0];
    return {
      userId: row.user_id,
      role: row.role as UserRole,
      sessionId: row.session_id,
      isAuthenticated: true,
    };
  } catch (err) {
    console.error('[AUTH] Database error during session resolution:', err);
    return {
      userId: null,
      role: 'visitor',
      sessionId: null,
      isAuthenticated: false,
    };
  }
}

export type RoleGuardResult =
  | { authorized: true; user: SessionUser; response?: never }
  | { authorized: false; user: SessionUser | null; response: NextResponse };

/**
 * Backend Role Isolation Guard implementing FIG. 02 Matrix
 * Evaluates requests in strict safety order:
 * 1. Missing/invalid session -> 401 Unauthorized
 * 2. Valid session with role not in allowedRoles -> 403 Forbidden
 * 3. Authorized -> returns SessionUser
 */
export async function requireRole(
  request: Request | NextRequest,
  allowedRoles: UserRole[]
): Promise<RoleGuardResult> {
  const user = await getSessionUser(request);

  if (!user.isAuthenticated) {
    return {
      authorized: false,
      user: null,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    };
  }

  if (user.role === 'visitor' || !allowedRoles.includes(user.role as UserRole)) {
    return {
      authorized: false,
      user,
      response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
    };
  }

  return {
    authorized: true,
    user,
  };
}

/**
 * Logs security audit events asynchronously without blocking or failing the request
 */
export async function logAuditViolation(
  actorId: string | null,
  action: AuditAction,
  targetResource: string,
  statusCode: number,
  payload?: AuditLogPayload
): Promise<void> {
  try {
    const snapshotJson = payload ? JSON.stringify(payload) : null;
    await sql`
      INSERT INTO audit_logs (actor_id, action, target_resource, status_code, payload_snapshot)
      VALUES (${actorId}, ${action}, ${targetResource}, ${statusCode}, ${snapshotJson}::jsonb);
    `;
  } catch (err) {
    console.warn('[AUDIT] Failed to record audit log:', err);
  }
}
