import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { AuthContext } from '../../lib/auth-context'
import App from '../../App'

const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME

export default function InvitePage() {
  const router = useRouter()
  const { token: inviteToken } = router.query
  const [token, setToken] = useState<string | null>(null)
  const [authFailed, setAuthFailed] = useState(false)

  useEffect(() => {
    if (!inviteToken || typeof inviteToken !== 'string') return
    if (typeof window === 'undefined') return

    if (!(window as any).Telegram?.WebApp) {
      if (botUsername) {
        window.location.href = `https://t.me/${botUsername}?startapp=/invite/${inviteToken}`
      }
      return
    }

    const existing = window.localStorage.getItem('token')
    if (existing) {
      setToken(existing)
      return
    }

    const verify = (initData: string) => {
      fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initData, inviteToken })
      })
        .then(res => (res.ok ? res.json() : Promise.reject(res)))
        .then(data => {
          window.localStorage.setItem('token', data.token)
          setToken(data.token)
        })
        .catch(() => setAuthFailed(true))
    }

    const handleReady = () => {
      const initData = (window as any).Telegram?.WebApp?.initData
      if (initData) {
        verify(initData)
      } else {
        setAuthFailed(true)
      }
    }

    handleReady()
  }, [inviteToken])

  if (token) {
    return (
      <AuthContext.Provider value={token}>
        <App />
      </AuthContext.Provider>
    )
  }

  if (authFailed) {
    return <div>Open via Telegram</div>
  }

  return <div>Authenticating...</div>
}
