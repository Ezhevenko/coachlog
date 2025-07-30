import { useState, useEffect } from 'react'
import { useApiFetch } from './lib/api'
import { Button } from './ui/button'
import { Card } from './ui/card'
import WorkoutCalendar from './components/WorkoutCalendar'
import { ArrowLeft, Trash2 } from 'lucide-react@0.487.0'
import type { Client } from './App'
import { ClientPackage } from './ClientPackage'
const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME

interface TrainingProgramProps {
  client: Client
  onBack: () => void
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
  canStart?: boolean
}


const WEEKDAYS = [
  'Воскресенье',
  'Понедельник',
  'Вторник', 
  'Среда',
  'Четверг',
  'Пятница',
  'Суббота'
]

export function TrainingProgram({
  client,
  onBack,
  onOpenTraining,
  onOpenEdit,
  onDeleteClient,
  allowEdit = true,
  canStart = true
}: TrainingProgramProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
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
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Button
            onClick={onBack}
            variant="ghost"
            size="icon"
            className="hover:bg-blue-100"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
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


      <ClientPackage
        client={client}
        onCountChange={setPackageCount}
        canEdit={allowEdit}
      />

      {/* Calendar */}
      <Card className="p-4 mb-6 bg-white shadow-sm border-0">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(date: Date | undefined) => date && setSelectedDate(date)}
          className="rounded-md"
          modifiersClassNames={{ hasTraining: 'rdp-day_hasTraining' }}
          modifiers={{
            hasTraining: (date: Date) => hasTrainingOnDate(date)
          }}
        />
        <div className="flex items-center gap-4 mt-4 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-100 border border-green-300 rounded-full"></div>
            <span>Есть тренировка</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-gray-100 border border-gray-300 rounded-full"></div>
            <span>Свободный день</span>
          </div>
        </div>
      </Card>

      {/* Training Actions */}
      <Card className="p-6 bg-white shadow-sm border-0">
        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">{selectedDayName}</h3>
          <p className="text-sm text-gray-500">
            {selectedDate.toLocaleDateString('ru-RU', { 
              day: 'numeric', 
              month: 'long' 
            })}
          </p>
          
          {/* Информация о тренировке */}
          {exerciseCount > 0 && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                <Dumbbell className="w-4 h-4 text-blue-600" />
                <span>{exerciseCount} упражнений</span>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {selectedDayProgram.length === 0 ? (
            allowEdit ? (
              <Button
                onClick={() => onOpenEdit(client, selectedDayName, selectedDateString)}
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
                size="lg"
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Добавить программу
              </Button>
            ) : (
              <p className="text-center text-gray-500">Нет программы</p>
            )
          ) : (
            <>
              {selectedDayProgram.map(w => (
                <div
                  key={w.id}
                  className={`flex items-center justify-between p-3 border rounded ${packageCount < 1 ? 'bg-yellow-100' : ''}`}
                >
                  <div className="text-sm text-gray-600">
                    {w.startTime && <span className="mr-2">{w.startTime}</span>}
                    {w.duration && <span>{w.duration} мин</span>}
                    <span className="ml-2">{w.exercises.length} упр.</span>
                  </div>
                  <div className="flex gap-2">
                    {canStart && (
                      <Button
                        size="icon"
                        className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                        onClick={() => onOpenTraining(client, selectedDayName, selectedDateString, w.id)}
                      >
                        <Play className="w-4 h-4" />
                      </Button>
                    )}
                    {allowEdit && (
                      <Button
                        size="icon"
                        variant="outline"
                        className="border-blue-200 text-blue-600 hover:bg-blue-50"
                        onClick={() => onOpenEdit(client, selectedDayName, selectedDateString, w.id)}
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}

              {allowEdit && (
                <Button
                  onClick={() => onOpenEdit(client, selectedDayName, selectedDateString)}
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
                  size="lg"
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Добавить программу
                </Button>
              )}
            </>
          )}
        </div>
      </Card>


      <WorkoutCalendar
        clients={[client]}
        clientId={client.id}
        onOpenTraining={onOpenTraining}
        onOpenEdit={onOpenEdit}
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
