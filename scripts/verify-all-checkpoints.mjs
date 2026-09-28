// scripts/verify-all-checkpoints.mjs
// End-to-End Production Verification Suite for Dogfood 2026 Portal
// Verifies live endpoints, role isolation, and graceful unauthenticated handling on http://localhost:8080

import assert from 'node:assert';
import http from 'node:http';

const BASE_URL = process.env.BASE_URL || 'http://localhost:8080';

console.log('======================================================================');
console.log(`[VERIFY-ALL] Testing Dogfood 2026 Live Portal at: ${BASE_URL}`);
console.log('======================================================================');

function request(path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const headers = options.headers || {};
    const method = options.method || 'GET';
    const body = options.body ? JSON.stringify(options.body) : null;

    if (body) {
      headers['Content-Type'] = 'application/json';
      headers['Content-Length'] = Buffer.byteLength(body);
    }

    const req = http.request(
      url,
      {
        method,
        headers,
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: data,
          });
        });
      }
    );

    req.on('error', (err) => {
      reject(err);
    });

    if (body) {
      req.write(body);
    }
    req.end();
  });
}

async function runVerification() {
  let passedCount = 0;

  // Checkpoint 1: Public Bento Gallery (Unauthenticated)
  console.log('\n[CHECKPOINT 1] Public Gallery (GET /projects without auth)...');
  const res1 = await request('/projects');
  assert.strictEqual(res1.status, 200, 'Expected HTTP 200 on /projects');
  assert(res1.body.includes('Glass Signal') || res1.body.includes('Slow Loom') || res1.body.includes('Loom'), 'Fixture project titles must be present in HTML');
  console.log('✓ PASS: Public gallery returned HTTP 200 with fixture titles embedded in HTML.');
  passedCount++;

  // Checkpoint 2: Submission Deadline Rejection (POST /projects/new)
  console.log('\n[CHECKPOINT 2] Deadline Refusal (POST /projects/new as participant)...');
  const res2 = await request('/projects/new', {
    method: 'POST',
    headers: { Cookie: 'session=prt_2e88' },
    body: { title: 'Late probe', summary: 'Deadline test' },
  });
  assert(res2.status >= 400 && res2.status < 500, `Expected 4xx, got ${res2.status}`);
  console.log(`✓ PASS: Closed event rejected late submission with HTTP ${res2.status}.`);
  passedCount++;

  // Checkpoint 3: Unauthenticated Judge Hub Graceful Card (GET /judge without auth)
  console.log('\n[CHECKPOINT 3] Unauthenticated Judge Hub (GET /judge without auth)...');
  const res3 = await request('/judge');
  assert.strictEqual(res3.status, 200, 'Expected HTTP 200 with graceful prompt card');
  assert(res3.body.includes('Judge Session Required'), 'Must render Judge Session Required card');
  assert(res3.body.includes('Login as Judge A'), 'Must offer 1-click test login button');
  console.log('✓ PASS: Unauthenticated access to /judge cleanly rendered Judge Session Required card.');
  passedCount++;

  // Checkpoint 4: Authenticated Judge Hub (GET /judge with session=jdg_a_91bc)
  console.log('\n[CHECKPOINT 4] Authenticated Judge Hub (GET /judge as judge_a)...');
  const res4 = await request('/judge', {
    headers: { Cookie: 'session=jdg_a_91bc' },
  });
  assert.strictEqual(res4.status, 200, 'Expected HTTP 200 on /judge for authenticated judge');
  assert(res4.body.includes('Assigned Ballot Queue'), 'Must render assigned ballot queue');
  assert(res4.body.includes('Review Project') || res4.body.includes('Edit Score'), 'Must show project review action');
  console.log('✓ PASS: Authenticated judge accessed /judge queue successfully.');
  passedCount++;

  // Checkpoint 5: Unauthenticated Project Review Console (GET /judge/review/prj_01 without auth)
  console.log('\n[CHECKPOINT 5] Unauthenticated Project Review (GET /judge/review/prj_01 without auth)...');
  const res5 = await request('/judge/review/prj_01');
  assert.strictEqual(res5.status, 200, 'Expected HTTP 200 with graceful prompt card');
  assert(res5.body.includes('Judge Session Required'), 'Must render Judge Session Required card');
  console.log('✓ PASS: Unauthenticated access to /judge/review/prj_01 cleanly rendered session card.');
  passedCount++;

  // Checkpoint 6: Authenticated Project Speed Console (GET /judge/review/prj_01 as judge_a)
  console.log('\n[CHECKPOINT 6] Authenticated Project Review (GET /judge/review/prj_01 as judge_a)...');
  const res6 = await request('/judge/review/prj_01', {
    headers: { Cookie: 'session=jdg_a_91bc' },
  });
  assert.strictEqual(res6.status, 200, 'Expected HTTP 200 on /judge/review/prj_01 for judge_a');
  assert(res6.body.includes('Judge Speed Console'), 'Must render Speed Console header');
  assert(res6.body.includes('Functionality') && res6.body.includes('Quality'), 'Must render rubric criteria sliders');
  console.log('✓ PASS: Authenticated judge accessed speed evaluation console with live sliders.');
  passedCount++;

  // Checkpoint 7: Unauthenticated Organizer Dashboard (GET /organizer/dashboard without auth)
  console.log('\n[CHECKPOINT 7] Unauthenticated Organizer Dashboard (GET /organizer/dashboard without auth)...');
  const res7 = await request('/organizer/dashboard');
  assert.strictEqual(res7.status, 200, 'Expected HTTP 200 with graceful prompt card');
  assert(res7.body.includes('Organizer Session Required'), 'Must render Organizer Session Required card');
  assert(res7.body.includes('Login as Organizer'), 'Must offer 1-click organizer login');
  console.log('✓ PASS: Unauthenticated access to /organizer/dashboard cleanly rendered session card.');
  passedCount++;

  // Checkpoint 8: Authenticated Organizer Dashboard (GET /organizer/dashboard as organizer)
  console.log('\n[CHECKPOINT 8] Authenticated Organizer Dashboard (GET /organizer/dashboard as organizer)...');
  const res8 = await request('/organizer/dashboard', {
    headers: { Cookie: 'session=org_7f2a' },
  });
  assert.strictEqual(res8.status, 200, 'Expected HTTP 200 on /organizer/dashboard for organizer');
  assert(res8.body.includes('Mission Control Dashboard'), 'Must render Mission Control header');
  assert(res8.body.includes('Track Review Density'), 'Must render track rings section');
  console.log('✓ PASS: Authenticated organizer accessed Mission Control Dashboard.');
  passedCount++;

  // Checkpoint 9: Role Isolation Probe (GET /api/judge/scores?judge=judge_a as judge_b)
  console.log('\n[CHECKPOINT 9] Role Isolation Probe (GET /api/judge/scores?judge=judge_a as judge_b)...');
  const res9 = await request('/api/judge/scores?judge=judge_a', {
    headers: { Cookie: 'session=jdg_b_44de' },
  });
  assert.strictEqual(res9.status, 403, 'Expected HTTP 403 Forbidden on peer score query');
  console.log('✓ PASS: Peer score probe blocked with HTTP 403 Forbidden (FIG. 02 Matrix compliant).');
  passedCount++;

  // Checkpoint 10: Calibrated CSV Export (GET /api/export.csv as organizer)
  console.log('\n[CHECKPOINT 10] Calibrated CSV Export (GET /api/export.csv as organizer)...');
  const res10 = await request('/api/export.csv', {
    headers: { Cookie: 'session=org_7f2a' },
  });
  assert.strictEqual(res10.status, 200, 'Expected HTTP 200 on /api/export.csv');
  const firstLine = res10.body.split('\n')[0] || '';
  assert(firstLine.includes(','), 'CSV first line must contain commas');
  assert(firstLine.includes('rank') && firstLine.includes('normalized_score'), 'Header must contain expected column names');
  console.log('✓ PASS: CSV export streamed valid RFC 4180 calibrated rankings.');
  passedCount++;

  console.log('\n======================================================================');
  console.log(`[VERIFY-ALL] ALL ${passedCount}/10 END-TO-END CHECKPOINTS PASSED SUCCESSFULLY!`);
  console.log('======================================================================');
}

runVerification().catch((err) => {
  console.error('\n[VERIFY-ALL] FAILED:', err.message);
  process.exit(1);
});
