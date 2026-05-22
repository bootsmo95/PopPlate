// ─────────── popplate · domain types ───────────

export type DishStatus =
  | 'draft'
  | 'processing'
  | 'ready'
  | 'published'
  | 'failed'

export interface Dish {
  id: number | string
  name: string
  /** Italicised substring of `name` (e.g. "Brændt"). Optional. */
  italic?: string
  restaurant: string
  status: DishStatus
  /** 0–100, only relevant when status === 'processing' */
  progress?: number
  price: string
  /** AR plate diameter in centimeters */
  arSizeCm?: number
  views: number
  scans: number
  img: string
  updated: string
  publicDishId?: string | null
  /** Human message when status === 'failed' */
  error?: string
  category?: 'forret' | 'hovedret' | 'dessert' | 'snack'
  description?: string
  allergens?: string[]
  ingredients?: string[]
  signature?: boolean
}

export interface Restaurant {
  id: number | string
  name: string
  /** URL slug → /r/[slug] */
  slug: string
  address: string
  city?: string
  hours?: string
  phone?: string
  tagline?: string
  status: 'Aktiv' | 'Kladde'
  dishes: number
}

export interface MenuSection {
  cat: string
  catEn?: string
  dishes: Dish[]
}

export interface User {
  name: string
  initials: string
  email: string
  tier: 'Basic' | 'Pro' | 'Studio'
  tierLimit: number
  tierUsed: number
}

export type SidebarKey =
  | 'home'
  | 'dishes'
  | 'restaurants'
  | 'workspace'
  | 'analytics'
  | 'settings'
