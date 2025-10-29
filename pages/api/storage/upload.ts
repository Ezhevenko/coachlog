import { NextApiRequest, NextApiResponse } from 'next'
import { authMiddleware } from '../../../lib/auth'
import { supabase } from '../../../lib/supabase'

type AuthedRequest = NextApiRequest & { user: any }

type UploadPayload = {
  bucket?: string
  path?: string
  contentType?: string
  data?: string
}

function getAllowedBuckets(): string[] {
  const env = process.env.ALLOWED_STORAGE_BUCKETS
  if (!env) {
    return ['public']
  }
  return env
    .split(',')
    .map(bucket => bucket.trim())
    .filter(bucket => bucket.length > 0)
}

function normalizePath(path: string): string | null {
  if (!path || typeof path !== 'string') return null
  const trimmed = path.trim()
  if (!trimmed || trimmed.includes('..') || trimmed.startsWith('/') || trimmed.includes('\\\\')) {
    return null
  }
  return trimmed.replace(/\\/g, '/')
}

function isAllowedPath(path: string, userId: string): boolean {
  const prefixes = [`${userId}/`, `users/${userId}/`]
  return prefixes.some(prefix => path.startsWith(prefix))
}

export async function handleUploadToStorage(req: AuthedRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).end()
    return
  }

  const requester = req.user
  if (!requester || !requester.id) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  const payload: UploadPayload = req.body || {}
  const { bucket, path, contentType, data } = payload

  if (!bucket || !path || !data) {
    res.status(400).json({ error: 'bucket, path and data are required' })
    return
  }

  const allowedBuckets = getAllowedBuckets()
  if (!allowedBuckets.includes(bucket)) {
    res.status(403).json({ error: 'Bucket access denied' })
    return
  }

  const normalizedPath = normalizePath(path)
  if (!normalizedPath) {
    res.status(400).json({ error: 'Invalid path' })
    return
  }

  if (!isAllowedPath(normalizedPath, requester.id)) {
    res.status(403).json({ error: 'Path access denied' })
    return
  }

  let buffer: Buffer
  try {
    buffer = Buffer.from(data, 'base64')
  } catch {
    res.status(400).json({ error: 'Invalid data payload' })
    return
  }

  const storage = (supabase as any).storage
  if (!storage || typeof storage.from !== 'function') {
    res.status(500).json({ error: 'Storage client unavailable' })
    return
  }

  const bucketClient = storage.from(bucket)
  if (!bucketClient || typeof bucketClient.upload !== 'function') {
    res.status(500).json({ error: 'Storage bucket unavailable' })
    return
  }

  const { error } = await bucketClient.upload(normalizedPath, buffer, {
    contentType: contentType || 'application/octet-stream',
    upsert: true
  })

  if (error) {
    res.status(500).json({ error: error.message || 'Upload failed' })
    return
  }

  res.status(204).end()
}

export default authMiddleware(handleUploadToStorage)
