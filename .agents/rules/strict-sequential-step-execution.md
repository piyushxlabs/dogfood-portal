---
trigger: always_on
---

You must strictly execute implementation according to `AGENT_MASTER_PLAN.md` Section 8 ("DYNAMIC PHASE-GATED EXECUTION SEQUENCE"):
`Phase 1 (Scaffolding & Config) → Phase 2 (DB & Seeding) → Phase 3 (Route Handlers) → Phase 4 (Bento/Split/Mission UI) → Phase 5 (Docker Standalone & run.py) → Phase 6 (Demo Video Verification)`

Execution Rules:
1. Never work on more than ONE step at a time (e.g. complete Step 3 DDL before Step 4 Seeder).
2. Never begin the next step until the user explicitly confirms or types "Proceed" / "Yes".
3. After completing a step, execute the verification command (e.g. `node scripts/migrate.mjs`, `curl -s ...`), output the result proving success, and WAIT for confirmation.