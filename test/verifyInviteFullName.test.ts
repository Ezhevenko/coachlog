process.env.MOCK_SUPABASE = '1'
process.env.TELEGRAM_BOT_TOKEN = 'bot123'
import crypto from 'crypto'
import handler from '../pages/api/auth/verify'
import { supabase } from '../lib/supabase'

interface RR { req: any, res: any }
function rr(body: any): RR {
  const req: any = { method: 'POST', body }
  const res: any = { statusCode: 200, body: null, status(c:number){this.statusCode=c; return this}, json(d:any){this.body=d; return this}, end(){return this} }
  return { req, res }
}

function makeInitData(user: any): string {
  const params = new URLSearchParams()
  params.append('user', JSON.stringify(user))
  params.append('query_id', 'q1')
  params.append('auth_date', '1')
  const dataCheckString = [...params.entries()].map(([k,v])=>`${k}=${v}`).sort().join('\n')
  const secret = crypto.createHmac('sha256', 'WebAppData').update(process.env.TELEGRAM_BOT_TOKEN || '').digest()
  const hash = crypto.createHmac('sha256', secret).update(dataCheckString).digest('hex')
  params.append('hash', hash)
  return params.toString()
}

async function run() {
  await supabase.from('client_invites').insert({ token: 'tok1', client_id: 'c1', coach_id: 'user1' })
  const userObj = { id: 10, username: 'nick' }
  const initData = makeInitData(userObj)
  const { req, res } = rr({ initData, inviteToken: 'tok1' })
  await handler(req as any, res as any)
  if (res.statusCode !== 200) throw new Error('verify failed')
  const { data: user } = await supabase.from('users').select('*').eq('id', 'c1').single()
  if (user?.full_name !== 'nick') throw new Error('name not updated')
  console.log('Invite verification updates full name')
}

run().catch(err => { console.error(err); process.exit(1) })
