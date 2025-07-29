import { useState, useEffect } from 'react'
import { useApiFetch } from './lib/api'
import { Button } from './ui/button'
import { Card } from './ui/card'
import type { Client } from './App'

const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME

interface InviteLinkCardProps {
  client: Client
}

export function InviteLinkCard({ client }: InviteLinkCardProps) {
  const apiFetch = useApiFetch()
  const [inviteLink, setInviteLink] = useState<string | null>(null)

  useEffect(() => {
    if (!client.telegram_id.startsWith('pending:')) {
      setInviteLink(null)
      return
    }
    const loadInvite = async () => {
      const res = await apiFetch(`/api/coach/invites/${client.id}`)
      if (!res.ok) return
      const data = await res.json()
      if (data.token) {
        const link = botUsername
          ? `https://t.me/${botUsername}?startapp=invite_${data.token}`
          : `${window.location.origin}/invite/${data.token}`
        setInviteLink(link)
      }
    }
    loadInvite()
  }, [apiFetch, client.id, client.telegram_id])

  if (!inviteLink) return null

  return (
    <Card className="p-4 mt-4 bg-white shadow-sm border-0 text-center">
      <p className="text-sm text-gray-700 mb-2">Ссылка для приглашения</p>
      <div className="flex items-center gap-2">
        <span className="text-xs break-all flex-1">{inviteLink}</span>
        <Button size="sm" onClick={() => navigator.clipboard.writeText(inviteLink)}>
          Копировать
        </Button>
      </div>
    </Card>
  )
}
