# Project Retrospective

*A living document updated after each milestone. Lessons feed forward into future planning.*

## Milestone: v1.0 — MVP

**Shipped:** 2026-05-22
**Phases:** 3 | **Plans:** 7 | **Sessions:** 3

### What Was Built
- Generation tracking with tier-based monthly limits (free/pro/studio tiers enforced at API level)
- Analytics dashboard with menu views, dish popularity, QR scan tracking, and time-period controls
- UI polish layer: toast notifications, ActionButton loading spinners, structured empty states, global error boundary

### What Worked
- Wave-based parallel execution: Plans 01 and 03 ran simultaneously in Wave 1, cutting total time
- Pattern-first planning: establishing UI patterns in Plan 01 made Plan 02 (wiring) straightforward
- Code review + auto-fix pipeline caught 4 real bugs (timer leak, non-null assertion, missing error handler, loading state stuck)
- Danish-first copywriting decided upfront in discuss-phase, eliminating translation decisions during execution

### What Was Inefficient
- Worktree merge process required manual intervention when sandbox blocked git commits from subagents
- Three verification reports flagged `human_needed` but no manual testing was performed — deferred to post-close
- UIPOL-03 and UIPOL-04 requirements left unchecked in REQUIREMENTS.md despite being implemented

### Patterns Established
- `useToast()` composable with `useState` for SSR-safe global toast state
- `ActionButton` component: spinner-replaces-text loading pattern with variant/size props
- p-card empty state pattern: icon + heading + body + CTA
- Hybrid feedback: inline validation for forms, toast for async action results
- Error extraction: `e?.data?.message ?? 'Noget gik galt — prov igen'` fallback pattern

### Key Lessons
1. Timer handles in composables need cleanup maps — even "harmless" leaks become real bugs when state scoping changes
2. Always use `finally` for loading state reset — catch blocks don't guarantee the happy path's cleanup runs
3. Code review auto-fix is high-value: 4/4 warnings fixed automatically with atomic commits

### Cost Observations
- Model mix: 100% opus (all phases used opus for planning and execution)
- Sessions: 3 (discuss+plan+execute per phase, batched)
- Notable: 7 plans completed in ~26 minutes total execution time (~3.7min/plan average)

---

## Cross-Milestone Trends

### Process Evolution

| Milestone | Sessions | Phases | Key Change |
|-----------|----------|--------|------------|
| v1.0 | 3 | 3 | Established discuss -> plan -> execute pipeline with wave parallelism |

### Cumulative Quality

| Milestone | Tests | Coverage | Code Review Findings |
|-----------|-------|----------|---------------------|
| v1.0 | 0 | 0% | 4 warnings, 0 critical (all fixed) |

### Top Lessons (Verified Across Milestones)

1. Pattern-first planning (build shared components before wiring pages) reduces per-page integration time
2. Code review + auto-fix catches real bugs that manual review misses under time pressure
