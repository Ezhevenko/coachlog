import { NextApiRequest, NextApiResponse } from 'next';
import { authMiddleware } from '../../../../lib/auth';
import { workouts } from '../../../../lib/data';

function handler(req: NextApiRequest & { user: any }, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.status(405).end();
    return;
  }
  const { date } = req.query;
  const list = Object.values(workouts).filter(w => (!date || w.date === date) && w.clientId === req.user.id);
  res.status(200).json(list);
}

export default authMiddleware(handler);
