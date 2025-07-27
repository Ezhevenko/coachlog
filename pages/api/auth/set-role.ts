import { NextApiRequest, NextApiResponse } from 'next';
import { authMiddleware } from '../../../lib/auth';
import { users } from '../../../lib/data';

function handler(req: NextApiRequest & { user: any }, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).end();
    return;
  }
  const { role } = req.body || {};
  if (role !== 'coach' && role !== 'client') {
    res.status(400).json({ error: 'invalid role' });
    return;
  }
  const user = req.user;
  user.activeRole = role;
  users[user.id] = user;
  res.status(200).json({ activeRole: role });
}

export default authMiddleware(handler);
