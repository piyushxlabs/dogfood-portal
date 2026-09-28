━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# STEP 3 COMPLETION CHECKLIST
# Relational Schema Implementation
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⏰ BEFORE running the next prompt — do these first:

[ ] Verify existence of database client and migration script:
    ```
    ls -la lib/db.ts scripts/migrate.mjs
    ```
    Expected: Both files exist.

[ ] Verify syntax of migration script:
    ```
    node --check scripts/migrate.mjs
    ```
    Expected: No syntax errors (clean exit code 0).

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⏰ AFTER code was generated — do these now:

[ ] Run TypeScript check across project:
    ```
    npx tsc --noEmit
    ```
    Expected: 0 errors.

[ ] Run production build verification:
    ```
    npm run build
    ```
    Expected: "Compiled successfully" with 0 errors.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ WHAT GOT BUILT THIS STEP
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[ ] File: `lib/db.ts` — PostgreSQL connection client singleton using postgres.js with pooling and App Router hot-reload persistence
[ ] File: `scripts/migrate.mjs` — Automated DDL migration runner covering all 11 tables and 6 indexes idempotently
[ ] Feature: Defensive relational schema accommodating duplicate `prj_41` and nullable comments (`scores.comment TEXT NULL`)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🧪 TESTING & VERIFICATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Test 1 — Files Exist:
```
ls -la lib/db.ts scripts/migrate.mjs
```
✅ Expected: Both `lib/db.ts` and `scripts/migrate.mjs` appear.
❌ If missing: Re-generate the missing file according to Step 3 specification.

Test 2 — Syntax & Compilation:
```
node --check scripts/migrate.mjs
npx tsc --noEmit
```
✅ Expected: Clean exit 0 for both checks.
❌ If errors: Check TypeScript types in `src/types/db.ts` or syntax in `lib/db.ts`.

Test 3 — Build Verification:
```
npm run build
```
✅ Expected: Next.js standalone build passes cleanly.
❌ If errors: Fix any import path issues.

Test 4 — Migration Script Resilience:
```
node scripts/migrate.mjs
```
✅ Expected: If database is running, all 11 tables created. If offline/unstarted, cleanly reports connection target and recovery instructions without unhandled crash.

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
git commit -m "Step 3: Relational Schema Implementation — lib/db.ts and scripts/migrate.mjs"
```

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✋ DO NOT proceed to Step 4 until:
[ ] All tests above show ✅
[ ] Git commit is done
[ ] You have read do_after_completion.md fully
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
