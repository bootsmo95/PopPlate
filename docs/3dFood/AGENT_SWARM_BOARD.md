# AGENT_SWARM_BOARD

Purpose: coordinate multiple agents without duplicate work.

## Rules
- Before starting a task, an agent must claim it by filling `Owner` and changing `Status` from `TODO` to `IN_PROGRESS`.
- Only one owner per task unless explicitly marked `PAIR`.
- When done, set status to `DONE` and add a short result note.
- If blocked, set status to `BLOCKED` and describe the blocker.
- Do not start a task that already has `IN_PROGRESS` unless the note explicitly asks for help.
- If a task depends on another, respect the dependency.

## Status values
- `TODO`
- `IN_PROGRESS`
- `BLOCKED`
- `DONE`

## Task board

| ID | Task | Depends On | Owner | Status | Notes / Result |
|---|---|---|---|---|---|
| A1 | Lock final MVP decisions into docs | - |  | TODO | Confirm AR fallback, route format, auth/storage choice level |
| A2 | Finalize data model and DB schema draft | A1 |  | TODO | Use `DATA_MODEL.md` as source |
| A3 | Define generation job lifecycle and retry semantics | A1 |  | TODO | queued/processing/failed/ready/cancelled |
| A4 | Define asset capture/upload validation rules | A1 |  | TODO | Use `ASSET_SPEC.md` |
| A5 | Define analytics event contract | A1 |  | TODO | Use `ANALYTICS_SPEC.md` |
| B1 | Scaffold Nuxt 4 app in repo | A1 |  | TODO | Base app + TS + Tailwind |
| B2 | Set up Coolify deployment docs/env template | A1 |  | TODO | Use `COOLIFY_STACK.md` |
| B3 | Implement DB schema/migrations | A2 |  | TODO | Restaurant, User, Dish, DishSourceImage, GenerationJob, QrCode, AnalyticsEvent |
| B4 | Implement auth foundation | A1 |  | TODO | Keep simple if Authentik slows MVP |
| C1 | Build admin login and shell | B1, B4 |  | TODO | Admin layout only |
| C2 | Build dish create/edit flow | B1, B3 |  | TODO | Name + metadata + status UI |
| C3 | Build multi-image upload flow | B1, B3, A4 |  | TODO | 5-15 image rules |
| C4 | Build generation status + retry UI | C2, A3 |  | TODO | Show active/latest job |
| C5 | Build publish/unpublish + QR UI | C2, B3 |  | TODO | QR after publish |
| D1 | Build worker service skeleton | B1, B3, A3 |  | TODO | Job pickup + status update |
| D2 | Build storage integration | B1, B3 |  | TODO | Source + generated asset paths |
| D3 | Implement semi-manual generation hook/path | D1, D2 |  | TODO | Support MVP reality if auto gen not ready |
| E1 | Build public dish page | B1, B3 |  | TODO | `/d/[publicDishId]` |
| E2 | Integrate 3D viewer fallback | E1 |  | TODO | PlayCanvas or wrapper |
| E3 | Implement AR entry logic | E1 |  | TODO | Fallback-safe |
| E4 | Implement analytics event capture | E1, A5 |  | TODO | page_open/viewer_loaded/ar_launch_clicked |
| F1 | Wire admin preview to generated output | C4, D2, E2 |  | TODO | Preview before publish |
| F2 | QA guest flow on mobile targets | E1, E2, E3 |  | TODO | iPhone + Android |
| F3 | QA admin flow end-to-end | C1, C2, C3, C4, C5 |  | TODO | Draft -> processing -> ready -> publish |
| G1 | Prepare pilot content checklist | A4 |  | TODO | Restaurant photo capture instructions |
| G2 | Prepare deployment checklist for Coolify | B2, B3, D1, D2 |  | TODO | App + worker + DB + storage |

## Suggested parallelization
### Lane 1 - Product/spec
- A1
- A2
- A3
- A4
- A5

### Lane 2 - Platform/foundation
- B1
- B2
- B3
- B4

### Lane 3 - Admin UX
- C1
- C2
- C3
- C4
- C5

### Lane 4 - Worker/storage
- D1
- D2
- D3

### Lane 5 - Guest UX
- E1
- E2
- E3
- E4

### Lane 6 - QA/pilot
- F1
- F2
- F3
- G1
- G2
