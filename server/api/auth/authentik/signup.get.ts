import { buildAuthentikSignupUrl, getOidcCookieNames } from '../../../utils/authentik'

export default defineEventHandler(async (event) => {
  const result = await buildAuthentikSignupUrl()
  const next = getQuery(event).next
  const cookieNames = getOidcCookieNames()

  if (typeof result === 'string') {
    setCookie(event, cookieNames.next, typeof next === 'string' && next.startsWith('/') ? next : '/platform/settings', {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 10,
    })
    return sendRedirect(event, result)
  }

  setCookie(event, cookieNames.state, result.state, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 10,
  })

  setCookie(event, cookieNames.next, typeof next === 'string' && next.startsWith('/') ? next : '/platform/settings', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 10,
  })

  return sendRedirect(event, result.url)
})
