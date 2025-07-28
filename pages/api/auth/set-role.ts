import { NextApiRequest, NextApiResponse } from 'next';
import { authMiddleware } from '../../../lib/auth';
import { supabase } from '../../../lib/supabase';

async function handler(req: NextApiRequest & { user: any }, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).end();
    return;
  }
  const { role } = req.body || {};
  if (role !== 'coach' && role !== 'client') {
    res.status(400).json({ error: 'invalid role' });
    return;
  }
  const { error } = await supabase
    .from('active_roles')
    .upsert({ user_id: req.user.id, active_role: role }, { onConflict: 'user_id' });
  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }
  res.status(200).json({ activeRole: role });
}

export default authMiddleware(handler);
