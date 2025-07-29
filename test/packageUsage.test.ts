process.env.MOCK_SUPABASE = '1'
import { signToken } from '../lib/auth'
import calendarHandler from '../pages/api/coach/calendar/index'
import packageHandler from '../pages/api/coach/packages/[clientId]'
import processHandler from '../pages/api/coach/packages/process'

interface RR { req: any, res: any }
function rr(method: string, body: any = null, query: any = {}): RR {
  const req: any = { method, body, query, headers: { authorization: 'Bearer ' + signToken('user1') } }
  const res: any = { statusCode: 200, body: null, status(c:number){this.statusCode=c; return this}, json(d:any){this.body=d; return this}, end(){return this} }
  return { req, res }
}

async function run() {
  // Add package of 1 session
  const add = rr('POST', { delta: 1 }, { clientId: 'c1' })
  await packageHandler(add.req, add.res)
  if (add.res.statusCode !== 200) throw new Error('package add failed')

  // Schedule past workout
  const w = rr('POST', { clientId: 'c1', date: '2020-01-01', time_start: '10:00', duration_minutes: 30, exerciseIds: [] })
  await calendarHandler(w.req, w.res)
  if (w.res.statusCode !== 201) throw new Error('workout create failed')

  // Process packages
  const proc = rr('POST')
  await processHandler(proc.req, proc.res)
  if (proc.res.statusCode !== 200) throw new Error('process failed')

  // Check package count
  const get = rr('GET', null, { clientId: 'c1' })
  await packageHandler(get.req, get.res)
  if (get.res.body.count !== 0) throw new Error('package not deducted')

  console.log('Package deducted on due workout')
}

run().catch(err => { console.error(err); process.exit(1) })
