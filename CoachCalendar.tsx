import type { Client } from './App'
import WorkoutCalendar from './components/WorkoutCalendar'

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

export default function CoachCalendar(props: CoachCalendarProps) {
  return (
    <div className="max-w-md mx-auto p-4 pt-6 pb-10 min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50">
      <WorkoutCalendar {...props} />
    </div>
  )
}
