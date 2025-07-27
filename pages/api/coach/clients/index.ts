import { NextApiRequest, NextApiResponse } from 'next';
import { authMiddleware } from '../../../../../lib/auth';
import { clients } from '../../../../../lib/data';
import crypto from 'crypto';

function handler(req: NextApiRequest & { user: any }, res: NextApiResponse) {
  if (req.method === 'GET') {
    res.status(200).json(Object.values(clients));
  } else if (req.method === 'POST') {
    const { telegram_id, full_name } = req.body || {};
    if (!telegram_id || !full_name) {
      res.status(400).json({ error: 'invalid data' });
      return;
    }
    const id = crypto.randomUUID();
    clients[id] = { id, telegram_id, full_name };
    res.status(200).json(clients[id]);
  } else {
    res.status(405).end();
  }
}

export default authMiddleware(handler);
