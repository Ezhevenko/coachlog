import { useState, useEffect } from 'react'
import { useApiFetch } from './lib/api'
import { Calendar } from './ui/calendar'
import { Card } from './ui/card'
import { Button } from './ui/button'

import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from './ui/select'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Play, Edit3 } from 'lucide-react@0.487.0'
import type { Client } from './App'

interface CoachCalendarProps {
  clients: Client[]
  onOpenTraining: (client: Client, day: string, date: string, workoutId?: string) => void
  onOpenEdit: (
    client: Client,
    day: string,
    date: string,
    workoutId?: string,
    startTime?: string,
    duration?: string
  ) => void
}

interface Workout {
  id: string
  clientId: string
  date: string
  time_start?: string
  duration_minutes?: number
  exerciseIds: string[]
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

export function CoachCalendar({ clients, onOpenTraining, onOpenEdit }: CoachCalendarProps) {
  const apiFetch = useApiFetch()
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [workoutsByDate, setWorkoutsByDate] = useState<Record<string, Workout[]>>({})

  const [newClientId, setNewClientId] = useState<string>('')
  const [newStart, setNewStart] = useState('')
  const [newDuration, setNewDuration] = useState('60')

  useEffect(() => {
    const load = async () => {
      const res = await apiFetch('/api/coach/calendar')
      if (!res.ok) return
      const data = await res.json()
      const map: Record<string, Workout[]> = {}
      data.forEach((w: Workout) => {
        const key = (w.date || '').slice(0, 10)
        if (!key) return
        ;(map[key] ||= []).push(w)
      })
      setWorkoutsByDate(map)
    }
    load()
  }, [clients])

  const selectedDateStr = selectedDate.toISOString().slice(0, 10)
  const selectedDayName = WEEKDAYS[selectedDate.getDay()]
  const dayWorkouts = workoutsByDate[selectedDateStr] || []
  const sortedWorkouts = [...dayWorkouts].sort((a, b) =>
    (a.time_start || '').localeCompare(b.time_start || '')
  )

  const clientMap = Object.fromEntries(clients.map(c => [c.id, c])) as Record<string, Client>

  const hasTrainingOnDate = (date: Date) => {
    const key = date.toISOString().slice(0, 10)
    return (workoutsByDate[key]?.length || 0) > 0
  }

  const handleCreate = () => {
    const c = clientMap[newClientId]
    if (!c || !newStart) return
    setNewStart('')
    onOpenEdit(
      c,
      WEEKDAYS[selectedDate.getDay()],
      selectedDateStr,
      undefined,
      newStart,
      newDuration
    )
  }

  return (
    <div className="max-w-md mx-auto p-4 pt-6 pb-10 min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50">
      <Card className="p-4 mb-6 bg-white shadow-sm border-0">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={date => date && setSelectedDate(date)}
          className="rounded-md"
          modifiersClassNames={{ hasTraining: 'rdp-day_hasTraining' }}
          classNames={{
            day_selected:
              'bg-blue-500 text-white hover:bg-blue-600 focus:bg-blue-600'
          }}
          modifiers={{
            hasTraining: (date: Date) => hasTrainingOnDate(date)
          }}
        />
      </Card>

      <div className="space-y-3 mb-20">
        {sortedWorkouts.length === 0 && (
          <p className="text-center text-gray-500">Нет тренировок</p>
        )}
        {sortedWorkouts.map(w => {
          const client = clientMap[w.clientId]
          if (!client) return null
          return (
            <Card
              key={w.id}
              className="flex items-center justify-between p-4 bg-white shadow-sm border-0 flex-row"
            >
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-gray-800">{client.name}</h3>
                {w.time_start && (
                  <span className="text-sm text-gray-500">
                    {w.time_start.slice(0, 5)}
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  size="icon"
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                  onClick={() => onOpenTraining(client, selectedDayName, selectedDateStr, w.id)}
                >
                  <Play className="w-4 h-4" />
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  className="border-blue-200 text-blue-600 hover:bg-blue-50"
                  onClick={() => onOpenEdit(client, selectedDayName, selectedDateStr, w.id)}
                >
                  <Edit3 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          )
        })}
      </div>

      <div className="bg-white shadow-lg p-4 rounded-lg mt-4">
        <h2 className="font-medium mb-2">Новая тренировка</h2>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Клиент</Label>
              <Select value={newClientId} onValueChange={setNewClientId}>
                <SelectTrigger className="border-gray-200 focus:border-blue-300">
                  <SelectValue placeholder="Выберите клиента" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {clients.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
          </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start">Время начала</Label>
                <Input id="start" type="time" value={newStart} onChange={e => setNewStart(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="dur">Длительность (мин)</Label>
                <Input id="dur" type="number" value={newDuration} onChange={e => setNewDuration(e.target.value)} />
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={handleCreate} disabled={!newClientId || !newStart}>
                Далее
              </Button>
            </div>
          </div>
        </div>
      </div>
  )
}

export default CoachCalendar
