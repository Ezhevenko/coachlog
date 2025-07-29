process.env.MOCK_SUPABASE = '1'
process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME = 'mybot'
import { JSDOM } from 'jsdom'
import React from 'react'
import { createRoot } from 'react-dom/client'
import { InviteLinkCard } from '../InviteLinkCard'
import { AuthContext } from '../lib/auth-context'

global.fetch = async () => ({
  ok: true,
  json: async () => ({ token: 'tok123' })
}) as any

async function run() {
  const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', { url: 'http://localhost' })
  global.window = dom.window as any
  global.document = dom.window.document as any

  Object.defineProperty(global, 'navigator', {
    value: dom.window.navigator,
    configurable: true
  })

  const rootElem = document.getElementById('root')!
  const root = createRoot(rootElem)
  root.render(
    <AuthContext.Provider value="t">
      <InviteLinkCard client={{ id: 'c1', name: 'c1', telegram_id: 'pending:1' }} />
    </AuthContext.Provider>
  )

  await new Promise(res => setTimeout(res, 50))
  
  const text = document.body.textContent || ''
  if (!text.includes('https://t.me/mybot?startapp=invite_tok123')) {
    throw new Error('invite link not rendered')
  }
  console.log('Invite link rendered')
}

run().catch(err => { console.error(err); process.exit(1) })
