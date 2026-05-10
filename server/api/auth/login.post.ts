export default defineEventHandler(async (event) => {
  const body = await readBody<{ email: string; password: string }>(event)

  if (!body?.email || !body?.password) {
    throw createError({ statusCode: 400, message: 'Email and password are required' })
  }

  const adminEmail = process.env.ADMIN_EMAIL
  const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH

  if (!adminEmail || !adminPasswordHash) {
    throw createError({ statusCode: 500, message: 'Admin credentials not configured' })
  }

  const emailMatch = body.email.toLowerCase() === adminEmail.toLowerCase()

  if (!emailMatch) {
    throw createError({ statusCode: 401, message: 'Invalid credentials' })
  }

  const passwordValid = await checkPassword(body.password, adminPasswordHash)

  if (!passwordValid) {
    throw createError({ statusCode: 401, message: 'Invalid credentials' })
  }

  const user = {
    email: adminEmail,
    role: 'admin' as const,
  }

  await setUserSession(event, { user })

  return { user }
})
