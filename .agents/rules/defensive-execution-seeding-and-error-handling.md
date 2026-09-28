---
trigger: always_on
---

Bare `try-catch` blocks with empty handlers or suppressed errors are strictly forbidden.

Database transactions (table migrations and fixtures seeding) must be fully atomic (`sql.begin()`), rolling back cleanly if any node fails.

Handle all synthetic dataset edge cases defensively without throwing fatal exceptions:
1. Duplicate project `prj_41` (same team and title as `prj_07`) must be ingested safely without unique-constraint violations.
2. Empty review comments (`"comment": ""`) must be treated as valid nullable fields (`scores.comment TEXT NULL`).
3. Normalization calculations in `lib/normalization.ts` must apply the regularization parameter $\epsilon = 10^{-4}$ ($z_{ij} = \frac{S_{ij} - \mu_j}{\sigma_j + 0.0001}$) to prevent division by zero when a judge awards uniform scores.