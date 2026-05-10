# IMPLEMENTATION_PLAN

## Objective
Build an MVP for 3dFood that proves the QR -> mobile page -> 3D dish -> optional AR flow with one pilot restaurant.

## Delivery strategy
Build in vertical slices, not by isolated layers.
Each milestone should produce something testable.

## Phase 0 - Discovery and technical decisions
### Goals
- lock MVP scope
- choose asset standards
- choose AR fallback strategy
- define pilot constraints

### Tasks
- define pilot restaurant profile
- define first 3-5 dishes to support
- define dish asset spec (file size, scale, thumbnail rules)
- decide whether iOS AR requires mandatory USDZ support in MVP
- decide hosting/storage provider

### Deliverables
- product brief
- architecture doc
- asset specification
- support matrix

## Phase 1 - Viewer proof of concept
### Goals
- prove that a single dish can load beautifully on mobile
- validate PlayCanvas integration path

### Tasks
- create Nuxt playground page
- integrate PlayCanvas viewer or custom viewer shell
- load one sample GLB dish model
- add poster image and loading state
- verify touch interactions
- measure mobile performance

### Acceptance criteria
- sample dish loads on iPhone and Android
- first meaningful render feels fast enough
- user can rotate and inspect dish without confusion

## Phase 2 - AR proof of concept
### Goals
- prove that AR is viable enough for MVP messaging

### Tasks
- detect iOS and test Quick Look flow
- detect Android and test Scene Viewer/web fallback
- determine exact CTA copy based on device support
- document fallback behavior for unsupported devices

### Acceptance criteria
- at least one tested iPhone path works
- at least one tested Android path works
- unsupported devices degrade cleanly to 3D only

## Phase 3 - Data and admin foundation
### Goals
- establish CRUD and storage foundation

### Tasks
- create DB schema
- create restaurant and dish models
- set up auth
- build admin layout
- build dish list page
- build create/edit dish form
- build asset upload flow

### Acceptance criteria
- admin can create a dish without code changes
- uploaded dish appears as a stored record
- files end up in the right storage location

## Phase 4 - Public dish experience
### Goals
- ship the public QR destination

### Tasks
- build public route by restaurant + dish slug
- fetch published dish data
- render dish info and thumbnail
- load 3D viewer
- add AR CTA logic
- add analytics tracking events

### Acceptance criteria
- a public link works without auth
- dish page is mobile-first and clean
- core analytics events are recorded

## Phase 5 - QR flow and analytics
### Goals
- make the system usable by a real restaurant

### Tasks
- generate QR code per dish
- add QR download/print asset option
- build simple analytics dashboard cards
- track scan source where possible

### Acceptance criteria
- each dish has a printable QR target
- admin can see at least basic usage counts

## Phase 6 - Pilot readiness
### Goals
- onboard one real restaurant and test in the wild

### Tasks
- upload 3-5 real dishes
- validate copy and visuals
- test QR placement on menu/table
- collect feedback from guests/staff
- log issues and polish blockers

### Acceptance criteria
- pilot runs with real users
- major blockers are known and documented

## Suggested repo/app structure
- `app/` or `pages/` for Nuxt routes
- `components/3d/` for viewer-specific UI
- `components/admin/` for dashboard UI
- `server/api/` for backend routes
- `server/utils/` for auth/storage helpers
- `lib/analytics/` for event helpers
- `types/` for shared TS types
- `public/qr/` only for generated local examples if needed

## Engineering rules
- TypeScript everywhere
- keep viewer wrapper isolated from app UI
- no premature microservices
- design for graceful fallback first
- define analytics events up front
- document every device-specific AR decision

## Open technical questions
- Use PlayCanvas directly or wrap an existing viewer?
- Store analytics raw only, or also aggregate daily summaries?
- Is USDZ generated manually or required as uploaded asset?
- Should the first QR route be pretty slug-based or short-id based?

## Recommended milestone order
1. single sample dish page
2. mobile viewer working
3. AR fallback tested
4. DB + auth + dish CRUD
5. upload pipeline
6. public page wired to DB
7. QR generation
8. analytics dashboard
9. pilot content onboarding

## Done definition for implementation
The implementation phase is considered MVP-complete when:
- admin can create and publish dishes
- public dish links work on mobile
- 3D viewer is stable on target devices
- AR is supported where available with clear fallback
- QR codes are generated and usable
- analytics are recorded and visible
