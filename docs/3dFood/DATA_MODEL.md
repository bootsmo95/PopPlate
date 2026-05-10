# DATA_MODEL

## Overview
Data model for the image-upload -> generation -> preview -> publish -> QR workflow.

## Restaurant
- id
- name
- slug
- status
- createdAt
- updatedAt

## User
- id
- restaurantId
- email
- displayName
- role
- isPayingUser
- authProviderUserId
- createdAt
- updatedAt

## Dish
- id
- restaurantId
- publicDishId
- name
- shortDescription
- priceText
- allergens
- ingredients
- status (`draft`, `processing`, `failed`, `ready`, `published`, `archived`)
- posterUrl
- previewModelGlbUrl
- previewModelUsdzUrl
- scaleCm
- createdByUserId
- createdAt
- updatedAt
- publishedAt

## DishSourceImage
- id
- dishId
- storageKey
- imageUrl
- sortOrder
- createdAt

## GenerationJob
- id
- dishId
- jobType (`dish_generation`)
- status (`queued`, `processing`, `failed`, `ready`, `cancelled`)
- attemptNumber
- requestedByUserId
- inputVersion
- outputPreviewModelGlbUrl
- outputPreviewModelUsdzUrl
- outputPosterUrl
- errorCode
- errorMessage
- startedAt
- completedAt
- createdAt
- updatedAt

## QrCode
- id
- dishId
- publicUrl
- imageUrl
- createdAt

## AnalyticsEvent
- id
- restaurantId
- dishId
- eventType
- sessionId
- userAgent
- referrer
- createdAt

## Suggested relationships
- Restaurant has many Users
- Restaurant has many Dishes
- Dish has many DishSourceImages
- Dish has many GenerationJobs
- Dish has one active QrCode in MVP
- Dish has many AnalyticsEvents

## Notes
- `publicDishId` is the stable public identifier used in QR URLs
- keep source images separate from generated assets
- do not overwrite job outputs blindly; retries should create a new job record
