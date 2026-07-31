'use client'

import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { HistoryTable } from '@/components/shared/history-table'
import { ShelfFilter, type FilterOption } from '@/components/shared/shelf-filter'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useHistory, useShelves } from '@/lib/hooks/use-shelves'

function HistoryView() {
  const { entries, loading: loadingHistory } = useHistory()
  const { shelves, loading: loadingShelves } = useShelves()
  
  const [shelf, setShelf] = useState('all')
  const [type, setType] = useState('all')
  const [query, setQuery] = useState('')

  const shelfOptions: FilterOption[] = [
    { value: 'all', label: 'Todas as cestas' },
    ...shelves.map((s) => ({ value: s.token, label: s.name })),
  ]

  const typeOptions: FilterOption[] = [
    { value: 'all', label: 'Todos os tipos' },
    { value: 'event', label: 'Eventos' },
    { value: 'sensor', label: 'Sensores' },
  ]

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase()
    return entries.filter((entry) => {
      if (shelf !== 'all' && entry.shelf_token !== shelf) return false
      if (type !== 'all' && entry.type !== type) return false
      if (term) {
        const eventType = entry.event_type ?? ''
        const haystack = `${entry.shelf_token} ${entry.shelf_name} ${eventType}`.toLowerCase()
        if (!haystack.includes(term)) return false
      }
      return true
    })
  }, [entries, shelf, type, query])

  if (loadingHistory || loadingShelves) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por token, nome, ou evento..."
            aria-label="Buscar no histórico"
            className="h-9 pl-9 sm:max-w-sm"
          />
        </div>
        <ShelfFilter options={shelfOptions} value={shelf} onChange={setShelf} />
        <ShelfFilter options={typeOptions} value={type} onChange={setType} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">
            {filtered.length} registro{filtered.length === 1 ? '' : 's'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <HistoryTable entries={filtered} detailed />
        </CardContent>
      </Card>
    </div>
  )
}

export { HistoryView }
