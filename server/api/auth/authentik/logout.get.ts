import { buildAuthentikLogoutUrl } from '../../../utils/authentik'

export default defineEventHandler(async (event) => {
  await clearUserSession(event)
  const logoutUrl = await buildAuthentikLogoutUrl()
  return sendRedirect(event, logoutUrl)
})
