import { supabase } from '../lib/supabase'
import crypto from 'crypto'

export async function runCron(): Promise<number> {
  const { data: workouts, error } = await supabase
    .from('workouts')
    .select('id,client_id,coach_id,date,time_start,package_deducted')
    .eq('package_deducted', false)
  if (error) throw new Error(error.message)

  const now = new Date()
  let processed = 0
  for (const w of workouts || []) {
    const ts = new Date(`${w.date}T${w.time_start || '00:00'}`)
    if (ts > now) continue
    const { data: pkg } = await supabase
      .from('client_packages')
      .select('id,count')
      .eq('client_id', w.client_id)
      .eq('coach_id', w.coach_id)
      .single()
    if (pkg) {
      await supabase
        .from('client_packages')
        .update({ count: (pkg.count || 0) - 1 })
        .eq('id', pkg.id)
      await supabase.from('package_history').insert({
        id: crypto.randomUUID(),
        client_id: w.client_id,
        coach_id: w.coach_id,
        delta: -1
      })
    }
    await supabase.from('workouts').update({ package_deducted: true }).eq('id', w.id)
    processed++
  }
  return processed
}

if (require.main === module) {
  runCron()
    .then(p => {
      console.log(`Processed ${p} workouts`)
    })
    .catch(err => {
      console.error(err)
      process.exit(1)
    })
}
