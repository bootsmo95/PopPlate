# PopPlate

PopPlate is a restaurant platform for turning dish photos into hosted 3D/AR menu experiences.

## Current Demo Flow

- Sign in through Authentik
- Create a restaurant
- Create a dish
- Upload source images
- Generate a 3D model through Meshy
- Store source images, generated models, posters, and QR codes in S3-compatible storage
- Publish a public dish page with QR and AR/model viewer support

## Required Services

- Postgres
- Authentik / OIDC
- Meshy API
- S3-compatible object storage

For the current Coolify-first setup, use MinIO as the S3-compatible storage service.

## Coolify MinIO Storage

PopPlate expects these environment variables in both the web app and worker:

```env
S3_ENDPOINT=http://minio:9000
S3_PUBLIC_BASE_URL=https://storage.example.com
S3_REGION=us-east-1
S3_BUCKET=popplate-assets
S3_ACCESS_KEY_ID=your-access-key-id
S3_SECRET_ACCESS_KEY=your-secret-access-key
S3_FORCE_PATH_STYLE=true
```

`S3_ENDPOINT` can be the internal Coolify service URL used by the app and worker.
`S3_PUBLIC_BASE_URL` must be a public HTTPS URL that Meshy and browsers can access.
For the Coolify demo setup, point it at the MinIO API domain, for example
`https://storage.example.com`.

The MinIO bucket should allow public object downloads while keeping bucket listing disabled.
Source images must be externally reachable because Meshy pulls them directly during generation.

PopPlate also includes a `/storage/*` proxy route as a fallback for private object access, but direct MinIO public URLs are preferred for the demo.

## Scripts

```bash
npm run build
npm run dev
npm run db:migrate
npm run worker:start
```

## Worker Health

The worker exposes a lightweight health endpoint for Coolify and manual checks:

```bash
curl http://localhost:3001/healthz
```

Set `WORKER_HEALTH_PORT` to choose the port. Use `WORKER_HEALTH_PORT=0` to disable it.

## Notes

- The web app handles admin and public pages.
- The worker processes queued generation jobs and uploads generated assets to storage.
- Public model assets are served through `/m/:publicDishId.glb`, `/m/:publicDishId.usdz`, and `/m/:publicDishId.png`.
