// scripts/test-t3-t4.mjs
// Automated Verification Suite for Tier 3, Tier 4, and Spec Bonuses
// Tests live against http://localhost:8080

import assert from 'node:assert/strict';

const BASE_URL = process.env.PORTAL_URL || 'http://localhost:8080';
const SESSIONS = {
  organizer: 'org_7f2a',
  judge_a: 'jdg_a_91bc',
  judge_b: 'jdg_b_44de',
  participant: 'prt_2e88',
};

console.log('======================================================================');
console.log(`[TEST T3/T4] Testing Portal at ${BASE_URL}`);
console.log('======================================================================\n');

async function runTestSuite() {
  let passedCount = 0;
  let totalCount = 0;

  async function check(name, fn) {
    totalCount++;
    process.stdout.write(`[${totalCount.toString().padStart(2, '0')}] ${name.padEnd(55, '.')} `);
    try {
      await fn();
      passedCount++;
      console.log('PASS');
    } catch (err) {
      console.log('FAIL');
      console.error(`     Error: ${err.message}`);
    }
  }

  // ─── TIER 3: COMMUNITY VOTING & ANTI-ABUSE ───────────────────────────────

  const testVoterEmail = `audit_voter_${Date.now()}@example.org`;

  await check('T3: Valid vote submission returns 201 Created', async () => {
    const res = await fetch(`${BASE_URL}/api/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        project_id: 'prj_01',
        voter_email: testVoterEmail,
      }),
    });
    assert.equal(res.status, 201, `Expected status 201, got ${res.status}`);
    const data = await res.json();
    assert.equal(data.success, true);
  });

  await check('T3: Duplicate vote returns 409 Conflict', async () => {
    const res = await fetch(`${BASE_URL}/api/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        project_id: 'prj_01',
        voter_email: testVoterEmail, // Exact same email and project
      }),
    });
    assert.equal(res.status, 409, `Expected status 409 Conflict on duplicate vote, got ${res.status}`);
  });

  await check('T3: Invalid email format returns 400 Bad Request', async () => {
    const res = await fetch(`${BASE_URL}/api/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        project_id: 'prj_01',
        voter_email: 'not-an-email',
      }),
    });
    assert.equal(res.status, 400, `Expected status 400, got ${res.status}`);
  });

  await check('T3: Anti-Bandwagon hides tallies from public visitors', async () => {
    const res = await fetch(`${BASE_URL}/api/vote/results`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.tallies_hidden, true, 'Tallies must be hidden for public visitors');
    assert.equal(data.results, undefined, 'Results array must not be leaked to public');
  });

  await check('T3: Organizer can inspect full vote tallies', async () => {
    const res = await fetch(`${BASE_URL}/api/vote/results`, {
      headers: { Cookie: `session=${SESSIONS.organizer}` },
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.tallies_hidden, false, 'Organizer must see tallies');
    assert.ok(Array.isArray(data.results), 'Organizer must receive results array');
  });

  await check('T3: Project comments accept POST and sanitize XSS', async () => {
    const res = await fetch(`${BASE_URL}/api/projects/prj_01/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        author_name: 'Security Tester',
        author_email: 'sec@example.org',
        comment_text: "<script>alert('xss')</script> Clean comment body.",
      }),
    });
    assert.equal(res.status, 201);
    const data = await res.json();
    assert.ok(!data.comment.comment_text.includes('<script>'), 'Unescaped <script> tag must be sanitized');
    assert.ok(data.comment.comment_text.includes('&lt;script&gt;'), 'HTML entities must be applied');
  });

  // ─── TIER 4: REST API, EXTENSIONS & EXPORTS ──────────────────────────────

  await check('T4: REST API GET /api/v1/projects returns paginated data', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/projects?limit=5`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(data.projects.length <= 5, 'Must respect limit=5');
    assert.ok(data.total >= 40, 'Must report total projects in database');
  });

  await check('T4: REST API GET /api/v1/tracks returns track counts', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/tracks`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(data.tracks.length >= 8, 'Must return tracks list');
    assert.ok(typeof data.tracks[0].project_count === 'number', 'Must include project_count');
  });

  await check('T4: GET /api/v1/leaderboard blocks participants (403)', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/leaderboard`, {
      headers: { Cookie: `session=${SESSIONS.participant}` },
    });
    assert.equal(res.status, 403, 'Participant must be blocked from v1 leaderboard');
  });

  await check('T4: GET /api/v1/leaderboard permits organizer (200)', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/leaderboard`, {
      headers: { Cookie: `session=${SESSIONS.organizer}` },
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(Array.isArray(data.leaderboard), 'Must return calibrated leaderboard');
    assert.ok(data.calibration_summary.sigma_norm <= 0.35, 'Normalized sigma must be <= 0.35');
  });

  await check('T4: POST /api/v1/export/bulk outputs full archive', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/export/bulk`, {
      method: 'POST',
      headers: { Cookie: `session=${SESSIONS.organizer}` },
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.format_version, 'DOGFOOD-2026-ARCHIVE-V1');
    assert.ok(Array.isArray(data.projects), 'Must include projects');
    assert.ok(Array.isArray(data.scores), 'Must include scores');
    assert.ok(data.calibration, 'Must include calibration');
  });

  await check('T4: POST /api/webhooks registers target with HMAC token', async () => {
    const res = await fetch(`${BASE_URL}/api/webhooks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `session=${SESSIONS.organizer}`,
      },
      body: JSON.stringify({
        target_url: 'https://sponsor-portal.example.org/webhook',
        event_type: 'ballot.finalized',
      }),
    });
    assert.equal(res.status, 201);
    const data = await res.json();
    assert.ok(data.webhook.secret_token.length >= 64, 'Must return cryptographically strong secret token');
  });

  await check('T4: GET /projects/prj_01/certificate renders tamper seal', async () => {
    const res = await fetch(`${BASE_URL}/projects/prj_01/certificate`);
    assert.equal(res.status, 200);
    const html = await res.text();
    assert.ok(html.includes('Certificate of Completion'), 'Must render certificate title');
    assert.ok(html.includes('SHA-256 Cryptographic Tamper Seal'), 'Must display SHA-256 tamper seal');
  });

  await check('T4: Embed Gallery /embed/gallery renders standalone widget', async () => {
    const res = await fetch(`${BASE_URL}/embed/gallery?limit=4`);
    assert.equal(res.status, 200);
    const html = await res.text();
    assert.ok(html.includes('Sample Hack 2026 Showcase'), 'Must render widget title');
  });

  console.log('\n======================================================================');
  console.log(`[TEST T3/T4] RESULTS: ${passedCount}/${totalCount} assertions passed (${((passedCount/totalCount)*100).toFixed(0)}%)`);
  console.log('======================================================================\n');

  if (passedCount !== totalCount) {
    process.exit(1);
  }
}

runTestSuite().catch((err) => {
  console.error('[TEST T3/T4] Fatal error:', err);
  process.exit(1);
});
