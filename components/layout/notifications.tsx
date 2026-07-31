'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Bell, AlertOctagon, AlertTriangle, Info } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { ALERT_LEVEL_LABEL, relativeTime } from '@/lib/shelf-utils'
import type { AlertLevel } from '@/lib/types'
import { cn } from '@/lib/utils'
import { useAlerts } from '@/lib/hooks/use-shelves'

const iconByLevel: Record<AlertLevel, LucideIcon> = {
  high: AlertOctagon,
  medium: AlertTriangle,
  low: Info,
}

function Notifications() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  
  const { alerts } = useAlerts()
  const active = alerts.filter((a) => !a.resolved)

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Notificações"
        aria-expanded={open}
        className="relative flex size-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:text-foreground"
      >
        <Bell className="size-4.5" />
        {active.length > 0 ? (
          <span className="absolute -right-1 -top-1 flex size-4.5 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
            {active.length}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 top-12 z-50 w-80 overflow-hidden rounded-xl border border-border bg-popover shadow-2xl animate-in fade-in slide-in-from-top-1">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <span className="text-sm font-semibold">Notificações</span>
            <span className="text-xs text-muted-foreground">
              {active.length} ativas
            </span>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {active.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Nenhuma notificação no momento.
              </div>
            ) : (
              active.map((alert) => {
                const Icon = iconByLevel[alert.level]
                return (
                  <div
                    key={alert.id}
                    className="flex gap-3 border-b border-border px-4 py-3 last:border-0"
                  >
                    <span
                      className={cn(
                        'mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg',
                        alert.level === 'high'
                          ? 'bg-destructive/15 text-destructive'
                          : alert.level === 'medium'
                            ? 'bg-warning/15 text-warning'
                            : 'bg-info/15 text-info',
                      )}
                    >
                      <Icon className="size-4" />
                    </span>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-medium leading-tight">
                        {ALERT_LEVEL_LABEL[alert.level]}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {alert.shelf_token} · {relativeTime(alert.created_at)}
                      </span>
                    </div>
                  </div>
                )
              })
            )}
          </div>
          <Link
            href="/alertas"
            onClick={() => setOpen(false)}
            className="block border-t border-border px-4 py-3 text-center text-sm font-medium text-primary transition-colors hover:bg-secondary/50"
          >
            Ver todos os alertas
          </Link>
        </div>
      ) : null}
    </div>
  )
}

export { Notifications }
