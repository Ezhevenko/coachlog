import { NextApiRequest, NextApiResponse } from 'next';
import { signToken } from '../../../lib/auth';
import { supabase } from '../../../lib/supabase';
import crypto from 'crypto';
import { URLSearchParams } from 'url';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).end();
    return;
  }
  const { initData, inviteToken } = req.body || {};
  if (!initData) {
    res.status(400).json({ error: 'initData required' });
    return;
  }
  // parse Telegram user ID from initData
  let telegram_id: string;
  try {
    const params = new URLSearchParams(initData);
    const userStr = params.get('user');
    if (!userStr) throw new Error('missing user');
    const userObj = JSON.parse(userStr);
    telegram_id = String(userObj.id);
  } catch (e) {
    res.status(400).json({ error: 'invalid initData' });
    return;
  }
  let user;
  if (inviteToken) {
    const { data: invite } = await supabase
      .from('client_invites')
      .select('client_id')
      .eq('token', inviteToken)
      .single();
    if (!invite) {
      res.status(400).json({ error: 'invalid invite' });
      return;
    }
    await supabase.from('users').update({ telegram_id }).eq('id', invite.client_id);
    await supabase.from('client_invites').delete().eq('token', inviteToken);
    const { data } = await supabase.from('users').select('*').eq('id', invite.client_id).single();
    user = data;
    const { data: hasRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', invite.client_id)
      .eq('role', 'client')
      .single();
    if (!hasRole) {
      await supabase.from('user_roles').insert({ user_id: invite.client_id, role: 'client' });
    }
  } else {
    const { data } = await supabase.from('users').select('*').eq('telegram_id', telegram_id).single();
    user = data;
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
