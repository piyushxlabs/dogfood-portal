# TECHNICAL NOTES
Dogfood 2026 Hackathon Portal Architectural Decisions

---
## Step 1 — Air-Gapped Standalone Build & System Font Strategy
**Decision:** Configured Next.js 15 with `output: 'standalone'`, `images: { unoptimized: true }`, and native system font stack in `app/globals.css` instead of `next/font/google`.
**Reason:** Strict compliance with SYSTEM_SCOPE_AND_BEHAVIOR.md Section 2 Prohibition #6 (Air-Gapped Standalone Build Rule). In an air-gapped environment with Wi-Fi disabled, remote font downloads from Google CDNs will fail the build or render broken fallback fonts.
**Impact:** The application bundles self-contained runtime artifacts into `.next/standalone` without requiring `node_modules` in production, enabling zero runtime external network requests.
---
