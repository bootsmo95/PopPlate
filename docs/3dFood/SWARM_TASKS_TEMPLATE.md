# SWARM_TASKS_TEMPLATE

Use this when spawning agents manually.

## Agent task format
- **Task ID:**
- **Owner:**
- **Goal:**
- **Inputs:**
- **Dependencies:**
- **Definition of done:**
- **Out of scope:**
- **Update board:** `AGENT_SWARM_BOARD.md`

## Example
- **Task ID:** C3
- **Owner:** agent-upload-flow
- **Goal:** Build multi-image upload flow for dish creation.
- **Inputs:** `MVP_SPEC.md`, `ASSET_SPEC.md`, `DATA_MODEL.md`, `AGENT_SWARM_BOARD.md`
- **Dependencies:** B1, B3, A4
- **Definition of done:** Admin can upload 5-15 images, validation works, records persist, UI reflects success/failure.
- **Out of scope:** generation processing logic, public viewer, analytics.
- **Update board:** set task C3 to `IN_PROGRESS` at start and `DONE` when finished.
