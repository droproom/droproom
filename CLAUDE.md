# Droproom

Private, invite-only SaaS platform where cannabis brands get gated "drop pages" to share with buyers. No sales on platform — purely promotion/exposure.

## Tech Stack
- **Framework:** Next.js 16 (App Router, Turbopack)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS v4 (`@theme inline` in globals.css, no tailwind.config)
- **Database/Auth/Storage:** Supabase
- **Hosting:** Vercel (auto-deploys from GitHub on push to main)
- **Repo:** github.com/droproom/droproom (public)

## Key Conventions

### Next.js 16 Differences
- Middleware is `src/proxy.ts` (not middleware.ts), export named `proxy`
- `cookies()`, `headers()`, `params` are all async — must be awaited
- Check `node_modules/next/dist/docs/` for API reference

### Supabase Clients (src/lib/)
- `supabase.ts` — SSR server client with cookie handling. Use ONLY for `auth.getUser()`
- `supabase-browser.ts` — Browser client for client components
- `supabase-admin.ts` — Service role client (bypasses RLS). Use for ALL database reads/writes in server actions and pages
- **Pattern:** Verify identity with `createClient()` → `auth.getUser()`, then query with `supabaseAdmin`

### Auth Flow
- Signup creates user via `supabaseAdmin.auth.admin.createUser()` (auto-confirms email)
- Server actions return `{ success, redirect }` — client components handle redirect via `router.push()`
- Do NOT use `redirect()` from server actions called by `useActionState` — causes "unexpected response" errors

### File Structure
```
src/
  proxy.ts                    — Auth session refresh + route protection
  lib/                        — Supabase clients, types, utils
  app/
    page.tsx                  — Landing page (constellation animation + Join button)
    (auth)/signup|login/      — Auth pages
    dashboard/                — Brand dashboard (drops, codes, contacts, analytics)
    owner/                    — Owner dashboard (invite codes, brand management)
    [slug]/                   — Public brand page (code entry → drop grid)
    actions/                  — Server actions (auth, drops, viewer-codes, contacts, owner, brand)
    components/               — All client + shared components
    api/                      — Route handlers (verify-viewer-code, brand/[slug])
```

### Three User Types
1. **Owner** — `is_owner=true` flag on brands table. Full admin access at `/owner`
2. **Brands** — Sign up with invite code. Manage drops, viewer codes, contacts at `/dashboard`
3. **Buyers** — No account. Enter viewer code at `/[slug]` to see drops. Cookie-based session

### Database Tables
brands, drops, brand_invite_codes, viewer_codes, viewer_code_uses, brand_contacts

### Design
- Always dark theme (#0a0a0a background)
- Gold accent: #c9a96e
- Geist font (sans + mono)
- Public brand pages match The Gallery LA aesthetic (thegalleryla-website.vercel.app)
- Mobile-first

## Commands
- `npm run dev` — Start dev server
- `npm run build` — Production build
- `npm run lint` — ESLint

## Environment Variables (.env.local)
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
```
Same vars must be set in Vercel → Settings → Environment Variables.
