import { NextApiRequest, NextApiResponse } from 'next'
import { authMiddleware } from '../../../../../lib/auth'
import { supabase } from '../../../../../lib/supabase'
import crypto from 'crypto'

async function handler(req: NextApiRequest & { user: any }, res: NextApiResponse) {
  const { id } = req.query
  if (typeof id !== 'string') { res.status(400).end(); return }
  if (req.method !== 'POST') { res.status(405).end(); return }

  const { data: workout } = await supabase
    .from('workouts')
    .select('client_id,coach_id,package_deducted')
    .eq('id', id)
    .single()
  if (!workout) { res.status(404).end(); return }
  if (workout.coach_id !== req.user.id) { res.status(403).end(); return }
  if (workout.package_deducted) { res.status(200).json({}); return }

  const { data: pkg, error } = await supabase
    .from('client_packages')
    .select('id,count')
    .eq('client_id', workout.client_id)
    .eq('coach_id', workout.coach_id)
    .single()
  if (error) { res.status(500).json({ error: error.message }); return }
  if (!pkg) { res.status(404).json({ error: 'package not found' }); return }
  if (pkg) {
    await supabase
      .from('client_packages')
      .update({ count: (pkg.count || 0) - 1 })
      .eq('id', pkg.id)
    await supabase.from('package_history').insert({
      id: crypto.randomUUID(),
      client_id: workout.client_id,
      coach_id: workout.coach_id,
      delta: -1
    })
  }
  await supabase.from('workouts').update({ package_deducted: true }).eq('id', id)
  res.status(200).json({})
}

export default authMiddleware(handler)
