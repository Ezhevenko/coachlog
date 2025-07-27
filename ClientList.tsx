import { useState, useRef } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Card } from './ui/card'
import { Plus, Trash2, User, Settings } from 'lucide-react@0.487.0'
import type { Client } from './App'

interface ClientListProps {
  clients: Client[]
  onAddClient: (name: string) => void
  onDeleteClient: (clientId: string) => void
  onSelectClient: (client: Client) => void
  onOpenSettings: () => void
}

export function ClientList({ clients, onAddClient, onDeleteClient, onSelectClient, onOpenSettings }: ClientListProps) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [newClientName, setNewClientName] = useState('')
  const [selectedForDelete, setSelectedForDelete] = useState<string | null>(null)
  
  const pressTimer = useRef<NodeJS.Timeout | null>(null)

  const handleAddClient = () => {
    if (newClientName.trim()) {
      onAddClient(newClientName.trim())
      setNewClientName('')
      setShowAddForm(false)
    }
  }

  const handleMouseDown = (clientId: string) => {
    pressTimer.current = setTimeout(() => {
      setSelectedForDelete(clientId)
    }, 800) // 800ms для длительного нажатия
  }

  const handleMouseUp = () => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current)
      pressTimer.current = null
    }
  }

  const handleTouchStart = (clientId: string) => {
    pressTimer.current = setTimeout(() => {
      setSelectedForDelete(clientId)
    }, 800)
  }

  const handleTouchEnd = () => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current)
      pressTimer.current = null
    }
  }

  const handleClientClick = (client: Client) => {
    if (selectedForDelete) {
      setSelectedForDelete(null)
      return
    }
    onSelectClient(client)
  }

  const confirmDelete = (clientId: string) => {
    onDeleteClient(clientId)
    setSelectedForDelete(null)
  }

  return (
    <div className="max-w-md mx-auto p-4 pt-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-800">Мои клиенты</h1>
        <div className="flex gap-2">
          <Button
            onClick={onOpenSettings}
            variant="outline"
            className="rounded-full w-12 h-12 border-blue-200 text-blue-600 hover:bg-blue-50"
          >
            <Settings className="w-5 h-5" />
          </Button>
          <Button
            onClick={() => setShowAddForm(true)}
            className="rounded-full w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 shadow-lg"
          >
            <Plus className="w-6 h-6" />
          </Button>
        </div>
      </div>

      {showAddForm && (
        <Card className="p-4 mb-4 bg-white shadow-md border-0">
          <div className="space-y-3">
            <Input
              placeholder="Имя клиента"
              value={newClientName}
              onChange={(e) => setNewClientName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddClient()}
              autoFocus
              className="border-gray-200 focus:border-blue-300"
            />
            <div className="flex gap-2">
              <Button
                onClick={handleAddClient}
                className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
                disabled={!newClientName.trim()}
              >
                Добавить
              </Button>
              <Button
                onClick={() => {
                  setShowAddForm(false)
                  setNewClientName('')
                }}
                variant="outline"
                className="flex-1"
              >
                Отмена
              </Button>
            </div>
          </div>
        </Card>
      )}

      <div className="space-y-3">
        {clients.map((client) => (
          <Card
            key={client.id}
            className={`p-4 cursor-pointer transition-all duration-200 border-0 shadow-md ${
              selectedForDelete === client.id
                ? 'bg-red-50 border-l-4 border-l-red-500'
                : 'bg-white hover:bg-gray-50 hover:shadow-lg hover:-translate-y-0.5'
            }`}
            onClick={() => handleClientClick(client)}
            onMouseDown={() => handleMouseDown(client.id)}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={() => handleTouchStart(client.id)}
            onTouchEnd={handleTouchEnd}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-800">{client.name}</h3>
                </div>
              </div>
              
              {selectedForDelete === client.id && (
                <Button
                  onClick={(e) => {
                    e.stopPropagation()
                    confirmDelete(client.id)
                  }}
                  variant="destructive"
                  size="sm"
                  className="bg-red-500 hover:bg-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>

      {clients.length === 0 && !showAddForm && (
        <div className="text-center py-12">
          <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">Нет клиентов</h3>
          <p className="text-gray-500 mb-6">Добавьте первого клиента, чтобы начать</p>
          <Button
            onClick={() => setShowAddForm(true)}
            className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            Добавить клиента
          </Button>
        </div>
      )}
    </div>
  )
}
