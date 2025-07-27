import { NextApiRequest, NextApiResponse } from 'next';
import { authMiddleware } from '../../../../../lib/auth';
import { clients } from '../../../../../lib/data';

function handler(req: NextApiRequest & { user: any }, res: NextApiResponse) {
  const { clientId } = req.query;
  if (req.method === 'DELETE') {
    if (typeof clientId !== 'string') {
      res.status(400).end();
      return;
    }
    delete clients[clientId];
    res.status(204).end();
  } else {
    res.status(405).end();
  }
}

export default authMiddleware(handler);
