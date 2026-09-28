
# ARCHITECTURE.md
**Project:** Dogfood 2026 Hackathon PortalÂ Â 
**Document:** System Architecture, Offline Runtime Topology & Security MatrixÂ Â 
**Standard:** Rev 2.6 / Unit DF-01Â Â 
**Status:** AUTHORITATIVE & LOCKEDÂ Â 

---

## 1. ARCHITECTURAL OVERVIEW & THE ZERO-DEPENDENCY MANDATE

Dogfood Hackathon Portal is a production-grade, self-hostable web application engineered to run Hackathon Raptors' real-world hackathons on an offline laptop without any internet connection[cite: 1, 5].

**Unified Framework:** The platform is a **Full-Stack Next.js (App Router, TypeScript)** application. React Server Components handle server-side rendering; Next.js Route Handlers under `app/api/...` serve as the backend API. Tailwind CSS + Shadcn UI + Lucide Icons form the UI layer. Everything coexists on Port 8080 with zero reverse-proxy overhead.


```

```
Â  Â  Â  Â  Â  Â  Â  Â  Â â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
Â  Â  Â  Â  Â  Â  Â  Â  Â â”‚Â  Â  Â  Â  Â  HOST LAPTOP (AIR-GAPPED / NO WI-FI)Â  Â  Â  Â  Â  Â â”‚
Â  Â  Â  Â  Â  Â  Â  Â  Â â”‚Â  Â  Â  Â  Â  Â  Â  Â  Â  Â  Â  Â  Â  Â  Â  Â  Â  Â  Â  Â  Â  Â  Â  Â  Â  Â  Â  Â  â”‚

```

HTTP Requests â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€> [ Port 8080 ]Â  Â  Â  Â  Â  Â  Â  Â  Â  Â  Â  Â  Â  Â  Â  Â  Â  Â  Â  Â â”‚
(Browser / run.py)Â  Â â”‚Â  Â  Â  Â  Â â”‚Â  Â  Â  Â  Â  Â  Â  Â  Â  Â  Â  Â  Â  Â  Â  Â  Â  Â  Â  Â  Â  Â  Â  â”‚
â”‚Â  Â  Â  Â  Â â–¼Â  Â  Â  Â  Â  Â  Â  Â  Â  Â  Â  Â  Â  Â  Â  Â  Â  Â  Â  Â  Â  Â  Â  â”‚
â”‚Â  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”Â  â”‚
â”‚Â  â”‚Â  Â  Â  Â  Â  Â  DOCKER COMPOSE RUNTIMEÂ  Â  Â  Â  Â  Â  Â  Â  â”‚Â  â”‚
â”‚Â  â”‚Â  Â  Â  Â  Â  Â  Â  Â  Â  Â  Â  Â  Â  Â  Â  Â  Â  Â  Â  Â  Â  Â  Â  Â  Â  â”‚Â  â”‚
â”‚Â  â”‚Â  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”Â  â”‚Â  â”‚
â”‚Â  â”‚Â  â”‚Â  Â  Â  Â  Â  CORE APPLICATION ENGINEÂ  Â  Â  Â  Â  Â â”‚Â  â”‚Â  â”‚
â”‚Â  â”‚Â  â”‚Â  â”œâ”€â”€ Reverse Proxy / Static File ServerÂ  Â  â”‚Â  â”‚Â  â”‚
â”‚Â  â”‚Â  â”‚Â  â”œâ”€â”€ RBAC & Session Middleware (FIG. 02)Â  Â â”‚Â  â”‚Â  â”‚
â”‚Â  â”‚Â  â”‚Â  â”œâ”€â”€ Deadline Enforcement GatekeeperÂ  Â  Â  Â â”‚Â  â”‚Â  â”‚
â”‚Â  â”‚Â  â”‚Â  â”œâ”€â”€ Scoring & Normalization EngineÂ  Â  Â  Â  â”‚Â  â”‚Â  â”‚
â”‚Â  â”‚Â  â”‚Â  â””â”€â”€ CSV Streaming PipelineÂ  Â  Â  Â  Â  Â  Â  Â  â”‚Â  â”‚Â  â”‚
â”‚Â  â”‚Â  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜Â  â”‚Â  â”‚
â”‚Â  â”‚Â  Â  Â  Â  Â  Â  Â  Â  Â  Â  Â  Â  â”‚ (Local TCP/Socket)Â  Â  Â  â”‚Â  â”‚
â”‚Â  â”‚Â  Â  Â  Â  Â  Â  Â  Â  Â  Â  Â  Â  â–¼Â  Â  Â  Â  Â  Â  Â  Â  Â  Â  Â  Â  Â â”‚Â  â”‚
â”‚Â  â”‚Â  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”Â  â”‚Â  â”‚
â”‚Â  â”‚Â  â”‚Â  Â  Â  Â  Â  Â RELATIONAL DATABASEÂ  Â  Â  Â  Â  Â  Â  â”‚Â  â”‚Â  â”‚
â”‚Â  â”‚Â  â”‚Â  Â  Â  (PostgreSQL 16 / SQLite Engine)Â  Â  Â  Â â”‚Â  â”‚Â  â”‚
â”‚Â  â”‚Â  â”‚Â  â””â”€â”€ Seeded at Boot via fixtures.jsonÂ  Â  Â  â”‚Â  â”‚Â  â”‚
â”‚Â  â”‚Â  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜Â  â”‚Â  â”‚
â”‚Â  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜Â  â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜

```

### The Hard Boundary Constraints:
1. **Air-Gapped Execution:** After the container boots, the platform will not ping any external CDN, remote database, cloud auth provider (Clerk, Auth0, Supabase), or third-party API[cite: 1, 5].
2. **Single-Command Startup:** Executing only `docker compose up` will initialize the database, migrate the relational schema, seed `fixtures.json`, print test session cookies to stdout, and start the web server listening on `http://localhost:8080`[cite: 1, 4, 5].
3. **Automated Verification Contract:** The system's internal architecture will satisfy all 7 HTTP assertions in `run.py` with 100% deterministic behavior[cite: 2, 5].

---

## 2. HIGH-LEVEL SYSTEM TOPOLOGY & COMPONENTS

The architecture is organized into modular layers:

### 2.1 Web & API Routing Gateway (Next.js App Router)
* **Port Binding:** The container is bound to the host port `8080` par bind hota hai (`http://localhost:8080`)[cite: 4, 5].
* **Route Structure:**
Â  * `GET /projects`: Public submissions gallery (unauthenticated access permitted)[cite: 2, 4].
Â  * `POST /projects/new`: Project submission intake endpoint (enforces deadline checks)[cite: 2, 4].
Â  * `GET /api/judge/scores`: Role-isolated judge evaluation endpoint[cite: 2, 4].
Â  * `GET /api/export.csv`: High-throughput organizer results export[cite: 2, 4].
Â  * `GET /health`: Readiness probe that verifies the database connection.

### 2.2 Relational Data Persistence Layer
* **Database Choice:** Local PostgreSQL container (or an embedded SQLite database with WAL mode enabled).
* **Isolation:** The database port is exposed only on the internal Docker network; no external database setup is required on the host machine[cite: 1, 5].
* **Boot-Time Transactional Seeding:** The container startup script checks whether the database is initialized. If it is empty, it inserts `fixtures.json` in a single atomic SQL transaction[cite: 1, 3, 5].

---

## 3. LOCAL AUTHENTICATION & SESSION LIFECYCLE ENGINE

During hackathon evaluation, login forms differ across stacks, so `run.py` never visits a login page; it attaches HTTP headers directly[cite: 1, 5].

### 3.1 Pre-Seeded Deterministic Sessions
At startup, the platform creates 4 fixed test accounts in the `sessions` table and emits a log in the exact format below to the container terminal[cite: 1, 4]:

```text
======================================================================
DOGFOOD PORTAL SEEDED SUCCESSFULLY
Test Logins & Auth Headers:
Â  organizerÂ  Â  Cookie: session=org_7f2a
Â  judge_aÂ  Â  Â  Cookie: session=jdg_a_91bc
Â  judge_bÂ  Â  Â  Cookie: session=jdg_b_44de
Â  participantÂ  Cookie: session=prt_2e88
======================================================================

```

### 3.2 Session Resolution Middleware Flow

Every incoming HTTP request passes through this pipeline:

```
[ Incoming Request ]
Â  Â  Â  Â  â”‚
Â  Â  Â  Â  â–¼
Extract Header: request.headers['Cookie'] OR request.headers['Authorization']
Â  Â  Â  Â  â”‚
Â  Â  Â  Â  â”œâ”€â”€ No Header Present? â”€â”€> Attach Actor: role = 'visitor', user_id = NULL
Â  Â  Â  Â  â”‚
Â  Â  Â  Â  â””â”€â”€ Token Found? (e.g., session=jdg_a_91bc)
Â  Â  Â  Â  Â  Â  Â  Â  â”‚
Â  Â  Â  Â  Â  Â  Â  Â  â–¼
Â  Â  Â  Â  Query Table `sessions` WHERE session_id = token AND expires_at > NOW()
Â  Â  Â  Â  Â  Â  Â  Â  â”‚
Â  Â  Â  Â  Â  Â  Â  Â  â”œâ”€â”€ Valid Session? â”€â”€> Attach Actor: role = session.role, user_id = session.user_id
Â  Â  Â  Â  Â  Â  Â  Â  â””â”€â”€ Invalid / Expired? â”€â”€> Return HTTP 401 Unauthorized

```

---

## 4. BACKEND-ENFORCED ROLE ISOLATION (FIG. 02 MATRIX)

The organizers have issued a clear mandate: *"Hiding another judge's scores in your template is not refusing. The check has to live in the backend, because the backend is where curl arrives"*.

### 4.1 Permission Enforcement Matrix

This matrix is strictly enforced at the middleware level in the backend controller:

| Actor Role | Own Scores | Peer Scores | Other Track Scores | Aggregate Results | Audit Log |
| --- | --- | --- | --- | --- | --- |
| **VISITOR** | âœ— (401) | âœ— (401) | âœ— (401) | âœ— (401) | âœ— (401) |
| **PARTICIPANT** | âœ— (403) | âœ— (403) | âœ— (403) | âœ— (403) | âœ— (403) |
| **JUDGE** | **+ (200)** | âœ— (403) | âœ— (403) | âœ— (403) | âœ— (403) |
| **ORGANIZER** | **+ (200)** | **+ (200)** | **+ (200)** | **+ (200)** | **+ (200)** |
| **ADMIN** | **+ (200)** | **+ (200)** | **+ (200)** | **+ (200)** | **+ (200)** |

Legend: `+ = PERMITTED (200 OK)` | `âœ— = REFUSED AT API (401 Unauthorized / 403 Forbidden)`.

### 4.2 Peer Score Isolation Implementation Logic

The `run.py` test `T2.judge_cannot_see_peer_scores` attempts to access another judge's score through a query parameter:
`GET /api/judge/scores?judge=judge_a` (Header: `judge_b`).

Backend Route Handler & authorization helper blueprint (`lib/auth.ts` / `app/api/judge/scores/route.ts`):

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getSessionUser, SessionUser } from "@/lib/auth";

export async function verifyJudgeScoreAccess(
  request: NextRequest,
  targetJudgeId?: string | null
): Promise<{ user?: SessionUser; errorResponse?: NextResponse }> {
  const user = await getSessionUser(request);

  // Rule 1: Visitor check (Unauthenticated -> HTTP 401)
  if (!user) {
    return {
      errorResponse: NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      ),
    };
  }

  // Rule 2: Participant block (T2.participant_blocked check -> HTTP 403)
  if (user.role === "participant") {
    return {
      errorResponse: NextResponse.json(
        { error: "Forbidden: Participants cannot access judge scores" },
        { status: 403 }
      ),
    };
  }

  // Rule 3: Organizer & Admin bypass (Permitted -> returns user session)
  if (user.role === "organizer" || user.role === "admin") {
    return { user };
  }

  // Rule 4: Judge peer isolation (T2.judge_cannot_see_peer_scores check -> HTTP 403)
  if (user.role === "judge") {
    if (targetJudgeId && targetJudgeId !== user.id) {
      // Audit log entry for security failure
      console.warn(
        `[AUDIT] PEER_SCORE_PROBE_BLOCKED: actor=${user.id}, target=${targetJudgeId}`
      );
      return {
        errorResponse: NextResponse.json(
          { error: "Forbidden: Judges cannot access peer ballots" },
          { status: 403 }
        ),
      };
    }
    return { user };
  }

  return {
    errorResponse: NextResponse.json(
      { error: "Forbidden: Access denied" },
      { status: 403 }
    ),
  };
}

// Next.js Route Guard Helper Syntax
export async function requireRole(
  request: NextRequest,
  allowedRoles: string[]
): Promise<{ user?: SessionUser; errorResponse?: NextResponse }> {
  const user = await getSessionUser(request);
  if (!user) {
    return {
      errorResponse: NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      ),
    };
  }
  if (!allowedRoles.includes(user.role)) {
    return {
      errorResponse: NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      ),
    };
  }
  return { user };
}
```

---

## 5. SUBMISSION ENGINE & STRICT DEADLINE GATEKEEPER

Test `T1.closed_event_refuses_submissions` verifies whether participant submissions are blocked after the deadline has closed.

```
[ POST /projects/new as Participant ]
Â  Â  Â  Â  Â  Â  Â  Â â”‚
Â  Â  Â  Â  Â  Â  Â  Â â–¼
Query Table `events` for Active Event
Â  Â  Â  Â  Â  Â  Â  Â â”‚
Â  Â  Â  Â  Â  Â  Â  Â â–¼
Is CURRENT_TIMESTAMP_UTC > events.submissions_close?
Â  Â  Â  Â  Â  Â  Â  Â â”‚
Â  Â  Â  Â  Â  Â  Â  Â â”œâ”€â”€ YES (Past Deadline):
Â  Â  Â  Â  Â  Â  Â  Â â”‚Â  Â  Â â”œâ”€â”€ Log Audit Entry: 'LATE_SUBMISSION_REJECTED'
Â  Â  Â  Â  Â  Â  Â  Â â”‚Â  Â  Â â””â”€â”€ RETURN HTTP 400 Bad Request / 403 Forbidden [PASS T1 Check]
Â  Â  Â  Â  Â  Â  Â  Â â”‚
Â  Â  Â  Â  Â  Â  Â  Â â””â”€â”€ NO (Event Open):
Â  Â  Â  Â  Â  Â  Â  Â  Â  Â  Â â”œâ”€â”€ Validate Team Membership & Required Fields
Â  Â  Â  Â  Â  Â  Â  Â  Â  Â  Â â”œâ”€â”€ Insert Project Record (`is_draft` = False)
Â  Â  Â  Â  Â  Â  Â  Â  Â  Â  Â â””â”€â”€ RETURN HTTP 201 Created

```

*Data Note:* In `fixtures.json`, event `evt_01` has a `submissions_close` timestamp of `2026-03-01T18:00:00Z`, which is a past date. Therefore, immediately after seeding, the portal will automatically refuse late submissions.

---

## 6. SCORING & NORMALIZATION PIPELINE

The scoring engine converts human judge evaluations into mathematically calibrated results:

```
[ Judge Submits Ballot: raw_criteria = {func: 4, qual: 3, innov: 2} ]
Â  Â  Â  Â  Â  Â  Â  Â  Â  Â  Â  Â  Â  Â  Â â”‚
Â  Â  Â  Â  Â  Â  Â  Â  Â  Â  Â  Â  Â  Â  Â â–¼
Compute Raw Weighted Score: S_ij = (0.40 * 4) + (0.35 * 3) + (0.25 * 2) = 3.15
Â  Â  Â  Â  Â  Â  Â  Â  Â  Â  Â  Â  Â  Â  Â â”‚
Â  Â  Â  Â  Â  Â  Â  Â  Â  Â  Â  Â  Â  Â  Â â–¼
Insert / Update Atomic Row in Table `scores` (UNIQUE constraint on judge_id, project_id)
Â  Â  Â  Â  Â  Â  Â  Â  Â  Â  Â  Â  Â  Â  Â â”‚
Â  Â  Â  Â  Â  Â  Â  Â  Â  Â  Â  Â  Â  Â  Â â–¼
[ Normalization Triggered (On-Demand or Query-Time) ]
Â  1. Compute Judge Mean (mu_j) & Sample Standard Deviation (sigma_j) across all projects judged by j
Â  2. Compute Regularized Z-score: z_ij = (S_ij - mu_j) / (sigma_j + 0.0001)
Â  3. Rescale to 1-5 Scale: S'_ij = 3.00 + (z_ij * 0.85)
Â  4. Aggregate Project Score: P_i = AVG(S'_ij across all assigned judges)
Â  5. Calibrate Leaderboard: Achieves variance reduction from sigma = 0.94 to sigma = 0.31

```

---

## 7. STREAMING CSV DATA EXPORT PIPELINE

Acceptance suite test `T2.csv_export` enforces that the route `GET /api/export.csv` streams valid CSV when called by the organizer role and that the first line of the body contains a comma (`,`).

### 7.1 Export Architecture

1. **Access Gate:** Endpoint allows only `organizer` or `admin` session cookies; unauthorized requests return `401`/`403`.


2. **Memory Efficiency:** Instead of buffering 40+ projects and their scores in memory, the data is streamed in chunks using a database cursor.
3. **Response Headers:**
* `Content-Type: text/csv; charset=utf-8`
* `Content-Disposition: attachment; filename="dogfood_results_export.csv"`


4. **Header Line Definition:**
`rank,project_id,project_title,track_name,team_name,reviews_count,raw_average_score,normalized_score,rank_delta`

---

## 8. DOCKER COMPOSE TOPOLOGY & CONTAINER LIFECYCLE

The entire platform starts offline without any external build step.

### 8.1 Multi-Container Compose Configuration (`docker-compose.yml`)

```yaml
version: '3.8'

services:
Â  db:
Â  Â  image: postgres:16-alpine
Â  Â  container_name: dogfood-postgres
Â  Â  restart: unless-stopped
Â  Â  environment:
Â  Â  Â  POSTGRES_DB: dogfood_db
Â  Â  Â  POSTGRES_USER: dogfood_user
Â  Â  Â  POSTGRES_PASSWORD: dogfood_secure_password_local
Â  Â  volumes:
Â  Â  Â  - pgdata:/var/lib/postgresql/data
Â  Â  healthcheck:
Â  Â  Â  test: ["CMD-SHELL", "pg_isready -U dogfood_user -d dogfood_db"]
Â  Â  Â  interval: 2s
Â  Â  Â  timeout: 3s
Â  Â  Â  retries: 10

Â  web:
Â  Â  build:
Â  Â  Â  context: .
Â  Â  Â  dockerfile: Dockerfile
Â  Â  container_name: dogfood-portal
Â  Â  restart: unless-stopped
Â  Â  ports:
Â  Â  Â  - "8080:8080"
Â  Â  environment:
Â  Â  Â  DATABASE_URL: postgresql://dogfood_user:dogfood_secure_password_local@db:5432/dogfood_db
Â  Â  Â  PORTAL_PORT: 8080
Â  Â  Â  FIXTURES_PATH: /app/fixtures.json
Â  Â  depends_on:
Â  Â  Â  db:
Â  Â  Â  Â  condition: service_healthy
Â  Â  volumes:
Â  Â  Â  - ./fixtures.json:/app/fixtures.json:ro

volumes:
Â  pgdata:

```

### 8.2 Multi-Stage Next.js Dockerfile (Air-Gapped Standalone)

```dockerfile
# Stage 1: Dependency install (layer-cached — copy lock files FIRST)
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --frozen-lockfile

# Stage 2: Next.js Production Build (output: 'standalone')
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Stage 3: Lean Runtime Image (no npm install at runtime)
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=8080
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY fixtures.json ./fixtures.json
COPY scripts/seed.mjs ./scripts/seed.mjs
EXPOSE 8080
CMD ["sh", "-c", "node scripts/migrate.mjs && node scripts/seed.mjs && node server.js"]
```

### 8.3 Container Boot & Seeding Sequence

The standalone Next.js server requires no ``npm install``. The CMD sequence:
1. ``node scripts/migrate.mjs`` — creates tables if not exists (idempotent DDL).
2. ``node scripts/seed.mjs`` — ingests ``fixtures.json`` in a single transaction; emits test auth headers to stdout: ``Cookie: session=org_7f2a | jdg_a_91bc | jdg_b_44de | prt_2e88``.
3. ``node server.js`` — starts the Next.js standalone server on Port 8080.


---

## 9. ACCEPTANCE SUITE ROUTE MAPPING CONTRACT (`.dogfood.toml`)

The root file `.dogfood.toml` maps the portal's exact routes and pre-seeded cookies to the `run.py` checker:

```toml
[portal]
base_url = "http://localhost:8080"

[tiers]
claimed = ["T1", "T2"]
pitch = "Self-contained, offline-first hackathon portal with mathematical Z-score normalization and backend-enforced RBAC isolation."

[auth]
organizerÂ  Â = "Cookie: session=org_7f2a"
judge_aÂ  Â  Â = "Cookie: session=jdg_a_91bc"
judge_bÂ  Â  Â = "Cookie: session=jdg_b_44de"
participant = "Cookie: session=prt_2e88"

[routes]
galleryÂ  Â  Â  = "/projects"
submitÂ  Â  Â  Â = "/projects/new"
judge_scores = "/api/judge/scores"
peer_scoresÂ  = "/api/judge/scores?judge=judge_a"
csv_exportÂ  Â = "/api/export.csv"

```

---

## 10. ARCHITECTURAL INTEGRITY VERIFICATION

The Coding Agent must ensure these 6 validation checkpoints during implementation:

* [ ] After disconnecting Wi-Fi / LAN and running `docker compose up`, the container boots without a fatal exit.


* [ ] `GET http://localhost:8080/projects` returns `200 OK` without any auth header and emits the fixture projects.


* [ ] `POST http://localhost:8080/projects/new` returns status `400` or `403` with a participant session.


* [ ] `GET http://localhost:8080/api/judge/scores` strictly returns `401` or `403` with a participant session.


* [ ] `GET http://localhost:8080/api/judge/scores?judge=judge_a` returns HTTP `403 Forbidden` with a judge_b session.


* [ ] `GET http://localhost:8080/api/export.csv` returns `200 OK` and comma-separated output with an organizer session.


---

## 11. NEXT.JS COMPONENT HIERARCHY & ELITE DASHBOARD LAYOUTS

### 11.1 Project Directory Structure (Next.js App Router)

```text
your-repo/
├── .dogfood.toml                   # Route & auth mapping for run.py
├── acceptance-report.txt           # Output of python3 run.py .dogfood.toml
├── docker-compose.yml              # Single-command offline runtime
├── Dockerfile                      # Multi-stage Next.js standalone build
├── next.config.ts                  # output: 'standalone', font: local only
├── tailwind.config.ts              # Dark mode: 'class', zinc palette
├── package.json
├── fixtures.json                   # Synthetic dataset (read-only)
├── scripts/
│   ├── migrate.mjs                 # DDL table creation (idempotent)
│   └── seed.mjs                    # fixtures.json ingestion + session seeding
├── src/
│   └── types/
│       └── db.ts                   # TypeScript interfaces (DATA-MODEL.md §3B)
├── lib/
│   ├── db.ts                       # Database client (postgres.js or better-sqlite3)
│   ├── auth.ts                     # requireRole() utility for Route Handlers
│   └── normalization.ts            # Z-Score engine (JUDGING.md §3)
└── app/
    ├── layout.tsx                  # Root layout: dark theme, font, global CSS
    ├── page.tsx                    # Landing page redirect
    ├── projects/
    │   └── page.tsx                # T1: Public Bento-Grid Gallery (RSC)
    ├── judge/
    │   └── review/
    │       └── [projectId]/
    │           └── page.tsx        # T2: Split-Screen Judge Console (RSC + Client)
    ├── organizer/
    │   └── dashboard/
    │       └── page.tsx            # T2: Mission Control Dashboard (RSC + Client)
    ├── api/
    │   ├── projects/
    │   │   └── route.ts            # POST /projects/new (deadline check)
    │   ├── judge/
    │   │   └── scores/
    │   │       └── route.ts        # GET/POST /api/judge/scores (role-isolated)
    │   ├── export.csv/
    │   │   └── route.ts            # GET /api/export.csv (streaming CSV)
    │   ├── health/
    │   │   └── route.ts            # GET /health (readiness probe)
    │   └── organizer/
    │       ├── leaderboard/
    │       │   └── route.ts        # GET /api/organizer/leaderboard
    │       ├── judge-status/
    │       │   └── route.ts        # GET /api/organizer/judge-status
    │       └── calibration-summary/
    │           └── route.ts        # GET /api/organizer/calibration-summary
    └── components/
        ├── BentoGrid.tsx           # T1 Gallery layout container
        ├── ProjectCard.tsx         # Gallery card with hover animation
        ├── SearchBar.tsx           # "use client" instant search
        ├── TrackFilterPills.tsx    # "use client" category filter
        ├── RubricSlider.tsx        # "use client" slider + real-time score
        ├── RankDeltaBadge.tsx      # ▲/▼ rank movement badge
        ├── CircularRing.tsx        # SVG conic-gradient completion ring
        ├── JudgeStatusMatrix.tsx   # Judge completion grid
        ├── NormalizedLeaderboard.tsx # Live ranked project list
        └── CalibrationSummaryCard.tsx # sigma_raw vs sigma_normalized display
```

### 11.2 T1 — Bento-Grid Gallery Component Tree

```
app/projects/page.tsx (RSC)
  └── <BentoGrid>                         # CSS Grid layout (dark bg-zinc-900)
        ├── <SearchBar />                 # "use client" — filters by title/summary
        ├── <TrackFilterPills />          # "use client" — filters by track_id
        └── {projects.map(p =>
              <ProjectCard project={p} /> # Track badge, title, team, timestamp
            )}
```

### 11.3 T2 — Judge Split-Screen Speed Console Component Tree

```
app/judge/review/[projectId]/page.tsx (RSC)
  ├── [Left Panel]
  │     ├── <ProjectMetaPanel>            # title, track, team, repo_url, timestamp
  │     └── <VideoEmbed videoUrl={...} /> # <video> or placeholder with Lucide Video icon
  └── [Right Panel]
        └── <RubricSlider                 # "use client"
              projectId={...}
              criteria={['functionality', 'quality', 'innovation']}
              weights={{ functionality: 0.40, quality: 0.35, innovation: 0.25 }}
            />
              ├── Slider (Shadcn) x3     # Range 1-5, step 0.5
              ├── WeightedScoreReadout   # "Weighted Score: 3.58 / 5.00"
              ├── CommentTextarea        # Optional, nullable
              └── SubmitButton           # Disabled until all criteria >= 1
```

### 11.4 T2 — Organizer Mission Control Dashboard Component Tree

```
app/organizer/dashboard/page.tsx (RSC — fetches initial data)
  ├── <CalibrationSummaryCard             # sigma_raw=0.94, sigma_norm=0.31
        data={calibrationSummary} />
  ├── <CircularRings>                     # One SVG conic-gradient ring per track
  │     {tracks.map(t => <CircularRing track={t} stats={...} />)}
  ├── <JudgeStatusMatrix                  # "use client" — 30 judges, status badges
        initialData={judgeStatuses} />
  └── <NormalizedLeaderboard              # "use client" — auto-refresh 30s
        initialData={leaderboard}
        csvExportUrl="/api/export.csv"
      />
        ├── <RankDeltaBadge delta={...} /> # ▲/▼ colored badges
        └── ExportButton                   # Lucide Loader2 spinner during download
```