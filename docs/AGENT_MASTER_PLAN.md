# AGENT_MASTER_PLAN.md
**Project:** Dogfood 2026 Hackathon Portal  
**Document:** Master Implementation Plan & Autonomous Execution Sequence  
**Standard:** Rev 2.6 / Unit DF-01  
**Source Specifications:**
- SYSTEM_SCOPE_AND_BEHAVIOR.md (Doc 1)
- DATA-MODEL.md (Doc 2)
- JUDGING.md (Doc 3)
- ARCHITECTURE.md (Doc 4)
**Status:** AUTHORITATIVE & DETERMINISTIC EXECUTION ROADMAP  

---

## 1. EXECUTION PRINCIPLES & GOVERNANCE

### 1.1 Core Mission & Scope Boundaries
* **Primary Objective:** Ek production-grade, offline-first hackathon submission aur judging platform implement karna jo Hackathon Raptors ke automated acceptance test (`run.py`) ke sabhi 7 assertions ko 100% clean PASS kare[cite: 1, 2, 5, 11, 12, 14].
* **Target Tier:** Strictly **T1 (Core) + T2 (Judging)**[cite: 1, 4, 5, 11, 13, 14]. Koi unverified T3/T4 features `.dogfood.toml` me claim nahi kiye jayenge taaki zero overclaim penalty ensure ho[cite: 1, 2, 5, 11, 12, 14].
* **The Air-Gapped Zero-Dependency Mandate:** Platform bina internet connection ke laptop par `docker compose up` se live hoga[cite: 1, 5, 11, 14]. Runtime me koi cloud authentication, external BaaS (Supabase/Firebase), ya remote LLM/API endpoints call nahi honge[cite: 1, 5, 11, 14].
* **Scoring Methodology:** All judging and calibration runs on deterministic statistical mathematics (Z-Score Normalization + Bradley-Terry model), not probabilistic AI generation[cite: 1, 5, 8, 11, 14].

### 1.2 Tech Stack Selection (Full-Stack Next.js)
* **Framework:** Latest stable **Next.js (App Router, TypeScript)** — frontend RSC + backend Route Handlers coexist on Port 8080[cite: 20].
* **UI Layer:** **Tailwind CSS** (dark mode via `darkMode: 'class'`) + **Shadcn UI** component library + **Lucide Icons**.
* **Database Client:** **`postgres.js`** (PostgreSQL) or **`better-sqlite3`** (SQLite for testing).
* **Package Manager:** **`npm`** with `package-lock.json`. Production build via `npm run build` (standalone output).
* **Containerization:** Multi-stage `Dockerfile` (Node 20 Alpine) + `docker-compose.yml` (PostgreSQL 16 Alpine + App Service)[cite: 1, 5, 11, 14].
* **Testing Engine:** Standard Python 3 `run.py` acceptance checker + optional `jest`/`vitest` unit tests for normalization engine[cite: 2, 12, 20].

---

## 2. ENVIRONMENT & INFRASTRUCTURE SETUP

### 2.1 Required Environment Variables (`.env.example`)
```bash
# Core Server Configuration
PORTAL_PORT=8080
PORTAL_HOST=0.0.0.0
BASE_URL=http://localhost:8080
ENVIRONMENT=production

# Database Configuration (Docker Internal Network)
DATABASE_URL=postgresql://dogfood_user:dogfood_secure_password_local@db:5432/dogfood_db
POSTGRES_DB=dogfood_db
POSTGRES_USER=dogfood_user
POSTGRES_PASSWORD=dogfood_secure_password_local

# Data Pipeline Paths
FIXTURES_PATH=/app/fixtures.json
EXPORT_CHUNK_SIZE=100

# Secret Key for Local Cookie Signing
SESSION_SECRET_KEY=dogfood_offline_secret_key_2026_unit_df01

```

### 2.2 Verified Dependency Manifest (`package.json`)

```json
{
  "name": "dogfood-portal",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev -p 8080",
    "build": "next build",
    "start": "next start -p 8080",
    "lint": "next lint",
    "db:migrate": "node scripts/migrate.mjs",
    "db:seed": "node scripts/seed.mjs",
    "test": "node --test scripts/test-normalization.mjs"
  },
  "dependencies": {
    "next": "^15.1.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "postgres": "^3.4.5",
    "lucide-react": "^0.468.0",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.5.5",
    "class-variance-authority": "^0.7.1"
  },
  "devDependencies": {
    "@types/node": "^22.10.2",
    "@types/react": "^19.0.2",
    "@types/react-dom": "^19.0.2",
    "typescript": "^5.7.2",
    "tailwindcss": "^3.4.17",
    "postcss": "^8.4.49",
    "autoprefixer": "^10.4.20"
  }
}
```

### 2.3 Canonical Project Directory Structure

```text
your-repo/
├── .dogfood.toml                 # Route & auth mapping for run.py checker
├── acceptance-report.txt         # Real output of python3 run.py .dogfood.toml
├── docker-compose.yml            # Single-command offline runtime definition
├── Dockerfile                    # Multi-stage standalone Node.js container
├── package.json                  # Next.js 15, React 19, postgres.js, tailwind
├── package-lock.json             # Locked dependency tree for offline npm ci
├── next.config.ts                # output: 'standalone', unoptimized images
├── tsconfig.json                 # TypeScript strict configuration & @/* paths
├── tailwind.config.ts            # Tailwind dark mode & zinc palette tokens
├── postcss.config.mjs            # PostCSS plugin pipeline
├── .env.example                  # Environment template
├── .env.local                    # Local environment variables
├── .cursorrules                  # Coding Assistant Guardrails & Anti-Patterns
├── README.md                     # Setup, honest limitations, architectural summary
├── ARCHITECTURE.md               # System architecture & role isolation matrix
├── DATA-MODEL.md                 # Relational schema DDL & fixtures mapping
├── JUDGING.md                    # Normalization mathematical proof & assignment graph
├── LICENSE                       # MIT or Apache-2.0 OSI-approved license
├── fixtures.json                 # Synthetic dataset provided by organizers
├── run.py                        # Automated acceptance test suite from organizers
├── scripts/
│   ├── migrate.mjs               # Automated DDL execution via postgres.js
│   ├── seed.mjs                  # Fixtures ingestion & deterministic session generation
│   └── test-normalization.mjs    # Math verification (sigma 0.94 -> 0.31 proof)
├── lib/
│   ├── db.ts                     # postgres.js connection singleton & query client
│   ├── auth.ts                   # Session extraction, role resolution & guard helpers
│   └── normalization.ts          # Z-Score Normalization Engine (sigma 0.94 -> 0.31)
├── app/
│   ├── layout.tsx                # Root layout with dark mode zinc theme
│   ├── globals.css               # Tailwind CSS base & utilities
│   ├── page.tsx                  # Public landing / redirect to /projects
│   ├── projects/
│   │   └── page.tsx              # T1: Public Bento-Grid Gallery (RSC)
│   ├── judge/
│   │   ├── page.tsx              # Judge portal redirect / assigned projects
│   │   └── review/
│   │       └── [projectId]/
│   │           └── page.tsx      # T2: Judge Split-Screen Speed Console
│   ├── organizer/
│   │   └── dashboard/
│   │       └── page.tsx          # T2: Organizer Mission Control Dashboard
│   └── api/
│       ├── projects/
│       │   ├── route.ts          # T1: GET /projects JSON fallback / search
│       │   └── new/
│       │       └── route.ts      # T1: POST /projects/new (Deadline check)
│       ├── judge/
│       │   └── scores/
│       │       └── route.ts      # T2: GET/POST /api/judge/scores (Role-isolated)
│       └── export.csv/
│           └── route.ts          # T2: GET /api/export.csv (Organizer CSV stream)
└── components/
    ├── BentoGrid.tsx             # Interactive responsive grid for projects
    ├── ProjectCard.tsx           # Dark card with lift animation on hover
    ├── SearchBar.tsx             # Instant search filter component
    ├── TrackFilterPills.tsx      # Category pill selector component
    ├── RubricSlider.tsx          # Real-time weighted score rubric slider
    ├── CircularRing.tsx          # SVG track progress ring
    ├── JudgeStatusMatrix.tsx     # 30-judge progress matrix
    ├── NormalizedLeaderboard.tsx # Auto-refreshing calibrated leaderboard
    ├── CalibrationSummaryCard.tsx# Math summary (sigma_raw=0.94 -> sigma_norm=0.31)
    └── RankDeltaBadge.tsx        # Visual rank delta (+4 / -6 indicator)
```

---

## 3. CODING ASSISTANT CONTEXT FILE (`.cursorrules` / `CLAUDE.md`)

Coding agent ke context window me yeh rules locked rahenge:

```markdown
# DOGFOOD 2026 CODING ASSISTANT RULES (.cursorrules)

## SYSTEM CONTEXT
You are implementing the Dogfood 2026 hackathon portal. 
Target: 1st Place Grand Prize & Production Adoption by Hackathon Raptors.
Standard: Rev 2.6 / Unit DF-01.

## ABSOLUTE CONSTRAINTS (ZERO DEVIATION PERMITTED)
1. NEVER import, call, or configure external LLM APIs (OpenAI, Anthropic, Gemini, Groq, etc.) at runtime.
2. NEVER use external hosted auth or database services (No Clerk, Firebase, Supabase Cloud, Auth0, AWS RDS).
3. ALL code must run 100% offline inside `docker compose up` on localhost:8080.
4. ROLE ISOLATION MUST LIVE IN THE BACKEND:
   - Route `/api/judge/scores?judge=judge_a` requested with `judge_b` credentials MUST return HTTP 403.
   - Route `/api/judge/scores` requested with `participant` credentials MUST return HTTP 403.
   - Route `/api/judge/scores` requested with no credentials MUST return HTTP 401.
5. DEADLINE ENFORCEMENT:
   - `POST /projects/new` MUST compare UTC now against `events.submissions_close`. 
   - If closed, return HTTP 400 or 403 (Status code 4xx is strictly verified by run.py).
6. ACCEPTANCE CSV EXPORT:
   - `GET /api/export.csv` requested by organizer MUST return HTTP 200 with `Content-Type: text/csv` and a comma (,) in the very first header line.
7. SEED RESILIENCE:
   - Handle duplicate project `prj_41` gracefully (same team/title as `prj_07`).
   - Handle empty comments `""` gracefully (scores.comment is nullable).
   - Ingest all 40 teams, 41 projects, 30 judges, 8 tracks, and historical scores from fixtures.json.

```

---

## 4. CORE APPLICATION & DATABASE ENGINE

### 4.1 Database Client & Schema (`lib/db.ts` / `scripts/migrate.mjs`)

Schema must implement 1:1 the DDL defined in `DATA-MODEL.md`:

* `Event`: `id`, `name`, `submissions_close` (TIMESTAMPTZ).


* `Track`: `id`, `event_id`, `name`.


* `User`: `id`, `name`, `email`, `role` (`visitor`, `participant`, `judge`, `organizer`, `admin`).


* `Session`: `session_id`, `user_id`, `role`, `expires_at`.


* `JudgeTrack`: Composite PK `(judge_id, track_id)`.


* `Team`: `id`, `name`, `invite_code`.


* `TeamMember`: Composite Unique `(team_id, user_email)`.


* `Project`: `id`, `team_id`, `track_id`, `title`, `summary`, `repo_url`, `submitted_at`, `is_draft`.


* `Score`: `id`, `judge_id`, `project_id`, `raw_criteria` (JSON), `total_raw_score`, `total_weighted_score`, `comment` (Nullable).



### 4.2 Offline Transactional Seeder (`scripts/seed.mjs`)

Startup engine reads `fixtures.json` from disk:

1. `events`: Inserts `evt_01` with past deadline `2026-03-01T18:00:00Z`.


2. `tracks`: Ingests 8 tracks (`trk_01` to `trk_08`).


3. `judges`: Ingests 30 judges as users with `role = 'judge'`, populates `judge_tracks`.


4. `teams` & `members`: Ingests 40 teams and assigns member emails.


5. `projects`: Ingests 41 projects (ensures `prj_41` duplicate does not violate unique constraints).


6. `scores`: Ingests raw criteria scores and handles empty string comments.


7. `sessions`: Pre-seeds the deterministic test tokens matching `.dogfood.toml`:


* `session=org_7f2a` -> `role: organizer`

* `session=jdg_a_91bc` -> `role: judge` (mapped to `jdg_01`)


* `session=jdg_b_44de` -> `role: judge` (mapped to `jdg_02`)


* `session=prt_2e88` -> `role: participant`



8. Terminal Emission: Emits pre-formatted test headers to stdout upon boot completion.



---

## 5. API & ROUTE IMPLEMENTATION SPECIFICATION

### 5.1 Route: Public Gallery (`GET /projects`) â€” T1 Gate

* **Auth Requirement:** None (Public).


* **Logic:** Returns HTTP 200 with HTML/JSON containing project titles.


* **Verification Assertion:** `run.py` checks:
`c.ok = any(t.lower() in haystack for t in titles)` across first 3 fixture project titles (`Glass Signal`, `Small Meadow`, `Deep Compass`).


* **Pagination Safety:** First page must eagerly include fixture project titles.



### 5.2 Route: Project Submission (`POST /projects/new`) â€” T1 Gate

* **Auth Requirement:** Participant session (`auth.participant`).


* **Payload:** `{"title": "dogfood-late-submission-probe", "summary": "probe"}`.


* **Deadline Check Logic:**
```typescript
const [event] = await sql`SELECT submissions_close FROM events WHERE id = 'evt_01'`;
if (new Date() > new Date(event.submissions_close)) {
  return NextResponse.json(
    { error: "Submissions for this event are closed" },
    { status: 400 }
  );
}
```


* **Verification Assertion:** `run.py` expects `400 <= status < 500`.



### 5.3 Route: Judge Scores (`GET /api/judge/scores`) â€” T2 Gate

* **Access Control:**
* If no session -> `401 Unauthorized`.


* If role == `participant` -> `403 Forbidden` (`T2 participant blocked` check).


* If role == `judge` -> Returns judge's own scores -> `200 OK` (`T2 judge sees own scores` check).





### 5.4 Route: Peer Scores Query Probe (`GET /api/judge/scores?judge=judge_a`) â€” T2 Gate

* **Probe Context:** Checker sends request as `judge_b` targeting `judge_a`.


* **Backend Isolation Rule:**
```typescript
if (current_user.role === "judge") {
  const { searchParams } = new URL(request.url);
  const requestedJudge = searchParams.get("judge");
  if (requestedJudge && requestedJudge !== current_user.id) {
    return NextResponse.json(
      { error: "Forbidden: Backend isolation policy prohibits viewing peer ballots" },
      { status: 403 }
    );
  }
}
```


* **Verification Assertion:** `run.py` expects `status in (401, 403)`.



### 5.5 Route: CSV Export (`GET /api/export.csv`) â€” T2 Gate

* **Access Control:** Organizer session required (`401`/`403` for others).


* **Output Format:** Plaintext CSV with `Content-Type: text/csv`.


* **Verification Assertion:** `run.py` expects `status == 200 and "," in first_line`.


* **First Line Header:**
`rank,project_id,project_title,track_name,team_name,reviews_count,raw_average_score,normalized_score,rank_delta`

---

## 6. STATISTICAL JUDGING ENGINE IMPLEMENTATION

### 6.1 Z-Score Normalization Engine (`lib/normalization.ts`)

Implements the exact mathematical specification from `JUDGING.md`:

1. Calculate raw weighted score per review:

$$S_{ij} = (0.40 \cdot \text{func}) + (0.35 \cdot \text{qual}) + (0.25 \cdot \text{innov})$$


2. For each judge $j$, compute sample mean $\mu_j$ and sample standard deviation $\sigma_j$.


3. Apply damping factor $\epsilon = 10^{-4}$ to handle zero variance ($\sigma_j = 0$):

$$z_{ij} = \frac{S_{ij} - \mu_j}{\sigma_j + 0.0001}$$


4. Re-project to global 1â€“5 scale:

$$S'_{ij} = \text{clamp}(3.00 + (z_{ij} \cdot 0.85), 1.0, 5.0)$$


5. Compute composite project score $P_i = \text{mean}(S'_{ij})$.


6. **Variance Reduction Verification:** Code ensures that initial uncalibrated spread ($\sigma = 0.94$) collapses to calibrated target ($\sigma \le 0.35$).



---

## 7. AUTOMATED ACCEPTANCE VERIFICATION HARNESS

Platform must pass the exact unmodified `run.py` test harness:

```bash
# Command to execute
python3 run.py .dogfood.toml > acceptance-report.txt

```

### Expected Clean Acceptance Output (`acceptance-report.txt`):

```text
DOGFOOD 2026 acceptance report
portal: http://localhost:8080
claimed: T1 T2
fixtures: fixtures.json

T1  gallery is public ................. PASS
T1  project from fixtures shown ....... PASS
T1  closed event refuses submissions .. PASS
T2  judge sees own scores ............. PASS
T2  judge cannot see peer scores ...... PASS
T2  participant blocked ............... PASS
T2  csv export works .................. PASS

claimed T1 T2, verified T1 T2

```

---

## 8. DYNAMIC PHASE-GATED EXECUTION SEQUENCE (FOR CODING AGENT)

Coding agent ko in 6 sequential phases aur 14 atomic steps me build execute karna hai:

```
[Phase 1: Next.js Scaffold] --> [Phase 2: DB & Seed] --> [Phase 3: Route Handlers] --> [Phase 4: Premium UI] --> [Phase 5: Dockerfile] --> [Phase 6: Demo Video]

```

### PHASE 1: NEXT.JS SCAFFOLDING & CONFIGURATION

#### STEP 1: Next.js App Router Scaffold & Dependency Manifest

* **Phase:** Phase 1
* **Target Files:** `package.json`, `next.config.ts`, `tailwind.config.ts`, `tsconfig.json`, `.env.local`, `.gitignore`

* **Action:**
  1. `npx create-next-app@latest . --typescript --tailwind --app --no-src-dir --import-alias "@/*"` (or manual scaffold).
  2. Install Shadcn UI: `npx shadcn@latest init` — select dark mode, zinc base color.
  3. Add Shadcn components: `npx shadcn@latest add card badge input button slider toast`.
  4. Install Lucide: `npm install lucide-react`.
  5. Install database client: `npm install postgres` (PostgreSQL) or `npm install better-sqlite3 @types/better-sqlite3`.
  6. Set `next.config.ts`: `output: 'standalone'`. Add `images.unoptimized: true` for air-gapped builds.
  7. Ensure `tailwind.config.ts` sets `darkMode: 'class'` and dark zinc palette.
  8. Set `NEXT_TELEMETRY_DISABLED=1` in `.env.local` to prevent outbound telemetry during build.


* **Dependencies:** None
* **Verification:** `npm run dev` starts on Port 3000 with no TypeScript errors. `next.config.ts` has `output: 'standalone'`.


* **Safe to run:** Yes (Idempotent)

#### STEP 2: Acceptance Configuration Baseline

* **Phase:** Phase 1
* **Target Files:** `.dogfood.toml`, `fixtures.json`, `run.py`

* **Action:** Ensure organizers' unmodified `run.py` and `fixtures.json` exist at root. Write `.dogfood.toml` configuring base URL `http://localhost:8080`, claimed tiers `["T1", "T2"]`, and exact routes (`/projects`, `/projects/new`, `/api/judge/scores`, `/api/export.csv`).


* **Dependencies:** STEP 1
* **Verification:** `python3 -c "import tomllib; open('.dogfood.toml')"` validates syntax. All 5 routes match `run.py` expectations.
* **Safe to run:** Yes (Idempotent)

---

### PHASE 2: DATABASE CLIENT SETUP & OFFLINE SEED ENGINE

#### STEP 3: Relational Schema Implementation

* **Phase:** Phase 2
* **Target Files:** `scripts/migrate.mjs`, `lib/db.ts`, `src/types/db.ts`
* **Action:** Implement PostgreSQL DDL schema matching `DATA-MODEL.md` (events, tracks, users, sessions, teams, team_members, projects, rubrics, scores) via `postgres.js` client. Ensure `scores.comment` is nullable and duplicate `prj_41` has no blocking unique constraint. Implement `scripts/migrate.mjs` to auto-create tables.
* **Dependencies:** STEP 2
* **Verification:** Run `node scripts/migrate.mjs`; database tables created successfully with zero errors.
* **Safe to run:** Yes (Idempotent DDL)

#### STEP 4: Transactional Fixtures Seeder

* **Phase:** Phase 2
* **Target Files:** `scripts/seed.mjs`
* **Action:** Write ingestion engine to parse `fixtures.json` and insert all entities inside a single transaction using `postgres.js`. Generate deterministic session tokens (`session=org_7f2a`, `jdg_a_91bc`, `jdg_b_44de`, `prt_2e88`) in `sessions` table. Print test auth headers on completion.
* **Dependencies:** STEP 3
* **Verification:** Run `node scripts/seed.mjs fixtures.json`; terminal prints exact test login headers; DB query confirms 41 projects and 30 judges loaded.
* **Safe to run:** Yes (Truncates and reseeds)

---

### PHASE 3: NEXT.JS ROUTE HANDLERS (T1 & T2 API LAYER)

#### STEP 5: Session Authentication Helper & Middleware

* **Phase:** Phase 3
* **Target Files:** `lib/auth.ts`, `middleware.ts`
* **Action:** Implement session extractor helper `getSessionUser(request)` to parse `Cookie: session=...` or `Authorization: Bearer ...` headers. Query `sessions` table via `lib/db.ts` to resolve user role. Default to `role='visitor'` if no header provided. Provide `requireRole(request, allowedRoles)` helper returning `NextResponse.json({ error: 'Forbidden' }, { status: 403 })` or `401`.
* **Dependencies:** STEP 4
* **Verification:** Unit test / probe confirms valid cookie returns SessionUser object; invalid/missing cookie returns visitor or 401.
* **Safe to run:** Yes (Idempotent)

#### STEP 6: Public Gallery Route & RSC Page (`T1.gallery`)

* **Phase:** Phase 3
* **Target Files:** `app/projects/page.tsx`, `app/api/projects/route.ts`
* **Action:** Implement `GET /projects` RSC page and `app/api/projects/route.ts` Route Handler. Query `projects` table joining `tracks` and `teams` via `lib/db.ts`. Return HTML and JSON with project titles. Ensure first 3 fixture titles appear in response body without auth.
* **Dependencies:** STEP 5
* **Verification:** `curl -s http://localhost:8080/projects` returns 200 and string `"Glass Signal"` appears in output.
* **Safe to run:** Yes (Idempotent)

#### STEP 7: Deadline-Enforced Submission Route Handler (`T1.closed_event`)

* **Phase:** Phase 3
* **Target Files:** `app/api/projects/new/route.ts`
* **Action:** Implement `POST /projects/new` Route Handler. Check caller role == `participant` via `lib/auth.ts`. Compare `Date.now() > event.submissions_close`. Since fixture date is in the past (`2026-03-01`), immediately return `NextResponse.json({ error: "Submissions for this event are closed" }, { status: 400 })`.
* **Dependencies:** STEP 5
* **Verification:** `curl -X POST http://localhost:8080/projects/new -H "Cookie: session=prt_2e88" -d '{"title":"probe"}'` returns HTTP 400.
* **Safe to run:** Yes (Idempotent)

#### STEP 8: Role-Isolated Judging Route Handler (`T2.judge_scores` & `T2.peer_scores`)

* **Phase:** Phase 3
* **Target Files:** `app/api/judge/scores/route.ts`
* **Action:** Implement `GET /api/judge/scores` Route Handler. Block participants (`NextResponse.json({ error: "Forbidden" }, { status: 403 })`). If query param `judge` is passed by a judge targeting another judge's ID, strictly return HTTP 403 Forbidden (`FIG. 02` Matrix). Return own scores for authorized judge (`HTTP 200`).
* **Dependencies:** STEP 5
* **Verification:**
1. `curl -H "Cookie: session=prt_2e88" .../api/judge/scores` -> 403.
2. `curl -H "Cookie: session=jdg_a_91bc" .../api/judge/scores` -> 200.
3. `curl -H "Cookie: session=jdg_b_44de" ".../api/judge/scores?judge=judge_a"` -> 403.
* **Safe to run:** Yes (Idempotent)

#### STEP 9: Streaming CSV Export Route Handler (`T2.csv_export`)

* **Phase:** Phase 3
* **Target Files:** `app/api/export.csv/route.ts`
* **Action:** Implement `GET /api/export.csv` Route Handler. Require `organizer` role (`NextResponse.json({ error: "Forbidden" }, { status: 403 })` for others). Return streaming CSV with `Content-Type: text/csv` and proper comma-delimited header line:
`rank,project_id,project_title,track_name,team_name,reviews_count,raw_average_score,normalized_score,rank_delta`.
* **Dependencies:** STEP 5
* **Verification:** `curl -s -H "Cookie: session=org_7f2a" http://localhost:8080/api/export.csv | head -n 1` contains commas `,` and returns HTTP 200.
* **Safe to run:** Yes (Idempotent)

---

### PHASE 4: PREMIUM DARK-MODE UI DASHBOARDS (GALLERY, JUDGE CONSOLE, MISSION CONTROL)

#### STEP 10A: Premium Bento-Grid Gallery (T1 Frontend)

* **Phase:** Phase 4
* **Target Files:** `app/projects/page.tsx`, `app/components/BentoGrid.tsx`, `app/components/ProjectCard.tsx`, `app/components/SearchBar.tsx`, `app/components/TrackFilterPills.tsx`
* **Action:** Implement the public gallery RSC. All 41 project titles MUST appear in the initial HTML response. Add `SearchBar` and `TrackFilterPills` as `"use client"` components. Shadcn `Card` + `Badge` + `Input` used. Tailwind dark mode: `bg-zinc-900`, `text-zinc-100`. Cards have `hover:scale-[1.02] transition-transform duration-200` lift animation.


* **Dependencies:** STEP 6
* **Verification:** `curl -s http://localhost:3000/projects | grep "Glass Signal"` returns a match. Both search and filter work without page reload.
* **Safe to run:** Yes (Idempotent)

#### STEP 10B: Judge Split-Screen Speed Console (T2 Frontend)

* **Phase:** Phase 4
* **Target Files:** `app/judge/review/[projectId]/page.tsx`, `app/components/RubricSlider.tsx`
* **Action:** Implement split-screen layout: left panel shows project metadata + video embed (`<video>` or Lucide `Video` icon placeholder). Right panel has 3 Shadcn `Slider` components (Functionality 0.40, Quality 0.35, Innovation 0.25, range 1-5 step 0.5). Client-side `computeWeightedScore()` runs on every onChange event and updates the score readout. "Submit Ballot" is disabled until all criteria >= 1. On submit, calls `POST /api/judge/scores`. Keyboard `->` / `<-` arrows navigate between unreviewed projects.


* **Dependencies:** STEP 8
* **Verification:** Opening any project URL as judge_a renders the split-screen. Moving sliders updates the score readout in real time. Submitting a ballot returns 200.
* **Safe to run:** Yes (Idempotent)

#### STEP 10C: Organizer Mission Control Dashboard (T2 Frontend)

* **Phase:** Phase 4
* **Target Files:** `app/organizer/dashboard/page.tsx`, `app/components/CircularRing.tsx`, `app/components/JudgeStatusMatrix.tsx`, `app/components/NormalizedLeaderboard.tsx`, `app/components/CalibrationSummaryCard.tsx`, `app/components/RankDeltaBadge.tsx`
* **Action:** Implement Mission Control dashboard with 4 sections:
  1. `CalibrationSummaryCard`: displays sigma_raw=0.94, sigma_norm=0.31, variance_reduction=67%.
  2. `CircularRings`: 8 SVG conic-gradient rings, one per track.
  3. `JudgeStatusMatrix`: table of 30 judges with COMPLETE/PENDING/NOT_STARTED badges.
  4. `NormalizedLeaderboard`: auto-refreshes every 30 s, shows RankDeltaBadge for each project. Export CSV button triggers file download.


* **Dependencies:** STEPS 9, 10A, 10B
* **Verification:** Opening `/organizer/dashboard` as organizer renders all 4 sections. `prj_17` shows `â–² +4` badge. `prj_09` shows `â–¼ -6` badge. CSV button triggers download.
* **Safe to run:** Yes (Idempotent)

---


#### STEP 10D: Statistical Normalization Engine (TypeScript)

* **Phase:** Phase 4
* **Target Files:** `lib/normalization.ts`, `scripts/test-normalization.mjs`
* **Action:** Implement Z-Score normalization algorithm in TypeScript with damping $\epsilon = 10^{-4}$ per `JUDGING.md`. Compute judge mean $\mu_j$, sample standard deviation $\sigma_j$, clamped 1–5 score, and calibrated rank movement. Write Node verification test verifying that `prj_17` climbs +4 ranks and `prj_09` drops 6 ranks on `fixtures.json`.
* **Dependencies:** STEP 4
* **Verification:** `node scripts/test-normalization.mjs` passes; variance reduction from $\sigma = 0.94$ to $\sigma \le 0.35$ verified.
* **Safe to run:** Yes (Idempotent)

---

### PHASE 5: MULTI-STAGE DOCKERFILE & AIR-GAPPED ACCEPTANCE VERIFICATION

#### STEP 11: Offline Docker Multi-Container Architecture

* **Phase:** Phase 5
* **Target Files:** `Dockerfile`, `docker-compose.yml`, `next.config.ts`, `scripts/migrate.mjs`, `scripts/seed.mjs`

* **Action:** Write multi-stage Next.js Dockerfile (Node 20 Alpine): Stage 1 copies lock files + runs `npm ci`. Stage 2 runs `npm run build` with `NEXT_TELEMETRY_DISABLED=1`. Stage 3 copies only `.next/standalone` + static assets. CMD: `node scripts/migrate.mjs && node scripts/seed.mjs && node server.js`. Ensure `next.config.ts` sets `output: 'standalone'`. Write `docker-compose.yml` linking web to healthy postgres container.


* **Dependencies:** STEPS 1–10D
* **Verification:** Run `docker compose up --build -d` with Wi-Fi disabled. Check `docker logs dogfood-portal` shows seeded session tokens and `listening on port 8080`. Verify `docker image ls` shows the image under 500 MB.


* **Safe to run:** Yes (Containerized)

#### STEP 12: Acceptance Checker Verification & Receipt Commit

* **Phase:** Phase 5
* **Target Files:** `acceptance-report.txt`

* **Action:** Disconnect network/Wi-Fi to ensure air-gapped compliance. Execute `python3 run.py .dogfood.toml > acceptance-report.txt`. Verify that all 7 checks evaluate to `PASS`. Commit output file.


* **Dependencies:** STEP 11
* **Verification:** `cat acceptance-report.txt` shows:
`claimed T1 T2, verified T1 T2` with zero FAIL lines.


* **Safe to run:** Yes (Read-only probe)

---

## 9. NON-NEGOTIABLE VERIFICATION CHECKLIST (PRE-SUBMISSION GATE)

Before final submission code freeze, confirm every item:

* [ ] Platform starts locally via single command `docker compose up` with internet turned OFF.


* [ ] No remote API keys or cloud service SDKs present in repository dependencies.


* [ ] `acceptance-report.txt` contains clean `PASS` for all 7 T1 & T2 tests.


* [ ] `.dogfood.toml` claims strictly `["T1", "T2"]` (no unverified overclaims).


* [ ] Root directory contains all 4 mandatory evaluation docs: `README.md`, `ARCHITECTURE.md`, `DATA-MODEL.md`, `JUDGING.md`.


* [ ] Public GitHub repo includes OSI-approved license (`LICENSE` file with MIT or Apache-2.0).


* [ ] 5-minute video demonstrating complete lifecycle (submit -> judge -> normalize -> export) recorded and linked.



---

## EXECUTION PLAN INTEGRITY DECLARATION

This master plan is AUTHORITATIVE, SEQUENCED, and COMPLETE.

The downstream coding agent must:

* Execute each phase and step in the exact order specified above.


* Validate verification commands after every step before advancing to the next.


* Maintain strict backend role isolation without relying on frontend UI template hiding.


* Enforce air-gapped offline stability with zero runtime external dependencies.



The resulting platform will deterministically pass all acceptance checks and qualify for adoption by Hackathon Raptors.

---

### PHASE 6: MANDATORY DEMO VIDEO RECORDING CHECKLIST

#### STEP 13: Air-Gapped Acceptance Test & Report

* **Phase:** Phase 6
* **Target Files:** `acceptance-report.txt`
* **Action:**
  1. Disable Wi-Fi / LAN on the host laptop.
  2. Run `docker compose up --build` (must boot successfully offline).
  3. Execute: `python3 run.py .dogfood.toml > acceptance-report.txt`
  4. Verify: `cat acceptance-report.txt` shows `claimed T1 T2, verified T1 T2` with zero FAIL lines.
  5. Commit `acceptance-report.txt` to the repository root.


* **Dependencies:** STEP 12
* **Verification:** All 7 acceptance checks output `PASS`. The file contains no `FAIL` substring.
* **Safe to run:** Yes (Read-only probe)

#### STEP 14: 5-Minute Event Lifecycle Demo Video

* **Phase:** Phase 6
* **Target Files:** `README.md` (video link), `acceptance-report.txt`
* **Action:** Record a minimum 5-minute screen recording demonstrating the full event lifecycle in one continuous take:
  1. **00:00 - 00:30** â€” `docker compose up` boot sequence. Show seed output with 4 test session tokens printed to stdout.
  2. **00:30 - 01:30** â€” Public Bento-Grid Gallery. Demonstrate instant search (type a project name). Demonstrate category filter pill (click Security track).
  3. **01:30 - 02:30** â€” Judge Split-Screen Console. Log in as judge_a. Open a project. Move rubric sliders (Functionality, Quality, Innovation). Show real-time weighted score readout updating. Submit a ballot. Show success toast.
  4. **02:30 - 03:30** â€” Role Isolation Demo. Attempt to access `/api/judge/scores?judge=judge_a` as judge_b. Show HTTP 403 Forbidden response in browser DevTools.
  5. **03:30 - 04:30** â€” Organizer Mission Control. Log in as organizer. Show circular completion rings, judge status matrix, and normalized leaderboard with rank delta badges (â–² +4 for prj_17, â–¼ -6 for prj_09).
  6. **04:30 - 05:00** â€” CSV Export. Click "Export Results CSV". Show file download. Open CSV and verify comma delimiter in first line.

* **Demo Notes:**
  - Record at 1920x1080 or higher resolution.
  - Laptop Wi-Fi must be visibly disabled during the recording (show network indicator).
  - Narrate each step clearly.
  - Accepted formats: MP4, MOV, WebM. Max 500 MB.

* **Dependencies:** STEP 13
* **Verification:** Video link added to `README.md`. Video runtime >= 5 minutes. All 6 lifecycle stages visible.
