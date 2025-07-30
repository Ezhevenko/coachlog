import { useState, useEffect } from 'react'
import { useApiFetch } from './lib/api'
import { Calendar } from './ui/calendar'
import { Card } from './ui/card'
import { Button } from './ui/button'
import { WorkoutCard } from './WorkoutCard'

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

  const toDateKey = (date: Date) => {
    const tzOffset = date.getTimezoneOffset() * 60000
    return new Date(date.getTime() - tzOffset).toISOString().slice(0, 10)
  }

  const selectedDateStr = toDateKey(selectedDate)
  const selectedDayName = WEEKDAYS[selectedDate.getDay()]
  const dayWorkouts = workoutsByDate[selectedDateStr] || []
  const sortedWorkouts = [...dayWorkouts].sort((a, b) =>
    (a.time_start || '').localeCompare(b.time_start || '')
  )

  const clientMap = Object.fromEntries(clients.map(c => [c.id, c])) as Record<string, Client>

  const hasTrainingOnDate = (date: Date) => {
    const key = toDateKey(date)
    return (workoutsByDate[key]?.length || 0) > 0
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
            <WorkoutCard
              key={w.id}
              clientName={client.name}
              startTime={w.time_start ? w.time_start.slice(0, 5) : undefined}
              onStart={() =>
                onOpenTraining(client, selectedDayName, selectedDateStr, w.id)
              }
              onEdit={() =>
                onOpenEdit(client, selectedDayName, selectedDateStr, w.id)
              }
            />
          )
        })}
      </div>

      {/* Block for creating a new workout has been removed as workouts are now added from the client page */}
    </div>
  )
}

export default CoachCalendar
