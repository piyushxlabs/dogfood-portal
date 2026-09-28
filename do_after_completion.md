━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# STEP 5 COMPLETION CHECKLIST
# Session Authentication Helper & Middleware
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⏰ BEFORE running the next prompt — do these first:

[ ] Verify existence of auth helper and middleware:
    ```
    ls -la lib/auth.ts middleware.ts scripts/test-auth.mjs
    ```
    Expected: All three files exist.

[ ] Run auth unit tests:
    ```
    node scripts/test-auth.mjs
    ```
    Expected: "ALL 7 AUTH VERIFICATION TESTS PASSED CLEANLY."

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
    Expected: "Compiled successfully" with Middleware included.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ WHAT GOT BUILT THIS STEP
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[ ] File: `lib/auth.ts` — Authentication helper, role guard (`requireRole`), and audit logger enforcing FIG. 02 Matrix
[ ] File: `middleware.ts` — Next.js App Router middleware for path matching and header forwarding
[ ] File: `scripts/test-auth.mjs` — Automated verification tests for cookie extraction and role guard status codes
[ ] Feature: Strict backend role enforcement: 401 Unauthorized for missing auth, 403 Forbidden for role mismatch

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🧪 TESTING & VERIFICATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Test 1 — Files Exist:
```
ls -la lib/auth.ts middleware.ts scripts/test-auth.mjs
```
✅ Expected: lib/auth.ts, middleware.ts, scripts/test-auth.mjs appear.
❌ If missing: Check repository root or lib directory.

Test 2 — Auth Helper Unit Tests:
```
node scripts/test-auth.mjs
```
✅ Expected: All 7 test cases pass with exit code 0.
❌ If errors: Check cookie regex or role guard logic in `lib/auth.ts`.

Test 3 — TypeScript Compilation:
```
npx tsc --noEmit
```
✅ Expected: Clean exit 0 with 0 type errors.
❌ If errors: Check types imported from `src/types/db.ts`.

Test 4 — Next.js Standalone Build:
```
npm run build
```
✅ Expected: "Compiled successfully" with `ƒ Middleware` listed in build trace.
❌ If errors: Check Next.js middleware export format.

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
git commit -m "Step 5: Session Authentication Helper & Middleware — lib/auth.ts and middleware.ts"
```

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✋ DO NOT proceed to Step 6 until:
[ ] All tests above show ✅
[ ] Git commit is done
[ ] You have read do_after_completion.md fully
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
