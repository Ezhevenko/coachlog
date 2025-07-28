import { useEffect, useState } from 'react'
import { Card } from './ui/card'
import { useApiFetch } from './lib/api'
import type { Client, Exercise } from './App'

interface ProgressViewProps {
  client: Client
  allExercises: Omit<Exercise, 'currentWeight' | 'currentReps' | 'history'>[]
}
export function ProgressView({ client, allExercises }: ProgressViewProps) {
  const apiFetch = useApiFetch()
  const [exerciseMap, setExerciseMap] = useState<Record<string, { name: string; history: { date: string; weight: number; reps?: number; round?: number }[] }>>({})

  useEffect(() => {
    const load = async () => {
      let res = await apiFetch('/api/client/progress')
      if (!res.ok) {
        res = await apiFetch(`/api/coach/client-progress?clientId=${client.id}`)
        if (!res.ok) return
      }
      const progress = await res.json()

      let workoutMap: Record<string, string> = {}
      if (progress.length) {
        let wres = await apiFetch('/api/client/calendar')
        if (!wres.ok) {
          wres = await apiFetch('/api/coach/calendar')
        }
        if (wres.ok) {
          const workouts = await wres.json()
          workoutMap = Object.fromEntries(workouts.map((w: any) => [w.id, (w.date || '').slice(0, 10)]))
        }
      }

      const map: Record<string, { name: string; history: { date: string; weight: number; reps?: number; round?: number }[] }> = {}
      progress.forEach((p: any) => {
        const ex = allExercises.find(e => e.id === p.exercise_id)
        if (!ex) return
        const date = workoutMap[p.workout_id] || ''
        if (!map[p.exercise_id]) {
          map[p.exercise_id] = { name: ex.name, history: [] }
        }
        map[p.exercise_id].history.push({ date, weight: p.weight || 0, reps: p.reps, round: p.round })
      })

      setExerciseMap(map)
    }
    load()
  }, [apiFetch, client.id, allExercises])

  const exercises = Object.values(exerciseMap)

  return (
    <div className="space-y-4">
      {exercises.map(ex => (
        <Card key={ex.name} className="p-4 bg-white shadow-sm border-0">
          <h3 className="font-medium text-gray-800 mb-2">{ex.name}</h3>
          {ex.history.length === 0 ? (
            <p className="text-sm text-gray-500">Нет записей</p>
          ) : (
            <div className="space-y-1 text-sm text-gray-700 max-h-32 overflow-y-auto">
              {ex.history.map((rec, idx) => (
                <div key={idx} className="flex justify-between">
                  <span className="text-gray-500">{rec.date}</span>
                  <span className="font-medium">
                    {rec.weight} кг
                    {rec.reps ? ` × ${rec.reps}` : ''}
                    {rec.round !== undefined ? ` (круг ${rec.round})` : ''}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      ))}
      {exercises.length === 0 && (
        <p className="text-center text-gray-500">Нет данных о прогрессе</p>
      )}
    </div>
  )
}
