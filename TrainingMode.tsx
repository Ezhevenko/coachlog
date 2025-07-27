import { useState, useRef, useEffect } from 'react'
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
  allExercises: Omit<Exercise, 'currentWeight' | 'history'>[]
  onBack: () => void
}

export function TrainingMode({ client, day, date, allExercises, onBack }: TrainingModeProps) {
  const apiFetch = useApiFetch()
  const [workoutId, setWorkoutId] = useState<string | null>(null)
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [startTime, setStartTime] = useState<string>('')
  const [duration, setDuration] = useState<number | undefined>()

  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0)
  const [newWeight, setNewWeight] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [translateX, setTranslateX] = useState(0)

  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const load = async () => {
      const res = await apiFetch('/api/coach/calendar?date=' + date)
      if (!res.ok) return
      const data = await res.json()
      const w = data.find((d: any) => d.clientId === client.id)
      if (w) {
        setWorkoutId(w.id)
        setStartTime(w.time_start || '')
        setDuration(w.duration_minutes)
        setExercises(
          w.exerciseIds.map((id: string) => {
            const ex = allExercises.find(e => e.id === id)
            return ex
              ? { ...ex, currentWeight: 0, history: [] }
              : { id, name: id, category: 'other', currentWeight: 0, history: [] }
          })
        )
      }
    }
    load()
  }, [client.id, date])

  if (exercises.length === 0) {
    return (
      <div className="max-w-md mx-auto p-4 pt-8">
        <div className="flex items-center justify-between mb-8">
          <Button onClick={onBack} variant="ghost" size="sm" className="p-2">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-bold text-gray-800">{day}</h1>
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

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true)
    setStartX(e.touches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return
    const currentX = e.touches[0].clientX
    const diff = currentX - startX
    setTranslateX(diff)
  }

  const handleTouchEnd = () => {
    if (!isDragging) return
    
    const threshold = 100
    if (Math.abs(translateX) > threshold) {
      if (translateX > 0) {
        // Свайп вправо - предыдущее упражнение
        goToPrevious()
      } else {
        // Свайп влево - следующее упражнение
        goToNext()
      }
    }
    
    setIsDragging(false)
    setTranslateX(0)
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setStartX(e.clientX)
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return
    const diff = e.clientX - startX
    setTranslateX(diff)
  }

  const handleMouseUp = () => {
    if (!isDragging) return
    
    const threshold = 100
    if (Math.abs(translateX) > threshold) {
      if (translateX > 0) {
        goToPrevious()
      } else {
        goToNext()
      }
    }
    
    setIsDragging(false)
    setTranslateX(0)
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
  }

  const goToNext = () => {
    if (currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1)
      setNewWeight('')
    }
  }

  const goToPrevious = () => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex(currentExerciseIndex - 1)
      setNewWeight('')
    }
  }

  const handleSaveWeight = async () => {
    const weight = parseFloat(newWeight)
    if (weight && weight > 0 && workoutId) {
      const res = await apiFetch(`/api/coach/workouts/${workoutId}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exerciseId: currentExercise.id, round: currentExercise.history.length, weight })
      })
      if (res.ok) {
        setExercises(prev => prev.map((ex, i) =>
          i === currentExerciseIndex
            ? { ...ex, currentWeight: weight, history: [...ex.history, { date: new Date().toISOString().split('T')[0], weight }] }
            : ex
        ))
        setNewWeight('')
      }
    }
  }

  return (
    <div className="max-w-md mx-auto p-4 pt-8 pb-20">
      <div className="flex items-center justify-between mb-8">
        <Button onClick={onBack} variant="ghost" size="sm" className="p-2">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="text-center">
          <h1 className="font-bold text-gray-800">{day}</h1>
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
      <div className="relative h-96 mb-8">
        <Card
          ref={cardRef}
          className="absolute inset-0 bg-white shadow-xl border-0 p-6 cursor-grab active:cursor-grabbing overflow-hidden"
          style={{
            transform: `translateX(${translateX}px) rotate(${translateX * 0.02}deg)`,
            transition: isDragging ? 'none' : 'all 0.3s ease-out'
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
        >
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
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
              <p className="text-gray-600 mb-2">Текущий рабочий вес</p>
              <div className="text-3xl font-bold text-gray-800">
                {currentExercise.currentWeight} кг
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">
                Новый вес
              </label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="0"
                  value={newWeight}
                  onChange={(e) => setNewWeight(e.target.value)}
                  className="flex-1 border-gray-200 focus:border-purple-300"
                />
                <Button
                  onClick={handleSaveWeight}
                  disabled={!newWeight || parseFloat(newWeight) <= 0}
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
                      <span className="font-medium">{record.weight} кг</span>
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
            Свайпните для переключения
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
    </div>
  )
}
