━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# STEP 12.3 COMPLETION CHECKLIST
# Enterprise Scale (T3 Community + T4 Extensions + Spec Bonuses)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⏰ BEFORE running the next prompt — do these first:

[ ] Verify database tables and schema migrations in PostgreSQL:
    ```
    node scripts/migrate.mjs
    ```
    Expected: "SUCCESS: All 14 tables and 9 indexes created/verified."

[ ] Verify full test suite for Tier 3 and Tier 4:
    ```
    node scripts/test-t3-t4.mjs
    ```
    Expected: "RESULTS: 14/14 assertions passed (100%)"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⏰ AFTER code was generated — do these now:

[ ] Run official acceptance suite against local portal container:
    ```
    python run.py .dogfood.toml
    ```
    Expected: "claimed T1 T2, verified T1 T2" (All 7 PASS)
    If wrong: Check container logs with `docker compose logs --tail=40 web`

[ ] Run Bradley-Terry pairwise model unit test:
    ```
    npx tsx scripts/test-pairwise.mjs
    ```
    Expected: "SUCCESS: All 4 Bradley-Terry unit tests passed (100%)."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ WHAT GOT BUILT THIS STEP
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[ ] Table: `community_votes` — Unique `(voter_email, project_id)` constraint, IP tracking, 409 Conflict deduplication
[ ] Table: `project_comments` — Relational discussion comments linked to projects
[ ] Table: `webhooks` — Event-driven webhook registry with 256-bit secret tokens
[ ] Route: `POST /api/vote` — RFC 5322 email syntax validation, duplicate vote refusal with HTTP 409
[ ] Route: `GET /api/vote/results` — Anti-Bandwagon protection masking tallies for visitors and revealing for organizers
[ ] Page: `app/vote/page.tsx` — Community voting gallery with client-side Fisher-Yates shuffle & voting modal
[ ] Route: `GET / POST /api/projects/[id]/comments` — Comments API with HTML entity XSS sanitization
[ ] Page: `app/projects/[id]/page.tsx` — Project details view with live comments and certificate link
[ ] Page: `app/projects/[id]/certificate/page.tsx` — Cryptographic printable certificate with SHA-256 tamper seal
[ ] Document: `docs/openapi.json` — OpenAPI 3.0.3 specification covering all platform endpoints
[ ] Page: `app/api-docs/page.tsx` — Interactive air-gapped OpenAPI 3.0 documentation explorer
[ ] Endpoints: `app/api/v1/projects`, `tracks`, `leaderboard`, `export/bulk` — Tier 4 REST APIs
[ ] Utility: `lib/webhooks.ts` & `app/api/webhooks/route.ts` — HMAC-SHA256 signed event webhook dispatcher
[ ] Widget: `app/embed/gallery/page.tsx` — Responsive embeddable iframe widget for sponsor portals
[ ] Spec Bonus (+3): `docs/THREAT-MODEL.md` — Detailed threat model document
[ ] Spec Bonus (+5): `lib/pairwise.ts` — Bradley-Terry MM pairwise judging engine

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🧪 TESTING & VERIFICATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Test 1 — Files Exist:
```
ls docs/openapi.json docs/THREAT-MODEL.md lib/pairwise.ts lib/webhooks.ts
```
✅ Expected: All 4 files exist and are populated.
❌ If missing: Re-run file generation tool.

Test 2 — Environment & Type Safety:
```
npx tsc --noEmit
```
✅ Expected: Exits with code 0 and zero TypeScript errors.
❌ If errors: Fix typing inconsistencies in Route Handlers.

Test 3 — Standalone Production Build:
```
npm run build
```
✅ Expected: Next.js builds standalone bundle with code 0.
❌ If errors: Check Next.js dynamic routing parameters or component imports.

Test 4 — Functional T3 & T4 Verification:
```
node scripts/test-t3-t4.mjs
```
✅ Expected: 14/14 assertions PASS (voting deduplication 409, anti-bandwagon masking, bulk export, etc.).
❌ If wrong: Ensure portal container is running on http://localhost:8080.

Test 5 — Acceptance Suite Verification:
```
python run.py .dogfood.toml
```
✅ Expected: claimed T1 T2, verified T1 T2 (7/7 PASS).
❌ If wrong: Check .dogfood.toml routes and session headers.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📦 GIT COMMIT
(Run this ONLY after all above checks pass)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```
git add .
git commit -m "Step 12.3: Enterprise Scale — T3 Community, T4 Extensions & Spec Bonuses"
```

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✋ DO NOT proceed to Step 13 until:
[ ] All tests above show ✅
[ ] Git commit is done
[ ] You have read do_after_completion.md fully
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
