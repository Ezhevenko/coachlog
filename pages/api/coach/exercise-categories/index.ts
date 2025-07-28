import { NextApiRequest, NextApiResponse } from 'next'
import { authMiddleware } from '../../../../lib/auth'
import { supabase } from '../../../../lib/supabase'
import crypto from 'crypto'

async function handler(req: NextApiRequest & { user: any }, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { data: cats } = await supabase
      .from('exercise_categories')
      .select('id,name')
      .eq('coach_id', req.user.id)
    const ids = cats?.map(c => c.id) || []
    const { data: ex } = await supabase
      .from('exercises')
      .select('id,name,category_id')
      .in('category_id', ids)
    const map: Record<string, any[]> = {}
    ex?.forEach(e => { (map[e.category_id] ||= []).push({ id: e.id, name: e.name, category: e.category_id }) })
    const list = (cats || []).map(c => ({ id: c.id, name: c.name, exercises: map[c.id] || [] }))
    res.status(200).json(list)
  } else if (req.method === 'POST') {
    const { name } = req.body || {}
    if (!name) { res.status(400).json({ error: 'invalid data' }); return }
    const id = crypto.randomUUID()
    const { error } = await supabase.from('exercise_categories').insert({ id, coach_id: req.user.id, name })
    if (error) { res.status(500).json({ error: error.message }); return }
    res.status(201).json({ id, name, exercises: [] })
  } else {
    res.status(405).end()
  }
}

export default authMiddleware(handler)
