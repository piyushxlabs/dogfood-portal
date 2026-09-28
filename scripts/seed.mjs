// scripts/seed.mjs
// Offline Transactional Seeder for Dogfood 2026 Hackathon Portal
// Authoritative specification: DATA-MODEL.md & ARCHITECTURE.md

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

// Resolve fixtures.json path
function resolveFixturesPath() {
  const candidates = [
    process.argv[2],
    process.env.FIXTURES_PATH,
    'fixtures.json',
    path.join('docs', 'fixtures.json'),
    path.join('/app', 'fixtures.json'),
  ].filter(Boolean);

  for (const candidate of candidates) {
    const resolved = path.resolve(process.cwd(), candidate);
    if (fs.existsSync(resolved)) {
      return resolved;
    }
  }
  return null;
}

const fixturePath = resolveFixturesPath();
if (!fixturePath) {
  console.error('[SEED] ERROR: fixtures.json not found in candidate paths.');
  process.exit(1);
}

console.log(`[SEED] Loading fixtures from: ${fixturePath}`);
const fixtures = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));

const sql = postgres(connectionString, {
  connect_timeout: 10,
  max: 1,
  onnotice: () => {},
});

async function runSeed() {
  try {
    await sql`SELECT 1;`;

    console.log('[SEED] Starting atomic transaction (sql.begin)...');
    await sql.begin(async (trx) => {
      // 1. Truncate all tables cleanly with CASCADE
      await trx`
        TRUNCATE TABLE
          audit_logs,
          scores,
          rubric_criteria,
          projects,
          team_members,
          teams,
          judge_tracks,
          sessions,
          users,
          tracks,
          events
        CASCADE;
      `;

      // 2. Insert Event
      const evt = fixtures.event;
      await trx`
        INSERT INTO events (id, name, submissions_close)
        VALUES (${evt.id}, ${evt.name}, ${evt.submissions_close});
      `;

      // 3. Insert Tracks
      for (const track of fixtures.tracks) {
        await trx`
          INSERT INTO tracks (id, event_id, name)
          VALUES (${track.id}, ${evt.id}, ${track.name});
        `;
      }

      // 4. Insert Judges & System Users
      for (const judge of fixtures.judges) {
        await trx`
          INSERT INTO users (id, name, email, role)
          VALUES (${judge.id}, ${judge.name}, ${judge.email}, 'judge');
        `;

        if (Array.isArray(judge.tracks)) {
          for (const trackId of judge.tracks) {
            await trx`
              INSERT INTO judge_tracks (judge_id, track_id)
              VALUES (${judge.id}, ${trackId})
              ON CONFLICT DO NOTHING;
            `;
          }
        }
      }

      // System accounts for testing & governance
      await trx`
        INSERT INTO users (id, name, email, role)
        VALUES
          ('usr_organizer', 'Head Organizer', 'organizer@hackathonraptors.org', 'organizer'),
          ('usr_participant', 'Lead Participant', 'participant@hackathonraptors.org', 'participant'),
          ('usr_admin', 'System Administrator', 'admin@hackathonraptors.org', 'admin')
        ON CONFLICT DO NOTHING;
      `;

      // 5. Insert Teams & Team Members
      for (const team of fixtures.teams) {
        const inviteCode = `inv_${team.id}`;
        await trx`
          INSERT INTO teams (id, name, invite_code)
          VALUES (${team.id}, ${team.name}, ${inviteCode});
        `;

        if (Array.isArray(team.members)) {
          for (const memberEmail of team.members) {
            await trx`
              INSERT INTO team_members (team_id, user_email)
              VALUES (${team.id}, ${memberEmail})
              ON CONFLICT DO NOTHING;
            `;
          }
        }
      }

      // 6. Insert Projects (Resilient to duplicate prj_41)
      for (const project of fixtures.projects) {
        await trx`
          INSERT INTO projects (
            id, team_id, track_id, title, summary, description, repo_url, is_draft, submitted_at
          ) VALUES (
            ${project.id},
            ${project.team},
            ${project.track},
            ${project.title},
            ${project.summary},
            ${project.summary},
            ${project.repo_url},
            false,
            ${project.submitted_at}
          );
        `;
      }

      // 7. Insert Rubric Criteria
      const rubricCriteria = [
        { id: 'crit_func', name: 'functionality', weight: 0.40, max_score: 5 },
        { id: 'crit_qual', name: 'quality', weight: 0.35, max_score: 5 },
        { id: 'crit_innov', name: 'innovation', weight: 0.25, max_score: 5 },
      ];

      for (const crit of rubricCriteria) {
        await trx`
          INSERT INTO rubric_criteria (id, event_id, name, weight, max_score)
          VALUES (${crit.id}, ${evt.id}, ${crit.name}, ${crit.weight}, ${crit.max_score});
        `;
      }

      // 8. Insert Scores (Defensive handling of nullable empty string comments)
      for (const score of fixtures.scores) {
        const func = Number(score.criteria.functionality) || 0;
        const qual = Number(score.criteria.quality) || 0;
        const innov = Number(score.criteria.innovation) || 0;

        const totalRaw = Number((func + qual + innov).toFixed(2));
        const totalWeighted = Number((0.40 * func + 0.35 * qual + 0.25 * innov).toFixed(2));
        const cleanComment =
          score.comment && typeof score.comment === 'string' && score.comment.trim() !== ''
            ? score.comment.trim()
            : null;

        await trx`
          INSERT INTO scores (
            judge_id, project_id, raw_criteria, total_raw_score, total_weighted_score, comment
          ) VALUES (
            ${score.judge},
            ${score.project},
            ${JSON.stringify(score.criteria)},
            ${totalRaw},
            ${totalWeighted},
            ${cleanComment}
          );
        `;
      }

      // 9. Pre-seed Deterministic Test Sessions
      const testSessions = [
        { session_id: 'org_7f2a', user_id: 'usr_organizer', role: 'organizer' },
        { session_id: 'jdg_a_91bc', user_id: 'jdg_01', role: 'judge' },
        { session_id: 'jdg_b_44de', user_id: 'jdg_02', role: 'judge' },
        { session_id: 'prt_2e88', user_id: 'usr_participant', role: 'participant' },
      ];

      const expiresAt = new Date('2028-01-01T00:00:00Z');
      for (const s of testSessions) {
        await trx`
          INSERT INTO sessions (session_id, user_id, role, expires_at)
          VALUES (${s.session_id}, ${s.user_id}, ${s.role}, ${expiresAt});
        `;
      }
    });

    console.log('======================================================================');
    console.log('DOGFOOD PORTAL SEEDED SUCCESSFULLY');
    console.log('Test Logins & Auth Headers:');
    console.log('  organizer    Cookie: session=org_7f2a');
    console.log('  judge_a      Cookie: session=jdg_a_91bc');
    console.log('  judge_b      Cookie: session=jdg_b_44de');
    console.log('  participant  Cookie: session=prt_2e88');
    console.log('======================================================================');
  } catch (err) {
    console.error('======================================================================');
    console.error('[SEED] ERROR: Failed to seed fixtures.');
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

runSeed();
