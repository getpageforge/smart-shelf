'use client'

import { useMemo, useState } from 'react'
import { AlertsList } from '@/components/shared/alerts-list'
import { ShelfFilter, type FilterOption } from '@/components/shared/shelf-filter'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAlerts } from '@/lib/hooks/use-shelves'
import { useShelves } from '@/lib/hooks/use-shelves'
import { resolveAlert } from '@/lib/actions'

function AlertsView() {
  const { alerts, refresh: refreshAlerts, loading: loadingAlerts } = useAlerts()
  const { shelves, loading: loadingShelves } = useShelves()
  const [shelf, setShelf] = useState('all')
  const [priority, setPriority] = useState('all')

  const shelfOptions: FilterOption[] = [
    { value: 'all', label: 'Todas as cestas' },
    ...shelves.map((s) => ({ value: s.token, label: s.name })),
  ]

  const priorityOptions: FilterOption[] = [
    { value: 'all', label: 'Todas' },
    { value: 'high', label: 'Alta' },
    { value: 'medium', label: 'Média' },
    { value: 'low', label: 'Baixa' },
  ]

  const filtered = useMemo(() => {
    return alerts.filter((a) => {
      if (shelf !== 'all' && a.shelf_token !== shelf) return false
      if (priority !== 'all' && a.level !== priority) return false
      return true
    })
  }, [alerts, shelf, priority])

  const active = filtered.filter((a) => !a.resolved)

  async function handleResolve(id: string) {
    await resolveAlert(id)
    refreshAlerts()
  }

  if (loadingAlerts || loadingShelves) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <ShelfFilter options={shelfOptions} value={shelf} onChange={setShelf} />
        <ShelfFilter options={priorityOptions} value={priority} onChange={setPriority} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">
            {active.length} alerta{active.length === 1 ? '' : 's'} ativo{active.length === 1 ? '' : 's'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AlertsList alerts={filtered} showShelf onResolve={handleResolve} />
        </CardContent>
      </Card>
    </div>
  )
}

export { AlertsView }
