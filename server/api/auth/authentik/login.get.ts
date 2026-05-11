import { buildAuthentikAuthorizationUrl, getOidcCookieNames } from '../../../utils/authentik'

export default defineEventHandler(async (event) => {
  const { state, url } = await buildAuthentikAuthorizationUrl()
  const next = getQuery(event).next
  const cookieNames = getOidcCookieNames()

  setCookie(event, cookieNames.state, state, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 10,
  })

  setCookie(event, cookieNames.next, typeof next === 'string' && next.startsWith('/') ? next : '/admin/dishes', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 10,
  })

  return sendRedirect(event, url)
})
