import { NextApiRequest, NextApiResponse } from 'next';
import { authMiddleware } from '../../../../../lib/auth';
import { progress, workouts } from '../../../../../lib/data';

function handler(req: NextApiRequest & { user: any }, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.status(405).end();
    return;
  }
  const userProgress = progress.filter(p => {
    const w = workouts[p.workoutId];
    return w && w.clientId === req.user.id;
  });
  res.status(200).json(userProgress);
}

export default authMiddleware(handler);
