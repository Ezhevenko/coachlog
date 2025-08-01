process.env.MOCK_SUPABASE = '1'
import { signToken } from '../lib/auth'
import finishHandler from '../pages/api/coach/workouts/[id]/finish'
import { supabase } from '../lib/supabase'

interface RR { req: any, res: any }
function rr(id: string): RR {
  const req: any = { method: 'POST', query: { id }, headers: { authorization: 'Bearer ' + signToken('user1') } }
  const res: any = { statusCode: 200, body: null, status(c:number){this.statusCode=c; return this}, json(d:any){this.body=d; return this}, end(){return this} }
  return { req, res }
}

async function run() {
  // successful deduction
  await supabase.from('client_packages').insert({ id: 'pkg1', client_id: 'c1', coach_id: 'user1', count: 2 })
  await supabase.from('workouts').insert({ id: 'w1', client_id: 'c1', coach_id: 'user1', date: '2020-01-01', time_start: '10:00', package_deducted: false })
  const ok = rr('w1')
  await finishHandler(ok.req, ok.res)
  if (ok.res.statusCode !== 200) throw new Error('finish failed')
  const { data: pkgOk } = await supabase.from('client_packages').select('count').eq('id', 'pkg1').single()
  if (pkgOk.count !== 1) throw new Error('package not updated')

  // missing package row
  await supabase.from('client_packages').delete().eq('id', 'pkg1')
  await supabase.from('workouts').insert({ id: 'w2', client_id: 'c1', coach_id: 'user1', date: '2020-01-02', time_start: '10:00', package_deducted: false })
  const miss = rr('w2')
  await finishHandler(miss.req, miss.res)
  if (miss.res.statusCode !== 404) throw new Error('missing package not 404')

  // multiple package rows
  await supabase.from('client_packages').insert([{ id: 'pkgA', client_id: 'c1', coach_id: 'user1', count: 1 }, { id: 'pkgB', client_id: 'c1', coach_id: 'user1', count: 1 }])
  await supabase.from('workouts').insert({ id: 'w3', client_id: 'c1', coach_id: 'user1', date: '2020-01-03', time_start: '10:00', package_deducted: false })
  const multi = rr('w3')
  await finishHandler(multi.req, multi.res)
  if (multi.res.statusCode !== 500) throw new Error('multiple rows not 500')

  console.log('finish workout endpoint error handling works')
}

run().catch(e => { console.error(e); process.exit(1) })
