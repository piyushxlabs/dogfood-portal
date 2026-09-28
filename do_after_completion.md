━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# STEP 8 COMPLETION CHECKLIST
# Role-Isolated Judging Route Handler (T2.judge_scores & T2.peer_scores)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⏰ BEFORE running the next prompt — do these first:

[ ] Verify the role-isolation test script executes with zero errors:
    ```
    node scripts/test-judge-scores.mjs
    ```
    Expected: All 7 assertions PASS cleanly with HTTP 200, 401, and 403 responses.

[ ] Confirm TypeScript strict typechecking passes with zero errors:
    ```
    npx tsc --noEmit
    ```
    Expected: Exit code 0 with zero type warnings or errors.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⏰ AFTER code was generated — do these now:

[ ] Verify Next.js production build includes the dynamic `/api/judge/scores` route:
    ```
    npm run build
    ```
    Expected: Route table outputs `ƒ /api/judge/scores` (133 B) with status Compiled successfully.
    If wrong: Check `app/api/judge/scores/route.ts` for syntax or type export mismatches.

[ ] Verify Git working tree is clean and tracks all new and modified files:
    ```
    git status
    ```
    Expected: `app/api/judge/scores/route.ts` and `scripts/test-judge-scores.mjs` show as untracked/modified, along with updated tracking files.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ WHAT GOT BUILT THIS STEP
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[ ] File: `app/api/judge/scores/route.ts` — Role-isolated Route Handler implementing GET (scores retrieval) and POST (ballot submission) per FIG. 02 Matrix.
[ ] File: `lib/auth.ts` — Added `canonicalJudgeId` identifier resolution and `verifyJudgeScoreAccess` guard helper matching ARCHITECTURE.md §4.2.
[ ] File: `scripts/test-judge-scores.mjs` — Automated unit test suite verifying all 7 role isolation and peer probe access assertions.
[ ] Feature: Peer Score Probe Blocking — When a judge attempts to access another judge's ballot (`?judge=judge_a` from `judge_b`), records an audit violation and strictly returns HTTP 403 Forbidden.
[ ] Feature: Weighted Rubric Ballot Submission — `POST /api/judge/scores` validates criteria scores (functionality 0.40, quality 0.35, innovation 0.25) and upserts into `scores` table.
[ ] Config: `src/types/db.ts` — Updated `AuditLogPayload.blocked_status_code` to be optional for non-error audit entries like `JUDGE_SCORE_SUBMITTED`.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🧪 TESTING & VERIFICATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Test 1 — Files Exist:
```
dir app\api\judge\scores\route.ts scripts\test-judge-scores.mjs
```
✅ Expected: Both files exist with non-zero byte size.
❌ If missing: Re-generate `app/api/judge/scores/route.ts` or `scripts/test-judge-scores.mjs`.

Test 2 — Environment / Dependencies:
```
npm list postgres
```
✅ Expected: `postgres@3.4.5` installed and resolved.
❌ If errors: Run `npm install postgres@^3.4.5`.

Test 3 — Role Isolation Verification Suite:
```
node scripts/test-judge-scores.mjs
```
✅ Expected:
```
[TEST-JUDGE-SCORES] Running role-isolated judging route verification tests...
✓ Test 1: judge_a requesting own scores returned HTTP 200 (run.py T2.judge_sees_own_scores PASS).
✓ Test 2: judge_b probing "?judge=judge_a" returned HTTP 403 Forbidden (run.py T2.judge_cannot_see_peer_scores PASS).
✓ Test 3: judge_b probing "?judge=jdg_01" returned HTTP 403 Forbidden.
✓ Test 4: participant requesting judge scores returned HTTP 403 Forbidden (run.py T2.participant_blocked PASS).
✓ Test 5: Unauthenticated visitor returned HTTP 401 Unauthorized.
✓ Test 6: organizer inspecting "?judge=judge_a" returned HTTP 200 OK (FIG. 02 Matrix compliant).
✓ Test 7: judge_a supplying own alias "?judge=judge_a" returned HTTP 200 OK.
======================================================================
[TEST-JUDGE-SCORES] ALL 7 ROLE ISOLATION ASSERTIONS PASSED CLEANLY.
======================================================================
```
❌ If errors: Inspect `scripts/test-judge-scores.mjs` and `lib/auth.ts`.

Test 4 — Next.js Standalone Build & Route Verification:
```
npm run build
```
✅ Expected: Build succeeds and lists `ƒ /api/judge/scores`.
❌ If wrong: Review compiler errors in terminal.

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
git commit -m "Step 8: Role-Isolated Judging Route Handler — app/api/judge/scores/route.ts"
```

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✋ DO NOT proceed to Step 9 until:
[ ] All tests above show ✅
[ ] Git commit is done
[ ] You have read do_after_completion.md fully
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
