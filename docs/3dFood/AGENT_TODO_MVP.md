# AGENT_TODO_MVP

## Mission
Implement the smallest viable version of 3dFood focused on proving restaurant QR -> mobile 3D dish viewing.

## Build priorities
1. public mobile dish page
2. 3D viewer integration
3. admin dish CRUD
4. asset upload
5. QR generation
6. analytics events
7. AR fallback logic

## Non-goals
- billing
- team roles
- enterprise settings
- advanced themes
- POS integrations
- auto-processing pipelines

## Immediate execution checklist
### Foundation
- [ ] scaffold Nuxt 4 app
- [ ] enable TypeScript
- [ ] set up Tailwind
- [ ] create app layout shell

### Public MVP experience
- [ ] create sample dish route
- [ ] build mobile-first dish page UI
- [ ] integrate PlayCanvas viewer wrapper
- [ ] add thumbnail/poster state
- [ ] add loading/error states
- [ ] add AR CTA placeholder/logic

### Backend/data
- [ ] set up database connection
- [ ] create Restaurant model
- [ ] create Dish model
- [ ] create AnalyticsEvent model
- [ ] create publish-state handling

### Admin
- [ ] add auth
- [ ] create admin login page
- [ ] create dish list page
- [ ] create create/edit dish form
- [ ] create publish toggle

### Assets
- [ ] upload thumbnail
- [ ] upload GLB model
- [ ] validate file types
- [ ] store asset URLs in DB

### QR + analytics
- [ ] generate QR per dish
- [ ] add copy public URL action
- [ ] track page_open
- [ ] track viewer_open
- [ ] track ar_launch
- [ ] show counts in admin

## Acceptance criteria
- [ ] admin can create and publish a dish
- [ ] public dish page works on phone
- [ ] 3D viewer loads uploaded model
- [ ] QR points to correct public page
- [ ] analytics events are recorded
- [ ] unsupported AR falls back cleanly to normal 3D

## If time remains after MVP
- [ ] improve loading performance
- [ ] improve visual polish
- [ ] add restaurant branding fields
- [ ] support optional USDZ field for iOS
