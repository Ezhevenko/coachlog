import { NextApiRequest, NextApiResponse } from 'next'
import { authMiddleware } from '../../../../lib/auth'
import { supabase } from '../../../../lib/supabase'

async function handler(req: NextApiRequest & { user: any }, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.status(405).end()
    return
  }
  const { clientId } = req.query
  if (typeof clientId !== 'string') {
    res.status(400).json({ error: 'clientId required' })
    return
  }
  const { data: link } = await supabase
    .from('client_links')
    .select('*')
    .eq('client_id', clientId)
    .eq('coach_id', req.user.id)
    .single()
  if (!link) {
    res.status(403).json({ error: 'forbidden' })
    return
  }
  const { data: workoutsData } = await supabase
    .from('workouts')
    .select('id')
    .eq('client_id', clientId)
    .eq('coach_id', req.user.id)
  const workoutIds = workoutsData?.map(w => w.id) || []
  if (workoutIds.length === 0) {
    res.status(200).json([])
    return
  }
  const { data: progressRows, error } = await supabase
    .from('exercise_progress')
    .select('workout_id,exercise_id,round,weight,reps')
    .in('workout_id', workoutIds)
  if (error) {
    res.status(500).json({ error: error.message })
    return
  }
  res.status(200).json(progressRows || [])
}

export default authMiddleware(handler)
