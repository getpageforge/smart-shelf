'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ArrowRight, Pencil, Sun, Thermometer, Trash2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { StatusDot } from '@/components/shared/status-dot'
import { CATEGORY_META, relativeTime } from '@/lib/shelf-utils'
import type { ShelfWithLatest } from '@/lib/types'
import { EditShelfModal } from './edit-shelf-modal'
import { DeleteShelfModal } from './delete-shelf-modal'

function ShelfCard({
  shelf,
  onRefresh,
}: {
  shelf: ShelfWithLatest
  onRefresh: () => void
}) {
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const offline = shelf.status === 'offline'

  return (
    <>
      <Card className="flex flex-col gap-4 p-5 transition-colors hover:border-primary/40">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <h3 className="font-semibold leading-tight">{shelf.name}</h3>
            <span className="font-mono text-xs text-muted-foreground">
              {shelf.token}
            </span>
          </div>
          <StatusDot status={shelf.status} />
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline">
            {CATEGORY_META[shelf.category]?.label ?? shelf.category}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col items-center gap-1 rounded-lg bg-secondary/50 py-2.5">
            <Thermometer className="size-4 text-muted-foreground" />
            <span className="text-sm font-semibold">
              {offline || shelf.temperature == null
                ? '--'
                : `${Number(shelf.temperature).toFixed(1)}°`}
            </span>
            <span className="text-[10px] text-muted-foreground">temp.</span>
          </div>
          <div className="flex flex-col items-center gap-1 rounded-lg bg-secondary/50 py-2.5">
            <Sun className="size-4 text-muted-foreground" />
            <span className="text-sm font-semibold">
              {offline || shelf.light == null
                ? '--'
                : `${Number(shelf.light)}`}
            </span>
            <span className="text-[10px] text-muted-foreground">luz (lux)</span>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-border pt-3">
          <span className="text-xs text-muted-foreground">
            {shelf.last_reading_at
              ? `Atualizado ${relativeTime(shelf.last_reading_at)}`
              : 'Sem leituras'}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setEditOpen(true)}
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              aria-label="Editar"
            >
              <Pencil className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setDeleteOpen(true)}
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/15 hover:text-destructive"
              aria-label="Excluir"
            >
              <Trash2 className="size-3.5" />
            </button>
            <Link
              href={`/shelves/${encodeURIComponent(shelf.token)}`}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Abrir
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </Card>

      <EditShelfModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        shelfName={shelf.name}
        shelfToken={shelf.token}
        shelfCategory={shelf.category}
        onUpdated={onRefresh}
      />

      <DeleteShelfModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        shelfName={shelf.name}
        shelfToken={shelf.token}
        onDeleted={onRefresh}
      />
    </>
  )
}

export { ShelfCard }
