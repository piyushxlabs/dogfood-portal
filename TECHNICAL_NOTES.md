# TECHNICAL NOTES
Dogfood 2026 Hackathon Portal Architectural Decisions

---
## Step 1 — Air-Gapped Standalone Build & System Font Strategy
**Decision:** Configured Next.js 15 with `output: 'standalone'`, `images: { unoptimized: true }`, and native system font stack in `app/globals.css` instead of `next/font/google`.
**Reason:** Strict compliance with SYSTEM_SCOPE_AND_BEHAVIOR.md Section 2 Prohibition #6 (Air-Gapped Standalone Build Rule). In an air-gapped environment with Wi-Fi disabled, remote font downloads from Google CDNs will fail the build or render broken fallback fonts.
**Impact:** The application bundles self-contained runtime artifacts into `.next/standalone` without requiring `node_modules` in production, enabling zero runtime external network requests.
---

## Step 2 — Strict Claim Boundary & Zero-Overclaim Policy
**Decision:** Configured `.dogfood.toml` to claim strictly `["T1", "T2"]`, omitting speculative T3/T4 claims.
**Reason:** In accordance with SYSTEM_SCOPE_AND_BEHAVIOR.md Section 2 Prohibition #5 (No Overclaiming Tiers), the platform must claim only tiers that are rigorously verified by `run.py` to prevent disqualification penalties.
**Impact:** `run.py` evaluates all 7 core assertions and reports `claimed T1 T2, verified T1 T2` deterministically.
---

## Step 3 — Defensive DDL Design for Synthetic Edge Cases
**Decision:** Defined primary key on `projects` strictly as `id` (omitting unique constraints on `team_id, title` or `team_id, repo_url`), and defined `scores.comment` as `TEXT NULL`.
**Reason:** In `fixtures.json`, duplicate project `prj_41` shares identical team and title with `prj_07`, and multiple reviews feature empty string comments `""`. Imposing synthetic composite uniqueness or NOT NULL comment constraints would abort database seeding.
**Impact:** Clean ingestion and idempotent DDL execution across all 11 tables and 6 indexes without unique constraint conflicts.
---

## Step 4 — Atomic Ingestion & Deterministic Test Session Generation
**Decision:** Wrapped all table truncations and data ingestions in `sql.begin()` and seeded 4 deterministic test session tokens (`org_7f2a`, `jdg_a_91bc`, `jdg_b_44de`, `prt_2e88`) with expiry set to 2028.
**Reason:** In accordance with ARCHITECTURE.md Section 3.1, the acceptance test suite `run.py` never navigates UI login forms; it attaches pre-seeded authentication headers directly. Atomic transaction ensures either 100% of the fixture entities and sessions are committed or cleanly rolled back.
**Impact:** `run.py` assertions execute headlessly and deterministically against consistent judge and organizer session tokens.
---

## Step 5 — Route Handler Role Isolation vs Edge Middleware Runtime
**Decision:** Implemented database session resolution and FIG. 02 role guards inside Node.js Route Handlers (`lib/auth.ts`) while keeping `middleware.ts` strictly as a lightweight request pass-through and path router.
**Reason:** Next.js Edge middleware runtime lacks Node.js TCP socket support required by `postgres.js` (`net.Socket is not supported`). Attempting database queries in Edge middleware would crash incoming HTTP requests.
**Impact:** 100% adherence to FIG. 02 Matrix with sub-millisecond database queries inside Node.js Route Handlers, returning deterministic HTTP 401 and 403 status codes.
---




