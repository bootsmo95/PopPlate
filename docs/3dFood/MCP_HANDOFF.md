# MCP_HANDOFF

## Purpose
Practical handoff brief for building the MVP with the new image-upload -> generation -> preview -> QR -> guest AR/3D flow.

## Project summary
Build a mobile-first SaaS called **PopPlate / 3dFood** for restaurants.

### Admin experience
- admin logs in
- admin creates dish
- admin uploads source images
- admin submits generation job
- admin sees status
- admin previews result
- admin retries if needed
- admin publishes dish
- admin downloads QR code

### Guest experience
- guest scans QR code
- public dish page opens
- page attempts AR path when useful
- fallback is a 3D viewer

## Core product truth
The product should feel like an automated generation platform, but MVP implementation may use semi-manual handling behind the scenes if needed.

## Implementation priorities
1. admin dish submission flow
2. generation job lifecycle
3. preview/retry/publish flow
4. public QR dish page
5. AR/3D guest experience
6. analytics event capture

## Expected stack
- Nuxt 4 on Coolify
- PostgreSQL on Coolify
- Coolify-hosted storage
- optional Authentik on Coolify
- worker service on Coolify
- PlayCanvas for 3D fallback/viewing

## MVP requirements
- one pilot restaurant
- 3-5 dishes
- image upload instead of direct 3D upload
- async generation status
- preview and retry
- publish and QR generation
- public guest page
- AR or 3D fallback
- basic analytics in admin

## Constraints
- mobile-first UX is mandatory
- non-AR fallback must feel complete
- do not overengineer the generation backend in MVP
- optimize for a real pilot, not perfect automation
- keep deployment Coolify-native where possible

## Deliverables expected from implementation agent
- working Nuxt app scaffold
- admin auth flow
- dish submission flow
- image upload flow
- generation job lifecycle UI
- publish + QR flow
- public dish page
- AR/3D fallback viewer
- analytics event tracking
- local/dev run instructions

## Open implementation note
If real generation integration is not ready, preserve the same UX and state model while allowing manual/semi-manual asset completion internally.
