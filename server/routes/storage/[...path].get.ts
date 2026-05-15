import { GetObjectCommand } from '@aws-sdk/client-s3'
import { Readable } from 'node:stream'
import { getBucketName, getS3Client } from '../../utils/storage'

export default defineEventHandler(async (event) => {
  const path = getRouterParam(event, 'path') ?? ''
  const [bucket, ...keyParts] = path.split('/').filter(Boolean)
  const key = keyParts.join('/')

  if (!bucket || !key) {
    throw createError({ statusCode: 400, message: 'Invalid storage path' })
  }

  if (bucket !== getBucketName()) {
    throw createError({ statusCode: 404, message: 'File not found' })
  }

  const object = await getS3Client().send(new GetObjectCommand({ Bucket: bucket, Key: key }))

  if (object.ContentType) {
    setResponseHeader(event, 'Content-Type', object.ContentType)
  }
  if (object.ContentLength) {
    setResponseHeader(event, 'Content-Length', object.ContentLength)
  }
  setResponseHeader(event, 'Cache-Control', 'public, max-age=31536000, immutable')
  setResponseHeader(event, 'Content-Disposition', 'inline')

  const body = object.Body
  if (!body) {
    throw createError({ statusCode: 404, message: 'File not found' })
  }

  if (body instanceof Readable) {
    return body
  }

  return Readable.fromWeb(body.transformToWebStream())
})
