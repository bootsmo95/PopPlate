import {
  pgTable,
  uuid,
  text,
  boolean,
  integer,
  real,
  timestamp,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// ─── restaurants ─────────────────────────────────────────────────────────────

export const restaurants = pgTable('restaurants', {
  id: uuid('id').primaryKey().defaultRandom(),
  ownerId: uuid('owner_id'),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  tagline: text('tagline'),
  address: text('address'),
  city: text('city'),
  openingHours: text('opening_hours'),
  status: text('status').notNull().default('active'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// ─── users ────────────────────────────────────────────────────────────────────

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  restaurantId: uuid('restaurant_id').references(() => restaurants.id),
  email: text('email').notNull().unique(),
  displayName: text('display_name').notNull(),
  role: text('role').notNull().default('admin'),
  accountTier: text('account_tier').notNull().default('free'),
  passwordHash: text('password_hash').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// ─── dishes ───────────────────────────────────────────────────────────────────

export const dishes = pgTable('dishes', {
  id: uuid('id').primaryKey().defaultRandom(),
  restaurantId: uuid('restaurant_id')
    .notNull()
    .references(() => restaurants.id),
  publicDishId: text('public_dish_id').notNull().unique(),
  name: text('name').notNull(),
  shortDescription: text('short_description'),
  priceText: text('price_text'),
  allergens: text('allergens'),
  ingredients: text('ingredients'),
  status: text('status').notNull().default('draft'),
  posterUrl: text('poster_url'),
  previewModelGlbUrl: text('preview_model_glb_url'),
  previewModelUsdzUrl: text('preview_model_usdz_url'),
  scaleCm: real('scale_cm').default(24),
  createdByUserId: uuid('created_by_user_id').references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  publishedAt: timestamp('published_at'),
})

// ─── dishSourceImages ─────────────────────────────────────────────────────────

export const dishSourceImages = pgTable('dish_source_images', {
  id: uuid('id').primaryKey().defaultRandom(),
  dishId: uuid('dish_id')
    .notNull()
    .references(() => dishes.id),
  storageKey: text('storage_key').notNull(),
  imageUrl: text('image_url').notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

// ─── generationJobs ───────────────────────────────────────────────────────────

export const generationJobs = pgTable('generation_jobs', {
  id: uuid('id').primaryKey().defaultRandom(),
  dishId: uuid('dish_id')
    .notNull()
    .references(() => dishes.id),
  jobType: text('job_type').notNull().default('dish_generation'),
  status: text('status').notNull().default('queued'),
  attemptNumber: integer('attempt_number').notNull().default(1),
  requestedByUserId: uuid('requested_by_user_id').references(() => users.id),
  inputVersion: integer('input_version').notNull().default(1),
  externalTaskId: text('external_task_id'),
  progress: integer('progress').notNull().default(0),
  outputPreviewModelGlbUrl: text('output_preview_model_glb_url'),
  outputPreviewModelUsdzUrl: text('output_preview_model_usdz_url'),
  outputPosterUrl: text('output_poster_url'),
  errorCode: text('error_code'),
  errorMessage: text('error_message'),
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// ─── qrCodes ──────────────────────────────────────────────────────────────────

export const qrCodes = pgTable('qr_codes', {
  id: uuid('id').primaryKey().defaultRandom(),
  dishId: uuid('dish_id')
    .notNull()
    .references(() => dishes.id),
  publicUrl: text('public_url').notNull(),
  imageUrl: text('image_url').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

// ─── analyticsEvents ──────────────────────────────────────────────────────────

export const analyticsEvents = pgTable('analytics_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  restaurantId: uuid('restaurant_id').references(() => restaurants.id),
  dishId: uuid('dish_id').references(() => dishes.id),
  eventType: text('event_type').notNull(),
  sessionId: text('session_id'),
  userAgent: text('user_agent'),
  referrer: text('referrer'),
  utmSource: text('utm_source'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

// ─── Relations ────────────────────────────────────────────────────────────────

export const restaurantsRelations = relations(restaurants, ({ one, many }) => ({
  owner: one(users, {
    fields: [restaurants.ownerId],
    references: [users.id],
  }),
  users: many(users),
  dishes: many(dishes),
  analyticsEvents: many(analyticsEvents),
}))

export const usersRelations = relations(users, ({ one, many }) => ({
  restaurant: one(restaurants, {
    fields: [users.restaurantId],
    references: [restaurants.id],
  }),
  createdDishes: many(dishes),
  generationJobs: many(generationJobs),
}))

export const dishesRelations = relations(dishes, ({ one, many }) => ({
  restaurant: one(restaurants, {
    fields: [dishes.restaurantId],
    references: [restaurants.id],
  }),
  createdByUser: one(users, {
    fields: [dishes.createdByUserId],
    references: [users.id],
  }),
  sourceImages: many(dishSourceImages),
  generationJobs: many(generationJobs),
  qrCodes: many(qrCodes),
  analyticsEvents: many(analyticsEvents),
}))

export const dishSourceImagesRelations = relations(dishSourceImages, ({ one }) => ({
  dish: one(dishes, {
    fields: [dishSourceImages.dishId],
    references: [dishes.id],
  }),
}))

export const generationJobsRelations = relations(generationJobs, ({ one }) => ({
  dish: one(dishes, {
    fields: [generationJobs.dishId],
    references: [dishes.id],
  }),
  requestedByUser: one(users, {
    fields: [generationJobs.requestedByUserId],
    references: [users.id],
  }),
}))

export const qrCodesRelations = relations(qrCodes, ({ one }) => ({
  dish: one(dishes, {
    fields: [qrCodes.dishId],
    references: [dishes.id],
  }),
}))

export const analyticsEventsRelations = relations(analyticsEvents, ({ one }) => ({
  restaurant: one(restaurants, {
    fields: [analyticsEvents.restaurantId],
    references: [restaurants.id],
  }),
  dish: one(dishes, {
    fields: [analyticsEvents.dishId],
    references: [dishes.id],
  }),
}))
