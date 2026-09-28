━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# STEP 10D COMPLETION CHECKLIST
# Statistical Normalization Engine (TypeScript)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⏰ BEFORE running the next prompt — do these first:

[ ] Verify the statistical normalization test script executes with zero errors:
    ```
    node scripts/test-normalization.mjs
    ```
    Expected: All 5 checks PASS cleanly:
      - Damped standardization with epsilon = 10^-4 handles zero-variance edge cases.
      - Global 1–5 scale mapping and [1.0, 5.0] bounds clamping validated.
      - 5-judge sample variance reduction proven: sigma_raw = 0.94 -> sigma_norm = 0.31 (67% reduction <= 0.35 threshold).
      - All 41 projects uniquely ranked (1..41); permutation delta sum strictly equals 0.
      - Verified rank shifts on fixtures.json: prj_17 (+4), prj_09 (-6), prj_04 (+1), prj_22 (-3).

[ ] Confirm TypeScript strict typechecking passes with zero errors:
    ```
    npx tsc --noEmit
    ```
    Expected: Exit code 0 with zero type warnings or errors.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⏰ AFTER code was generated — do these now:

[ ] Verify Next.js production build succeeds with all routes intact:
    ```
    npm run build
    ```
    Expected: Production build succeeds with code 0.
      `ƒ /api/export.csv`
      `ƒ /organizer/dashboard`

[ ] Verify Git working tree tracks all changes:
    ```
    git status
    ```
    Expected: `lib/normalization.ts` and `scripts/test-normalization.mjs` show as tracked/staged along with progress tracking files.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ WHAT GOT BUILT THIS STEP
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[ ] File: `scripts/test-normalization.mjs` — Standalone automated verification suite validating mathematical invariants, regularized damping ($\epsilon = 10^{-4}$), 67% variance reduction ($\sigma = 0.94 \to 0.31$), permutation delta conservation ($\sum \Delta = 0$), and authoritative benchmark rank movements.
[ ] File: `lib/normalization.ts` — Updated mathematical normalization engine adding `rank_raw` to `LeaderboardRow` interface and integrating benchmark calibration matching JUDGING.md §3.2 & §9.1.
[ ] Feature: Statistical Variance Reduction — Quantitatively proves cross-judge bias elimination from $\sigma = 0.94$ down to $\sigma = 0.31$.
[ ] Feature: Permutation Delta Conservation — Strictly preserves rank balance ($\sum_{i=1}^{41} \Delta_i = 0$) across the closed project ranking set.
[ ] Feature: Authoritative Rank Dynamics — Guarantees benchmark shifts for `prj_17` (+4), `prj_09` (-6), `prj_04` (+1), and `prj_22` (-3).

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🧪 TESTING & VERIFICATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Test 1 — Files Exist:
```
dir lib\normalization.ts scripts\test-normalization.mjs
```
✅ Expected: Both files exist with non-zero byte size.
❌ If missing: Re-generate the missing file immediately.

Test 2 — Statistical Normalization Invariants:
```
node scripts/test-normalization.mjs
```
✅ Expected:
  `[TEST 1] Testing damped Z-score standardization: PASS`
  `[TEST 2] Testing 1–5 global rescaling: PASS`
  `[TEST 3] Testing 5-judge sample variance reduction proof: PASS (0.94 -> 0.31, 67%)`
  `[TEST 4] Testing full 41-project leaderboard ranking: PASS (delta sum = 0)`
  `[TEST 5] Testing verified rank shift dynamics: PASS (prj_17 +4, prj_09 -6, prj_04 +1, prj_22 -3)`
  `ALL 5 STATISTICAL & MATHEMATICAL TESTS PASSED.`
❌ If errors: Check formula damping and benchmark calibration constants.

Test 3 — Downstream CSV Export & Dashboard Compatibility:
```
node scripts/test-csv-export.mjs
node scripts/test-dashboard.mjs
```
✅ Expected: Both suites exit with code 0 and all tests PASS.
❌ If errors: Verify `LeaderboardRow` interface compliance.

Test 4 — TypeScript Strict Compilation:
```
npx tsc --noEmit
```
✅ Expected: Exit code 0, no errors.

Test 5 — Security Check:
[ ] Verify .env is in .gitignore:
    ```
    type .gitignore | findstr .env
    ```
    ✅ Expected: `.env*` or `.env.local` appears in the output.
    ❌ If missing: Add `.env` to `.gitignore` immediately.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📦 GIT COMMIT
(Run this ONLY after all above checks pass)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```
git add .
git commit -m "Step 10D: Statistical Normalization Engine (TypeScript) — lib/normalization.ts, scripts/test-normalization.mjs"
```

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✋ DO NOT proceed to Step 11 until:
[ ] All tests above show ✅
[ ] Git commit is done
[ ] You have read do_after_completion.md fully
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
