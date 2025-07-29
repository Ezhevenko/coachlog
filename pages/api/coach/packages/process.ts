import { NextApiRequest, NextApiResponse } from 'next'
import { authMiddleware } from '../../../../lib/auth'
import { supabase } from '../../../../lib/supabase'
import crypto from 'crypto'

async function handler(req: NextApiRequest & { user: any }, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).end()
    return
  }
  const { data: workouts, error } = await supabase
    .from('workouts')
    .select('id,client_id,date,time_start,package_deducted')
    .eq('coach_id', req.user.id)
    .eq('package_deducted', false)
  if (error) { res.status(500).json({ error: error.message }); return }
  const now = new Date()
  let processed = 0
  for (const w of workouts || []) {
    const ts = new Date(`${w.date}T${w.time_start || '00:00'}`)
    if (ts > now) continue
    const { data: pkg } = await supabase
      .from('client_packages')
      .select('id,count')
      .eq('client_id', w.client_id)
      .eq('coach_id', req.user.id)
      .single()
    if (pkg) {
      await supabase.from('client_packages').update({ count: (pkg.count || 0) - 1 }).eq('id', pkg.id)
      await supabase.from('package_history').insert({ id: crypto.randomUUID(), client_id: w.client_id, coach_id: req.user.id, delta: -1 })
    }
    await supabase.from('workouts').update({ package_deducted: true }).eq('id', w.id)
    processed++
  }
  res.status(200).json({ processed })
}

export default authMiddleware(handler)
