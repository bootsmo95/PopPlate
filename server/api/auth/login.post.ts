export default defineEventHandler(async (event) => {
  throw createError({
    statusCode: 410,
    message: 'Login med adgangskode er slået fra. Log ind med Authentik.',
  })
})
