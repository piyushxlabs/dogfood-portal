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


