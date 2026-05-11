// Status enums
export type DishStatus = 'draft' | 'processing' | 'failed' | 'ready' | 'published' | 'archived'
export type JobStatus = 'queued' | 'processing' | 'failed' | 'ready' | 'cancelled'
export type UserRole = 'admin' | 'user'
export type AccountTier = 'free' | 'basic' | 'pro'

// Core types
export interface Restaurant {
  id: string
  ownerId: string | null
  name: string
  slug: string
  status: string
  createdAt: Date
  updatedAt: Date
}

export interface User {
  id: string
  restaurantId: string | null
  email: string
  displayName: string
  role: UserRole
  accountTier: AccountTier
  createdAt: Date
  updatedAt: Date
}

export interface Dish {
  id: string
  restaurantId: string
  publicDishId: string
  name: string
  shortDescription: string | null
  priceText: string | null
  allergens: string | null
  ingredients: string | null
  status: DishStatus
  posterUrl: string | null
  previewModelGlbUrl: string | null
  previewModelUsdzUrl: string | null
  scaleCm: number | null
  createdByUserId: string | null
  createdAt: Date
  updatedAt: Date
  publishedAt: Date | null
}

export interface DishSourceImage {
  id: string
  dishId: string
  storageKey: string
  imageUrl: string
  sortOrder: number
  createdAt: Date
}

export interface GenerationJob {
  id: string
  dishId: string
  jobType: 'dish_generation'
  status: JobStatus
  attemptNumber: number
  requestedByUserId: string | null
  inputVersion: number
  externalTaskId: string | null
  progress: number
  outputPreviewModelGlbUrl: string | null
  outputPreviewModelUsdzUrl: string | null
  outputPosterUrl: string | null
  errorCode: string | null
  errorMessage: string | null
  startedAt: Date | null
  completedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

export interface QrCode {
  id: string
  dishId: string
  publicUrl: string
  imageUrl: string
  createdAt: Date
}

export interface AnalyticsEvent {
  id: string
  restaurantId: string | null
  dishId: string | null
  eventType: string
  sessionId: string | null
  userAgent: string | null
  referrer: string | null
  createdAt: Date
}
