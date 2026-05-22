import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import postgres from 'postgres'

const ASSETS = [
  {
    column: 'preview_model_glb_url',
    ext: 'glb',
    contentType: 'model/gltf-binary',
  },
  {
    column: 'preview_model_usdz_url',
    ext: 'usdz',
    contentType: 'model/vnd.usdz+zip',
  },
  {
    column: 'poster_url',
    ext: 'png',
    contentType: 'image/png',
  },
]

const requiredEnv = [
  'DATABASE_URL',
  'S3_ENDPOINT',
  'S3_BUCKET',
  'S3_ACCESS_KEY_ID',
  'S3_SECRET_ACCESS_KEY',
]

for (const key of requiredEnv) {
  if (!process.env[key]) {
    throw new Error(`${key} environment variable is not set`)
  }
}

const publicBaseUrl = process.env.S3_PUBLIC_BASE_URL ?? process.env.S3_ENDPOINT
const allowedStorageHosts = [process.env.S3_PUBLIC_BASE_URL, process.env.S3_ENDPOINT]
  .filter(Boolean)
  .flatMap((value) => {
    try {
      return [new URL(value).hostname]
    } catch {
      return []
    }
  })

const sql = postgres(process.env.DATABASE_URL, { max: 1 })
const s3 = new S3Client({
  endpoint: process.env.S3_ENDPOINT,
  region: process.env.S3_REGION ?? 'us-east-1',
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  },
  forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
})

const summary = {
  dishesChecked: 0,
  assetsAlreadyDurable: 0,
  assetsNormalized: 0,
  assetsSkipped: 0,
  errors: [],
}

try {
  const dishes = await sql`
    select id, restaurant_id, public_dish_id, preview_model_glb_url, preview_model_usdz_url, poster_url
    from dishes
    where preview_model_glb_url is not null
       or preview_model_usdz_url is not null
       or poster_url is not null
  `

  summary.dishesChecked = dishes.length

  for (const dish of dishes) {
    const updates = {}

    for (const asset of ASSETS) {
      const sourceUrl = dish[asset.column]

      if (!sourceUrl) {
        summary.assetsSkipped++
        continue
      }

      if (isDurableStorageUrl(sourceUrl)) {
        summary.assetsAlreadyDurable++
        continue
      }

      try {
        const key = generatedAssetKey(
          dish.restaurant_id,
          dish.id,
          `${dish.public_dish_id}.${asset.ext}`,
        )

        const buffer = await downloadAsset(sourceUrl)
        await uploadAsset(key, buffer, asset.contentType)
        updates[asset.column] = getPublicUrl(key)
        summary.assetsNormalized++
      } catch (err) {
        summary.errors.push({
          dishId: dish.id,
          field: asset.column,
          message: err instanceof Error ? err.message : String(err),
        })
      }
    }

    if (Object.keys(updates).length > 0) {
      await updateDish(dish.id, updates)
    }
  }
} finally {
  await sql.end()
}

console.log(JSON.stringify(summary, null, 2))

if (summary.errors.length > 0 && process.env.NORMALIZE_EXISTING_MODELS_STRICT === 'true') {
  process.exitCode = 1
}

function isDurableStorageUrl(url) {
  if (url.startsWith('data:')) return true

  try {
    return allowedStorageHosts.includes(new URL(url).hostname)
  } catch {
    return false
  }
}

async function downloadAsset(url) {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`download failed with HTTP ${response.status}`)
  }

  return Buffer.from(await response.arrayBuffer())
}

async function uploadAsset(key, body, contentType) {
  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
    }),
  )
}

function generatedAssetKey(restaurantId, dishId, filename) {
  return `restaurants/${restaurantId}/dishes/${dishId}/generated/${filename}`
}

function getPublicUrl(key) {
  return `${publicBaseUrl.replace(/\/$/, '')}/${process.env.S3_BUCKET}/${key}`
}

async function updateDish(id, updates) {
  const values = []
  const assignments = []

  for (const [column, value] of Object.entries(updates)) {
    values.push(value)
    assignments.push(`${column} = $${values.length}`)
  }

  values.push(id)
  await sql.unsafe(
    `update dishes set ${assignments.join(', ')}, updated_at = now() where id = $${values.length}`,
    values,
  )
}
