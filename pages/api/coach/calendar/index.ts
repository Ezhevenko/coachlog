import { NextApiRequest, NextApiResponse } from 'next';
import { authMiddleware } from '../../../../lib/auth';
import { workouts } from '../../../../lib/data';
import crypto from 'crypto';

function handler(req: NextApiRequest & { user: any }, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { date } = req.query;
    const list = Object.values(workouts).filter(w => !date || w.date === date);
    res.status(200).json(list);
  } else if (req.method === 'POST') {
    const { clientId, date, time_start, duration_minutes, rounds, exerciseIds } = req.body || {};
    if (!clientId || !date || !time_start || !duration_minutes || !Array.isArray(exerciseIds)) {
      res.status(400).json({ error: 'invalid data' });
      return;
    }
    const id = crypto.randomUUID();
    workouts[id] = { id, clientId, date, time_start, duration_minutes: Number(duration_minutes), rounds, exerciseIds };
    res.status(201).json(workouts[id]);
  } else {
    res.status(405).end();
  }
}

export default authMiddleware(handler);
