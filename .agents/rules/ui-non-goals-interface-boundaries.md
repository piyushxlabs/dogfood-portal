---
trigger: always_on
---

Per `SYSTEM_SCOPE_AND_BEHAVIOR.md` and `ARCHITECTURE.md`, the web portal interface must NOT include:
1. Any third-party hosted authentication widgets, external OAuth redirects, or cloud login iframes (Clerk, Auth0, Supabase Auth).
2. External CDN scripts, remote video hosting dependencies, or remote Google Fonts that fail in an offline air-gapped environment.
3. Separate microservice frontends or Nginx reverse proxies; everything must render from the single Next.js standalone container on Port 8080.
4. Unclaimed T3/T4 features (e.g. webhooks, public quadratic voting, certificate generation) that are not validated by `run.py`.
5. Cosmetic-only frontend role checks: Hiding a button in the UI without enforcing HTTP 403 in the Route Handler is strictly prohibited.