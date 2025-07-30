import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Button } from './ui/button'
import { ArrowLeft } from 'lucide-react@0.487.0'
import { TrainingProgram } from './TrainingProgram'
import { ProgressView } from './ProgressView'
import { InviteLinkCard } from './InviteLinkCard'
import type { Client, Exercise } from './App'

interface ClientDashboardProps {
  client: Client
  allExercises: Omit<Exercise, 'currentWeight' | 'currentReps' | 'history'>[]
  onBack: () => void
  onOpenTraining: (
    client: Client,
    day: string,
    date: string,
    workoutId?: string
  ) => void
}

export function ClientDashboard({ client, allExercises, onBack, onOpenTraining }: ClientDashboardProps) {
  const [tab, setTab] = useState('schedule')

  return (
    <div className="max-w-md mx-auto p-4 pt-6 pb-6 min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50">
      <div className="flex items-center mb-4">
        <Button onClick={onBack} variant="ghost" size="sm" className="p-2 mr-2">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-lg font-bold text-gray-800">{client.name}</h1>
      </div>

      <Tabs value={tab} onValueChange={setTab} className="mb-4">
        <TabsList>
          <TabsTrigger value="schedule">Расписание</TabsTrigger>
          <TabsTrigger value="progress">Прогресс</TabsTrigger>
        </TabsList>

        <TabsContent value="schedule">
          <TrainingProgram
            client={client}
            onBack={() => {}}
            onOpenTraining={onOpenTraining}
            onOpenEdit={(d, dt) => {}}
            allowEdit={false}
            canStart={false}
          />
        </TabsContent>

        <TabsContent value="progress">
          <ProgressView client={client} allExercises={allExercises} />
        </TabsContent>
      </Tabs>

      <InviteLinkCard client={client} />
    </div>
  )
}
