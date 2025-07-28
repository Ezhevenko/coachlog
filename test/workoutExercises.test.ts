process.env.MOCK_SUPABASE = '1'
import { signToken } from '../lib/auth'
import handler from '../pages/api/coach/calendar/index'

interface ReqRes {
  req: any
  res: any
}

function createReqRes(method: string, body: any = null, query: any = {}) : ReqRes {
  const req: any = { method, body, query, headers: { authorization: 'Bearer ' + signToken('user1') } }
  const res: any = {
    statusCode: 200,
    body: null,
    status(code: number) { this.statusCode = code; return this },
    json(data: any) { this.body = data; return this },
    end() { return this }
  }
  return { req, res }
}

async function run() {
  const { req, res } = createReqRes('POST', { clientId: 'c1', date: '2024-05-01', time_start: '10:00', duration_minutes: 30, exerciseIds: ['e1','e2'] })
  await handler(req, res)
  if (res.statusCode !== 201) throw new Error('POST failed')

  const get = createReqRes('GET')
  await handler(get.req, get.res)
  if (get.res.statusCode !== 200) throw new Error('GET failed')
  const list = get.res.body
  if (!Array.isArray(list) || list.length === 0) throw new Error('No workouts returned')
  const ids = list[0].exerciseIds
  if (ids.length !== 2 || ids[0] !== 'e1' || ids[1] !== 'e2') {
    throw new Error('Exercise IDs not persisted')
  }
  console.log('Workout exercises persisted')
}

run().catch(err => { console.error(err); process.exit(1) })
