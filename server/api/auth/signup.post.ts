export default defineEventHandler(async (event) => {
  throw createError({
    statusCode: 410,
    message: 'Oprettelse med adgangskode er slået fra. Opret brugere via Authentik.',
  })
})
