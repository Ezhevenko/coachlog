import { NextApiRequest, NextApiResponse } from 'next'
import { authMiddleware } from '../../../lib/auth'
import { supabase } from '../../../lib/supabase'

type AuthedRequest = NextApiRequest & { user: any }

function getPathParam(value: string | string[] | undefined): string | undefined {
  if (typeof value === 'string') return value
  if (Array.isArray(value)) return value[0]
  return undefined
}

export async function handleGetUserSubscription(req: AuthedRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.status(405).end()
    return
  }

  const requester = req.user
  if (!requester || !requester.id) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  const targetUserId = getPathParam(req.query.userId)
  if (!targetUserId) {
    res.status(400).json({ error: 'userId is required' })
    return
  }

  if (targetUserId !== requester.id) {
    res.status(403).json({ error: 'Forbidden' })
    return
  }

  const { data, error } = await supabase
    .from('user_subscriptions')
    .select('*')
    .eq('user_id', targetUserId)
    .order('created_at', { ascending: false })

  if (error) {
    res.status(500).json({ error: error.message })
    return
  }

  const subscription = Array.isArray(data) ? data[0] || null : null
  res.status(200).json({ subscription })
}

export default authMiddleware(handleGetUserSubscription)
