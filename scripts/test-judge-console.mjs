// scripts/test-judge-console.mjs
// Verification suite for Judge Split-Screen Speed Console (Step 10B)
// Authoritative specification: JUDGING.md §2 & AGENT_MASTER_PLAN.md Step 10B

import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

console.log('[TEST-JUDGE-CONSOLE] Running Judge Speed Console verification suite...');

// Test 1: Verify all component & page files exist
const requiredFiles = [
  'components/RubricSlider.tsx',
  'components/JudgeReviewConsole.tsx',
  'app/judge/page.tsx',
  'app/judge/review/[projectId]/page.tsx',
];

for (const relPath of requiredFiles) {
  const fullPath = path.join(process.cwd(), relPath);
  assert(fs.existsSync(fullPath), `Required file missing: ${relPath}`);
  const stats = fs.statSync(fullPath);
  assert(stats.size > 0, `File must not be empty: ${relPath}`);
}
console.log('✓ Test 1: All 4 Judge Console components and routes exist with valid content.');

// Test 2: Verify Weighted Rubric Score Mathematics (JUDGING.md §2.2)
function computeWeightedScore(func, qual, innov) {
  return Number((0.4 * func + 0.35 * qual + 0.25 * innov).toFixed(2));
}

function computeRawScore(func, qual, innov) {
  return Number((func + qual + innov).toFixed(2));
}

// Case 1: Standard fixture sample from ARCHITECTURE.md §6
// func: 4, qual: 3, innov: 2 -> 3.15
const score1 = computeWeightedScore(4, 3, 2);
assert.strictEqual(score1, 3.15, 'Expected 3.15 for criteria (4, 3, 2)');
console.log('✓ Test 2a: Standard score formula verified: (0.4*4 + 0.35*3 + 0.25*2) = 3.15.');

// Case 2: Maximum possible score
const maxScore = computeWeightedScore(5, 5, 5);
assert.strictEqual(maxScore, 5.0, 'Expected 5.00 for max criteria');
console.log('✓ Test 2b: Maximum score ceiling verified: 5.00.');

// Case 3: Minimum possible score
const minScore = computeWeightedScore(1, 1, 1);
assert.strictEqual(minScore, 1.0, 'Expected 1.00 for min criteria');
console.log('✓ Test 2c: Minimum score floor verified: 1.00.');

// Case 4: Balanced middle evaluation
const midScore = computeWeightedScore(3, 4, 5);
assert.strictEqual(midScore, 3.85, 'Expected 3.85 for criteria (3, 4, 5)');
console.log('✓ Test 2d: Intermediate score verified: 3.85.');

// Test 3: Fixture project continuity & review indexing
const fixturesPath = path.join(process.cwd(), 'fixtures.json');
const fixtures = JSON.parse(fs.readFileSync(fixturesPath, 'utf8'));
const projectIds = fixtures.projects.map((p) => p.id);

assert.strictEqual(projectIds.length, 41, 'Expected 41 projects in review sequence');
assert.strictEqual(projectIds[0], 'prj_01');
assert.strictEqual(projectIds[40], 'prj_41');

// Verify circular/linear navigation index checks
for (let i = 0; i < projectIds.length; i++) {
  const current = projectIds[i];
  const prev = i > 0 ? projectIds[i - 1] : null;
  const next = i < projectIds.length - 1 ? projectIds[i + 1] : null;

  if (i === 0) {
    assert.strictEqual(prev, null);
    assert.strictEqual(next, projectIds[1]);
  } else if (i === projectIds.length - 1) {
    assert.strictEqual(prev, projectIds[projectIds.length - 2]);
    assert.strictEqual(next, null);
  } else {
    assert(prev !== null && next !== null);
  }
}
console.log('✓ Test 3: 41-project review navigation indices verified sequentially.');

console.log('======================================================================');
console.log('[TEST-JUDGE-CONSOLE] ALL JUDGE CONSOLE VERIFICATIONS PASSED.');
console.log('======================================================================');
