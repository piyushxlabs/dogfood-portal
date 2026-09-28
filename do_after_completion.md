━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# STEP 4 COMPLETION CHECKLIST
# Transactional Fixtures Seeder
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⏰ BEFORE running the next prompt — do these first:

[ ] Verify existence of seeder script:
    ```
    ls -la scripts/seed.mjs
    ```
    Expected: File exists.

[ ] Verify syntax of seeder script:
    ```
    node --check scripts/seed.mjs
    ```
    Expected: No syntax errors (exit code 0).

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⏰ AFTER code was generated — do these now:

[ ] Run TypeScript check across project:
    ```
    npx tsc --noEmit
    ```
    Expected: 0 errors.

[ ] Verify seeder script execution / resilience check:
    ```
    node scripts/seed.mjs
    ```
    Expected: If database is running, seeds all 41 projects, 30 judges, and 4 test sessions, printing the banner. If offline, cleanly reports connection parameters and recovery instructions without unhandled crash.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ WHAT GOT BUILT THIS STEP
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[ ] File: `scripts/seed.mjs` — Transactional fixtures ingestion script with atomic transaction (`sql.begin()`) and deterministic test session seeding
[ ] Config: `.env.local` — Updated `FIXTURES_PATH=fixtures.json` to resolve root fixture path by default
[ ] Feature: Defensive edge-case handling for duplicate `prj_41` and empty review comments (`""` -> `null`)
[ ] Feature: Deterministic test session accounts (`org_7f2a`, `jdg_a_91bc`, `jdg_b_44de`, `prt_2e88`)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🧪 TESTING & VERIFICATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Test 1 — Files Exist:
```
ls -la scripts/seed.mjs fixtures.json
```
✅ Expected: Both `scripts/seed.mjs` and `fixtures.json` appear.
❌ If missing: Check repository root or copy from docs/.

Test 2 — Syntax & Compilation:
```
node --check scripts/seed.mjs
npx tsc --noEmit
```
✅ Expected: Clean exit 0 for both checks.
❌ If errors: Fix syntax or types.

Test 3 — Seeder Resilience Check:
```
node scripts/seed.mjs
```
✅ Expected: Correctly loads `fixtures.json` and connects or reports connection diagnostic instructions.
❌ If unhandled exception: Check path resolution in `scripts/seed.mjs`.

Test 4 — Security Check:
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
git commit -m "Step 4: Transactional Fixtures Seeder — scripts/seed.mjs with deterministic test sessions"
```

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✋ DO NOT proceed to Step 5 until:
[ ] All tests above show ✅
[ ] Git commit is done
[ ] You have read do_after_completion.md fully
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
