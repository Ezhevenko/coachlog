process.env.MOCK_SUPABASE = '1'
import { signToken } from '../lib/auth'
import calendarHandler from '../pages/api/coach/calendar/index'
import workoutHandler from '../pages/api/coach/workouts/[id]'
import progressHandler from '../pages/api/coach/workouts/[id]/progress'

interface ReqRes { req: any, res: any }
function rr(method: string, user: string, body: any = null, query: any = {}): ReqRes {
  const req: any = { method, body, query, headers: { authorization: 'Bearer ' + signToken(user) } }
  const res: any = { statusCode: 200, body: null, status(c:number){this.statusCode=c; return this}, json(d:any){this.body=d; return this}, end(){return this} }
  return { req, res }
}

async function run() {
  const c1 = rr('POST', 'user1', { clientId: 'c1', date: '2024-06-01', time_start: '09:00', duration_minutes: 30, exerciseIds: [] })
  await calendarHandler(c1.req, c1.res)
  if (c1.res.statusCode !== 201) throw new Error('create failed')
  const id = c1.res.body.id

  const get2 = rr('GET', 'user2')
  await calendarHandler(get2.req, get2.res)
  if (Array.isArray(get2.res.body) && get2.res.body.some((w:any)=>w.id===id)) {
    throw new Error('other coach can read workout')
  }

  const post2 = rr('POST', 'user2', { clientId: 'c1', date: '2024-06-02', time_start: '10:00', duration_minutes: 30, exerciseIds: [] })
  await calendarHandler(post2.req, post2.res)
  if (post2.res.statusCode !== 403) throw new Error('other coach created workout')

  const patch2 = rr('PATCH', 'user2', { time_start: '11:00' }, { id })
  await workoutHandler(patch2.req, patch2.res)
  if (patch2.res.statusCode === 200) throw new Error('other coach modified workout')

  const prog = rr('POST', 'user2', { exerciseId: 'e1', round: 1 }, { id })
  await progressHandler(prog.req, prog.res)
  if (prog.res.statusCode !== 403) throw new Error('other coach added progress')

  console.log('Client data isolation enforced')
}

run().catch(e => { console.error(e); process.exit(1) })
