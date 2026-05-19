# PopPlate — Coolify Deployment Guide

Step-by-step guide to deploy the PopPlate MVP on Coolify.

---

## Overview: What You Need to Create

| Service | Type | Purpose |
|---------|------|---------|
| **popplate-postgres** | Database | PostgreSQL for all app data |
| **popplate-minio** | Service | S3-compatible object storage for images/models/QR codes |
| **popplate-web** | Application | Nuxt app (admin + public pages) |
| **popplate-worker** | Application | Background job processor |

---

## Step 1: Create a PostgreSQL Database

1. In Coolify, go to your project → click **+ New** → **Database** → **PostgreSQL**
2. Give it a name: `popplate-postgres`
3. Set or note the generated credentials:
   - **Database name**: `popplate` (change from default if needed)
   - **Username**: `popplate`
   - **Password**: auto-generated (copy it)
4. Click **Deploy**
5. Once running, find the **Internal URL** on the database detail page — it looks like:
   ```
   postgresql://popplate:PASSWORD@popplate-postgres:5432/popplate
   ```
   **This is your `DATABASE_URL`.** Copy it.

> **Where to find it:** Database detail page → look for "Internal Connection URL" or construct it from the host/port/user/password shown.

---

## Step 2: Create MinIO (S3-Compatible Storage)

1. In Coolify, go to your project → click **+ New** → **Service** → search for **MinIO**
2. Give it a name: `popplate-minio`
3. Configure:
   - **Root User**: set a username (e.g., `popplate-admin`)
   - **Root Password**: set a strong password
4. Click **Deploy**
5. Once running, access the MinIO Console (the web UI URL shown in Coolify, usually on port 9001)
6. In the MinIO Console:
   - Go to **Buckets** → **Create Bucket**
   - Bucket name: `popplate-assets`
   - Click **Create**
   - Go to the bucket → **Access Policy** → set to **Public** (so guest browsers can load images/models directly)
7. Go to **Access Keys** → **Create Access Key**
   - Copy the **Access Key** and **Secret Key** — these are your S3 credentials

> **Where to find the values:**
> - `S3_ENDPOINT`: The MinIO API URL (port 9000, not 9001 console). Check Coolify service detail → look for the API port. Usually `http://popplate-minio:9000` (internal) or `https://minio.yourdomain.dk` if you set up a domain.
> - `S3_ACCESS_KEY_ID`: The access key you created in step 7
> - `S3_SECRET_ACCESS_KEY`: The secret key from step 7
> - `S3_BUCKET`: `popplate-assets`
> - `S3_REGION`: `us-east-1` (MinIO default, doesn't matter)
> - `S3_FORCE_PATH_STYLE`: `true` (required for MinIO)

> **Important for public access:** If you want guests to see images/3D models directly, MinIO needs a public-facing URL. In Coolify, add a domain to the MinIO service's API port (9000), e.g., `https://storage.popplate.dk`. This domain becomes your `S3_ENDPOINT` for public URLs.

---

## Step 3: Create the Web Application (popplate-web)

1. In Coolify, go to your project → click **+ New** → **Application**
2. Connect your Git repository (GitHub/GitLab/self-hosted)
3. Configure:
   - **Name**: `popplate-web`
   - **Branch**: `main` (or your deployment branch)
   - **Build Pack**: **Nixpacks** (auto-detects Nuxt)
   - **Port**: `3000`
   - **Install command**: `npm install`
   - **Build command**: `npm run build`
   - **Start command**: `node .output/server/index.mjs`
4. Add the domains `https://popplate.dk,https://api.popplate.dk,https://www.popplate.dk,https://app.popplate.dk`
5. Set up HTTPS (Coolify handles Let's Encrypt automatically)
6. **Add environment variables** (see table below)
7. Click **Deploy**

### Environment Variables for popplate-web

Set these in Coolify → Application → **Environment Variables**:

| Variable | Value | Where to find it |
|----------|-------|-------------------|
| `DATABASE_URL` | `postgresql://popplate:PASSWORD@popplate-postgres:5432/popplate` | Step 1 — internal connection URL |
| `NUXT_SESSION_PASSWORD` | Random 32+ char string | Generate with: `openssl rand -hex 32` |
| `ADMIN_EMAIL` | `admin@popplate.dk` (your email) | You choose this |
| `ADMIN_PASSWORD_HASH` | See below | Generated using the hash command below |
| `S3_ENDPOINT` | `https://storage.popplate.dk` or `http://popplate-minio:9000` | Step 2 — MinIO API URL |
| `S3_REGION` | `us-east-1` | Default for MinIO |
| `S3_BUCKET` | `popplate-assets` | The bucket you created in Step 2 |
| `S3_ACCESS_KEY_ID` | Your MinIO access key | Step 2 → Access Keys |
| `S3_SECRET_ACCESS_KEY` | Your MinIO secret key | Step 2 → Access Keys |
| `S3_FORCE_PATH_STYLE` | `true` | Always true for MinIO |
| `NUXT_PUBLIC_APP_URL` | `https://popplate.dk` | Canonical app/public URL |
| `NUXT_PUBLIC_API_URL` | `https://api.popplate.dk` | API alias for the same Nuxt backend |
| `AUTHENTIK_BASE_URL` | `https://auth.popplate.dk` | Authentik public URL |
| `NUXT_PUBLIC_AUTHENTIK_BASE_URL` | `https://auth.popplate.dk` | Authentik public URL |
| `AUTHENTIK_ISSUER` | `https://auth.popplate.dk/application/o/popplate/` | Authentik provider issuer |
| `AUTHENTIK_DISCOVERY_URL` | `https://auth.popplate.dk/application/o/popplate/.well-known/openid-configuration` | Authentik OIDC discovery URL |
| `AUTHENTIK_REDIRECT_URI` | `https://popplate.dk/api/auth/callback/authentik` | OIDC callback URL |
| `AUTHENTIK_LOGOUT_REDIRECT_URI` | `https://popplate.dk/` | Post-logout redirect |
| `NODE_ENV` | `production` | Standard |

### Generating the Admin Password Hash

Run this command locally (or in a Coolify terminal):

```bash
# Install the app dependencies first
npm install

# Then generate the hash
node -e "
import('nuxt-auth-utils/dist/runtime/server/utils/password.js')
  .then(m => m.hashPassword('YOUR_PASSWORD_HERE'))
  .then(console.log)
"
```

Replace `YOUR_PASSWORD_HERE` with your actual password. Copy the output and paste it as `ADMIN_PASSWORD_HASH`.

---

## Step 4: Run Database Migrations

After the web app deploys successfully, you need to run the initial migration.

**Option A: Via Coolify terminal**
1. Go to popplate-web → **Terminal** (or execute command)
2. Run:
   ```bash
   npx drizzle-kit migrate
   ```

**Option B: Add a pre-deploy command**
In Coolify app settings, add a pre-start script or configure the start command:
```bash
npx drizzle-kit migrate && node .output/server/index.mjs
```

---

## Step 5: Seed the First Restaurant

After migrations run, you need at least one restaurant record. Run via the Coolify terminal:

```bash
node -e "
import postgres from 'postgres';
const sql = postgres(process.env.DATABASE_URL);
await sql\`
  INSERT INTO restaurants (id, name, slug, status)
  VALUES (gen_random_uuid(), 'My Restaurant', 'my-restaurant', 'active')
  ON CONFLICT DO NOTHING
\`;
console.log('Restaurant created');
await sql.end();
"
```

Note the restaurant ID — or just log in to the admin and it will auto-discover it.

---

## Step 6: Create the Worker Application (popplate-worker)

1. In Coolify, go to your project → click **+ New** → **Application**
2. Connect the **same Git repository**
3. Configure:
   - **Name**: `popplate-worker`
   - **Branch**: same as web app
   - **Build Pack**: **Nixpacks**
   - **Install command**: `npm install`
   - **Build command**: `npm run build` (needed for dependencies)
   - **Start command**: `npx tsx worker/index.ts`
   - **Port**: `3000`
   - **Domain**: `https://worker.popplate.dk`
   - **Health check**: enable path `/healthz` on port `3000`
4. Set up environment variables (subset of web app):

| Variable | Value | Where to find it |
|----------|-------|-------------------|
| `DATABASE_URL` | Same as web app | Step 1 |
| `S3_ENDPOINT` | Same as web app | Step 2 |
| `S3_REGION` | `us-east-1` | Same |
| `S3_BUCKET` | `popplate-assets` | Same |
| `S3_ACCESS_KEY_ID` | Same as web app | Step 2 |
| `S3_SECRET_ACCESS_KEY` | Same as web app | Step 2 |
| `S3_FORCE_PATH_STYLE` | `true` | Same |
| `S3_PUBLIC_BASE_URL` | `https://storage.popplate.dk` | Public MinIO API URL |
| `WORKER_HEALTH_PORT` | `3000` | Matches Coolify exposed worker port |
| `NODE_ENV` | `production` | Standard |

5. Click **Deploy**

> The worker polls the database for generation jobs. In MVP mode, it runs a mock handler (3-second delay, placeholder URLs). When you integrate a real 3D generation API, you'll update `worker/handlers/generate.ts`.

---

## Step 7: Verify Everything Works

1. **Open your app**: Visit `https://popplate.dk` — you should see the PopPlate landing page
2. **Platform login**: Go to `https://popplate.dk/platform/login` — sign in through Authentik
3. **Create a dish**: Go to Dishes → Create New Dish → fill in details
4. **Upload images**: On the dish detail page, upload 5+ images
5. **Generate**: Click "Start Generation" — the worker should pick it up within 5 seconds
6. **Publish**: Once generation completes, click "Publish" — a QR code will be generated
7. **Test public page**: Open the public URL (shown after publish) on your phone
8. **Check analytics**: Back in admin, the dish detail page should show analytics counts

---

## Network Architecture Diagram

```
┌─────────────────────────────────────────────────┐
│                   Coolify Host                   │
│                                                  │
│  ┌──────────────┐    ┌───────────────────────┐  │
│  │ popplate-web │◄──►│  popplate-postgres     │  │
│  │  (Nuxt app)  │    │  (PostgreSQL)          │  │
│  │  port 3000   │    │  port 5432             │  │
│  └──────┬───────┘    └───────────┬────────────┘  │
│         │                        │               │
│         │            ┌───────────▼────────────┐  │
│         │            │  popplate-worker        │  │
│         │            │  (tsx background job)   │  │
│         │            │  no HTTP port           │  │
│         │            └────────────────────────┘  │
│         │                                        │
│  ┌──────▼───────┐                                │
│  │popplate-minio│                                │
│  │ (S3 storage) │                                │
│  │ API: 9000    │                                │
│  │ Console:9001 │                                │
│  └──────────────┘                                │
└─────────────────────────────────────────────────┘

External access:
  popplate.dk         → popplate-web:3000
  api.popplate.dk     → popplate-web:3000 (/api/* alias)
  auth.popplate.dk    → popplate-authentik:9000
  storage.popplate.dk → popplate-minio:9000 (public read)
  worker.popplate.dk  → popplate-worker:3000 (/healthz)
```

---

## Troubleshooting

### App won't start
- Check `DATABASE_URL` is correct — the most common issue
- Check `NUXT_SESSION_PASSWORD` is set and at least 32 characters
- Look at Coolify logs for the specific error

### Can't log in
- Verify `ADMIN_EMAIL` matches what you type
- Regenerate `ADMIN_PASSWORD_HASH` — make sure no extra whitespace

### Images don't load on public pages
- Verify MinIO bucket exists and is set to public access
- Check `S3_ENDPOINT` is the external URL (not internal) if guests need to see images
- Verify `S3_FORCE_PATH_STYLE=true`

### Generation never completes
- Check the worker is running (Coolify → popplate-worker → logs)
- Verify worker has the same `DATABASE_URL` as the web app
- The worker polls every 5 seconds — check logs for `[worker] Picked up job...`

### QR codes point to localhost
- Set `NUXT_PUBLIC_APP_URL` to your actual domain (`https://popplate.dk`)
- Redeploy after changing env vars

### Migrations fail
- Ensure `DATABASE_URL` is reachable from the app container
- Use the internal Coolify hostname (e.g., `popplate-postgres`), not `localhost`

---

## Security Checklist Before Going Live

- [ ] `NUXT_SESSION_PASSWORD` is random and at least 32 chars
- [ ] `ADMIN_PASSWORD_HASH` uses a strong password
- [ ] MinIO root credentials are not the defaults
- [ ] HTTPS is enabled on app and storage domains
- [ ] MinIO bucket is public read but NOT public write
- [ ] `NODE_ENV=production` is set on both web and worker
