import { NextApiRequest, NextApiResponse } from 'next';
import { authMiddleware } from '../../../../lib/auth';
import { supabase } from '../../../../lib/supabase';

async function handler(req: NextApiRequest & { user: any }, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.status(405).end();
    return;
  }
  const { data, error } = await supabase
    .from('workouts')
    .select('*')
    .eq('client_id', req.user.id)
    .order('date', { ascending: true })
    .order('time_start', { ascending: true })
    .limit(1);
  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }
  const workout = data?.[0] || null;
  if (!workout) {
    res.status(200).json(null);
    return;
  }
  const { data: exRows } = await supabase
    .from('workout_exercises')
    .select('exercise_id')
    .eq('workout_id', workout.id);
  const exerciseIds = exRows?.map(e => e.exercise_id) || [];
  res.status(200).json({
    id: workout.id,
    clientId: workout.client_id,
    date: workout.date,
    time_start: workout.time_start,
    duration_minutes: workout.duration_minutes,
    rounds: workout.rounds,
    exerciseIds
  });
}

export default authMiddleware(handler);
