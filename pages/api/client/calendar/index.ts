import { NextApiRequest, NextApiResponse } from 'next';
import { authMiddleware } from '../../../../lib/auth';
import { supabase } from '../../../../lib/supabase';

async function handler(req: NextApiRequest & { user: any }, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.status(405).end();
    return;
  }
  const { date } = req.query;
  const qb = supabase.from('workouts').select('*').eq('client_id', req.user.id);
  if (typeof date === 'string') {
    qb.eq('date', date);
  }
  const { data: workoutRows, error } = await qb;
  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }
  const workoutIds = workoutRows?.map(w => w.id) || [];
  const { data: exercises } = await supabase
    .from('workout_exercises')
    .select('workout_id,exercise_id')
    .in('workout_id', workoutIds);
  const map: Record<string, string[]> = {};
  exercises?.forEach(e => {
    (map[e.workout_id] ||= []).push(e.exercise_id);
  });
  const list = workoutRows.map(w => ({
    id: w.id,
    clientId: w.client_id,
    date: w.date,
    time_start: w.time_start,
    duration_minutes: w.duration_minutes,
    rounds: w.rounds,
    exerciseIds: map[w.id] || []
  }));
  res.status(200).json(list);
}

export default authMiddleware(handler);
