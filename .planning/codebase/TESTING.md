# Testing Patterns

**Analysis Date:** 2026-05-21

## Test Framework

**Status:** Not implemented

**No test infrastructure detected:**
- No `jest.config.ts`, `vitest.config.ts`, or test runner configuration
- No test files (`.test.ts`, `.spec.ts`, `.test.tsx`, `.spec.tsx`) found in codebase
- No testing dependencies in `package.json` (no Jest, Vitest, or testing-library)
- No test scripts in package.json (only build, dev, db, and worker scripts)

**Current approach:** Manual testing only

## When Tests Are Needed (Guidance for Future)

### Unit Testing Candidates

**Utility Functions:**
- `/c/repos/PopPlate/server/utils/storage.ts` - S3 operations with env var validation
- `/c/repos/PopPlate/server/utils/auth.ts` - Session and authentication logic
- `/c/repos/PopPlate/app/lib/analytics/events.ts` - Event tracking with session management

**Composables:**
- `/c/repos/PopPlate/app/composables/useAuth.ts` - Auth state and navigation
- `/c/repos/PopPlate/app/composables/useAuthFetch.ts` - Server-side header handling

**Validation Logic:**
- File validation in `/c/repos/PopPlate/app/components/admin/ImageUploader.vue` (MIME type, size, extension checks)
- Dish field validation in `/c/repos/PopPlate/server/api/dishes/[id].put.ts` (scale range 0-200cm)

### Integration Testing Candidates

**API Routes:**
- `/c/repos/PopPlate/server/api/auth/` - Login/signup/logout flows with Authentik integration
- `/c/repos/PopPlate/server/api/dishes/[id]/generate.post.ts` - Generation job creation with database transaction
- `/c/repos/PopPlate/server/api/dishes/[id]/publish.post.ts` - Publishing with QR code generation and fallback handling

**Database Operations:**
- Dish CRUD in `/c/repos/PopPlate/server/api/dishes/` - Create, read, update, delete operations
- Restaurant ownership checks in `/c/repos/PopPlate/server/utils/dish-ownership.ts`

### End-to-End Testing Candidates

**User Workflows:**
- Image upload flow: `/c/repos/PopPlate/app/components/admin/ImageUploader.vue` → `/api/upload/image`
- Dish editing: Load → Modify fields → Save with validation
- Generation workflow: Upload images → Start generation → Poll for status
- Publishing: Generate → Publish → Access public menu link

## Test Structure Example (for future implementation)

**Expected pattern (Vitest + Vue Test Utils):**

```typescript
// Test file location: app/composables/__tests__/useAuth.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useAuth } from '../useAuth'

describe('useAuth', () => {
  it('should return authenticated user after fetchUser', async () => {
    // Setup
    const { fetchUser, authUser } = useAuth()

    // Act
    await fetchUser()

    // Assert
    expect(authUser.value?.email).toBe('user@example.com')
  })
})
```

**Expected pattern (Drizzle API testing):**

```typescript
// Test file location: server/api/dishes/__tests__/[id].put.test.ts
import { describe, it, expect } from 'vitest'
import { db } from '../../database/index'

describe('PUT /api/dishes/[id]', () => {
  it('should reject scaleCm > 200', async () => {
    const body = { scaleCm: 250 }

    // Should throw createError with status 400
    expect(() => validateScale(250)).toThrow()
  })
})
```

## Error Handling in Tests (Expected Patterns)

When tests are implemented, follow these patterns observed in production code:

**Server-side errors:**
```typescript
// Should test that createError is thrown with proper statusCode
expect(() => handler(event)).rejects.toThrow(createError({
  statusCode: 400,
  message: 'Invalid input'
}))
```

**Client-side errors:**
```typescript
// Should test error message extraction pattern
const err = { data: { message: 'Upload failed' } }
const message = err?.data?.message ?? err?.message ?? 'default'
expect(message).toBe('Upload failed')
```

**Fire-and-forget scenarios (analytics):**
```typescript
// Should verify errors are caught and don't propagate
expect(() => trackEvent(...)).not.toThrow()
```

## Mocking Strategy (Guidance for Future)

**What to Mock:**
- `/api/upload/image` endpoint in image uploader tests
- `/api/dishes/[id]/generate.post` in generation flow tests
- `sessionStorage` in analytics tests
- External S3 client in storage utility tests
- Database queries in route tests (use test database or in-memory)

**What NOT to Mock:**
- Type validation logic (test as real)
- Local Vue ref/computed state (test reactivity)
- Error message formatting (test exact strings)

## Coverage Targets (When Tests Are Added)

**High Priority (business-critical):**
- Auth flows (login, logout, session validation) - currently in `/c/repos/PopPlate/server/utils/auth.ts`
- Permission checks (dish ownership, restaurant ownership) - currently in `/c/repos/PopPlate/server/utils/dish-ownership.ts`
- File validation (MIME type, size) - currently in ImageUploader
- Database transactions (publish flow with QR fallback) - in `/c/repos/PopPlate/server/api/dishes/[id]/publish.post.ts`

**Medium Priority:**
- API error responses (400, 401, 404, 410)
- Form validation (dish scale range)
- Analytics event tracking (error resilience)

**Lower Priority:**
- UI state transitions (loading, success, error states)
- Component rendering (unless business logic is involved)

## Run Commands (When Framework Is Chosen)

**Example for Vitest:**
```bash
npm run test              # Run all tests
npm run test:watch       # Watch mode
npm run test:coverage    # Generate coverage report
```

**Example for Jest:**
```bash
npm run test              # Run all tests
npm run test:watch       # Watch mode
npm run test:coverage    # Generate coverage report
```

## Notes on Current Testing Gaps

1. **No auth testing** - Authentik integration, session management, and permission checks are untested
2. **No file upload testing** - Critical image upload and validation logic lacks tests
3. **No database testing** - Drizzle ORM queries, transactions, and data consistency untested
4. **No API contract testing** - Route handlers and error responses are manual-test only
5. **No type safety tests** - TypeScript strict mode catches some issues, but no runtime type validation tests

---

*Testing analysis: 2026-05-21*
