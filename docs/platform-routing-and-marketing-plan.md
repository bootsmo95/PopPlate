# PopPlate platform routing and marketing plan

## Goal

Move restaurant-facing product routes from `/admin` to `/platform`, so `/admin` remains available later for PopPlate/operator administration such as editing other users' content.

## Scope

- Rename Nuxt page routes from `app/pages/admin/*` to `app/pages/platform/*`.
- Keep the existing `admin` layout name for now unless a broader layout rename is worth the churn; update visible copy from "Admin" to "Platform".
- Update middleware redirects and route guards to protect `/platform/*`.
- Update internal links from `/admin/*` to `/platform/*`.
- Add a public `/pricing` page describing available plans.
- Expand the public homepage into a product-focused first screen and supporting sections.
- Improve platform navigation enough that users can move naturally between overview, dishes, create dish, restaurant setup, and public/pricing pages.

## Proposed route map

- `/` - product homepage
- `/pricing` - plans and feature comparison
- `/platform/login` - platform login
- `/platform/signup` - platform signup
- `/platform` - platform overview
- `/platform/dishes` - dish list
- `/platform/dishes/new` - create dish
- `/platform/dishes/:id` - edit/manage dish
- `/platform/settings` - restaurant setup
- `/d/:publicDishId` - public guest dish experience
- `/m/*` - model/static proxy route

## UX notes

- Public nav should expose Product, Pricing, Login, and a primary "Start creating" action.
- Platform sidebar should include Overview, Dishes, New dish, Restaurant setup, and a public-site link.
- Copy should describe PopPlate as a restaurant tool for turning menu items into interactive 3D/AR dish previews.
- Plan content should map to current tier names: Free, Basic, Pro.

## Verification

- Run a route/link grep for stale `/admin` references after the rename.
- Run typecheck/build if available; otherwise run `npm run build`.
- Manually inspect the key page files for layout and mobile overflow risks.
