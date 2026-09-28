---
trigger: always_on
---

Before modifying any existing file:
- Read the entire file first to maintain full context and understand its role in the Next.js App Router architecture.
- Identify every other file that imports from it (specifically `src/types/db.ts`, `lib/db.ts`, `lib/auth.ts`, `lib/normalization.ts`, and Route Handlers under `app/api/`).
- Never blindly overwrite — merge new functionality cleanly while preserving strict TypeScript interfaces, async signatures, and Next.js 15 Server Component / Route Handler conventions.
- If a conflict is found between new instructions and the 5 locked specification documents (`SYSTEM_SCOPE_AND_BEHAVIOR.md`, `DATA-MODEL.md`, `JUDGING.md`, `ARCHITECTURE.md`, `AGENT_MASTER_PLAN.md`), STOP and report the discrepancy before proceeding.