import { useState, useEffect } from 'react'
import { useApiFetch } from './lib/api'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Card } from './ui/card'
import { ArrowLeft, ChevronLeft, ChevronRight, TrendingUp, Save } from 'lucide-react@0.487.0'
import type { Client, Exercise } from './App'

interface TrainingModeProps {
  client: Client
  day: string
  date: string
  workoutId?: string
  allExercises: Omit<Exercise, 'currentWeight' | 'currentReps' | 'history'>[]
  onBack: () => void
  canRecord?: boolean
}

export function TrainingMode({
  client,
  day,
  date,
  workoutId: propWorkoutId,
  allExercises,
  onBack,
  canRecord = true
}: TrainingModeProps) {
  const apiFetch = useApiFetch()
  const [workoutId, setWorkoutId] = useState<string | null>(null)
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [startTime, setStartTime] = useState<string>('')
  const [duration, setDuration] = useState<number | undefined>()

  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0)
  const [newWeight, setNewWeight] = useState('')
  const [newReps, setNewReps] = useState('')
  const [newRound, setNewRound] = useState('')

  useEffect(() => {
    const load = async () => {
      if (!propWorkoutId) return
      const res = await apiFetch('/api/coach/calendar?date=' + date)
      if (!res.ok) return
      const data = await res.json()
      const w = data.find((d: any) => d.id === propWorkoutId)
      if (w) {
        setWorkoutId(w.id)
        setStartTime(w.time_start || '')
        setDuration(w.duration_minutes)

        let historyMap: Record<string, { date: string; weight: number; reps?: number; round?: number }[]> = {}
        const progRes = await apiFetch(`/api/coach/client-progress?clientId=${client.id}`)
        if (progRes.ok) {
          const progress = await progRes.json()
          let workoutMap: Record<string, string> = {}
          const wRes = await apiFetch('/api/coach/calendar')
          if (wRes.ok) {
            const allW = await wRes.json()
            workoutMap = Object.fromEntries(allW.map((ww: any) => [ww.id, (ww.date || '').slice(0,10)]))
          }
          historyMap = progress.reduce((acc: any, p: any) => {
            const date = workoutMap[p.workout_id] || ''
            ;(acc[p.exercise_id] ||= []).push({ date, weight: p.weight || 0, reps: p.reps, round: p.round })
            return acc
          }, {} as Record<string, { date: string; weight: number; reps?: number; round?: number }[]>)
        }

        setExercises(
          w.exerciseIds.map((id: string) => {
            const ex = allExercises.find(e => e.id === id)
            const history = historyMap[id] || []
            return ex
              ? { ...ex, currentWeight: 0, currentReps: 0, history }
              : { id, name: id, category: 'other', currentWeight: 0, currentReps: 0, history }
          })
        )
      }
    }
    load()
  }, [client.id, date, propWorkoutId])

  if (exercises.length === 0) {
    return (
      <div className="max-w-md mx-auto p-4 pt-8">
        <div className="flex items-center justify-between mb-8">
          <Button onClick={onBack} variant="ghost" size="icon">
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <h1 className="font-bold text-gray-800">
            {day}, {new Date(date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
          </h1>
          <div className="w-10" />
        </div>
        
        <div className="text-center py-12">
          <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">Нет упражнений</h3>
          <p className="text-gray-500">Добавьте упражнения в режиме редактирования</p>
        </div>
      </div>
    )
  }

  const currentExercise = exercises[currentExerciseIndex]
  const lastRecord =
    currentExercise.history.length > 0
      ? currentExercise.history[currentExercise.history.length - 1]
      : null


  const goToNext = () => {
    if (currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1)
      setNewWeight('')
      setNewReps('')
      setNewRound('')
    }
  }

  const goToPrevious = () => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex(currentExerciseIndex - 1)
      setNewWeight('')
      setNewReps('')
      setNewRound('')
    }
  }

  const handleSaveProgress = async () => {
    if (!workoutId) return
    const weight = parseFloat(newWeight)
    const reps = parseInt(newReps)
    const round = parseInt(newRound)
    if (isNaN(round)) return

    const res = await apiFetch(`/api/coach/workouts/${workoutId}/progress`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        exerciseId: currentExercise.id,
        round,
        weight: isNaN(weight) ? undefined : weight,
        reps: isNaN(reps) ? undefined : reps
      })
    })
    if (res.ok) {
      const record = {
        date: new Date().toISOString().split('T')[0],
        weight: isNaN(weight) ? 0 : weight,
        reps: isNaN(reps) ? undefined : reps,
        round
      }
      setExercises(prev => prev.map((ex, i) =>
        i === currentExerciseIndex
          ? { ...ex, currentWeight: weight || ex.currentWeight, currentReps: reps || ex.currentReps, history: [...ex.history, record] }
          : ex
      ))
      setNewWeight('')
      setNewReps('')
      setNewRound('')
    }
  }

  const handleFinishWorkout = async () => {
    if (!workoutId) return
    const res = await apiFetch(`/api/coach/workouts/${workoutId}/finish`, {
      method: 'POST'
    })
    if (res.ok) {
      onBack()
    }
  }
  return (
    <div className="max-w-md mx-auto p-4 pt-8 pb-20">
      <div className="flex items-center justify-between mb-8">
        <Button onClick={onBack} variant="ghost" size="icon">
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <div className="text-center">
          <h1 className="font-bold text-gray-800">
            {day}, {new Date(date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
          </h1>
          <p className="text-sm text-gray-500">
            {currentExerciseIndex + 1} из {exercises.length}
            {startTime && ` • ${startTime}`}
            {duration && ` • ${duration} мин`}
          </p>
        </div>
        <div className="w-10" />
      </div>

      {/* Индикатор прогресса */}
      <div className="flex space-x-1 mb-8">
        {exercises.map((_, index) => (
          <div
            key={index}
            className={`flex-1 h-1 rounded-full transition-colors duration-300 ${
              index === currentExerciseIndex 
                ? 'bg-gradient-to-r from-pink-500 to-rose-500' 
                : index < currentExerciseIndex 
                ? 'bg-green-400' 
                : 'bg-gray-200'
            }`}
          />
        ))}
      </div>

      {/* Карточка упражнения */}
      <div className="mb-8">
        <Card className="bg-white shadow-xl border-0 p-6">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              {currentExercise.name}
            </h2>
            <p className="text-gray-500">
              {currentExercise.category === 'arms' && 'Руки'}
              {currentExercise.category === 'legs' && 'Ноги'}
              {currentExercise.category === 'back' && 'Спина'}
              {currentExercise.category === 'shoulders' && 'Плечи'}
              {currentExercise.category === 'chest' && 'Грудь'}
            </p>
          </div>

          <div className="space-y-4">
            <div className="text-center">
              <p className="text-gray-600 mb-2">Последние значения</p>
              <div className="flex justify-center gap-6 text-3xl font-bold text-gray-800">
                <div className="text-center">
                  {lastRecord ? lastRecord.weight : '-'}
                  <span className="text-base font-medium ml-1">кг</span>
                </div>
                <div className="text-center">
                  {lastRecord && lastRecord.reps !== undefined ? lastRecord.reps : '-'}
                  <span className="text-base font-medium ml-1">повт.</span>
                </div>
                <div className="text-center">
                  {lastRecord && lastRecord.round !== undefined ? lastRecord.round : '-'}
                  <span className="text-base font-medium ml-1">кругов</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">Вес</label>
              <Input
                type="number"
                placeholder="0"
                value={newWeight}
                onChange={(e) => setNewWeight(e.target.value)}
                className="w-full border-gray-200 focus:border-purple-300"
                disabled={!canRecord}
              />
              <label className="text-sm font-medium text-gray-700">Повторения</label>
              <Input
                type="number"
                placeholder="0"
                value={newReps}
                onChange={(e) => setNewReps(e.target.value)}
                className="w-full border-gray-200 focus:border-purple-300"
                disabled={!canRecord}
              />
              <label className="text-sm font-medium text-gray-700">Кругов</label>
              <div className="flex gap-2 items-end">
                <Input
                  type="number"
                  placeholder="0"
                  value={newRound}
                  onChange={(e) => setNewRound(e.target.value)}
                  className="flex-1 border-gray-200 focus:border-purple-300"
                  disabled={!canRecord}
                />
                <Button
                  onClick={handleSaveProgress}
                  disabled={
                    !canRecord ||
                    !newWeight ||
                    !newReps ||
                    !newRound ||
                    parseFloat(newWeight) <= 0 ||
                    parseInt(newReps) <= 0 ||
                    parseInt(newRound) < 0
                  }
                  className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
                >
                  <Save className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* История */}
            {currentExercise.history.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Последние записи
                </p>
                <div className="space-y-1 max-h-20 overflow-y-auto">
                  {currentExercise.history.slice(-3).reverse().map((record, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-gray-500">{record.date}</span>
                      <span className="font-medium">
                        {record.weight} кг
                        {record.reps ? ` × ${record.reps}` : ''}
                        {record.round !== undefined ? ` (круг ${record.round})` : ''}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Навигационные кнопки */}
      <div className="flex justify-between items-center">
        <Button
          onClick={goToPrevious}
          disabled={currentExerciseIndex === 0}
          variant="outline"
          size="lg"
          className="w-16 h-16 rounded-full"
        >
          <ChevronLeft className="w-6 h-6" />
        </Button>
        
        <div className="text-center">
          <p className="text-sm text-gray-500">
            Используйте кнопки для переключения
          </p>
        </div>
        
        <Button
          onClick={goToNext}
          disabled={currentExerciseIndex === exercises.length - 1}
          variant="outline" 
          size="lg"
          className="w-16 h-16 rounded-full"
        >
          <ChevronRight className="w-6 h-6" />
        </Button>
      </div>

      {workoutId && canRecord && (
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 mb-2">
            Нажмите, если тренировка проведена успешно. Из пакета будет списана 1 единица.
          </p>
          <Button
            onClick={handleFinishWorkout}
            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
          >
            Завершить тренировку
          </Button>
        </div>
      )}
    </div>
  )
}
