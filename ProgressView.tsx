import { Card } from './ui/card'
import type { Client } from './App'

interface ProgressViewProps {
  client: Client
}

export function ProgressView({ client }: ProgressViewProps) {
  const exerciseMap: Record<string, { name: string; history: { date: string; weight: number }[] }> = {}

  client.program.forEach(day => {
    day.exercises.forEach(ex => {
      if (!exerciseMap[ex.id]) {
        exerciseMap[ex.id] = { name: ex.name, history: [] }
      }
      exerciseMap[ex.id].history = [...exerciseMap[ex.id].history, ...ex.history]
    })
  })

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
                  <span className="font-medium">{rec.weight} кг</span>
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
