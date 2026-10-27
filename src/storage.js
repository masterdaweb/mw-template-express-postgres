import { HeadBucketCommand, GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

/**
 * The private bucket bound to this service (prefix MW_STORAGE_). Its files
 * are never public: each link is signed and expires.
 */
const env = process.env
export const bucket = env.MW_STORAGE_BUCKET ?? ''

const s3 = new S3Client({
  endpoint: env.MW_STORAGE_ENDPOINT,
  region: env.MW_STORAGE_REGION || 'auto',
  forcePathStyle: env.MW_STORAGE_FORCE_PATH_STYLE === 'true',
  credentials: {
    accessKeyId: env.MW_STORAGE_ACCESS_KEY_ID ?? '',
    secretAccessKey: env.MW_STORAGE_SECRET_ACCESS_KEY ?? ''
  }
})

export async function check() {
  if (!bucket) throw new Error('MW_STORAGE_BUCKET is empty: connect a bucket to this service')
  await s3.send(new HeadBucketCommand({ Bucket: bucket }))
  return bucket
}

export async function put(key, body, contentType) {
  await s3.send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: body, ContentType: contentType }))
}

/** A link to download the file, good for 15 minutes. */
export function signedLink(key, name) {
  return getSignedUrl(
    s3,
    new GetObjectCommand({ Bucket: bucket, Key: key, ResponseContentDisposition: `attachment; filename="${name.replace(/"/g, '')}"` }),
    { expiresIn: 900 }
  )
}
