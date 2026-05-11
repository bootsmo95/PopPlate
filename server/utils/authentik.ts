import { randomBytes } from 'node:crypto'
import { eq } from 'drizzle-orm'
import { db } from '../database/index'
import { users } from '../database/schema'
import type { SessionUser } from './auth'

const OIDC_STATE_COOKIE = 'pp_oidc_state'
const OIDC_NEXT_COOKIE = 'pp_oidc_next'
const OIDC_PASSWORD_PLACEHOLDER = 'oidc:authentik'

interface OidcDiscoveryDocument {
  authorization_endpoint: string
  token_endpoint: string
  userinfo_endpoint: string
  end_session_endpoint?: string
}

interface OidcUserInfo {
  sub?: string
  email?: string
  email_verified?: boolean
  name?: string
  preferred_username?: string
  nickname?: string
  account_tier?: string
  accountTier?: string
  [key: string]: unknown
}

function getRequiredEnv(key: string): string {
  const value = process.env[key]?.trim()

  if (!value)
    throw createError({ statusCode: 500, message: `Missing required env: ${key}` })

  return value
}

function splitCsv(value?: string): string[] {
  return value
    ?.split(',')
    .map(item => item.trim().toLowerCase())
    .filter(Boolean) ?? []
}

function getClaimArray(claims: Record<string, unknown>, claimName?: string): string[] {
  if (!claimName)
    return []

  const value = claims[claimName]

  if (Array.isArray(value)) {
    return value
      .map(item => String(item).trim())
      .filter(Boolean)
  }

  if (typeof value === 'string') {
    return value
      .split(',')
      .map(item => item.trim())
      .filter(Boolean)
  }

  return []
}

function normalizeClaimValues(values: string[]): string[] {
  return values.map(value => value.trim().toLowerCase())
}

function resolveDisplayName(claims: OidcUserInfo): string {
  return claims.name?.trim()
    || claims.preferred_username?.trim()
    || claims.nickname?.trim()
    || claims.email?.trim()
    || 'PopPlate User'
}

function resolveRole(claims: OidcUserInfo, existingRole?: string): string {
  const roleClaim = process.env.AUTHENTIK_CLAIM_ROLES || 'roles'
  const groupClaim = process.env.AUTHENTIK_CLAIM_GROUPS || 'groups'

  const values = normalizeClaimValues([
    ...getClaimArray(claims, roleClaim),
    ...getClaimArray(claims, groupClaim),
  ])

  const adminMatches = splitCsv(process.env.AUTHENTIK_ADMIN_ROLE_VALUES || 'admin')
  const viewerMatches = splitCsv(process.env.AUTHENTIK_VIEWER_ROLE_VALUES || 'viewer,user')

  if (values.some(value => adminMatches.includes(value)))
    return 'admin'

  if (values.some(value => viewerMatches.includes(value)))
    return 'viewer'

  return existingRole ?? process.env.AUTHENTIK_DEFAULT_ROLE?.trim() ?? 'admin'
}

function resolveAccountTier(claims: OidcUserInfo, existingTier?: string): string {
  const explicitTier = [claims.account_tier, claims.accountTier]
    .find(value => typeof value === 'string' && value.trim())

  if (typeof explicitTier === 'string') {
    const normalized = explicitTier.trim().toLowerCase()
    if (['free', 'basic', 'pro'].includes(normalized))
      return normalized
  }

  const roleClaim = process.env.AUTHENTIK_CLAIM_ROLES || 'roles'
  const groupClaim = process.env.AUTHENTIK_CLAIM_GROUPS || 'groups'
  const values = normalizeClaimValues([
    ...getClaimArray(claims, roleClaim),
    ...getClaimArray(claims, groupClaim),
  ])

  for (const tier of ['pro', 'basic', 'free']) {
    if (values.includes(tier) || values.includes(`tier:${tier}`))
      return tier
  }

  return existingTier ?? process.env.AUTHENTIK_DEFAULT_ACCOUNT_TIER?.trim() ?? 'free'
}

export function getOidcCookieNames() {
  return {
    state: OIDC_STATE_COOKIE,
    next: OIDC_NEXT_COOKIE,
  }
}

export function getAuthentikBaseUrl() {
  return getRequiredEnv('AUTHENTIK_BASE_URL')
}

export async function getOidcDiscovery(): Promise<OidcDiscoveryDocument> {
  const discoveryUrl = process.env.AUTHENTIK_DISCOVERY_URL
    || `${getRequiredEnv('AUTHENTIK_ISSUER').replace(/\/$/, '')}/.well-known/openid-configuration`

  return await $fetch<OidcDiscoveryDocument>(discoveryUrl)
}

interface AuthentikAuthorizationUrl {
  state: string
  url: string
}

async function buildAuthorizationRequest(): Promise<AuthentikAuthorizationUrl> {
  const discovery = await getOidcDiscovery()
  const clientId = getRequiredEnv('AUTHENTIK_CLIENT_ID')
  const redirectUri = getRequiredEnv('AUTHENTIK_REDIRECT_URI')
  const scope = process.env.AUTHENTIK_SCOPE?.trim() || 'openid profile email'
  const state = randomBytes(24).toString('hex')

  const url = new URL(discovery.authorization_endpoint)
  url.searchParams.set('client_id', clientId)
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('redirect_uri', redirectUri)
  url.searchParams.set('scope', scope)
  url.searchParams.set('state', state)

  return {
    state,
    url: url.toString(),
  }
}

export async function buildAuthentikAuthorizationUrl(): Promise<AuthentikAuthorizationUrl> {
  return await buildAuthorizationRequest()
}

export async function buildAuthentikSignupUrl(): Promise<string | AuthentikAuthorizationUrl> {
  if (process.env.AUTHENTIK_SIGNUP_URL?.trim())
    return process.env.AUTHENTIK_SIGNUP_URL.trim()

  return await buildAuthorizationRequest()
}

export async function exchangeCodeForUser(code: string): Promise<OidcUserInfo> {
  const discovery = await getOidcDiscovery()
  const clientId = getRequiredEnv('AUTHENTIK_CLIENT_ID')
  const clientSecret = getRequiredEnv('AUTHENTIK_CLIENT_SECRET')
  const redirectUri = getRequiredEnv('AUTHENTIK_REDIRECT_URI')

  const response = await fetch(discovery.token_endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      code,
    }),
  })

  if (!response.ok) {
    throw createError({
      statusCode: 502,
      message: 'Failed to exchange Authentik authorization code',
    })
  }

  const tokenResponse = await response.json() as { access_token?: string }

  if (!tokenResponse.access_token) {
    throw createError({
      statusCode: 502,
      message: 'Authentik token response did not include access_token',
    })
  }

  return await $fetch<OidcUserInfo>(discovery.userinfo_endpoint, {
    headers: {
      Authorization: `Bearer ${tokenResponse.access_token}`,
    },
  })
}

export async function syncUserFromAuthentikClaims(claims: OidcUserInfo): Promise<SessionUser> {
  const email = claims.email?.toLowerCase().trim()

  if (!email) {
    throw createError({
      statusCode: 400,
      message: 'Authentik userinfo did not include an email address',
    })
  }

  const [existingUser] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1)

  const role = resolveRole(claims, existingUser?.role)
  const accountTier = resolveAccountTier(claims, existingUser?.accountTier)
  const displayName = resolveDisplayName(claims)

  const [user] = await db
    .insert(users)
    .values({
      email,
      displayName,
      role,
      accountTier,
      passwordHash: existingUser?.passwordHash || OIDC_PASSWORD_PLACEHOLDER,
    })
    .onConflictDoUpdate({
      target: users.email,
      set: {
        displayName,
        role,
        accountTier,
        passwordHash: existingUser?.passwordHash || OIDC_PASSWORD_PLACEHOLDER,
        updatedAt: new Date(),
      },
    })
    .returning()

  return {
    id: user.id,
    email: user.email,
    role: user.role,
    accountTier: user.accountTier,
  }
}

export async function buildAuthentikLogoutUrl() {
  const discovery = await getOidcDiscovery()
  const fallback = process.env.AUTHENTIK_LOGOUT_REDIRECT_URI
    || process.env.NUXT_PUBLIC_APP_URL
    || '/'

  if (!discovery.end_session_endpoint)
    return fallback

  const url = new URL(discovery.end_session_endpoint)
  url.searchParams.set('post_logout_redirect_uri', fallback)
  return url.toString()
}
