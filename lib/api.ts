import { useAuthToken } from './auth-context'

export function useApiFetch() {
  const token = useAuthToken()
  return async function apiFetch(input: RequestInfo | URL, init: RequestInit = {}) {
    const headers = {
      ...(init.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
    return fetch(input, { ...init, headers })
  }
}
