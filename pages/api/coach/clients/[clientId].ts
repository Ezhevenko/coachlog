import { NextApiRequest, NextApiResponse } from 'next';
import { authMiddleware } from '../../../../lib/auth';
import { supabase } from '../../../../lib/supabase';

async function handler(req: NextApiRequest & { user: any }, res: NextApiResponse) {
  const { clientId } = req.query;
  if (req.method === 'DELETE') {
    if (typeof clientId !== 'string') {
      res.status(400).end();
      return;
    }
    await supabase.from('client_links').delete().match({ client_id: clientId, coach_id: req.user.id });
    res.status(204).end();
  } else {
    res.status(405).end();
  }
}

export default authMiddleware(handler);
