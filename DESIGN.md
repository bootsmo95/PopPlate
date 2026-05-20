# PopPlate Design System

Warm Scandinavian aesthetic. No pure whites or blacks — everything warm-tinted.
Danish copy throughout. Source of truth: `tailwind.config.ts` and `app/assets/css/main.css`.

---

## Colors

### Surfaces
| Token | Hex | Usage |
|-------|-----|-------|
| `bg` | `#f3ede2` | Page background, default canvas |
| `warm` | `#ebe2d1` | Slightly darker surface, section alt |
| `paper` | `#f8f3e9` | Cards, sidebar, elevated surfaces |
| `deep` | `#2b1f15` | Dark panels (auth visual, tier card, hero accents) |
| `card` | `#ede4d2` | Card backgrounds, table headers |
| `card-alt` | `#e1d6c1` | Hover state for cards |

### Ink Scale
| Token | Hex | Usage |
|-------|-----|-------|
| `ink` | `#1a1410` | Primary text, headings |
| `ink-soft` | `#3d2e22` | Secondary text, nav items |
| `ink-mute` | `#6f5d4d` | Descriptions, hints |
| `ink-faint` | `#9a8773` | Captions, timestamps |
| `ink-light` | `#c3b6a3` | Borders, subtle UI |
| `ink-inv` | `#f3ede2` | Text on dark backgrounds |

### Accents
| Token | Hex | Usage |
|-------|-----|-------|
| `clay` | `#b87a4e` | Primary action (CTA buttons, avatars, focus rings) |
| `clay-deep` | `#8b4e2c` | Hover state for clay, eyebrow text, italic accents |
| `clay-soft` | `#d4a880` | Light accent on dark panels, secondary clay |
| `olive` | `#6b6850` | Reserved accent |
| `plum` | `#6e4a45` | Reserved accent |
| `moss` | `#5c6b4d` | Reserved accent |

### Status
| Token | Hex | Meaning |
|-------|-----|---------|
| `status-draft` | `#9a8773` | Unpublished / inactive |
| `status-processing` | `#c89968` | In progress / generating |
| `status-ready` | `#6e8b5a` | Complete, awaiting action |
| `status-published` | `#6e7d8b` | Live / public |
| `status-failed` | `#a85a48` | Error state |

### Borders (in `borderColor`, not `colors`)
| Token | Value | Usage |
|-------|-------|-------|
| `line` | `rgba(26,20,16,0.10)` | Default separator |
| `line-strong` | `rgba(26,20,16,0.22)` | Emphasized separator |
| `line-warm` | `rgba(184,122,78,0.30)` | Clay-tinted border |

---

## Typography

Three font families. Never mix them outside their roles.

| Family | Token | Stack | Role |
|--------|-------|-------|------|
| **Cormorant** | `font-display` | Cormorant, EB Garamond, Georgia, serif | Page titles, card headings, logo, editorial. Tight tracking (-0.025em). Italic for emphasis. |
| **Manrope** | `font-body` | Manrope, Inter, system-ui, sans-serif | Body, buttons, form labels, descriptions. Weights 400-600. |
| **JetBrains Mono** | `font-mono` | JetBrains Mono, Geist Mono, monospace | Eyebrows, slugs, status, metadata. Always uppercase with wide tracking. |

### Hierarchy Patterns
- **Page title**: `font-display font-normal` + `clamp(32px, 4vw, 48px)` + tracking `-0.025em`
- **Italic accent**: `<span class="italic text-clay-deep">word</span>` inside display text
- **Eyebrow**: `font-mono text-[11px] uppercase font-medium text-clay-deep tracking-[0.22em]` with `::before` dash
- **Mono label**: `font-mono text-[10-11px] uppercase font-medium text-ink-faint tracking-[0.18em]`
- **Body text**: `font-body text-[15px] text-ink-mute leading-[1.55]`

---

## Component Patterns

### Cards
- `.p-card`: `bg-paper border border-line rounded-md p-6`
- Dark card: `bg-deep` with `deep-radial` gradient overlay, `color: #f3ede2`

### Buttons
- `.top-btn`: Pill button with border, body font, 13-15px
- `.top-btn--primary`: `bg-ink text-ink-inv` with clay hover
- `.top-btn--clay`: `bg-clay-soft text-clay-deep` hover darkens

### Badges
- `.status-badge`: Inline pill with colored dot `::before`, contextual bg
- `.filter-pill`: Tab-style pill, `filter-pill--active` for selected state

### Forms
- `.field-label`: Mono, 10px, uppercase, `tracking-[0.18em]`
- `.field-input`: Body font, border-line, `rounded-[6px]`, clay focus ring (`0 0 0 3px rgba(184,122,78,0.15)`)

---

## Layout Patterns

### Landing: Floating Nav Pill
Bottom-fixed pill with frosted glass: `rgba(243,237,226,0.72)` + `backdrop-filter: blur(24px) saturate(180%)`

### Auth: Split-Screen
`grid-template-columns: 1fr 1.2fr` — form side (paper) + visual side (deep bg, grid overlay, ghost wordmark at 20vw, floating clay orb, bottom quote). Hides visual below 900px.

### Platform: Sidebar Shell
`grid-template-columns: 260px 1fr` — sticky sidebar (paper, border-r) + main content. Collapses to drawer below 900px.

### Content Grids
- `.two-col`: `1.4fr 1fr` at desktop, single column mobile
- `.section-head`: flex with `justify-content: space-between; align-items: flex-end`

---

## Key Design Decisions

1. **No pure white/black**: All surfaces warm-tinted. Darkest is `#1a1410`, lightest is `#f8f3e9`.
2. **Frosted glass**: Used on nav pill and mobile bars. Always `backdrop-filter: blur(24px) saturate(180%)`.
3. **Dark accent panels**: `bg-deep` with radial clay gradient for premium feel (tier card, auth visual, placeholder states).
4. **Italic = brand accent**: Cormorant italic in clay-deep is the signature style for key words.
5. **Eyebrow + dash**: Monospace uppercase labels always have a `::before` 16px dash line.
6. **Danish copy**: All UI text in Danish. Status labels, form hints, everything.
7. **mix-blend-mode: difference**: Used for the hero wordmark over images on the landing page.
