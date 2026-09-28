---
trigger: always_on
---

All application code must be written in strict TypeScript within the Next.js 15+ App Router architecture. Zero `any` types are permitted.

All database queries (via `postgres.js`), file operations (reading `fixtures.json`), and Route Handlers must use asynchronous `async`/`await` patterns — never use blocking synchronous I/O.

All database entities, route parameters, and API response payloads must strictly conform to the type interfaces defined in `src/types/db.ts` (matching `DATA-MODEL.md` Section 3B). Never parse or mutate database rows or request bodies using un-typed objects, manual string splitting, or raw unchecked dictionaries.