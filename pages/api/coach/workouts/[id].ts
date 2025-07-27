import { NextApiRequest, NextApiResponse } from 'next';
import { authMiddleware } from '../../../../lib/auth';
import { supabase } from '../../../../lib/supabase';

async function handler(req: NextApiRequest & { user: any }, res: NextApiResponse) {
  const { id } = req.query;
  if (typeof id !== 'string') {
    res.status(400).end();
    return;
  }
  if (req.method === 'PATCH') {
    const { clientId, date, time_start, duration_minutes, rounds, exerciseIds } = req.body || {};
    if (!time_start) {
      res.status(400).json({ error: 'invalid data' });
      return;
    }
    const { error } = await supabase
      .from('workouts')
      .update({
        client_id: clientId,
        date,
        time_start,
        duration_minutes: duration_minutes !== undefined ? Number(duration_minutes) : 60,
        rounds,
      })
      .eq('id', id);
    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }
    await supabase.from('workout_exercises').delete().eq('workout_id', id);
    for (let i = 0; i < (exerciseIds || []).length; i++) {
      await supabase.from('workout_exercises').insert({ workout_id: id, exercise_id: exerciseIds[i], order_index: i });
    }
    res.status(200).json({
      id,
      clientId,
      date,
      time_start,
      duration_minutes: duration_minutes !== undefined ? Number(duration_minutes) : 60,
      rounds,
      exerciseIds,
    });
  } else if (req.method === 'DELETE') {
    await supabase.from('workouts').delete().eq('id', id);
    res.status(204).end();
  } else {
    res.status(405).end();
  }
}

export default authMiddleware(handler);
