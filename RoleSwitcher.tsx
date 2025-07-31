"use client";

// Simple checkbox-based toggle instead of Radix Switch

export type Role = 'coach' | 'client'

interface RoleSwitcherProps {
  role: Role
  onChange: (role: Role) => void
}

export function RoleSwitcher({ role, onChange }: RoleSwitcherProps) {
  return (
    <label className="flex items-center gap-2">
      <span className="text-sm">Клиент</span>
      <input
        type="checkbox"
        checked={role === 'coach'}
        onChange={(e) => onChange(e.target.checked ? 'coach' : 'client')}
        className="h-4 w-4"
      />
      <span className="text-sm">Тренер</span>
    </label>
  )
}
