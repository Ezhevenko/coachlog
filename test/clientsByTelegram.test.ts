process.env.MOCK_SUPABASE = '1'
import { signToken } from '../lib/auth'
import handler from '../pages/api/coach/clients/index'
import { supabase } from '../lib/supabase'

interface RR { req: any, res: any }
function rr(user: string): RR {
  const req: any = { method: 'GET', headers: { authorization: 'Bearer ' + signToken(user) } }
  const res: any = { statusCode: 200, body: null, status(c:number){this.statusCode=c; return this}, json(d:any){this.body=d; return this}, end(){return this} }
  return { req, res }
}

async function run() {
  await supabase.from('users').update({ telegram_id: 'tg1' }).eq('id', 'user1')
  await supabase.from('users').insert({ id: 'u2', telegram_id: 'tg1' })
  const { req, res } = rr('user1')
  await handler(req as any, res as any)
  if (res.statusCode !== 200) throw new Error('request failed')
  if (!Array.isArray(res.body) || res.body[0]?.id !== 'c1') throw new Error('clients not returned')
  console.log('Clients fetched via telegram id')
}

run().catch(e => { console.error(e); process.exit(1) })
