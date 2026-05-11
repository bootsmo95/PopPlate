export type AccountTier = 'free' | 'basic' | 'pro'

export interface TierLimits {
  maxRestaurants: number
  maxDishesTotal: number
  maxRegenerationsPerDish: number
}

const TIER_LIMITS: Record<AccountTier, TierLimits> = {
  free: { maxRestaurants: 1, maxDishesTotal: 5, maxRegenerationsPerDish: 1 },
  basic: { maxRestaurants: 2, maxDishesTotal: 35, maxRegenerationsPerDish: 3 },
  pro: { maxRestaurants: 5, maxDishesTotal: 60, maxRegenerationsPerDish: 5 },
}

export function getTierLimits(tier: string): TierLimits {
  return TIER_LIMITS[tier as AccountTier] ?? TIER_LIMITS.free
}

export function isValidTier(tier: string): tier is AccountTier {
  return tier === 'free' || tier === 'basic' || tier === 'pro'
}
