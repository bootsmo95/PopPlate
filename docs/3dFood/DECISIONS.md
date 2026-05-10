# DECISIONS

## Locked MVP decisions

### Product flow
- Restaurants upload **images**, not finished 3D models.
- A background generation job creates the dish preview asset.
- Restaurants can preview, retry, and publish when ready.
- Each published dish gets one public QR destination.

### MVP scope
- MVP supports **one pilot restaurant** first.
- MVP supports **3-5 dishes**.
- MVP proves workflow + guest engagement, not perfect auto-3D quality.

### AR decision
- AR is **important**, but not launch-blocking on every device.
- If device/browser AR fails, fallback is a normal 3D viewer.
- The guest experience must still be useful without AR.

### Asset generation decision
- Generation pipeline may be **semi-manual** in MVP.
- The product UI should behave as if generation is a real async job.
- Internal handling may initially include manual review/replacement of generated assets.

### Routing decision
- Public QR route for MVP: `/d/[publicDishId]`
- Keep routes short and stable so dish names/slugs can change later.

### Deployment decision
- App hosting: Coolify
- Database: PostgreSQL on Coolify
- Auth: Coolify-hosted auth, preferably Authentik if not overkill
- Storage: Coolify-hosted S3-compatible storage, preferably MinIO if available/maintained in setup
- Background worker: separate worker service on Coolify

### Billing/roles decision
- "Paying user" in MVP is a role/flag, not a full billing system.
- No Stripe/subscription automation in MVP.

### Success decision
MVP success means:
- restaurant can create dish jobs and publish results
- guests can scan QR and see dish in AR or 3D
- analytics confirm real usage
- workflow is simple enough to repeat for more dishes
