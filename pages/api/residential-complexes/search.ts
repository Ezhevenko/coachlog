import { NextApiRequest, NextApiResponse } from 'next'
import { authMiddleware } from '../../../lib/auth'
import { supabase } from '../../../lib/supabase'

type AuthedRequest = NextApiRequest & { user: any }

function sanitizeSearchTerm(term: string): string {
  return term
    .replace(/[\s]+/g, ' ')
    .replace(/[^\p{L}\p{N}\s-]+/gu, '')
    .trim()
}

export async function handleSearchResidentialComplexes(req: AuthedRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.status(405).end()
    return
  }

  const rawQuery = typeof req.query.q === 'string' ? req.query.q : Array.isArray(req.query.q) ? req.query.q[0] : ''
  const sanitizedQuery = sanitizeSearchTerm(rawQuery || '')

  if (!sanitizedQuery) {
    res.status(200).json([])
    return
  }

  const { data, error } = await supabase.from('residential_complexes').select('*')
  if (error) {
    res.status(500).json({ error: error.message })
    return
  }

  const needle = sanitizedQuery.toLowerCase()
  const results = (Array.isArray(data) ? data : []).filter(row => {
    const name = String(row.name || '').toLowerCase()
    const address = String(row.address || '').toLowerCase()
    return name.includes(needle) || address.includes(needle)
  })

  res.status(200).json(results)
}

export default authMiddleware(handleSearchResidentialComplexes)
