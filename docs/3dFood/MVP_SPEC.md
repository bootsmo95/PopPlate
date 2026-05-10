# MVP_SPEC

## MVP goal
Validate that restaurants will use an image-upload -> generation -> preview -> publish -> QR workflow, and that guests will use a QR-based AR/3D dish experience on mobile.

## MVP promise
A restaurant can upload photos of a dish, wait for the system to prepare a preview asset, preview/retry it, publish it, and let guests open a mobile page where the dish can be viewed in AR or 3D.

## What the MVP includes
### Public guest flow
- QR code per published dish
- public mobile dish page
- dish name
- short description
- price text
- allergens
- poster image
- 3D viewer fallback
- AR entry point when supported/useful
- graceful fallback when AR is unavailable

### Admin flow
- admin login
- paying user/admin role flag
- dish list
- create dish
- upload 5-15 source images
- submit generation job
- view generation status
- preview generated result
- retry generation
- publish/unpublish dish
- view/copy public dish URL
- download QR code

### Analytics
- page open
- viewer loaded
- AR launch clicked
- simple counts per dish

## What the MVP does NOT include
- automated billing
- team roles beyond simple admin/paying-user logic
- perfect automated 3D generation quality
- advanced branding
- ordering/payment integrations
- POS integrations
- multilingual support
- advanced dashboards

## Primary success question
Will restaurants accept this upload/generation workflow, and will real guests scan and engage with the result?

## Secondary success question
Can the product hide enough 3D complexity that a restaurant can use it without understanding 3D tooling?

## MVP target customer
Start with:
- one pilot restaurant
- visually distinctive dishes
- presentation-focused environment

Avoid starting with:
- giant menu catalogs
- cheap takeaway-first flows
- complex enterprise onboarding

## MVP user stories
### Guest
- As a guest, I can scan a QR code and open a dish page on my phone.
- As a guest, I can understand what the dish looks like before ordering.
- As a guest, I can view the dish in AR when supported.
- As a guest, I still get a useful 3D fallback when AR is unavailable.

### Restaurant admin
- As an admin, I can create a dish by uploading images instead of 3D files.
- As an admin, I can see whether generation is queued, processing, failed, or ready.
- As an admin, I can preview and retry before publishing.
- As an admin, I can get a QR code for the published dish.

## Required device behavior
### Must work
- modern iPhone browser
- modern Android browser
- public dish page loads without login
- 3D fallback works on mobile

### Nice if supported
- web/native AR path on supported devices

### Fallback rule
If AR is not supported or fails, the product must still feel complete and useful in plain 3D mode.

## MVP content assumptions
Each dish should have:
- 5-15 source images
- basic text metadata
- one generated poster image
- one generated or manually supplied preview asset

## Launch criteria
The MVP is launchable when:
- 1 restaurant exists in admin
- 3 dishes can be submitted for generation
- status lifecycle works
- ready dishes can be previewed and published
- each published dish has a public page
- each published dish has a QR code
- guest can see AR or 3D fallback
- analytics events are being recorded

## Explicit MVP tradeoff
The MVP optimizes for:
- product workflow validation
- speed to pilot
- operational realism

The MVP does NOT optimize for:
- scale
- perfect automation
- polished enterprise controls
