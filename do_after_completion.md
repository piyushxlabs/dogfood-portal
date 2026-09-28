━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# STEP 1 COMPLETION CHECKLIST
# Next.js App Router Scaffold & Dependency Manifest
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⏰ BEFORE running the next prompt — do these first:

[ ] Review the generated configuration files:
    ```
    cat package.json
    cat next.config.ts
    ```
    Expected: Standalone output and Next.js 15 manifest present.

[ ] Confirm node_modules and .next directory exist:
    ```
    ls -d node_modules .next
    ```
    Expected: Both directories exist.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⏰ AFTER code was generated — do these now:

[ ] Run test build verification:
    ```
    npm run build
    ```
    Expected: "Compiled successfully", generating static pages with standalone directory in `.next/standalone`.
    If wrong: Ensure all packages are installed with `npm install`.

[ ] Verify standalone bundle was created:
    ```
    ls -d .next/standalone
    ```
    Expected: `.next/standalone` folder exists.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ WHAT GOT BUILT THIS STEP
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[ ] File: `package.json` — Next.js 15, React 19, postgres.js, Tailwind CSS, Lucide Icons
[ ] File: `tsconfig.json` — Strict TypeScript compiler config with `@/*` aliases
[ ] File: `next.config.ts` — Standalone output and unoptimized images for air-gapped container
[ ] File: `tailwind.config.ts` — Dark mode class configuration and zinc theme tokens
[ ] File: `postcss.config.mjs` — PostCSS configuration with Tailwind CSS and Autoprefixer
[ ] File: `.env.example` — Reference environment variables template
[ ] File: `.env.local` — Local environment variables (Port 8080, telemetry disabled)
[ ] File: `.gitignore` — Ignores node_modules, build outputs, and all `.env` files
[ ] File: `src/types/db.ts` — Authoritative TypeScript interfaces matching DATA-MODEL.md Section 3B
[ ] File: `app/globals.css` — Global CSS variables for dark zinc theme and system font stack
[ ] File: `app/layout.tsx` — Root layout with dark class and system font typography
[ ] File: `app/page.tsx` — Verification landing page with portal navigation targets
[ ] Package: next@15.5.26 — Framework runtime for React Server Components and Route Handlers
[ ] Package: postgres@3.4.5 — PostgreSQL client for air-gapped database interactions
[ ] Package: lucide-react@0.468.0 — Icon library for UI dashboards
[ ] Package: tailwindcss@3.4.17 — Utility-first CSS framework

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🧪 TESTING & VERIFICATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Test 1 — Files Exist:
```
ls -la package.json next.config.ts tsconfig.json tailwind.config.ts .env.local src/types/db.ts app/layout.tsx
```
✅ Expected: All scaffold files listed above appear.
❌ If missing: Re-generate the missing file according to Step 1 specification.

Test 2 — Environment / Dependencies:
```
npm list next postgres lucide-react
```
✅ Expected: next@15.5.26, postgres@3.4.5, lucide-react@0.468.0 installed without missing dependency errors.
❌ If errors: Run `npm install`.

Test 3 — Server or Process Start:
```
npm run build
```
✅ Expected: "Compiled successfully" with zero TypeScript errors.
❌ If errors: Check `tsconfig.json` or syntax errors in `app/` or `src/types/db.ts`.

Test 4 — Functional Check:
Inspect `next.config.ts` to ensure `output: "standalone"` is set.
✅ Expected: `output: "standalone"` is present.
❌ If wrong: Update `next.config.ts` to include `output: "standalone"`.

Test 5 — Security Check:
[ ] Verify .env is in .gitignore
    ```
    Get-Content .gitignore | Select-String "\.env"
    ```
    ✅ Expected: `.env` and `.env*.local` appear in the output.
    ❌ If missing: Add `.env` to `.gitignore` immediately.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📦 GIT COMMIT
(Run this ONLY after all above checks pass)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```
git add .
git commit -m "Step 1: Next.js App Router Scaffold & Dependency Manifest — offline standalone build"
```

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✋ DO NOT proceed to Step 2 until:
[ ] All tests above show ✅
[ ] Git commit is done
[ ] You have read do_after_completion.md fully
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
