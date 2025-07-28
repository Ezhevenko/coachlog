process.env.MOCK_SUPABASE = '1'
import { signToken } from '../lib/auth'
import categoriesHandler from '../pages/api/coach/exercise-categories/index'

interface RR { req: any, res: any }
function createRR(method: string, body: any = null, query: any = {}): RR {
  const req: any = { method, body, query, headers: { authorization: 'Bearer ' + signToken('user1') } }
  const res: any = { statusCode: 200, body: null, status(c:number){this.statusCode=c; return this}, json(d:any){this.body=d; return this}, end(){return this} }
  return { req, res }
}

async function run() {
  const add = createRR('POST', { name: 'TestCat' })
  await categoriesHandler(add.req, add.res)
  if (add.res.statusCode !== 201) throw new Error('create failed')

  const get = createRR('GET')
  await categoriesHandler(get.req, get.res)
  if (get.res.statusCode !== 200) throw new Error('get failed')
  if (!Array.isArray(get.res.body) || get.res.body[0].name !== 'TestCat') {
    throw new Error('category not persisted')
  }
  console.log('Exercise categories persisted')
}

run().catch(e => { console.error(e); process.exit(1) })
