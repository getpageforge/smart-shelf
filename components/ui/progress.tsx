import { cn } from '@/lib/utils'

type ProgressTone = 'green' | 'yellow' | 'red' | 'primary' | 'info'

const toneMap: Record<ProgressTone, string> = {
  green: 'bg-success',
  yellow: 'bg-warning',
  red: 'bg-destructive',
  primary: 'bg-primary',
  info: 'bg-info',
}

interface ProgressProps extends React.ComponentProps<'div'> {
  value: number
  tone?: ProgressTone
}

function Progress({ value, tone = 'primary', className, ...props }: ProgressProps) {
  const clamped = Math.max(0, Math.min(100, value))
  return (
    <div
      data-slot="progress"
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn(
        'h-2 w-full overflow-hidden rounded-full bg-secondary',
        className,
      )}
      {...props}
    >
      <div
        className={cn('h-full rounded-full transition-all duration-500', toneMap[tone])}
        style={{ width: `${clamped}%` }}
      />
    </div>
  )
}

export { Progress }
