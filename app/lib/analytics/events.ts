const SESSION_KEY = 'pp_session_id'

function generateSessionId(): string {
  const id = crypto.randomUUID()
  sessionStorage.setItem(SESSION_KEY, id)
  return id
}

export function getSessionId(): string {
  const existing = sessionStorage.getItem(SESSION_KEY)
  if (existing) return existing
  return generateSessionId()
}

export function trackEvent(
  eventType: 'page_open' | 'viewer_loaded' | 'ar_launch_clicked',
  dishId: string,
  restaurantId: string,
): void {
  // Fire-and-forget — do not await, do not surface errors
  const payload = {
    eventType,
    dishId,
    restaurantId,
    sessionId: getSessionId(),
    userAgent: navigator.userAgent,
    referrer: document.referrer,
  }

  $fetch('/api/public/analytics', {
    method: 'POST',
    body: payload,
  }).catch(() => {
    // Intentionally swallowed — analytics must never affect UX
  })
}

export function trackPageOpen(dishId: string, restaurantId: string): void {
  trackEvent('page_open', dishId, restaurantId)
}

export function trackViewerLoaded(dishId: string, restaurantId: string): void {
  trackEvent('viewer_loaded', dishId, restaurantId)
}

export function trackArLaunchClicked(dishId: string, restaurantId: string): void {
  trackEvent('ar_launch_clicked', dishId, restaurantId)
}
