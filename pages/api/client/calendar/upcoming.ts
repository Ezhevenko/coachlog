import { NextApiRequest, NextApiResponse } from 'next';
import { authMiddleware } from '../../../../lib/auth';
import { workouts } from '../../../../lib/data';

function handler(req: NextApiRequest & { user: any }, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.status(405).end();
    return;
  }
  const upcoming = Object.values(workouts)
    .filter(w => w.clientId === req.user.id)
    .sort((a, b) => (a.date + a.time_start).localeCompare(b.date + b.time_start))[0];
  res.status(200).json(upcoming || null);
}

export default authMiddleware(handler);
