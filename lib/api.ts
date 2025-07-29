import { useAuthToken } from './auth-context'

export function useApiFetch() {
  const token = useAuthToken()
  return async function apiFetch(input: RequestInfo | URL, init: RequestInit = {}) {
    const headers = {
      ...(init.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
    const res = await fetch(input, { ...init, headers })
    if (res.status === 401 && typeof window !== 'undefined') {
      try { window.localStorage.removeItem('token') } catch {}
      try { window.location.reload() } catch {}
    }
    return res
  }
}
