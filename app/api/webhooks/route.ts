// app/api/webhooks/route.ts
// Webhook Registration and Management API (Organizer-Authenticated)
// Authoritative specification: TIER 4 (T4 - PLATFORM APIS & EXTENSIONS)

import { NextResponse, type NextRequest } from 'next/server';
import crypto from 'node:crypto';
import sql from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import type { DbWebhook } from '@/src/types/db';

export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser(request);

    if (!user.isAuthenticated || (user.role !== 'organizer' && user.role !== 'admin')) {
      return NextResponse.json({ error: 'Forbidden: Organizer access required' }, { status: 403 });
    }

    const webhooks = await sql<DbWebhook[]>`
      SELECT id, target_url, event_type, is_active, secret_token, created_at
      FROM webhooks
      ORDER BY id DESC;
    `;

    return NextResponse.json({
      count: webhooks.length,
      webhooks: webhooks.map((w) => ({
        id: w.id,
        target_url: w.target_url,
        event_type: w.event_type,
        is_active: w.is_active,
        secret_token: `${w.secret_token.slice(0, 8)}...${w.secret_token.slice(-4)}`,
        created_at: w.created_at,
      })),
    });
  } catch (error) {
    console.error('[API /api/webhooks] GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser(request);

    if (!user.isAuthenticated || (user.role !== 'organizer' && user.role !== 'admin')) {
      return NextResponse.json({ error: 'Forbidden: Organizer access required' }, { status: 403 });
    }

    let body: { target_url?: string; event_type?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    const { target_url, event_type } = body;

    if (!target_url || typeof target_url !== 'string') {
      return NextResponse.json({ error: 'target_url is required' }, { status: 400 });
    }

    try {
      const parsed = new URL(target_url);
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        return NextResponse.json({ error: 'target_url must be an http/https URL' }, { status: 400 });
      }
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
    }

    const event = (event_type && typeof event_type === 'string') ? event_type.trim() : '*';
    const secretToken = crypto.randomBytes(32).toString('hex');

    const inserted = await sql<DbWebhook[]>`
      INSERT INTO webhooks (target_url, event_type, is_active, secret_token)
      VALUES (${target_url.trim()}, ${event}, TRUE, ${secretToken})
      RETURNING id, target_url, event_type, is_active, secret_token, created_at;
    `;

    const row = inserted[0];

    return NextResponse.json(
      {
        success: true,
        message: 'Webhook registered successfully',
        webhook: {
          id: row.id,
          target_url: row.target_url,
          event_type: row.event_type,
          is_active: row.is_active,
          secret_token: row.secret_token, // Display full token once upon creation
          created_at: row.created_at,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[API /api/webhooks] POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
