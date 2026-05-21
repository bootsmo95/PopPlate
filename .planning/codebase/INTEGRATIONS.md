# External Integrations

**Analysis Date:** 2026-05-21

## APIs & External Services

**3D Model Generation:**
- Meshy AI - Converts multi-image inputs to 3D models
  - SDK/Client: Native `fetch` calls (not a package)
  - Auth: `MESHY_API_KEY` environment variable
  - Base URL: `https://api.meshy.ai`
  - Endpoints: `/openapi/v1/image-to-3d`, `/openapi/v1/multi-image-to-3d`
  - Response includes: `taskId`, model URLs (glb, usdz, fbx, obj), thumbnail, progress, status
  - Integration file: `server/utils/meshy.ts`

**Authentication & Identity:**
- Authentik / OpenID Connect
  - SDK/Client: Native `fetch` + Nuxt session utils
  - Auth: OAuth2 code exchange via `AUTHENTIK_CLIENT_SECRET`
  - Discovery: `AUTHENTIK_DISCOVERY_URL` (defaults to `AUTHENTIK_ISSUER/.well-known/openid-configuration`)
  - Endpoints: Authorization, token, userinfo, logout (`end_session_endpoint`)
  - Claims mapping: Roles/groups from custom claims (`AUTHENTIK_CLAIM_ROLES`, `AUTHENTIK_CLAIM_GROUPS`)
  - Integration file: `server/utils/authentik.ts`
  - OAuth callback: `server/api/auth/callback/authentik.get.ts`
  - User sync: Upserts users to DB with email, display name, role, account tier from Authentik claims

## Data Storage

**Databases:**
- PostgreSQL 12+
  - Connection: `DATABASE_URL` environment variable (e.g., `postgresql://user:password@localhost:5432/popplate`)
  - Client: `postgres` package (3.4.9)
  - ORM: Drizzle ORM (0.45.2)
  - Schema: `server/database/schema.ts` (restaurants, users, dishes, dishSourceImages, generationJobs, analytics)
  - Migrations: Drizzle Kit manages via `drizzle.config.ts`, output to `server/database/migrations/`

**File Storage:**
- S3-compatible object storage (AWS S3 or MinIO)
  - Service: S3API or MinIO via Coolify
  - Connection: `S3_ENDPOINT` (internal service URL), `S3_PUBLIC_BASE_URL` (public HTTPS URL)
  - Credentials: `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`
  - Bucket: `S3_BUCKET` (default: `popplate-assets`)
  - Region: `S3_REGION` (default: `us-east-1`)
  - Client: `@aws-sdk/client-s3` (3.1045.0)
  - Force path-style URLs: `S3_FORCE_PATH_STYLE=true` (required for MinIO)
  - Operations: Upload, download (presigned URLs), delete
  - Integration file: `server/utils/storage.ts`
  - Supported mime types: `image/jpeg`, `image/png`, `image/webp`
  - Max file size: 10 MB (enforced in `server/api/upload/image.post.ts`)

**Caching:**
- None currently implemented

## Authentication & Identity

**Auth Provider:**
- Authentik / OpenID Connect
  - Implementation: OAuth2 authorization code flow with PKCE
  - Session: Nuxt session tokens stored in HTTP-only cookies (via `nuxt-auth-utils`)
  - Password hashing: Not used for Authentik (placeholder: `'oidc:authentik'`), bcrypt for legacy local auth
  - Role mapping: Claims → admin/viewer/user roles based on `AUTHENTIK_ADMIN_ROLE_VALUES`, `AUTHENTIK_VIEWER_ROLE_VALUES`
  - Account tier mapping: `account_tier` or `accountTier` claim → free/basic/pro tier
  - Login endpoints: `server/api/auth/authentik/login.get.ts`, `server/api/auth/authentik/signup.get.ts`
  - Logout: `server/api/auth/authentik/logout.get.ts` with post-logout redirect

**Session Management:**
- Encryption: `NUXT_SESSION_PASSWORD` (must be ≥32 characters, required for production)
- Cookie settings: HTTP-only, sameSite strict
- User context: `user.id`, `user.email`, `user.displayName`, `user.role`, `user.accountTier`

**Legacy Auth (deprecated):**
- Custom admin email/password login via `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`
- Used only when Authentik is not configured
- Stored in database, compared via bcrypt

## Monitoring & Observability

**Error Tracking:**
- Not detected (no Sentry, DataDog, or error tracking service)

**Logs:**
- Console logging to stdout
- Worker polling/job status logged in `worker/index.ts`
- API errors logged via Nuxt error handling

**Health Checks:**
- Worker exposes health endpoint on configurable port (`WORKER_HEALTH_PORT`, default 3001)
- Endpoint: `GET /healthz` returns job processing status and timestamps

## CI/CD & Deployment

**Hosting:**
- Coolify (inferred from docs and env examples)
- Targets: `popplate.dk` (web app), `api.popplate.dk` (API alias), `auth.popplate.dk` (Authentik), `storage.popplate.dk` (MinIO)

**CI Pipeline:**
- Not detected (no GitHub Actions, GitLab CI, or Jenkins config)

**Build Commands:**
- `npm run build` - Production build via Nuxt
- `npm run dev` - Development server with hot reload
- `npm run generate` - Static generation (if needed)
- `npm run preview` - Preview production build locally
- `npm run worker:start` - Run background job worker
- `npm run worker:dev` - Watch mode for worker development
- `npm run db:generate` - Generate migration files
- `npm run db:migrate` - Apply migrations to database
- `npm run db:studio` - Drizzle Studio UI for database inspection

## Environment Configuration

**Required env vars:**
- `DATABASE_URL` - PostgreSQL connection string
- `S3_ENDPOINT` - Internal S3/MinIO endpoint
- `S3_PUBLIC_BASE_URL` - Public HTTPS URL for S3 assets
- `S3_REGION` - AWS region (or MinIO region)
- `S3_BUCKET` - S3 bucket name
- `S3_ACCESS_KEY_ID` - S3 access credentials
- `S3_SECRET_ACCESS_KEY` - S3 secret key
- `S3_FORCE_PATH_STYLE` - Set to `'true'` for MinIO
- `NUXT_SESSION_PASSWORD` - Session encryption key (≥32 characters)
- `AUTHENTIK_BASE_URL` - Authentik server URL
- `AUTHENTIK_ISSUER` - OIDC issuer URL
- `AUTHENTIK_DISCOVERY_URL` - OIDC discovery endpoint
- `AUTHENTIK_CLIENT_ID` - OAuth2 client ID
- `AUTHENTIK_CLIENT_SECRET` - OAuth2 client secret
- `AUTHENTIK_REDIRECT_URI` - OAuth2 callback URL
- `AUTHENTIK_LOGOUT_REDIRECT_URI` - Post-logout redirect URL
- `MESHY_API_KEY` - Meshy AI API key for 3D generation

**Optional env vars:**
- `NUXT_PUBLIC_APP_URL` - Public app URL (default: `http://localhost:3000`)
- `NUXT_PUBLIC_API_URL` - Public API URL (default: `http://localhost:3000`)
- `NUXT_PUBLIC_AUTHENTIK_BASE_URL` - Public Authentik URL (for client-side redirects)
- `WORKER_HEALTH_PORT` - Worker health check port (default: 3001, set to 0 to disable)
- `AUTHENTIK_SIGNUP_URL` - Custom signup flow URL (optional, defaults to Authentik authorization)
- `AUTHENTIK_CLAIM_GROUPS` - Claims key for group/role mapping (default: `'groups'`)
- `AUTHENTIK_CLAIM_ROLES` - Claims key for role mapping (default: `'roles'`)
- `AUTHENTIK_ADMIN_ROLE_VALUES` - CSV of values that map to admin role (default: `'admin'`)
- `AUTHENTIK_VIEWER_ROLE_VALUES` - CSV of values that map to viewer role (default: `'viewer,user'`)
- `AUTHENTIK_DEFAULT_ROLE` - Fallback role if no role in claims
- `AUTHENTIK_DEFAULT_ACCOUNT_TIER` - Fallback account tier if no tier in claims (default: `'free'`)
- `ADMIN_EMAIL` - Legacy admin email (deprecated)
- `ADMIN_PASSWORD_HASH` - Legacy admin password hash (deprecated)

**Secrets location:**
- Environment variables stored in `.env` (not committed, in `.gitignore`)
- In Coolify: Set via service environment settings
- In development: Copy `.env.example` → `.env` and fill in values

## Webhooks & Callbacks

**Incoming:**
- Authentik OAuth2 callback: `server/api/auth/callback/authentik.get.ts` (receives `code` and `state` query params)
- Meshy polling (not webhook): Worker polls job status at `POLL_INTERVAL_MS` (5000ms)

**Outgoing:**
- None detected (no webhooks sent to external services)
- Worker polls Meshy API for job status updates asynchronously

---

*Integration audit: 2026-05-21*
