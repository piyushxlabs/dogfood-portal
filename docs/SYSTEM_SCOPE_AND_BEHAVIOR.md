# SYSTEM_SCOPE_AND_BEHAVIOR.md

**Project Name:** Dogfood 2026 Hackathon Portal  
**Event Organizer:** Hackathon Raptors (Community Interest Company)  
**Standard:** Rev 2.6 / Unit DF-01  
**Status:** LOCKED & ENFORCEABLE CONTRACT

---

## 1. SYSTEM IDENTITY & CORE MANDATE

This system is a modern, open-source, fully self-hostable Hackathon Submission and Judging Platform.

The platform's primary mission is to autonomously manage the complete 10-stage hackathon data pipeline:

**Registration → Teams → Submissions → Eligibility → Assignment → Scoring → Normalization → Results → Certificates → Archive**

The platform is intended to be forked and adopted in production for Hackathon Raptors' future global events.

**Framework Identity:** The implementation is a **Full-Stack Next.js (App Router, TypeScript, React Server Components)** application. UI is styled with **Tailwind CSS** + **Shadcn UI** component library + **Lucide Icons**. The platform runs as a single standalone container on `http://localhost:8080`, with frontend React Server Components and backend Route Handlers (`app/api/...`) coexisting on Port 8080 with zero reverse-proxy overhead.

---

## 2. ABSOLUTE PROHIBITIONS (NON-NEGOTIABLE DISQUALIFICATION RULES)

The Coding Agent MUST comply with the following strict rules without exception:

### 1. **NO RUNTIME CLOUD / LLM DEPENDENCIES**

- The platform backend and frontend MUST NOT use any external LLM API key, including OpenAI, Anthropic, Gemini, Groq, or similar services.
- Scoring and judging MUST operate using deterministic mathematics (Z-Score), not prompts, LLM inference, or AI hallucinations.

### 2. **NO HOSTED DATABASES OR EXTERNAL AUTH**

- Firebase, Supabase Cloud, Clerk, Auth0, AWS RDS, Neon, and similar hosted services are strictly forbidden.
- The database MUST run locally inside the application's container environment using SQLite or local PostgreSQL.
- Authentication MUST use local session cookies or signed tokens.

### 3. **THE ONE-COMMAND OFFLINE RULE**

- With the laptop's Wi-Fi / Internet completely disabled, running `docker compose up` from the terminal MUST bring the entire system online.
- The startup seed script MUST populate the database from `fixtures.json` without requiring an Internet connection.

### 4. **NO FRONTEND-ONLY ROLE CHECKS**

- Hiding buttons or UI elements MUST NOT be considered role isolation.
- If unauthorized roles send raw HTTP/cURL requests to protected endpoints, the backend API MUST strictly return `401 Unauthorized` or `403 Forbidden`.

### 5. **NO OVERCLAIMING TIERS**

- `.dogfood.toml` MUST claim only the tiers that are verified by the `run.py` acceptance suite (for example: `claimed = ["T1", "T2"]`).
- Claiming T3/T4 without verification MUST result in a disqualifying penalty.

### 6. **AIR-GAPPED STANDALONE BUILD RULE**

- During the Docker image build stage, the Next.js production bundle MUST be compiled via `RUN npm ci && npm run build` inside the image. The `next.config.ts` MUST set `output: 'standalone'` so the runtime image launches with only `node server.js` — no `npm install` or `next build` at container start time.
- Remote Google Font fetching (`fonts.googleapis.com`, `fonts.gstatic.com`) and any external CDN calls MUST be completely blocked at runtime. All fonts and static assets MUST be bundled into the image at build time or self-hosted inside the container filesystem.
- The Dockerfile MUST copy `package.json` and lock files first, run `npm ci`, then copy application source, to maximize Docker layer cache efficiency and prevent repeated downloads during rebuilds.

---

## 3. TIER LADDER & FUNCTIONAL SCOPE

### T1 — Core Layer (Mandatory Floor)

- **Local Authentication & Roles:** Visitor, Participant, Judge, Organizer, and Admin roles.
- **Event Lifecycle:** Event creation with title, description, and strict deadline enforcement.
- **Team Formation:** Shareable invite links and team membership mapping.
- **Submission Engine:** Draft, edit, and submit project details (`title`, `summary`, `repo_url`, `track`, `tech_tags`).
- **Hard Deadline Enforcement:** Once the deadline has passed, the submission API MUST strictly return a `4xx` HTTP status.
- **Public Searchable Gallery:** Public project gallery accessible without requiring login.

#### T1 — Premium Bento-Grid Gallery UI (Next.js Frontend Specification)

The public gallery page (`GET /projects`) MUST render as a **dark-mode Bento-Grid** layout using React Server Components (RSC) for initial HTML and a Client Component for interactivity:

- **Bento-Grid Cards:** Each project card displays: project title, track badge (color-coded per track), team name, submission timestamp, and truncated summary. Cards have hover lift animations (`transition: transform 200ms ease`, `translateY(-4px)`).
- **Instant Client-Side Search:** A search input performs real-time substring filtering on project title and summary without any server round-trip. Implemented as a `"use client"` Client Component receiving all projects as props from the RSC parent.
- **Category Filter Pills:** A row of track filter pills (`Developer Tools`, `Security`, `Climate`, etc.) enables single-click category filtering. The active pill is highlighted with an accent gradient. Clearing shows all tracks.
- **Zero Pagination on Page 1:** The HTML response for `GET /projects` MUST contain ALL fixture project titles (no server-side pagination that hides titles), so `run.py` fixture-title assertions pass deterministically.
- **Styling:** Tailwind CSS dark mode (`bg-zinc-900`, `text-zinc-100`). Shadcn UI `Card`, `Badge`, and `Input` components. Lucide Icons for track category icons.

### T2 — Judging & Integrity Layer (Target Winning Surface)

- **Judge Assignment:** Disjoint batch assignment model, targeting 3 reviews per project and remaining track-aware.
- **Weighted Rubrics:** Organizer-configurable scoring rubric with weighted criteria.
- **Backend-Enforced Role Isolation:** A judge MUST NOT be able to view scores submitted by peer judges (`401`/`403`). Participants MUST NOT be able to access judge routes.
- **Live Progress Dashboard:** Organizers MUST be able to see in real time which judges have completed their reviews and which reviews are still pending.
- **Cross-Judge Score Normalization:** Strict standard-deviation reduction mathematics (`σ = 0.94 → σ = 0.31`) MUST be used to neutralize differences between lenient and strict judges.
- **CSV Data Pipeline:** The organizer route MUST provide an immediate standard CSV export of results and raw scores.

#### T2 — Judge Split-Screen Speed Console (Next.js Frontend Specification)

The judging interface (`/judge/review/[projectId]`) MUST render as a **split-screen console**:

- **Left Panel — Project Intelligence:**
  - Project metadata: title, track badge, team name, `repo_url` (clickable `<a>` link), `submitted_at` timestamp.
  - Video embed: If `video_url` is present, render a `<video>` or iframe. If absent, show a placeholder with a Lucide `Video` icon and "No demo video provided."
  - Project summary and description in a scrollable panel.
- **Right Panel — Weighted Rubric Sliders:**
  - One Shadcn UI `Slider` per criterion: Functionality (weight 0.40), Quality (weight 0.35), Innovation (weight 0.25). Range: 1–5, step: 0.5.
  - **Real-Time Weighted Score Computation:** As any slider moves, $S_{ij} = \sum_k w_k \cdot s_{ijk}$ is recomputed client-side and displayed in a large readout (e.g., `Weighted Score: 3.85 / 5.00`).
  - **Validation Contract:** "Submit Ballot" button is disabled until all criteria have a value ≥ 1. Optional `comment` textarea below sliders.
  - On submit: `POST /api/judge/scores` with `{ project_id, raw_criteria, comment }`. Success → Shadcn UI success toast. `403` → error toast.
- **Keyboard Navigation:** `→` key navigates to next unreviewed project; `←` navigates to previous.

#### T2 — Organizer Mission Control Dashboard (Next.js Frontend Specification)

The organizer dashboard (`/organizer/dashboard`) MUST render a **Mission Control** view with auto-refreshing live data:

- **Circular Completion Rings:** One SVG/CSS `conic-gradient` ring per track showing `Completed / Total Assigned` review count. Ring fills proportionally to completion. Center text shows `N%`. Lucide Icons identify each track.
- **Active Judge Status Matrix:** A grid/table of all 30 judges with columns: Judge Name, Track(s), Submitted Reviews, Remaining Reviews, and Status badge (`COMPLETE` green / `PENDING` amber / `NOT STARTED` red). Powered by `GET /api/organizer/judge-status`.
- **Live Normalized Leaderboard:** Ranked project list showing: Rank, `▲ +N` / `▼ -N` delta badges (green/red), Project Title, Track, Team, Raw Average Score, Normalized Score. Auto-refreshes every 30 seconds. Verified rank movements rendered: `▲ +4` (Project 17 / `prj_17`), `▼ -6` (Project 09 / `prj_09`).
- **1-Click CSV Export Button:** Shadcn UI `Button` labeled "Export Results CSV" — triggers `GET /api/export.csv` and browser file download via `Content-Disposition: attachment`. Shows a Lucide `Loader2 animate-spin` spinner while streaming.
- **Data Refresh:** Auto-refresh every 30 s. "Last updated: HH:MM:SS" timestamp in top-right corner. Manual "Refresh Now" button with Lucide `RefreshCw` icon.

---

## 4. BACKEND-ENFORCED ROLE ISOLATION MATRIX (FIG. 02)

The following matrix MUST be enforced at the backend middleware/API layer (Next.js Route Handlers under `app/api/...`):

| Role (Actor) | Own Scores | Peer Scores | Other Track Scores | Aggregate Results | Audit Log |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **VISITOR** | ✗ (401) | ✗ (401) | ✗ (401) | ✗ (401) | ✗ (401) |
| **PARTICIPANT** | ✗ (403) | ✗ (403) | ✗ (403) | ✗ (403) | ✗ (403) |
| **JUDGE** | **+ (200)** | ✗ (403) | ✗ (403) | ✗ (403) | ✗ (403) |
| **ORGANIZER** | **+ (200)** | **+ (200)** | **+ (200)** | **+ (200)** | **+ (200)** |
| **ADMIN** | **+ (200)** | **+ (200)** | **+ (200)** | **+ (200)** | **+ (200)** |

**Legend:** `+ = 200 OK` | `✗ = 401 Unauthorized / 403 Forbidden` at the HTTP API layer.

Role isolation is enforced inside each Route Handler (e.g., `app/api/judge/scores/route.ts`) via a shared `requireRole(request, allowedRoles)` utility. This function reads `Cookie: session=...`, resolves role from the `sessions` database table, and returns `NextResponse.json(...)` with the correct HTTP error code before any data query executes.

---

## 5. DATA INGESTION & ACCEPTANCE CONTRACTS

### Ingestion Contract (`fixtures.json`)

On system boot, the application MUST detect and initialize `fixtures.json` with the following data:

- 1 Event (`evt_01`, `submissions_close`: `2026-03-01T18:00:00Z` — date intentionally in the past)
- 8 Tracks (`trk_01` to `trk_08`)
- 30 Judges (`jdg_01` to `jdg_30`)
- 40 Teams (`tm_01` to `tm_40`)
- 41 Projects (`prj_01` to `prj_41`)
- Edge Cases:
  - Duplicate project (`prj_41` matching `prj_07`)
  - Incomplete judge review batches
  - Empty comments (`""`)

### Acceptance Contract (`run.py` Assertions)

The platform MUST pass all 7 automated acceptance checks without errors:

1. `GET {routes.gallery}` (No auth) → `200 OK`
2. `GET {routes.gallery}` → Response body MUST contain fixture project titles.
3. `POST {routes.submit}` (As participant) → `4xx` (Closed event check).
4. `GET {routes.judge_scores}` (As judge_a) → `200 OK`.
5. `GET {routes.peer_scores}` (As judge_b targeting judge_a) → `401` or `403`.
6. `GET {routes.judge_scores}` (As participant) → `401` or `403`.
7. `GET {routes.csv_export}` (As organizer) → `200 OK` and the response body MUST contain valid CSV with the comma delimiter `,`.
