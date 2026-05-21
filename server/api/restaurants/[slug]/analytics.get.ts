import { db } from '../../../../database/index'
import { analyticsEvents, dishes, restaurants } from '../../../../database/schema'
import { and, eq, gte, lt, sql } from 'drizzle-orm'
import { requireAuth } from '../../../../utils/auth'
import { hasUnlimitedAccess } from '../../../../utils/access'

export default defineEventHandler(async (event) => {
  const { user } = await requireAuth(event)

  const slug = getRouterParam(event, 'slug')
  if (!slug) {
    throw createError({ statusCode: 400, message: 'slug is required' })
  }

  // Look up restaurant by slug
  const [restaurant] = await db
    .select()
    .from(restaurants)
    .where(eq(restaurants.slug, slug))
    .limit(1)

  if (!restaurant) {
    throw createError({ statusCode: 404, message: 'Restaurant not found' })
  }

  if (!hasUnlimitedAccess(user) && restaurant.ownerId !== user.id) {
    throw createError({ statusCode: 403, message: 'You do not own this restaurant' })
  }

  // Time period parsing
  const query = getQuery(event)
  const periodParam = (query.period as string) || '30d'
  const days = periodParam === '7d' ? 7 : periodParam === 'all' ? null : 30
  const now = new Date()
  const since = days ? new Date(now.getTime() - days * 86_400_000) : null
  const prevSince = days ? new Date(now.getTime() - days * 2 * 86_400_000) : null

  // Base where clause for current period
  const baseWhere = since
    ? and(eq(analyticsEvents.restaurantId, restaurant.id), gte(analyticsEvents.createdAt, since))
    : eq(analyticsEvents.restaurantId, restaurant.id)

  const prevWhere =
    prevSince && since
      ? and(
          eq(analyticsEvents.restaurantId, restaurant.id),
          gte(analyticsEvents.createdAt, prevSince),
          lt(analyticsEvents.createdAt, since),
        )
      : null

  // Aggregate counts for current period
  const currentCounts = await db
    .select({
      eventType: analyticsEvents.eventType,
      isQr: sql<boolean>`(${analyticsEvents.utmSource} = 'qr')`,
      count: sql<number>`count(*)::int`,
    })
    .from(analyticsEvents)
    .where(baseWhere)
    .groupBy(analyticsEvents.eventType, sql`(${analyticsEvents.utmSource} = 'qr')`)

  // Process current counts
  let menuViews = 0
  let qrScans = 0
  let interactions = 0

  for (const row of currentCounts) {
    if (row.eventType === 'page_open') {
      menuViews += row.count
    }
    if (row.eventType === 'menu_open' && row.isQr) {
      qrScans += row.count
    }
    if (
      row.eventType === 'viewer_loaded' ||
      row.eventType === 'ar_launch_clicked' ||
      row.eventType === 'menu_ar_launch_clicked'
    ) {
      interactions += row.count
    }
  }

  // Previous period counts
  let prevMenuViews = 0
  let prevQrScans = 0
  let prevInteractions = 0

  if (prevWhere) {
    const prevCounts = await db
      .select({
        eventType: analyticsEvents.eventType,
        isQr: sql<boolean>`(${analyticsEvents.utmSource} = 'qr')`,
        count: sql<number>`count(*)::int`,
      })
      .from(analyticsEvents)
      .where(prevWhere)
      .groupBy(analyticsEvents.eventType, sql`(${analyticsEvents.utmSource} = 'qr')`)

    for (const row of prevCounts) {
      if (row.eventType === 'page_open') {
        prevMenuViews += row.count
      }
      if (row.eventType === 'menu_open' && row.isQr) {
        prevQrScans += row.count
      }
      if (
        row.eventType === 'viewer_loaded' ||
        row.eventType === 'ar_launch_clicked' ||
        row.eventType === 'menu_ar_launch_clicked'
      ) {
        prevInteractions += row.count
      }
    }
  }

  // Daily time series
  const daily = await db
    .select({
      date: sql<string>`to_char(${analyticsEvents.createdAt}, 'YYYY-MM-DD')`,
      count: sql<number>`count(*)::int`,
    })
    .from(analyticsEvents)
    .where(baseWhere)
    .groupBy(sql`to_char(${analyticsEvents.createdAt}, 'YYYY-MM-DD')`)
    .orderBy(sql`to_char(${analyticsEvents.createdAt}, 'YYYY-MM-DD')`)

  // Dish popularity ranking
  const dishRanking = await db
    .select({
      dishId: analyticsEvents.dishId,
      name: dishes.name,
      posterUrl: dishes.posterUrl,
      views: sql<number>`count(*) filter (where ${analyticsEvents.eventType} = 'page_open')::int`,
      interactions: sql<number>`count(*) filter (where ${analyticsEvents.eventType} in ('viewer_loaded', 'ar_launch_clicked', 'menu_ar_launch_clicked'))::int`,
    })
    .from(analyticsEvents)
    .innerJoin(dishes, eq(analyticsEvents.dishId, dishes.id))
    .where(baseWhere)
    .groupBy(analyticsEvents.dishId, dishes.name, dishes.posterUrl)
    .orderBy(sql`count(*) filter (where ${analyticsEvents.eventType} = 'page_open') desc`)

  return {
    menuViews,
    qrScans,
    interactions,
    topDish: dishRanking[0]?.name ?? null,
    prev: { menuViews: prevMenuViews, qrScans: prevQrScans, interactions: prevInteractions },
    daily,
    dishRanking,
  }
})
