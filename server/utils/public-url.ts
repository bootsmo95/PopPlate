import type { H3Event } from 'h3'
import { getRequestURL, getHeader } from 'h3'

const CANONICAL_APP_URL = 'https://popplate.dk'
const APP_HOST = 'popplate.dk'
const API_HOST = 'api.popplate.dk'
const LEGACY_APP_HOSTS = new Set(['www.popplate.dk', 'app.popplate.dk'])

export function getPublicAppBaseUrl(event?: H3Event): string {
  const requestOrigin = event ? getRequestOrigin(event) : null
  const configuredOrigin = normalizeOrigin(process.env.NUXT_PUBLIC_APP_URL)

  if (requestOrigin && isPublicOrigin(requestOrigin)) {
    return requestOrigin
  }

  if (configuredOrigin && isPublicOrigin(configuredOrigin)) {
    return configuredOrigin
  }

  return CANONICAL_APP_URL
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
  return hostname === APP_HOST
}

export function canonicalizePublicDishUrl(url: string | null | undefined, publicDishId: string): string {
  if (!url) return buildPublicDishUrl(publicDishId)

  try {
    const parsed = new URL(url)
    if (
      parsed.hostname === API_HOST
      || LEGACY_APP_HOSTS.has(parsed.hostname)
      || parsed.hostname === 'localhost'
      || parsed.hostname === '127.0.0.1'
      || parsed.hostname.endsWith('.sslip.io')
    ) {
      return buildPublicDishUrl(publicDishId)
    }

    return parsed.href
  } catch {
    return buildPublicDishUrl(publicDishId)
  }
}
