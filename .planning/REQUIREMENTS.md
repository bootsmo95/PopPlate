# Requirements: PopPlate

**Defined:** 2026-05-21
**Core Value:** Restaurants can show diners what their dishes actually look like in 3D before they order

## v1 Requirements

Requirements for current milestone. Each maps to roadmap phases.

### Usage Tracking

- [x] **USAG-01**: System records each 3D model generation with user ID and timestamp
- [x] **USAG-02**: User can see their generation count for the current rolling 31-day window
- [x] **USAG-03**: System enforces tier-based generation limits (blocks generation when limit reached)
- [x] **USAG-04**: User sees clear feedback when they've hit their generation limit

### Analytics

- [ ] **ANLT-01**: Restaurant owner can view total menu page views over time
- [ ] **ANLT-02**: Restaurant owner can view per-dish view and interaction counts
- [ ] **ANLT-03**: Restaurant owner can see dish popularity ranking
- [ ] **ANLT-04**: Analytics dashboard shows trends over configurable time periods
- [ ] **ANLT-05**: QR code scan events are tracked and displayed

### UI Polish

- [ ] **UIPOL-01**: All async operations show loading states
- [ ] **UIPOL-02**: API errors display user-friendly messages
- [ ] **UIPOL-03**: Empty states guide users toward next action
- [ ] **UIPOL-04**: Platform pages are mobile responsive

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Billing

- **BILL-01**: User can subscribe to a monthly plan via Stripe Checkout
- **BILL-02**: User can upgrade or downgrade their plan
- **BILL-03**: User can access Stripe Customer Portal for invoices and payment management
- **BILL-04**: System enforces feature access based on active subscription

### Teams

- **TEAM-01**: Restaurant owner can invite team members by email
- **TEAM-02**: Team members can manage dishes but not billing or settings
- **TEAM-03**: Owner can revoke team member access

### Onboarding

- **ONBR-01**: New user sees guided first-run flow (create restaurant -> add dish -> generate -> share)
- **ONBR-02**: Dashboard surfaces next recommended action for incomplete setup

### Landing Page

- **LAND-01**: Marketing page at popplate.dk explaining the product
- **LAND-02**: Pricing page showing tier comparison

## Out of Scope

| Feature | Reason |
|---------|--------|
| AR at the table | Complexity too high for v1; revisit after launch |
| Full menu replacement (ordering, dietary info) | PopPlate is a visual preview tool, not a POS |
| Mobile native app | Web-first; QR-to-browser works on all phones |
| Agency/reseller model | Sell directly to restaurants first |
| Real-time collaboration | Team members don't need simultaneous editing |
| Embedded widget for restaurant websites | QR-to-web is the v1 distribution model |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| USAG-01 | Phase 1 | Complete (01-01) |
| USAG-02 | Phase 1 | Complete (01-01) |
| USAG-03 | Phase 1 | Complete (01-01) |
| USAG-04 | Phase 1 | Complete (01-02) |
| ANLT-01 | Phase 2 | Pending |
| ANLT-02 | Phase 2 | Pending |
| ANLT-03 | Phase 2 | Pending |
| ANLT-04 | Phase 2 | Pending |
| ANLT-05 | Phase 2 | Pending |
| UIPOL-01 | Phase 3 | Pending |
| UIPOL-02 | Phase 3 | Pending |
| UIPOL-03 | Phase 3 | Pending |
| UIPOL-04 | Phase 3 | Pending |

**Coverage:**
- v1 requirements: 13 total
- Mapped to phases: 13
- Unmapped: 0

---
*Requirements defined: 2026-05-21*
*Last updated: 2026-05-21 after roadmap creation*
