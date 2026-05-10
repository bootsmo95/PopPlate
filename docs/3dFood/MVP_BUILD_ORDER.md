# MVP_BUILD_ORDER

## Principle
Build the MVP in the smallest slices that create real validation.
Do not start with multi-tenant complexity, billing, or perfect dashboards.

## Step 1 - Static demo
Goal: prove the experience is compelling.

Build:
- one mobile dish page
- one sample dish
- one GLB model
- one poster image
- basic 3D viewer

Done when:
- the page feels good on a real phone
- a person can understand the concept in under 10 seconds

## Step 2 - AR decision spike
Goal: determine real-world AR support and fallback behavior.

Build/test:
- iPhone AR path
- Android AR path
- unsupported-device fallback

Done when:
- exact CTA behavior is documented per device group

## Step 3 - Core data model
Goal: create the smallest durable backend.

Build:
- Restaurant table
- Dish table
- AnalyticsEvent table
- basic auth
- storage layout for thumbnails/models

Done when:
- a dish can be stored, fetched, and published

## Step 4 - Admin CRUD
Goal: remove developer dependency for content changes.

Build:
- admin login
- dish list
- create/edit form
- publish toggle
- thumbnail upload
- GLB upload

Done when:
- a non-dev can create a dish record end-to-end

## Step 5 - Live public pages
Goal: connect public experience to real data.

Build:
- slug-based or short-id-based public route
- published dish fetch
- public dish rendering
- viewer wiring to uploaded asset

Done when:
- a live uploaded dish is visible from its public URL

## Step 6 - QR generation
Goal: make the system usable in a restaurant.

Build:
- QR code generation per dish
- download/export option
- URL copy helper

Done when:
- restaurant can print or place a dish QR code

## Step 7 - Analytics
Goal: learn from real usage.

Build:
- page_open event
- viewer_open event
- ar_launch event
- basic per-dish metrics in admin

Done when:
- admin can see which dishes were actually used

## Step 8 - Pilot polish
Goal: make it stable enough for a real table test.

Build/fix:
- loading states
- empty/error states
- file validation
- visual polish
- basic reliability fixes

Done when:
- you would feel okay showing it to a real restaurant

## Hard stop rules
Do NOT expand MVP into these before pilot:
- billing
- role systems
- white-label complexity
- auto asset conversion
- complex analytics
- direct ordering flow

## Final MVP checkpoint
The MVP is ready for real-world validation when:
- 3 dishes are live
- QR codes exist for each
- the 3D viewer is stable on target phones
- analytics are working
- at least one restaurant can use it without hand-holding on every step
