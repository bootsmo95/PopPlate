# Technology Stack

**Analysis Date:** 2026-05-21

## Languages

**Primary:**
- TypeScript 5.x+ - Full codebase, strict mode enabled via `tsconfig.json`
- JavaScript - Build scripts and configuration files

**Secondary:**
- CSS/Tailwind - Styling via `@nuxtjs/tailwindcss` module
- HTML - Vue templates

## Runtime

**Environment:**
- Node.js (version not pinned, uses `.nvmrc` or defaults to latest LTS)

**Package Manager:**
- npm
- Lockfile: `package-lock.json` present and current

## Frameworks

**Core:**
- Nuxt 4.4.4 - Full-stack Vue framework with SSR enabled, isomorphic server/client
- Vue 3.5.33 - Progressive UI framework
- Vue Router 5.0.6 - Client-side routing (auto-configured by Nuxt)

**Testing:**
- Not detected (no Jest, Vitest, or test runner configured)

**Build/Dev:**
- Nuxt Build System - `nuxt build`, `nuxt dev`, `nuxt generate` commands
- TSX 4.21.0 - TypeScript execution for worker scripts
- Drizzle Kit 0.31.10 - Database migration and schema generation

**Styling:**
- Tailwind CSS (via `@nuxtjs/tailwindcss` 6.14.0) - Utility-first CSS
- Config: `tailwind.config.ts` with custom warm color palette (clay, ink, status tokens)
- Custom CSS: `app/assets/css/main.css`

## Key Dependencies

**Critical:**
- `drizzle-orm` 0.45.2 - PostgreSQL ORM for type-safe database queries
- `@aws-sdk/client-s3` 3.1045.0 - S3/MinIO compatible object storage client
- `@aws-sdk/s3-request-presigner` 3.1045.0 - Presigned URL generation for S3 downloads
- `postgres` 3.4.9 - PostgreSQL driver for Drizzle
- `nuxt-auth-utils` 0.5.29 - Built-in Nuxt session/auth utilities
- `sharp` 0.34.5 - Image processing for posterization during model generation

**3D & Rendering:**
- `@gltf-transform/core` 4.3.0 - glTF 2.0 model transformation and compression
- `@gltf-transform/extensions` 4.3.0 - glTF extension support (materials, LOD, etc.)
- `@gltf-transform/functions` 4.3.0 - High-level glTF optimization functions
- `@google/model-viewer` 4.2.0 - 3D model viewer web component for AR preview

**Utilities:**
- `nanoid` 5.1.11 - Secure random ID generation for public dish IDs
- `qrcode` 1.5.4 - QR code generation for dish publication
- `@types/qrcode` 1.5.6 - TypeScript types for qrcode library

## Configuration

**Environment:**
- Configuration via environment variables loaded by Nuxt
- `.env.example` documents all required variables
- `.env` file present but secrets not committed (in `.gitignore`)
- Runtime config in `nuxt.config.ts`: `runtimeConfig.public` for client-safe values

**Build:**
- `tsconfig.json` - TypeScript strict mode enabled
- `drizzle.config.ts` - Database schema and migration paths
- `nuxt.config.ts` - Nuxt features (Tailwind, auth-utils, experimental view transitions, SSR enabled)
- `.nuxt/` directory - Build artifacts (not committed)

## Platform Requirements

**Development:**
- Node.js 18+ (npm compatible)
- PostgreSQL 12+ client library (via `postgres` driver)
- Bash shell for dev/worker scripts

**Production:**
- Node.js 18+ runtime
- PostgreSQL 12+ database
- S3-compatible object storage (MinIO or AWS S3)
- Authentik or OpenID Connect provider
- Meshy AI API key for 3D generation
- Separate worker process for background jobs (via `npm run worker:start`)

## Optional Features

**View Transitions:**
- Experimental view transition API enabled in `nuxt.config.ts`

**Model Viewer Integration:**
- Custom element registration for `<model-viewer>` (Google's 3D web component)
- Support for `.glb` and `.usdz` model formats

---

*Stack analysis: 2026-05-21*
