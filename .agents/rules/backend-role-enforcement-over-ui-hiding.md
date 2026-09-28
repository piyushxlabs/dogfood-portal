---
trigger: always_on
---

Role isolation and access control must be strictly enforced at the backend Route Handler level (`lib/auth.ts`), NEVER merely painted on or hidden in the frontend UI:
- `GET /api/judge/scores?judge=judge_a` requested with `judge_b` credentials MUST return HTTP 403 Forbidden.
- `GET /api/judge/scores` requested with `participant` credentials MUST return HTTP 403 Forbidden.
- Any unauthenticated request to protected endpoints MUST return HTTP 401 Unauthorized.

Similarly, deadline enforcement (`POST /projects/new`) must be evaluated in server-side code by checking `Date.now() > event.submissions_close` to immediately return HTTP 400 Bad Request — never depend on client-side form disabling alone.