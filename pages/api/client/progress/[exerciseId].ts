import { NextApiRequest, NextApiResponse } from 'next';
import { authMiddleware } from '../../../../../lib/auth';
import { progress, workouts } from '../../../../../lib/data';

function handler(req: NextApiRequest & { user: any }, res: NextApiResponse) {
  const { exerciseId } = req.query;
  if (req.method !== 'GET') {
    res.status(405).end();
    return;
  }
  if (typeof exerciseId !== 'string') {
    res.status(400).end();
    return;
  }
  const items = progress.filter(p => {
    if (p.exerciseId !== exerciseId) return false;
    const w = workouts[p.workoutId];
    return w && w.clientId === req.user.id;
  });
  res.status(200).json(items);
}

export default authMiddleware(handler);
