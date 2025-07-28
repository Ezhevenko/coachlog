import { Card } from './ui/card'
import { Button } from './ui/button'
import { Play, Edit3 } from 'lucide-react@0.487.0'

interface WorkoutCardProps {
  clientName?: string
  startTime?: string
  duration?: string | number
  exerciseCount?: number
  onStart: () => void
  onEdit?: () => void
  hideName?: boolean
}

export function WorkoutCard({
  clientName,
  startTime,
  duration,
  exerciseCount,
  onStart,
  onEdit,
  hideName = false
}: WorkoutCardProps) {
  return (
    <Card className="flex items-center justify-between p-4 bg-white shadow-sm border-0">
      <div className="flex items-center gap-2 text-sm text-gray-600">
        {!hideName && clientName && (
          <h3 className="font-medium text-gray-800 mr-2">{clientName}</h3>
        )}
        {startTime && <span>{startTime}</span>}
        {duration && (
          <span>
            {duration} мин
          </span>
        )}
        {typeof exerciseCount === 'number' && (
          <span>{exerciseCount} упр.</span>
        )}
      </div>
      <div className="flex gap-2">
        <Button
          size="icon"
          className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
          onClick={onStart}
        >
          <Play className="w-4 h-4" />
        </Button>
        {onEdit && (
          <Button
            size="icon"
            variant="outline"
            className="border-blue-200 text-blue-600 hover:bg-blue-50"
            onClick={onEdit}
          >
            <Edit3 className="w-4 h-4" />
          </Button>
        )}
      </div>
    </Card>
  )
}

export default WorkoutCard
