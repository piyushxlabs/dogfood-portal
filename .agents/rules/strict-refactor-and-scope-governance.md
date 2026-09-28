---
trigger: always_on
---

Never refactor, rename, restructure, or delete working code, database tables, or TypeScript interfaces without explicit permission.

If you believe a refactor is needed, state:
- What you want to change (specific file, table schema, Route Handler, or component)
- Why it is needed (referencing the 5 locked specification documents)
- What could break (e.g. `run.py` peer score check failing, CSV export format breaking, Docker standalone build failure)

Then wait for explicit approval. Unauthorized modification of `src/types/db.ts`, `.dogfood.toml`, or the 6-phase roadmap in `AGENT_MASTER_PLAN.md` is a critical failure.