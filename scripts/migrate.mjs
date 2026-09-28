// scripts/migrate.mjs
// Automated DDL Migration Engine for Dogfood 2026 Hackathon Portal
// Authoritative specification: DATA-MODEL.md Rev 2.6 / Unit DF-01

import fs from 'node:fs';
import path from 'node:path';
import postgres from 'postgres';

// Simple .env.local reader for standalone script execution
function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const [key, ...rest] = trimmed.split('=');
      const val = rest.join('=').trim().replace(/^["']|["']$/g, '');
      if (key && !process.env[key.trim()]) {
        process.env[key.trim()] = val;
      }
    }
  }
}

loadEnv();

const connectionString =
  process.env.DATABASE_URL ||
  'postgresql://dogfood_user:dogfood_secure_password_local@localhost:5432/dogfood_db';

console.log('[MIGRATION] Connecting to PostgreSQL database...');

const sql = postgres(connectionString, {
  connect_timeout: 10,
  max: 1,
  onnotice: () => {},
});

const DDL_STATEMENTS = [
  {
    name: 'events',
    sql: `
      CREATE TABLE IF NOT EXISTS events (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        submissions_close TIMESTAMPTZ NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `,
  },
  {
    name: 'tracks',
    sql: `
      CREATE TABLE IF NOT EXISTS tracks (
        id VARCHAR(64) PRIMARY KEY,
        event_id VARCHAR(64) NOT NULL REFERENCES events(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `,
  },
  {
    name: 'users',
    sql: `
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        role VARCHAR(32) NOT NULL CHECK (role IN ('visitor', 'participant', 'judge', 'organizer', 'admin')),
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `,
  },
  {
    name: 'sessions',
    sql: `
      CREATE TABLE IF NOT EXISTS sessions (
        session_id VARCHAR(128) PRIMARY KEY,
        user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        role VARCHAR(32) NOT NULL,
        expires_at TIMESTAMPTZ NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `,
  },
  {
    name: 'judge_tracks',
    sql: `
      CREATE TABLE IF NOT EXISTS judge_tracks (
        judge_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        track_id VARCHAR(64) NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
        assigned_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (judge_id, track_id)
      );
    `,
  },
  {
    name: 'teams',
    sql: `
      CREATE TABLE IF NOT EXISTS teams (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        invite_code VARCHAR(64) UNIQUE NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `,
  },
  {
    name: 'team_members',
    sql: `
      CREATE TABLE IF NOT EXISTS team_members (
        id SERIAL PRIMARY KEY,
        team_id VARCHAR(64) NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
        user_email VARCHAR(255) NOT NULL,
        joined_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (team_id, user_email)
      );
    `,
  },
  {
    name: 'projects',
    sql: `
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
    `,
  },
  {
    name: 'rubric_criteria',
    sql: `
      CREATE TABLE IF NOT EXISTS rubric_criteria (
        id VARCHAR(64) PRIMARY KEY,
        event_id VARCHAR(64) NOT NULL REFERENCES events(id) ON DELETE CASCADE,
        name VARCHAR(64) NOT NULL,
        weight NUMERIC(5,2) NOT NULL DEFAULT 1.00 CHECK (weight > 0),
        max_score INTEGER NOT NULL DEFAULT 5 CHECK (max_score > 0),
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (event_id, name)
      );
    `,
  },
  {
    name: 'scores',
    sql: `
      CREATE TABLE IF NOT EXISTS scores (
        id SERIAL PRIMARY KEY,
        judge_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        project_id VARCHAR(64) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        raw_criteria JSONB NOT NULL,
        total_raw_score NUMERIC(5,2) NOT NULL,
        total_weighted_score NUMERIC(5,2) NOT NULL,
        comment TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (judge_id, project_id)
      );
    `,
  },
  {
    name: 'audit_logs',
    sql: `
      CREATE TABLE IF NOT EXISTS audit_logs (
        id SERIAL PRIMARY KEY,
        actor_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
        action VARCHAR(64) NOT NULL,
        target_resource VARCHAR(128) NOT NULL,
        status_code INTEGER NOT NULL,
        payload_snapshot JSONB,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `,
  },
];

const INDEX_STATEMENTS = [
  { name: 'idx_projects_track', sql: 'CREATE INDEX IF NOT EXISTS idx_projects_track ON projects(track_id);' },
  { name: 'idx_projects_team', sql: 'CREATE INDEX IF NOT EXISTS idx_projects_team ON projects(team_id);' },
  { name: 'idx_scores_project', sql: 'CREATE INDEX IF NOT EXISTS idx_scores_project ON scores(project_id);' },
  { name: 'idx_scores_judge', sql: 'CREATE INDEX IF NOT EXISTS idx_scores_judge ON scores(judge_id);' },
  { name: 'idx_sessions_lookup', sql: 'CREATE INDEX IF NOT EXISTS idx_sessions_lookup ON sessions(session_id, expires_at);' },
  { name: 'idx_audit_logs_actor', sql: 'CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON audit_logs(actor_id);' },
];

async function runMigration() {
  try {
    // Test connectivity
    await sql`SELECT 1;`;
    console.log('[MIGRATION] Database connection verified.');

    for (const table of DDL_STATEMENTS) {
      process.stdout.write(`[MIGRATION] Creating table '${table.name}'... `);
      await sql.unsafe(table.sql);
      console.log('✓');
    }

    for (const idx of INDEX_STATEMENTS) {
      process.stdout.write(`[MIGRATION] Creating index '${idx.name}'... `);
      await sql.unsafe(idx.sql);
      console.log('✓');
    }

    console.log('======================================================================');
    console.log('[MIGRATION] SUCCESS: All 11 tables and 6 indexes created/verified.');
    console.log('======================================================================');
  } catch (err) {
    console.error('======================================================================');
    console.error('[MIGRATION] ERROR: Failed to run DDL migration.');
    console.error(err.message || err);
    console.error('Connection URL used:', connectionString.replace(/:[^:@]+@/, ':****@'));
    console.error('Ensure PostgreSQL is running locally or in Docker:');
    console.error('  docker compose up -d db');
    console.error('======================================================================');
    process.exit(1);
  } finally {
    await sql.end();
  }
}

runMigration();
