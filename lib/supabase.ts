import { createClient } from '@supabase/supabase-js'

let supabase: any

if (process.env.MOCK_SUPABASE) {
  const { createMockSupabase } = require('./supabase-mock')
  supabase = createMockSupabase()
} else {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error(
      'Supabase environment variables missing. ' +
      'Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your environment.'
    )
  }

  supabase = createClient(url, key, {
    auth: { persistSession: false }
  })
}

export { supabase }
