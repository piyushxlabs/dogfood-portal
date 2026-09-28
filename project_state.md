# PROJECT STATE
**Project:** Dogfood 2026 Hackathon Portal

- **Last Completed Step:** Step 10A: Premium Bento-Grid Gallery (T1 Frontend - app/projects/page.tsx, components/BentoGrid.tsx, components/ProjectCard.tsx)
- **Implemented Features:**
  - Next.js 15 App Router scaffold with TypeScript strict mode
  - Tailwind CSS dark mode zinc design system tokens & base CSS
  - Air-gapped standalone configuration (`next.config.ts`) with `images.unoptimized: true`
  - Authoritative TypeScript relational database interfaces (`src/types/db.ts`) matching DATA-MODEL.md
  - Full dependency installation (`postgres.js`, `lucide-react`, `tailwind-merge`, etc.)
  - Production build verification (`npm run build` completed with code 0)
  - Acceptance baseline configuration (`.dogfood.toml`) with claimed tiers T1 + T2 and 5 verified routes
  - Root fixtures (`fixtures.json`) and test suite (`run.py`) deployed and validated
  - PostgreSQL connection singleton (`lib/db.ts`) with connection pooling and hot-reload preservation
  - Complete idempotent SQL DDL migration runner (`scripts/migrate.mjs`) covering all 11 tables and 6 indexes
  - Transactional offline fixtures seeder (`scripts/seed.mjs`) ingesting all 41 projects, 30 judges, 40 teams, and rubric scores with deterministic test sessions
  - Session authentication helper and role guard (`lib/auth.ts`) enforcing FIG. 02 Role-Isolation Matrix with HTTP 401/403 responses
  - Next.js App Router middleware (`middleware.ts`) for header forwarding and static asset exclusion
  - Public Bento-Grid gallery RSC (`app/projects/page.tsx`) rendering all 41 fixture titles into server HTML
  - Modular BentoGrid layout (`components/BentoGrid.tsx`) and enhanced cards with hover lift animations (`components/ProjectCard.tsx`)
  - Instant client search input (`components/SearchBar.tsx`) and track category filter pills (`components/TrackFilterPills.tsx`)
  - API route handler (`app/api/projects/route.ts`) returning JSON project catalog
  - Automatic portal root redirect from `/` to `/projects` (`app/page.tsx`)
  - Deadline-enforced submission Route Handler (`app/projects/new/route.ts`) refusing late submissions with HTTP 400 and logging audit violations
  - Role-isolated judging Route Handler (`app/api/judge/scores/route.ts`) enforcing FIG. 02 Matrix (401 unauthenticated, 403 participant, 403 peer score probe, 200 own score access, and 200 organizer inspection) plus ballot submission (`POST /api/judge/scores`)
  - High-throughput streaming CSV export Route Handler (`app/api/export.csv/route.ts`) with RFC 4180 compliance, organizer/admin authorization, and audit logging
  - Statistical Z-Score Normalization Engine (`lib/normalization.ts`) computing damped standardization, 1–5 scale calibration, and rank deltas
- **Pending Next Step:** Step 10B: Judge Split-Screen Speed Console (T2 Frontend - app/judge/review/[projectId]/page.tsx, components/RubricSlider.tsx)
- **Known Issues / Blockers:** None.
