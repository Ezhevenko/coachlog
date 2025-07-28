import { useState, useEffect } from 'react'
import { useApiFetch } from './lib/api'
import { useAuthToken } from './lib/auth-context'
import { ClientList } from './ClientList'
import { TrainingProgram } from './TrainingProgram'
import { TrainingMode } from './TrainingMode'
import { EditTrainingMode } from './EditTrainingMode'
import { ExerciseSettings } from './ExerciseSettings'
import { ClientDashboard } from './ClientDashboard'
import CoachCalendar from './CoachCalendar'
import { RoleSwitcher, Role } from './RoleSwitcher'

export interface Exercise {
  id: string
  name: string
  category: string
  currentWeight: number
  history: { date: string; weight: number }[]
}

export interface ExerciseCategory {
  id: string
  name: string
  exercises: Omit<Exercise, 'currentWeight' | 'history'>[]
}

export interface Client {
  id: string
  name: string
}

type View = 'calendar' | 'clients' | 'program' | 'training' | 'edit' | 'settings' | 'client'

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
  const apiFetch = useApiFetch()
  const token = useAuthToken()

  useEffect(() => {
    if (!token) return
    const load = async () => {
      const res = await apiFetch('/api/coach/clients')
      if (!res.ok) return
      const data = await res.json()
      setClients(data.map((c: any) => ({ id: c.id, name: c.full_name })))
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
  const allExercises: Omit<Exercise, 'currentWeight' | 'history'>[] =
    exerciseCategories.flatMap(category => category.exercises)

  const handleRoleChange = (role: Role) => {
    setActiveRole(role)
    if (role === 'client') {
      setSelectedClient(clients[0] || null)
      setCurrentView('client')
    } else {
      setCurrentView('calendar')
      setSelectedClient(null)
    }
  }

  const addClient = async (name: string) => {
    const res = await apiFetch('/api/coach/clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ telegram_id: Date.now().toString(), full_name: name })
    })
    if (!res.ok) return
    const data = await res.json()
    const newClient: Client = { id: data.id, name: data.full_name }
    setClients(prev => [...prev, newClient])
  }

  const deleteClient = async (clientId: string) => {
    const res = await apiFetch(`/api/coach/clients/${clientId}`, { method: 'DELETE' })
    if (res.ok) {
      setClients(prev => prev.filter(c => c.id !== clientId))
    }
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
    setCurrentView('edit')
  }

  const openExerciseSettings = () => {
    setCurrentView('settings')
  }

  const goBack = () => {
    if (currentView === 'training' || currentView === 'edit') {
      setCurrentWorkoutId(undefined)
      setCurrentView(activeRole === 'coach' ? 'calendar' : 'client')
    } else if (currentView === 'program') {
      setCurrentView('clients')
      setSelectedClient(null)
    } else if (currentView === 'settings') {
      setCurrentView('calendar')
    }
  }

  const updateExerciseCategories = (categories: ExerciseCategory[]) => {
    setExerciseCategories(categories)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-indigo-50">
      <div className="p-4">
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
          onOpenSettings={openExerciseSettings}
        />
      )}

      {activeRole === 'coach' && currentView === 'program' && selectedClient && (
        <TrainingProgram
          client={selectedClient}
          onBack={goBack}
          onOpenTraining={openTrainingMode}
          onOpenEdit={openEditMode}
        />
      )}

      {activeRole === 'client' && currentView === 'client' && selectedClient && (
        <ClientDashboard
          client={selectedClient}
          allExercises={allExercises}
          onBack={() => setCurrentView('client')}
          onOpenTraining={openTrainingMode}
        />
      )}

      {currentView === 'training' && selectedClient && (
        <TrainingMode
          client={selectedClient}
          day={selectedDay}
          date={selectedDate}
          workoutId={currentWorkoutId}
          allExercises={allExercises}
          onBack={goBack}
        />
      )}
      
      {currentView === 'edit' && selectedClient && (
        <EditTrainingMode
          client={selectedClient}
          day={selectedDay}
          date={selectedDate}
          workoutId={currentWorkoutId}
          allExercises={allExercises}
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
        />
      )}
    </div>
  )
}
