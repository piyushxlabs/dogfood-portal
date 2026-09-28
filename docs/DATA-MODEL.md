
# DATA-MODEL.md
**Project:** Dogfood 2026 Hackathon Portal  
**Document:** System Relational Schema & Data Pipeline Contract  
**Standard:** Rev 2.6 / Unit DF-01  
**Status:** AUTHORITATIVE & LOCKED  

---

## 1. DATA MODEL ARCHITECTURAL PHILOSOPHY

The platform's relational schema is designed around three fundamental principles:

1. **Strict Offline Relational Integrity:**  
   Without any external ORM abstraction or hosted BaaS (Supabase/Firebase), data integrity is enforced through core SQL foreign keys, unique constraints, and check constraints.
2. **Defensive Schema Design (Edge-Case Resilience):**  
   Intentionally awkward real-world edge cases in the synthetic dataset (`fixtures.json`) — duplicate submissions, missing reviews, scoring variance, and blank comments — MUST NOT crash the database layer and MUST instead be handled gracefully.
3. **High-Performance Querying & Strict Isolation:**  
   Judge score lookups, deadline enforcement queries, aur organizer CSV export queries ke liye specialized indexes optimize kiye gaye hain taaki sub-millisecond execution mile.

---

## 2. RELATIONAL ENTITIES & RELATIONSHIPS (ER OVERVIEW)

The system is structured around 10 core tables:

* **`events`**: Hackathon lifecycle, dates, and strict deadline timestamps.
* **`tracks`**: Event categorization tracks (Developer tools, Security, Climate, etc.).
* **`users`**: System actors and their assigned roles (visitor, participant, judge, organizer, admin).
* **`sessions`**: Server-side local session store (Cookie/Header authentication mapping).
* **`judge_tracks`**: Many-to-Many junction table that assigns judges to specific tracks.
* **`teams`**: Participant teams and their unique join/invite codes.
* **`team_members`**: Association mapping between teams and participants.
* **`projects`**: Hackathon submissions, draft status, media URLs, and submission timestamps.
* **`rubric_criteria`**: Weighted scoring rubrics defined by the organizer.
* **`scores`**: Criteria-level raw scores, weighted scores, and comments submitted by judges.
* **`audit_logs`**: Tamper-evident log that captures every score update, submission attempt, and role access.

---

## 3. PRODUCTION SQL DDL SPECIFICATION (PostgreSQL / SQLite Compatible)

```sql
-- 1. EVENTS TABLE
CREATE TABLE IF NOT EXISTS events (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    submissions_close TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. TRACKS TABLE
CREATE TABLE IF NOT EXISTS tracks (
    id VARCHAR(64) PRIMARY KEY,
    event_id VARCHAR(64) NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(32) NOT NULL CHECK (role IN ('visitor', 'participant', 'judge', 'organizer', 'admin')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4. SESSIONS TABLE (Local Session Engine)
CREATE TABLE IF NOT EXISTS sessions (
    session_id VARCHAR(128) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(32) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 5. JUDGE_TRACKS TABLE (M:N Track Assignment)
CREATE TABLE IF NOT EXISTS judge_tracks (
    judge_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    track_id VARCHAR(64) NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (judge_id, track_id)
);

-- 6. TEAMS TABLE
CREATE TABLE IF NOT EXISTS teams (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    invite_code VARCHAR(64) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 7. TEAM_MEMBERS TABLE
CREATE TABLE IF NOT EXISTS team_members (
    id SERIAL PRIMARY KEY,
    team_id VARCHAR(64) NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    user_email VARCHAR(255) NOT NULL,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (team_id, user_email)
);

-- 8. PROJECTS (SUBMISSIONS) TABLE
CREATE TABLE IF NOT EXISTS projects (
    id VARCHAR(64) PRIMARY KEY,
    team_id VARCHAR(64) NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    track_id VARCHAR(64) NOT NULL REFERENCES tracks(id) ON DELETE RESTRICT,
    title VARCHAR(255) NOT NULL,
    summary TEXT NOT NULL,
    description TEXT,
    repo_url TEXT NOT NULL,
    live_url TEXT,
    video_url TEXT,
    is_draft BOOLEAN NOT NULL DEFAULT FALSE,
    submitted_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 9. RUBRIC_CRITERIA TABLE
CREATE TABLE IF NOT EXISTS rubric_criteria (
    id VARCHAR(64) PRIMARY KEY,
    event_id VARCHAR(64) NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    name VARCHAR(64) NOT NULL, -- e.g. functionality, quality, innovation
    weight NUMERIC(5,2) NOT NULL DEFAULT 1.00 CHECK (weight > 0),
    max_score INTEGER NOT NULL DEFAULT 5 CHECK (max_score > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (event_id, name)
);

-- 10. SCORES TABLE (Atomic Evaluation Ledger)
CREATE TABLE IF NOT EXISTS scores (
    id SERIAL PRIMARY KEY,
    judge_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    project_id VARCHAR(64) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    raw_criteria JSONB NOT NULL, -- e.g. {"functionality": 4, "quality": 3, "innovation": 2}
    total_raw_score NUMERIC(5,2) NOT NULL,
    total_weighted_score NUMERIC(5,2) NOT NULL,
    comment TEXT, -- Intentionally NULLABLE to support fixture empty string comments
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (judge_id, project_id) -- One ballot per judge per project
);

-- 11. AUDIT_LOGS TABLE
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    actor_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(64) NOT NULL, -- e.g. 'SUBMISSION_REJECTED_DEADLINE', 'PEER_SCORE_ACCESS_BLOCKED'
    target_resource VARCHAR(128) NOT NULL,
    status_code INTEGER NOT NULL,
    payload_snapshot JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

```

---

## 3B. NEXT.JS / TYPESCRIPT TYPE INTERFACES (1:1 MAPPING TO SQL SCHEMA)

The following TypeScript interfaces MUST be defined in `src/types/db.ts` (or equivalent) and used across all Next.js Route Handlers, React Server Components, and Client Components. Each interface maps exactly 1:1 to the SQL DDL tables above.

```typescript
// src/types/db.ts
// Auto-mapped from DATA-MODEL.md Rev 2.6 / Unit DF-01

export type UserRole = 'visitor' | 'participant' | 'judge' | 'organizer' | 'admin';

export interface DbEvent {
  id: string;               // VARCHAR(64) PRIMARY KEY
  name: string;             // VARCHAR(255) NOT NULL
  description: string | null;
  submissions_close: string; // ISO-8601 UTC TIMESTAMPTZ
  created_at: string;
  updated_at: string;
}

export interface DbTrack {
  id: string;               // VARCHAR(64) PRIMARY KEY
  event_id: string;         // FK -> events.id
  name: string;
  description: string | null;
  created_at: string;
}

export interface DbUser {
  id: string;               // VARCHAR(64) PRIMARY KEY
  name: string;
  email: string;            // UNIQUE NOT NULL
  role: UserRole;           // CHECK constraint enforced in SQL
  created_at: string;
}

export interface DbSession {
  session_id: string;       // VARCHAR(128) PRIMARY KEY — e.g. 'org_7f2a'
  user_id: string;          // FK -> users.id
  role: UserRole;
  expires_at: string;       // ISO-8601 UTC
  created_at: string;
}

export interface DbJudgeTrack {
  judge_id: string;         // FK -> users.id (Composite PK with track_id)
  track_id: string;         // FK -> tracks.id
  assigned_at: string;
}

export interface DbTeam {
  id: string;               // VARCHAR(64) PRIMARY KEY
  name: string;
  invite_code: string;      // UNIQUE NOT NULL
  created_at: string;
}

export interface DbTeamMember {
  id: number;               // SERIAL PRIMARY KEY
  team_id: string;          // FK -> teams.id
  user_email: string;       // UNIQUE (team_id, user_email)
  joined_at: string;
}

export interface DbProject {
  id: string;               // VARCHAR(64) PRIMARY KEY
  team_id: string;          // FK -> teams.id
  track_id: string;         // FK -> tracks.id
  title: string;
  summary: string;
  description: string | null;
  repo_url: string;
  live_url: string | null;
  video_url: string | null; // Used by Judge Console video embed
  is_draft: boolean;
  submitted_at: string;     // ISO-8601 UTC
  created_at: string;
  updated_at: string;
}

export interface RawCriteria {
  functionality: number;    // Score 1-5, weight 0.40
  quality: number;          // Score 1-5, weight 0.35
  innovation: number;       // Score 1-5, weight 0.25
}

export interface DbScore {
  id: number;               // SERIAL PRIMARY KEY
  judge_id: string;         // FK -> users.id
  project_id: string;       // FK -> projects.id — UNIQUE (judge_id, project_id)
  raw_criteria: RawCriteria; // JSONB column
  total_raw_score: number;   // NUMERIC(5,2)
  total_weighted_score: number; // NUMERIC(5,2)
  comment: string | null;   // NULLABLE — supports empty string from fixtures
  created_at: string;
  updated_at: string;
}

export interface DbRubricCriteria {
  id: string;               // VARCHAR(64) PRIMARY KEY
  event_id: string;         // FK -> events.id
  name: string;             // e.g. 'functionality'
  weight: number;           // NUMERIC(5,2) > 0
  max_score: number;        // INTEGER > 0
  created_at: string;
}

export type AuditAction =
  | 'SUBMISSION_REJECTED_DEADLINE'
  | 'PEER_SCORE_ACCESS_BLOCKED'
  | 'JUDGE_SCORE_SUBMITTED'
  | 'ORGANIZER_CSV_EXPORT'
  | 'SESSION_INVALID'
  | 'PARTICIPANT_JUDGE_ROUTE_BLOCKED';

export interface AuditLogPayload {
  http_method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;             // e.g. '/api/judge/scores'
  query_params?: Record<string, string>; // e.g. { judge: 'judge_a' }
  actor_role: UserRole | 'visitor';
  target_judge_id?: string; // Populated when peer-score probe is detected
  blocked_status_code: 401 | 403;
  user_agent?: string;
  timestamp_utc: string;
}

export interface DbAuditLog {
  id: number;               // SERIAL PRIMARY KEY
  actor_id: string | null;  // FK -> users.id ON DELETE SET NULL
  action: AuditAction;
  target_resource: string;  // e.g. '/api/judge/scores?judge=judge_a'
  status_code: number;
  payload_snapshot: AuditLogPayload | null; // JSONB
  created_at: string;
}

// ─── Composite Response Types (used by Dashboard Route Handlers) ────────────

export interface ProjectWithRelations extends DbProject {
  track: DbTrack;
  team: DbTeam;
  review_count: number;
  raw_average_score: number | null;
  weighted_average_score: number | null;
  normalized_score: number | null;
  rank_delta: number | null;  // Positive = climbed, Negative = dropped
}

export interface JudgeStatusRow {
  judge: DbUser;
  tracks: DbTrack[];
  submitted_reviews: number;
  remaining_reviews: number;
  status: 'COMPLETE' | 'PENDING' | 'NOT_STARTED';
}
```

---

## 4. EDGE-CASE RESILIENCE SPECIFICATION

The five critical edge cases in `fixtures.json` and live event scenarios are isolated at the database layer as follows:

### Edge Case 1: Duplicate Project Submissions (`prj_41` vs `prj_07`)

* **The Reality in Data:** `fixtures.json` me `prj_07` aur `prj_41` both have the title `"Dry Harbour"` hai, both use the same repository URL, aur both were submitted by team `"tm_07"` and were submitted (`prj_07` at `04:29:00Z`, `prj_41` at `17:57:00Z`).


* **The Architectural Trap:** If the database used `UNIQUE(team_id, title)` ya `UNIQUE(team_id, repo_url)` constraints, the seed script would crash during startup.


* **Resolution:** The primary key is defined only on `id`. A team can retain multiple submissions/versions. The normalization query considers the submission with the latest timestamp as active, while historical seed integrity remains intact.



### Edge Case 2: Incomplete Review Batches & Review Variance

* **The Reality in Data:** The dataset contains `prj_07` has 5 reviews hain, while `prj_10`, `prj_15`, `prj_18`, `prj_19` has sirf 2 reviews hain.


* **Resolution:**
* The schema does not enforce any rigid threshold check constraint on review count.
* Score aggregation queries implement `HAVING COUNT(scores.id) >= 1` with dynamic weight adjustment so that a `DivideByZero` exception cannot occur when review batches are incomplete.





### Edge Case 3: Empty String Comments & Missing Feedback

* **The Reality in Data:** `fixtures.json` me 10 se zyada review entries me `"comment": ""` are blank strings.


* **Resolution:** `scores.comment` column ko `TEXT NULLABLE` defined as. Seeding layer blank strings ko gracefully allow karti hai aur validation layer judge form par crash hone se bachti hai.



### Edge Case 4: Closed Deadline Enforcement (`submissions_close`)

* **The Reality in Data:** The fixture event deadline is `2026-03-01T18:00:00Z` hai, which is a past date..


* **Resolution:** The project submission endpoint compares the system clock against the `events.submissions_close` value stored in the database:

$$\text{IF } \text{CURRENT\_TIMESTAMP} > \text{events.submissions\_close} \implies \text{RETURN HTTP } 400 \text{ [DEADLINE\_PASSED]} \text{}$$



After the seed data is loaded, this check automatically allows the `run.py` T1 check to pass.



### Edge Case 5: Many-to-Many Judge Track Scoping

* **The Reality in Data:** Some judges (jaise `jdg_02`) are assigned to multiple tracks (`trk_02`, `trk_04`), while kuch sirf single track me hain (`jdg_01` in `trk_03`).


* **Resolution:** `judge_tracks` table strict M:N relationship implement karti hai. Judge portal sirf unhi projects ko fetch karne ki permission deta hai jo judge ke assigned tracks me belong karte hain.



---

## 5. SEED MAPPING CONTRACT (`fixtures.json` -> RELATIONAL SQL)

During startup, the seed engine will load `fixtures.json` through the following deterministic pipeline:

| Fixtures.json Node | Source Path | Target SQL Table | Transformation / Validation Logic |
| --- | --- | --- | --- |
| `event` | `$.event` | `events` | Direct insert. Parse the ISO-8601 UTC timestamp.

 |
| `tracks` | `$.tracks[*] ` | `tracks` | Direct insert with `event_id = evt_01`.

 |
| `judges` | `$.judges[*] ` | `users` | Insert as `role = 'judge'`. Perform an email uniqueness check.

 |
| `judges.tracks` | `$.judges[*].tracks` | `judge_tracks` | Unnest the array into junction rows `(judge_id, track_id)`.

 |
| `teams` | `$.teams[*] ` | `teams` | Generate a unique `invite_code = 'inv_' + id`.

 |
| `teams.members` | `$.teams[*].members` | `team_members` | Unnest email strings and automatically link them to the team.

 |
| `projects` | `$.projects[*] ` | `projects` | Direct insert. Link foreign keys (`team_id`, `track_id`).

 |
| `scores` | `$.scores[*] ` | `scores` | Store raw criteria JSONB, calculate the total raw score, and allow an empty comment.

 |
| **Test Sessions** | *Derived at Boot* | `sessions` | Create deterministic session IDs: `session=org_7f2a`, `jdg_a_91bc`, etc.

 |

---

## 6. IMPORT & EXPORT PIPELINE CONTRACT

### Ingestion Contract (Offline Boot Seeding)

* At system startup, the system will check for: `./fixtures.json` ya `./data/fixtures.json`.


* The seeder will wrap database operations in a transaction (`BEGIN TRANSACTION ... COMMIT`). If any node is corrupted, the state will be cleanly rolled back.

### CSV Export Pipeline (`GET /api/export.csv`)

The acceptance test verifies `T2.csv_export` enforce karta hai ki response status `200 OK` ho aur pehli line me comma (`,`) present ho.

The export engine executes the query as a stream:

```sql
SELECT 
    p.id AS project_id,
    p.title AS project_title,
    t.name AS track_name,
    tm.name AS team_name,
    p.repo_url AS repository_url,
    COUNT(s.id) AS review_count,
    ROUND(AVG(s.total_raw_score), 2) AS raw_average_score,
    ROUND(AVG(s.total_weighted_score), 2) AS weighted_average_score,
    p.submitted_at AS submission_timestamp
FROM projects p
JOIN tracks t ON p.track_id = t.id
JOIN teams tm ON p.team_id = tm.id
LEFT JOIN scores s ON p.id = s.project_id
GROUP BY p.id, p.title, t.name, tm.name, p.repo_url, p.submitted_at
ORDER BY weighted_average_score DESC;

```

**Export Output Header Format (First Line Verification):**

```csv
project_id,project_title,track_name,team_name,repository_url,review_count,raw_average_score,weighted_average_score,submission_timestamp

```

---

## 7. INDEXING & QUERY OPTIMIZATION STRATEGY

The following indexes are required to minimize latency during high-load testing and acceptance probes:

```sql
-- Gallery Fast Search & Filter Index
CREATE INDEX idx_projects_gallery ON projects(track_id, is_draft, submitted_at DESC);
CREATE INDEX idx_projects_title_search ON projects(title);

-- Strict Role Isolation Index (Fast lookup of judge's own scores)
CREATE INDEX idx_scores_judge_lookup ON scores(judge_id, project_id);
CREATE INDEX idx_scores_project_lookup ON scores(project_id);

-- HIGH-PERFORMANCE COMPOSITE AGGREGATION INDEX
-- Powers the Organizer Mission Control Dashboard real-time leaderboard query.
-- Eliminates sequential scans during AVG(total_weighted_score) GROUP BY project_id.
-- Also accelerates the /api/export.csv streaming pipeline (ORDER BY weighted_average_score DESC).
CREATE INDEX idx_scores_aggregation ON scores(project_id, judge_id, total_weighted_score);

-- Session Validation Fast Cache Index
CREATE INDEX idx_sessions_lookup ON sessions(session_id, expires_at);

-- Deadline Verification Index
CREATE INDEX idx_events_deadline ON events(id, submissions_close);

-- Audit Log Security Event Index (fast range scans for 403 events by actor and action)
CREATE INDEX idx_audit_logs_security ON audit_logs(actor_id, action, created_at DESC);
CREATE INDEX idx_audit_logs_status ON audit_logs(status_code, created_at DESC);

```

### 7.1 `audit_logs` Payload Specification for Security Events

Every HTTP 403 response triggered by a peer-score access probe MUST insert a structured row into `audit_logs` with a JSONB `payload_snapshot` matching the `AuditLogPayload` TypeScript interface:

```json
// Example: Judge B (jdg_02) attempts to read Judge A's scores via query param
{
  "http_method": "GET",
  "path": "/api/judge/scores",
  "query_params": { "judge": "judge_a" },
  "actor_role": "judge",
  "target_judge_id": "jdg_01",
  "blocked_status_code": 403,
  "user_agent": "python-urllib3/2.x",
  "timestamp_utc": "2026-09-25T17:35:42Z"
}
```

The corresponding `audit_logs` row:

| Column | Value |
| :--- | :--- |
| `actor_id` | `jdg_02` (the blocked judge's user ID) |
| `action` | `PEER_SCORE_ACCESS_BLOCKED` |
| `target_resource` | `/api/judge/scores?judge=judge_a` |
| `status_code` | `403` |
| `payload_snapshot` | *(JSON object above)* |

Similarly, `SUBMISSION_REJECTED_DEADLINE` events capture `POST /projects/new` blocked calls with `blocked_status_code: 400` or `403` and the `actor_role: 'participant'`.

---

## 8. INTEGRITY VERIFICATION CHECKLIST

The Coding Agent MUST verify the following after the build is complete:

* [ ] `fixtures.json` when loaded duplicate `prj_41` is inserted without a unique-constraint error.


* [ ] `scores.comment` is saved gracefully when it is an empty string.


* [ ] `events.submissions_close` comparison query returns `4xx` status milta hai.


* [ ] `/api/export.csv` call emits the exact CSV header with comma delimiters.


* [ ] Session tokens `.dogfood.toml` ke match the headers 1:1.

