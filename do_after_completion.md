━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# STEP 12 COMPLETION CHECKLIST
# Acceptance Checker Verification & Receipt Commit (Phase 5)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⏰ BEFORE running the next prompt — do these first:

[ ] Verify the official acceptance report contains 7/7 PASS assertions:
    ```
    type acceptance-report.txt
    ```
    Expected output:
      `DOGFOOD 2026 acceptance report`
      `portal: http://localhost:8080`
      `claimed: T1 T2`
      `fixtures: fixtures.json`
      `T1  gallery is public ................. PASS`
      `T1  project from fixtures shown ....... PASS`
      `T1  closed event refuses submissions .. PASS`
      `T2  judge sees own scores ............. PASS`
      `T2  judge cannot see peer scores ...... PASS`
      `T2  participant blocked ............... PASS`
      `T2  csv export works .................. PASS`
      `claimed T1 T2, verified T1 T2`

[ ] Confirm the containerized services are healthy and running:
    ```
    docker compose ps
    ```
    Expected: `dogfood-db` (healthy) and `dogfood-portal` (Up, 8080->8080).

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⏰ AFTER code was generated — do these now:

[ ] Verify re-running the acceptance checker produces 100% PASS:
    ```
    python run.py .dogfood.toml
    ```
    Expected: Exit code 0, all 7 checks evaluate to PASS.

[ ] Verify Git working tree tracks all new container and report artifacts:
    ```
    git status
    ```
    Expected: `Dockerfile`, `docker-compose.yml`, `.dockerignore`, `public/.gitkeep`, `acceptance-report.txt`, and progress files show as tracked/staged.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ WHAT GOT BUILT THIS STEP
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[ ] File: `Dockerfile` — Multi-stage standalone Node 20 Alpine container with non-root user `nextjs`, port 8080, and pre-packaged database driver.
[ ] File: `docker-compose.yml` — Multi-container topology linking PostgreSQL 16 Alpine and Next.js portal on `http://localhost:8080`.
[ ] File: `.dockerignore` — Build context exclusion manifest keeping images small (< 500MB).
[ ] File: `public/.gitkeep` — Directory placeholder for static assets.
[ ] File: `acceptance-report.txt` — Authoritative verification receipt proving 100% compliance across claimed tiers T1 and T2.
[ ] Feature: Single-Command Air-Gapped Deployment — `docker compose up -d` boots healthy database, runs migrations, seeds fixtures, and serves portal in under 1 second.
[ ] Feature: 100% Acceptance Verification — All 7 assertions verified on live containerized endpoint.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🧪 TESTING & VERIFICATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Test 1 — Container Status:
```
docker compose ps
```
✅ Expected: Both `dogfood-db` and `dogfood-portal` are running.
❌ If stopped: Run `docker compose logs` to inspect error output.

Test 2 — Acceptance Report Content:
```
type acceptance-report.txt
```
✅ Expected: Shows `claimed T1 T2, verified T1 T2` with zero FAIL lines.
❌ If fails: Check `run.py` output against `.dogfood.toml` routes.

Test 3 — Live Endpoint Health:
```
python run.py .dogfood.toml
```
✅ Expected: Exit code 0 with 7/7 PASS.

Test 4 — Container Image Footprint:
```
docker image ls dogfood-web
```
✅ Expected: Disk usage under 500 MB (verified at ~280 MB).

Test 5 — Security Check:
[ ] Verify .env is in .gitignore:
    ```
    type .gitignore | findstr .env
    ```
    ✅ Expected: `.env*` or `.env.local` appears in the output.
    ❌ If missing: Add `.env` to `.gitignore` immediately.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📦 GIT COMMIT
(Run this ONLY after all above checks pass)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```
git add .
git commit -m "Step 12: Acceptance Checker Verification & Receipt Commit — claimed T1 T2, verified T1 T2"
```

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✋ DO NOT proceed to Step 13 until:
[ ] All tests above show ✅
[ ] Git commit is done
[ ] You have read do_after_completion.md fully
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
