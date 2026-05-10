# ANALYTICS_SPEC

## Purpose
Define MVP analytics events clearly so agents do not invent their own meanings.

## Event model
Keep analytics simple in MVP.
Store raw event rows and show basic counts per dish.

## Required events
### `page_open`
Fire when the public dish page is opened successfully.

Payload:
- dishId
- restaurantId
- sessionId
- userAgent
- referrer
- timestamp

### `viewer_loaded`
Fire when the 3D viewer has successfully loaded enough to display the dish asset.
Not on button click alone.

Payload:
- dishId
- restaurantId
- sessionId
- timestamp

### `ar_launch_clicked`
Fire when the user actively triggers the AR action.
Do not wait for downstream OS/native confirmation.

Payload:
- dishId
- restaurantId
- sessionId
- timestamp

## Optional event
### `camera_permission_denied`
Useful if web AR path is used and permission is denied.
Optional for MVP.

## Session handling
- generate a lightweight anonymous session id in browser storage
- no personal data required
- no user account for guests

## Dashboard metrics for MVP
Per dish show:
- page opens
- viewer loads
- AR launch clicks

## Explicit non-goals
Do not build in MVP:
- complex funnels
- geo analytics
- cohort analysis
- marketing attribution
- unique-user dedup beyond lightweight session id
