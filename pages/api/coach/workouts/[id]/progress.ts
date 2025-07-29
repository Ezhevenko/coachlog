import { NextApiRequest, NextApiResponse } from 'next';
import { authMiddleware } from '../../../../../lib/auth';
import { supabase } from '../../../../../lib/supabase';

async function handler(req: NextApiRequest & { user: any }, res: NextApiResponse) {
  const { id } = req.query;
  if (typeof id !== 'string') {
    res.status(400).end();
    return;
  }
  const { data: workout } = await supabase
    .from('workouts')
    .select('coach_id')
    .eq('id', id)
    .single();
  if (!workout || workout.coach_id !== req.user.id) {
    res.status(403).end();
    return;
  }
  if (req.method === 'POST') {
    const { exerciseId, round, weight, reps } = req.body || {};
    if (!exerciseId || typeof round !== 'number') {
      res.status(400).json({ error: 'invalid data' });
      return;
    }
    const { error } = await supabase
      .from('exercise_progress')
      .insert({ workout_id: id, exercise_id: exerciseId, round, weight, reps });
    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }
    res.status(200).json({});
  } else {
    res.status(405).end();
  }
}

export default authMiddleware(handler);
