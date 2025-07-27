import { NextApiRequest, NextApiResponse } from 'next';
import { users, telegramUserMap } from '../../../lib/data';
import { signToken } from '../../../lib/auth';
import crypto from 'crypto';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).end();
    return;
  }
  const { initData } = req.body || {};
  if (!initData) {
    res.status(400).json({ error: 'initData required' });
    return;
  }
  // simple stub: telegram_id from initData
  const telegram_id = String(initData);
  let userId = telegramUserMap[telegram_id];
  if (!userId) {
    userId = crypto.randomUUID();
    telegramUserMap[telegram_id] = userId;
    users[userId] = {
      id: userId,
      telegram_id,
      full_name: `User ${telegram_id}`,
      roles: ['coach', 'client'],
      activeRole: 'coach',
    };
  }
  const token = signToken(userId);
  res.status(200).json({ token, user: users[userId] });
}
