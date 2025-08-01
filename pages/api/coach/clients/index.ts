import { NextApiRequest, NextApiResponse } from 'next';
import { authMiddleware } from '../../../../lib/auth';
import { supabase } from '../../../../lib/supabase';
import crypto from 'crypto';

async function handler(req: NextApiRequest & { user: any }, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { data: coachRow } = await supabase
      .from('users')
      .select('id')
      .eq('telegram_id', req.user.telegram_id)
      .single();
    const coachId = coachRow?.id || req.user.id;
    const { data: links } = await supabase
      .from('client_links')
      .select('client_id')
      .eq('coach_id', coachId);
    const ids = links?.map(l => l.client_id) || [];
    if (ids.length === 0) {
      res.status(200).json([]);
      return;
    }
    const { data: rows, error } = await supabase
      .from('users')
      .select('id, telegram_id, full_name')
      .in('id', ids);
    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }
    res.status(200).json(rows || []);
  } else if (req.method === 'POST') {
    const { data: coachRow } = await supabase
      .from('users')
      .select('id')
      .eq('telegram_id', req.user.telegram_id)
      .single();
    const coachId = coachRow?.id || req.user.id;
    const { telegram_id, full_name } = req.body || {};
    if (!full_name) {
      res.status(400).json({ error: 'invalid data' });
      return;
    }
    if (telegram_id) {
      const { data: existing } = await supabase
        .from('users')
        .select('id')
        .eq('telegram_id', telegram_id)
        .single();
      if (existing) {
        res.status(409).json({ error: 'telegram_id already in use' });
        return;
      }
    }
    const id = crypto.randomUUID();
    const pendingTelegram = telegram_id || `pending:${crypto.randomUUID()}`;
    const { data: created, error } = await supabase
      .from('users')
      .insert({ id, telegram_id: pendingTelegram, full_name })
      .select('id, telegram_id, full_name')
      .single();
    if (error || !created) {
      res.status(500).json({ error: error?.message || 'failed to create' });
      return;
    }
    await supabase.from('user_roles').insert({ user_id: id, role: 'client' });
    await supabase.from('client_links').insert({ client_id: id, coach_id: coachId });
    let inviteToken: string | null = null;
    if (!telegram_id) {
      inviteToken = crypto.randomUUID();
      await supabase
        .from('client_invites')
        .insert({ token: inviteToken, client_id: id, coach_id: coachId });

      const botToken = process.env.BOT_TOKEN;
      const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME;
      const webAppUrl = process.env.WEBAPP_URL || 'https://coachlog.vercel.app';
      const coachTelegramId = req.user.telegram_id;

      if (botToken && coachTelegramId && !coachTelegramId.startsWith('pending:')) {
        const inviteLink = botUsername
          ? `https://t.me/${botUsername}?startapp=invite_${inviteToken}`
          : `${webAppUrl}/invite/${inviteToken}`;
        const resp = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: coachTelegramId,
            text: 'Перешлите ссылку клиенту:',
            reply_markup: {
              inline_keyboard: [[{ text: 'Присоединиться', url: inviteLink }]],
            },
          }),
        });
        if (!resp.ok) {
          console.error('Failed to send invite link', await resp.text());
        }
      }
    }
    res.status(200).json({ ...created, inviteToken });
  } else {
    res.status(405).end();
  }
}

export default authMiddleware(handler);
