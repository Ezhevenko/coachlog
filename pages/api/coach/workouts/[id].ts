import { NextApiRequest, NextApiResponse } from 'next';
import { authMiddleware } from '../../../../lib/auth';
import { workouts } from '../../../../lib/data';

function handler(req: NextApiRequest & { user: any }, res: NextApiResponse) {
  const { id } = req.query;
  if (typeof id !== 'string') {
    res.status(400).end();
    return;
  }
  if (req.method === 'PATCH') {
    const { clientId, date, time_start, duration_minutes, rounds, exerciseIds } = req.body || {};
    const existing = workouts[id];
    if (!existing) {
      res.status(404).end();
      return;
    }
    workouts[id] = { ...existing, clientId, date, time_start, duration_minutes, rounds, exerciseIds };
    res.status(200).json(workouts[id]);
  } else if (req.method === 'DELETE') {
    delete workouts[id];
    res.status(204).end();
  } else {
    res.status(405).end();
  }
}

export default authMiddleware(handler);
