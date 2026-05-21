# PopPlate

## What This Is

A SaaS platform for restaurants that lets diners see 3D models of menu dishes before ordering. Restaurant owners and staff sign up, add their dishes with photos, generate realistic 3D models via AI, and share their menu through a QR code that links to a public web page. Diners scan the code and browse an interactive 3D menu — no app needed.

## Core Value

Restaurants can show diners what their dishes actually look like in 3D before they order — that's what makes PopPlate worth paying for. Everything else supports this.

## Requirements

### Validated

- Authenticated user accounts via Authentik (OAuth/OIDC) — existing
- Restaurant CRUD (create, edit, delete restaurants) — existing
- Dish CRUD with image uploads (1-4 source images per dish) — existing
- 3D model generation from dish photos via MeshyAI — existing
- Public restaurant menu page at `/r/[slug]` with 3D model viewer — existing
- QR code generation for restaurant menu sharing — existing
- Tier-based access control (free/basic/pro tiers defined) — existing
- Background worker for async generation job polling — existing
- S3-compatible file storage for images and 3D models — existing
- Basic analytics tracking (menu views, dish interactions) — existing

### Active

- [ ] Smooth end-to-end onboarding flow (signup → create restaurant → add dishes → generate → share)
- [ ] Stripe subscription billing (monthly plans tied to tiers)
- [ ] Plan enforcement (generation limits, dish limits, restaurant limits per tier)
- [ ] Model generation usage tracking (count generations per user over rolling 31 days)
- [ ] Restaurant team management (owner invites staff, staff manages dishes)
- [ ] Menu and dish analytics dashboard for restaurant owners
- [ ] QR scan tracking and engagement metrics
- [ ] Landing page / marketing site
- [ ] Polished UI (loading states, error handling, mobile responsiveness, empty states)

### Out of Scope

- AR/augmented reality at the table — complexity too high for v1, revisit after launch
- Full menu replacement (ordering, filtering, dietary info) — PopPlate is a visual preview tool, not a POS
- Mobile native app — web-first, QR-to-browser works on all phones
- Agency/reseller model — sell directly to restaurants for now
- Real-time collaboration — team members don't need simultaneous editing
- Embedded widget for restaurant websites — QR-to-web is the v1 distribution model

## Context

- **Existing codebase:** Nuxt 4 full-stack TypeScript monolith with Vue 3 frontend, Nitro/H3 API layer, Drizzle ORM on PostgreSQL, and a Node.js background worker
- **Auth:** Authentik as external OIDC provider; role and tier claims mapped from Authentik to app session
- **3D pipeline:** MeshyAI image-to-3D API → worker polls for completion → GLB/USDZ models stored in S3 → rendered via Google Model Viewer web component
- **Hosting:** Coolify on popplate.dk with separate services for app, auth (Authentik), and storage (MinIO)
- **Billing:** Stripe already integrated as a dependency but subscription flow not fully wired
- **Tiers:** free/pro/studio/unlimited defined in `server/utils/tiers.ts` with generation limits
- **Analytics:** Partial implementation exists — events posted to `/api/public/analytics`
- **No test suite:** No testing framework configured yet
- **No CI/CD pipeline:** Manual deploys via Coolify

## Constraints

- **Auth provider**: Authentik (external) — user management, roles, and tiers flow from Authentik claims into the app session
- **3D generation**: MeshyAI API — rate limits and costs are external; generation tracking is critical for cost control
- **Hosting**: Coolify — deployment and infrastructure managed there
- **Budget**: Solo developer — favor shipping over perfection; avoid over-engineering

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Authentik for auth instead of built-in | Offloads user management, supports OIDC, handles email verification | -- Pending |
| MeshyAI for 3D generation | Best image-to-3D API available; async workflow fits background worker pattern | -- Pending |
| Nuxt 4 monolith | Single deploy, shared types, SSR for public pages, API routes co-located | -- Pending |
| QR-to-web for diner access | Zero friction — no app install, works on any phone with a camera | -- Pending |
| Stripe for billing | Industry standard, already partially integrated | -- Pending |
| Tier claims from Authentik | Centralizes plan/tier assignment in identity provider | -- Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? -> Move to Out of Scope with reason
2. Requirements validated? -> Move to Validated with phase reference
3. New requirements emerged? -> Add to Active
4. Decisions to log? -> Add to Key Decisions
5. "What This Is" still accurate? -> Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-05-21 after initialization*
