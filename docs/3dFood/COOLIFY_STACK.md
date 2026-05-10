# COOLIFY_STACK

## Goal
Describe the recommended MVP deployment stack using Coolify for app hosting, database, auth, storage, and workers.

## Recommended stack
### 1. Web app
- Nuxt 4 app
- deployed as application on Coolify
- serves admin portal and public dish pages

### 2. Database
- PostgreSQL on Coolify
- stores restaurants, users, dishes, jobs, QR refs, analytics

### 3. Auth
Preferred options:
- **Option A:** simple app-local auth for MVP if speed matters most
- **Option B:** Authentik on Coolify if you want externalized identity early

Recommendation:
- start with the simplest auth that still supports admin login cleanly
- if Authentik setup friction is high, do not let it block MVP

### 4. Storage
- S3-compatible object storage on Coolify
- MinIO is the natural candidate if available in your setup
- store source images, posters, generated assets, QR images

### 5. Background worker
- separate Node worker service on Coolify
- consumes generation jobs from DB or queue
- updates job status and dish assets

### 6. Queue/cache
- Redis optional but recommended if async jobs grow
- for tiny MVP, DB-backed polling queue is acceptable

## Deployment layout
### App services
- `popplate-web`
- `popplate-worker`

### Data services
- `popplate-postgres`
- `popplate-storage`
- `popplate-redis` (optional)
- `popplate-auth` (optional if Authentik)

## Domains
Suggested:
- `app.popplate.dk` or equivalent -> web app
- `auth.popplate.dk` -> auth service if externalized
- storage internal/private where possible

## Env vars (app)
- `DATABASE_URL`
- `APP_BASE_URL`
- `AUTH_MODE`
- `AUTH_SECRET`
- `S3_ENDPOINT`
- `S3_REGION`
- `S3_BUCKET`
- `S3_ACCESS_KEY`
- `S3_SECRET_KEY`
- `S3_FORCE_PATH_STYLE`

## Env vars (worker)
- `DATABASE_URL`
- `S3_ENDPOINT`
- `S3_REGION`
- `S3_BUCKET`
- `S3_ACCESS_KEY`
- `S3_SECRET_KEY`
- `GENERATION_PROVIDER`
- `GENERATION_CONCURRENCY`

## Coolify notes
- Coolify supports Nuxt applications
- Coolify supports PostgreSQL databases
- Coolify has one-click services including Authentik
- Coolify service catalog/docs indicate MinIO documentation exists, though service maintenance status should be checked before committing to it blindly

## Operational recommendation
For MVP, prioritize:
- one app
- one worker
- one Postgres
- one storage service

Only add Redis/Auth service complexity if clearly needed.