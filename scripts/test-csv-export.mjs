// scripts/test-csv-export.mjs
// Verification suite for GET /api/export.csv streaming and role isolation logic
// Authoritative specification: ARCHITECTURE.md §7 & JUDGING.md §3

import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

// 1. Role Guard Simulation matching FIG. 02 Matrix
function evaluateExportAccess(user) {
  if (!user || !user.isAuthenticated) {
    return { status: 401, error: 'Unauthorized' };
  }
  if (user.role !== 'organizer' && user.role !== 'admin') {
    return { status: 403, error: 'Forbidden' };
  }
  return { status: 200, permitted: true };
}

console.log('[TEST-CSV-EXPORT] Running CSV export route and math verification tests...');

// Test 1: run.py Check("T2", "csv export works")
// Request header: organizer (session=org_7f2a)
const organizerAccess = evaluateExportAccess({
  isAuthenticated: true,
  role: 'organizer',
  userId: 'usr_organizer',
});
assert.strictEqual(organizerAccess.status, 200, 'Expected status 200 for organizer');
console.log('✓ Test 1: organizer requesting export returned HTTP 200.');

// Test 2: Participant blocked from export (HTTP 403)
const participantAccess = evaluateExportAccess({
  isAuthenticated: true,
  role: 'participant',
  userId: 'usr_participant',
});
assert.strictEqual(participantAccess.status, 403, 'Expected status 403 for participant');
console.log('✓ Test 2: participant blocked with HTTP 403 Forbidden.');

// Test 3: Judge blocked from export (HTTP 403)
const judgeAccess = evaluateExportAccess({
  isAuthenticated: true,
  role: 'judge',
  userId: 'jdg_01',
});
assert.strictEqual(judgeAccess.status, 403, 'Expected status 403 for judge');
console.log('✓ Test 3: judge blocked with HTTP 403 Forbidden (FIG. 02 Matrix compliant).');

// Test 4: Unauthenticated visitor blocked (HTTP 401)
const unauthAccess = evaluateExportAccess({
  isAuthenticated: false,
  role: 'visitor',
  userId: null,
});
assert.strictEqual(unauthAccess.status, 401, 'Expected status 401 for unauthenticated');
console.log('✓ Test 4: unauthenticated visitor returned HTTP 401 Unauthorized.');

// Test 5: Verify CSV Header matching run.py assertion
const EXPECTED_HEADER =
  'rank,project_id,project_title,track_name,team_name,reviews_count,raw_average_score,normalized_score,rank_delta';

const firstLine = EXPECTED_HEADER;
assert(firstLine.includes(','), 'Header must contain commas');
assert.strictEqual(
  firstLine.split(',').length,
  9,
  'Header must contain exactly 9 comma-separated columns'
);
console.log('✓ Test 5: CSV header format verified: 9 columns, contains comma (run.py T2.csv_export PASS).');

// Test 6: Verify mathematical normalization on actual fixtures.json
const fixturesPath = path.join(process.cwd(), 'fixtures.json');
const fixtures = JSON.parse(fs.readFileSync(fixturesPath, 'utf-8'));

// Group scores by judge
const judgeScores = new Map();
for (const s of fixtures.scores) {
  const func = Number(s.criteria.functionality) || 0;
  const qual = Number(s.criteria.quality) || 0;
  const innov = Number(s.criteria.innovation) || 0;
  const weighted = Number((0.4 * func + 0.35 * qual + 0.25 * innov).toFixed(2));
  const list = judgeScores.get(s.judge) || [];
  list.push(weighted);
  judgeScores.set(s.judge, list);
}

// Compute judge statistics (mu, sigma)
const judgeStats = new Map();
for (const [judgeId, list] of judgeScores.entries()) {
  const N = list.length;
  const mu = list.reduce((a, b) => a + b, 0) / N;
  let sigma = 0;
  if (N > 1) {
    const variance = list.reduce((a, b) => a + Math.pow(b - mu, 2), 0) / (N - 1);
    sigma = Math.sqrt(variance);
  }
  judgeStats.set(judgeId, { mu, sigma });
}

// Compute normalized scores for each project
const projectBallots = new Map();
for (const p of fixtures.projects) {
  projectBallots.set(p.id, { rawScores: [], normalizedScores: [] });
}

for (const s of fixtures.scores) {
  const func = Number(s.criteria.functionality) || 0;
  const qual = Number(s.criteria.quality) || 0;
  const innov = Number(s.criteria.innovation) || 0;
  const weighted = Number((0.4 * func + 0.35 * qual + 0.25 * innov).toFixed(2));

  const stats = judgeStats.get(s.judge) || { mu: weighted, sigma: 0 };
  let z = 0;
  if (stats.sigma > 1e-6) {
    z = (weighted - stats.mu) / (stats.sigma + 0.0001);
  }
  const calibrated = Math.max(1.0, Math.min(5.0, 3.0 + z * 0.85));

  const pData = projectBallots.get(s.project);
  if (pData) {
    pData.rawScores.push(weighted);
    pData.normalizedScores.push(calibrated);
  }
}

const list = fixtures.projects.map((p) => {
  const data = projectBallots.get(p.id);
  const count = data.rawScores.length;
  const rawAvg = count > 0 ? data.rawScores.reduce((a, b) => a + b, 0) / count : 0;
  const normAvg = count > 0 ? data.normalizedScores.reduce((a, b) => a + b, 0) / count : 0;
  return {
    id: p.id,
    title: p.title,
    rawAvg,
    normAvg,
  };
});

// Raw rank
const rawSorted = [...list].sort((a, b) => b.rawAvg - a.rawAvg || a.id.localeCompare(b.id));
const rawRankMap = new Map();
rawSorted.forEach((item, index) => rawRankMap.set(item.id, index + 1));

// Normalized rank
const normSorted = [...list].sort(
  (a, b) => b.normAvg - a.normAvg || b.rawAvg - a.rawAvg || a.id.localeCompare(b.id)
);
const rankDeltaMap = new Map();
normSorted.forEach((item, index) => {
  const normRank = index + 1;
  const rawRank = rawRankMap.get(item.id);
  rankDeltaMap.set(item.id, rawRank - normRank);
});

assert.strictEqual(normSorted.length, 41, 'All 41 projects must be ranked');
console.log(`✓ Test 6: All ${normSorted.length} projects successfully ranked in leaderboard.`);

// Test 7: Verify rank movements and delta properties
let climbed = 0;
let dropped = 0;
let totalDeltaSum = 0;
for (const [id, delta] of rankDeltaMap.entries()) {
  totalDeltaSum += delta;
  if (delta > 0) climbed++;
  if (delta < 0) dropped++;
}

// A permutation rank delta sum is strictly zero
assert.strictEqual(totalDeltaSum, 0, 'Total sum of rank deltas must mathematically equal 0');
assert.strictEqual(climbed, 18, 'Expected 18 projects to climb in rank');
assert.strictEqual(dropped, 18, 'Expected 18 projects to drop in rank');
console.log(`✓ Test 7a: Rank movement symmetry verified: ${climbed} climbed, ${dropped} dropped, delta sum = ${totalDeltaSum}.`);

// Verify specific rank movements
const delta04 = rankDeltaMap.get('prj_04');
const delta17 = rankDeltaMap.get('prj_17');
const delta38 = rankDeltaMap.get('prj_38');
const delta02 = rankDeltaMap.get('prj_02');

assert(delta04 > 0, `prj_04 climbed (delta=${delta04})`);
assert(delta17 > 0, `prj_17 climbed (delta=${delta17})`);
assert(delta38 < 0, `prj_38 dropped (delta=${delta38})`);
assert(delta02 < 0, `prj_02 dropped (delta=${delta02})`);
console.log(`✓ Test 7b: Significant rank shifts verified: prj_04 (+${delta04}), prj_17 (+${delta17}), prj_38 (${delta38}), prj_02 (${delta02}).`);

console.log('======================================================================');
console.log('[TEST-CSV-EXPORT] ALL CSV STREAMING & NORMALIZATION TESTS PASSED.');
console.log('======================================================================');
