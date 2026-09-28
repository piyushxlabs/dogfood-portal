━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# STEP 12.1 COMPLETION CHECKLIST
# Production Hardening & Graceful Session Access Control
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⏰ BEFORE running the next prompt — do these first:

[ ] Run the comprehensive 10-checkpoint HTTP verification script:
    ```
    node scripts/verify-all-checkpoints.mjs
    ```
    Expected: `[VERIFY-ALL] ALL 10/10 END-TO-END CHECKPOINTS PASSED SUCCESSFULLY!`

[ ] Verify the official acceptance test suite passes 100%:
    ```
    python run.py .dogfood.toml
    ```
    Expected: `claimed T1 T2, verified T1 T2` with exit code 0.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⏰ AFTER code was generated — do these now:

[ ] Open http://localhost:8080/judge in your browser without cookies:
    Expected: Clean dark-mode "Judge Session Required" card with 1-click test login buttons (`Judge A`, `Judge B`, `Organizer`). No Next.js digest error.

[ ] Open http://localhost:8080/organizer/dashboard in your browser without cookies:
    Expected: Clean dark-mode "Organizer Session Required" card with 1-click `Activate Organizer Session (org_7f2a)` button.

[ ] Test the floating Persona Switcher in the top right of the navbar:
    Expected: Click any persona (`Visitor`, `Judge A`, `Judge B`, `Organizer`) to instantly switch active session cookie and reload the page.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ WHAT GOT BUILT THIS STEP
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[ ] File: `components/AuthPromptCard.tsx` — Dark-mode session prompt card with 1-click test login buttons
[ ] File: `components/PersonaSwitcher.tsx` — Global floating navbar badge for 1-click test persona switching
[ ] File: `app/error.tsx` — Global React error boundary with dark-mode recovery UI and "Return to Gallery" action
[ ] File: `app/not-found.tsx` — Air-gapped 404 page with return-to-gallery navigation
[ ] File: `scripts/verify-all-checkpoints.mjs` — Programmatic 10-checkpoint test suite validating all user flows
[ ] Feature: Defensive numeric formatting — Fixed PostgreSQL decimal string conversion before `.toFixed(2)` in `app/judge/page.tsx`
[ ] Feature: Server Session Helper — `getServerSessionUser()` in `lib/auth.ts` for safe cookie resolution in Server Components

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🧪 TESTING & VERIFICATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Test 1 — Files Exist:
```
dir /b app\error.tsx app\not-found.tsx components\AuthPromptCard.tsx components\PersonaSwitcher.tsx scripts\verify-all-checkpoints.mjs
```
✅ Expected: All 5 files are listed.
❌ If missing: Check repository root and restore from git.

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
git commit -m "Step 12.1: Production Hardening — graceful session cards, persona switcher, error boundary, and full checkpoint suite"
```

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✋ DO NOT proceed to Step 13 until:
[ ] All tests above show ✅
[ ] Git commit is done
[ ] You have read do_after_completion.md fully
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
