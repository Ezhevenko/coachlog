import { NextApiRequest, NextApiResponse } from 'next';
import { authMiddleware } from '../../../../lib/auth';
import { supabase } from '../../../../lib/supabase';

async function handler(req: NextApiRequest & { user: any }, res: NextApiResponse) {
  const { exerciseId } = req.query;
  if (req.method !== 'GET') {
    res.status(405).end();
    return;
  }
  if (typeof exerciseId !== 'string') {
    res.status(400).end();
    return;
  }
  const { data: workoutsData } = await supabase
    .from('workouts')
    .select('id')
    .eq('client_id', req.user.id);
  const workoutIds = workoutsData?.map(w => w.id) || [];
  if (workoutIds.length === 0) {
    res.status(200).json([]);
    return;
  }
  const { data: progressRows, error } = await supabase
    .from('exercise_progress')
    .select('workout_id,exercise_id,round,weight,reps')
    .eq('exercise_id', exerciseId)
    .in('workout_id', workoutIds);
  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }
  res.status(200).json(progressRows || []);
}

export default authMiddleware(handler);
