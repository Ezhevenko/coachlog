import { useState, useEffect } from 'react'
import { useApiFetch } from './lib/api'
import { Button } from './ui/button'
import { Card } from './ui/card'
import WorkoutCalendar from './components/WorkoutCalendar'
import { Trash2 } from 'lucide-react@0.487.0'
import type { Client } from './App'
import { ClientPackage } from './ClientPackage'
const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME

interface TrainingProgramProps {
  client: Client
  onOpenTraining: (
    client: Client,
    day: string,
    date: string,
    workoutId?: string
  ) => void
  onOpenEdit: (
    client: Client,
    day: string,
    date: string,
    workoutId?: string,
    start?: string,
  duration?: string
  ) => void
  onDeleteClient?: (clientId: string) => void
  allowEdit?: boolean
  allowStart?: boolean
  hideHeader?: boolean
}

export function TrainingProgram({
  client,
  onOpenTraining,
  onOpenEdit,
  onDeleteClient,
  allowEdit = true,
  allowStart = true,
  hideHeader = false
}: TrainingProgramProps) {
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
  }, [client.id, client.telegram_id])


  return (
    <div className="max-w-md mx-auto p-4 pt-6 pb-6 min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50">
      {!hideHeader && (
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div>
              <h1 className="text-lg font-bold text-gray-800">{client.name}</h1>
              <p className="text-sm text-blue-600">Программа тренировок</p>
            </div>
          </div>
          {onDeleteClient && (
            <Button
              onClick={() => onDeleteClient(client.id)}
              variant="destructive"
              size="icon"
              className="bg-red-500 hover:bg-red-600"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      )}

      <ClientPackage client={client} editable={allowEdit} />

      <WorkoutCalendar
        clients={[client]}
        clientId={client.id}
        onOpenTraining={allowStart ? onOpenTraining : undefined}
        onOpenEdit={allowEdit ? onOpenEdit : undefined}
        hideClientName
      />

      {inviteLink && (
        <Card className="p-4 mt-4 bg-white shadow-sm border-0 text-center">
          <p className="text-sm text-gray-700 mb-2">Ссылка для приглашения</p>
          <div className="flex items-center gap-2">
            <span className="text-xs break-all flex-1">{inviteLink}</span>
            <Button size="sm" onClick={() => navigator.clipboard.writeText(inviteLink)}>
              Копировать
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}
