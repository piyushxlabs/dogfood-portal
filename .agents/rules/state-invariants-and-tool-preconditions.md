---
trigger: always_on
---

Before executing any database query, seeding operation, or Route Handler logic, enforce strict invariants in code:
1. **Immutable Deadline & Past Event Invariant:** Event `evt_01` has `submissions_close = '2026-03-01T18:00:00Z'`. Any late submission POST to `/projects/new` must be refused with HTTP 400.
2. **Duplicate Project Invariant:** Table `projects` primary key is strictly `id`. Duplicate submission `prj_41` (same title `"Dry Harbour"` and team `"tm_07"` as `prj_07`) must be ingested without unique constraint errors.
3. **Nullable Feedback Comments:** In table `scores`, `comment` is `TEXT NULL`. Empty string comments (`""`) from `fixtures.json` must be safely accepted without database exceptions.
4. **Z-Score Damping Invariant:** In `lib/normalization.ts`, standard deviation calculation must enforce regularization damping $\epsilon = 10^{-4}$ ($z_{ij} = \frac{S_{ij} - \mu_j}{\sigma_j + 0.0001}$) to prevent `NaN` or division by zero on uniform judge ballots.
5. **Pre-Seeded Test Sessions Invariant:** The 4 test sessions (`org_7f2a`, `jdg_a_91bc`, `jdg_b_44de`, `prt_2e88`) must be deterministically seeded at container startup and output to stdout.