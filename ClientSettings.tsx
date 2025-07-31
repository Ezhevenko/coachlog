import { useApiFetch } from './lib/api'
import { Role, RoleSwitcher } from './RoleSwitcher'

interface ClientSettingsProps {
  role: Role
  onRoleChange: (role: Role) => void
}

export function ClientSettings({ role, onRoleChange }: ClientSettingsProps) {
  const apiFetch = useApiFetch()

  const handleSwitch = async (r: Role) => {
    onRoleChange(r)
    await apiFetch('/api/auth/set-role', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: r })
    })
  }

  return (
    <div className="max-w-md mx-auto p-4 pt-6 pb-6 min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50">
      <div className="flex justify-center">
        <RoleSwitcher role={role} onChange={handleSwitch} />
      </div>
    </div>
  )
}
