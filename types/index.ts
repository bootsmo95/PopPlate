// Status enums
export type DishStatus = 'draft' | 'processing' | 'failed' | 'ready' | 'published' | 'archived'
export type JobStatus = 'queued' | 'processing' | 'failed' | 'ready' | 'cancelled'
export type UserRole = 'admin' | 'user'

// Core types
export interface Restaurant {
  id: string
  name: string
  slug: string
  status: string
  createdAt: Date
  updatedAt: Date
}

export interface User {
  id: string
  restaurantId: string
  email: string
  displayName: string
  role: UserRole
  isPayingUser: boolean
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
  createdByUserId: string
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
  requestedByUserId: string
  inputVersion: number
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
  restaurantId: string
  dishId: string
  eventType: string
  sessionId: string
  userAgent: string
  referrer: string | null
  createdAt: Date
}
