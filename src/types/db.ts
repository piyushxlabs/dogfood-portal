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
  blocked_status_code?: 400 | 401 | 403;
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
