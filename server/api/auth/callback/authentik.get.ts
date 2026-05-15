import {
  exchangeCodeForUser,
  getOidcCookieNames,
  syncUserFromAuthentikClaims,
} from '../../../utils/authentik'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const code = typeof query.code === 'string' ? query.code : ''
  const state = typeof query.state === 'string' ? query.state : ''
  const error = typeof query.error === 'string' ? query.error : ''
  const cookieNames = getOidcCookieNames()
  const expectedState = getCookie(event, cookieNames.state)
  const next = getCookie(event, cookieNames.next) || '/platform/dishes'

  deleteCookie(event, cookieNames.state, { path: '/' })
  deleteCookie(event, cookieNames.next, { path: '/' })

  if (error) {
    return sendRedirect(event, `/platform/login?error=${encodeURIComponent('Authentik login was cancelled or failed.')}`)
  }

  if (!code || !state || !expectedState || state !== expectedState) {
    return sendRedirect(event, `/platform/login?error=${encodeURIComponent('Invalid Authentik login state. Please try again.')}`)
  }

  const claims = await exchangeCodeForUser(code)
  const sessionUser = await syncUserFromAuthentikClaims(claims)

  await setUserSession(event, { user: sessionUser })

  return sendRedirect(event, next.startsWith('/') ? next : '/platform/dishes')
})
