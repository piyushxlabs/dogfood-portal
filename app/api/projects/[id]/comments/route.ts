// app/api/projects/[id]/comments/route.ts
// Project discussion comments endpoint with XSS sanitization
// Authoritative specification: TIER 3 (T3 - PUBLIC COMMUNITY & ANTI-ABUSE TIER)

import { NextResponse, type NextRequest } from 'next/server';
import sql from '@/lib/db';

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

/**
 * XSS sanitizer: strips all HTML tags entirely, leaving clean plain text.
 * React JSX will then safely render the result without double-encoding HTML entities.
 * This prevents both XSS injection and the &lt;/&gt; double-escape rendering defect.
 */
function sanitizeText(input: string): string {
  // Remove all HTML tags (including self-closing and malformed variants)
  const stripped = input.replace(/<[^>]*>/g, '');
  // Also decode any entity-encoded tags that could bypass the strip
  const decoded = stripped
    .replace(/&lt;/gi, '<').replace(/&gt;/gi, '>')
    .replace(/<[^>]*>/g, ''); // Strip again after entity decode
  return decoded.trim();
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const projectId = id.trim();

    // Verify project exists
    const projectRows = await sql<{ id: string }[]>`
      SELECT id FROM projects WHERE id = ${projectId} LIMIT 1;
    `;

    if (projectRows.length === 0) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const comments = await sql<
      {
        id: number;
        project_id: string;
        author_name: string;
        author_email: string;
        comment_text: string;
        created_at: Date | string;
      }[]
    >`
      SELECT id, project_id, author_name, author_email, comment_text, created_at
      FROM project_comments
      WHERE project_id = ${projectId}
      ORDER BY created_at DESC;
    `;

    return NextResponse.json({
      project_id: projectId,
      count: comments.length,
      comments: comments.map((c) => ({
        id: c.id,
        project_id: c.project_id,
        author_name: c.author_name,
        // Partially mask email for privacy
        author_email_masked: c.author_email.replace(/^(.)(.*)(@.*)$/, (_m, a, b, c) => `${a}${'*'.repeat(Math.min(b.length, 5))}${c}`),
        comment_text: c.comment_text,
        created_at: typeof c.created_at === 'string' ? c.created_at : c.created_at.toISOString(),
      })),
    });
  } catch (error) {
    console.error('[API /api/projects/[id]/comments] GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const projectId = id.trim();

    // Verify project exists
    const projectRows = await sql<{ id: string }[]>`
      SELECT id FROM projects WHERE id = ${projectId} LIMIT 1;
    `;

    if (projectRows.length === 0) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    let body: { author_name?: string; author_email?: string; comment_text?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    const { author_name, author_email, comment_text } = body;

    // Validate fields
    if (!author_name || typeof author_name !== 'string' || author_name.trim().length === 0) {
      return NextResponse.json({ error: 'author_name is required' }, { status: 400 });
    }

    if (!author_email || typeof author_email !== 'string' || !EMAIL_REGEX.test(author_email.trim())) {
      return NextResponse.json({ error: 'Valid author_email is required' }, { status: 400 });
    }

    if (!comment_text || typeof comment_text !== 'string' || comment_text.trim().length === 0) {
      return NextResponse.json({ error: 'comment_text is required' }, { status: 400 });
    }

    if (comment_text.trim().length > 2000) {
      return NextResponse.json({ error: 'comment_text exceeds 2000 characters limit' }, { status: 400 });
    }

    // Apply XSS sanitization
    const cleanAuthor = sanitizeText(author_name.trim().slice(0, 100));
    const cleanEmail = author_email.trim().toLowerCase();
    const cleanComment = sanitizeText(comment_text.trim());

    const inserted = await sql<
      {
        id: number;
        project_id: string;
        author_name: string;
        author_email: string;
        comment_text: string;
        created_at: Date;
      }[]
    >`
      INSERT INTO project_comments (project_id, author_name, author_email, comment_text)
      VALUES (${projectId}, ${cleanAuthor}, ${cleanEmail}, ${cleanComment})
      RETURNING id, project_id, author_name, author_email, comment_text, created_at;
    `;

    const row = inserted[0];

    return NextResponse.json(
      {
        success: true,
        message: 'Comment posted successfully',
        comment: {
          id: row.id,
          project_id: row.project_id,
          author_name: row.author_name,
          comment_text: row.comment_text,
          created_at: row.created_at.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[API /api/projects/[id]/comments] POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
