# Codebase Concerns

**Analysis Date:** 2026-05-21

## Tech Debt

**Missing File Cleanup on Upload/Generation Failures:**
- Issue: When image uploads succeed but dish creation fails, or when generation jobs fail, orphaned storage assets accumulate without cleanup
- Files: `server/api/upload/image.post.ts`, `server/api/dishes/[id]/generate.post.ts`, `worker/handlers/generate.ts`
- Impact: Unaccounted S3 storage costs; no lifecycle management for temporary files from failed attempts
- Fix approach: Implement cleanup handlers on error paths; wrap file operations with transaction rollback that cascades to S3 deletions; add daily garbage collection worker for orphaned assets

**No Database Transactions for Multi-Step Operations:**
- Issue: Image upload persists to storage first, then DB records—can leave orphaned S3 files if DB insert fails. Dish deletion manually cascades through multiple delete queries without transaction atomicity
- Files: `server/api/upload/image.post.ts`, `server/api/dishes/[id].delete.ts`, `server/api/restaurants/[slug].delete.ts`
- Impact: Data inconsistency between storage and database; partial deletions if failures occur mid-cascade
- Fix approach: Wrap all multi-step operations in database transactions; upload file only after DB record succeeds; use atomic delete cascades within a single transaction

**In-Memory Rate Limiting with Unbounded Growth:**
- Issue: `server/api/public/analytics.post.ts` uses in-memory Map to track rate limits, which can grow unbounded on high-traffic deployments
- Files: `server/api/public/analytics.post.ts` (lines 8-29)
- Impact: Memory leak on production; no distributed rate limiting across multiple worker instances
- Fix approach: Use Redis or database-backed rate limiting; implement TTL-based cleanup with hard limits; or switch to token bucket algorithm with time-based window reset

## Known Bugs

**Archived Status Not in Schema Definition:**
- Issue: Deletion endpoints reference `status: 'archived'` but the schema only defines specific statuses via text columns without enum or check constraints
- Files: `server/database/schema.ts` (lines 23, 55, 87 - status fields allow any text), `server/api/dishes/[id].delete.ts` (line 42), `server/api/restaurants/[slug].delete.ts` (line 40)
- Impact: Archived items can be queried but no UI exists to filter them; "archived" becomes orphaned state
- Workaround: Add check constraint `status IN ('draft', 'processing', 'ready', 'published', 'failed', 'archived')` to schema
- Fix approach: Add proper enum/check constraints; implement archive filter UI; or remove archive feature entirely and use hard delete

**Generation Job Stale Timeout Does Not Account for Network Latency:**
- Issue: `server/utils/generation-timeout.ts` uses hardcoded 30-minute timeout that starts from `startedAt` or `createdAt`, but doesn't account for long external API delays from Meshy
- Files: `server/utils/generation-timeout.ts` (line 5, 16), `worker/handlers/generate.ts` (lines 17, 68)
- Impact: Jobs timeout despite being sent to Meshy; no reliable feedback when external service is slow
- Trigger: High-load periods on Meshy API; large generation queue
- Workaround: Check `externalTaskId` presence before marking as STALE_TIMEOUT
- Fix approach: Use Meshy's `preceding_tasks` queue depth to adjust timeout dynamically; add separate timeout for external service vs. local processing

## Security Considerations

**No CSRF Protection on State-Changing Operations:**
- Risk: POST/PUT/DELETE endpoints don't verify origin or use CSRF tokens; vulnerable to cross-site request forgery
- Files: `server/api/dishes/[id]/generate.post.ts`, `server/api/dishes/[id]/publish.post.ts`, `server/api/restaurants/[slug].patch.ts`, and all mutation endpoints
- Current mitigation: Relies on authentication check and browser CORS (insufficient)
- Recommendations: Implement double-submit cookie pattern or CSRF token validation in Nuxt auth middleware; validate Origin header

**In-Memory Rate Limit Bypass:**
- Risk: Rate limiter can be bypassed by making requests from different IPs; no distributed state
- Files: `server/api/public/analytics.post.ts` (checkRateLimit function)
- Current mitigation: Per-IP limiting only
- Recommendations: Use Redis or database for distributed rate limits; implement per-sessionId limits; add DDoS protection layer (Cloudflare, etc.)

**Storage Keys Predictable:**
- Risk: Storage key construction is deterministic: `/{restaurantId}/{dishId}/{filename}` — attackers can enumerate and guess valid asset URLs
- Files: `server/utils/storage-keys.ts` (construct keys used in multiple endpoints)
- Current mitigation: Relies on UUIDs being hard to guess; signed URLs expire after 1 hour
- Recommendations: Add unpredictable component to storage keys; implement access log auditing; use presigned URLs exclusively for all asset access

**No Input Length Limits on Text Fields:**
- Risk: String fields like `name`, `shortDescription`, `ingredients` have no max length validation at API level
- Files: `server/api/dishes/index.post.ts` (name), `server/api/restaurants/index.post.ts` (name), `server/api/dishes/[id].put.ts` (all text fields)
- Current mitigation: Database schema uses `text` type (PostgreSQL unlimited)
- Recommendations: Add client-side validation; add API-level maxLength checks (e.g., name ≤ 200 chars); add database check constraints

**Sensitive Error Messages Leak Information:**
- Risk: 404 errors differentiate between "Dish not found" and "You don't own this dish"—reveals ownership information
- Files: `server/utils/dish-ownership.ts` (line 35, 39)
- Current mitigation: Only visible to authenticated users
- Recommendations: Return generic "Not found" for both cases; log actual reason internally

## Performance Bottlenecks

**Inefficient Slug Generation Loop:**
- Problem: Slug uniqueness check uses a while-true loop with individual DB queries per collision
- Files: `server/api/restaurants/index.post.ts` (lines 50-64)
- Cause: N+1 query pattern when slug is taken
- Improvement path: Use `SELECT 1 WHERE EXISTS` with LIKE pattern in single query; or use conflict resolution (INSERT...ON CONFLICT) with auto-incrementing suffix

**Stale Job Recovery Scans All Jobs on Every Poll:**
- Problem: `recoverStaleGenerationJobs()` runs on every poll cycle, checking all queued/processing jobs
- Files: `server/utils/generation-timeout.ts` (line 24-40), `worker/index.ts` (line 119)
- Cause: No index on `(status, createdAt)` or `(status, startedAt)` for efficient filtering
- Improvement path: Add composite index `ON generation_jobs(status, created_at)` and `ON generation_jobs(status, started_at)`; consider moving stale recovery to a separate maintenance job running once per hour

**Full Dish Hydration in Every Ownership Check:**
- Problem: `requireOwnedDish()` selects 16+ columns when only id, restaurantId, and ownership check needed
- Files: `server/utils/dish-ownership.ts` (lines 8-32)
- Impact: Unnecessary data transfer from DB; query takes longer with larger dish records
- Improvement path: Create lightweight `_checkOwnedDish()` that only returns id/restaurantId/ownerId; use eager load variant only where full data needed

**Missing Query Indexes:**
- Problem: Frequent lookups on `dishes.status`, `dishes.publicDishId`, `restaurants.slug` lack indexes
- Files: `server/database/schema.ts` (schema definition has no indexes)
- Impact: Table scans on every dish/restaurant fetch
- Improvement path: Add unique index on `publicDishId`, `slug`; add index on `status` for status-based queries

## Fragile Areas

**Job Status Reconciliation Logic:**
- Files: `server/utils/generation-timeout.ts`, `worker/handlers/generate.ts` (lines 43-68), `server/api/dishes/[id]/generate.post.ts`
- Why fragile: Multiple codepaths update dish.status independently (job completion, stale recovery, reconciliation). No single source of truth for status transitions
- Safe modification: Document all valid status transitions; add state machine validator; centralize status updates in single function
- Test coverage: No tests visible for status reconciliation under race conditions (concurrent stale recovery + job completion)

**Meshy API Integration Without Retry Logic:**
- Files: `worker/handlers/generate.ts`, `server/utils/meshy.ts`
- Why fragile: Calls to Meshy API are not retried on network failure; single timeout of 30 minutes includes all external latency
- Safe modification: Add exponential backoff retry (3 attempts) for transient errors; timeout only local processing; make max-attempts configurable
- Test coverage: No visible tests for Meshy API failures, timeouts, or malformed responses

**Deletion Cascade Without Cascade Constraints:**
- Files: `server/api/dishes/[id].delete.ts` (lines 23-26), `server/api/restaurants/[slug].delete.ts` (lines 59-63)
- Why fragile: Manual cascade deletes without ON DELETE CASCADE constraints; if one delete fails, rest are orphaned
- Safe modification: Add `ON DELETE CASCADE` to foreign keys in schema; wrap deletes in transaction; verify all referencing tables are covered
- Test coverage: No visible tests for partial deletion recovery

**QR Code Generation Fallback:**
- Files: `server/api/dishes/[id]/publish.post.ts` (lines 55-67)
- Why fragile: Falls back to data: URL if storage upload fails; no validation that fallback QR is actually used by client
- Safe modification: Make storage upload required; fail fast; or implement retry loop for upload
- Test coverage: Fallback path not tested; unclear if embedded QR actually renders

## Scaling Limits

**Single Worker Instance Bottleneck:**
- Current capacity: ~1 generation job per 5 seconds (POLL_INTERVAL_MS = 5000)
- Limit: Meshy API will queue hundreds of jobs, but worker will process them sequentially
- Scaling path: Spawn multiple worker processes; use job queue system (BullMQ, RabbitMQ); implement horizontal scaling with N workers

**In-Memory Rate Limit Map Unsharded:**
- Current capacity: 10,000 unique IPs per instance (RATE_LIMIT_MAP_MAX_SIZE)
- Limit: Single instance; no sharing across load-balanced server replicas
- Scaling path: Implement Redis-backed rate limiting; use distributed tracing middleware

**Database Connection Pooling:**
- Current capacity: Single postgres client connection (server/database/index.ts uses Proxy pattern)
- Limit: Under high load, connection pool will exhaust; no visible pool config
- Scaling path: Configure postgres connection pool in client settings; use connection pooler (PgBouncer); implement read replicas for analytics queries

**S3 Storage Operations Sequential:**
- Current capacity: Single file upload/download at a time per worker
- Limit: Multi-image generation waits for Meshy, then downloads GLB, then USDZ sequentially
- Scaling path: Parallelize asset downloads and uploads where possible; implement S3 batch operations; use multipart upload for large GLBs

## Dependencies at Risk

**@gltf-transform Version Locked to 4.3.0:**
- Risk: No patch updates; security fixes may be missed
- Files: `package.json` (line 20-22)
- Impact: Old dependencies accumulate technical debt; potential vulnerabilities in GLTF processing
- Migration plan: Update to latest stable 4.x; test GLB compression output; monitor for breaking changes

**postgres Driver Without Connection Validation:**
- Risk: Stale connections aren't validated; reconnection can hang
- Files: `server/database/index.ts` (uses raw postgres driver)
- Impact: Zombie connections; requests hang indefinitely
- Migration plan: Add idle timeout and health checks; consider using node-postgres with connection pooler

**Sharp Without Fallback:**
- Risk: Sharp is optional dependency; installation can fail on some systems (Python build tools)
- Files: `package.json` (line 31, used implicitly by GLTF Transform)
- Impact: Deployment failures on certain architectures (Alpine, etc.)
- Migration plan: Either make sharp required with prebuilt binaries, or implement fallback image processor

## Missing Critical Features

**No Soft Delete / Audit Trail:**
- Problem: Deleted dishes/restaurants are gone forever; no record of what was deleted or by whom
- Blocks: Compliance audits; recovering accidentally deleted content; forensics
- Workaround: Implement archive status (partially done but not integrated into UI)
- Priority: Medium — affects restaurants with data retention requirements

**No Bulk Operations:**
- Problem: Publishing/unpublishing or generating multiple dishes requires N API calls
- Blocks: Batch workflows; menu migrations
- Workaround: Client-side loop
- Priority: Low — mostly affects admin workflows

**No Webhook Notifications:**
- Problem: Generation completion is only detectable by polling
- Blocks: Real-time status updates without polling; integration with external systems
- Workaround: Client implements polling loop
- Priority: Medium — needed for quality of UX

**No Search or Filtering:**
- Problem: Fetching restaurants and dishes returns all; no pagination, sorting, or search
- Blocks: Restaurants with 100+ dishes; menu navigation; analytics filtering
- Impact: Database N+1 on large datasets; client-side filtering is inefficient
- Priority: High — needed before scaling to many restaurants

## Test Coverage Gaps

**No Tests for Error Paths:**
- What's not tested: Generation timeouts, Meshy API failures, storage upload failures, database transaction rollbacks, stale job recovery edge cases
- Files: `worker/handlers/generate.ts`, `server/utils/generation-timeout.ts`, `server/utils/storage.ts`, `server/api/upload/image.post.ts`
- Risk: Silent failures; partial state corruption; undetected data leaks
- Priority: High — these paths handle external dependencies

**No Tests for Authorization Boundaries:**
- What's not tested: User A accessing User B's dish; admin overrides; role-based access for tier checks
- Files: `server/utils/dish-ownership.ts`, `server/utils/restaurant-ownership.ts`, `server/utils/access.ts`
- Risk: Privilege escalation; unauthorized resource access
- Priority: Critical — security issue

**No Tests for Status Transitions:**
- What's not tested: Invalid state transitions (draft → published without ready); concurrent updates (race condition: stale timeout + successful job)
- Files: `server/utils/generation-timeout.ts`, `worker/handlers/generate.ts`, `server/api/dishes/[id]/generate.post.ts`
- Risk: Invalid dish states; data corruption
- Priority: High — core workflow feature

**No Tests for Rate Limiting:**
- What's not tested: Rate limit enforcement; bypass attempts; cleanup of expired entries
- Files: `server/api/public/analytics.post.ts`
- Risk: DDoS vulnerability; resource exhaustion
- Priority: Medium — affects production stability

**No Integration Tests:**
- What's not tested: End-to-end workflows (upload images → generate → publish → view); cleanup after failures
- Risk: Regressions on multi-step workflows; cascading failures
- Priority: High — catches integration issues

---

*Concerns audit: 2026-05-21*
