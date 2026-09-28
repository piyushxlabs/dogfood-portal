━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# STEP 13 COMPLETION CHECKLIST
# Final UI/UX Polish Sprint & Production Submission
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⏰ BEFORE running the next prompt — do these first:

[ ] Verify Docker containers are healthy:
    ```
    docker compose ps
    ```
    Expected: Both `dogfood-db` and `dogfood-portal` show STATUS: Up (healthy)

[ ] Verify database migration is current:
    ```
    node scripts/migrate.mjs
    ```
    Expected: "SUCCESS: All 14 tables and 9 indexes created/verified."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⏰ AFTER code was generated — do these now:

[ ] Run official acceptance suite (MUST show all 7 PASS):
    ```
    python run.py .dogfood.toml
    ```
    Expected: "claimed T1 T2, verified T1 T2"
    If wrong: Check container logs with `docker compose logs --tail=40 web`

[ ] Run T3/T4 integration test suite:
    ```
    node scripts/test-t3-t4.mjs
    ```
    Expected: "RESULTS: 14/14 assertions passed (100%)"

[ ] Run TypeScript type-check:
    ```
    npx tsc --noEmit
    ```
    Expected: Exits with code 0 and zero TypeScript errors.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ WHAT GOT BUILT THIS STEP
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[ ] Fix: `app/api/projects/[id]/comments/route.ts` — XSS double-escape bug resolved (tag-strip, not entity-encode)
[ ] Fix: `app/layout.tsx` — Vote and API Docs nav links added with unique IDs and aria-labels
[ ] Fix: `app/projects/[id]/page.tsx` — SUMMARY and DESCRIPTION uppercase labels added
[ ] Fix: `app/projects/page.tsx` — Inner sticky header collision fixed (top-14 z-30)
[ ] Fix: `app/judge/page.tsx` — Inner sticky header collision fixed (top-14 z-30)
[ ] Fix: `app/organizer/dashboard/page.tsx` — Inner sticky header collision fixed (top-14 z-30)
[ ] Docker image rebuilt with all UI/UX fixes applied

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🧪 TESTING & VERIFICATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Test 1 — Files Exist:
```
dir app\layout.tsx app\projects\[id]\page.tsx app\api\projects\[id]\comments\route.ts
```
✅ Expected: All 3 files exist with recent timestamps.
❌ If missing: Re-run file generation.

Test 2 — TypeScript Compilation:
```
npx tsc --noEmit
```
✅ Expected: Exits code 0, zero errors.
❌ If errors: Fix typing inconsistencies.

Test 3 — Acceptance Suite:
```
python run.py .dogfood.toml
```
✅ Expected: claimed T1 T2, verified T1 T2 (7/7 PASS)
❌ If wrong: Check `docker compose logs --tail=40 web`

Test 4 — T3/T4 Functional Assertions:
```
node scripts/test-t3-t4.mjs
```
✅ Expected: 14/14 assertions PASS (100%)
❌ If wrong: Ensure portal container is running on http://localhost:8080

Test 5 — Visual Checks (navigate the portal at http://localhost:8080):

[ ] Navigate to http://localhost:8080/vote
    ✅ Expected: Community Voting page loads with "Vote" nav link highlighted in global header

[ ] Navigate to http://localhost:8080/projects/prj_01
    ✅ Expected: Project detail shows "SUMMARY" label above tagline, "DESCRIPTION" label above dark box
    ✅ Expected: No duplicate tagline text visible

[ ] Navigate to http://localhost:8080/projects (scroll down)
    ✅ Expected: Global nav stays fixed at top, projects page inner banner scrolls beneath it without collision

[ ] Post a comment with text "<script>alert('xss')</script>"
    ✅ Expected: Comment renders as empty string or plain text, NOT as &lt;script&gt; HTML entities

[ ] Open Global Nav on desktop
    ✅ Expected: Gallery, Submit, Vote, Judge Console, Mission Control, API Docs — all 6 links present

Test 6 — Security Check:
[ ] Verify .env.local is NOT committed:
    ```
    git status --short | grep env
    ```
    ✅ Expected: .env.local appears in .gitignore output, NOT in staged files.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📦 GIT COMMIT
(Run this ONLY after all above checks pass)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```
git add .
git commit -m "Step 13: Final UI/UX Polish — XSS fix, nav links, section labels, header z-index"
```

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✋ PRODUCTION READY — SUBMISSION CHECKLIST:
[ ] python run.py .dogfood.toml shows "claimed T1 T2, verified T1 T2" ✅
[ ] node scripts/test-t3-t4.mjs shows 14/14 PASS ✅
[ ] npx tsc --noEmit shows 0 errors ✅
[ ] Docker image rebuilt with all fixes ✅
[ ] Git commit done ✅
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
