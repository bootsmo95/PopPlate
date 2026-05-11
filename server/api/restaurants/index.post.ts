import { eq, count } from 'drizzle-orm'
import { db } from '../../database/index'
import { restaurants } from '../../database/schema'
import { requireAuth } from '../../utils/auth'
import { getTierLimits } from '../../utils/tiers'

function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-')
}

export default defineEventHandler(async (event) => {
  const { user } = await requireAuth(event)

  const body = await readBody<{ name: string }>(event)
  const name = body?.name?.trim()

  if (!name) {
    throw createError({ statusCode: 400, message: 'Restaurant name is required' })
  }

  // Check tier limit
  const limits = getTierLimits(user.accountTier)
  const [{ count: currentCount }] = await db
    .select({ count: count() })
    .from(restaurants)
    .where(eq(restaurants.ownerId, user.id))

  if (currentCount >= limits.maxRestaurants) {
    throw createError({
      statusCode: 403,
      message: `Your ${user.accountTier} plan allows up to ${limits.maxRestaurants} restaurant(s). Upgrade to add more.`,
    })
  }

  const baseSlug = slugify(name)

  if (!baseSlug) {
    throw createError({ statusCode: 400, message: 'Restaurant name must contain letters or numbers' })
  }

  let slug = baseSlug
  let suffix = 2

  while (true) {
    const [existing] = await db
      .select({ id: restaurants.id })
      .from(restaurants)
      .where(eq(restaurants.slug, slug))
      .limit(1)

    if (!existing) break

    slug = `${baseSlug}-${suffix}`
    suffix += 1
  }

  const [created] = await db
    .insert(restaurants)
    .values({
      name,
      slug,
      status: 'active',
      ownerId: user.id,
    })
    .returning()

  return created
})
