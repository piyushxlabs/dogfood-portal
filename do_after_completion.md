━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# STEP 12.2 COMPLETION CHECKLIST
# Audit Remediation Blueprint (Phases A through E)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⏰ BEFORE running the next prompt — do these first:

[ ] Run the official acceptance test suite:
    ```
    python run.py .dogfood.toml
    ```
    Expected: `claimed T1 T2, verified T1 T2` with exit code 0.

[ ] Run the comprehensive 10-checkpoint HTTP verification script:
    ```
    node scripts/verify-all-checkpoints.mjs
    ```
    Expected: `[VERIFY-ALL] ALL 10/10 END-TO-END CHECKPOINTS PASSED SUCCESSFULLY!`

[ ] Run the statistical normalization invariant test:
    ```
    node scripts/test-normalization.mjs
    ```
    Expected: `[TEST-NORMALIZATION] ALL 5 STATISTICAL & MATHEMATICAL TESTS PASSED.`

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⏰ AFTER code was generated — do these now:

[ ] Open http://localhost:8080/projects/new in your browser:
    Expected: Rich dark-mode submission UI with "Submissions Closed for This Event" banner, read-only form, and a red "Test Late Submission (Triggers 400)" button. Clicking the button pops up the red toast "HTTP 400 Bad Request".

[ ] Open http://localhost:8080/organizer/dashboard as Organizer:
    Expected: Click "Just now" refresh button on Calibrated Final Standings to test live auto-refresh against `/api/organizer/leaderboard`. Observe clean reload without page jumps.

[ ] Check top navigation bar:
    Expected: Sticky header with links (`Gallery`, `Submit`, `Judge Console`, `Mission Control`) and docked `Persona Switcher` on the far right with clean flex spacing and zero visual collisions.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ WHAT GOT BUILT THIS STEP
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[ ] Phase A: Scoped ballot retrieval in `app/judge/review/[projectId]/page.tsx` dynamically to active judge session (`currentJudgeId`).
[ ] Phase B: Deleted `FIXTURE_BENCHMARKS` from `lib/normalization.ts`. Enforced 100% pure mathematical calculation and dynamic variance reduction without static fallbacks. Defensively cast PostgreSQL numeric values.
[ ] Phase C: Implemented real role-isolated organizer APIs (`app/api/organizer/leaderboard/route.ts`, `app/api/organizer/judge-status/route.ts`, `app/api/organizer/calibration-summary/route.ts`). Connected `components/NormalizedLeaderboard.tsx` auto-refresh to live API.
[ ] Phase D: Implemented interactive read-only submission UI on `GET /projects/new` (with "Deadline Closed" alert banner and late test button) while preserving `POST /projects/new` for `run.py`. Added `app/global-error.tsx`. Integrated `PersonaSwitcher` into sticky navigation header in `app/layout.tsx`.
[ ] Phase E: Replaced synchronous `fs.readFileSync` with `await fs.promises.readFile` across `app/projects/page.tsx` and `app/api/projects/route.ts`. Added formula injection sanitization in `app/api/export.csv/route.ts` prepending `'` to text fields starting with `=`, `+`, `-`, or `@`.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🧪 TESTING & VERIFICATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Test 1 — Files Exist:
```
dir /b app\global-error.tsx app\api\organizer\leaderboard\route.ts app\api\organizer\judge-status\route.ts app\api\organizer\calibration-summary\route.ts
```
✅ Expected: All 4 files are listed.
❌ If missing: Restore or re-create missing routes.

Test 2 — Full Checkpoint Verification:
```
node scripts/verify-all-checkpoints.mjs
```
✅ Expected: 10/10 checkpoints PASS.
❌ If errors: Verify container is listening on port 8080 via `docker compose ps`.

Test 3 — Official Acceptance Checker:
```
python run.py .dogfood.toml
```
✅ Expected: `claimed T1 T2, verified T1 T2`
❌ If errors: Check `.dogfood.toml` routes and database seeding.

Test 4 — Next.js Local Build Check:
```
npm run build
```
✅ Expected: Compiled successfully with zero TypeScript or lint errors.

Test 5 — Security Check:
[ ] Verify .env is in .gitignore:
    ```
    type .gitignore | findstr .env
    ```
    ✅ Expected: `.env` appears in the output.
    ❌ If missing: Add `.env` to .gitignore immediately.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📦 GIT COMMIT
(Run this ONLY after all above checks pass)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```
git add .
git commit -m "Step 12.2: Audit Remediation — dynamic math, scoped ballots, organizer APIs, and formula sanitization"
```

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✋ DO NOT proceed to Step 13 until:
[ ] All tests above show ✅
[ ] Git commit is done
[ ] You have read do_after_completion.md fully
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
