import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import { users, tokens } from './data';

const SECRET = 'secret';

export function signToken(userId: string) {
  return jwt.sign({ sub: userId }, SECRET, { expiresIn: '1d' });
}

export function verifyToken(token: string) {
  try {
    const decoded = jwt.verify(token, SECRET) as { sub: string };
    return decoded.sub;
  } catch {
    return null;
  }
}

export function authMiddleware(handler: (req: NextApiRequest & { user: any }, res: NextApiResponse) => void) {
  return (req: NextApiRequest, res: NextApiResponse) => {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const token = auth.slice(7);
    const userId = verifyToken(token);
    if (!userId || !users[userId]) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    (req as any).user = users[userId];
    handler(req as any, res);
  };
}
