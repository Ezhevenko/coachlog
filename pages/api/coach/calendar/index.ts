import { NextApiRequest, NextApiResponse } from 'next';
import { authMiddleware } from '../../../../lib/auth';
import { supabase } from '../../../../lib/supabase';
import crypto from 'crypto';

async function handler(req: NextApiRequest & { user: any }, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { date } = req.query;
    const qb = supabase.from('workouts').select('*').eq('coach_id', req.user.id);
    if (typeof date === 'string') qb.eq('date', date);
    const { data: rows, error } = await qb;
    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }
    const workoutIds = rows?.map(w => w.id) || [];
    if (workoutIds.length === 0) {
      res.status(200).json([]);
      return;
    }
    const { data: ex } = await supabase
      .from('workout_exercises')
      .select('workout_id,exercise_id')
      .in('workout_id', workoutIds);
    const map: Record<string, string[]> = {};
    ex?.forEach(e => { (map[e.workout_id] ||= []).push(e.exercise_id); });
    const list = rows.map(w => ({
      id: w.id,
      clientId: w.client_id,
      date: w.date,
      time_start: w.time_start,
      duration_minutes: w.duration_minutes,
      rounds: w.rounds,
      exerciseIds: map[w.id] || []
    }));
    res.status(200).json(list);
  } else if (req.method === 'POST') {
    const { clientId, date, time_start, duration_minutes, rounds, exerciseIds } =
      req.body || {};
    if (!clientId || !date || !Array.isArray(exerciseIds) || !time_start) {
      res.status(400).json({ error: 'invalid data' });
      return;
    }
    const { data: link } = await supabase
      .from('client_links')
      .select('*')
      .eq('client_id', clientId)
      .eq('coach_id', req.user.id)
      .single();
    if (!link) {
      res.status(403).json({ error: 'forbidden' });
      return;
    }
    const id = crypto.randomUUID();
    const insertData: Record<string, any> = {
      id,
      client_id: clientId,
      coach_id: req.user.id,
      date,
      package_deducted: false,
      rounds,
    };
    insertData.time_start = time_start;
    insertData.duration_minutes = duration_minutes !== undefined
      ? Number(duration_minutes)
      : 60;
    const { error: insertErr } = await supabase.from('workouts').insert(insertData);
    if (insertErr) {
      res.status(500).json({ error: insertErr.message });
      return;
    }
    for (let i = 0; i < exerciseIds.length; i++) {
      await supabase
        .from('workout_exercises')
        .insert({ workout_id: id, exercise_id: exerciseIds[i], order_index: i });
    }
    res.status(201).json({ id, clientId, date, time_start, duration_minutes: duration_minutes !== undefined ? Number(duration_minutes) : 60, rounds, exerciseIds });
  } else {
    res.status(405).end();
  }
}

export default authMiddleware(handler);
