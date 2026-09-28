━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# STEP 7 COMPLETION CHECKLIST
# Deadline-Enforced Submission Route Handler
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⏰ BEFORE running the next prompt — do these first:

[ ] Verify existence of submission route handler:
    ```
    ls -la app/projects/new/route.ts scripts/test-submission.mjs
    ```
    Expected: Both files exist.

[ ] Run submission deadline tests:
    ```
    node scripts/test-submission.mjs
    ```
    Expected: "ALL DEADLINE ENFORCEMENT TESTS PASSED CLEANLY."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⏰ AFTER code was generated — do these now:

[ ] Run TypeScript check across project:
    ```
    npx tsc --noEmit
    ```
    Expected: 0 errors.

[ ] Run Next.js production build verification:
    ```
    npm run build
    ```
    Expected: "Compiled successfully" with route `ƒ /projects/new`.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ WHAT GOT BUILT THIS STEP
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[ ] File: `app/projects/new/route.ts` — Route Handler enforcing authentication, participant role, and past deadline rejection returning HTTP 400
[ ] File: `scripts/test-submission.mjs` — Automated verification tests for submission deadline refusal
[ ] Types: `src/types/db.ts` — Updated `AuditLogPayload.blocked_status_code` to allow 400 for deadline audit logging
[ ] Feature: Hard Deadline Enforcement — satisfies run.py T1 closed event check

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🧪 TESTING & VERIFICATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Test 1 — Files Exist:
```
ls -la app/projects/new/route.ts scripts/test-submission.mjs
```
✅ Expected: Both files appear.
❌ If missing: Check app/projects/new/ directory.

Test 2 — Submission Unit Tests:
```
node scripts/test-submission.mjs
```
✅ Expected: All 4 test cases pass with exit code 0.
❌ If errors: Check deadline comparison logic.

Test 3 — TypeScript Compilation:
```
npx tsc --noEmit
```
✅ Expected: Clean exit 0 with 0 type errors.
❌ If errors: Check types in `src/types/db.ts`.

Test 4 — Next.js Standalone Build:
```
npm run build
```
✅ Expected: "Compiled successfully" with route `ƒ /projects/new`.
❌ If errors: Check Route Handler export syntax.

Test 5 — Security Check:
[ ] Verify .env is in .gitignore
    ```
    Get-Content .gitignore | Select-String "\.env"
    ```
    ✅ Expected: `.env` and `.env*.local` appear in the output.
    ❌ If missing: Add `.env` to `.gitignore` immediately.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📦 GIT COMMIT
(Run this ONLY after all above checks pass)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```
git add .
git commit -m "Step 7: Deadline-Enforced Submission Route Handler — app/projects/new/route.ts"
```

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✋ DO NOT proceed to Step 8 until:
[ ] All tests above show ✅
[ ] Git commit is done
[ ] You have read do_after_completion.md fully
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
