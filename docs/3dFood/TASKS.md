# TASKS

## Priority legend
- P0 = must do now
- P1 = should do for MVP
- P2 = later / after pilot

## P0 - decisions
- [ ] choose pilot segment
- [ ] choose first pilot restaurant type
- [ ] choose storage provider
- [ ] choose auth provider
- [ ] choose AR fallback strategy
- [ ] define dish asset specification
- [ ] define target device support matrix

## P0 - prototype
- [ ] scaffold Nuxt 4 app
- [ ] set up TypeScript + Tailwind
- [ ] create sample public dish page
- [ ] integrate PlayCanvas viewer
- [ ] load one sample GLB dish model
- [ ] add poster/loading state
- [ ] test touch rotate/zoom on mobile
- [ ] validate mobile performance

## P0 - AR proof
- [ ] test iPhone Quick Look path
- [ ] test Android Scene Viewer or fallback path
- [ ] create AR support detection logic
- [ ] define copy for supported vs unsupported devices

## P1 - backend foundation
- [ ] set up database
- [ ] define schema for restaurants, dishes, analytics events
- [ ] set up authentication
- [ ] define storage bucket structure
- [ ] define upload validation rules

## P1 - admin
- [ ] build admin login
- [ ] build admin shell/layout
- [ ] build dish list page
- [ ] build create dish form
- [ ] build edit dish form
- [ ] build publish/unpublish flow
- [ ] build asset upload UI

## P1 - public experience
- [ ] build public dish route
- [ ] fetch published dish data
- [ ] render dish image + metadata
- [ ] wire 3D viewer to live data
- [ ] wire AR CTA logic
- [ ] add error/fallback states

## P1 - QR and analytics
- [ ] generate QR code per dish
- [ ] allow QR download/export
- [ ] record page_open event
- [ ] record viewer_open event
- [ ] record ar_launch event
- [ ] record basic device/user-agent context
- [ ] show simple dashboard metrics

## P1 - content operations
- [ ] write dish model specification
- [ ] define thumbnail requirements
- [ ] define naming conventions
- [ ] define scale calibration process
- [ ] create onboarding checklist for restaurants

## P1 - pilot readiness
- [ ] onboard 1 restaurant
- [ ] upload 3-5 dishes
- [ ] print/test QR placement
- [ ] run in real environment
- [ ] collect qualitative feedback
- [ ] log issues after pilot

## P2 - after MVP
- [ ] multi-tenant theming
- [ ] billing integration
- [ ] roles/permissions
- [ ] richer analytics
- [ ] multi-language support
- [ ] upsell flows
- [ ] direct order integrations
- [ ] automated asset optimization pipeline

## Suggested first sprint
### Sprint goal
Prove that the experience is compelling before building admin complexity.

### Sprint tasks
- [ ] scaffold app
- [ ] build one sample dish page
- [ ] integrate sample model
- [ ] add poster/loading state
- [ ] test on 2 real phones
- [ ] document AR findings

## Suggested second sprint
### Sprint goal
Make content manageable without developer intervention.

### Sprint tasks
- [ ] create DB schema
- [ ] create admin login
- [ ] create dish CRUD
- [ ] create upload flow
- [ ] serve live public dish page
- [ ] add QR generation

## Suggested third sprint
### Sprint goal
Become pilot-ready.

### Sprint tasks
- [ ] add analytics
- [ ] polish fallback states
- [ ] onboard sample dishes
- [ ] pilot test in restaurant setting
- [ ] prioritize fixes
