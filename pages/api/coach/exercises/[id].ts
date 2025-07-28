import { NextApiRequest, NextApiResponse } from 'next'
import { authMiddleware } from '../../../../lib/auth'
import { supabase } from '../../../../lib/supabase'

async function handler(req: NextApiRequest & { user: any }, res: NextApiResponse) {
  const { id } = req.query
  if (typeof id !== 'string') { res.status(400).end(); return }
  if (req.method === 'PATCH') {
    const { name } = req.body || {}
    const { error } = await supabase
      .from('exercises')
      .update({ name })
      .eq('id', id)
      .eq('coach_id', req.user.id)
    if (error) { res.status(500).json({ error: error.message }); return }
    res.status(200).json({ id, name })
  } else if (req.method === 'DELETE') {
    await supabase.from('exercises').delete().eq('id', id).eq('coach_id', req.user.id)
    res.status(204).end()
  } else {
    res.status(405).end()
  }
}

export default authMiddleware(handler)
