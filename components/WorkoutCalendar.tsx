import { useState, useEffect } from 'react'
import { Calendar } from '../ui/calendar'
import { Card } from '../ui/card'
import { WorkoutCard } from '../WorkoutCard'
import { useApiFetch } from '../lib/api'
import type { Client } from '../App'
import { WEEKDAYS, toDateKey } from '../lib/dateUtils'

interface Workout {
  id: string
  clientId: string
  date: string
  time_start?: string
  duration_minutes?: number
  exerciseIds: string[]
}

interface WorkoutCalendarProps {
  clients: Client[]
  onOpenTraining?: (
    client: Client,
    day: string,
    date: string,
    workoutId?: string
  ) => void
  onOpenEdit?: (
    client: Client,
    day: string,
    date: string,
    workoutId?: string,
    startTime?: string,
    duration?: string
  ) => void
  clientId?: string
  hideClientName?: boolean
}

export function WorkoutCalendar({
  clients,
  onOpenTraining,
  onOpenEdit,
  clientId,
  hideClientName = false
}: WorkoutCalendarProps) {
  const apiFetch = useApiFetch()
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [workoutsByDate, setWorkoutsByDate] = useState<Record<string, Workout[]>>({})

  useEffect(() => {
    const load = async () => {
      const res = await apiFetch('/api/coach/calendar')
      if (!res.ok) return
      const data = await res.json()
      const map: Record<string, Workout[]> = {}
      data
        .filter((w: Workout) => (clientId ? w.clientId === clientId : true))
        .forEach((w: Workout) => {
          const key = (w.date || '').slice(0, 10)
          if (!key) return
          ;(map[key] ||= []).push(w)
        })
      setWorkoutsByDate(map)
    }
    load()
  }, [clients, clientId])

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
    <div className="p-4 pb-10">
      <Card className="p-4 mb-6 bg-white shadow-sm border-0">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={date => date && setSelectedDate(date)}
          className="rounded-md"
          modifiersClassNames={{ hasTraining: 'rdp-day_hasTraining' }}
          classNames={{
            day_selected:
              'rdp-day_selected bg-blue-500 text-white hover:bg-blue-600 focus:bg-blue-600'
          }}
          modifiers={{
            hasTraining: (date: Date) => hasTrainingOnDate(date)
          }}
        />
      </Card>

      <div className="space-y-3">
        {sortedWorkouts.length === 0 && (
          <p className="text-center text-gray-500">Нет тренировок</p>
        )}
        {sortedWorkouts.map(w => {
          const client = clientMap[w.clientId]
          if (!client) return null
          return (
            <WorkoutCard
              key={w.id}
              clientName={hideClientName ? undefined : client.name}
              startTime={w.time_start ? w.time_start.slice(0, 5) : undefined}
              onStart={
                onOpenTraining
                  ? () => onOpenTraining(client, selectedDayName, selectedDateStr, w.id)
                  : undefined
              }
              onEdit={
                onOpenEdit
                  ? () => onOpenEdit(client, selectedDayName, selectedDateStr, w.id)
                  : undefined
              }
            />
          )
        })}
      </div>
    </div>
  )
}

export default WorkoutCalendar
