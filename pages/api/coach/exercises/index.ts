import { NextApiRequest, NextApiResponse } from 'next'
import { authMiddleware } from '../../../../lib/auth'
import { supabase } from '../../../../lib/supabase'
import crypto from 'crypto'

async function handler(req: NextApiRequest & { user: any }, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { categoryId, name } = req.body || {}
    if (!categoryId || !name) { res.status(400).json({ error: 'invalid data' }); return }
    const id = crypto.randomUUID()
    const { error } = await supabase
      .from('exercises')
      .insert({ id, category_id: categoryId, coach_id: req.user.id, name })
    if (error) { res.status(500).json({ error: error.message }); return }
    res.status(201).json({ id, name, category: categoryId })
  } else {
    res.status(405).end()
  }
}

export default authMiddleware(handler)
