import { Switch } from './ui/switch'

export type Role = 'coach' | 'client'

interface RoleSwitcherProps {
  role: Role
  onChange: (role: Role) => void
}

export function RoleSwitcher({ role, onChange }: RoleSwitcherProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm">Клиент</span>
      <Switch
        checked={role === 'coach'}
        onCheckedChange={(checked) => onChange(checked ? 'coach' : 'client')}
      />
      <span className="text-sm">Тренер</span>
    </div>
  )
}
