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
  await supabase.from('client_packages').insert({ id: 'pkgM', client_id: 'c1', coach_id: 'user1', count: 1 })
  await supabase.from('workouts').insert({ id: 'mw1', client_id: 'c1', coach_id: 'user1', date: '2021-01-01', time_start: '10:00', package_deducted: false })
  const { req, res } = rr('mw1')
  await finishHandler(req, res)
  if (res.statusCode !== 200) throw new Error('finish failed')
  const { data: workout } = await supabase.from('workouts').select('package_deducted').eq('id','mw1').single()
  if (!workout.package_deducted) throw new Error('flag not updated')
  const { data: pkg } = await supabase.from('client_packages').select('count').eq('id','pkgM').single()
  if (pkg.count !== 0) throw new Error('package count not decreased')
  const { data: hist } = await supabase.from('package_history').select('*').eq('client_id','c1').eq('coach_id','user1')
  if (!hist || hist.length !== 1) throw new Error('history not inserted')
  console.log('manual finish deducts package')
}

run().catch(err => { console.error(err); process.exit(1) })
