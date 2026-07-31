import { cn } from '@/lib/utils'
import { STATUS_LABEL } from '@/lib/shelf-utils'
import type { ShelfStatus } from '@/lib/types'

const toneMap: Record<ShelfStatus, string> = {
  online: 'bg-success',
  offline: 'bg-destructive',
  reconnecting: 'bg-warning',
}

function StatusDot({
  status,
  showLabel = true,
  className,
}: {
  status: ShelfStatus
  showLabel?: boolean
  className?: string
}) {
  return (
    <span className={cn('inline-flex items-center gap-1.5', className)}>
      <span className="relative flex size-2">
        {status === 'online' ? (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
        ) : null}
        <span className={cn('relative inline-flex size-2 rounded-full', toneMap[status])} />
      </span>
      {showLabel ? (
        <span className="text-xs font-medium text-muted-foreground">
          {STATUS_LABEL[status]}
        </span>
      ) : null}
    </span>
  )
}

export { StatusDot }
