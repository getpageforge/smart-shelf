import { Apple, ShoppingCart, Snowflake, SprayCan } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import {
  OCCUPANCY_LABEL,
  occupancyLevel,
  occupancyPercent,
} from '@/lib/shelf-utils'
import type { Compartment, CompartmentKey, OccupancyLevel } from '@/lib/types'

const iconByKey: Record<CompartmentKey, LucideIcon> = {
  limpeza: SprayCan,
  mercearia: ShoppingCart,
  hortifruti: Apple,
  frios: Snowflake,
}

const badgeVariant: Record<OccupancyLevel, 'success' | 'warning' | 'danger'> = {
  green: 'success',
  yellow: 'warning',
  red: 'danger',
}

function CompartmentCard({ compartment }: { compartment: Compartment }) {
  const percent = occupancyPercent(compartment.current, compartment.capacity)
  const level = occupancyLevel(percent)
  const Icon = iconByKey[compartment.key]

  return (
    <Card className="flex flex-col gap-4 p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
            <Icon className="size-4.5" />
          </span>
          <span className="text-sm font-semibold">{compartment.name}</span>
        </div>
        <Badge variant={badgeVariant[level]}>{OCCUPANCY_LABEL[level]}</Badge>
      </div>

      <div className="flex items-end justify-between">
        <span className="text-2xl font-semibold tracking-tight">
          {compartment.current}
          <span className="text-base font-normal text-muted-foreground">
            {' '}
            / {compartment.capacity}
          </span>
        </span>
        <span className="text-sm font-medium text-muted-foreground">{percent}%</span>
      </div>

      <Progress value={percent} tone={level} />
    </Card>
  )
}

export { CompartmentCard }
