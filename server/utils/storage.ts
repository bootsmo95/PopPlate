import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3'
import { getSignedUrl as awsGetSignedUrl } from '@aws-sdk/s3-request-presigner'

let _s3Client: S3Client | undefined

/**
 * Singleton S3 client using env vars.
 * Compatible with MinIO via S3_FORCE_PATH_STYLE=true.
 */
export function getS3Client(): S3Client {
  if (!_s3Client) {
    const endpoint = process.env.S3_ENDPOINT
    const region = process.env.S3_REGION ?? 'us-east-1'
    const accessKeyId = process.env.S3_ACCESS_KEY_ID
    const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY
    const forcePathStyle = process.env.S3_FORCE_PATH_STYLE === 'true'

    if (!endpoint) throw new Error('S3_ENDPOINT environment variable is not set')
    if (!accessKeyId) throw new Error('S3_ACCESS_KEY_ID environment variable is not set')
    if (!secretAccessKey) throw new Error('S3_SECRET_ACCESS_KEY environment variable is not set')

    _s3Client = new S3Client({
      endpoint,
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      forcePathStyle,
    })
  }
  return _s3Client
}

function getBucket(): string {
  const bucket = process.env.S3_BUCKET
  if (!bucket) throw new Error('S3_BUCKET environment variable is not set')
  return bucket
}

/**
 * Upload a file to S3.
 */
export async function uploadFile(
  key: string,
  buffer: Buffer,
  contentType: string,
): Promise<void> {
  const client = getS3Client()
  const bucket = getBucket()

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    }),
  )
}

/**
 * Generate a presigned download URL for an object.
 * @param key - S3 object key
 * @param expiresIn - expiry in seconds (default 3600 = 1 hour)
 */
export async function getSignedUrl(key: string, expiresIn = 3600): Promise<string> {
  const client = getS3Client()
  const bucket = getBucket()

  const command = new GetObjectCommand({ Bucket: bucket, Key: key })
  return awsGetSignedUrl(client, command, { expiresIn })
}

/**
 * Delete an object from S3.
 */
export async function deleteFile(key: string): Promise<void> {
  const client = getS3Client()
  const bucket = getBucket()

  await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }))
}

/**
 * Construct the public URL for an object.
 * Format: {S3_ENDPOINT}/{S3_BUCKET}/{key}
 */
export function getPublicUrl(key: string): string {
  const endpoint = process.env.S3_ENDPOINT
  if (!endpoint) throw new Error('S3_ENDPOINT environment variable is not set')
  const bucket = getBucket()
  return `${endpoint.replace(/\/$/, '')}/${bucket}/${key}`
}
