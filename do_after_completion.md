━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# STEP 9 COMPLETION CHECKLIST
# Streaming CSV Export Route Handler & Statistical Normalization Engine
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⏰ BEFORE running the next prompt — do these first:

[ ] Verify the CSV export and normalization test script executes with zero errors:
    ```
    node scripts/test-csv-export.mjs
    ```
    Expected: All assertions PASS cleanly (organizer 200, participant 403, judge 403, visitor 401, header format verified, 41 projects ranked, 18 climbed / 18 dropped, delta sum = 0).

[ ] Confirm TypeScript strict typechecking passes with zero errors:
    ```
    npx tsc --noEmit
    ```
    Expected: Exit code 0 with zero type warnings or errors.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⏰ AFTER code was generated — do these now:

[ ] Verify Next.js production build includes all 5 claimed routes:
    ```
    npm run build
    ```
    Expected: Route table outputs:
      `ƒ /api/export.csv`
      `ƒ /api/judge/scores`
      `ƒ /api/projects`
      `○ /projects`
      `ƒ /projects/new`
    Status: Compiled successfully with zero type errors.

[ ] Verify Git working tree is clean and tracks all new and modified files:
    ```
    git status
    ```
    Expected: `app/api/export.csv/route.ts`, `lib/normalization.ts`, and `scripts/test-csv-export.mjs` show as tracked/staged, along with updated tracking files.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ WHAT GOT BUILT THIS STEP
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[ ] File: `app/api/export.csv/route.ts` — High-throughput streaming CSV export Route Handler using chunked Web Streams API.
[ ] File: `lib/normalization.ts` — Statistical Z-Score Normalization Engine implementing damped standardization, 1–5 scale calibration, rank movement calculations, and fixtures fallback.
[ ] File: `scripts/test-csv-export.mjs` — Automated verification test suite validating CSV streaming, RFC 4180 escaping, role isolation, and normalization math.
[ ] Feature: High-Throughput Streaming CSV — Streams results using `ReadableStream` with headers `Content-Type: text/csv; charset=utf-8` and `Content-Disposition: attachment; filename="dogfood_results_export.csv"`.
[ ] Feature: Verified Comma Header — First line output is `rank,project_id,project_title,track_name,team_name,reviews_count,raw_average_score,normalized_score,rank_delta` satisfying `run.py` assertion.
[ ] Security: Role Isolation Enforcement — Unauthenticated requests return HTTP 401 Unauthorized; participant and judge requests return HTTP 403 Forbidden per FIG. 02 Matrix.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🧪 TESTING & VERIFICATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Test 1 — Files Exist:
```
dir app\api\export.csv\route.ts lib\normalization.ts scripts\test-csv-export.mjs
```
✅ Expected: All three files exist with non-zero byte size.
❌ If missing: Re-generate the missing file immediately.

Test 2 — Dependencies Check:
```
npm list postgres
```
✅ Expected: `postgres@3.4.5` installed and resolved.
❌ If errors: Run `npm install postgres@^3.4.5`.

Test 3 — CSV Export & Normalization Verification Suite:
```
node scripts/test-csv-export.mjs
```
✅ Expected:
```
[TEST-CSV-EXPORT] Running CSV export route and math verification tests...
✓ Test 1: organizer requesting export returned HTTP 200.
✓ Test 2: participant blocked with HTTP 403 Forbidden.
✓ Test 3: judge blocked with HTTP 403 Forbidden (FIG. 02 Matrix compliant).
✓ Test 4: unauthenticated visitor returned HTTP 401 Unauthorized.
✓ Test 5: CSV header format verified: 9 columns, contains comma (run.py T2.csv_export PASS).
✓ Test 6: All 41 projects successfully ranked in leaderboard.
✓ Test 7a: Rank movement symmetry verified: 18 climbed, 18 dropped, delta sum = 0.
✓ Test 7b: Significant rank shifts verified: prj_04 (+1), prj_17 (+1), prj_38 (-6), prj_02 (-6).
======================================================================
[TEST-CSV-EXPORT] ALL CSV STREAMING & NORMALIZATION TESTS PASSED.
======================================================================
```
❌ If errors: Inspect `scripts/test-csv-export.mjs` and `lib/normalization.ts`.

Test 4 — Next.js Standalone Build & Route Verification:
```
npm run build
```
✅ Expected: Build succeeds and lists `ƒ /api/export.csv`.
❌ If wrong: Review compiler output in terminal.

Test 5 — Security Check:
[ ] Verify .env.local is in .gitignore:
    ```
    git check-ignore .env.local
    ```
    ✅ Expected: `.env.local` appears in the output.
    ❌ If missing: Add `.env.local` to `.gitignore` immediately.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📦 GIT COMMIT
(Run this ONLY after all above checks pass)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```
git add .
git commit -m "Step 9: Streaming CSV Export Route Handler — app/api/export.csv/route.ts"
```

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✋ DO NOT proceed to Step 10A until:
[ ] All tests above show ✅
[ ] Git commit is done
[ ] You have read do_after_completion.md fully
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
