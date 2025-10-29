import { NextApiRequest, NextApiResponse } from 'next'
import { authMiddleware } from '../../../lib/auth'
import { supabase } from '../../../lib/supabase'

type AuthedRequest = NextApiRequest & { user: any }

function getSingleQueryParam(value: string | string[] | undefined): string | undefined {
  if (typeof value === 'string') return value
  if (Array.isArray(value)) return value[0]
  return undefined
}

export async function handleGetAnnouncementModerationFeedback(req: AuthedRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.status(405).end()
    return
  }

  const requester = req.user
  if (!requester || !requester.id) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  const targetTelegramId = getSingleQueryParam(req.query.telegramUserId)
  if (!targetTelegramId) {
    res.status(400).json({ error: 'telegramUserId is required' })
    return
  }

  const requesterTelegramId = requester.telegram_id
  if (!requesterTelegramId || requesterTelegramId !== targetTelegramId) {
    res.status(403).json({ error: 'Forbidden' })
    return
  }

  const { data, error } = await supabase
    .from('announcement_moderation_feedback')
    .select('*')
    .eq('telegram_user_id', targetTelegramId)
    .order('created_at', { ascending: false })

  if (error) {
    res.status(500).json({ error: error.message })
    return
  }

  res.status(200).json({ feedback: Array.isArray(data) ? data : [] })
}

export default authMiddleware(handleGetAnnouncementModerationFeedback)
