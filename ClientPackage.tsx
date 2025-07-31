import { useEffect, useState } from 'react'
import { useApiFetch } from './lib/api'
import { Card } from './ui/card'
import { Input } from './ui/input'
import { Button } from './ui/button'
import type { Client } from './App'

interface HistoryItem { id: string; delta: number; created_at: string }

interface PackageInfo { count: number; history: HistoryItem[] }

export function ClientPackage({
  client,
  onCountChange,
  editable = true
}: {
  client: Client
  onCountChange?: (n: number) => void
  editable?: boolean
}) {
  const apiFetch = useApiFetch()
  const [info, setInfo] = useState<PackageInfo>({ count: 0, history: [] })
  const [delta, setDelta] = useState('')

  const load = async () => {
    const res = await apiFetch(`/api/coach/packages/${client.id}`)
    if (res.ok) {
      const data = await res.json()
      setInfo(data)
      onCountChange?.(data.count)
    }
  }

  useEffect(() => { load() }, [client.id])

  const handleSave = async () => {
    const n = parseInt(delta, 10)
    if (!n) return
    const res = await apiFetch(`/api/coach/packages/${client.id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ delta: n })
    })
    if (res.ok) {
      setDelta('')
      await load()
    }
  }

  return (
    <Card className="p-4 mb-4 bg-white shadow-sm border-0">
      <h3 className="font-medium text-gray-800 mb-2">Пакет</h3>
      <div className="flex items-baseline gap-2 mb-4">
        <span className="text-2xl font-bold">{info.count}</span>
        <span className="text-gray-600">занятий</span>
      </div>
      {editable && (
        <div className="flex gap-2 mb-4">
          <Input
            type="number"
            value={delta}
            onChange={e => setDelta(e.target.value)}
            className="flex-1 border-gray-200 focus:border-blue-300"
          />
          <Button onClick={handleSave} disabled={!delta}>Сохранить</Button>
        </div>
      )}
      {info.history.length > 0 && (
        <div className="text-sm max-h-32 overflow-y-auto space-y-1">
          {info.history.map(h => (
            <div key={h.id} className="flex justify-between">
              <span>{h.created_at.slice(0,10)}</span>
              <span className={h.delta > 0 ? 'text-green-600' : 'text-red-600'}>
                {h.delta > 0 ? `+${h.delta}` : h.delta}
              </span>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
