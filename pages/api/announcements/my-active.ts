import { NextApiRequest, NextApiResponse } from 'next'
import { authMiddleware } from '../../../lib/auth'
import { supabase } from '../../../lib/supabase'

type AuthedRequest = NextApiRequest & { user: any }

function getSingleQueryParam(value: string | string[] | undefined): string | undefined {
  if (typeof value === 'string') return value
  if (Array.isArray(value)) return value[0]
  return undefined
}

function pickActiveAnnouncement(rows: any[]): any | null {
  if (!Array.isArray(rows) || rows.length === 0) return null
  const activeStatuses = new Set(['active', 'draft', 'in_progress'])
  const active = rows.find(row => {
    const status = String(row.status || '').toLowerCase()
    if (status && activeStatuses.has(status)) return true
    if (!status) {
      return !row.published_at
    }
    return false
  })
  return active || null
}

function pickLastPublishedAnnouncement(rows: any[]): any | null {
  if (!Array.isArray(rows) || rows.length === 0) return null
  const published = rows
    .filter(row => {
      const status = String(row.status || '').toLowerCase()
      return status === 'published' || !!row.published_at
    })
    .sort((a, b) => {
      const aTime = new Date(a.published_at || a.updated_at || a.created_at || 0).getTime()
      const bTime = new Date(b.published_at || b.updated_at || b.created_at || 0).getTime()
      return bTime - aTime
    })
  return published[0] || null
}

export async function handleGetMyActiveAnnouncement(req: AuthedRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.status(405).end()
    return
  }

  const requester = req.user
  if (!requester || !requester.id) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  const requestedOwnerId = getSingleQueryParam(req.query.ownerUserId)
  if (requestedOwnerId && requestedOwnerId !== requester.id) {
    res.status(403).json({ error: 'Forbidden' })
    return
  }

  const ownerUserId = requester.id
  const { data, error } = await supabase
    .from('announcements')
    .select('*')
    .eq('owner_user_id', ownerUserId)

  if (error) {
    res.status(500).json({ error: error.message })
    return
  }

  const rows = Array.isArray(data) ? data : []
  const activeAnnouncement = pickActiveAnnouncement(rows)
  const lastPublishedAnnouncement = pickLastPublishedAnnouncement(rows)

  res.status(200).json({
    activeAnnouncement,
    lastPublishedAnnouncement
  })
}

export default authMiddleware(handleGetMyActiveAnnouncement)
