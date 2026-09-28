---
trigger: always_on
---

Before writing code for any step in `AGENT_MASTER_PLAN.md` Section 8, output this structured plan:

PLAN:
- Files to read: [list all spec files, types, and schemas needed for context]
- Files to create: [list exact paths under app/, lib/, scripts/, components/]
- Files to modify: [list full paths]
- Dependencies needed: [verify required packages from package.json — e.g. postgres.js, lucide-react]
- Database & Schema Impact: [specify tables, indexes, or queries touched]
- Acceptance Test Impact: [which of the 7 run.py checks are affected]
- Potential Risks: [e.g. 404 route mismatch on /projects/new, peer score leakage 200 vs 403, missing comma in CSV]

Then write: "Shall I proceed with this plan?"
Wait for explicit confirmation before writing a single line of code.