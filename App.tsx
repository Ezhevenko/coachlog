import { useState, useEffect } from 'react'
import { useApiFetch } from './lib/api'
import { useAuthToken } from './lib/auth-context'
import { ClientList } from './ClientList'
import { TrainingProgram } from './TrainingProgram'
import { TrainingMode } from './TrainingMode'
import { EditTrainingMode } from './EditTrainingMode'
import { ExerciseSettings } from './ExerciseSettings'
import { ProgressView } from './ProgressView'
import CoachCalendar from './CoachCalendar'
import type { Role } from './RoleSwitcher'
import { RoleSwitcher } from './RoleSwitcher'
import { Tabs, TabsList, TabsTrigger } from './ui/tabs'
import {
  Calendar as CalendarIcon,
  Users,
  Settings,
  TrendingUp
} from 'lucide-react@0.487.0'
import { ClientSettings } from './ClientSettings'

const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME

export interface Exercise {
  id: string
  name: string
  category: string
  currentWeight: number
  currentReps: number
  history: { date: string; weight: number; reps?: number; round?: number }[]
}

export interface ExerciseCategory {
  id: string
  name: string
  exercises: Omit<Exercise, 'currentWeight' | 'currentReps' | 'history'>[]
}

export interface Client {
  id: string
  name: string
  telegram_id: string
}

type View =
  | 'calendar'
  | 'clients'
  | 'program'
  | 'training'
  | 'edit'
  | 'settings'
  | 'client-schedule'
  | 'client-progress'
  | 'client-settings'

export default function App() {
  const [clients, setClients] = useState<Client[]>([])
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [selectedDay, setSelectedDay] = useState<string>('')
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [currentView, setCurrentView] = useState<View>('calendar')
  const [initialStartTime, setInitialStartTime] = useState<string | undefined>()
  const [initialDuration, setInitialDuration] = useState<string | undefined>()
  const [currentWorkoutId, setCurrentWorkoutId] = useState<string | undefined>()
  const [activeRole, setActiveRole] = useState<Role>('coach')
  const [returnView, setReturnView] = useState<View>('calendar')
  const apiFetch = useApiFetch()
  const token = useAuthToken()

  useEffect(() => {
    if (!token) return
    const load = async () => {
      const res = await apiFetch('/api/coach/clients')
      if (!res.ok) return
      const data = await res.json()
      setClients(
        data.map((c: any) => ({ id: c.id, name: c.full_name, telegram_id: c.telegram_id }))
      )
    }
    load()
  }, [token])

  // Система управления категориями упражнений
  const [exerciseCategories, setExerciseCategories] = useState<ExerciseCategory[]>([])

  useEffect(() => {
    const loadCats = async () => {
      const res = await apiFetch('/api/coach/exercise-categories')
      if (res.ok) {
        const data = await res.json()
        setExerciseCategories(data)
      }
    }
    if (token) loadCats()
  }, [token])

  // Получаем плоский список всех упражнений из категорий
  const allExercises: Omit<Exercise, 'currentWeight' | 'currentReps' | 'history'>[] =
    exerciseCategories.flatMap(category => category.exercises)

  const handleRoleChange = (role: Role) => {
    setActiveRole(role)
    if (role === 'client') {
      setSelectedClient(clients[0] || null)
      setCurrentView('client-schedule')
    } else {
      setCurrentView('calendar')
      setSelectedClient(null)
    }
  }

  const addClient = async (name: string) => {
    const res = await apiFetch('/api/coach/clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ full_name: name })
    })
    if (!res.ok) return
    const data = await res.json()
    const newClient: Client = {
      id: data.id,
      name: data.full_name,
      telegram_id: data.telegram_id
    }
    setClients(prev => [...prev, newClient])
    if (data.inviteToken) {
      const link = botUsername
        ? `https://t.me/${botUsername}?startapp=invite_${data.inviteToken}`
        : `${window.location.origin}/invite/${data.inviteToken}`
      window.prompt('Invite link', link)
    }
  }

  const deleteClient = async (clientId: string) => {
    const res = await apiFetch(`/api/coach/clients/${clientId}`, { method: 'DELETE' })
    if (res.ok) {
      setClients(prev => prev.filter(c => c.id !== clientId))
    }
  }

  const deleteClientAndReturn = async (clientId: string) => {
    await deleteClient(clientId)
    setSelectedClient(null)
    setCurrentView('clients')
  }


  const openClientProgram = (client: Client) => {
    setSelectedClient(client)
    setCurrentView('program')
  }

  const openTrainingMode = (
    client: Client,
    day: string,
    date: string,
    workoutId?: string
  ) => {
    setSelectedClient(client)
    setSelectedDay(day)
    setSelectedDate(date)
    setCurrentWorkoutId(workoutId)
    setReturnView(currentView)
    setCurrentView('training')
  }

  const openEditMode = (
    client: Client,
    day: string,
    date: string,
    workoutId?: string,
    start?: string,
    duration?: string
  ) => {
    setSelectedClient(client)
    setSelectedDay(day)
    setSelectedDate(date)
    setCurrentWorkoutId(workoutId)
    setInitialStartTime(start)
    setInitialDuration(duration)
    setReturnView(currentView)
    setCurrentView('edit')
  }

  const goBack = () => {
    if (currentView === 'training' || currentView === 'edit') {
      setCurrentWorkoutId(undefined)
      setCurrentView(returnView)
    } else if (currentView === 'program') {
      setCurrentView('clients')
      setSelectedClient(null)
    } else if (currentView === 'settings') {
      setCurrentView('calendar')
    } else if (currentView === 'client-settings') {
      setCurrentView('client-schedule')
    }
  }

  const updateExerciseCategories = (categories: ExerciseCategory[]) => {
    setExerciseCategories(categories)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-indigo-50">
      <div className="fixed top-0 right-0 p-4">
        <RoleSwitcher role={activeRole} onChange={handleRoleChange} />
      </div>

      {activeRole === 'coach' && currentView === 'calendar' && (
        <CoachCalendar
          clients={clients}
          onOpenTraining={openTrainingMode}
          onOpenEdit={openEditMode}
        />
      )}

      {activeRole === 'coach' && currentView === 'clients' && (
        <ClientList
          clients={clients}
          onAddClient={addClient}
          onDeleteClient={deleteClient}
          onSelectClient={openClientProgram}
        />
      )}

      {activeRole === 'coach' && currentView === 'program' && selectedClient && (
        <TrainingProgram
          client={selectedClient}
          onBack={goBack}
          onOpenTraining={openTrainingMode}
          onOpenEdit={openEditMode}
          onDeleteClient={deleteClientAndReturn}
          allowEdit={true}
          allowStart={true}
        />
      )}

      {activeRole === 'client' &&
        currentView === 'client-schedule' &&
        selectedClient && (
          <TrainingProgram
            client={selectedClient}
            onBack={() => {}}
            onOpenTraining={openTrainingMode}
            onOpenEdit={() => {}}
            allowEdit={false}
            allowStart={false}
            hideHeader
          />
        )}

      {activeRole === 'client' &&
        currentView === 'client-progress' &&
        selectedClient && (
          <div className="max-w-md mx-auto p-4 pt-6 pb-6 min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50">
            <ProgressView client={selectedClient} allExercises={allExercises} />
          </div>
        )}

      {activeRole === 'client' && currentView === 'client-settings' && (
        <ClientSettings role={activeRole} onRoleChange={handleRoleChange} />
      )}

      {currentView === 'training' && selectedClient && (
        <TrainingMode
          client={selectedClient}
          day={selectedDay}
          date={selectedDate}
          workoutId={currentWorkoutId}
          allExercises={allExercises}
          onBack={goBack}
          canFinish={activeRole === 'coach'}
        />
      )}
      
      {currentView === 'edit' && selectedClient && (
        <EditTrainingMode
          client={selectedClient}
          day={selectedDay}
          date={selectedDate}
          workoutId={currentWorkoutId}
          allExercises={allExercises}
          categories={exerciseCategories}
          initialStartTime={initialStartTime}
          initialDuration={initialDuration}
          onBack={goBack}
        />
      )}

      {currentView === 'settings' && (
        <ExerciseSettings
          categories={exerciseCategories}
          onUpdateCategories={updateExerciseCategories}
          onBack={goBack}
          activeRole={activeRole}
          onRoleChange={handleRoleChange}
        />
        )}

      {activeRole === 'coach' &&
        ['calendar', 'clients', 'settings'].includes(currentView) && (
          <div className="fixed bottom-0 left-0 right-0 border-t bg-white shadow pb-[env(safe-area-inset-bottom)]">
            <Tabs
              value={currentView}
              onValueChange={(val) => setCurrentView(val as View)}
            >
              <TabsList className="grid w-full grid-cols-3 h-14">
                <TabsTrigger
                  value="calendar"
                  className="flex flex-col items-center justify-center gap-1 h-full text-sm"
                >
                  <CalendarIcon className="w-6 h-6" />
                  <span className="text-sm">Календарь</span>
                </TabsTrigger>
                <TabsTrigger
                  value="clients"
                  className="flex flex-col items-center justify-center gap-1 h-full text-sm"
                >
                  <Users className="w-6 h-6" />
                  <span className="text-sm">Клиенты</span>
                </TabsTrigger>
                <TabsTrigger
                  value="settings"
                  className="flex flex-col items-center justify-center gap-1 h-full text-sm"
                >
                  <Settings className="w-6 h-6" />
                  <span className="text-sm">Настройки</span>
                </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      )}

      {activeRole === 'client' &&
        ['client-schedule', 'client-progress', 'client-settings'].includes(currentView) && (
          <div className="fixed bottom-0 left-0 right-0 border-t bg-white shadow pb-[env(safe-area-inset-bottom)]">
            <Tabs value={currentView} onValueChange={(val) => setCurrentView(val as View)}>
              <TabsList className="grid w-full grid-cols-3 h-14">
                <TabsTrigger
                  value="client-schedule"
                  className="flex flex-col items-center justify-center gap-1 h-full text-sm"
                >
                  <CalendarIcon className="w-6 h-6" />
                  <span className="text-sm">Расписание</span>
                </TabsTrigger>
                <TabsTrigger
                  value="client-progress"
                  className="flex flex-col items-center justify-center gap-1 h-full text-sm"
                >
                  <TrendingUp className="w-6 h-6" />
                  <span className="text-sm">Прогресс</span>
                </TabsTrigger>
                <TabsTrigger
                  value="client-settings"
                  className="flex flex-col items-center justify-center gap-1 h-full text-sm"
                >
                  <Settings className="w-6 h-6" />
                  <span className="text-sm">Настройки</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        )}
    </div>
  )
}
