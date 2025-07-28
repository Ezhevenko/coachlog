import { NextApiRequest, NextApiResponse } from 'next'
import { authMiddleware } from '../../../../lib/auth'
import { supabase } from '../../../../lib/supabase'
import crypto from 'crypto'

async function handler(req: NextApiRequest & { user: any }, res: NextApiResponse) {
  const { clientId } = req.query
  if (typeof clientId !== 'string') { res.status(400).end(); return }

  if (req.method === 'GET') {
    const { data: pkg } = await supabase
      .from('client_packages')
      .select('id,count')
      .eq('client_id', clientId)
      .eq('coach_id', req.user.id)
      .single()
    const count = pkg?.count || 0
    const { data: history } = await supabase
      .from('package_history')
      .select('id,delta,created_at')
      .eq('client_id', clientId)
      .eq('coach_id', req.user.id)
      .order('created_at', { ascending: false })
    res.status(200).json({ count, history: history || [] })
  } else if (req.method === 'POST') {
    const delta = Number((req.body || {}).delta)
    if (!delta || isNaN(delta)) { res.status(400).json({ error: 'invalid delta' }); return }
    let { data: pkg } = await supabase
      .from('client_packages')
      .select('id,count')
      .eq('client_id', clientId)
      .eq('coach_id', req.user.id)
      .single()
    if (!pkg) {
      const id = crypto.randomUUID()
      await supabase.from('client_packages').insert({ id, client_id: clientId, coach_id: req.user.id, count: delta })
      pkg = { id, count: delta }
    } else {
      pkg.count += delta
      await supabase.from('client_packages').update({ count: pkg.count }).eq('id', pkg.id)
    }
    const histId = crypto.randomUUID()
    await supabase.from('package_history').insert({ id: histId, client_id: clientId, coach_id: req.user.id, delta })
    res.status(200).json({ id: pkg.id, count: pkg.count })
  } else {
    res.status(405).end()
  }
}

export default authMiddleware(handler)
