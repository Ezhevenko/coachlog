import { useState, useRef, useEffect } from 'react'
import { useApiFetch } from './lib/api'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Separator } from './ui/separator'
import { ArrowLeft, Plus, X, GripVertical, Clock } from 'lucide-react@0.487.0'
import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import type { Client, Exercise, ExerciseCategory } from './App'

interface EditTrainingModeProps {
  client: Client
  day: string
  date: string
  workoutId?: string
  allExercises: Omit<Exercise, 'currentWeight' | 'currentReps' | 'history'>[]
  categories: ExerciseCategory[]
  onBack: () => void
  initialStartTime?: string
  initialDuration?: string
}



const defaultCategoryNames = {
  arms: 'Руки',
  legs: 'Ноги',
  back: 'Спина',
  shoulders: 'Плечи',
  chest: 'Грудь'
}

interface DragItem {
  type: string
  exercise: Omit<Exercise, 'currentWeight' | 'currentReps' | 'history'>
  fromProgram?: boolean
  index?: number
}

function ExerciseItem({
  exercise,
  fromProgram = false,
  onRemove,
  onClick,
  index
}: {
  exercise: Exercise | Omit<Exercise, 'currentWeight' | 'currentReps' | 'history'>
  fromProgram?: boolean
  onRemove?: () => void
  onClick?: () => void
  index?: number
}) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'exercise',
    item: { 
      type: 'exercise', 
      exercise: fromProgram ? exercise : {
        ...exercise,
        currentWeight: 0,
        currentReps: 0,
        history: []
      },
      fromProgram,
      index
    } as DragItem,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }), [exercise, fromProgram, index])

  const ref = useRef<HTMLDivElement>(null)
  drag(ref)

  return (
    <div
      ref={ref}
      onClick={!fromProgram ? onClick : undefined}
      className={`p-3 bg-white rounded-lg shadow-sm border cursor-move transition-all duration-200 ${
        isDragging ? 'opacity-50 rotate-2' : 'hover:shadow-md hover:-translate-y-0.5'
      } ${fromProgram ? 'border-l-4 border-l-blue-400' : 'border-gray-200'} ${!fromProgram && onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <GripVertical className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-800">
            {exercise.name}
          </span>
        </div>
        {fromProgram && onRemove && (
          <Button
            onClick={onRemove}
            variant="ghost"
            size="sm"
            className="p-1 h-6 w-6 hover:bg-red-100"
          >
            <X className="w-3 h-3 text-red-500" />
          </Button>
        )}
        {'currentWeight' in exercise && (
          <span className="text-xs text-gray-500">
            {exercise.currentWeight}кг
          </span>
        )}
      </div>
    </div>
  )
}

function DropZone({ 
  exercises, 
  onDrop, 
  onRemove, 
  onReorder 
}: { 
  exercises: Exercise[]
  onDrop: (exercise: Exercise) => void
  onRemove: (index: number) => void
  onReorder: (dragIndex: number, dropIndex: number) => void
}) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'exercise',
    drop: (item: DragItem) => {
      if (item.fromProgram && typeof item.index === 'number') {
        // Перетаскивание внутри программы - не добавляем дубликат
        return
      }
      
      const exerciseToAdd: Exercise = 'currentWeight' in item.exercise
        ? item.exercise as Exercise
        : {
            ...item.exercise,
            currentWeight: 0,
            currentReps: 0,
            history: []
          }
      
      onDrop(exerciseToAdd)
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }), [onDrop])

  const moveExercise = (dragIndex: number, dropIndex: number) => {
    if (dragIndex !== dropIndex) {
      onReorder(dragIndex, dropIndex)
    }
  }

  const dropRef = useRef<HTMLDivElement>(null)
  drop(dropRef)

  return (
    <div
      ref={dropRef}
      className={`min-h-32 p-4 border-2 border-dashed rounded-lg transition-colors duration-200 ${
        isOver 
          ? 'border-blue-400 bg-blue-50' 
          : 'border-gray-300 bg-gray-50'
      }`}
    >
      {exercises.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Plus className="w-8 h-8 text-gray-400 mb-2" />
          <p className="text-gray-500">
            Перетащите упражнения сюда
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {exercises.map((exercise, index) => (
            <SortableExerciseItem
              key={`${exercise.id}-${index}`}
              exercise={exercise}
              index={index}
              onRemove={() => onRemove(index)}
              moveExercise={moveExercise}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function SortableExerciseItem({ 
  exercise, 
  index, 
  onRemove, 
  moveExercise 
}: {
  exercise: Exercise
  index: number
  onRemove: () => void
  moveExercise: (dragIndex: number, dropIndex: number) => void
}) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'exercise',
    item: { 
      type: 'exercise',
      exercise,
      fromProgram: true,
      index
    } as DragItem,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }), [exercise, index])

  const [, drop] = useDrop(() => ({
    accept: 'exercise',
    drop: (item: DragItem) => {
      if (item.fromProgram && typeof item.index === 'number') {
        moveExercise(item.index, index)
      }
    },
  }), [index, moveExercise])

  const ref = useRef<HTMLDivElement>(null)
  drag(drop(ref))

  return (
    <div ref={ref}>
      <ExerciseItem
        exercise={exercise}
        fromProgram={true}
        onRemove={onRemove}
        index={index}
      />
    </div>
  )
}

export function EditTrainingMode({
  client,
  day,
  date,
  workoutId: propWorkoutId,
  allExercises,
  categories,
  onBack,
  initialStartTime,
  initialDuration
}: EditTrainingModeProps) {
  const apiFetch = useApiFetch()

  const [workoutId, setWorkoutId] = useState<string | null>(null)
  const [programExercises, setProgramExercises] = useState<Exercise[]>([])
  const [startTime, setStartTime] = useState<string>(initialStartTime || '')
  const [duration, setDuration] = useState<string>(initialDuration || '60')

  const categoryNameMap = categories.reduce(
    (acc, c) => {
      acc[c.id] = c.name
      return acc
    },
    { ...defaultCategoryNames } as Record<string, string>
  )

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
        setDuration(w.duration_minutes ? String(w.duration_minutes) : '')
        setProgramExercises(w.exerciseIds.map((id: string) => {
          const ex = allExercises.find(e => e.id === id)
          return ex
            ? { ...ex, currentWeight: 0, currentReps: 0, history: [] }
            : { id, name: id, category: 'other', currentWeight: 0, currentReps: 0, history: [] }
        }))
      }
    }
    load()
  }, [client.id, date, propWorkoutId])

  const exercisesByCategory = allExercises.reduce((acc, exercise) => {
    if (!acc[exercise.category]) {
      acc[exercise.category] = []
    }
    acc[exercise.category].push(exercise)
    return acc
  }, {} as Record<string, typeof allExercises>)

  const handleDrop = (exercise: Exercise) => {
    // Проверяем, нет ли уже этого упражнения в программе
    const exists = programExercises.find(e => e.id === exercise.id)
    if (!exists) {
      setProgramExercises(prev => [...prev, exercise])
    }
  }

  const handleRemove = (index: number) => {
    setProgramExercises(prev => prev.filter((_, i) => i !== index))
  }

  const handleReorder = (dragIndex: number, dropIndex: number) => {
    setProgramExercises(prev => {
      const newExercises = [...prev]
      const draggedExercise = newExercises[dragIndex]
      newExercises.splice(dragIndex, 1)
      newExercises.splice(dropIndex, 0, draggedExercise)
      return newExercises
    })
  }

  const handleSave = async () => {
    if (!startTime) return
    const durationNum = duration ? parseInt(duration) : 60
    const payload = {
      clientId: client.id,
      date: date,
      time_start: startTime,
      duration_minutes: durationNum,
      exerciseIds: programExercises.map(e => e.id)
    }
    let res
    if (workoutId) {
      res = await apiFetch(`/api/coach/workouts/${workoutId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
    } else {
      res = await apiFetch('/api/coach/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
    }
    if (res.ok) {
      const data = await res.json()
      setWorkoutId(data.id)
      onBack()
    }
  }

  const handleDelete = async () => {
    if (!workoutId) return
    const res = await apiFetch(`/api/coach/workouts/${workoutId}`, { method: 'DELETE' })
    if (res.ok) {
      onBack()
    }
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="max-w-md mx-auto p-4 pt-8 pb-20">
        <div className="flex items-center justify-between mb-6">
          <Button onClick={onBack} variant="ghost" size="sm" className="p-2">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="text-center">
            <h1 className="font-bold text-gray-800">Редактирование</h1>
            <p className="text-sm text-gray-500">
              {day}, {new Date(date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
            </p>
          </div>
          <div className="flex gap-2">
            {workoutId && (
              <Button
                onClick={handleDelete}
                variant="outline"
                size="sm"
                className="border-red-200 text-red-600 hover:bg-red-50"
              >
                Удалить
              </Button>
            )}
            <Button
              onClick={handleSave}
              size="sm"
              disabled={!startTime}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
            >
              Сохранить
            </Button>
          </div>
        </div>

        {/* Настройки тренировки */}
        <Card className="p-4 mb-6 bg-blue-50 border-0">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-blue-600" />
            <h2 className="font-medium text-gray-800">Настройки тренировки</h2>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startTime" className="text-sm text-gray-700 mb-1">
                Время начала
              </Label>
              <Input
                id="startTime"
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="border-gray-200 focus:border-blue-300"
              />
            </div>
            
            <div>
              <Label htmlFor="duration" className="text-sm text-gray-700 mb-1">
                Длительность (мин)
              </Label>
              <Input
                id="duration"
                type="number"
                placeholder="60"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="border-gray-200 focus:border-blue-300"
              />
            </div>
          </div>
        </Card>

        {/* Программа тренировки */}
        <div className="mb-6">
          <h2 className="font-medium text-gray-800 mb-3">
            Упражнения ({programExercises.length})
          </h2>
          <DropZone
            exercises={programExercises}
            onDrop={handleDrop}
            onRemove={handleRemove}
            onReorder={handleReorder}
          />
        </div>

        <Separator className="my-6" />

        {/* Категории упражнений */}
        <div className="space-y-6">
          <h2 className="font-medium text-gray-800">Доступные упражнения</h2>
          
          {Object.entries(exercisesByCategory).map(([category, exercises]) => (
            <div key={category}>
              <h3 className="font-medium text-gray-700 mb-3 flex items-center">
                <div className="w-3 h-3 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-full mr-2" />
                {categoryNameMap[category] || category}
              </h3>
              <div className="space-y-2">
                {exercises.map((exercise) => (
                  <ExerciseItem
                    key={exercise.id}
                    exercise={exercise}
                    fromProgram={false}
                    onClick={() =>
                      handleDrop({
                        ...exercise,
                        currentWeight: 0,
                        currentReps: 0,
                        history: []
                      })
                    }
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="h-8" /> {/* Spacer для bottom padding */}
      </div>
    </DndProvider>
  )
}
