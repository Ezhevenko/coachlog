import { NextApiRequest, NextApiResponse } from 'next';
import { signToken } from '../../../lib/auth';
import { supabase } from '../../../lib/supabase';
import crypto from 'crypto';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
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
  let { data: user } = await supabase.from('users').select('*').eq('telegram_id', telegram_id).single();
  if (!user) {
    const { data: created, error } = await supabase
      .from('users')
      .insert({ telegram_id, full_name: `User ${telegram_id}` })
      .select()
      .single();
    if (error || !created) {
      res.status(500).json({ error: error?.message || 'Failed to create user' });
      return;
    }
    user = created;
    await supabase.from('user_roles').insert([{ user_id: user.id, role: 'coach' }, { user_id: user.id, role: 'client' }]);
  }
  const { data: rolesData } = await supabase.from('user_roles').select('role').eq('user_id', user.id);
  const roles = rolesData?.map(r => r.role) || ['coach'];
  let { data: active } = await supabase
    .from('active_roles')
    .select('active_role')
    .eq('user_id', user.id)
    .single();
  if (!active) {
    active = { active_role: 'coach' };
    await supabase.from('active_roles').insert({ user_id: user.id, active_role: 'coach' });
  }
  const responseUser = { id: user.id, telegram_id: user.telegram_id, full_name: user.full_name, roles, activeRole: active.active_role };
  const token = signToken(user.id);
  res.status(200).json({ token, user: responseUser });
}
