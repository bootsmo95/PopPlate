import type { H3Event } from 'h3'
import { getRequestURL, getHeader } from 'h3'

const FALLBACK_APP_URL = 'http://localhost:3000'

export function getPublicAppBaseUrl(event?: H3Event): string {
  const requestOrigin = event ? getRequestOrigin(event) : null
  const configuredOrigin = normalizeOrigin(process.env.NUXT_PUBLIC_APP_URL)

  if (requestOrigin && isPublicOrigin(requestOrigin)) {
    return requestOrigin
  }

  if (configuredOrigin && isPublicOrigin(configuredOrigin)) {
    return configuredOrigin
  }

  return configuredOrigin ?? requestOrigin ?? FALLBACK_APP_URL
}

export function buildPublicDishUrl(publicDishId: string, event?: H3Event): string {
  return `${getPublicAppBaseUrl(event)}/d/${publicDishId}`
}

function getRequestOrigin(event: H3Event): string | null {
  const forwardedProto = getHeader(event, 'x-forwarded-proto')?.split(',')[0]?.trim()
  const forwardedHost = getHeader(event, 'x-forwarded-host')?.split(',')[0]?.trim()

  if (forwardedHost) {
    return normalizeOrigin(`${forwardedProto || 'https'}://${forwardedHost}`)
  }

  return normalizeOrigin(getRequestURL(event).origin)
}

function normalizeOrigin(value?: string | null): string | null {
  if (!value) return null

  try {
    return new URL(value).origin
  } catch {
    return null
  }
}

function isPublicOrigin(origin: string): boolean {
  const { hostname } = new URL(origin)
  return hostname !== 'localhost'
    && hostname !== '127.0.0.1'
    && !hostname.endsWith('.sslip.io')
}
