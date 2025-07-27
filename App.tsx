import { useState } from 'react'
import { ClientList } from './ClientList'
import { TrainingProgram } from './TrainingProgram'
import { TrainingMode } from './TrainingMode'
import { EditTrainingMode } from './EditTrainingMode'
import { ExerciseSettings } from './ExerciseSettings'
import { ClientDashboard } from './ClientDashboard'
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

export interface DayTraining {
  day: string
  exercises: Exercise[]
  startTime?: string // время начала в формате "HH:MM"
  duration?: number  // длительность в минутах
}

export interface Client {
  id: string
  name: string
  program: DayTraining[]
}

type View = 'clients' | 'program' | 'training' | 'edit' | 'settings' | 'client'

export default function App() {
  const [clients, setClients] = useState<Client[]>([])
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [selectedDay, setSelectedDay] = useState<string>('')
  const [currentView, setCurrentView] = useState<View>('clients')
  const [activeRole, setActiveRole] = useState<Role>('coach')

  // Система управления категориями упражнений
  const [exerciseCategories, setExerciseCategories] = useState<ExerciseCategory[]>([
    {
      id: 'arms',
      name: 'Руки',
      exercises: [
        { id: 'bicep-curl', name: 'Сгибания на бицепс', category: 'arms' },
        { id: 'tricep-ext', name: 'Разгибания на трицепс', category: 'arms' },
        { id: 'hammer-curl', name: 'Молотки', category: 'arms' },
        { id: 'dips', name: 'Отжимания на брусьях', category: 'arms' },
      ]
    },
    {
      id: 'legs',
      name: 'Ноги',
      exercises: [
        { id: 'squats', name: 'Приседания', category: 'legs' },
        { id: 'deadlift', name: 'Становая тяга', category: 'legs' },
        { id: 'leg-press', name: 'Жим ногами', category: 'legs' },
        { id: 'calf-raises', name: 'Подъемы на носки', category: 'legs' },
      ]
    },
    {
      id: 'back',
      name: 'Спина',
      exercises: [
        { id: 'pull-ups', name: 'Подтягивания', category: 'back' },
        { id: 'lat-pulldown', name: 'Тяга верхнего блока', category: 'back' },
        { id: 'rows', name: 'Тяга штанги к поясу', category: 'back' },
        { id: 'hyperext', name: 'Гиперэкстензии', category: 'back' },
      ]
    },
    {
      id: 'shoulders',
      name: 'Плечи',
      exercises: [
        { id: 'shoulder-press', name: 'Жим штанги стоя', category: 'shoulders' },
        { id: 'lateral-raise', name: 'Махи в стороны', category: 'shoulders' },
        { id: 'rear-delt', name: 'Обратные махи', category: 'shoulders' },
        { id: 'front-raise', name: 'Махи перед собой', category: 'shoulders' },
      ]
    },
    {
      id: 'chest',
      name: 'Грудь',
      exercises: [
        { id: 'bench-press', name: 'Жим лежа', category: 'chest' },
        { id: 'incline-press', name: 'Жим под углом', category: 'chest' },
        { id: 'flyes', name: 'Разведения', category: 'chest' },
        { id: 'pushups', name: 'Отжимания', category: 'chest' },
      ]
    }
  ])

  // Получаем плоский список всех упражнений из категорий
  const allExercises: Omit<Exercise, 'currentWeight' | 'history'>[] =
    exerciseCategories.flatMap(category => category.exercises)

  const handleRoleChange = (role: Role) => {
    setActiveRole(role)
    if (role === 'client') {
      setSelectedClient(clients[0] || null)
      setCurrentView('client')
    } else {
      setCurrentView('clients')
      setSelectedClient(null)
    }
  }

  const addClient = (name: string) => {
    const newClient: Client = {
      id: Date.now().toString(),
      name,
      program: [
        'Понедельник', 'Вторник', 'Среда', 'Четверг', 
        'Пятница', 'Суббота', 'Воскресенье'
      ].map(day => ({ day, exercises: [] }))
    }
    setClients([...clients, newClient])
  }

  const deleteClient = (clientId: string) => {
    setClients(clients.filter(c => c.id !== clientId))
  }

  const updateClientProgram = (clientId: string, dayIndex: number, exercises: Exercise[], startTime?: string, duration?: number) => {
    setClients(prev => prev.map(client => 
      client.id === clientId 
        ? {
            ...client,
            program: client.program.map((day, index) => 
              index === dayIndex ? { ...day, exercises, startTime, duration } : day
            )
          }
        : client
    ))
  }

  const updateExerciseWeight = (exerciseId: string, newWeight: number) => {
    if (!selectedClient) return
    
    const dayIndex = selectedClient.program.findIndex(d => d.day === selectedDay)
    if (dayIndex === -1) return

    const updatedExercises = selectedClient.program[dayIndex].exercises.map(exercise => 
      exercise.id === exerciseId 
        ? {
            ...exercise,
            currentWeight: newWeight,
            history: [...exercise.history, { date: new Date().toISOString().split('T')[0], weight: newWeight }]
          }
        : exercise
    )

    const currentDayProgram = selectedClient.program[dayIndex]
    updateClientProgram(selectedClient.id, dayIndex, updatedExercises, currentDayProgram.startTime, currentDayProgram.duration)
    
    // Обновляем локальное состояние selectedClient
    setSelectedClient(prev => prev ? {
      ...prev,
      program: prev.program.map((day, index) => 
        index === dayIndex ? { ...day, exercises: updatedExercises } : day
      )
    } : null)
  }

  const openClientProgram = (client: Client) => {
    setSelectedClient(client)
    setCurrentView('program')
  }

  const openTrainingMode = (day: string) => {
    setSelectedDay(day)
    setCurrentView('training')
  }

  const openEditMode = (day: string) => {
    setSelectedDay(day)
    setCurrentView('edit')
  }

  const openExerciseSettings = () => {
    setCurrentView('settings')
  }

  const goBack = () => {
    if (currentView === 'training') {
      setCurrentView(activeRole === 'coach' ? 'program' : 'client')
    } else if (currentView === 'edit') {
      setCurrentView('program')
    } else if (currentView === 'program') {
      setCurrentView('clients')
      setSelectedClient(null)
    } else if (currentView === 'settings') {
      setCurrentView('clients')
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
          onBack={() => setCurrentView('client')}
          onOpenTraining={openTrainingMode}
        />
      )}

      {currentView === 'training' && selectedClient && (
        <TrainingMode
          client={selectedClient}
          day={selectedDay}
          onBack={goBack}
          onUpdateWeight={updateExerciseWeight}
        />
      )}
      
      {currentView === 'edit' && selectedClient && (
        <EditTrainingMode
          client={selectedClient}
          day={selectedDay}
          allExercises={allExercises}
          onBack={goBack}
          onUpdateProgram={(exercises, startTime, duration) => {
            const dayIndex = selectedClient.program.findIndex(d => d.day === selectedDay)
            updateClientProgram(selectedClient.id, dayIndex, exercises, startTime, duration)
          }}
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
