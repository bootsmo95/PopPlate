const APP_HOST = 'popplate.dk'
const API_HOST = 'api.popplate.dk'
const LEGACY_APP_HOSTS = new Set(['www.popplate.dk', 'app.popplate.dk'])

export default defineEventHandler((event) => {
  const forwardedHost = getRequestHeader(event, 'x-forwarded-host')
  const hostHeader = forwardedHost || getRequestHeader(event, 'host') || ''
  const host = hostHeader.split(',')[0]?.trim().split(':')[0]?.toLowerCase()

  if (!host)
    return

  const url = getRequestURL(event)
  const path = `${url.pathname}${url.search}`

  if (host === API_HOST && !url.pathname.startsWith('/api/')) {
    return sendRedirect(event, `https://${APP_HOST}${path}`, 301)
  }

  if (LEGACY_APP_HOSTS.has(host)) {
    return sendRedirect(event, `https://${APP_HOST}${path}`, 301)
  }
})
