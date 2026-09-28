// scripts/test-pairwise.mjs
// Verification suite for Bradley-Terry Pairwise Comparison Engine
// Authoritative specification: JUDGING.md §5 (Bonus +5)

import assert from 'node:assert/strict';
import { computeBradleyTerry } from '../lib/pairwise.ts';

console.log('======================================================================');
console.log('[TEST] STARTING BRADLEY-TERRY PAIRWISE ESTIMATOR VERIFICATION');
console.log('======================================================================');

// Test 1: Basic Head-to-Head Convergence & Ranking Monotonicity
console.log('\n[TEST 1] Verifying 3-project tournament convergence & monotonicity:');
const projects = ['prj_alpha', 'prj_beta', 'prj_gamma'];
const comparisons = [
  { winner_id: 'prj_alpha', loser_id: 'prj_beta' },
  { winner_id: 'prj_alpha', loser_id: 'prj_beta' },
  { winner_id: 'prj_alpha', loser_id: 'prj_gamma' },
  { winner_id: 'prj_alpha', loser_id: 'prj_gamma' },
  { winner_id: 'prj_beta', loser_id: 'prj_gamma' },
  { winner_id: 'prj_beta', loser_id: 'prj_gamma' },
];

const result = computeBradleyTerry(projects, comparisons);
console.log(`  Iterations to converge: ${result.iterations} (converged: ${result.converged})`);
assert.equal(result.converged, true, 'Bradley-Terry MM update must converge');

const rankMap = new Map(result.items.map((i) => [i.project_id, i.rank]));
console.log('  Rankings:', result.items.map((i) => `${i.project_id}: rank ${i.rank} (pi: ${i.pi})`).join(', '));

assert.equal(rankMap.get('prj_alpha'), 1, 'prj_alpha (undefeated) must rank #1');
assert.equal(rankMap.get('prj_beta'), 2, 'prj_beta must rank #2');
assert.equal(rankMap.get('prj_gamma'), 3, 'prj_gamma must rank #3');
console.log('  ✓ PASSED: Convergence and monotonic rank ordering confirmed.');

// Test 2: Probability Symmetry: P(A > B) + P(B > A) == 1.0000
console.log('\n[TEST 2] Verifying Bradley-Terry probability symmetry:');
const pAlphaBeta = result.predictProbability('prj_alpha', 'prj_beta');
const pBetaAlpha = result.predictProbability('prj_beta', 'prj_alpha');
console.log(`  P(Alpha > Beta) = ${pAlphaBeta}`);
console.log(`  P(Beta > Alpha) = ${pBetaAlpha}`);
console.log(`  Sum: ${(pAlphaBeta + pBetaAlpha).toFixed(4)}`);

assert.ok(Math.abs(pAlphaBeta + pBetaAlpha - 1.0) < 0.001, 'Win probabilities must sum to 1.0');
assert.ok(pAlphaBeta > 0.5, 'Alpha must have >50% win probability against Beta');
console.log('  ✓ PASSED: Probability symmetry P(i > j) + P(j > i) = 1.0 verified.');

// Test 3: Transitivity: If A > B and B > C, then P(A > C) > P(A > B)
console.log('\n[TEST 3] Verifying stochastic transitivity:');
const pAlphaGamma = result.predictProbability('prj_alpha', 'prj_gamma');
console.log(`  P(Alpha > Gamma) = ${pAlphaGamma}`);
assert.ok(pAlphaGamma > pAlphaBeta, 'P(Alpha > Gamma) must exceed P(Alpha > Beta)');
console.log('  ✓ PASSED: Stochastic transitivity verified.');

// Test 4: Equal Record Uniform Distribution
console.log('\n[TEST 4] Verifying symmetric round-robin uniform distribution:');
const uniformProjects = ['prj_x', 'prj_y', 'prj_z'];
const roundRobin = [
  { winner_id: 'prj_x', loser_id: 'prj_y' },
  { winner_id: 'prj_y', loser_id: 'prj_z' },
  { winner_id: 'prj_z', loser_id: 'prj_x' },
];
const uniformResult = computeBradleyTerry(uniformProjects, roundRobin);
console.log('  Uniform Pi scores:', uniformResult.items.map((i) => `${i.project_id}: ${i.pi}`).join(', '));
const pi0 = uniformResult.items[0].pi;
const pi1 = uniformResult.items[1].pi;
const pi2 = uniformResult.items[2].pi;
assert.ok(Math.abs(pi0 - pi1) < 0.001 && Math.abs(pi1 - pi2) < 0.001, 'Symmetric cycle must yield equal pi');
console.log('  ✓ PASSED: Symmetric cycle yields equal latent skill parameters.');

console.log('\n======================================================================');
console.log('[TEST] SUCCESS: All 4 Bradley-Terry unit tests passed (100%).');
console.log('======================================================================\n');
