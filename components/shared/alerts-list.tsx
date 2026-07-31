'use client'

import { useState } from 'react'
import {
  Check,
  AlertTriangle,
  Info,
  AlertOctagon,
  type LucideIcon,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ALERT_LEVEL_LABEL, relativeTime } from '@/lib/shelf-utils'
import type { ShelfAlert, AlertLevel } from '@/lib/types'
import { cn } from '@/lib/utils'

const iconByLevel: Record<AlertLevel, LucideIcon> = {
  high: AlertOctagon,
  medium: AlertTriangle,
  low: Info,
}

const priorityVariant: Record<AlertLevel, 'danger' | 'warning' | 'info'> = {
  high: 'danger',
  medium: 'warning',
  low: 'info',
}

const toneByPriority: Record<AlertLevel, string> = {
  high: 'bg-destructive/15 text-destructive',
  medium: 'bg-warning/15 text-warning',
  low: 'bg-info/15 text-info',
}

function AlertsList({
  alerts,
  showShelf = false,
  onResolve,
}: {
  alerts: ShelfAlert[]
  showShelf?: boolean
  onResolve?: (id: string) => Promise<void>
}) {
  const [resolvingId, setResolvingId] = useState<string | null>(null)

  if (alerts.length === 0) {
    return (
      <div className="flex flex-col items-center gap-1 rounded-xl border border-dashed border-border py-10 text-center">
        <Check className="size-6 text-success" />
        <p className="text-sm font-medium">Nenhum alerta ativo</p>
        <p className="text-sm text-muted-foreground">Tudo funcionando normalmente.</p>
      </div>
    )
  }

  return (
    <ul className="flex flex-col gap-2.5">
      {alerts.map((alert) => {
        const Icon = iconByLevel[alert.level]
        const isResolved = alert.resolved
        const isResolving = resolvingId === alert.id

        return (
          <li
            key={alert.id}
            className={cn(
              'flex items-start gap-3 rounded-xl border border-border bg-card p-4 transition-opacity',
              isResolved && 'opacity-50',
            )}
          >
            <span
              className={cn(
                'flex size-9 shrink-0 items-center justify-center rounded-lg',
                toneByPriority[alert.level],
              )}
            >
              <Icon className="size-4.5" />
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium">
                  {showShelf ? `Alerta - ${alert.shelf_token}` : 'Alerta'}
                </span>
                <Badge variant={priorityVariant[alert.level]}>
                  {ALERT_LEVEL_LABEL[alert.level]}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{alert.message}</p>
              <span className="text-xs text-muted-foreground">
                {relativeTime(alert.created_at)}
              </span>
            </div>
            {onResolve && (
              <Button
                variant="outline"
                size="sm"
                disabled={isResolved || isResolving}
                onClick={async () => {
                  setResolvingId(alert.id)
                  await onResolve(alert.id)
                  setResolvingId(null)
                }}
              >
                <Check className="size-3.5" />
                {isResolved ? 'Resolvido' : 'Resolver'}
              </Button>
            )}
          </li>
        )
      })}
    </ul>
  )
}

export { AlertsList }
