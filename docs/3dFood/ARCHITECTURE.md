# ARCHITECTURE

## Goal
Define a practical MVP architecture for 3dFood around image upload, background generation, preview/retry, publish, QR, and guest AR/3D viewing.

## Recommended stack
### Frontend
- Nuxt 4
- Vue 3
- TypeScript
- Tailwind CSS
- PlayCanvas integration for 3D fallback/viewing

### Backend
- Nuxt server routes for MVP
- PostgreSQL on Coolify
- Coolify-hosted auth strategy
- S3-compatible storage on Coolify
- separate worker process for generation jobs

### 3D / AR
- source input: multiple photos
- preview output: GLB for web fallback
- optional iOS AR output: USDZ
- guest experience prefers AR when supported, otherwise 3D viewer

## High-level system flow
1. Admin logs into portal
2. Admin creates dish and uploads source photos
3. Backend stores dish draft + photos
4. Backend creates GenerationJob
5. Worker processes job asynchronously
6. Worker writes preview assets + poster + status
7. Admin previews result and may retry
8. Admin publishes dish
9. System creates/stores QR target
10. Guest scans QR and opens public page
11. Public page attempts AR flow or falls back to 3D viewer
12. Analytics events are recorded

## Core modules
### 1. Admin portal
Responsibilities:
- login
- dish create/edit flow
- image upload
- status display
- preview
- retry
- publish
- QR retrieval

### 2. Public dish experience
Responsibilities:
- render dish page
- request camera/AR only when relevant
- provide 3D fallback
- send analytics events

### 3. Generation subsystem
Responsibilities:
- queue generation job
- process source images
- write output assets
- store failure reason
- support retries

### 4. Asset storage
Responsibilities:
- store source images
- store generated preview models
- store posters
- store optional QR image exports

### 5. Analytics service
Responsibilities:
- record page/viewer/AR events
- aggregate simple counts for admin

## Suggested route design
### Public
- `/d/[publicDishId]` -> public QR destination

### Admin
- `/admin`
- `/admin/dishes`
- `/admin/dishes/new`
- `/admin/dishes/[id]`

## Job state model
- `queued`
- `processing`
- `failed`
- `ready`
- `cancelled`

## Dish publish state model
- `draft`
- `processing`
- `failed`
- `ready`
- `published`
- `archived`

## Storage structure suggestion
- `restaurants/{restaurantId}/dishes/{dishId}/source/*`
- `restaurants/{restaurantId}/dishes/{dishId}/generated/*`
- `restaurants/{restaurantId}/dishes/{dishId}/qr/*`

## Security basics
- authenticated admin routes only
- upload validation on count/type/size
- signed or controlled storage access
- no guest auth required
- rate-limit public analytics ingest if needed

## Recommended implementation choice
For MVP, prefer:
- one Nuxt app
- one worker service
- one Postgres
- one storage service

Reason:
- fewer moving parts
- easier Coolify deployment
- easier agent coordination
- easier to fake/semi-manual generation behind a stable product flow
