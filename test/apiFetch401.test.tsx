process.env.MOCK_SUPABASE = '1'
import { JSDOM } from 'jsdom'
import React, { useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { AuthContext } from '../lib/auth-context'
import { useApiFetch } from '../lib/api'

async function run() {
  const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', { url: 'http://localhost' })
  global.window = dom.window as any
  global.document = dom.window.document as any

  window.localStorage.setItem('token', 'tok123')

  global.fetch = async () => ({ status: 401 }) as any

  const Test = () => {
    const apiFetch = useApiFetch()
    useEffect(() => { apiFetch('/api') }, [apiFetch])
    return null
  }

  const root = createRoot(document.getElementById('root')!)
  root.render(
    <AuthContext.Provider value="tok123">
      <Test />
    </AuthContext.Provider>
  )

  await new Promise(res => setTimeout(res, 20))
  if (window.localStorage.getItem('token')) throw new Error('token not cleared')
  console.log('401 triggers re-auth')
}

run().catch(err => { console.error(err); process.exit(1) })
