import { Radar, Sun, Thermometer } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { relativeTime } from '@/lib/shelf-utils'
import type { Sensor, SensorKind } from '@/lib/types'
import { cn } from '@/lib/utils'

const iconByKind: Record<SensorKind, LucideIcon> = {
  ultrasonic: Radar,
  temperature: Thermometer,
  luminosity: Sun,
}

function SensorCard({ sensor }: { sensor: Sensor }) {
  const Icon = iconByKind[sensor.kind]

  return (
    <Card className="flex flex-col gap-4 p-5">
      <div className="flex items-center justify-between">
        <span className="flex size-9 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
          <Icon className="size-4.5" />
        </span>
        <span
          className={cn(
            'inline-flex items-center gap-1.5 text-xs font-medium',
            sensor.online ? 'text-success' : 'text-destructive',
          )}
        >
          <span
            className={cn(
              'size-2 rounded-full',
              sensor.online ? 'bg-success' : 'bg-destructive',
            )}
          />
          {sensor.online ? 'Online' : 'Offline'}
        </span>
      </div>

      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-medium">{sensor.name}</span>
        <span className="font-mono text-xs text-muted-foreground">{sensor.model}</span>
      </div>

      <div className="flex items-end justify-between border-t border-border pt-3">
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground">Leitura atual</span>
          <span className="text-xl font-semibold">
            {sensor.online ? `${sensor.value}${sensor.unit}` : '--'}
          </span>
        </div>
        <span className="text-xs text-muted-foreground">
          {relativeTime(sensor.updatedAt)}
        </span>
      </div>
    </Card>
  )
}

export { SensorCard }
