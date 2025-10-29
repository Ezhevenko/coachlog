import { NextApiRequest, NextApiResponse } from 'next'
import { authMiddleware } from '../../../lib/auth'
import { supabase } from '../../../lib/supabase'

type AuthedRequest = NextApiRequest & { user: any }

function sanitizeStatus(value: string): string | null {
  const trimmed = value.trim().toLowerCase()
  if (!/^[a-z0-9_-]+$/.test(trimmed)) return null
  return trimmed
}

function getStatuses(param: string | string[] | undefined): string[] {
  if (!param) return []
  const raw = Array.isArray(param) ? param.join(',') : param
  return raw
    .split(',')
    .map(sanitizeStatus)
    .filter((status): status is string => Boolean(status))
}

export async function handleListResidentialComplexes(req: AuthedRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.status(405).end()
    return
  }

  const { data, error } = await supabase.from('residential_complexes').select('*')
  if (error) {
    res.status(500).json({ error: error.message })
    return
  }

  const statuses = getStatuses(req.query.status)
  const rows = Array.isArray(data) ? data : []
  const filtered = statuses.length
    ? rows.filter(row => {
        const status = String(row.status || '').toLowerCase()
        return statuses.includes(status)
      })
    : rows

  res.status(200).json(filtered)
}

export default authMiddleware(handleListResidentialComplexes)
