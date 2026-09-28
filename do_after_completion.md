━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# STEP 2 COMPLETION CHECKLIST
# Acceptance Configuration Baseline
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⏰ BEFORE running the next prompt — do these first:

[ ] Verify .dogfood.toml content at repository root:
    ```
    cat .dogfood.toml
    ```
    Expected: claimed = ["T1", "T2"] and all 5 routes defined.

[ ] Confirm fixtures.json and run.py are present at repository root:
    ```
    ls -la .dogfood.toml fixtures.json run.py
    ```
    Expected: All three files exist at the project root.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⏰ AFTER code was generated — do these now:

[ ] Test config loading with run.py parser:
    ```
    python -c "import run; cfg = run.load_config('.dogfood.toml'); print('Claimed:', cfg['tiers']['claimed'])"
    ```
    Expected: Claimed: ['T1', 'T2']

[ ] Test fixture loading with run.py loader:
    ```
    python -c "import run; f, p = run.load_fixture(None, '.dogfood.toml'); print('Loaded', len(f['projects']), 'projects from', p)"
    ```
    Expected: Loaded 41 projects from fixtures.json

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ WHAT GOT BUILT THIS STEP
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[ ] File: `.dogfood.toml` — Acceptance test config mapping base_url, claimed tiers, auth headers, and routes
[ ] File: `fixtures.json` — Root-level synthetic dataset with 41 projects, 30 judges, 40 teams, and scores
[ ] File: `run.py` — Official automated acceptance test suite from Hackathon Raptors
[ ] Feature: Baseline Acceptance Configuration — 100% compliant with run.py syntax and validation harness

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🧪 TESTING & VERIFICATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Test 1 — Files Exist:
```
ls -la .dogfood.toml fixtures.json run.py
```
✅ Expected: .dogfood.toml, fixtures.json, run.py present in root directory.
❌ If missing: Copy from docs/ or re-create .dogfood.toml.

Test 2 — TOML Syntax & Route Integrity:
```
python -c "import run; cfg = run.load_config('.dogfood.toml'); assert cfg['portal']['base_url'] == 'http://localhost:8080'; assert cfg['tiers']['claimed'] == ['T1', 'T2']; assert cfg['routes']['gallery'] == '/projects'; assert cfg['routes']['submit'] == '/projects/new'; assert cfg['routes']['judge_scores'] == '/api/judge/scores'; assert cfg['routes']['peer_scores'] == '/api/judge/scores?judge=judge_a'; assert cfg['routes']['csv_export'] == '/api/export.csv'; print('ALL ROUTES & CLAIMS VALID')"
```
✅ Expected: "ALL ROUTES & CLAIMS VALID"
❌ If errors: Check `.dogfood.toml` formatting.

Test 3 — Fixture Parsing:
```
python -c "import json; data = json.load(open('fixtures.json')); print('Event:', data['event']['id']); print('Projects:', len(data['projects']))"
```
✅ Expected: Event: evt_01, Projects: 41
❌ If errors: Ensure `fixtures.json` is a valid copy of `docs/fixtures.json`.

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
git commit -m "Step 2: Acceptance Configuration Baseline — .dogfood.toml, fixtures.json, run.py"
```

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✋ DO NOT proceed to Step 3 until:
[ ] All tests above show ✅
[ ] Git commit is done
[ ] You have read do_after_completion.md fully
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
