---
trigger: always_on
---

All Next.js Route Handlers under `app/` and `app/api/` must strictly enforce the FIG. 02 Role-Isolation Matrix from `ARCHITECTURE.md` Section 4:

| Actor Role | Own Scores | Peer Scores | Other Track Scores | Aggregate Results | Audit Log |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **VISITOR** | ✗ (401) | ✗ (401) | ✗ (401) | ✗ (401) | ✗ (401) |
| **PARTICIPANT** | ✗ (403) | ✗ (403) | ✗ (403) | ✗ (403) | ✗ (403) |
| **JUDGE** | **+ (200)** | ✗ (403) | ✗ (403) | ✗ (403) | ✗ (403) |
| **ORGANIZER** | **+ (200)** | **+ (200)** | **+ (200)** | **+ (200)** | **+ (200)** |
| **ADMIN** | **+ (200)** | **+ (200)** | **+ (200)** | **+ (200)** | **+ (200)** |

*Legend: `+ = Permitted (HTTP 200)` | `✗ = Blocked at API (HTTP 401/403)`.*

No route handler may grant permissions outside this matrix. Any attempt by a judge to query a peer judge's ballot must immediately log an audit event and terminate with HTTP 403.