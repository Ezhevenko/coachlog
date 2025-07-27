import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Button } from './ui/button'
import { ArrowLeft } from 'lucide-react'
import { TrainingProgram } from './TrainingProgram'
import { ProgressView } from './ProgressView'
import type { Client } from './App'

interface ClientDashboardProps {
  client: Client
  onBack: () => void
  onOpenTraining: (day: string) => void
}

export function ClientDashboard({ client, onBack, onOpenTraining }: ClientDashboardProps) {
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
      </Tabs>

      <TabsContent value="schedule">
        <TrainingProgram client={client} onBack={() => {}} onOpenTraining={onOpenTraining} onOpenEdit={() => {}} allowEdit={false} />
      </TabsContent>

      <TabsContent value="progress">
        <ProgressView client={client} />
      </TabsContent>
    </div>
  )
}
