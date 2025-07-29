import { NextApiRequest, NextApiResponse } from 'next'
import { authMiddleware } from '../../../../lib/auth'
import { supabase } from '../../../../lib/supabase'

async function handler(req: NextApiRequest & { user: any }, res: NextApiResponse) {
  const { clientId } = req.query
  if (req.method !== 'GET') { res.status(405).end(); return }
  if (typeof clientId !== 'string') { res.status(400).end(); return }
  const { data } = await supabase
    .from('client_invites')
    .select('token')
    .eq('client_id', clientId)
    .eq('coach_id', req.user.id)
    .single()
  res.status(200).json({ token: data?.token || null })
}

export default authMiddleware(handler)
