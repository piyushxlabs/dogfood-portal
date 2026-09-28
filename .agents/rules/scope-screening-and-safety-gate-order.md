---
trigger: always_on
---

Every incoming HTTP request in Next.js Route Handlers (`app/api/...` and `app/projects/new`) must be evaluated in this exact order, short-circuiting on the first violation:
1. **Authentication Gate (`lib/auth.ts`):** Resolve session token via `Cookie: session=...` or `Authorization: Bearer ...` against the `sessions` table. If missing/invalid on protected endpoints, immediately return `NextResponse.json({ error: "Unauthorized" }, { status: 401 })`.
2. **Backend Role Isolation Gate (FIG. 02 Matrix):**
   - If a participant attempts to access any judge route (`/api/judge/scores`), immediately return `NextResponse.json({ error: "Forbidden" }, { status: 403 })`.
   - If a judge attempts to access peer judge scores (`/api/judge/scores?judge=judge_a` requested as `judge_b`), log an audit violation and immediately return `NextResponse.json({ error: "Forbidden" }, { status: 403 })`.
3. **Deadline Gate (`app/projects/new`):** For submission POST requests, check `Date.now() > event.submissions_close`. Since the fixture deadline (`2026-03-01T18:00:00Z`) is in the past, immediately return `NextResponse.json({ error: "Submissions closed" }, { status: 400 })`.
4. **Data Invariant & Payload Gate:** Validate payload against `src/types/db.ts` schemas before touching the database.
5. **Execution Gate:** Proceed to atomic database transaction or data streaming.

Do not reorder, merge, or bypass any of these security gates.