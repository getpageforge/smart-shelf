'use client'

import { cn } from '@/lib/utils'

export interface FilterOption {
  value: string
  label: string
}

function ShelfFilter({
  options,
  value,
  onChange,
}: {
  options: FilterOption[]
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const active = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              'rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors',
              active
                ? 'border-primary bg-primary/15 text-primary'
                : 'border-border bg-card text-muted-foreground hover:text-foreground',
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

export { ShelfFilter }
