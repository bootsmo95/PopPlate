# PopPlate

## What This Is

A SaaS platform for restaurants that lets diners see 3D models of menu dishes before ordering. Restaurant owners sign up, add dishes with photos, generate realistic 3D models via AI, track usage and analytics, and share their menu through a QR code. Diners scan the code and browse an interactive 3D menu — no app needed.

## Core Value

Restaurants can show diners what their dishes actually look like in 3D before they order — that's what makes PopPlate worth paying for. Everything else supports this.

## Current State

Shipped v1.0 MVP on 2026-05-22. The platform is functional end-to-end: auth, restaurant/dish CRUD, 3D generation with tier limits, analytics dashboard, and polished UI with loading states, toast notifications, error handling, and empty states. 61 files modified, ~6600 LOC added across 3 phases and 7 plans.

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
- Model generation usage tracking with tier-based enforcement — v1.0
- Analytics dashboard with menu views, dish popularity, QR scan tracking, and time-period controls — v1.0
- UTM-based QR scan attribution (utm_source=qr on QR URLs) — v1.0
- Polished UI: loading spinners, toast notifications, empty states, error boundary — v1.0

### Active

- [ ] Smooth end-to-end onboarding flow (signup -> create restaurant -> add dishes -> generate -> share)
- [ ] Stripe subscription billing (monthly plans tied to tiers)
- [ ] Plan enforcement (generation limits, dish limits, restaurant limits per tier)
- [ ] Restaurant team management (owner invites staff, staff manages dishes)
- [ ] Landing page / marketing site

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
- **3D pipeline:** MeshyAI image-to-3D API -> worker polls for completion -> GLB/USDZ models stored in S3 -> rendered via Google Model Viewer web component
- **Hosting:** Coolify on popplate.dk with separate services for app, auth (Authentik), and storage (MinIO)
- **Billing:** Stripe already integrated as a dependency but subscription flow not fully wired
- **Tiers:** free/pro/studio/unlimited defined in `server/utils/tiers.ts` with generation limits (15/50/150/unlimited per month)
- **Analytics:** Full analytics pipeline — events tracked client-side, aggregated server-side at `/api/restaurants/[slug]/analytics`, displayed on dedicated `/platform/analytics` page with trend charts (vue-chartjs) and dish popularity ranking
- **UI patterns:** useToast composable for notifications, ActionButton for loading states, p-card empty states, error.vue global boundary
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
| Authentik for auth instead of built-in | Offloads user management, supports OIDC, handles email verification | Good |
| MeshyAI for 3D generation | Best image-to-3D API available; async workflow fits background worker pattern | Good |
| Nuxt 4 monolith | Single deploy, shared types, SSR for public pages, API routes co-located | Good |
| QR-to-web for diner access | Zero friction — no app install, works on any phone with a camera | Good |
| Stripe for billing | Industry standard, already partially integrated | Pending |
| Tier claims from Authentik | Centralizes plan/tier assignment in identity provider | Good |
| Count all generation jobs regardless of status | Resource consumed regardless of outcome | Good (Phase 1) |
| Billing cycle anchored to user createdAt | Deterministic, no edge cases with calendar months | Good (Phase 1) |
| QR scan counting via utm_source filter | Reuses existing analytics events, no separate tracking | Good (Phase 2) |
| Hybrid feedback: inline for forms, toast for actions | Form validation stays inline, async results use toast | Good (Phase 3) |
| useState for toast state (SSR-safe) | Global shared state across components without prop drilling | Good (Phase 3) |

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
*Last updated: 2026-05-22 after v1.0 milestone*
