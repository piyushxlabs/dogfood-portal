---
trigger: always_on
---

All judging, rubric evaluations, score normalization, and rankings must be strictly computed using deterministic mathematical algorithms in TypeScript (`lib/normalization.ts`), NEVER probabilistic AI/LLM generation or prompt inference.

1. **Weighted Rubric Math:** Raw review scores must strictly evaluate as $S_{ij} = (0.40 \cdot \text{func}) + (0.35 \cdot \text{qual}) + (0.25 \cdot \text{innov})$.
2. **Z-Score Calibration:** Normalization must mathematically prove variance reduction from $\sigma_{\text{raw}} = 0.94$ down to $\sigma_{\text{norm}} \le 0.35$, yielding verified rank deltas (`prj_17` climbs +4, `prj_09` drops -6).
3. **Refusal Standard:** Route Handlers must strictly refuse unauthorized access via HTTP status codes (`401 Unauthorized` for missing auth, `403 Forbidden` for role violations, `400 Bad Request` for closed events). Never return HTTP 200 with an empty body or error message inside JSON to hide access denial.