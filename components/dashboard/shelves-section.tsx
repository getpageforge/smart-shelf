'use client'

import { useMemo, useState } from 'react'
import { Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { ShelfWithLatest } from '@/lib/types'
import { CATEGORY_META } from '@/lib/shelf-utils'
import { ShelfCard } from './shelf-card'
import { CreateShelfModal } from './create-shelf-modal'

function ShelvesSection({
  shelves,
  onRefresh,
}: {
  shelves: ShelfWithLatest[]
  onRefresh: () => void
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return shelves
    return shelves.filter((s) => {
      const categoryLabel = CATEGORY_META[s.category]?.label.toLowerCase() ?? ''
      return (
        s.name.toLowerCase().includes(q) ||
        s.token.toLowerCase().includes(q) ||
        categoryLabel.includes(q)
      )
    })
  }, [shelves, query])

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col">
          <h2 className="text-lg font-semibold">Central das Cestas</h2>
          <p className="text-sm text-muted-foreground">
            {shelves.length} Smart Shelves cadastradas
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:flex-none">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filtrar por nome, token, categoria..."
              className="pl-9 sm:w-64"
            />
          </div>
          <Button onClick={() => setOpen(true)}>
            <Plus className="size-4" />
            Nova cesta
          </Button>
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {filtered.map((shelf) => (
            <ShelfCard key={shelf.id} shelf={shelf} onRefresh={onRefresh} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border py-16 text-center">
          <p className="text-sm font-medium">Nenhuma cesta encontrada</p>
          <p className="text-sm text-muted-foreground">
            Ajuste a pesquisa ou cadastre uma nova Smart Shelf.
          </p>
        </div>
      )}

      <CreateShelfModal
        open={open}
        onClose={() => setOpen(false)}
        onCreated={onRefresh}
      />
    </section>
  )
}

export { ShelvesSection }
