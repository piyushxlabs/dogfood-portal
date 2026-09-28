---
trigger: always_on
---

You MUST strictly adhere to the offline, air-gapped Full-Stack Next.js architecture:
- **Framework:** Next.js 15+ (App Router, TypeScript, React Server Components) on Port 8080.
- **UI & Styling:** Tailwind CSS (`darkMode: 'class'`), Shadcn UI components, Lucide Icons.
- **Backend API:** Next.js Route Handlers (`app/api/...` and `app/projects/new/route.ts`) coexisting in the same process on Port 8080.
- **Database Engine:** PostgreSQL 16 Alpine via `postgres.js` client, executed in local Docker network.
- **Container Build:** Multi-stage `Dockerfile` with `output: 'standalone'` in `next.config.ts`. All packages pre-compiled during `RUN npm run build`.
- **Fonts & Assets:** Strictly local system fonts or pre-bundled font files (NO `next/font/google` remote downloads, NO external CDNs).
- **Verification Suite:** Standard Python 3 `run.py .dogfood.toml` against localhost:8080.

UNDER NO CIRCUMSTANCES should you write code importing `openai`, `anthropic`, `google-genai`, or cloud services (`clerk`, `supabase`, `firebase`, `aws-sdk`). The system must run with host Wi-Fi disabled.