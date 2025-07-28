import { useState, useEffect } from 'react'
import { useApiFetch } from './lib/api'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { Calendar } from './ui/calendar'
import { ArrowLeft, Edit3, Play, Dumbbell, TrendingUp } from 'lucide-react@0.487.0'
import type { Client } from './App'
import { ClientPackage } from './ClientPackage'

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
  allowEdit?: boolean
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

export function TrainingProgram({ client, onBack, onOpenTraining, onOpenEdit, allowEdit = true }: TrainingProgramProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const apiFetch = useApiFetch()
  // key is ISO date string (YYYY-MM-DD)
  const [program, setProgram] = useState<Record<string, { id: string; exercises: string[]; startTime?: string; duration?: number }[]>>({})
  const [packageCount, setPackageCount] = useState(0)

  useEffect(() => {
    const load = async () => {
      const res = await apiFetch('/api/coach/calendar')
      if (!res.ok) return
      const data = await res.json()
      const map: Record<string, { id: string; exercises: string[]; startTime?: string; duration?: number }[]> = {}
      data
        .filter((w: any) => w.clientId === client.id)
        .forEach((w: any) => {
          const dateStr = (w.date || '').slice(0, 10)
          if (!dateStr) return
          ;(map[dateStr] ||= []).push({
            id: w.id,
            exercises: w.exerciseIds || [],
            startTime: w.time_start || undefined,
            duration: w.duration_minutes || undefined
          })
        })
      setProgram(map)
    }
    load()
  }, [client.id])

  // Получаем день недели и ключ даты в формате ISO
  const selectedDayName = WEEKDAYS[selectedDate.getDay()]
  const selectedDateString = selectedDate.toISOString().slice(0, 10)
  const selectedDayProgram = program[selectedDateString] || []
  const exerciseCount = selectedDayProgram.reduce(
    (sum, w) => sum + w.exercises.length,
    0
  )

  // Функция для определения, есть ли тренировки в конкретный день
  const hasTrainingOnDate = (date: Date) => {
    const key = date.toISOString().slice(0, 10)
    const dayProgram = program[key]
    return (dayProgram?.length || 0) > 0
  }

  return (
    <div className="max-w-md mx-auto p-4 pt-6 pb-6 min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Button
            onClick={onBack}
            variant="ghost"
            size="sm"
            className="p-2 hover:bg-blue-100"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-lg font-bold text-gray-800">{client.name}</h1>
            <p className="text-sm text-blue-600">Программа тренировок</p>
          </div>
        </div>
      </div>

      <ClientPackage client={client} onCountChange={setPackageCount} />

      {/* Calendar */}
      <Card className="p-4 mb-6 bg-white shadow-sm border-0">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(date: Date | undefined) => date && setSelectedDate(date)}
          className="rounded-md"
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
                    <Button
                      size="icon"
                      className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                      onClick={() => onOpenTraining(client, selectedDayName, selectedDateString, w.id)}
                    >
                      <Play className="w-4 h-4" />
                    </Button>
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
    </div>
  )
}
