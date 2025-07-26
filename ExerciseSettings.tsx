import { useState } from 'react'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Separator } from './ui/separator'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { ArrowLeft, Plus, X, Edit3, Dumbbell, FolderPlus, Trash2 } from 'lucide-react'
import type { ExerciseCategory } from '../App'

interface ExerciseSettingsProps {
  categories: ExerciseCategory[]
  onUpdateCategories: (categories: ExerciseCategory[]) => void
  onBack: () => void
}

export function ExerciseSettings({ categories, onUpdateCategories, onBack }: ExerciseSettingsProps) {
  const [showAddCategory, setShowAddCategory] = useState(false)
  const [showAddExercise, setShowAddExercise] = useState<string | null>(null)
  const [editingCategory, setEditingCategory] = useState<string | null>(null)
  const [editingExercise, setEditingExercise] = useState<{ categoryId: string; exerciseId: string } | null>(null)

  const [newCategoryName, setNewCategoryName] = useState('')
  const [newExerciseName, setNewExerciseName] = useState('')
  const [editCategoryName, setEditCategoryName] = useState('')
  const [editExerciseName, setEditExerciseName] = useState('')

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return

    const newCategory: ExerciseCategory = {
      id: Date.now().toString(),
      name: newCategoryName,
      exercises: []
    }

    onUpdateCategories([...categories, newCategory])
    setNewCategoryName('')
    setShowAddCategory(false)
  }

  const handleDeleteCategory = (categoryId: string) => {
    onUpdateCategories(categories.filter(cat => cat.id !== categoryId))
  }

  const handleEditCategory = (categoryId: string) => {
    if (!editCategoryName.trim()) return

    onUpdateCategories(categories.map(cat => 
      cat.id === categoryId 
        ? { ...cat, name: editCategoryName }
        : cat
    ))
    setEditingCategory(null)
    setEditCategoryName('')
  }

  const handleAddExercise = (categoryId: string) => {
    if (!newExerciseName.trim()) return

    const newExercise = {
      id: Date.now().toString(),
      name: newExerciseName,
      category: categoryId
    }

    onUpdateCategories(categories.map(cat => 
      cat.id === categoryId 
        ? { ...cat, exercises: [...cat.exercises, newExercise] }
        : cat
    ))
    setNewExerciseName('')
    setShowAddExercise(null)
  }

  const handleDeleteExercise = (categoryId: string, exerciseId: string) => {
    onUpdateCategories(categories.map(cat => 
      cat.id === categoryId 
        ? { ...cat, exercises: cat.exercises.filter(ex => ex.id !== exerciseId) }
        : cat
    ))
  }

  const handleEditExercise = () => {
    if (!editingExercise || !editExerciseName.trim()) return

    onUpdateCategories(categories.map(cat => 
      cat.id === editingExercise.categoryId 
        ? { 
            ...cat, 
            exercises: cat.exercises.map(ex => 
              ex.id === editingExercise.exerciseId 
                ? { ...ex, name: editExerciseName }
                : ex
            )
          }
        : cat
    ))
    setEditingExercise(null)
    setEditExerciseName('')
  }

  const startEditCategory = (category: ExerciseCategory) => {
    setEditingCategory(category.id)
    setEditCategoryName(category.name)
  }

  const startEditExercise = (categoryId: string, exercise: any) => {
    setEditingExercise({ categoryId, exerciseId: exercise.id })
    setEditExerciseName(exercise.name)
  }

  return (
    <div className="max-w-md mx-auto p-4 pt-6 pb-6 min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Button
            onClick={onBack}
            variant="ghost"
            size="sm"
            className="p-2 hover:bg-blue-100"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-lg font-bold text-gray-800">Упражнения</h1>
            <p className="text-sm text-blue-600">Управление категориями и упражнениями</p>
          </div>
        </div>
      </div>

      {/* Add Category Button */}
      <Card className="p-4 mb-6 bg-white shadow-sm border-0">
        {!showAddCategory ? (
          <Button
            onClick={() => setShowAddCategory(true)}
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
          >
            <FolderPlus className="w-4 h-4 mr-2" />
            Добавить категорию
          </Button>
        ) : (
          <div className="space-y-3">
            <div>
              <Label htmlFor="newCategory" className="text-sm text-gray-700 mb-1">
                Название категории
              </Label>
              <Input
                id="newCategory"
                placeholder="Например: Кардио"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                autoFocus
                className="border-gray-200 focus:border-blue-300"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleAddCategory}
                disabled={!newCategoryName.trim()}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
              >
                Добавить
              </Button>
              <Button
                onClick={() => {
                  setShowAddCategory(false)
                  setNewCategoryName('')
                }}
                variant="outline"
                className="border-gray-200"
              >
                Отмена
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Categories List */}
      <div className="space-y-4">
        {categories.map((category) => (
          <Card key={category.id} className="bg-white shadow-sm border-0 overflow-hidden">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value={category.id} className="border-0">
                <div className="px-4 py-3">
                  <div className="flex items-center justify-between w-full">
                    <AccordionTrigger className="flex-1 py-0 hover:no-underline hover:bg-blue-50 rounded-l-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center">
                          <Dumbbell className="w-4 h-4 text-white" />
                        </div>
                        <div className="text-left">
                          {editingCategory === category.id ? (
                            <div onClick={(e) => e.stopPropagation()}>
                              <Input
                                value={editCategoryName}
                                onChange={(e) => setEditCategoryName(e.target.value)}
                                onKeyDown={(e) => {
                                  e.stopPropagation()
                                  if (e.key === 'Enter') handleEditCategory(category.id)
                                  if (e.key === 'Escape') {
                                    setEditingCategory(null)
                                    setEditCategoryName('')
                                  }
                                }}
                                onBlur={() => handleEditCategory(category.id)}
                                className="h-6 text-sm font-medium p-1 border-blue-300"
                                autoFocus
                              />
                            </div>
                          ) : (
                            <>
                              <h3 className="font-medium text-gray-800">{category.name}</h3>
                              <p className="text-sm text-gray-500">
                                {category.exercises.length} упражнений
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                    </AccordionTrigger>
                    <div className="flex items-center gap-1 ml-2">
                      <div
                        onClick={(e) => {
                          e.stopPropagation()
                          startEditCategory(category)
                        }}
                        className="p-1 hover:bg-blue-100 rounded cursor-pointer transition-colors"
                      >
                        <Edit3 className="w-3 h-3 text-blue-600" />
                      </div>
                      <div
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteCategory(category.id)
                        }}
                        className="p-1 hover:bg-red-100 rounded cursor-pointer transition-colors"
                      >
                        <Trash2 className="w-3 h-3 text-red-600" />
                      </div>
                    </div>
                  </div>
                </div>

                <AccordionContent className="px-4 pb-4">
                  {/* Add Exercise Button */}
                  <div className="mb-4">
                    {showAddExercise !== category.id ? (
                      <Button
                        onClick={() => setShowAddExercise(category.id)}
                        variant="outline"
                        size="sm"
                        className="w-full border-blue-200 text-blue-600 hover:bg-blue-50"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Добавить упражнение
                      </Button>
                    ) : (
                      <div className="space-y-2">
                        <Input
                          placeholder="Название упражнения"
                          value={newExerciseName}
                          onChange={(e) => setNewExerciseName(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleAddExercise(category.id)}
                          autoFocus
                          className="border-gray-200 focus:border-blue-300"
                        />
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleAddExercise(category.id)}
                            disabled={!newExerciseName.trim()}
                            size="sm"
                            className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                          >
                            Добавить
                          </Button>
                          <Button
                            onClick={() => {
                              setShowAddExercise(null)
                              setNewExerciseName('')
                            }}
                            variant="outline"
                            size="sm"
                            className="border-gray-200"
                          >
                            Отмена
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Exercises List */}
                  <div className="space-y-2">
                    {category.exercises.map((exercise) => (
                      <div 
                        key={exercise.id}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="text-xs text-gray-600">•</span>
                          </div>
                          {editingExercise?.exerciseId === exercise.id ? (
                            <Input
                              value={editExerciseName}
                              onChange={(e) => setEditExerciseName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleEditExercise()
                                if (e.key === 'Escape') {
                                  setEditingExercise(null)
                                  setEditExerciseName('')
                                }
                              }}
                              onBlur={handleEditExercise}
                              className="h-6 text-sm p-1 border-blue-300"
                              autoFocus
                            />
                          ) : (
                            <span className="text-sm text-gray-700">{exercise.name}</span>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <div
                            onClick={() => startEditExercise(category.id, exercise)}
                            className="p-1 hover:bg-blue-100 rounded cursor-pointer transition-colors"
                          >
                            <Edit3 className="w-3 h-3 text-blue-600" />
                          </div>
                          <div
                            onClick={() => handleDeleteExercise(category.id, exercise.id)}
                            className="p-1 hover:bg-red-100 rounded cursor-pointer transition-colors"
                          >
                            <X className="w-3 h-3 text-red-600" />
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {category.exercises.length === 0 && (
                      <p className="text-sm text-gray-500 text-center py-4">
                        Упражнения не добавлены
                      </p>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </Card>
        ))}

        {categories.length === 0 && (
          <Card className="p-8 bg-gradient-to-br from-blue-50 to-indigo-50 border-0">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <FolderPlus className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Создайте первую категорию</h3>
              <p className="text-sm text-gray-600">
                Добавьте категории упражнений для удобной организации тренировок
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
