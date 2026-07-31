import type { LucideIcon } from 'lucide-react'
import { TrendingDown, TrendingUp } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

type Tone = 'primary' | 'success' | 'warning' | 'danger' | 'info'

const toneMap: Record<Tone, string> = {
  primary: 'bg-primary/15 text-primary',
  success: 'bg-success/15 text-success',
  warning: 'bg-warning/15 text-warning',
  danger: 'bg-destructive/15 text-destructive',
  info: 'bg-info/15 text-info',
}

interface StatCardProps {
  label: string
  value: string
  hint?: string
  icon: LucideIcon
  tone?: Tone
  trend?: { value: string; direction: 'up' | 'down' }
}

function StatCard({ label, value, hint, icon: Icon, tone = 'primary', trend }: StatCardProps) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1">
          <span className="text-xs font-medium text-muted-foreground">{label}</span>
          <span className="text-2xl font-semibold tracking-tight">{value}</span>
          {hint ? (
            <span className="truncate text-xs text-muted-foreground">{hint}</span>
          ) : null}
        </div>
        <span
          className={cn(
            'flex size-10 shrink-0 items-center justify-center rounded-lg',
            toneMap[tone],
          )}
        >
          <Icon className="size-5" />
        </span>
      </div>
      {trend ? (
        <div className="mt-3 flex items-center gap-1 text-xs">
          {trend.direction === 'up' ? (
            <TrendingUp className="size-3.5 text-success" />
          ) : (
            <TrendingDown className="size-3.5 text-destructive" />
          )}
          <span
            className={cn(
              'font-medium',
              trend.direction === 'up' ? 'text-success' : 'text-destructive',
            )}
          >
            {trend.value}
          </span>
          <span className="text-muted-foreground">vs. ontem</span>
        </div>
      ) : null}
    </Card>
  )
}

export { StatCard }
