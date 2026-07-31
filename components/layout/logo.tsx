import { PackageCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

function Logo({ collapsed }: { collapsed?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
        <PackageCheck className="size-5" />
      </div>
      <div className={cn('flex flex-col leading-tight', collapsed && 'hidden')}>
        <span className="text-sm font-semibold text-foreground">Smart Shelf</span>
        <span className="text-xs text-muted-foreground">Painel de gestão</span>
      </div>
    </div>
  )
}

export { Logo }
