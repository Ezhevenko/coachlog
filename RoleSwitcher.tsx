import { Tabs, TabsList, TabsTrigger } from './ui/tabs'

export type Role = 'coach' | 'client'

interface RoleSwitcherProps {
  role: Role
  onChange: (role: Role) => void
}

export function RoleSwitcher({ role, onChange }: RoleSwitcherProps) {
  return (
    <Tabs value={role} onValueChange={(val: string) => onChange(val as Role)} className="mb-4">
      <TabsList>
        <TabsTrigger value="coach">Тренер</TabsTrigger>
        <TabsTrigger value="client">Клиент</TabsTrigger>
      </TabsList>
    </Tabs>
  )
}
